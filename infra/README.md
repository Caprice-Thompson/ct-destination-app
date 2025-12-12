# Infrastructure Deployment with OpenTofu

This directory contains OpenTofu (Terraform) configuration files for deploying the Country Destination App to AWS.

terraform init
terraform plan
terraform apply

## Architecture

The infrastructure includes:

- **VPC**: Custom VPC with public and private subnets across 2 availability zones
- **Lambda Functions**:
  - `list-country-info`: Handles GET requests via API Gateway
  - `ingest-country-data`: Triggered daily by EventBridge to fetch and store country data
- **RDS PostgreSQL**: Database for storing country information
- **API Gateway**: REST API endpoint for querying country information
- **EventBridge**: Scheduled rule for daily data ingestion
- **Security Groups**: Proper network isolation between Lambda and RDS
- **CloudWatch**: Log groups for Lambda functions

## Prerequisites

1. **OpenTofu/Terraform installed** (already installed)
2. **AWS CLI configured** with appropriate credentials:
   ```bash
   aws configure
   ```
3. **Node.js project built**:
   ```bash
   cd ../country
   npm install
   npm run build
   ```

## Deployment Steps

### 1. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set your values:

```hcl
aws_region   = "us-east-1"
environment  = "dev"
project_name = "ct-destination"
db_username  = "dbadmin"
db_password  = "your-secure-password-here"  # Use a strong password
node_env     = "production"
```

### 2. Initialize OpenTofu

```bash
tofu init
```

This will download the required provider plugins.

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

After deployment, you'll need to run migrations. First, get the RDS endpoint from outputs:

```bash
tofu output rds_endpoint
```

Then, from the `country` directory, run migrations:

```bash
cd ../country
export DATABASE_URL="postgresql://dbadmin:your-password@<rds-endpoint>/countrydb"
npm run db:migrate
```

### 6. Test the API

Get your API endpoint:

```bash
tofu output api_gateway_url
```

Test the endpoint:

```bash
curl "https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/country-info?countryName=France"
```

## Managing Infrastructure

### View Outputs

```bash
tofu output
```

### Update Infrastructure

After making changes to the configuration:

```bash
tofu plan
tofu apply
```

### Destroy Infrastructure

**Warning**: This will delete all resources including the database.

```bash
tofu destroy
```

## Costs

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
3. Add connection pooling

### Build errors

Ensure the Lambda package is built:

```bash
cd ../country
npm run build
```

The `dist` directory must exist before running `tofu apply`.

## Environment Variables

Lambda functions receive these environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Node environment (production/development)
- `LOG_LEVEL`: Logging level (info)

## Security Notes

1. **Never commit** `terraform.tfvars` with real credentials
2. Use AWS Secrets Manager for production passwords
3. Enable VPC Flow Logs for production
4. Consider using RDS IAM authentication
5. Implement API Gateway authentication (API keys, Cognito, etc.)

## Next Steps

For production deployments:

1. Set up remote state (S3 + DynamoDB)
2. Implement CI/CD pipeline
3. Add monitoring and alerting
4. Configure auto-scaling
5. Set up multi-region deployment
6. Implement proper secret management
