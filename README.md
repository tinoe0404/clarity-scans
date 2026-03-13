# ClarityScans 🏥

> CT scan patient education PWA — reduces anxiety and improves breath-hold compliance during scans.

**HIT 300 Final Year Project — Harare Institute of Technology**  

---

## What It Does

ClarityScans is a Progressive Web App placed in CT scan waiting rooms. Patients watch short educational videos, practise breath-holding, and use a visual communication board — all before entering the scanner. The result is calmer patients, fewer repeat scans, and better image quality.

**The problem it solves:** Patients who don't understand the CT procedure move during scans, can't hold their breath on command, and experience high anxiety — causing motion artefacts and repeat exposures.

---

## Key Features

- 🌍 **Three languages** — English, ChiShona, isiNdebele
- 🎬 **Video education** — 5 CT procedure modules with key points
- 🫁 **Breath-hold trainer** — interactive timed practice with audio cues
- 🤝 **Visual communication board** — full-screen pictograms patients hold up to the radiographer
- 📋 **Feedback collection** — anonymous post-scan anxiety scoring
- 📊 **Radiographer dashboard** — analytics, video management, and scan notes
- 📱 **Fully offline** — works without Wi-Fi once installed as a PWA

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router + TypeScript |
| Database | Neon (serverless Postgres) |
| File Storage | Vercel Blob |
| Auth | NextAuth v4 (JWT) |
| i18n | next-intl |
| PWA | next-pwa |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Hosting | Vercel (free tier) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) account (free)
- A [Vercel](https://vercel.com) account (free)

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/your-username/clarityscans.git
cd clarityscans

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your values — see .env.example for instructions

# 4. Run database migrations
npm run db:migrate

# 5. Generate admin password hash
npm run setup:admin

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the patient language picker loads first.  
Admin dashboard is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Environment Variables

See `.env.example` for the full list. The essential ones:

```env
DATABASE_URL=           # Neon connection string
BLOB_READ_WRITE_TOKEN=  # Vercel Blob token
NEXTAUTH_SECRET=        # Random 32+ char string
NEXTAUTH_URL=           # Your deployment URL
ADMIN_PASSWORD_HASH=    # bcrypt hash from setup:admin script
REVALIDATION_SECRET=    # Random string for cache revalidation
```

---

## Deployment

```bash
# Deploy to Vercel
vercel --prod
```

Full step-by-step deployment guide: [`docs/deployment.md`](docs/deployment.md)

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Patient-facing pages (EN/SN/ND)
│   └── admin/             # Radiographer dashboard
├── components/
│   ├── patient/           # Patient UI components
│   ├── admin/             # Dashboard components
│   └── shared/            # Shared components
├── lib/                   # Database, blob, auth, utils
├── hooks/                 # Custom React hooks
├── messages/              # EN, SN, ND translation files
└── types/                 # TypeScript type definitions
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run db:migrate` | Run database migrations |
| `npm run setup:admin` | Generate admin password hash |
| `npm run analyze` | Bundle size analysis |
| `npm run validate:translations` | Check translation completeness |

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/deployment.md`](docs/deployment.md) | Full deployment guide |
| [`docs/radiographer-guide.md`](docs/radiographer-guide.md) | Admin dashboard user guide |
| [`docs/patient-card.md`](docs/patient-card.md) | Printable patient instruction card |
| [`docs/project-summary.md`](docs/project-summary.md) | HIT 300 project summary |

---

## Patient Flow

```
Select Language → Watch Videos → Practise Breath-Hold → Visual Guide → Feedback
```

## Radiographer Flow

```
Login → Upload Videos → Monitor Analytics → Log Scan Notes → Export Reports
```

---

## License

Academic project — Harare Institute of Technology, 2024–2025.
