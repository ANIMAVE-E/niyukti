# Niyukti

Cross-platform PWA for verified government and approved private-sector job notifications.

## Current slice

- Next.js + TypeScript application shell
- Responsive landing page with search entry point
- PWA manifest
- Supabase/PostgreSQL initial schema migration
- Source, job, category, preference, push subscription, notification, and ingestion-run tables
- Supabase-backed `GET /api/jobs` endpoint with search and filters
- Row-level security policies for public catalog reads and private user data

## Local setup

Node.js 22 LTS (22.12 or later) and npm are required.

```bash
npm install
copy .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

Apply the database migration with the Supabase CLI or SQL editor:

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_rls_policies.sql
supabase/migrations/0003_job_search.sql
supabase/migrations/0004_public_catalog_access.sql
```

The app requires a Supabase project URL and anon key in `.env.local`. Do not commit `.env.local` or service-role/VAPID secrets.

The public catalog migration keeps row-level reads limited to active/enabled records, limits job-category links to active jobs and categories, and adds column-level grants for `anon` and `authenticated`. Apply it after the search migration; direct catalog reads should use the same explicit projection as `GET /api/jobs` rather than `select('*')`.

## Source policy

Government sources should use official APIs, RSS feeds, or permitted public pages. LinkedIn and Naukri integrations must use an approved API, licensed feed, or employer-provided feed. The app stores the original source URL and redirects applicants to the official listing/application page.

## Next implementation slice

1. Configure Supabase credentials, apply migrations in order, and add authentication.
2. Add job detail route and Supabase-backed UI.
3. Add the first permitted source adapter (RSS/API before HTML scraping).
4. Add service worker registration and Web Push subscription flow.
