# Tourism Service Infrastructure

This directory contains the Terraform/OpenTofu configuration for the Tourism service Lambda and API Gateway.

## Architecture

The Tourism service shares the same RDS instance with the Country service but uses a separate database named `tourism`.

### Shared Resources (from Country infrastructure)
- **RDS Instance**: PostgreSQL database instance
- **VPC**: Virtual Private Cloud
- **Subnets**: Private subnets for Lambda
- **RDS Security Group**: Security group for database access
- **Database Credentials**: Username and password stored in SSM Parameter Store

### Tourism-Specific Resources
- **Lambda Function**: `get-tourism-information` handler
- **API Gateway**: REST API with `/tourism-info` endpoint
- **Security Group**: Dedicated security group for Tourism Lambda
- **CloudWatch Logs**: Log group for Lambda execution logs
- **IAM Role & Policy**: Permissions for Lambda execution

## Database Configuration

- **RDS Instance**: Shared with Country service (accessed via SSM parameters)
- **Database Name**: `tourism` (separate from `country` database)
- **Connection**: Lambda connects to shared RDS instance using VPC configuration

## Deployment

### Prerequisites
1. Country infrastructure must be deployed first (provides shared RDS instance)
2. Tourism Lambda code must be built: `cd ../../tourism && npm run build`
3. AWS credentials configured
4. S3 backend and DynamoDB table for state management

### Deploy
```bash
cd infra/tourism
tofu init
tofu plan
tofu apply
```

## Environment Variables

The Lambda function receives these environment variables:
- `DB_HOST`: RDS endpoint (from SSM)
- `DB_PORT`: PostgreSQL port (5432)
- `DB_NAME`: Database name (tourism)
- `DB_USERNAME_PARAM`: SSM parameter path for DB username
- `DB_PASSWORD_PARAM`: SSM parameter path for DB password
- `NODE_ENV`: Environment (production/development)
- `LOG_LEVEL`: Logging level (info)

## API Endpoint

After deployment, the API will be available at:
```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/{environment}/tourism-info?countryName=Spain
```

## Database Setup

After deploying the infrastructure, you need to:
1. Create the `tourism` database on the shared RDS instance
2. Run migrations: `tourism/src/infrastructure/repositories/db/migrations/001_create_unesco_sites_table.sql`

