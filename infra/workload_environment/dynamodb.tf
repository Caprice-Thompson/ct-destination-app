resource "aws_dynamodb_table" "historical_earthquakes" {
  name           = "${var.service_name}-historical_earthquakes"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "eventId"
  range_key      = "time"

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "time"
    type = "N"
  }

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "country"
    type = "S"
  }

  global_secondary_index {
    name            = "country-type-index"
    hash_key        = "country"
    range_key       = "type"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }

  point_in_time_recovery {
    enabled = false
  }

  tags = {
    Name    = "${var.environment}-historical_earthquakes"
    Service = var.service_name
  }
}