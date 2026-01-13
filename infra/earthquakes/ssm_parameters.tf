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

