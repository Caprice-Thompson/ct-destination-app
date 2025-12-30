# EC2 Instance Connect Endpoint (FREE alternative to bastion)
# Allows secure tunneling to private RDS without running an EC2 instance

data "aws_ssm_parameter" "public_subnet_id_eice" {
  name = "/main/infrastructure/PUBLIC_SUBNET_ID"
}

resource "aws_ec2_instance_connect_endpoint" "main" {
  subnet_id          = data.aws_ssm_parameter.public_subnet_id_eice.value
  security_group_ids = [aws_security_group.eice.id]

  tags = {
    Name        = "${var.project_name}-${var.environment}-eice"
    Environment = var.environment
    Purpose     = "Free secure access to RDS"
  }
}

# Security Group for EICE
resource "aws_security_group" "eice" {
  name        = "${var.project_name}-${var.environment}-eice-sg"
  description = "Security group for EC2 Instance Connect Endpoint"
  vpc_id      = data.aws_vpc.existing.id

  # Outbound to RDS
  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.existing.cidr_block]
    description = "PostgreSQL to RDS"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-eice-sg"
    Environment = var.environment
  }
}

# Allow EICE to connect to RDS
resource "aws_security_group_rule" "rds_allow_eice" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eice.id
  security_group_id        = data.aws_ssm_parameter.rds_security_group_id.value
  description              = "Allow EICE to connect to RDS"
}

# SSM Parameter for EICE ID
resource "aws_ssm_parameter" "eice_id" {
  name      = "/main/infrastructure/EICE_ID"
  type      = "String"
  value     = aws_ec2_instance_connect_endpoint.main.id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-eice-id"
    Environment = var.environment
  }
}
