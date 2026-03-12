# PWA & Offline Support Verification Checklist

This is the manual verification checklist for checking ClarityScans Phase 21 functionality.

## 1. Verify Manifest Validity
1. Build and start the app (`npm run build` & `npm start`).
2. Open Chrome DevTools (F12).
3. Go to the **Application** tab.
4. Click **Manifest** in the left sidebar.
5. Ensure the manifest is loaded, the name is "ClarityScans — CT Patient Education", and there are no warnings or errors. Ensure at least one maskable icon and multiple screenshots are detected.

## 2. Verify Service Worker Registration
1. In the DevTools **Application** tab, click **Service workers**.
2. Verify the status is "activated and is running".
3. Check the "Update on reload" option is unchecked for true offline testing.

## 3. Verify Offline Fallback Route
1. In the DevTools **Network** tab, toggle "Offline".
2. Reload the page (it should serve from the cache or fallback to the offline page).
3. Try navigating directly to `/offline`.
4. Ensure the `/offline` page reads out available features, notes missing videos, and the links to the breath-hold trainer and visual guide work completely.
5. Click "Try reconnecting" while still offline (should state Checking... and eventually fail to load if Chrome doesn't catch it quickly enough / reload the page).
6. Toggle "Online", click "Try reconnecting", and ensure it loads the app.

## 4. Verify PWA Install Prompt
1. Reset permissions/caches and open the site in Chrome (incognito or fresh profile).
2. Go to the Language Picker (`/`) or Modules screen.
3. Wait a moment for the bottom "Install ClarityScans" banner to appear.
4. Click "Install App", check that the browser prompts for installation.
5. If you dismiss the banner clicking 'X', verify it does not appear on reload.
6. **Crucial:** Verify the banner does NOT appear if navigating to `/api/admin/...` or `/admin/...`.

## 5. Offline Feedback Queue & Background Sync
1. Navigate to the Feedback screen (at the end of a module).
2. Open DevTools **Network** tab and toggle "Offline".
3. Submit the feedback form.
4. Verify an alert (or toast) says "No connection — your feedback has been saved and will be sent when you reconnect" and the patient is navigated to the Thank You screen, not blocked.
5. Toggle "Online". 
6. (If testing Background Sync natively) the browser will fire a sync event, triggering the SW to post the feedback and console log success.

## 6. Device Testing

### Real Android Device Testing
1. Connect via USB Debugging.
2. Open Chrome and navigate to the local IP address (e.g. `http://192.168.1.X:3000`).
3. Tap "Add to Home Screen" or let the banner trigger the prompt.
4. Close Chrome, open the app from the Home Screen. It should launch in Fullscreen / Standalone mode without a URL bar.
5. Check the App Icon Long Press -> "Communication Board" shortcut exists.

### Real iOS Safari Testing
1. Navigate to the local IP address via Safari.
2. Tap the Share sheet button -> "Add to Home Screen".
3. Open the installed app; ensure the status bar is black-translucent and no URL bar is visible.
4. (Note: iOS does not support Background Sync natively; verify offline form queues reliably wait for the next `online` event firing).

### Kiosk Tablet Scenario
1. Open the tablet's browser.
2. Clear app data if already installed.
3. Install the app via the prompt.
4. Lock the device to the app (e.g. Android App Pinning) and ensure UI behaves strictly in fullscreen natively.
