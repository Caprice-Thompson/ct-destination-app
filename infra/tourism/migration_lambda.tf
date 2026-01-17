# Lambda function to run database migrations in production for tourism service
# Triggered manually via GitHub Actions or AWS Console

data "aws_ssm_parameter" "private_subnet_id_tourism_migration" {
  name = "/main/infrastructure/PRIVATE_SUBNET_ID"
}

data "aws_ssm_parameter" "db_username_tourism_migration" {
  name = "/main/db/USERNAME"
}

data "aws_ssm_parameter" "db_password_tourism_migration" {
  name            = "/main/db/PASSWORD"
  with_decryption = true
}

data "aws_ssm_parameter" "rds_endpoint_tourism_migration" {
  name = "/tourism/db/RDS_ENDPOINT"
}

# IAM Role for Migration Lambda
resource "aws_iam_role" "tourism_migration_lambda_role" {
  name = "${var.project_name}-${var.environment}-tourism-migration-lambda-role"

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
    Name        = "${var.project_name}-${var.environment}-tourism-migration-lambda-role"
    Environment = var.environment
    Service     = "tourism"
    Purpose     = "Database migrations"
  }
}

# IAM Policy for Migration Lambda
resource "aws_iam_role_policy" "tourism_migration_lambda_policy" {
  name = "${var.project_name}-${var.environment}-tourism-migration-lambda-policy"
  role = aws_iam_role.tourism_migration_lambda_role.id

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
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/aws/lambda/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/main/*",
          "arn:aws:ssm:${var.aws_region}:*:parameter/tourism/*"
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

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "tourism_migration_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-tourism-run-migrations"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-${var.environment}-tourism-migration-lambda-logs"
    Environment = var.environment
    Service     = "tourism"
  }
}

data "archive_file" "tourism_migration_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../tourism/migration-lambda"
  output_path = "${path.module}/.terraform/lambda-packages/tourism-migration-lambda.zip"
  excludes    = ["*.map"]
}

# Migration Lambda Function
resource "aws_lambda_function" "tourism_run_migrations" {
  filename         = data.archive_file.tourism_migration_lambda.output_path
  function_name    = "${var.environment}-tourism-run-migrations"
  role             = aws_iam_role.tourism_migration_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.tourism_migration_lambda.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 300
  memory_size      = 512

  vpc_config {
    subnet_ids         = [data.aws_ssm_parameter.private_subnet_id_tourism_migration.value]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST           = data.aws_ssm_parameter.rds_endpoint_tourism_migration.value
      DB_PORT           = "5432"
      DB_NAME           = "tourism"
      DB_USERNAME_PARAM = data.aws_ssm_parameter.db_username_tourism_migration.name
      DB_PASSWORD_PARAM = data.aws_ssm_parameter.db_password_tourism_migration.name
      NODE_ENV          = var.node_env
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-tourism-run-migrations"
    Environment = var.environment
    Service     = "tourism"
    Purpose     = "Database migrations"
  }

  depends_on = [
    aws_iam_role_policy.tourism_migration_lambda_policy,
    aws_cloudwatch_log_group.tourism_migration_lambda_logs
  ]
}

# SSM Parameter for Lambda ARN
resource "aws_ssm_parameter" "tourism_migration_lambda_arn" {
  name      = "/tourism/main/MIGRATION_LAMBDA_ARN"
  type      = "String"
  value     = aws_lambda_function.tourism_run_migrations.arn
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-tourism-migration-lambda-arn"
    Environment = var.environment
    Service     = "tourism"
  }
}

output "tourism_migration_lambda_name" {
  description = "Tourism Migration Lambda function name"
  value       = aws_lambda_function.tourism_run_migrations.function_name
}

output "tourism_migration_invoke_command" {
  description = "Command to invoke tourism migrations from CLI or GitHub Actions"
  value       = "aws lambda invoke --function-name ${aws_lambda_function.tourism_run_migrations.function_name} --region ${var.aws_region} response.json"
}
