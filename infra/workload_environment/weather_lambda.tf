resource "aws_dynamodb_table" "weather_data" {
  name         = "${var.environment}-weather-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "countryCode"
  range_key    = "month"

  attribute {
    name = "countryCode"
    type = "S"
  }

  attribute {
    name = "month"
    type = "S"
  }

  tags = {
    Name        = "${var.environment}-weather-data"
    Environment = var.environment
    Service     = "weather"
  }
}

data "archive_file" "list_weather_summary" {
  type        = "zip"
  source_dir  = "${path.module}/../../weather/dist"
  output_path = "${path.module}/.terraform/lambda-packages/list-weather-summary.zip"
}

resource "aws_iam_role" "list_weather_summary_lambda_role" {
  name = "${var.project_name}-${var.environment}-list-weather-summary-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-list-weather-summary-role"
    Environment = var.environment
    Service     = "weather"
  }
}

resource "aws_cloudwatch_log_group" "list_weather_summary_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-list-weather-summary"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.environment}-list-weather-summary-logs"
    Environment = var.environment
    Service     = "weather"
  }
}

resource "aws_iam_role_policy" "list_weather_summary_lambda_policy" {
  name = "${var.environment}-list-weather-summary-policy"
  role = aws_iam_role.list_weather_summary_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.list_weather_summary_lambda_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.weather_data.arn,
          "${aws_dynamodb_table.weather_data.arn}/index/*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "list_weather_summary" {
  filename         = data.archive_file.list_weather_summary.output_path
  function_name    = "${var.environment}-list-weather-summary"
  role             = aws_iam_role.list_weather_summary_lambda_role.arn
  handler          = "list-weather-summary.handler"
  source_code_hash = data.archive_file.list_weather_summary.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      DYNAMODB_WEATHER_TABLE = aws_dynamodb_table.weather_data.name
      SERVICE_NAME           = var.service_name
      NODE_ENV               = var.node_env
      LOG_LEVEL              = "info"
    }
  }

  tags = {
    Name        = "${var.environment}-list-weather-summary"
    Environment = var.environment
    Service     = "weather"
    Function    = "list-weather-summary"
  }

  depends_on = [
    aws_iam_role_policy.list_weather_summary_lambda_policy,
    aws_cloudwatch_log_group.list_weather_summary_lambda_logs
  ]
}
