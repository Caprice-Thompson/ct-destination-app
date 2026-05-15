# Destination App Frontend

React frontend for searching destination data across the country, tourism, earthquakes, and weather services.

## Setup

Install dependencies:

```bash
npm install
```

Start the local API server from the project root:

```bash
cd local-server
npm run dev
```

Start the frontend:

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:3001`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Structure

- `src/pages`: Route-level pages
- `src/components`: Reusable UI components
- `src/routes`: TanStack Router route definitions
- `src/hooks`: Shared React hooks
- `src/lib`: External client setup

## Data Flow

The home page collects a country and month, fetches all destination data through `src/pages/api.ts`, then caches the combined result with React Query for the dashboard.
