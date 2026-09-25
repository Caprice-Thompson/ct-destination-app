output "api_gateway_url" {
  description = "Base URL of the API Gateway stage"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "rds_endpoint" {
  description = "RDS instance endpoint hostname"
  value       = aws_db_instance.main.address
}

output "rds_db_secret_arn" {
  description = "Secrets Manager ARN for the RDS master user password"
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
}
