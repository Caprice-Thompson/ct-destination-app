#!/bin/bash

# Exit if any command fails
set -e

# Configuration
MIGRATIONS_PATH="./src/infrastructure/repositories/db/migrations"
MIGRATIONS_TABLE="schema_migrations"
EXCLUDE_PATH="prisma_migrations"

# Check if running in production
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Running in production mode - fetching credentials from AWS SSM Parameter Store"
    
    # Fetch RDS credentials from AWS SSM Parameter Store
    DB_USER=$(aws ssm get-parameter --name "/county/main/db/db_username" --query "Parameter.Value" --output text)
    DB_PASSWORD=$(aws ssm get-parameter --name "/county/main/db/db_password" --with-decryption --query "Parameter.Value" --output text)
    DB_HOST=${DB_HOST:-$(aws ssm get-parameter --name "/county/main/db/RDS_ENDPOINT" --query "Parameter.Value" --output text)}
    DB_NAME=${DB_NAME:-"country"}
    DB_PORT=${DB_PORT:-5432}
    
    # Construct DATABASE_URL with SSL mode for production
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"
else
    echo "Running in local mode - loading credentials from .env files"
    
    # Load environment variables from .env.local if it exists
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    # Load environment variables from .env if it exists
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    # Parse DATABASE_URL to extract connection parameters
    if [ -z "$DATABASE_URL" ]; then
        echo "ERROR: DATABASE_URL is not set"
        exit 1
    fi
fi

# Extract connection details from DATABASE_URL (for local mode)
if [ "$ENVIRONMENT" != "production" ]; then
    # Format: postgresql://user:password@host:port/database
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    exit 1
}

# Function to validate version format (V1__, V2__, etc.)
validate_version_format() {
    local version=$1
    # Allow any filename format for flexibility
    return 0
}

# Function to extract version number for sorting
get_version_number() {
    local version=$1
    echo "$version" | sed 's/[^0-9]//g'
}

# Function to validate SQL file
validate_sql_file() {
    local file=$1
    if [[ ! -f "$file" ]]; then
        error "File not found: $file"
    fi
    if [[ ! "$file" =~ \.sql$ ]]; then
        error "Not a SQL file: $file"
    fi
}

# Function to create migrations table if it doesn't exist
create_migrations_table() {
    log "Checking migrations table..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
        CREATE TABLE IF NOT EXISTS $MIGRATIONS_TABLE (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );" || error "Failed to create migrations table"
}

# Function to get applied migrations
get_applied_migrations() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
        SELECT version FROM $MIGRATIONS_TABLE ORDER BY version;" | tr -d ' ' || echo ""
}

# Function to apply a single migration
apply_migration() {
    local file=$1
    local filename=$(basename "$file" .sql)
    
    log "Applying migration: $filename"
    
    # Apply migration in a transaction
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    BEGIN;
    \i $file
    INSERT INTO $MIGRATIONS_TABLE (version, name) VALUES ('$filename', '$filename');
    COMMIT;
EOF
    
    if [ $? -eq 0 ]; then
        log "Successfully applied migration: $filename"
    else
        error "Failed to apply migration: $filename"
    fi
}

# Main execution
main() {
    log "Starting database migrations..."
    log "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
    
    # Validate database connection
    log "Testing database connection..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1 || error "Cannot connect to database"

    # Create migrations table if it doesn't exist
    create_migrations_table

    # Get list of applied migrations
    applied_migrations=$(get_applied_migrations)
    
    # Get and sort migration files
    log "Finding migration files..."
    # Find all SQL files that match the pattern (numbered prefix)
    migration_files=$(find "$MIGRATIONS_PATH" -type f -name "*.sql" \
        -not -path "$MIGRATIONS_PATH/$EXCLUDE_PATH/*" \
        -not -path "$MIGRATIONS_PATH/$EXCLUDE_PATH" \
        | sort -t'/' -k1 -V)
    
    if [ -z "$migration_files" ]; then
        log "No migration files found in $MIGRATIONS_PATH"
        exit 0
    fi

    # Apply migrations
    migrations_applied=0
    for migration in $migration_files; do
        filename=$(basename "$migration" .sql)
        
        # Skip if migration is already applied
        if echo "$applied_migrations" | grep -q "^$filename$"; then
            log "Skipping already applied migration: $filename"
            continue
        fi
        
        validate_sql_file "$migration"
        apply_migration "$migration"
        migrations_applied=$((migrations_applied + 1))
    done

    if [ $migrations_applied -eq 0 ]; then
        log "No new migrations to apply"
    else
        log "Applied $migrations_applied new migration(s)"
    fi
    
    log "All migrations completed successfully"
}

# Run main function
main
