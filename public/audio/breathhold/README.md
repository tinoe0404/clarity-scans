# Breath-Hold Voice-Over Audio Files

This folder contains pre-recorded voice-over `.mp3` files for the breath-hold trainer.

## Why Pre-Recorded?

The browser's `speechSynthesis` API has no native support for **Shona** or **Ndebele** voices,
so it falls back to English with a bad accent. Pre-recorded audio from native speakers
provides a much better patient experience.

## Required Files

Record these 8 files (4 per language) and place them here:

### Shona (sn)

| File | What to say | Shona text |
|------|-------------|------------|
| `sn-inhale.mp3` | "Breathe In" | **Fema Mweya** |
| `sn-hold.mp3` | "Hold" | **Bata Mweya** |
| `sn-exhale.mp3` | "Breathe Out" | **Buritsa Mweya** |
| `sn-complete.mp3` | "Well done! You are ready." | **Wagona! Wagadzirira sekungodaro.** |

### Ndebele (nd)

| File | What to say | Ndebele text |
|------|-------------|--------------|
| `nd-inhale.mp3` | "Breathe In" | **Phefumula** |
| `nd-hold.mp3` | "Hold" | **Bamba** |
| `nd-exhale.mp3` | "Breathe Out" | **Phumula** |
| `nd-complete.mp3` | "Well done! You are ready." | **Usebenzelisa kakhulu! Usulungile kulokho.** |

## Recording Tips

1. Use a quiet room with no background noise
2. Speak slowly and clearly — patients may be anxious
3. Keep a calm, reassuring tone
4. Each clip should be 1–3 seconds long (except the "complete" message)
5. Export as `.mp3` at 128kbps or higher
6. You can use your phone's voice recorder app — just export as MP3

## How It Works

- For **Shona** and **Ndebele**: the app plays these `.mp3` files directly
- For **English**: the app still uses browser speech synthesis (which works well for English)
- If an audio file is missing, it fails silently (no crash, just no sound)
