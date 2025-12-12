# Outputs
output "country_information_api_url" {
  description = "API Gateway endpoint URL"
  value       = "${aws_api_gateway_stage.main.invoke_url}/country-information"
}

output "list_country_information_lambda_arn" {
  description = "ARN of the List Country Information Lambda function"
  value       = aws_lambda_function.list_country_information.arn
}

output "list_country_information_lambda_name" {
  description = "Name of the List Country Information Lambda function"
  value       = aws_lambda_function.list_country_information.function_name
}