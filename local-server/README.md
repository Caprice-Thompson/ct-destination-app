# Local API Server

Express server for running the Lambda services locally during development.

## Setup

Install dependencies:

```bash
npm install
```

Install service dependencies from the project root:

```bash
cd country && npm install && cd ..
cd tourism && npm install && cd ..
cd earthquakes && npm install && cd ..
cd weather && npm install && cd ..
```

Build all services:

```bash
npm run build
```

## Development

Start the local server:

```bash
npm run dev
```

The server runs on `http://localhost:3001`.

## Mock Data

To use local mock data instead of calling the built Lambda handlers, set this in `.env.local`:

```bash
USE_MOCK_DATA=true
```

Mock data is available for Spain, Japan, and Italy.

## Available Endpoints

- `GET /api/countries?countryName=Spain` - Get country information
- `GET /api/tourism?countryName=Spain` - Get tourism/UNESCO sites
- `GET /api/earthquakes?countryName=Spain` - Get recent earthquakes
- `GET /api/earthquakes/statistics?countryName=Spain&month=1` - Get earthquake statistics
- `GET /api/weather?countryName=Spain&month=1` - Get monthly weather summary
- `GET /health` - Health check

## Frontend Configuration

Update your frontend's Vite config to proxy API requests to this server during development.
