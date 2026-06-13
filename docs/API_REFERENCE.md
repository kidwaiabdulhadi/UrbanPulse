# UrbanPulse AI — API Reference

> **Version:** 1.0.0 · **Last Updated:** 2026-06-13 · **Status:** Stable

This document covers all HTTP and WebSocket endpoints exposed by the UrbanPulse AI platform across its three services: the **Core API**, the **AI Inference Service**, and the **Agent Service**.

---

## Table of Contents

1. [Base URLs](#base-urls)
2. [Authentication](#authentication)
3. [Core API Endpoints (`:8000`)](#core-api-endpoints-8000)
   - [GET /api/v1/stations](#get-apiv1stations)
   - [GET /api/v1/stations/{station\_id}](#get-apiv1stationsstation_id)
   - [GET /api/v1/stations/{station\_id}/history](#get-apiv1stationsstation_idhistory)
   - [WS /ws/telemetry](#ws-wstelemetry)
   - [GET /api/v1/notifications](#get-apiv1notifications)
4. [AI Inference Endpoints (`:8002`)](#ai-inference-endpoints-8002)
   - [POST /api/v1/forecast](#post-apiv1forecast)
   - [POST /api/v1/simulate](#post-apiv1simulate)
   - [GET /api/v1/forecast/{station\_id}/shap](#get-apiv1forecaststation_idshap)
5. [Agent Service Endpoints (`:8003`)](#agent-service-endpoints-8003)
   - [POST /api/v1/agent/chat](#post-apiv1agentchat)
   - [GET /api/v1/agent/suggestions](#get-apiv1agentsuggestions)
6. [Error Codes](#error-codes)
7. [Rate Limits](#rate-limits)

---

## Base URLs

| Service            | Base URL                  | Description                                      |
|--------------------|---------------------------|--------------------------------------------------|
| **Core API**       | `http://localhost:8000`   | Station data, telemetry streams, notifications   |
| **AI Inference**   | `http://localhost:8002`   | Forecasting, simulation, SHAP attribution        |
| **Agent Service**  | `http://localhost:8003`   | Conversational AI agent, contextual suggestions  |

> **Production deployments** should replace `localhost` with the appropriate domain and enforce TLS (`https://` / `wss://`).

---

## Authentication

All protected endpoints require a valid **Bearer token** issued by the auth endpoint.

### Token Header Format

```
Authorization: Bearer <access_token>
```

Tokens are **JWT-based** and expire after the duration specified in the `expires_in` field of the token response. Clients should refresh tokens before expiry to avoid interruption.

---

### POST /api/v1/auth/token

Authenticate a user and obtain a bearer token.

- **URL:** `http://localhost:8000/api/v1/auth/token`
- **Auth required:** No
- **Content-Type:** `application/json`

#### Request Body

| Field      | Type     | Required | Description              |
|------------|----------|----------|--------------------------|
| `email`    | `string` | ✅ Yes   | Registered user email    |
| `password` | `string` | ✅ Yes   | User account password    |

```json
{
  "email": "operator@urbanpulse.ai",
  "password": "s3cur3P@ssw0rd"
}
```

#### Response Body

| Field          | Type      | Description                              |
|----------------|-----------|------------------------------------------|
| `access_token` | `string`  | JWT bearer token                         |
| `token_type`   | `string`  | Always `"bearer"`                        |
| `expires_in`   | `integer` | Token lifetime in seconds (e.g. `3600`) |

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcGVyYXRvckB1cmJhbnB1bHNlLmFpIiwiZXhwIjoxNzQ5ODE4MDAwfQ.abc123signature",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@urbanpulse.ai",
    "password": "s3cur3P@ssw0rd"
  }'
```

#### Error Responses

| Status | Meaning                             |
|--------|-------------------------------------|
| `401`  | Invalid credentials                 |
| `422`  | Missing or malformed request fields |

---

## Core API Endpoints (`:8000`)

Base URL: `http://localhost:8000`

All endpoints in this section require `Authorization: Bearer <token>` unless noted.

---

### GET /api/v1/stations

Retrieve a list of all monitored stations along with their current occupancy status.

- **URL:** `http://localhost:8000/api/v1/stations`
- **Auth required:** Yes
- **Method:** `GET`

#### Query Parameters

| Parameter  | Type      | Required | Default | Description                                    |
|------------|-----------|----------|---------|------------------------------------------------|
| `limit`    | `integer` | No       | `100`   | Maximum number of stations to return           |
| `offset`   | `integer` | No       | `0`     | Pagination offset                              |
| `active`   | `boolean` | No       | `true`  | Filter to only active (online) stations        |

#### Response Schema

Returns a paginated list of station objects.

| Field                    | Type      | Description                                                        |
|--------------------------|-----------|--------------------------------------------------------------------|
| `total`                  | `integer` | Total number of stations matching the query                        |
| `stations`               | `array`   | Array of station objects                                           |
| `stations[].station_id`  | `string`  | Unique station identifier (e.g. `"STN-042"`)                      |
| `stations[].name`        | `string`  | Human-readable station name                                        |
| `stations[].location`    | `object`  | Geographic coordinates `{ lat, lng }`                             |
| `stations[].capacity`    | `integer` | Maximum occupancy capacity                                         |
| `stations[].occupancy`   | `integer` | Current real-time occupancy count                                  |
| `stations[].utilization` | `float`   | Occupancy as a fraction of capacity (0.0–1.0)                     |
| `stations[].status`      | `string`  | Operational status: `"normal"`, `"warning"`, `"critical"`         |
| `stations[].last_updated`| `string`  | ISO 8601 timestamp of the last telemetry update                   |

#### Response Example

```json
{
  "total": 3,
  "stations": [
    {
      "station_id": "STN-001",
      "name": "Central Junction",
      "location": { "lat": 51.5074, "lng": -0.1278 },
      "capacity": 800,
      "occupancy": 612,
      "utilization": 0.765,
      "status": "warning",
      "last_updated": "2026-06-13T09:10:05Z"
    },
    {
      "station_id": "STN-042",
      "name": "Northgate Terminal",
      "location": { "lat": 51.5231, "lng": -0.1115 },
      "capacity": 500,
      "occupancy": 198,
      "utilization": 0.396,
      "status": "normal",
      "last_updated": "2026-06-13T09:10:03Z"
    },
    {
      "station_id": "STN-077",
      "name": "Riverside Platform",
      "location": { "lat": 51.4995, "lng": -0.1198 },
      "capacity": 350,
      "occupancy": 341,
      "utilization": 0.974,
      "status": "critical",
      "last_updated": "2026-06-13T09:10:07Z"
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/stations?active=true&limit=50" \
  -H "Authorization: Bearer <access_token>"
```

---

### GET /api/v1/stations/{station_id}

Retrieve full details for a single station by its unique identifier.

- **URL:** `http://localhost:8000/api/v1/stations/{station_id}`
- **Auth required:** Yes
- **Method:** `GET`

#### Path Parameters

| Parameter    | Type     | Required | Description                          |
|--------------|----------|----------|--------------------------------------|
| `station_id` | `string` | ✅ Yes   | The unique station ID (e.g. `STN-042`) |

#### Response Schema

Returns a single station object with extended metadata.

| Field                  | Type      | Description                                              |
|------------------------|-----------|----------------------------------------------------------|
| `station_id`           | `string`  | Unique station identifier                                |
| `name`                 | `string`  | Human-readable name                                      |
| `location`             | `object`  | `{ lat, lng, address }`                                  |
| `capacity`             | `integer` | Maximum occupancy                                        |
| `occupancy`            | `integer` | Current occupancy                                        |
| `utilization`          | `float`   | Fraction of capacity in use                              |
| `status`               | `string`  | `"normal"`, `"warning"`, or `"critical"`                |
| `last_updated`         | `string`  | ISO 8601 timestamp                                       |
| `sensors`              | `array`   | List of active sensor IDs reporting to this station     |
| `alert_thresholds`     | `object`  | `{ warning: float, critical: float }` utilization thresholds |
| `avg_dwell_minutes`    | `float`   | Average passenger dwell time in minutes                 |
| `peak_hour`            | `string`  | Hour of day with historically highest occupancy          |

#### Response Example

```json
{
  "station_id": "STN-042",
  "name": "Northgate Terminal",
  "location": {
    "lat": 51.5231,
    "lng": -0.1115,
    "address": "14 Northgate Road, London, N1 2AB"
  },
  "capacity": 500,
  "occupancy": 198,
  "utilization": 0.396,
  "status": "normal",
  "last_updated": "2026-06-13T09:10:03Z",
  "sensors": ["SNS-042-A", "SNS-042-B", "SNS-042-C"],
  "alert_thresholds": {
    "warning": 0.75,
    "critical": 0.90
  },
  "avg_dwell_minutes": 4.2,
  "peak_hour": "08:00"
}
```

#### cURL Example

```bash
curl -X GET http://localhost:8000/api/v1/stations/STN-042 \
  -H "Authorization: Bearer <access_token>"
```

#### Error Responses

| Status | Meaning                          |
|--------|----------------------------------|
| `404`  | Station ID not found             |

---

### GET /api/v1/stations/{station_id}/history

Retrieve a time-series array of historical occupancy readings for a station within a specified time window.

- **URL:** `http://localhost:8000/api/v1/stations/{station_id}/history`
- **Auth required:** Yes
- **Method:** `GET`

#### Path Parameters

| Parameter    | Type     | Required | Description              |
|--------------|----------|----------|--------------------------|
| `station_id` | `string` | ✅ Yes   | Unique station identifier |

#### Query Parameters

| Parameter  | Type     | Required | Default  | Description                                                              |
|------------|----------|----------|----------|--------------------------------------------------------------------------|
| `start`    | `string` | ✅ Yes   | —        | ISO 8601 start datetime (e.g. `2026-06-13T06:00:00Z`)                  |
| `end`      | `string` | ✅ Yes   | —        | ISO 8601 end datetime (e.g. `2026-06-13T09:00:00Z`)                    |
| `interval` | `string` | No       | `"5min"` | Aggregation interval. Accepts: `"1min"`, `"5min"`, `"15min"`, `"1hr"` |

#### Response Schema

| Field            | Type      | Description                                            |
|------------------|-----------|--------------------------------------------------------|
| `station_id`     | `string`  | Station identifier                                     |
| `start`          | `string`  | Effective start of the returned window                 |
| `end`            | `string`  | Effective end of the returned window                   |
| `interval`       | `string`  | Aggregation interval used                              |
| `data`           | `array`   | Array of time-series data points                       |
| `data[].time`    | `string`  | ISO 8601 timestamp of the interval bucket              |
| `data[].occupancy` | `integer` | Average occupancy during the interval               |
| `data[].min`     | `integer` | Minimum occupancy observed in the interval            |
| `data[].max`     | `integer` | Maximum occupancy observed in the interval            |

#### Response Example

```json
{
  "station_id": "STN-042",
  "start": "2026-06-13T06:00:00Z",
  "end": "2026-06-13T06:20:00Z",
  "interval": "5min",
  "data": [
    { "time": "2026-06-13T06:00:00Z", "occupancy": 45,  "min": 38,  "max": 52  },
    { "time": "2026-06-13T06:05:00Z", "occupancy": 78,  "min": 70,  "max": 84  },
    { "time": "2026-06-13T06:10:00Z", "occupancy": 134, "min": 122, "max": 147 },
    { "time": "2026-06-13T06:15:00Z", "occupancy": 201, "min": 193, "max": 218 }
  ]
}
```

#### cURL Example

```bash
curl -X GET \
  "http://localhost:8000/api/v1/stations/STN-042/history?start=2026-06-13T06:00:00Z&end=2026-06-13T09:00:00Z&interval=5min" \
  -H "Authorization: Bearer <access_token>"
```

#### Error Responses

| Status | Meaning                                          |
|--------|--------------------------------------------------|
| `400`  | Invalid date range or unrecognised interval      |
| `404`  | Station ID not found                             |
| `422`  | Missing required query parameters                |

---

### WS /ws/telemetry

Establish a **WebSocket** connection to receive a real-time stream of occupancy telemetry from all (or filtered) stations.

- **URL:** `ws://localhost:8000/ws/telemetry`
- **Auth required:** Yes — pass token as a query parameter: `?token=<access_token>`
- **Protocol:** WebSocket (RFC 6455)

#### Connection URL

```
ws://localhost:8000/ws/telemetry?token=<access_token>
```

#### Optional Query Parameters

| Parameter    | Type     | Description                                                    |
|--------------|----------|----------------------------------------------------------------|
| `station_id` | `string` | Subscribe to a single station only (omit for all stations)    |

#### Inbound Message Format (Server → Client)

The server pushes a JSON message each time a new telemetry reading is received from any subscribed station.

| Field        | Type      | Description                                           |
|--------------|-----------|-------------------------------------------------------|
| `station_id` | `string`  | The station that produced this reading                |
| `occupancy`  | `integer` | Current passenger count                               |
| `capacity`   | `integer` | Station capacity (for reference)                      |
| `utilization`| `float`   | `occupancy / capacity`                                |
| `status`     | `string`  | `"normal"`, `"warning"`, or `"critical"`             |
| `timestamp`  | `string`  | ISO 8601 timestamp of the sensor reading              |

#### Message Example

```json
{
  "station_id": "STN-077",
  "occupancy": 344,
  "capacity": 350,
  "utilization": 0.983,
  "status": "critical",
  "timestamp": "2026-06-13T09:12:47Z"
}
```

#### JavaScript Client Example

```javascript
const token = "<access_token>";
const socket = new WebSocket(`ws://localhost:8000/ws/telemetry?token=${token}`);

socket.onopen = () => {
  console.log("Connected to UrbanPulse telemetry stream");
};

socket.onmessage = (event) => {
  const reading = JSON.parse(event.data);
  console.log(`[${reading.station_id}] Occupancy: ${reading.occupancy} (${reading.status})`);
};

socket.onclose = (event) => {
  console.warn("WebSocket closed:", event.code, event.reason);
};

socket.onerror = (err) => {
  console.error("WebSocket error:", err);
};
```

#### Heartbeat / Keep-Alive

The server sends a `ping` frame every **30 seconds**. Clients should respond with a `pong` frame. Connections idle for more than **60 seconds** without a pong will be terminated.

---

### GET /api/v1/notifications

Retrieve the current list of system alerts and notifications for the authenticated operator.

- **URL:** `http://localhost:8000/api/v1/notifications`
- **Auth required:** Yes
- **Method:** `GET`

#### Query Parameters

| Parameter  | Type      | Required | Default | Description                                                     |
|------------|-----------|----------|---------|-----------------------------------------------------------------|
| `unread`   | `boolean` | No       | `false` | If `true`, returns only unread notifications                   |
| `severity` | `string`  | No       | —       | Filter by severity: `"info"`, `"warning"`, `"critical"`        |
| `limit`    | `integer` | No       | `50`    | Maximum number of notifications to return                       |

#### Response Schema

| Field                         | Type      | Description                                                          |
|-------------------------------|-----------|----------------------------------------------------------------------|
| `notifications`               | `array`   | Array of notification objects                                        |
| `notifications[].id`          | `string`  | Unique notification identifier (UUID)                                |
| `notifications[].station_id`  | `string`  | Station the alert relates to (`null` for system-wide alerts)        |
| `notifications[].severity`    | `string`  | `"info"`, `"warning"`, or `"critical"`                              |
| `notifications[].message`     | `string`  | Human-readable alert message                                         |
| `notifications[].timestamp`   | `string`  | ISO 8601 datetime when the alert was generated                      |
| `notifications[].read`        | `boolean` | Whether the notification has been acknowledged by the operator      |
| `unread_count`                | `integer` | Total number of unread notifications                                 |

#### Response Example

```json
{
  "unread_count": 2,
  "notifications": [
    {
      "id": "notif-a1b2c3d4",
      "station_id": "STN-077",
      "severity": "critical",
      "message": "Riverside Platform has exceeded 95% capacity. Immediate intervention recommended.",
      "timestamp": "2026-06-13T09:11:30Z",
      "read": false
    },
    {
      "id": "notif-e5f6g7h8",
      "station_id": "STN-001",
      "severity": "warning",
      "message": "Central Junction approaching high utilization (76%). Forecast shows sustained load for 20 minutes.",
      "timestamp": "2026-06-13T09:08:15Z",
      "read": false
    },
    {
      "id": "notif-i9j0k1l2",
      "station_id": null,
      "severity": "info",
      "message": "Forecast model retrained successfully. Model version: v4.2.1.",
      "timestamp": "2026-06-13T08:00:00Z",
      "read": true
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/notifications?unread=true&severity=critical" \
  -H "Authorization: Bearer <access_token>"
```

---

## AI Inference Endpoints (`:8002`)

Base URL: `http://localhost:8002`

All endpoints require `Authorization: Bearer <token>`.

---

### POST /api/v1/forecast

Generate a short-term occupancy forecast for a given station using the platform's trained time-series model.

- **URL:** `http://localhost:8002/api/v1/forecast`
- **Auth required:** Yes
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

| Field              | Type      | Required | Default | Description                                                  |
|--------------------|-----------|----------|---------|--------------------------------------------------------------|
| `station_id`       | `string`  | ✅ Yes   | —       | Target station identifier                                    |
| `horizon_minutes`  | `integer` | No       | `30`    | Forecast horizon in minutes (min: `5`, max: `120`)          |

```json
{
  "station_id": "STN-042",
  "horizon_minutes": 30
}
```

#### Response Schema

| Field                         | Type      | Description                                                     |
|-------------------------------|-----------|-----------------------------------------------------------------|
| `station_id`                  | `string`  | Station the forecast is for                                     |
| `generated_at`                | `string`  | ISO 8601 timestamp when the forecast was produced               |
| `horizon_minutes`             | `integer` | Requested forecast horizon                                      |
| `confidence`                  | `float`   | Overall model confidence score (0.0–1.0)                       |
| `model_version`               | `string`  | Identifier of the model version used                            |
| `forecast`                    | `array`   | Array of predicted occupancy data points                        |
| `forecast[].time`             | `string`  | ISO 8601 timestamp of the predicted interval                    |
| `forecast[].occupancy`        | `integer` | Predicted occupancy (point estimate)                            |
| `forecast[].lower_bound`      | `integer` | Lower bound of the 90% prediction interval                      |
| `forecast[].upper_bound`      | `integer` | Upper bound of the 90% prediction interval                      |

#### Response Example

```json
{
  "station_id": "STN-042",
  "generated_at": "2026-06-13T09:13:00Z",
  "horizon_minutes": 30,
  "confidence": 0.87,
  "model_version": "v4.2.1",
  "forecast": [
    { "time": "2026-06-13T09:18:00Z", "occupancy": 215, "lower_bound": 198, "upper_bound": 232 },
    { "time": "2026-06-13T09:23:00Z", "occupancy": 274, "lower_bound": 251, "upper_bound": 297 },
    { "time": "2026-06-13T09:28:00Z", "occupancy": 332, "lower_bound": 304, "upper_bound": 360 },
    { "time": "2026-06-13T09:33:00Z", "occupancy": 385, "lower_bound": 352, "upper_bound": 418 },
    { "time": "2026-06-13T09:38:00Z", "occupancy": 401, "lower_bound": 364, "upper_bound": 438 },
    { "time": "2026-06-13T09:43:00Z", "occupancy": 388, "lower_bound": 351, "upper_bound": 425 }
  ]
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8002/api/v1/forecast \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "STN-042",
    "horizon_minutes": 30
  }'
```

---

### POST /api/v1/simulate

Run a **counterfactual simulation** to model the projected impact of an operational intervention on a station's occupancy trajectory. Compares a do-nothing baseline against a mitigated scenario.

- **URL:** `http://localhost:8002/api/v1/simulate`
- **Auth required:** Yes
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

| Field               | Type     | Required | Description                                                                                       |
|---------------------|----------|----------|---------------------------------------------------------------------------------------------------|
| `station_id`        | `string` | ✅ Yes   | Target station identifier                                                                         |
| `intervention_type` | `string` | ✅ Yes   | Type of intervention. Accepts: `"halt_entry"`, `"redirect_flow"`, `"increase_throughput"`, `"advisory_alert"` |
| `apply_at`          | `string` | ✅ Yes   | ISO 8601 datetime when the intervention would be applied                                          |

```json
{
  "station_id": "STN-077",
  "intervention_type": "halt_entry",
  "apply_at": "2026-06-13T09:15:00Z"
}
```

#### Response Schema

| Field                        | Type      | Description                                                              |
|------------------------------|-----------|--------------------------------------------------------------------------|
| `station_id`                 | `string`  | Station the simulation was run for                                       |
| `intervention_type`          | `string`  | Intervention applied in the simulation                                   |
| `apply_at`                   | `string`  | Intervention start time used in the simulation                           |
| `confidence`                 | `float`   | Model confidence in the simulation result (0.0–1.0)                     |
| `peak_reduction_pct`         | `float`   | Percentage reduction in peak occupancy achieved by the intervention     |
| `wait_time_saved_minutes`    | `float`   | Average wait time reduction per passenger (minutes)                     |
| `passengers_protected`       | `integer` | Estimated number of passengers who avoid overcrowding                   |
| `baseline`                   | `array`   | Do-nothing occupancy trajectory: `[{ time, occupancy }]`               |
| `mitigated`                  | `array`   | Post-intervention occupancy trajectory: `[{ time, occupancy }]`        |

#### Response Example

```json
{
  "station_id": "STN-077",
  "intervention_type": "halt_entry",
  "apply_at": "2026-06-13T09:15:00Z",
  "confidence": 0.81,
  "peak_reduction_pct": 22.4,
  "wait_time_saved_minutes": 3.7,
  "passengers_protected": 87,
  "baseline": [
    { "time": "2026-06-13T09:15:00Z", "occupancy": 341 },
    { "time": "2026-06-13T09:20:00Z", "occupancy": 363 },
    { "time": "2026-06-13T09:25:00Z", "occupancy": 389 },
    { "time": "2026-06-13T09:30:00Z", "occupancy": 412 }
  ],
  "mitigated": [
    { "time": "2026-06-13T09:15:00Z", "occupancy": 341 },
    { "time": "2026-06-13T09:20:00Z", "occupancy": 318 },
    { "time": "2026-06-13T09:25:00Z", "occupancy": 297 },
    { "time": "2026-06-13T09:30:00Z", "occupancy": 319 }
  ]
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8002/api/v1/simulate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "STN-077",
    "intervention_type": "halt_entry",
    "apply_at": "2026-06-13T09:15:00Z"
  }'
```

---

### GET /api/v1/forecast/{station_id}/shap

Retrieve **SHAP (SHapley Additive exPlanations)** feature attribution values for the most recent forecast produced for a station. Use this to understand *why* the model is predicting a particular occupancy trend.

- **URL:** `http://localhost:8002/api/v1/forecast/{station_id}/shap`
- **Auth required:** Yes
- **Method:** `GET`

#### Path Parameters

| Parameter    | Type     | Required | Description               |
|--------------|----------|----------|---------------------------|
| `station_id` | `string` | ✅ Yes   | Target station identifier |

#### Response Schema

| Field                   | Type     | Description                                                               |
|-------------------------|----------|---------------------------------------------------------------------------|
| `station_id`            | `string` | Station the attribution is for                                            |
| `model_version`         | `string` | Model version these SHAP values correspond to                             |
| `forecast_generated_at` | `string` | Timestamp of the forecast these attributions explain                      |
| `base_value`            | `float`  | Expected model output with no feature contributions (mean prediction)    |
| `features`              | `array`  | Array of feature attribution objects                                      |
| `features[].name`       | `string` | Feature name (e.g. `"hour_of_day"`, `"day_of_week"`, `"recent_inflow"`) |
| `features[].value`      | `float`  | Actual input value of the feature at prediction time                     |
| `features[].impact`     | `float`  | SHAP value: positive = increases predicted occupancy, negative = decreases |

#### Response Example

```json
{
  "station_id": "STN-042",
  "model_version": "v4.2.1",
  "forecast_generated_at": "2026-06-13T09:13:00Z",
  "base_value": 198.4,
  "features": [
    { "name": "hour_of_day",         "value": 9.22,  "impact":  84.3  },
    { "name": "recent_inflow_rate",  "value": 42.0,  "impact":  61.7  },
    { "name": "day_of_week",         "value": 6.0,   "impact":  28.5  },
    { "name": "weather_precip_mm",   "value": 3.2,   "impact":  19.1  },
    { "name": "event_nearby",        "value": 0.0,   "impact":  -4.2  },
    { "name": "rolling_avg_30m",     "value": 187.5, "impact":  12.8  },
    { "name": "outflow_rate",        "value": 28.0,  "impact": -38.6  }
  ]
}
```

Features are returned sorted by absolute impact (descending), giving the most influential factors first.

#### cURL Example

```bash
curl -X GET http://localhost:8002/api/v1/forecast/STN-042/shap \
  -H "Authorization: Bearer <access_token>"
```

---

## Agent Service Endpoints (`:8003`)

Base URL: `http://localhost:8003`

All endpoints require `Authorization: Bearer <token>`.

---

### POST /api/v1/agent/chat

Send a natural-language message to the UrbanPulse AI conversational agent and receive a contextually-aware response. The agent can answer questions about station status, forecasts, interventions, and historical trends.

- **URL:** `http://localhost:8003/api/v1/agent/chat`
- **Auth required:** Yes
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

| Field        | Type     | Required | Description                                                                   |
|--------------|----------|----------|-------------------------------------------------------------------------------|
| `message`    | `string` | ✅ Yes   | The user's natural-language query                                             |
| `session_id` | `string` | ✅ Yes   | Unique session identifier for conversation continuity (UUID recommended)     |

```json
{
  "message": "Which station is most likely to hit critical capacity in the next 20 minutes?",
  "session_id": "sess-f3a9d2b1-7c4e-4f88-9012-aab3c1de5678"
}
```

#### Response Schema

| Field                     | Type      | Description                                                                    |
|---------------------------|-----------|--------------------------------------------------------------------------------|
| `response`                | `string`  | The agent's natural-language answer                                            |
| `intent_detected`         | `string`  | Classified intent of the user's message (e.g. `"forecast_query"`, `"status_check"`, `"simulate_intervention"`) |
| `confidence`              | `float`   | Intent classification confidence (0.0–1.0)                                    |
| `sources`                 | `array`   | Optional: array of referenced data sources used to generate the answer        |
| `sources[].title`         | `string`  | Human-readable title of the source                                             |
| `sources[].excerpt`       | `string`  | Relevant excerpt from the data source                                          |

#### Response Example

```json
{
  "response": "Based on current trends and the 20-minute forecast, **Riverside Platform (STN-077)** is at highest risk. It is currently at 97.4% capacity (341/350) and the model forecasts it will reach full capacity within approximately 12 minutes if no intervention is applied. I recommend considering a **halt_entry** intervention immediately.",
  "intent_detected": "forecast_query",
  "confidence": 0.94,
  "sources": [
    {
      "title": "STN-077 Live Telemetry",
      "excerpt": "Occupancy: 341/350 (97.4%) as of 09:12:47Z — status: critical"
    },
    {
      "title": "STN-077 Forecast (v4.2.1)",
      "excerpt": "Predicted occupancy at 09:25Z: 389 (upper bound: 412)"
    }
  ]
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8003/api/v1/agent/chat \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which station is most likely to hit critical capacity in the next 20 minutes?",
    "session_id": "sess-f3a9d2b1-7c4e-4f88-9012-aab3c1de5678"
  }'
```

#### Supported Intent Classes

| Intent                  | Example Query                                           |
|-------------------------|---------------------------------------------------------|
| `status_check`          | "What is the current occupancy at STN-001?"             |
| `forecast_query`        | "What will STN-042 look like in 30 minutes?"            |
| `simulate_intervention` | "What happens if I halt entry at STN-077 now?"          |
| `historical_analysis`   | "Show me yesterday's peak hours for Central Junction"   |
| `comparative_query`     | "Which station has the highest dwell time this week?"   |
| `general_help`          | "What intervention types are available?"                |

---

### GET /api/v1/agent/suggestions

Retrieve a list of contextual, AI-generated suggested questions for the operator based on current system state. These are pre-built prompts the operator can use to quickly interrogate the agent.

- **URL:** `http://localhost:8003/api/v1/agent/suggestions`
- **Auth required:** Yes
- **Method:** `GET`

#### Response Schema

| Field           | Type            | Description                                                   |
|-----------------|-----------------|---------------------------------------------------------------|
| `suggestions`   | `array<string>` | List of suggested natural-language queries                    |
| `generated_at`  | `string`        | ISO 8601 timestamp when suggestions were generated            |
| `context_basis` | `string`        | Description of the system state used to generate suggestions |

#### Response Example

```json
{
  "generated_at": "2026-06-13T09:13:00Z",
  "context_basis": "STN-077 critical alert active; STN-001 approaching warning threshold",
  "suggestions": [
    "What is the fastest way to reduce overcrowding at Riverside Platform right now?",
    "How long will the congestion at STN-077 last if I do nothing?",
    "What intervention should I apply at STN-077 to protect the most passengers?",
    "Is Central Junction likely to reach critical status in the next 15 minutes?",
    "Compare today's peak occupancy across all stations",
    "Which stations have had more than 3 critical alerts this week?"
  ]
}
```

#### cURL Example

```bash
curl -X GET http://localhost:8003/api/v1/agent/suggestions \
  -H "Authorization: Bearer <access_token>"
```

---

## Error Codes

All API services return errors in a consistent JSON envelope:

```json
{
  "error": {
    "code": 404,
    "status": "Not Found",
    "message": "Station 'STN-999' does not exist.",
    "request_id": "req-7f3a21bc-4d8e-4c01-b9f2-12345678abcd"
  }
}
```

| HTTP Status | Status Text            | Description                                                                                  |
|-------------|------------------------|----------------------------------------------------------------------------------------------|
| `400`       | Bad Request            | The request body or query parameters are malformed or logically invalid.                    |
| `401`       | Unauthorized           | No token provided, or the token is expired or invalid.                                      |
| `403`       | Forbidden              | The authenticated user does not have permission to access this resource.                    |
| `404`       | Not Found              | The requested resource (station, notification, etc.) does not exist.                        |
| `422`       | Unprocessable Entity   | The request is structurally valid JSON but fails validation rules (e.g. missing required field). |
| `429`       | Too Many Requests      | The client has exceeded the rate limit for this endpoint. See `Retry-After` response header. |
| `500`       | Internal Server Error  | An unexpected error occurred on the server. Retry after a brief delay. Contact support if persistent. |

### 429 Rate Limit Response

When rate-limited, the response includes headers to guide retry behaviour:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1749819600
```

```json
{
  "error": {
    "code": 429,
    "status": "Too Many Requests",
    "message": "Rate limit exceeded. Retry after 30 seconds.",
    "request_id": "req-aa4b32de-9012-4fce-bdef-98765432fedc"
  }
}
```

---

## Rate Limits

Rate limits are enforced per **authenticated user** per **minute** at the service level. WebSocket connections are limited per **IP address**.

| Endpoint                                       | Service | Limit (req/min) | Notes                                         |
|------------------------------------------------|---------|-----------------|-----------------------------------------------|
| `POST /api/v1/auth/token`                      | `:8000` | 10              | Per IP address                                |
| `GET /api/v1/stations`                         | `:8000` | 120             |                                               |
| `GET /api/v1/stations/{station_id}`            | `:8000` | 120             |                                               |
| `GET /api/v1/stations/{station_id}/history`    | `:8000` | 60              |                                               |
| `WS /ws/telemetry`                             | `:8000` | 5 connections   | Max 5 concurrent WebSocket connections per IP |
| `GET /api/v1/notifications`                    | `:8000` | 60              |                                               |
| `POST /api/v1/forecast`                        | `:8002` | 30              | Model inference is compute-intensive          |
| `POST /api/v1/simulate`                        | `:8002` | 20              | Simulation is compute-intensive               |
| `GET /api/v1/forecast/{station_id}/shap`       | `:8002` | 30              |                                               |
| `POST /api/v1/agent/chat`                      | `:8003` | 40              |                                               |
| `GET /api/v1/agent/suggestions`                | `:8003` | 60              |                                               |

> **Tip:** For high-frequency monitoring use cases, prefer the WebSocket endpoint (`/ws/telemetry`) over polling `GET /api/v1/stations`, which is both more efficient and not subject to per-request rate limits in the same way.

---

*UrbanPulse AI API Reference · © 2026 UrbanPulse Technologies · For support, contact api-support@urbanpulse.ai*
