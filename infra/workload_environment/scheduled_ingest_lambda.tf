data "archive_file" "scheduled_ingest" {
  type        = "zip"
  source_dir  = "${path.module}/../../earthquakes/dist"
  output_path = "${path.module}/.terraform/lambda-packages/scheduled-ingest.zip"
}

resource "aws_iam_role" "scheduled_ingest_lambda_role" {
  name = "${var.service_name}-scheduled-ingest-role"

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
    Name    = "${var.service_name}-scheduled-ingest-role"
    Service = var.service_name
  }
}

resource "aws_cloudwatch_log_group" "scheduled_ingest_logs" {
  name              = "/aws/lambda/${var.service_name}-scheduled-ingest"
  retention_in_days = var.log_retention_days

  tags = {
    Name    = "${var.service_name}-scheduled-ingest-logs"
    Service = var.service_name
  }
}

resource "aws_iam_role_policy" "scheduled_ingest_lambda_policy" {
  name = "${var.service_name}-scheduled-ingest-policy"
  role = aws_iam_role.scheduled_ingest_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.scheduled_ingest_logs.arn}:*"
      },
      {
        Sid    = "AllowDynamoDBBatchWrite"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.historical_earthquakes.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "scheduled_ingest" {
  filename         = data.archive_file.scheduled_ingest.output_path
  function_name    = "${var.service_name}-scheduled-ingest"
  role             = aws_iam_role.scheduled_ingest_lambda_role.arn
  handler          = "scheduled-ingest.handler"
  source_code_hash = data.archive_file.scheduled_ingest.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = 900
  memory_size      = var.lambda_memory

  environment {
    variables = {
      EARTHQUAKES_API_URL            = var.earthquakes_api_url
      REST_COUNTRIES_API_URL         = var.rest_countries_api_url
      REST_COUNTRIES_AUTHORIZATION   = var.rest_countries_authorization
      SERVICE_NAME               = var.service_name
      DYNAMODB_EARTHQUAKES_TABLE = aws_dynamodb_table.historical_earthquakes.name
      NODE_ENV                   = var.node_env
      LOG_LEVEL                  = "info"
    }
  }

  tags = {
    Name     = "${var.service_name}-scheduled-ingest"
    Service  = var.service_name
    Function = "scheduled-ingest"
  }

  depends_on = [
    aws_iam_role_policy.scheduled_ingest_lambda_policy,
    aws_cloudwatch_log_group.scheduled_ingest_logs
  ]
}

resource "aws_cloudwatch_event_rule" "earthquake_ingestion_schedule" {
  name                = "${var.service_name}-monthly-ingestion"
  description         = "Trigger earthquake data ingestion monthly on the 1st at 2 AM UTC"
  schedule_expression = "cron(0 2 1 * ? *)"

  tags = {
    Name    = "${var.service_name}-monthly-ingestion"
    Service = var.service_name
  }
}

resource "aws_cloudwatch_event_target" "scheduled_ingest" {
  rule      = aws_cloudwatch_event_rule.earthquake_ingestion_schedule.name
  target_id = "ScheduledIngestLambda"
  arn       = aws_lambda_function.scheduled_ingest.arn
}

resource "aws_lambda_permission" "eventbridge_invoke" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scheduled_ingest.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.earthquake_ingestion_schedule.arn
}
