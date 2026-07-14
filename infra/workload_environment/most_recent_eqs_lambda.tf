data "archive_file" "most_recent_eqs" {
  type        = "zip"
  source_dir  = "${path.module}/../../earthquakes/dist"
  output_path = "${path.module}/.terraform/lambda-packages/most-recent-eqs.zip"
}

resource "aws_iam_role" "most_recent_eqs_lambda_role" {
  name = "${var.project_name}-${var.environment}-most-recent-eqs-role"

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
    Name        = "${var.project_name}-${var.environment}-most-recent-eqs-role"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_cloudwatch_log_group" "most_recent_eqs_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-most-recent-eqs"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-most-recent-eqs-logs"
    Environment = var.environment
    Service     = "earthquakes"
  }
}

resource "aws_iam_role_policy" "most_recent_eqs_lambda_policy" {
  name = "${var.project_name}-${var.environment}-most-recent-eqs-policy"
  role = aws_iam_role.most_recent_eqs_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.most_recent_eqs_lambda_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/*"
        ]
      },
      {
        Sid    = "AllowDynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:DeleteItem"
        ]
        Resource = [
          aws_dynamodb_table.historical_earthquakes.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "most_recent_eqs" {
  filename         = data.archive_file.most_recent_eqs.output_path
  function_name    = "${var.environment}-most-recent-eqs"
  role             = aws_iam_role.most_recent_eqs_lambda_role.arn
  handler          = "get-most-recent-earthquakes.handler"
  source_code_hash = data.archive_file.most_recent_eqs.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      EARTHQUAKES_API_URL    = data.aws_ssm_parameter.earthquakes_api_url.value
      REST_COUNTRIES_API_URL = data.aws_ssm_parameter.rest_countries_api_url.value
      SERVICE_NAME           = var.service_name
      NODE_ENV               = var.node_env
      LOG_LEVEL              = "info"
    }
  }

  tags = {
    Name        = "${var.environment}-most-recent-eqs"
    Environment = var.environment
    Service     = "earthquakes"
    Function    = "most-recent-eqs"
  }

  depends_on = [
    aws_iam_role_policy.most_recent_eqs_lambda_policy,
    aws_cloudwatch_log_group.most_recent_eqs_lambda_logs
  ]
}

