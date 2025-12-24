# SSM Parameters for sharing infrastructure details with services

# VPC Parameters
resource "aws_ssm_parameter" "vpc_id" {
  name      = "/main/infrastructure/vpc_id"
  type      = "String"
  value     = aws_vpc.main.id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc-id"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "public_subnet_id" {
  name      = "/main/infrastructure/public_subnet_id"
  type      = "String"
  value     = aws_subnet.public[0].id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-subnet-id"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "private_subnet_id" {
  name      = "/main/infrastructure/private_subnet_id"
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
  name      = "/main/db/rds_endpoint"
  type      = "String"
  value     = aws_db_instance.main.endpoint
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-endpoint"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "rds_security_group_id" {
  name      = "/main/infrastructure/rds_security_group_id"
  type      = "String"
  value     = aws_security_group.rds.id
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg-id"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "db_username" {
  name      = "/main/db/username"
  type      = "String"
  value     = var.db_username
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-username"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "db_password" {
  name      = "/main/db/password"
  type      = "SecureString"
  value     = var.db_password
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-password"
    Environment = var.environment
  }
}

# API URLs (these can be set manually or by other services)
resource "aws_ssm_parameter" "rest_countries_api_url" {
  name      = "/main/api/rest_countries_url"
  type      = "String"
  value     = "https://restcountries.com/v3.1"
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-rest-countries-api"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "population_api_url" {
  name      = "/main/api/population_url"
  type      = "String"
  value     = "https://countriesnow.space/api/v0.1"
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-population-api"
    Environment = var.environment
  }
}

