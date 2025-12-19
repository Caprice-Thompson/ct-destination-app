terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Remote backend for state management
  # Workspaces will create separate state files automatically
  backend "s3" {
    bucket         = "destination-app-production-terraform-state"
    key            = "country/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "destination-app-production-terraform-locks"
    encrypt        = true
    workspace_key_prefix = "workspaces"
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Retrieve VPC and Security Group IDs from SSM Parameter Store
data "aws_ssm_parameter" "vpc_id" {
  name = "/county/main/infrastructure/vpc_id"
}

data "aws_ssm_parameter" "rds_security_group_id" {
  name = "/county/main/infrastructure/rds_security_group_id"
}

# Use existing VPC where RDS is deployed
data "aws_vpc" "existing" {
  id = data.aws_ssm_parameter.vpc_id.value
}

# Use existing subnets where RDS is deployed
data "aws_subnets" "existing" {
  filter {
    name   = "vpc-id"
    values = [data.aws_ssm_parameter.vpc_id.value]
  }
}

# Security Group for Lambda (in existing VPC)
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-${var.environment}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = data.aws_vpc.existing.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-lambda-sg"
    Environment = var.environment
  }
}

# Allow Lambda to connect to RDS
resource "aws_security_group_rule" "rds_allow_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.lambda.id
  security_group_id        = data.aws_ssm_parameter.rds_security_group_id.value
  description              = "Allow Lambda to connect to RDS"
}


# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_country_information.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*/*"
}

