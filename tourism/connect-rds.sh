#!/bin/bash

# Script to connect to RDS via EC2 Instance Connect Endpoint (EICE) for Tourism service
# Usage: ./connect-rds.sh

set -e

AWS_REGION="eu-west-2"

echo "Fetching EICE ID from SSM..."
EICE_ID=$(aws ssm get-parameter \
  --name "/main/infrastructure/EICE_ID" \
  --region "$AWS_REGION" \
  --query "Parameter.Value" \
  --output text)

echo "Fetching RDS endpoint from SSM..."
RDS_ENDPOINT=$(aws ssm get-parameter \
  --name "/country/db/RDS_ENDPOINT" \
  --region "$AWS_REGION" \
  --query "Parameter.Value" \
  --output text)

RDS_HOST=$(echo $RDS_ENDPOINT | cut -d':' -f1)

echo "Resolving RDS private IP..."
RDS_PRIVATE_IP=$(dig +short $RDS_HOST | head -n1)

if [ -z "$RDS_PRIVATE_IP" ]; then
  echo "Error: Could not resolve RDS private IP"
  exit 1
fi

echo ""
echo "Connection Details:"
echo "  EICE ID: $EICE_ID"
echo "  RDS Host: $RDS_HOST"
echo "  RDS Private IP: $RDS_PRIVATE_IP"
echo ""
echo "Starting tunnel on localhost:5432..."
echo "Connect your database client to: localhost:5432"
echo "Database: tourism"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

aws ec2-instance-connect open-tunnel \
  --instance-connect-endpoint-id "$EICE_ID" \
  --private-ip-address "$RDS_PRIVATE_IP" \
  --local-port 5432 \
  --remote-port 5432 \
  --region "$AWS_REGION"
