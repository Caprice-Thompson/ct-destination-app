# CI/CD Pipeline Documentation

This project uses GitHub Actions for continuous integration and deployment of both the application code and AWS infrastructure using OpenTofu.

## 📋 Workflows Overview

### 1. CI Pipeline (`ci.yml`)

**Trigger**: Push/PR to `main` or `develop`

**Purpose**: Run tests, linting, and code quality checks

**Jobs**:

- Run tests on Node.js 18.x and 20.x
- Type checking with TypeScript
- Linting with ESLint
- Format checking with Prettier
- Upload coverage to Codecov

### 2. Infrastructure Deployment (`infrastructure.yml`)

**Trigger**:

- Push to `main` (paths: `infra/**`)
- Pull requests (plan only)
- Manual workflow dispatch

**Purpose**: Deploy and manage AWS infrastructure with OpenTofu

**Jobs**:

1. **Validate**: Check OpenTofu configuration
2. **Plan**: Show what will change (PR comments)
3. **Deploy**: Apply infrastructure changes to AWS
4. **Destroy**: Remove all infrastructure (manual only)

### 3. Lambda Deployment (`deploy.yml`)

**Trigger**:

- Push to `main` (paths: `country/**`)
- Manual workflow dispatch

**Purpose**: Update Lambda function code without infrastructure changes

**Jobs**:

- Build and package Lambda functions
- Update both Lambda functions (list-country-info, ingest-country-data)
- Verify deployment

### 4. Database Migrations (`db-migration.yml`)

**Trigger**:

- Push to `main` (paths: `country/src/infrastructure/repositories/db/migrations/**`)
- Manual workflow dispatch

**Purpose**: Run database migrations against RDS

**Jobs**:

- Get RDS endpoint from AWS
- Run migration scripts
- Verify migration status

### 5. Complete Deployment Pipeline (`complete-deployment.yml`)

**Trigger**:

- Push to `main`
- Manual workflow dispatch

**Purpose**: Full end-to-end deployment

**Jobs**:

1. Test application
2. Build Lambda package
3. Deploy infrastructure
4. Run migrations
5. Test deployment
6. Create summary

## 🔐 Required Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

### Required Secrets:

```
AWS_ACCESS_KEY_ID          # AWS access key for deployment
AWS_SECRET_ACCESS_KEY      # AWS secret key for deployment
DB_USERNAME                # Database master username (e.g., dbadmin)
DB_PASSWORD                # Database master password (strong password)
```

### Optional Secrets (with defaults):

```
AWS_REGION                 # Default: us-east-1
PROJECT_NAME               # Default: ct-destination
ENVIRONMENT                # Default: dev
NODE_ENV                   # Default: production
CODECOV_TOKEN             # For coverage reporting (optional)
```

## 🚀 Setup Instructions

### 1. Configure AWS IAM User

Create an IAM user with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "rds:*",
        "ec2:*",
        "iam:*",
        "logs:*",
        "events:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Or use the managed policy: `AdministratorAccess` (for dev/test environments)

### 2. Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DB_USERNAME`
   - `DB_PASSWORD`

### 3. Configure Environments (Optional but Recommended)

1. Go to **Settings** → **Environments**
2. Create environment: `production`
3. Add protection rules:
   - ✅ Required reviewers
   - ✅ Wait timer (optional)
4. Add environment-specific secrets if needed

### 4. Initial Deployment

**Option A: Manual workflow dispatch**

1. Go to **Actions** → **Complete Deployment Pipeline**
2. Click **Run workflow**
3. Select branch: `main`
4. Click **Run workflow**

**Option B: Automatic on push**

1. Push to `main` branch
2. Workflows run automatically

## 📊 Workflow Decision Tree

```
Push to main
    │
    ├─► Changes in country/** → Lambda Deployment
    │
    ├─► Changes in infra/** → Infrastructure Deployment
    │
    ├─► Changes in migrations/** → Database Migrations
    │
    └─► Any change → CI Pipeline (tests)
```

## 🔄 Deployment Scenarios

### Scenario 1: Update Lambda Code Only

**When**: Application code changes, no infrastructure changes

**Workflow**: `deploy.yml`

```bash
git add country/src/
git commit -m "feat: add new feature"
git push origin main
```

### Scenario 2: Update Infrastructure

**When**: Infrastructure changes (add resources, modify config)

**Workflow**: `infrastructure.yml`

```bash
git add infra/
git commit -m "infra: add new Lambda function"
git push origin main
```

### Scenario 3: Add Database Migration

**When**: Schema changes needed

**Workflow**: `db-migration.yml`

```bash
git add country/src/infrastructure/repositories/db/migrations/
git commit -m "db: add users table"
git push origin main
```

### Scenario 4: Full Deployment

**When**: Major release, initial deployment

**Workflow**: `complete-deployment.yml`

Use manual workflow dispatch or push to `main`

### Scenario 5: Destroy Infrastructure

**When**: Tear down environment

**Workflow**: `infrastructure.yml` (manual, destroy action)

1. Go to **Actions** → **Infrastructure Deployment**
2. Click **Run workflow**
3. Select action: `destroy`
4. ⚠️ Confirm in environment approval

