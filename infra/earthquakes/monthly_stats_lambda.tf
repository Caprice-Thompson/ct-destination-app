data "archive_file" "eq_monthly_stats" {
  type        = "zip"
  source_dir  = "${path.module}/../../earthquakes/dist"
  output_path = "${path.module}/.terraform/lambda-packages/eq_monthly_stats.zip"
}

resource "aws_iam_role" "eq_monthly_stats_lambda_role" {
  name = "${var.project_name}-${var.service_name}-eq_monthly_stats-role"

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
    Name    = "${var.project_name}-${var.service_name}-eq_monthly_stats-role"
    Service = var.service_name
  }
}

resource "aws_cloudwatch_log_group" "eq_monthly_stats_logs" {
  name              = "/aws/lambda/${var.service_name}-eq_monthly_stats"
  retention_in_days = var.log_retention_days

  tags = {
    Name    = "${var.project_name}-${var.service_name}-eq_monthly_stats-logs"
    Service = var.service_name
  }
}

resource "aws_iam_role_policy" "eq_monthly_stats_lambda_policy" {
  name = "${var.project_name}-${var.service_name}-eq_monthly_stats-policy"
  role = aws_iam_role.eq_monthly_stats_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.eq_monthly_stats_logs.arn}:*"
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

resource "aws_lambda_function" "eq_monthly_stats" {
  filename         = data.archive_file.eq_monthly_stats.output_path
  function_name    = "${var.service_name}-eq-monthly-stats"
  role             = aws_iam_role.eq_monthly_stats_lambda_role.arn
  handler          = "get-earthquake-monthly-summary.handler"
  source_code_hash = data.archive_file.eq_monthly_stats.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      SERVICE_NAME               = var.service_name
      DYNAMODB_EARTHQUAKES_TABLE = resource.aws_ssm_parameter.historical_earthquakes_dynamodb_table.value
      NODE_ENV                   = var.node_env
      LOG_LEVEL                  = "info"
    }
  }

  tags = {
    Name     = "${var.project_name}-${var.service_name}-eq-monthly-stats"
    Service  = var.service_name
    Function = "monthly-stats"
  }

  depends_on = [
    aws_iam_role_policy.eq_monthly_stats_lambda_policy,
    aws_cloudwatch_log_group.eq_monthly_stats_logs
  ]
}

