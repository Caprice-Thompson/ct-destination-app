# EventBridge Rule for Weekly Ingestion
# TODO: Uncomment when ingest_country_data Lambda function is created
# resource "aws_cloudwatch_event_rule" "country_ingestion_schedule" {
#   name                = "${var.project_name}-${var.environment}-weekly-ingestion"
#   description         = "Trigger country data ingestion weekly on Friday"
#   schedule_expression = "cron(0 2 ? * FRI *)" # Weekly on Friday at 2 AM UTC
#
#   tags = {
#     Name        = "${var.project_name}-${var.environment}-weekly-ingestion"
#     Environment = var.environment
#   }
# }

# EventBridge Target
# resource "aws_cloudwatch_event_target" "ingest_country_data" {
#   rule      = aws_cloudwatch_event_rule.country_ingestion_schedule.name
#   target_id = "IngestCountryDataLambda"
#   arn       = aws_lambda_function.ingest_country_data.arn
#
#   input = jsonencode({
#     "detail-type" = "Scheduled Event"
#     "source"      = "aws.events"
#     "detail" = {
#       "countries" = [
#         "France",
#         "Germany",
#         "Italy",
#         "Spain",
#         "United Kingdom"
#       ]
#     }
#   })
# }

# Lambda Permission for EventBridge
# resource "aws_lambda_permission" "eventbridge" {
#   statement_id  = "AllowEventBridgeInvoke"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.ingest_country_data.function_name
#   principal     = "events.amazonaws.com"
#   source_arn    = aws_cloudwatch_event_rule.country_ingestion_schedule.arn
# }