# Variables

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "destination-app"
}

variable "service_name" {
  description = "Service domain name"
  type        = string
  default     = "country"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "/county/main/db/db_username"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  default     = "/county/main/db/db_password"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "county-db"
}

variable "node_env" {
  description = "Node environment"
  type        = string
  default     = "production"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 128
}

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "nodejs22.x"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 3
}

# VPC and Security Group IDs are retrieved from SSM Parameter Store
# No hardcoded defaults - must exist in SSM