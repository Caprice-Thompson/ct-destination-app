# SSM Parameters for sharing infrastructure details with services

# VPC Parameters
resource "aws_ssm_parameter" "vpc_id" {
  name      = "/main/infrastructure/VPC_ID"
  type      = "String"
  value     = aws_vpc.main.id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc-id"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "public_subnet_id" {
  name      = "/main/infrastructure/PUBLIC_SUBNET_ID"
  type      = "String"
  value     = aws_subnet.public[0].id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-subnet-id"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "private_subnet_id" {
  name      = "/main/infrastructure/PRIVATE_SUBNET_ID"
  type      = "String"
  value     = aws_subnet.private[0].id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-subnet-id"
    Environment = var.environment
  }
}

# RDS Parameters
resource "aws_ssm_parameter" "rds_endpoint" {
  name      = "/country/db/RDS_ENDPOINT"
  type      = "String"
  value     = aws_db_instance.main.endpoint
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-endpoint"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "rds_security_group_id" {
  name      = "/main/infrastructure/RDS_SECURITY_GROUP_ID"
  type      = "String"
  value     = aws_security_group.rds.id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg-id"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "db_username" {
  name      = "/main/db/USERNAME"
  type      = "String"
  value     = var.db_username
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-username"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "db_password" {
  name      = "/main/db/PASSWORD"
  type      = "SecureString"
  value     = var.db_password
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-password"
    Environment = var.environment
  }
}

