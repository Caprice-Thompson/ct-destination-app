# Data sources for existing SSM parameters
data "aws_ssm_parameter" "db_username" {
  name = "/county/main/db/db_username"
}

data "aws_ssm_parameter" "db_password" {
  name            = "/county/main/db/db_password"
  with_decryption = true
}

data "aws_ssm_parameter" "rds_endpoint" {
  name = "/county/main/db/RDS_ENDPOINT"
}

data "aws_ssm_parameter" "rest_countries_api_url" {
  name = "/county/main/REST_COUNTRIES_API_URL"
}

data "aws_ssm_parameter" "population_api_url" {
  name = "/county/main/POPULATION_API_URL"
}

# Build Lambda deployment packages
data "archive_file" "list_country_information" {
  type        = "zip"
  source_dir  = "${path.module}/../../country/dist"
  output_path = "${path.module}/.terraform/lambda-packages/list-country-information.zip"
}

# IAM Role for Lambda function
resource "aws_iam_role" "list_country_information_lambda_role" {
  name = "${var.project_name}-${var.environment}-list-country-information-role"

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
    Name        = "${var.project_name}-${var.environment}-list-country-information-role"
    Environment = var.environment
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "list_country_information_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-list-country-information"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-list-country-information-logs"
    Environment = var.environment
  }
}

# IAM Policy for Lambda function
resource "aws_iam_role_policy" "list_country_information_lambda_policy" {
  name = "${var.project_name}-${var.environment}-list-country-information-policy"
  role = aws_iam_role.list_country_information_lambda_role.id

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
        Resource = "${aws_cloudwatch_log_group.list_country_information_lambda_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/county/main/*"
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

# List Country Information Lambda Function
resource "aws_lambda_function" "list_country_information" {
  filename         = data.archive_file.list_country_information.output_path
  function_name    = "list-country-information"
  role             = aws_iam_role.list_country_information_lambda_role.arn
  handler          = "index.listCountryInformationHandler"
  source_code_hash = data.archive_file.list_country_information.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  vpc_config {
    subnet_ids         = data.aws_subnets.existing.ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DATABASE_URL           = "postgresql://${data.aws_ssm_parameter.db_username.value}:${data.aws_ssm_parameter.db_password.value}@${data.aws_ssm_parameter.rds_endpoint.value}:5432/${var.db_name}"
      NODE_ENV               = var.node_env
      LOG_LEVEL              = "info"
      REST_COUNTRIES_API_URL = data.aws_ssm_parameter.rest_countries_api_url.value
      POPULATION_API_URL     = data.aws_ssm_parameter.population_api_url.value
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-list-country-information"
    Environment = var.environment
    Function    = "list-country-information"
  }

  depends_on = [
    aws_iam_role_policy.list_country_information_lambda_policy,
    aws_cloudwatch_log_group.list_country_information_lambda_logs
  ]
}

resource "aws_ssm_parameter" "list_country_information_lambda" {
  name      = "/${var.service_name}/main/LIST_COUNTRY_INFORMATION_LAMBDA"
  type      = "String"
  value     = aws_lambda_function.list_country_information.function_name
  overwrite = true
}