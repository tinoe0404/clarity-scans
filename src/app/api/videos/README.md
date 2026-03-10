# ClarityScans Video API Routes

This document outlines the REST endpoints used for video delivery and management.

## Public Endpoints

The public endpoints are designed for the patient-facing PWA. They are aggressively cached by Next.js using segment-level cache boundaries (3600 seconds) to ensure that the initial video catalog loads quickly even on unstable hospital Wi-Fi.

### List Active Videos
Returns all explicitly activated videos for a given standard locale string.

* **Path:** `GET /api/videos`
* **Auth:** None
* **Query:** `?locale=en|sn|nd`
* **Response:** `ApiSuccess<VideoRecord[]>`

```bash
curl "http://localhost:3000/api/videos?locale=en"
```

### Get Single Video
Retrieves exactly one Active video matching the specific registry slug.

* **Path:** `GET /api/videos/[slug]`
* **Auth:** None
* **Query:** `?locale=en|sn|nd`
* **Response:** `ApiSuccess<VideoRecord>`

```bash
curl "http://localhost:3000/api/videos/breathhold?locale=en"
```

---

## Admin Endpoints

Protected routes strictly enforcing `requireAdminApi()` or specific Node environments. They read and mutate data unconditionally across active/inactive limits and execute explicit DB operations bridging Vercel Blob storage.

### Trigger Cache Webhook
Flushes the 3600-second public segment boundaries forcing immediate updates dynamically. Usually called internally by the Admin UI but accessible as a Webhook globally.

* **Path:** `POST /api/revalidate`
* **Auth:** Header matches `REVALIDATION_SECRET` env var exactly
* **Body:** `{ "token": "string" }`

```bash
curl -X POST "http://localhost:3000/api/revalidate" \
     -H "Content-Type: application/json" \
     -d '{"token":"your-secret-here"}'
```

### List All Videos (CMS)
Fetches the entire Video Registry, mapping records by Slug heavily optimizing visual matrix rendering.

* **Path:** `GET /api/admin/videos`
* **Auth:** Admin Session Required
* **Query:** `?includeStats=true` (Fetches Blob quota metrics)
* **Response:** 
```json
{
  "success": true,
  "data": {
    "grouped": {
       "what-is-ct": [{ /* en record */ }, { /* sn record */ }]
    },
    "stats": null
  }
}
```

### Create / Upsert Video
Updates or creates entirely new Module definitions cleanly based on strictly tested `UpsertVideoInput` tuples natively mapped into the Postgres instance.

* **Path:** `POST /api/admin/videos`
* **Auth:** Admin Session Required

### Update Metadata
Adjusts specific keys on a single explicitly defined video record without requiring a complete payload upload. Automatically hits Cache Webhooks upon Success.

* **Path:** `PATCH /api/admin/videos/[id]`
* **Auth:** Admin Session Required
* **Body:** `Partial<UpsertVideoInput>`

### Quick-Toggle Status
Dedicated explicit boolean flipper. Automatically hits Cache Webhooks.

* **Path:** `PATCH /api/admin/videos/[id]/status`
* **Auth:** Admin Session Required
* **Body:** `{ "isActive": true }`

### Delete Video Orchestrator
Safely dismantles a module in order:
1. Deletes `.mp4` from Vercel Blobs globally.
2. Deletes `.jpg` thumbnail internally.
3. Swallows external Node Blob errors cleanly to ensure strict 100% Postgres tuple removals.

* **Path:** `DELETE /api/admin/videos/[id]`
* **Auth:** Admin Session Required
