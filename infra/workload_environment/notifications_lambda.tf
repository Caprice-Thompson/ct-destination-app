data "archive_file" "get_eq_notifications" {
  type        = "zip"
  source_dir  = "${path.module}/../../notifications/dist"
  output_path = "${path.module}/.terraform/lambda-packages/get-eq-notifications.zip"
}

resource "aws_iam_role" "get_eq_notifications_lambda_role" {
  name = "${var.environment}-get-eq-notifications-role"

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
    Name        = "${var.environment}-get-eq-notifications-role"
    Environment = var.environment
    Service     = "notifications"
  }
}

resource "aws_cloudwatch_log_group" "get_eq_notifications_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-get-eq-notifications"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.environment}-get-eq-notifications-logs"
    Environment = var.environment
    Service     = "notifications"
  }
}

resource "aws_iam_role_policy" "get_eq_notifications_lambda_policy" {
  name = "${var.environment}-get-eq-notifications-policy"
  role = aws_iam_role.get_eq_notifications_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.get_eq_notifications_lambda_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_db_instance.main.master_user_secret[0].secret_arn
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "get_eq_notifications" {
  filename         = data.archive_file.get_eq_notifications.output_path
  function_name    = "${var.environment}-get-eq-notifications"
  role             = aws_iam_role.get_eq_notifications_lambda_role.arn
  handler          = "get-eq-notifications.handler"
  source_code_hash = data.archive_file.get_eq_notifications.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  vpc_config {
    subnet_ids         = [data.aws_ssm_parameter.private_subnet_id.value]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST                 = aws_db_instance.main.address
      DB_PORT                 = "5432"
      DB_NAME                 = var.db_name
      DB_SECRET_ARN           = aws_db_instance.main.master_user_secret[0].secret_arn
      EARTHQUAKES_SERVICE_URL = "${aws_api_gateway_stage.main.invoke_url}/earthquakes-since"
      SERVICE_NAME            = var.service_name
      NODE_ENV                = var.node_env
      LOG_LEVEL               = "info"
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-get-eq-notifications"
    Environment = var.environment
    Service     = "notifications"
    Function    = "get-eq-notifications"
  }

  depends_on = [
    aws_iam_role_policy.get_eq_notifications_lambda_policy,
    aws_cloudwatch_log_group.get_eq_notifications_lambda_logs
  ]
}
