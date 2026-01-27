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

resource "aws_ssm_parameter" "historical_earthquakes_dynamodb_table" {
  name  = "/${var.service_name}/db/historical_earthquakes_dynamodb_table"
  type  = "String"
  value = aws_dynamodb_table.historical_earthquakes.name
}

resource "aws_ssm_parameter" "most_recent_eqs_lambda" {
  name      = "/${var.service_name}/main/MOST_RECENT_EQS_LAMBDA"
  type      = "String"
  value     = aws_lambda_function.most_recent_eqs.function_name
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-most-recent-eqs-lambda-param"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_ssm_parameter" "eq_monthly_stats_lambda" {
  name      = "/${var.service_name}/main/MONTHLY_STATS_LAMBDA"
  type      = "String"
  value     = aws_lambda_function.eq_monthly_stats.function_name
  overwrite = true

  tags = {
    Name    = "${var.project_name}-${var.service_name}-eq-monthly-stats-lambda-param"
    Service = var.service_name
  }
}

resource "aws_ssm_parameter" "earthquakes_api_url" {
  name      = "/earthquakes/api/EARTHQUAKES_API_URL"
  type      = "String"
  value     = var.earthquakes_api_url
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-earthquakes-api-url-param"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_ssm_parameter" "rest_countries_api_url" {
  name      = "/earthquakes/api/REST_COUNTRIES_API_URL"
  type      = "String"
  value     = var.rest_countries_api_url
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-rest-countries-api-url-param"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

