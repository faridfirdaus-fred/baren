# BAREN Web

Landing page and content management system for **BAREN**, a game inspired by *benteng-bentengan*, a traditional Indonesian capture-the-flag game.

Built with Next.js 16 and deployed on Cloudflare Workers. All page content is managed through an admin panel instead of being hardcoded in components.

## Features

- **Content-managed landing page**: hero, game features, agents, event banner, FAQ, news, and maps sections are all driven by database records
- **Admin panel** at `/admin` for editing page content without touching code
- **Asset pipeline** backed by Cloudflare R2
- **FAQ accordion**, event banners, and a news feed
- **Responsive layout** following a Valorant-inspired design language (see `docs/DESIGN_SPEC_VALORANT_REF.md`)

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Database | Neon Postgres (serverless) |
| ORM | Drizzle ORM + drizzle-kit |
| Deployment | Cloudflare Workers via OpenNext |
| Object storage | Cloudflare R2 |
| Validation | Zod |
| Styling | Tailwind CSS |

## Getting started

```bash
pnpm install

# configure environment (see below)
cp .dev.vars.example .dev.vars

# apply the database schema
pnpm db:push

pnpm dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin panel.

### Environment variables

`.dev.vars` is Cloudflare's local equivalent of `.env`:

| Variable | Purpose |
| --- | --- |
| `NEXTJS_ENV` | `development` or `production` |
| `NEON_DATABASE_URL` | Neon Postgres connection string |
| `R2_PUBLIC_URL` | Public base URL for R2-hosted assets |

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Build and preview the Cloudflare Worker locally |
| `pnpm deploy` | Build and deploy to Cloudflare Workers |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push the schema directly to the database |
| `pnpm cf-typegen` | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |

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

| File | Contents |
| --- | --- |
| `docs/PRD.md` | Product requirements |
| `docs/SRS.md` | Software requirements specification |
| `docs/DESIGN_SPEC_VALORANT_REF.md` | Visual design specification |
| `docs/BRIEF_LANDING_PAGE.md` | Landing page brief |
| `docs/TASK_BREAKDOWN.md` | Work breakdown |
| `docs/LAPORAN_SCRAPING_DAN_IMPLEMENTASI.md` | Scraping and implementation report |

## Team

Built as a group project for the Informatics program, Faculty of Engineering, Universitas Siliwangi:

- Sekar Ayu Fatmasari (237006054)
- Shelva Nur Fatimah (237006069)
- Farid Firdaus (237006081)
