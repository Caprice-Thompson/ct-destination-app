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

  backend "s3" {
    bucket               = "destination-app-production-terraform-state"
    key                  = "earthquakes/terraform.tfstate"
    region               = "eu-west-2"
    dynamodb_table       = "destination-app-production-terraform-locks"
    encrypt              = true
    workspace_key_prefix = "workspaces"
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ssm_parameter" "earthquakes_api_url" {
  name = "/earthquakes/api/EARTHQUAKES_API_URL"
  depends_on = [aws_ssm_parameter.earthquakes_api_url]
}

data "aws_ssm_parameter" "rest_countries_api_url" {
  name = "/earthquakes/api/REST_COUNTRIES_API_URL"
  depends_on = [aws_ssm_parameter.rest_countries_api_url]
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.most_recent_eqs.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*/*"
}

