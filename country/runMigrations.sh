#!/bin/bash

# Exit if any command fails
set -e

# Configuration
MIGRATIONS_PATH="./migrations"
MIGRATIONS_TABLE="schema_migrations"
EXCLUDE_PATH="prisma_migrations"

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
    if [[ ! "$version" =~ ^V[0-9]+__$ ]]; then
        error "Invalid version format: $version. Must be in format V1__, V2__, etc."
    fi
}

# Function to extract version number for sorting
get_version_number() {
    local version=$1
    echo "$version" | sed 's/V//' | sed 's/__//'
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
    
    # Validate filename format (V1__description.sql)
    local filename=$(basename "$file" .sql)
    local version=$(echo "$filename" | cut -d'__' -f1)
    validate_version_format "$version"
}

# Function to create migrations table if it doesn't exist
create_migrations_table() {
    log "Checking migrations table..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "
        CREATE TABLE IF NOT EXISTS $MIGRATIONS_TABLE (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );" || error "Failed to create migrations table"
}

# Function to get applied migrations
get_applied_migrations() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "
        SELECT version FROM $MIGRATIONS_TABLE ORDER BY version;" | tr -d ' ' || echo ""
}

# Function to apply a single migration
apply_migration() {
    local file=$1
    local filename=$(basename "$file" .sql)
    local version=$(echo "$filename" | cut -d'__' -f1)
    local name=$(echo "$filename" | cut -d'__' -f2-)
    
    log "Applying migration: $version - $name"
    
    # Start transaction
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME << EOF
    BEGIN;
    \i $file
    INSERT INTO $MIGRATIONS_TABLE (version, name) VALUES ('$version', '$name');
    COMMIT;
EOF
    
    if [ $? -eq 0 ]; then
        log "Successfully applied migration: $version"
    else
        error "Failed to apply migration: $version"
    fi
}

# Main execution
main() {
    # Validate database connection
    log "Testing database connection..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1 || error "Cannot connect to database"

    # Create migrations table if it doesn't exist
    create_migrations_table

    # Get list of applied migrations
    applied_migrations=$(get_applied_migrations)
    
    # Get and sort migration files
    log "Finding migration files..."
    # Find all SQL files, exclude prisma_migrations directory, and sort by version number
    migration_files=$(find "$MIGRATIONS_PATH" -type f -name "V*__.sql" \
        -not -path "$MIGRATIONS_PATH/$EXCLUDE_PATH/*" \
        -not -path "$MIGRATIONS_PATH/$EXCLUDE_PATH" \
        | sort -V -k1,1 -t'/' --key=5.2n)
    
    if [ -z "$migration_files" ]; then
        log "No migration files found in $MIGRATIONS_PATH"
        exit 0
    fi

    # Apply migrations
    for migration in $migration_files; do
        version=$(basename "$migration" .sql | cut -d'__' -f1)
        validate_version_format "$version"
        
        # Skip if migration is already applied
        if echo "$applied_migrations" | grep -q "^$version$"; then
            log "Skipping already applied migration: $version"
            continue
        fi
        
        validate_sql_file "$migration"
        apply_migration "$migration"
    done

    log "All migrations completed successfully"
}

# Run main function
main
