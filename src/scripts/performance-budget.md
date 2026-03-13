# ClarityScans - Performance Budget

This document defines the maximum acceptable values for each performance metric and key page profile.
It serves as the performance contract for future development: **any Pull Request that degrades these metrics by more than 10% must be flagged.**

## Critical Target Profiles

### 1. Patient Mobile Profile
*(Constraints: Older Android, 3G Network, Hospital Wi-Fi/Mobile Data)*

- **First Contentful Paint (FCP):** `< 1.5 seconds`
- **Time to Interactive (TTI):** `< 3.5 seconds`
- **Largest Contentful Paint (LCP):** `< 2.5 seconds`
- **Cumulative Layout Shift (CLS):** `< 0.1`

This is the primary optimisation profile.

### 2. Patient Kiosk Profile
*(Constraints: Waiting Room Tablet, Hospital Wi-Fi, PWA Pre-installed)*

- **Lighthouse Performance Score:** `95+`
- **Lighthouse Accessibility Score:** `95+`
- **Lighthouse Best Practices Score:** `95+`
- **Lighthouse SEO Score:** `95+`

### 3. Radiographer Dashboard Profile
*(Constraints: Desktop Browser, Hospital LAN)*

- **Data Fetching / Rendering:** Data must display in `< 2.0 seconds`
- **Main Thread Blocks:** Charts and analytics must *not block* the main thread (i.e. TBI < 300ms)

---

## Budget Limits by Metric Category

- **CSS:** Production CSS payload must be **< 15KB gzipped**
- **JavaScript (Initial Bundle):**
  - **Patient Routes:** `Recharts` and `next-auth` must **NEVER** be in the patient bundle.
  - **Admin Routes:** `Recharts` must be lazy-loaded.
- **Images/Media:**
  - Thumbnails must use `blurDataURL` (tiny base-64 string).
  - All media above the fold must use `priority={true}`.
- **Database Limits:** Unbounded queries must be limited globally to a maximum of `1000` rows unless implementing strict cursor pagination.
- **Third Party Scripts:** Must be fully deferred and asynchronous (`@vercel/analytics`). Web workers applied to precise-timing flows.
