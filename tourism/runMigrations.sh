#!/bin/bash

set -e

MIGRATIONS_PATH="./src/infrastructure/repositories/db/migrations"
MIGRATIONS_TABLE="schema_migrations"
EXCLUDE_PATH="prisma_migrations"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "Running in production mode - fetching credentials from AWS SSM Parameter Store"
    
    AWS_REGION=${AWS_REGION:-"eu-west-2"}
    
    DB_USER=$(aws ssm get-parameter --name "/main/db/USERNAME" --region "$AWS_REGION" --query "Parameter.Value" --output text)
    DB_PASSWORD=$(aws ssm get-parameter --name "/main/db/PASSWORD" --with-decryption --region "$AWS_REGION" --query "Parameter.Value" --output text)
    DB_HOST=${DB_HOST:-$(aws ssm get-parameter --name "/tourism/db/RDS_ENDPOINT" --region "$AWS_REGION" --query "Parameter.Value" --output text)}
    DB_NAME=${DB_NAME:-"tourism"}
    DB_PORT=${DB_PORT:-5432}
    
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"
else
    echo "Running in local mode - loading credentials from .env files"
    
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo "ERROR: DATABASE_URL is not set"
        exit 1
    fi
fi

if [ "$ENVIRONMENT" != "production" ]; then
    if [ -z "$DB_HOST" ]; then
        DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    fi
fi

SCHEMA=${DB_SCHEMA:-tourism}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    exit 1
}

validate_version_format() {
    local version=$1
    return 0
}

get_version_number() {
    local version=$1
    echo "$version" | sed 's/[^0-9]//g'
}

validate_sql_file() {
    local file=$1
    if [[ ! -f "$file" ]]; then
        error "File not found: $file"
    fi
    if [[ ! "$file" =~ \.sql$ ]]; then
        error "Not a SQL file: $file"
    fi
}

create_migrations_table() {
    log "Checking migrations table in schema $SCHEMA..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
        SET search_path TO $SCHEMA;
        CREATE TABLE IF NOT EXISTS $MIGRATIONS_TABLE (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );" || error "Failed to create migrations table"
}

get_applied_migrations() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
        SET search_path TO $SCHEMA;
        SELECT version FROM $MIGRATIONS_TABLE ORDER BY version;" | tr -d ' ' || echo ""
}

apply_migration() {
    local file=$1
    local filename=$(basename "$file" .sql)
    
    log "Applying migration: $filename in schema $SCHEMA"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    SET search_path TO $SCHEMA;
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

main() {
    log "Starting database migrations for schema: $SCHEMA..."
    log "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
    
    log "Testing database connection..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1 || error "Cannot connect to database"

    create_migrations_table

    applied_migrations=$(get_applied_migrations)
    
    log "Finding migration files..."
    migration_files=$(find "$MIGRATIONS_PATH" -type f -name "*.sql" \
        -not -path "$MIGRATIONS_PATH/$EXCLUDE_PATH/*" \
        -not -path "$MIGRATIONS_PATH/$EXCLUDE_PATH" \
        | sort -t'/' -k1 -V)
    
    if [ -z "$migration_files" ]; then
        log "No migration files found in $MIGRATIONS_PATH"
        exit 0
    fi

    migrations_applied=0
    for migration in $migration_files; do
        filename=$(basename "$migration" .sql)
        
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

main
