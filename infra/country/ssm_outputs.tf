# SSM Parameters for outputs
# These can be used by other services or for reference

resource "aws_ssm_parameter" "api_gateway_url" {
  name      = "/${var.project_name}/${var.environment}/api-gateway-url"
  type      = "String"
  value     = aws_api_gateway_stage.main.invoke_url
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-url"
    Environment = var.environment
  }
}