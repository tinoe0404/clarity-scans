# Keyboard Test Guide

A guide for manual keyboard testing across patient and admin sections.

## Patient-facing Screens
- [ ] **Language Picker**: `Tab` moves between languages, `Enter`/`Space` selects. "Staff Access" link requires `Enter` hold or `Space` 3s hold.
- [ ] **Module Cards**: `Tab` moves between cards. `Enter`/`Space` navigates within.
- [ ] **Tab Navigation Bar**: `Tab` focuses tabs, `Arrow keys` switch active tab per ARIA pattern.
- [ ] **Video Player**: `Space` Play/Pause, `Arrow Right/Left` seek 10s forward/back, `M` toggles mute, `F` toggles fullscreen.
- [ ] **Breath-hold Trainer**: `Space` starts trainer on intro card, `Escape` cancels when running.
- [ ] **Visual Guide**: `Arrow keys` navigate between grid cards.
- [ ] **Feedback Form**: `Tab` moves options, arrow keys maneuver radio input groups securely.

## Admin Screens
- [ ] **Admin Sidebar**: Reachable via `Tab`, activated with `Enter`.
- [ ] **Stat Cards / Charts**: Non-interactive; skipped during tab. Charts rely on sr-only alternatives.
- [ ] **Video Matrix**: `Tab` moves between cells, `Enter` opens metadata/upload for the item.
- [ ] **Upload Panel**: Standard form interaction. `Escape` dismisses.
- [ ] **Confirm Dialog**: `Tab` trap maintained inside dialog, `Escape` safely dismisses.
