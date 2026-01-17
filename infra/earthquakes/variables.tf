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
  default     = "earthquake-service"
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
  default     = "nodejs20.x"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 3
}

variable "earthquakes_api_url" {
  description = "Earthquakes API URL"
  type        = string
}

variable "rest_countries_api_url" {
  description = "REST Countries API URL"
  type        = string
}

