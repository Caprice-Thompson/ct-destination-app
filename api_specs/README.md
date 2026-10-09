# API specs (OpenAPI + Backstage)

Minimal Backstage app for **OpenAPI documentation only**.

## Setup

```bash
cd destination-app
yarn install
yarn start
```

Open http://localhost:3000 → **Catalog** → **destination-rest-api** (Definition tab) or sidebar **API Docs**.

## Maintain the spec

1. Edit [`destination-app/examples/destination-app.openapi.yaml`](./destination-app/examples/destination-app.openapi.yaml)
2. Run `yarn sync:openapi-catalog` (or restart with `yarn start`, which runs it via `prestart`)

## What is committed

| Path | Purpose |
|------|---------|
| `destination-app/examples/destination-app.openapi.yaml` | Source OpenAPI spec |
| `destination-app/examples/destination-catalog.yaml` | System + component catalog |
| `destination-app/examples/org.yaml` | `guests` owner group |
| `destination-app/` (app packages, config, yarn.lock) | Backstage runtime |

`destination-api-inline.yaml` is **generated** and gitignored.
