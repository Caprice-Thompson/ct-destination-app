terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote backend for state management
  backend "s3" {
    bucket               = "destination-app-production-terraform-state"
    key                  = "shared/terraform.tfstate"
    region               = "eu-west-2"
    dynamodb_table       = "destination-app-production-terraform-locks"
    encrypt              = true
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

