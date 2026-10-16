# BAREN Web

Landing page and content management system for **BAREN**, a game inspired by _benteng-bentengan_, a traditional Indonesian capture-the-flag game.

Built with Next.js 16 and deployed on Cloudflare Workers. All page content is managed through an admin panel instead of being hardcoded in components.

## Features

- **Content-managed landing page**: hero, game features, agents, event banner, FAQ, news, and maps sections are all driven by database records
- **Admin panel** at `/admin` for editing page content without touching code
- **Asset pipeline** backed by Cloudflare R2
- **FAQ accordion**, event banners, and a news feed
- **Responsive layout** following a Valorant-inspired design language (see `docs/DESIGN_SPEC_VALORANT_REF.md`)

## Tech stack

| Layer          | Choice                            |
| -------------- | --------------------------------- |
| Framework      | Next.js 16 (App Router), React 19 |
| Language       | TypeScript                        |
| Database       | Neon Postgres (serverless)        |
| ORM            | Drizzle ORM + drizzle-kit         |
| Deployment     | Cloudflare Workers via OpenNext   |
| Object storage | Cloudflare R2                     |
| Validation     | Zod                               |
| Styling        | Tailwind CSS                      |

## Prerequisites

- **Node.js** 18+ and **pnpm** 9+
- **Neon account** (free tier works) for Postgres database
- **Cloudflare account** for R2 storage and Workers deployment

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up Neon database

1. Create a new project at https://console.neon.tech
2. Create a database branch (e.g., `dev` or `main`)
3. Copy the **pooled connection string** from the dashboard

### 3. Configure environment

Copy the example file and fill in your credentials:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your actual values:

| Variable               | Purpose                                            | How to get it                                                       |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| `NEON_DATABASE_URL`    | Neon Postgres connection string (pooled)           | Neon dashboard → Connection Details → Pooled connection             |
| `R2_PUBLIC_URL`        | Public base URL for R2-hosted assets               | `https://pub-<hash>.r2.dev` (see R2 setup below)                    |
| `R2_ACCOUNT_ID`        | Cloudflare account ID                              | Cloudflare dashboard → R2 → right sidebar                           |
| `R2_BUCKET_NAME`       | R2 bucket name for assets                          | `baren-assets` (must match bucket created below)                    |
| `R2_ACCESS_KEY_ID`     | R2 API token ID for presigned URLs                 | Cloudflare dashboard → R2 → Manage R2 API Tokens → Create API Token |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret                                | Shown once when creating the token                                  |
| `AUTH_SECRET`          | Auth.js session secret (min 32 chars)              | Generate with `openssl rand -base64 32`                             |
| `AUTH_GOOGLE_ID`       | Google OAuth client ID (optional for waiting list) | Google Cloud Console → APIs & Services → Credentials                |
| `AUTH_GOOGLE_SECRET`   | Google OAuth client secret                         | Same as above                                                       |
| `ADMIN_EMAIL`          | Initial admin email for seeding                    | Your email (used to create first admin user)                        |
| `ADMIN_PASSWORD`       | Initial admin password (min 8 chars)               | Choose a strong password                                            |
| `ADMIN_NAME`           | Initial admin display name                         | Your name                                                           |

**⚠️ Never commit `.dev.vars` or paste real secrets in public places.**

### 4. Create R2 buckets and configure CORS

```bash
# Create buckets (once per account)
pnpm exec wrangler r2 bucket create baren-assets
pnpm exec wrangler r2 bucket create baren-opennext-cache

# Configure CORS for baren-assets (required for presigned uploads)
pnpm exec wrangler r2 bucket cors put baren-assets --cors-file ./r2-cors.json
```

Create `r2-cors.json` temporarily:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://*.workers.dev"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

After deployment, update `AllowedOrigins` to include your production domain.

### 5. Apply database schema

```bash
pnpm db:push
```

This creates all tables (`users`, `settings`, `news`, `hero`, `features`, `gallery`, `faq`, `social_links`, `wishlist`, `landing_cards`, `comments`, etc.).

### 6. Seed initial admin user

The admin user is created automatically on first server start using `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `.dev.vars`.

### 7. Run development server

```bash
pnpm dev
```

- **Public site**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin (login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`)

## Admin panel usage

After logging in to `/admin`, you can manage all site content:

