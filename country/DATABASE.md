# Database Setup Guide

This guide covers setting up local PostgreSQL development and managing migrations across different environments.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Running Migrations](#running-migrations)
- [Database Management](#database-management)
- [Environment Configuration](#environment-configuration)
- [Connecting to Remote Databases](#connecting-to-remote-databases)

## Local Development Setup

### Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed
- PostgreSQL client tools (psql) - optional but recommended

### Quick Start

1. **Copy environment configuration:**

   ```bash
   cd country
   cp .env.example .env.local
   ```

2. **Start the local PostgreSQL database:**

   ```bash
   npm run db:start
   ```

   This starts a PostgreSQL 15 container with the configuration from `.env.local`.

3. **Run migrations:**

   ```bash
   npm run db:migrate
   ```

4. **Verify the setup:**
   ```bash
   npm run db:status
   ```

### Docker Setup Details

The `docker-compose.yml` file at the project root configures:

- **PostgreSQL 15 Alpine** for a lightweight database
- **Persistent volume** (`postgres_data`) for data persistence
- **Health checks** to ensure database is ready
- **Port mapping** (default: 5432)

Container details:

- Container name: `country-service-db`
- Network: `country-network`
- Restart policy: `unless-stopped`

## Running Migrations

### Migration File Structure

Migrations are located in `src/infrastructure/repositories/db/migrations/` and should follow this naming convention:

```
001_create_population_table.sql
002_create_national_dish_table.sql
003_add_new_feature.sql
```

Files are executed in alphabetical/numerical order.

### Migration Commands

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:status

# View migration history
npm run db:shell
SELECT * FROM schema_migrations ORDER BY applied_at DESC;
\q
```

### How Migrations Work

The `runMigrations.sh` script:

1. Reads `DATABASE_URL` from environment variables
2. Creates `schema_migrations` tracking table if it doesn't exist
3. Finds all `.sql` files in the migrations directory
4. Skips already-applied migrations
5. Applies new migrations in a transaction
6. Records each migration in the tracking table

Each migration runs in its own transaction, so if a migration fails, it will be rolled back automatically.

## Database Management

### Available Commands

```bash
# Start database
npm run db:start

# Stop database (data persists)
npm run db:stop

# Restart database
npm run db:restart

# View logs
npm run db:logs

# Run migrations
npm run db:migrate

# Check migration status
npm run db:status

# Open PostgreSQL shell
npm run db:shell
```

### Accessing the Database

**Using npm script:**

```bash
npm run db:shell
```

**Direct psql connection:**

```bash
psql postgresql://dev_user:dev_password@localhost:5432/country_db
```

**Using a GUI tool:**

- Host: `localhost`
- Port: `5432`
- Database: `country_db`
- Username: `dev_user`
- Password: `dev_password`

Recommended GUI tools:

- [pgAdmin](https://www.pgadmin.org/)
- [TablePlus](https://tableplus.com/)
- [DBeaver](https://dbeaver.io/)

### Resetting Local Database

```bash
# Stop and remove the database container
cd ..
docker-compose down -v postgres

# Start fresh and run migrations
cd country
npm run db:start
npm run db:migrate
```

### Environment Priority

The application loads configuration in this order:

1. `.env.local` (local development)
2. System environment variables (staging/production)
3. Defaults in `config.ts`

**Never commit `.env.local` or files with real credentials!**

## Connecting to Remote Databases

### Security Best Practices

**❌ DON'T:**

- Point your local development directly at production RDS
- Store production credentials in `.env.local`
- Run untested migrations directly on production
- Commit environment files with real credentials

**✅ DO:**

- Use local PostgreSQL for development
- Connect to remote databases through VPN/bastion host
- Use read-only credentials when inspecting production
- Test migrations on staging before production
- Use CI/CD pipelines for production deployments

### Connecting to RDS (When Necessary)

If your RDS is in a private subnet (recommended):

1. **Connect via SSH tunnel (bastion host):**

   ```bash
   # Terminal 1: Create SSH tunnel
   ssh -L 5433:prod-rds.region.rds.amazonaws.com:5432 user@bastion-host

   # Terminal 2: Connect through tunnel
   psql postgresql://user:password@localhost:5433/country_db
   ```

2. **Connect via VPN:**
   ```bash
   # Connect to VPN first, then:
   psql postgresql://user:password@prod-rds.region.rds.amazonaws.com:5432/country_db
   ```

### Running Migrations on Remote Databases

**Staging:**

```bash
# Load staging environment
export $(cat .env.staging | xargs)
npm run db:migrate
```

**Production (via CI/CD only):**

```yaml
# Example GitHub Actions workflow
- name: Run migrations
  env:
    DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
  run: |
    cd country
    npm run db:migrate
```

### Read-Only Access for Debugging

When you need to inspect production data:

1. Request read-only credentials from your DBA/DevOps team
2. Use a separate connection string
3. Never run write operations

```bash
# Read-only connection
export DATABASE_URL=postgresql://readonly_user:pass@prod-rds.region.rds.amazonaws.com:5432/country_db
npm run db:shell
```

## Troubleshooting

### Database won't start

```bash
# Check if port 5432 is already in use
lsof -i :5432

# View Docker logs
npm run db:logs

# Restart everything
npm run db:stop
npm run db:start
```

### Migration fails

```bash
# Check migration status
npm run db:status

# Check the migration file for syntax errors
cat src/infrastructure/repositories/db/migrations/XXX_migration.sql

# If needed, manually rollback in psql
npm run db:shell
DELETE FROM schema_migrations WHERE version = 'XXX_migration';
# Then fix the migration file and re-run
```

### Can't connect to database

```bash
# Check if Docker container is running
docker ps | grep country-service-db

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify environment variables
echo $DATABASE_URL
```

### SSL Connection Issues

For remote databases requiring SSL:

```bash
# Make sure SSL is enabled in your environment
export DB_USE_SSL=true

# Or update your DATABASE_URL to include SSL parameter
export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Best Practices

1. **Always develop locally** - Use Docker PostgreSQL for day-to-day development
2. **Test migrations** - Run migrations on local first, then staging, then production
3. **Make migrations reversible** - Consider including rollback scripts
4. **Keep migrations small** - One logical change per migration file
5. **Don't modify applied migrations** - Create new migrations to fix issues
6. **Use transactions** - Each migration should be atomic
7. **Document complex changes** - Add comments to SQL files explaining the "why"
8. **Backup before production** - Always have a backup before running migrations

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
