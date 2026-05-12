#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS country;
    CREATE SCHEMA IF NOT EXISTS tourism;
    
    GRANT ALL PRIVILEGES ON SCHEMA country TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON SCHEMA tourism TO "$POSTGRES_USER";
    
    ALTER USER "$POSTGRES_USER" SET search_path TO country, tourism, public;
EOSQL

echo "Database schemas 'country' and 'tourism' created successfully"
