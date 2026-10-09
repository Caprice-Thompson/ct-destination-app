# Data Scrape Migrations

Loads committed CSV seed data into local Docker Postgres and DynamoDB.
Use this after `docker compose up` so every clone gets the same baseline data.

## Prerequisites

From the repo root:

```bash
docker compose up -d
```

## Setup

1. Copy the env template:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

## Running the Migration

Seed from committed CSVs (Postgres + weather DynamoDB):

```bash
./run.sh seed
```

Full seed including country info from the REST Countries API:

```bash
./run.sh
# or
./run.sh all
```

`all` requires `REST_COUNTRIES_AUTHORIZATION` in `.env.local`.

Run one import:

```bash
./run.sh city
./run.sh national-dishes
./run.sh unesco
./run.sh weather
./run.sh countries
```

Or use npm:

```bash
npm run migrate:seed
npm run migrate:all
npm run migrate:city
npm run migrate:national-dishes
npm run migrate:unesco
npm run migrate:weather
npm run migrate:countries
```

`run.sh` loads `DATABASE_URL` from `data-scrape/.env.local`, or falls back to the repo root `.env.local`.

## CSV Files

Committed under `src/data/`:

- `city_population.csv` → Postgres `city_populations`
- `national_dishes.csv` → Postgres `national_dish`
- `unesco_sites.csv` → Postgres `unesco_sites`
- `european_daily_weather_2025_v2.csv` → DynamoDB `weather_data`

Do not rely on local Docker volume contents (`docker/dynamodb/`) for sharing data — always seed from these files.

## Notes

- City, national dish, and weather imports can be rerun safely.
- UNESCO import reloads the table to avoid duplicates.
- Empty national dish `image_url` and `description` values are stored as `NULL`.
- Keep `.env.local` private; only `.env.example` is committed.