| Section           | What you can do                                                         |
| ----------------- | ----------------------------------------------------------------------- |
| **Dashboard**     | View content counts and last update times                               |
| **Hero**          | Edit hero title, subtitle, CTA button, background video/image           |
| **Landing Cards** | Add/edit/reorder flexible content cards (about, events, features, etc.) |
| **News**          | Publish/draft news articles with images                                 |
| **FAQ**           | Add/edit/reorder frequently asked questions                             |
| **Gallery**       | Upload game screenshots, artwork, banners, videos                       |
| **Social Links**  | Add/edit social media links (Discord, Twitter, Instagram, etc.)         |
| **Branding**      | Upload logo, favicon; edit game name and tagline                        |
| **Wishlist**      | View and export email addresses of users who joined the waiting list    |

All content changes are **immediately visible** on the public site after saving (cache duration ≤60 seconds).

## Scripts

| Command            | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `pnpm dev`         | Start the dev server                                   |
| `pnpm build`       | Production build                                       |
| `pnpm preview`     | Build and preview the Cloudflare Worker locally        |
| `pnpm deploy`      | Build and deploy to Cloudflare Workers                 |
| `pnpm db:generate` | Generate Drizzle migrations                            |
| `pnpm db:migrate`  | Apply migrations                                       |
| `pnpm db:push`     | Push the schema directly to the database               |
| `pnpm lint`        | Run ESLint                                             |
| `pnpm format`      | Format code with Prettier                              |
| `pnpm cf-typegen`  | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |

## Deployment

### Deploy to Cloudflare Workers

```bash
pnpm deploy
```

This builds the project and deploys it to your Cloudflare Workers subdomain.

### Set production secrets

Before first deployment, configure production secrets:

```bash
pnpm exec wrangler secret put NEON_DATABASE_URL
pnpm exec wrangler secret put R2_PUBLIC_URL
pnpm exec wrangler secret put R2_ACCOUNT_ID
pnpm exec wrangler secret put R2_BUCKET_NAME
pnpm exec wrangler secret put R2_ACCESS_KEY_ID
pnpm exec wrangler secret put R2_SECRET_ACCESS_KEY
pnpm exec wrangler secret put AUTH_SECRET
pnpm exec wrangler secret put AUTH_GOOGLE_ID
pnpm exec wrangler secret put AUTH_GOOGLE_SECRET
pnpm exec wrangler secret put ADMIN_EMAIL
pnpm exec wrangler secret put ADMIN_PASSWORD
pnpm exec wrangler secret put ADMIN_NAME
```

When prompted, paste the value for each secret (input is hidden).

### Rollback a deployment

```bash
# List recent deployments
pnpm exec wrangler deployments list

# Rollback to a specific deployment ID
pnpm exec wrangler rollback --message "Rollback reason" <deployment-id>
```

### Custom domain

Add a custom domain in the Cloudflare dashboard:

1. Workers & Pages → your worker → Settings → Domains & Routes
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `baren.example.com`)
4. Follow DNS setup instructions

After adding a custom domain, update:

- `AUTH_URL` in production environment (if using OAuth)
- `AllowedOrigins` in R2 CORS configuration
- Google OAuth authorized redirect URIs

## Project structure

```
src/
  app/
    (site)/          # Public landing page
    admin/           # Admin panel
    api/             # Route handlers (assets, health)
  components/site/   # Section components (hero, features, FAQ, maps, ...)
docs/                # PRD, SRS, design spec, task breakdown
public/              # Static art, brand marks, icons
```

## Documentation

| File                                        | Contents                            |
| ------------------------------------------- | ----------------------------------- |
| `docs/PRD.md`                               | Product requirements                |
| `docs/SRS.md`                               | Software requirements specification |
| `docs/DESIGN_SPEC_VALORANT_REF.md`          | Visual design specification         |
| `docs/BRIEF_LANDING_PAGE.md`                | Landing page brief                  |
| `docs/TASK_BREAKDOWN.md`                    | Work breakdown                      |
| `docs/LAPORAN_SCRAPING_DAN_IMPLEMENTASI.md` | Scraping and implementation report  |

## Team

Built as a group project for the Informatics program, Faculty of Engineering, Universitas Siliwangi:

- Sekar Ayu Fatmasari (237006054)
- Shelva Nur Fatimah (237006069)
- Farid Firdaus (237006081)
