# ClarityScans Sessions API Routes

This document outlines the REST endpoints used for orchestrating active Tablet Sessions and evaluating utilization data natively.

## Public Endpoints

### Create Session
Initializes a new tracking UUID natively determining `deviceType` automatically parsing raw `user-agent` strings gracefully. Backed by explicit In-Memory IP limits avoiding naive DDOS creations.

* **Path:** `POST /api/sessions`
* **Auth:** None (Public)
* **Body:**
```json
{
  "language": "en"
}
```
* **Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "language": "en",
    "device_type": "tablet" 
  }
}
```

### Sync Session Modules
Updates the progression tuples securely mapping against Zod arrays ensuring malicious length attacks default to 400 validations gracefully.

* **Path:** `PATCH /api/sessions/[id]`
* **Auth:** None (Public)
* **Body:**
```json
{
  "completedModules": ["what-is-ct", "prepare"]
}
```
* **Response:** `{ "success": true }`

---

## Admin Endpoints

Protected mappings requiring Admin cookies natively.

### Sessions Summary
Performs exact DB aggregations grouping `device_types` and determining full arrays of Completion Rates securely.

* **Path:** `GET /api/sessions/summary`
* **Auth:** Admin
* **Cache:** 300 Seconds
* **Query Params:**
  * `dateRange` ("week" | "month" | "all")
* **Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 142,
    "languageDistribution": { "en": 80, "sn": 40, "nd": 22 },
    "deviceDistribution": { "tablet": 139, "phone": 3 },
    "avgModulesCompleted": 4.1,
    "allModulesCompletedRate": 0.85,
    "dailyCounts": [ { "date": "2024-03-10", "count": 15 } ],
    "allTimeTotal": 450
  }
}
```
