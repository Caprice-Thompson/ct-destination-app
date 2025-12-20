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

# SSM Parameter for Private Route Table ID
# This should be created manually or by your base infrastructure:
# aws ssm put-parameter --name "/county/main/infrastructure/private_route_table_id" --value "rtb-xxxxx" --type String
data "aws_ssm_parameter" "private_route_table_id" {
  name = "/county/main/infrastructure/private_route_table_id"
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

  # Allow SSH from bastion (optional, for troubleshooting)
  # Uncomment if you need SSH access
  # ingress {
  #   description     = "SSH from Bastion"
  #   from_port       = 22
  #   to_port         = 22
  #   protocol        = "tcp"
  #   security_groups = [aws_security_group.bastion.id]
  # }

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

# NAT Instance (t3.micro is Free Tier eligible for 750 hours/month)
resource "aws_instance" "nat_instance" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.micro" # Free Tier eligible
  subnet_id                   = data.aws_ssm_parameter.public_subnet_id.value
  vpc_security_group_ids      = [aws_security_group.nat_instance.id]
  iam_instance_profile        = aws_iam_instance_profile.nat_instance.name
  source_dest_check           = false # CRITICAL: Must be disabled for NAT to work
  associate_public_ip_address = true

  # User data script to configure NAT functionality
  user_data = <<-EOF
    #!/bin/bash
    set -e
    
    # Update system
    dnf update -y
    
    # Enable IP forwarding permanently
    echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
    sysctl -p
    
    # Install iptables-services for persistent rules
    dnf install -y iptables-services
    systemctl enable iptables
    systemctl start iptables
    
    # Get the primary network interface (usually ens5 for modern instances)
    PRIMARY_INTERFACE=$(ip -o -4 route show to default | awk '{print $5}')
    
    # Configure NAT using iptables masquerade
    iptables -t nat -A POSTROUTING -o $PRIMARY_INTERFACE -j MASQUERADE
    
    # Allow forwarding from private subnets
    iptables -A FORWARD -i $PRIMARY_INTERFACE -o $PRIMARY_INTERFACE -m state --state RELATED,ESTABLISHED -j ACCEPT
    iptables -A FORWARD -i $PRIMARY_INTERFACE -o $PRIMARY_INTERFACE -j ACCEPT
    
    # Save iptables rules
    service iptables save
    
    # Enable iptables service to start on boot
    systemctl enable iptables
    
    # Log completion
    echo "NAT instance configuration completed at $(date)" >> /var/log/nat-setup.log
  EOF

  # Enable detailed monitoring (free for 750 hours/month in Free Tier)
  monitoring = true

  # Root volume configuration (Free Tier includes 30 GB EBS)
  root_block_device {
    volume_size           = 8 # Keep it small to stay in Free Tier
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "${var.project_name}-${var.environment}-nat-instance-root"
      Environment = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-instance"
    Environment = var.environment
    Purpose     = "NAT"
    CostSaving  = "Free-Tier-Alternative"
  }

  # Ensure instance is recreated if user_data changes
  user_data_replace_on_change = true
}

# Update Private Route Table to use NAT Instance
# This routes all internet-bound traffic from private subnets through the NAT instance
resource "aws_route" "private_to_nat" {
  route_table_id         = data.aws_ssm_parameter.private_route_table_id.value
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
