# Local API Server

This server allows you to run the Lambda functions locally for development.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Make sure all backend services have their dependencies installed:

```bash
# From the root of the project
cd country && npm install && cd ..
cd tourism && npm install && cd ..
cd earthquakes && npm install && cd ..
```

3. Build the TypeScript code for each service:

```bash
cd country && npm run build && cd ..
cd tourism && npm run build && cd ..
cd earthquakes && npm run build && cd ..
```

## Running the Server

Start the local API server:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Available Endpoints

- `GET /api/countries?countryName=Spain` - Get country information
- `GET /api/tourism?countryName=Spain` - Get tourism/UNESCO sites
- `GET /api/earthquakes?countryName=Spain&month=1` - Get recent earthquakes
- `GET /api/earthquakes/statistics?countryName=Spain&month=1` - Get earthquake statistics
- `GET /health` - Health check

## Frontend Configuration

Update your frontend's Vite config to proxy API requests to this server during development.
