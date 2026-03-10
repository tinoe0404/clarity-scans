# ClarityScans Feedback API Routes

This document outlines the REST endpoints used for Feedback data collection and analytics delivery.

## Public Endpoints

### Submit Feedback
Validates and stores post-scan feedback. Safely rejects duplicate submissions tied to identical Session IDs natively returning a 409 Conflict.

* **Path:** `POST /api/feedback`
* **Auth:** None (Public)
* **Body:**
```json
{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "understoodProcedure": true,
  "anxietyBefore": 4,
  "anxietyAfter": 2,
  "appHelpful": true,
  "comments": "Very clear voice",
  "submittedBy": "patient"
}
```
* **Response:**
```json
{
  "success": true,
  "id": "abc-123-uuid"
}
```
*(Notice: Returns only an ID ensuring underlying metrics remain masked from the client)*

---

## Admin Endpoints

All admin routes immediately check `requireAdminApi()` ensuring secure backoffice boundaries.

### List Feedback
Returns paginated rows of raw feedback natively.

* **Path:** `GET /api/feedback`
* **Auth:** Admin
* **Query Params:**
  * `page` (default: 1)
  * `pageSize` (default: 50)
* **Response:**
```json
{
  "success": true,
  "data": [ { ...record } ],
  "pagination": {
     "page": 1,
     "pageSize": 50,
     "total": 12,
     "totalPages": 1
  }
}
```

### Export Feedback CSV
Downloads a strictly scrubbed tracking file permanently omitting `session_id` fulfilling PII requirements.

* **Path:** `GET /api/feedback?format=csv`
* **Auth:** Admin
* **Response:** `text/csv` stream download starting automatically.

### Feedback Summary
Returns extensive SQL aggregations natively computed strictly inside Postgres preventing Node.js array memory faults.

* **Path:** `GET /api/feedback/summary`
* **Auth:** Admin
* **Cache:** 300 Seconds
* **Query Params:**
  * `dateRange` ("week" | "month" | "all")
* **Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 50,
    "totalFeedback": 45,
    "avgAnxietyBefore": 3.8,
    "avgAnxietyAfter": 2.1,
    "avgAnxietyReduction": 1.7,
    "helpfulRate": 0.95,
    "understoodRate": 0.98,
    "positiveReductionRate": 0.82,
    "distributionBefore": { "1": 0, "2": 2, "3": 10, "4": 25, "5": 8 },
    "distributionAfter": { "1": 20, "2": 15, "3": 8, "4": 2, "5": 0 },
    "dailyCounts": [ { "date": "2024-03-10", "count": 12 } ],
    "languageDistribution": { "en": 25, "sn": 12, "nd": 8 }
  }
}
```
