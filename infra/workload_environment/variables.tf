# Variables for Workload Environment

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "main"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "destination-app"
}

variable "service_name" {
  description = "Service domain name"
  type        = string
  default     = "ct"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database name shared across all microservices"
  type        = string
  default     = "destination_app"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "17"
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "db_backup_retention_days" {
  description = "Number of days to retain automated backups (1-35). Free tier allows max 1 day."
  type        = number
  default     = 1
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

variable "earthquakes_api_url" {
  description = "External earthquakes data API URL"
  type        = string
}

variable "rest_countries_api_url" {
  description = "REST Countries API URL"
  type        = string
}

variable "rest_countries_authorization" {
  description = "Bearer token for REST Countries API"
  type        = string
  sensitive   = true
}

variable "population_api_url" {
  description = "External city population API URL"
  type        = string
  default     = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records"
}

variable "db_username" {
  description = "RDS username"
  type = string
  default = "destination"
}