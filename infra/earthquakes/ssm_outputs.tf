resource "aws_ssm_parameter" "api_gateway_url" {
  name      = "/${var.service_name}/main/API_GATEWAY_URL"
  type      = "String"
  value     = aws_api_gateway_stage.main.invoke_url
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-earthquakes-api-url"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

