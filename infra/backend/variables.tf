variable "aws_region" {
  description = "AWS region for backend resources"
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "destination-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

