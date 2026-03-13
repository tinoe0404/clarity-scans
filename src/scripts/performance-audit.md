# ClarityScans - Performance Baseline Audit

This document records the baseline Lighthouse scores, Core Web Vitals, and predicted performance issues for key pages before applying Phase 23 optimisations.
As direct Lighthouse execution is not available, these baselines and predicted issues are based on a comprehensive codebase analysis of performance anti-patterns.

## Target Profiles

1. **Patient Mobile** (Older Android, 3G):
   - First Contentful Paint (FCP): < 1.5s
   - Time to Interactive (TTI): < 3.5s
   - Largest Contentful Paint (LCP): < 2.5s
   - Cumulative Layout Shift (CLS): < 0.1
2. **Patient Kiosk** (Tablet, Hospital Wi-Fi): All Lighthouse metrics 95+
3. **Radiographer Dashboard** (Desktop, Hospital LAN): Data appears in < 2s

---

## Page-by-Page Baseline Analysis

### 1. Language Picker (`/`)
* **Predicted Scores:** Performance: ~85, Accessibility: ~98, Best Practices: ~95, SEO: ~100
* **Predicted Core Web Vitals:** FCP: ~1.8s, LCP: ~2.8s, CLS: ~0.15
* **Identified Issues (Anti-patterns):**
  - **Unoptimised Fonts:** Google Fonts `@import` might block rendering. `next/font` might not have `adjustFontFallback` causing layout shift (CLS).
  - **Redirect Flash:** Middleware redirect (`/` to `/en`) might cause a flash or delay FCP.
  - **Images:** Brand icon SVG is fine, but any flags or locale imagery may lack `priority` or proper `sizes`.
  - **Unused CSS:** Potential unused classes in the tailwind bundle.

### 2. Modules List (`/en/modules`)
* **Predicted Scores:** Performance: ~75, Accessibility: ~98, Best Practices: ~95, SEO: ~100
* **Predicted Core Web Vitals:** FCP: ~2.0s, LCP: ~3.5s, CLS: ~0.25
* **Identified Issues:**
  - **Large Bundle Size:** The initial client bundle likely includes unused/heavy libraries. Recharts or `next-auth` might be leaking into patient bundles.
  - **No Lazy Loading for Below the Fold:** Module cards below the visible viewport are rendered immediately, blocking the main thread.
  - **Image Optimisation:** Module thumbnails might lack explicit sizing (causing CLS) and `blurDataURL` placeholders.
  - **Data Fetching:** Fetching data via `useEffect` in client components rather than Server Components. Lacking `next: { revalidate: 3600 }` cache.
  - **Cumulative Layout Shift:** Skeletons may not match actual card heights.

### 3. Video Player (`/en/watch/what-is-ct`)
* **Predicted Scores:** Performance: ~70, Accessibility: ~95, Best Practices: ~90, SEO: ~95
* **Predicted Core Web Vitals:** FCP: ~2.5s, LCP: ~4.0s (video thumbnail), CLS: ~0.3
* **Identified Issues:**
  - **Video Container CLS:** The 16:9 container might not use an explicit aspect ratio (`aspect-video`), causing CLS when the video loads.
  - **No Dynamic Import:** The heavy `VideoPlayer` component might be bundled in the initial JS instead of `dynamic()` with `ssr: false`.
  - **No Lazy Loading Key Points:** Key points below the fold are loaded and parsed immediately.
  - **Client-side Static Data:** Video key points data might be computed on the client instead of passed as props from a server component.

### 4. Breath-hold Trainer (`/en/breathhold`)
* **Predicted Scores:** Performance: ~80, Accessibility: ~95, Best Practices: ~90, SEO: ~100
* **Predicted Core Web Vitals:** FCP: ~1.5s, LCP: ~2.0s, CLS: ~0.05
* **Identified Issues:**
  - **Main Thread Blocking:** Analytics tracking (`track()` calls) executes on the main thread, potentially causing timing drift during the precise breath-holding loop.
  - **No Dynamic Import:** Web Speech API checks must happen client-side. The component should be `ssr: false` dynamically imported to avoid hydration errors/overhead.
  - **Not Statically Generated:** Missing `export const dynamic = 'force-static'`, meaning it might be server-rendered unnecessarily.

### 5. Visual Guide (`/en/visual-guide`)
* **Predicted Scores:** Performance: ~85, Accessibility: ~95, Best Practices: ~95, SEO: ~100
* **Predicted Core Web Vitals:** FCP: ~1.8s, LCP: ~3.0s, CLS: ~0.1
* **Identified Issues:**
  - **Image Loading:** Images may lack explicit sizes/`fill` properties and optimized `blur` placeholders.
  - **Not Statically Generated:** Lacks `force-static` directive, bypassing the fastest possible delivery method.

### 6. Admin Dashboard (`/admin`)
* **Predicted Scores:** Performance: ~60, Accessibility: ~95, Best Practices: ~90, SEO: ~90
* **Predicted Core Web Vitals:** FCP: ~1.5s, LCP: ~3.5s, CLS: ~0.4
* **Identified Issues:**
  - **Main Thread Blocking (Recharts):** All charts render immediately on mount, freezing the browser.
  - **Layout Shift:** Charts lack fixed explicit heights via `ResponsiveContainer`.
  - **Slow Database Queries:** Unbounded queries (no `LIMIT`), `OFFSET` pagination, and missing index usage on aggregate queries (e.g., `getFeedbackSummary`, `getDailySessionCounts`).
  - **Missing Query Caching:** Expensive DB queries are run every time instead of using an in-memory TTL caching mechanism.
  - **Heavy Unused Components:** Dialogs (`ConfirmDialog`, `VideoUploadPanel`) are included in the initial bundle instead of using `dynamic()`.

---

## Tracker: Optimisations Applied

*(To be updated as Phase 23 progresses)*

- [ ] Bundle Analysis and Code Splitting
- [ ] Dynamic Imports implementation
- [ ] Image Optimisation (`next/image`, blur placeholders)
- [ ] Font Optimisation (`next/font` configuration)
- [ ] Component Lazy Loading (`useIntersectionObserver`)
- [ ] React Server Component boundary improvements
- [ ] Database Query Optimisations (`LIMIT`, Indexes, TTLCache)
- [ ] Next.js Caching configuration (`force-static`, `revalidate`)
- [ ] Third-party scripts optimisation
- [ ] CLS fixes (skeletons, aspect ratios, responsive charts)
- [ ] Critical CSS inlining verification
- [ ] Web Worker for Analytics
- [ ] Core Web Vitals continuous reporting
