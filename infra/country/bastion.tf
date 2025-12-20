# Bastion Host for Database Access - connect prod db locally

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# IAM Role for Bastion (Session Manager access)
resource "aws_iam_role" "bastion" {
  name = "${var.project_name}-${var.environment}-bastion-role"

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
    Name        = "${var.project_name}-${var.environment}-bastion-role"
    Environment = var.environment
  }
}

# Attach SSM policy for Session Manager
resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance Profile
resource "aws_iam_instance_profile" "bastion" {
  name = "${var.project_name}-${var.environment}-bastion-profile"
  role = aws_iam_role.bastion.name

  tags = {
    Name        = "${var.project_name}-${var.environment}-bastion-profile"
    Environment = var.environment
  }
}

# Security Group for Bastion
resource "aws_security_group" "bastion" {
  name        = "${var.project_name}-${var.environment}-bastion-sg"
  description = "Security group for bastion host (Session Manager only)"
  vpc_id      = data.aws_vpc.existing.id

  # Outbound to RDS
  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.existing.cidr_block]
    description = "PostgreSQL to RDS"
  }

  # Outbound to SSM endpoints
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS for Session Manager"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-bastion-sg"
    Environment = var.environment
  }
}

# Allow bastion to connect to RDS
resource "aws_security_group_rule" "rds_allow_bastion" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = data.aws_ssm_parameter.rds_security_group_id.value
  description              = "Allow bastion to connect to RDS"
}

# EC2 Instance - Bastion Host
resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro" # Free tier eligible
  subnet_id              = tolist(data.aws_subnets.existing.ids)[0]
  vpc_security_group_ids = [aws_security_group.bastion.id]
  iam_instance_profile   = aws_iam_instance_profile.bastion.name

  # Enable detailed monitoring (optional, free for first instance)
  monitoring = false

  # Root volume (free tier: 30GB)
  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  # No user_data needed - Session Manager port forwarding works without any software installation
  # The bastion acts purely as a network tunnel for DBeaver to connect through

  tags = {
    Name        = "${var.project_name}-${var.environment}-bastion"
    Environment = var.environment
    Purpose     = "Database access via Session Manager"
  }

  lifecycle {
    ignore_changes = [ami] # Don't recreate if AMI updates
  }
}

# Output bastion instance ID
output "bastion_instance_id" {
  description = "Bastion host instance ID for Session Manager"
  value       = aws_instance.bastion.id
}

output "bastion_connection_command" {
  description = "Command to connect via Session Manager"
  value       = "aws ssm start-session --target ${aws_instance.bastion.id}"
}