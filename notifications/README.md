# Notifications Service

Lambda service that for now returns earthquake notifications for authenticated users. It tracks each user's last check time and returns only events that occurred since then.

## API

**Endpoint:** `GET /notifications`

**Headers:**

- `Authorization` (required): `Bearer <supabase-access-token>`

**Example:**

```bash
GET /notifications
Authorization: Bearer <token>
```

**Response:**

```json
{
  "newEvents": [
    {
      "id": "eq-1",
      "magnitude": 4.2,
      "location": "Near Lisbon, Portugal",
      "occurredAt": "2026-06-17T11:30:00.000Z"
    }
  ],
  "lastChecked": "2026-06-17T12:00:00.000Z"
}
```

On a user's first request, no historical events are returned. The service records the current time as their baseline for future polls.

## Architecture

The service follows Clean Architecture:

- **API Layer**: Lambda handlers and auth
- **Application Layer**: Use cases and validation
- **Domain Layer**: Notification and earthquake event entities
- **Infrastructure Layer**: PostgreSQL (user check timestamps) and the earthquakes API client

Earthquake data is fetched from the earthquakes service via `GET /api/earthquakes/since?since=<timestamp>`, not from DynamoDB directly.

## Environment Variables

```
SERVICE_NAME=notifications-service
DATABASE_URL=postgres://...
EARTHQUAKES_API_URL=http://localhost:3001/api/earthquakes/since
```

## Development

```bash
npm install
npm run build
npm test
```
