# OpenTofu/Terraform Backend Setup

This directory contains the OpenTofu (Terraform-compatible) configuration to bootstrap the backend infrastructure needed for remote state management.

> **Note**: OpenTofu is a fork of Terraform and is fully compatible. All backend configurations work with both OpenTofu and Terraform.

## What This Creates

1. **S3 Bucket**: Stores Terraform state files
   - Versioning enabled (keeps history)
   - Encryption enabled
   - Public access blocked

2. **DynamoDB Table**: Provides state locking to prevent concurrent modifications

## Setup Instructions

### Step 1: Run This Bootstrap (One-Time Setup)

```bash
cd infra/backend

# Initialize OpenTofu
tofu init

# Review what will be created
tofu plan

# Create the backend infrastructure
tofu apply
```

Or if you prefer the automated script:
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Note the Outputs

After applying, Terraform will output the backend configuration. Save this information!

```
s3_bucket_name = "destination-app-production-terraform-state"
dynamodb_table_name = "destination-app-production-terraform-locks"
```

### Step 3: Backend Configuration is Already Added

The backend configuration has already been added to `infra/country/main.tf`. Just make sure the S3 bucket exists before running your main deployment.

## Important Notes

### State File for Bootstrap

⚠️ **Important**: The backend bootstrap itself will create a local `terraform.tfstate` file in this directory. 

**Options for managing this:**

1. **Commit it to your repo** (simplest - it only contains bucket/table names, no secrets)
2. **Store it in a separate S3 bucket** (more secure)
3. **Keep it locally** and back it up somewhere safe

If you lose this state file, the resources will still exist in AWS, but OpenTofu/Terraform won't know about them. You can either:
- Import them back into state
- Manually delete and recreate them

### Costs

These resources are very cheap:
- **S3**: ~$0.023 per GB/month (state files are tiny, <1MB typically)
- **DynamoDB**: Pay per request (free tier: 25 GB storage, 25 write/read units)

Estimated monthly cost: **< $0.10** 💰

## Cleanup

If you ever need to destroy everything:

```bash
# First, destroy your main infrastructure
cd ../country
tofu destroy

# Then destroy the backend (only after all state is gone)
cd ../backend
tofu destroy
```

⚠️ **Warning**: Never destroy the backend while you have infrastructure using it!