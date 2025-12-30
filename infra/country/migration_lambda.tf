# Lambda function to run database migrations in production
# Triggered manually via GitHub Actions or AWS Console

data "aws_ssm_parameter" "private_subnet_id_migration" {
  name = "/main/infrastructure/PRIVATE_SUBNET_ID"
}

data "aws_ssm_parameter" "db_username_migration" {
  name = "/main/db/USERNAME"
}

data "aws_ssm_parameter" "db_password_migration" {
  name            = "/main/db/PASSWORD"
  with_decryption = true
}

data "aws_ssm_parameter" "rds_endpoint_migration" {
  name = "/country/db/RDS_ENDPOINT"
}

# IAM Role for Migration Lambda
resource "aws_iam_role" "migration_lambda_role" {
  name = "${var.project_name}-${var.environment}-migration-lambda-role"

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
    Name        = "${var.project_name}-${var.environment}-migration-lambda-role"
    Environment = var.environment
    Purpose     = "Database migrations"
  }
}

# IAM Policy for Migration Lambda
resource "aws_iam_role_policy" "migration_lambda_policy" {
  name = "${var.project_name}-${var.environment}-migration-lambda-policy"
  role = aws_iam_role.migration_lambda_role.id

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
          "arn:aws:ssm:${var.aws_region}:*:parameter/country/*"
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
resource "aws_cloudwatch_log_group" "migration_lambda_logs" {
  name              = "/aws/lambda/${var.environment}-run-migrations"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-${var.environment}-migration-lambda-logs"
    Environment = var.environment
  }
}

# Migration Lambda Function
resource "aws_lambda_function" "run_migrations" {
  filename         = abspath("${path.module}/../../country/migration-lambda.zip")
  function_name    = "${var.environment}-run-migrations"
  role             = aws_iam_role.migration_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../country/migration-lambda.zip") ? filebase64sha256(abspath("${path.module}/../../country/migration-lambda.zip")) : null
  runtime          = "nodejs20.x"
  timeout          = 300
  memory_size      = 512

  vpc_config {
    subnet_ids         = [data.aws_ssm_parameter.private_subnet_id_migration.value]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST           = data.aws_ssm_parameter.rds_endpoint_migration.value
      DB_PORT           = "5432"
      DB_NAME           = "country"
      DB_USERNAME_PARAM = data.aws_ssm_parameter.db_username_migration.name
      DB_PASSWORD_PARAM = data.aws_ssm_parameter.db_password_migration.name
      NODE_ENV          = var.node_env
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-run-migrations"
    Environment = var.environment
    Purpose     = "Database migrations"
  }

  depends_on = [
    aws_iam_role_policy.migration_lambda_policy,
    aws_cloudwatch_log_group.migration_lambda_logs
  ]
}

# SSM Parameter for Lambda ARN
resource "aws_ssm_parameter" "migration_lambda_arn" {
  name      = "/country/main/MIGRATION_LAMBDA_ARN"
  type      = "String"
  value     = aws_lambda_function.run_migrations.arn
  overwrite = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-migration-lambda-arn"
    Environment = var.environment
  }
}

output "migration_lambda_name" {
  description = "Migration Lambda function name"
  value       = aws_lambda_function.run_migrations.function_name
}

output "migration_invoke_command" {
  description = "Command to invoke migrations from CLI or GitHub Actions"
  value       = "aws lambda invoke --function-name ${aws_lambda_function.run_migrations.function_name} --region ${var.aws_region} response.json"
}
