#!/usr/bin/env bash

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET="${1:-all}"
ENV_SOURCE=""

load_env_file() {
    local env_file="$1"

    if [ -f "$env_file" ]; then
        set +u
        set -a
        # shellcheck disable=SC1090
        . "$env_file"
        set +a
        set -u
        ENV_SOURCE="$env_file"
    fi
}

echo -e "${GREEN}Data scrape migration runner${NC}"
echo ""

if [ -z "${DATABASE_URL:-}" ]; then
    load_env_file "$SCRIPT_DIR/.env.local"
fi

if [ -z "${DATABASE_URL:-}" ]; then
    load_env_file "$REPO_ROOT/.env.local"
fi

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL is not set."
    echo "Copy data-scrape/.env.example to data-scrape/.env.local and set DATABASE_URL."
    exit 1
fi

export DATABASE_URL

if [ -n "$ENV_SOURCE" ]; then
    echo -e "${GREEN}Loaded database config from ${ENV_SOURCE}${NC}"
else
    echo -e "${GREEN}Using DATABASE_URL from environment${NC}"
fi
echo ""

if command -v docker >/dev/null 2>&1; then
    PG_USER="${DB_USER:-destination-user}"
    PG_DB="${DB_NAME:-destination_db}"

    echo -e "${GREEN}Starting Docker Postgres...${NC}"
    (cd "$REPO_ROOT" && docker compose up -d postgres)

    echo -e "${GREEN}Waiting for Postgres to be ready...${NC}"
    for _ in {1..30}; do
        if (cd "$REPO_ROOT" && docker compose exec -T postgres pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null 2>&1); then
            break
        fi
        sleep 1
    done
else
    echo -e "${YELLOW}Docker is not installed or not on PATH; assuming the database is already running.${NC}"
fi

cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

export REST_COUNTRIES_AUTHORIZATION="${REST_COUNTRIES_AUTHORIZATION:-}"
export REST_COUNTRIES_API_URL="${REST_COUNTRIES_API_URL:-https://api.restcountries.com/countries/v5}"

case "$TARGET" in
    all|city|national-dishes|unesco|countries)
        echo -e "${GREEN}Running ${TARGET} migrations...${NC}"
        npm run "migrate:${TARGET}"
        ;;
    *)
        echo "Unknown migration target: $TARGET"
        echo "Usage: ./run.sh [all|city|national-dishes|unesco|countries]"
        exit 1
        ;;
esac

echo -e "${GREEN}Done.${NC}"
