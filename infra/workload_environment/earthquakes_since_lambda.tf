data "archive_file" "get_earthquakes_since" {
  type        = "zip"
  source_dir  = "${path.module}/../../earthquakes/dist"
  output_path = "${path.module}/.terraform/lambda-packages/get-earthquakes-since.zip"
}

resource "aws_iam_role" "get_earthquakes_since_lambda_role" {
  name = "${var.environment}-get-earthquakes-since-role"

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
    Name        = "${var.environment}-get-earthquakes-since-role"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_cloudwatch_log_group" "get_earthquakes_since_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-get-earthquakes-since"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.environment}-get-earthquakes-since-logs"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_iam_role_policy" "get_earthquakes_since_lambda_policy" {
  name = "${var.environment}-get-earthquakes-since-policy"
  role = aws_iam_role.get_earthquakes_since_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.get_earthquakes_since_lambda_logs.arn}:*"
      },
      {
        Sid    = "AllowDynamoDBQuery"
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.historical_earthquakes.arn,
          "${aws_dynamodb_table.historical_earthquakes.arn}/index/*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "get_earthquakes_since" {
  filename         = data.archive_file.get_earthquakes_since.output_path
  function_name    = "${var.environment}-get-earthquakes-since"
  role             = aws_iam_role.get_earthquakes_since_lambda_role.arn
  handler          = "get-earthquakes-since.handler"
  source_code_hash = data.archive_file.get_earthquakes_since.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      EARTHQUAKES_API_URL            = var.earthquakes_api_url
      REST_COUNTRIES_API_URL         = var.rest_countries_api_url
      REST_COUNTRIES_AUTHORIZATION   = var.rest_countries_authorization
      SERVICE_NAME                   = var.service_name
      DYNAMODB_EARTHQUAKES_TABLE     = aws_dynamodb_table.historical_earthquakes.name
      NODE_ENV                       = var.node_env
      LOG_LEVEL                      = "info"
    }
  }

  tags = {
    Name        = "${var.environment}-get-earthquakes-since"
    Environment = var.environment
    Service     = "earthquakes"
    Function    = "get-earthquakes-since"
  }

  depends_on = [
    aws_iam_role_policy.get_earthquakes_since_lambda_policy,
    aws_cloudwatch_log_group.get_earthquakes_since_lambda_logs
  ]
}
