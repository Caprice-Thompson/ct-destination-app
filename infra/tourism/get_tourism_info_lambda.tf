# Data sources for existing SSM parameters (shared infrastructure)
data "aws_ssm_parameter" "private_subnet_id" {
  name = "/main/infrastructure/PRIVATE_SUBNET_ID"
}

data "aws_ssm_parameter" "db_username" {
  name = "/main/db/USERNAME"
}

data "aws_ssm_parameter" "db_password" {
  name            = "/main/db/PASSWORD"
  with_decryption = true
}

data "aws_ssm_parameter" "rds_endpoint" {
  name = "/country/db/RDS_ENDPOINT"
}

# Build Lambda deployment package
data "archive_file" "get_tourism_information" {
  type        = "zip"
  source_dir  = "${path.module}/../../tourism/dist"
  output_path = "${path.module}/.terraform/lambda-packages/get_tourism_information.zip"
}

# IAM Role for Lambda function
resource "aws_iam_role" "get_tourism_information_lambda_role" {
  name = "${var.project_name}-${var.environment}-get-tourism-information-role"

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
    Name        = "${var.project_name}-${var.environment}-get-tourism-information-role"
    Environment = var.environment
    Service     = "tourism"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "get_tourism_information_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-get-tourism-information"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-get-tourism-information-logs"
    Environment = var.environment
    Service     = "tourism"
  }
}

# IAM Policy for Lambda function
resource "aws_iam_role_policy" "get_tourism_information_lambda_policy" {
  name = "${var.project_name}-${var.environment}-get-tourism-information-policy"
  role = aws_iam_role.get_tourism_information_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.get_tourism_information_lambda_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/main/*",
          data.aws_ssm_parameter.db_username.arn,
          data.aws_ssm_parameter.db_password.arn
        ]
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

# Get Tourism Information Lambda Function
resource "aws_lambda_function" "get_tourism_information" {
  filename         = data.archive_file.get_tourism_information.output_path
  function_name    = "${var.environment}-get-tourism-information"
  role             = aws_iam_role.get_tourism_information_lambda_role.arn
  handler          = "get-tourism-information.getTourismInformationHandler"
  source_code_hash = data.archive_file.get_tourism_information.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  vpc_config {
    subnet_ids         = [data.aws_ssm_parameter.private_subnet_id.value]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST           = data.aws_ssm_parameter.rds_endpoint.value
      DB_PORT           = "5432"
      DB_NAME           = var.db_name
      DB_USERNAME_PARAM = data.aws_ssm_parameter.db_username.name
      DB_PASSWORD_PARAM = data.aws_ssm_parameter.db_password.name
      NODE_ENV          = var.node_env
      LOG_LEVEL         = "info"
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-get-tourism-information"
    Environment = var.environment
    Service     = "tourism"
    Function    = "get-tourism-information"
  }

  depends_on = [
    aws_iam_role_policy.get_tourism_information_lambda_policy,
    aws_cloudwatch_log_group.get_tourism_information_lambda_logs
  ]
}

# SSM Parameter for Lambda function name
resource "aws_ssm_parameter" "get_tourism_information_lambda" {
  name      = "/${var.service_name}/main/GET_TOURISM_INFORMATION_LAMBDA"
  type      = "String"
  value     = aws_lambda_function.get_tourism_information.function_name
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-get-tourism-information-lambda-param"
    Environment = var.environment
    Service     = "tourism"
  }
}

