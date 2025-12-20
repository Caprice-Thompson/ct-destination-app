# internet access for Lambda functions in private subnets

# Get the latest Amazon Linux 2023 AMI for eu-west-2 (x86_64 for t3.micro)
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# SSM Parameter for Public Subnet ID (for NAT instance placement)
# This should be created manually or by your base infrastructure:
# aws ssm put-parameter --name "/county/main/infrastructure/public_subnet_id" --value "subnet-xxxxx" --type String
data "aws_ssm_parameter" "public_subnet_id" {
  name = "/county/main/infrastructure/public_subnet_id"
}

# SSM Parameter for Private Subnet ID (to associate with new route table)
# This should be created manually or by your base infrastructure:
# aws ssm put-parameter --name "/county/main/infrastructure/private_subnet_id" --value "subnet-xxxxx" --type String
# Note: This data source is defined in lambda.tf to avoid duplication

# Create a new route table for private subnets that will use NAT
resource "aws_route_table" "private_nat" {
  vpc_id = data.aws_vpc.existing.id

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-nat-rt"
    Environment = var.environment
    Purpose     = "Private subnets routing through NAT instance"
  }
}

# Associate the private subnet with the new route table
resource "aws_route_table_association" "private_nat" {
  subnet_id      = data.aws_ssm_parameter.private_subnet_id.value
  route_table_id = aws_route_table.private_nat.id
}

# Security Group for NAT Instance
resource "aws_security_group" "nat_instance" {
  name        = "${var.project_name}-${var.environment}-nat-instance-sg"
  description = "Security group for NAT instance - allows traffic from private subnets"
  vpc_id      = data.aws_vpc.existing.id

  # Allow inbound HTTPS from Lambda security group (more secure than CIDR)
  ingress {
    description     = "HTTPS from Lambda"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  # Allow inbound HTTP from Lambda security group
  ingress {
    description     = "HTTP from Lambda"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  # Allow all outbound traffic to internet
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance-sg"
    Environment = var.environment
  }
}

# Elastic IP for NAT Instance (provides static public IP)
resource "aws_eip" "nat_instance" {
  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance-eip"
    Environment = var.environment
  }

  # EIP depends on the internet gateway attachment
  # This ensures proper cleanup order
  depends_on = [aws_instance.nat_instance]
}

# Associate EIP with NAT Instance
resource "aws_eip_association" "nat_instance" {
  instance_id   = aws_instance.nat_instance.id
  allocation_id = aws_eip.nat_instance.id
}

# IAM Role for NAT Instance (optional, for SSM Session Manager access)
resource "aws_iam_role" "nat_instance" {
  name = "${var.project_name}-${var.environment}-nat-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance-role"
    Environment = var.environment
  }
}

# Attach SSM policy for Session Manager access (no SSH key needed)
resource "aws_iam_role_policy_attachment" "nat_instance_ssm" {
  role       = aws_iam_role.nat_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "nat_instance" {
  name = "${var.project_name}-${var.environment}-nat-instance-profile"
  role = aws_iam_role.nat_instance.name

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance-profile"
    Environment = var.environment
  }
}

# NAT Instance Configuration
resource "aws_instance" "nat_instance" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.micro"
  subnet_id                   = data.aws_ssm_parameter.public_subnet_id.value
  vpc_security_group_ids      = [aws_security_group.nat_instance.id]
  iam_instance_profile        = aws_iam_instance_profile.nat_instance.name
  source_dest_check           = false # MANDATORY
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # 1. Enable IP Forwarding in the kernel
    echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/95-nat.conf
    sysctl -p /etc/sysctl.d/95-nat.conf

    # 2. Install iptables-services for rule persistence
    dnf install -y iptables-services
    systemctl enable iptables
    systemctl start iptables

    # 3. Detect the Nitro interface (usually ens5)
    PRIMARY_IFACE=$(ip -o -4 route show to default | awk '{print $5}')

    # 4. Flush and Set NAT Rules
    iptables -t nat -F
    iptables -t nat -A POSTROUTING -o $PRIMARY_IFACE -j MASQUERADE
    
    # Allow forwarding for established connections and new internal requests
    iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
    iptables -A FORWARD -i $PRIMARY_IFACE -j ACCEPT 

    # 5. Save rules so they persist across reboots
    service iptables save
  EOF

  user_data_replace_on_change = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance"
    Environment = var.environment
    Purpose     = "NAT"
    CostSaving  = "Free-Tier-Alternative"
  }
}

# Update Private Route Table to use NAT Instance
# This routes all internet-bound traffic from private subnets through the NAT instance
resource "aws_route" "private_to_nat" {
  route_table_id         = aws_route_table.private_nat.id
  destination_cidr_block = "0.0.0.0/0"
  network_interface_id   = aws_instance.nat_instance.primary_network_interface_id

  # Ensure NAT instance is ready before creating route
  depends_on = [aws_instance.nat_instance]
}

# CloudWatch Alarms for NAT Instance Health Monitoring (Optional but recommended)
resource "aws_cloudwatch_metric_alarm" "nat_instance_status_check" {
  alarm_name          = "${var.project_name}-${var.environment}-nat-instance-status-check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "Triggers when NAT instance status check fails"
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.nat_instance.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance-alarm"
    Environment = var.environment
  }
}

# Output important information
output "nat_instance_id" {
  description = "ID of the NAT instance"
  value       = aws_instance.nat_instance.id
}

output "nat_instance_public_ip" {
  description = "Public IP of the NAT instance"
  value       = aws_eip.nat_instance.public_ip
}

output "nat_instance_private_ip" {
  description = "Private IP of the NAT instance"
  value       = aws_instance.nat_instance.private_ip
}

output "nat_route_table_id" {
  description = "ID of the route table created for private subnet NAT routing"
  value       = aws_route_table.private_nat.id
}
