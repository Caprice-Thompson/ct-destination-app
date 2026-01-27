resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-${var.environment}-earthquakes-api"
  description = "API Gateway for Earthquakes Service"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${var.project_name}-main-earthquakes-api"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_api_gateway_resource" "earthquakes" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "earthquakes"
}

resource "aws_api_gateway_method" "get_earthquakes" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.earthquakes.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.earthquakes.id
  http_method             = aws_api_gateway_method.get_earthquakes.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.most_recent_eqs.invoke_arn
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.earthquakes.id,
      aws_api_gateway_method.get_earthquakes.id,
      aws_api_gateway_integration.lambda_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.lambda_integration
  ]
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment

  tags = {
    Name        = "${var.project_name}-${var.environment}-earthquakes-stage"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

