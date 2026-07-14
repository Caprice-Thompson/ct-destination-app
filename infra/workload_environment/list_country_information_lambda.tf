# List Country Information Lambda Function
resource "aws_lambda_function" "list_country_information" {
  filename         = data.archive_file.list_country_information.output_path
  function_name    = "${var.environment}-list-country-information"
  role             = aws_iam_role.list_country_information_lambda_role.arn
  handler          = "list-country-information.handler"
  source_code_hash = data.archive_file.list_country_information.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  vpc_config {
    subnet_ids         = [data.aws_ssm_parameter.private_subnet_id.value]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST                = aws_db_instance.main.address
      DB_PORT                = "5432"
      DB_NAME                = var.db_name
      DB_SECRET_ARN          = aws_db_instance.main.master_user_secret[0].secret_arn
      NODE_ENV               = var.node_env
      LOG_LEVEL              = "info"
      REST_COUNTRIES_API_URL = data.aws_ssm_parameter.country_rest_countries_api_url.value
      POPULATION_API_URL     = data.aws_ssm_parameter.population_api_url.value
    }
  }

  tags = {
    Name        = "${var.environment}-list-country-information"
    Environment = var.environment
    Function    = "list-country-information"
  }

  depends_on = [
    aws_iam_role_policy.list_country_information_lambda_policy,
    aws_cloudwatch_log_group.list_country_information_lambda_logs
  ]
}

# Data sources for existing SSM parameters
data "aws_ssm_parameter" "country_rest_countries_api_url" {
  name = "/country/api/REST_COUNTRIES_API_URL"
}

data "aws_ssm_parameter" "population_api_url" {
  name = "/country/api/POPULATION_API_URL"
}

# Build Lambda deployment packages
data "archive_file" "list_country_information" {
  type        = "zip"
  source_dir  = "${path.module}/../../country/dist"
  output_path = "${path.module}/.terraform/lambda-packages/list-country-information.zip"
}

# IAM Role for Lambda function
resource "aws_iam_role" "list_country_information_lambda_role" {
  name = "${var.environment}-list-country-information-role"

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
    Name        = "list-country-information-role"
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



resource "aws_ssm_parameter" "list_country_information_lambda" {
  name      = "/${var.service_name}/main/LIST_COUNTRY_INFORMATION_LAMBDA"
  type      = "String"
  value     = aws_lambda_function.list_country_information.function_name
  overwrite = true
}