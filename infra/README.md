# Infrastructure Deployment with OpenTofu

This directory contains OpenTofu (Terraform) configuration files for deploying the Destination App to AWS.

All infrastructure is deployed from the `workload_environment/` directory.

```bash
cd workload_environment
tofu init
tofu plan
tofu apply
```

## Architecture

The infrastructure includes:

- **VPC**: Custom VPC with public and private subnets across 2 availability zones
- **RDS PostgreSQL 17**: Shared database (`destination_app`) with managed master password in Secrets Manager
- **API Gateway**: Unified REST API with 7 endpoints
- **Lambda Functions**: 7 microservice handlers (country, tourism, earthquakes, weather, notifications, etc.)
- **DynamoDB**: Tables for historical earthquakes and weather data
- **EventBridge**: Scheduled monthly ingestion of earthquake data
- **Security Groups**: Proper network isolation between Lambda and RDS
- **CloudWatch**: Log groups for all Lambda functions

## Prerequisites

1. **OpenTofu/Terraform installed**
2. **AWS CLI configured** with appropriate credentials:
   ```bash
   aws configure
   ```
3. **All microservices built**:
   ```bash
   cd ../country && npm install && npm run build
   cd ../tourism && npm install && npm run build
   cd ../earthquakes && npm install && npm run build
   cd ../weather && npm install && npm run build
   cd ../notifications && npm install && npm run build
   ```

## Deployment Steps

### 1. Configure Variables

Edit `workload_environment/terraform.tfvars` and set your values:

```hcl
aws_region              = "eu-west-2"
environment             = "main"
project_name            = "ct-destination-app"
node_env                = "production"
rest_countries_api_url  = "https://api.restcountries.com/countries/v5"
earthquakes_api_url     = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
```

**Note**: The database master password is automatically generated and managed by AWS Secrets Manager. No manual password configuration needed.

### 2. Initialize OpenTofu

```bash
tofu init
```

This will download the required provider plugins.
cd workload_environment

### 3. Review the Deployment Plan

```bash
tofu plan
```

Review the resources that will be created.

### 4. Deploy

```bash
tofu apply
```

Type `yes` when prompted to confirm the deployment.

**Note**: Initial deployment takes 10-15 minutes due to RDS instance creation.

### 5. Run Database Migrations

retrieve the RDS secret from AWS Secrets Manager and run migrations from the `country` directory:

```bash
cd ../country
# Get the secret ARN from Terraform outputs or AWS Secrets Manager
tofu output rds_db_secret_arn  # From workload_environment/

# Retrieve credentials and run migrations
export DATABASE_URL="postgresql://dbadmin:your-password@<rds-endpoint>/countrydb"
npm run db:migrate
```

### 6. Test the API

Get your API endpoint:

```bash
tofu output api_gateway_url
```

Test the endpoint: # From workload_environment/

````

Test the endpoints:

```bash
# Country information
curl "https://<api-url>/main/country-info?countryName=France"

# Tourism information
curl "https://<api-url>/main/tourism-info?countryName=France"

# Recent earthquakes
curl "https://<api-url>/main/earthquakes?countryName=Chile"

# Earthquake monthly statistics
curl "https://<api-url>/main/earthquakes-monthly?countryName=Japan&month=2024-01"

# Weather summary
curl "https://<api-url>/main/weather?countryName=Kenya&month=2024-01"

# Earthquake notifications
curl "https://<api-url>/main/notifications" -H "Authorization: Bearer <user-token>

### View Outputs

```bash
tofu output
````

### Update Infrastructure

After making changes to the configuration:
eu-west-2, pay-as-you-go):

- **RDS db.t3.micro**: ~$15/month (free tier eligible)
- **Lambda**: Pay per invocation (mostly free tier)
- **API Gateway**: Pay per request (~$0.35 per million requests)
- **DynamoDB**: On-demand pricing (~$1.25 per million write units, $0.25 per million read units)
- **NAT Gateway**: ~$32/month (charged per hour and data processing)
- **Data transfer**: Variable

**Total**: ~$50-70/month in production

To reduce costs:

- Disable NAT Gateway if Lambda functions don't require internet access
- Use DynamoDB on-demand billing (currently enabled)
- Consider reserved capacity for predictable workloads

Estimated monthly costs (us-east-1, dev environment):

- **RDS db.t3.micro**: ~$15/month
- **Lambda**: Pay per invocation (mostly free tier)
- **API Gateway**: Pay per request (mostly free tier)
- **NAT Gateway**: ~$32/month
- **Data transfer**: Variable

**Total**: ~$50-60/month

To reduce costs:

- Remove NAT Gateway if Lambda doesn't need internet access
- Use RDS Proxy for connection pooling
- Consider Aurora Serverless v2 for production

## Troubleshooting

### Lambda can't connect to RDS

1. Check security groups allow port 5432
2. Verify Lambda is in the correct subnets
3. Check RDS endpoint is accessible

### Lambda timeout errors

1. Increase timeout in `main.tf` (current: 30s for list, 300s for ingest)
2. Optimize database queries
3. AB_HOST`: RDS endpoint

- `DB_PORT`: PostgreSQL port (5432)
- `DB_NAME`: Database name (`destination_app`)
- `DB_SECRET_ARN`: AWS Secrets Manager secret ARN for credentials
- `NODE_ENV`: Node environment (production/development)
- `LOG_LEVEL`: Logging level (info)
- Service-specific: `DYNAMODB_EARTHQUAKES_TABLE`, `DYNAMODB_WEATHER_TABLE`, etc.

Ensure the Lambda package is built:

```bash
cd ../country
npm run build
```

The `dist` directory must exist before running `tofu apply`.

## Environment Variables

Lambda functions receive these environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Node environment (product(add to `.gitignore`)

2. **Master password** is automatically generated and stored in AWS Secrets Manager (no manual password management)
3. Enable VPC Flow Logs for production monitoring
4. Implement API Gateway authentication (API keys, Cognito, etc.)
5. Use IAM policies to restrict Lambda function permissions
6. Enable encryption in transit and at rest for RDS and DynamoDB
7. **Never commit** `terraform.tfvars` with real credentials
8. Use AWS Secrets Manager for production passwords
9. Enable VPC Flow Logs for production
10. Consider using RDS IAM authentication
11. Implement API Gateway authenticati for state locking)
12. Implement CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
13. Add CloudWatch dashboards and alarms
14. Configure Lambda auto-scaling based on concurrency
15. Enable RDS Performance Insights and Enhanced Monitoring
16. Implement multi-region deployment strategy
17. Set up backup and disaster recovery procedures
18. Set up remote state (S3 + DynamoDB)
19. Implement CI/CD pipeline
20. Add monitoring and alerting
21. Configure auto-scaling
22. Set up multi-region deployment
23. Implement proper secret management
