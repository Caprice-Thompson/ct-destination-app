# Data Scrape Migrations

This folder loads CSV data into the local Docker Postgres database.

## Prerequisites

From the repo root, start Postgres:

```bash
docker compose up -d postgres
```

## Setup

1. Copy the env template and set your database URL:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

## Running the Migration

Run all CSV imports:

```bash
./run.sh
```

Run one import:

```bash
./run.sh city
./run.sh national-dishes
./run.sh unesco
```

You can also use npm directly:

```bash
npm run migrate:all
npm run migrate:city
npm run migrate:national-dishes
npm run migrate:unesco
```

`run.sh` loads `DATABASE_URL` from `data-scrape/.env.local`, or falls back to the repo root `.env.local`.

## CSV Files

- `city_population.csv` loads into `city_populations`.
- `national_dishes.csv` loads into `national_dish`.
- `unesco_sites.csv` loads into `unesco_sites`.

## Notes

- City and national dish imports use upserts so they can be rerun.
- UNESCO import reloads the table to avoid duplicates.
- Empty national dish `image_url` and `description` values are stored as `NULL`.