## 🔍 Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab
2. Select workflow
3. Click on run to see details

### Check Deployment Status

```bash
# Using GitHub CLI
gh run list --workflow=infrastructure.yml
gh run view <run-id>

# Check specific workflow
gh workflow view infrastructure.yml
```

### View Logs

- Click on any job in the Actions UI
- Expand steps to see detailed logs
- Download logs for offline review

## 🐛 Troubleshooting

### Infrastructure Deployment Fails

**Issue**: `Error: Inconsistent dependency lock file`

```bash
cd infra
tofu init
git add .terraform.lock.hcl
git commit -m "chore: update tofu lock file"
```

**Issue**: `Error: Invalid AWS credentials`

- Verify secrets are set correctly
- Check IAM user has required permissions
- Ensure credentials haven't expired

### Lambda Deployment Fails

**Issue**: `Function not found`

- Run infrastructure deployment first
- Verify function name matches pattern: `{project}-{env}-{function-name}`

**Issue**: `Package too large`

- Check node_modules size
- Remove dev dependencies: use `npm ci --production`
- Use Lambda layers for large dependencies

### Migration Fails

**Issue**: `Cannot connect to database`

- Verify RDS is publicly accessible
- Check security group allows port 5432
- Ensure database password is correct

**Issue**: `Migration already applied`

- Check migration status: `npm run db:status`
- Review `schema_migrations` table
- Skip duplicate migrations

## 🔒 Security Best Practices

### 1. Use Environment Protection Rules

- Require approvals for production
- Limit who can approve deployments
- Add wait timers for safety

### 2. Rotate Credentials Regularly

```bash
# Rotate AWS credentials every 90 days
aws iam create-access-key --user-name ci-deploy-user
# Update GitHub secrets
# Delete old access key
aws iam delete-access-key --access-key-id OLD_KEY
```

### 3. Use Least Privilege IAM Policies

- Don't use `AdministratorAccess` in production
- Create specific policies for CI/CD user
- Enable MFA for IAM users

### 4. Enable Branch Protection

- Require pull request reviews
- Require status checks to pass
- Restrict who can push to `main`

### 5. Audit Workflow Runs

- Review workflow logs regularly
- Monitor failed deployments
- Check for suspicious activity

## 📈 Cost Optimization

### Free Tier Usage

All CI/CD runs are free on GitHub Actions (2000 minutes/month for public repos, 2000 minutes/month for private repos on free plan).

**Typical usage**:

- CI Pipeline: ~5 minutes/run
- Infrastructure Deploy: ~15 minutes/run
- Lambda Deploy: ~3 minutes/run
- Migrations: ~2 minutes/run

**Estimated**: ~100 minutes/month for normal development

### Reduce AWS Costs

1. **Destroy dev environments when not in use**:

   ```bash
   # Manually trigger destroy workflow
   gh workflow run infrastructure.yml -f action=destroy
   ```

2. **Stop RDS when not needed**:

   ```bash
   aws rds stop-db-instance --db-instance-identifier ct-destination-dev-db
   ```

3. **Use free tier eligible resources** (already configured in `main.tf`)

## 📚 Additional Resources

- [OpenTofu Documentation](https://opentofu.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [AWS Free Tier](https://aws.amazon.com/free/)

## 🎯 Quick Commands

```bash
# Trigger complete deployment
gh workflow run complete-deployment.yml

# Trigger infrastructure only
gh workflow run infrastructure.yml -f action=apply

# Trigger Lambda deployment only
gh workflow run deploy.yml

# Run migrations
gh workflow run db-migration.yml

# Destroy infrastructure
gh workflow run infrastructure.yml -f action=destroy

# View workflow status
gh run list

# View specific run
gh run view <run-id> --log
```

## 📝 Workflow Status Badges

Add these to your README.md:

```markdown
![CI Pipeline](https://github.com/YOUR_USERNAME/ct-destination-app/actions/workflows/ci.yml/badge.svg)
![Infrastructure](https://github.com/YOUR_USERNAME/ct-destination-app/actions/workflows/infrastructure.yml/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/ct-destination-app/actions/workflows/deploy.yml/badge.svg)
```

## 🔄 Rollback Procedures

### Rollback Lambda Function

```bash
# Get previous version
aws lambda list-versions-by-function --function-name ct-destination-dev-list-country-info

# Rollback to version
aws lambda update-alias \
  --function-name ct-destination-dev-list-country-info \
  --name production \
  --function-version <previous-version>
```

### Rollback Infrastructure

```bash
# Revert infrastructure changes
git revert <commit-hash>
git push origin main

# Or manually with OpenTofu
cd infra
git checkout <previous-commit> -- main.tf
tofu apply
```

### Rollback Database

```bash
# Manual rollback required
# Connect to database and run rollback SQL
psql $DATABASE_URL < rollback.sql
```

## ✅ Pre-deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested locally
- [ ] Environment variables configured
- [ ] AWS credentials valid
- [ ] Free tier limits checked
- [ ] Backup taken (if production)
- [ ] Rollback plan ready
- [ ] Monitoring enabled
- [ ] Team notified

Happy Deploying! 🚀
