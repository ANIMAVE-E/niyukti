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

## Table of contents

1. [Product goal](#product-goal)
2. [Current status](#current-status)
3. [Architecture](#architecture)
4. [End-to-end workflow](#end-to-end-workflow)
5. [Repository structure](#repository-structure)
6. [Technology choices](#technology-choices)
7. [Database schema](#database-schema)
8. [Security and RLS](#security-and-rls)
9. [API contract](#api-contract)
10. [Local development](#local-development)
11. [Supabase setup](#supabase-setup)
12. [Ingestion and scraper design](#ingestion-and-scraper-design)
13. [Push notification design](#push-notification-design)
14. [PWA implementation plan](#pwa-implementation-plan)
15. [LinkedIn and Naukri integration](#linkedin-and-naukri-integration)
16. [Deployment](#deployment)
17. [Testing and observability](#testing-and-observability)
18. [Implementation roadmap](#implementation-roadmap)
19. [Operating checklist](#operating-checklist)

## Product goal

Niyukti is a cross-platform Progressive Web Application for discovering verified government, public-sector, and approved private-sector job openings. The primary user journey is:

1. A user opens Niyukti on a phone, tablet, laptop, or desktop browser.
2. The user searches or filters job openings by title, organization, category, qualification, or state.
3. The user opens a normalized job detail page containing the important dates, eligibility, vacancy count, salary, notification PDF, and source information.
4. The user selects **Apply Now** and is redirected to the original official recruitment or source website.
5. An optional user subscribes to category, qualification, and state alerts through Web Push notifications.

Niyukti is an aggregation and discovery layer. It must not pretend to be the government recruitment authority, accept application forms, collect application fees, or replace the original application portal.

## Current status

### Implemented

- Next.js App Router application shell.
- TypeScript configuration and strict typing.
- Responsive landing page and initial `/jobs` route.
- PWA manifest placeholder at `public/manifest.webmanifest`.
- Supabase browser and server clients.
- Typed Supabase database model at `lib/supabase/database.types.ts`.
- Public jobs API at `app/api/jobs/route.ts`.
- Search, pagination, state, qualification, and category query validation.
- PostgreSQL schema migrations `0001` through `0004`.
- RLS policies for public catalog access and private user records.
- Git repository with the initial commit pushed to [ANIMAVE-E/niyukti](https://github.com/ANIMAVE-E/niyukti).

### Not implemented yet

- A real `.env.local` connection in the local app.
- Supabase Auth UI and profile creation trigger.
- Job detail pages backed by Supabase.
- A production ingestion worker.
- A real official RSS/API source adapter.
- Deduplication and upsert execution code.
- Service worker registration and offline caching.
- Web Push subscription storage endpoint.
- VAPID/FCM notification sender and retry worker.
- Notification center UI.
- Automated tests and CI.
- Production deployment.

## Architecture

```text
Official government APIs/RSS/pages       Approved private feeds/APIs
             |                                      |
             +------------------+-------------------+
                                v
                     Source ingestion workers
                  RSS/API adapters, permitted parsers
                                |
                                v
                    Normalize, validate, deduplicate
                                |
                 +--------------+---------------+
                 |                              |
                 v                              v
          Supabase PostgreSQL              Ingestion logs
          jobs, sources, categories        ingestion_runs
          users, preferences               error and metrics data
                 |
                 +--------------+---------------+
                                |
              +----------------+----------------+
              |                                 |
              v                                 v
       Next.js server/API                 Notification worker
       search, filters, auth              preference matching,
       job details, redirects             Web Push/FCM delivery
              |                                 |
              v                                 v
          Next.js PWA                 Android, iOS, desktop browsers
```

### Runtime boundaries

- **Browser:** renders public listings, requests only public Supabase data, and registers the service worker.
- **Next.js server:** performs authenticated/server-side queries, validates inputs, and owns redirects or server actions.
- **Ingestion worker:** runs outside the browser with source-specific credentials only when an approved API requires them.
- **Notification worker:** accesses subscriptions and secret VAPID/FCM credentials. It must never expose private keys to the browser.
- **PostgreSQL:** stores normalized data and applies RLS.

## End-to-end workflow

### New job workflow

1. Scheduler selects enabled sources whose polling interval has elapsed.
2. Adapter fetches RSS, API, or permitted HTML content with a timeout and rate limit.
3. Parser converts the source response into `NormalizedJob` objects.
4. Normalizer trims text, converts dates to ISO format, normalizes qualification labels, and validates official URLs.
5. Fingerprinting computes a stable identity from source, title, organization, dates, and canonical URL.
6. The worker inserts a new job or updates an existing job without creating duplicates.
7. Categories are linked through `job_categories`.
8. An ingestion record records seen, created, updated, skipped, and failed counts.
9. New jobs are matched against user preferences.
10. Matching users receive an in-app event and, if subscribed, a Web Push notification.

### User application workflow

1. `GET /api/jobs` returns active jobs using a safe explicit projection.
2. The UI renders cards and filter controls.
3. A detail route loads one job by slug.
4. The job detail page displays the source and verification state.
5. **Apply Now** opens `official_apply_url`; the application is completed on the original source site.

## Repository structure

```text
app/
  api/jobs/route.ts       Public catalog API with validation and filters
  jobs/page.tsx           Initial jobs route and empty state
  globals.css             Global responsive styling
  layout.tsx              Metadata, manifest, and root layout
  page.tsx                Landing page

lib/
  ingestion/types.ts      Normalized job and adapter contracts
  supabase/browser.ts     Browser Supabase client
  supabase/server.ts      Server Supabase client with cookie support
  supabase/database.types.ts
                          Typed database rows, inserts, updates, and enums

public/
  manifest.webmanifest    PWA metadata; icons are still to be added

supabase/migrations/
  0001_initial_schema.sql Core tables, indexes, and seed categories
  0002_rls_policies.sql   Row-level security policies
  0003_job_search.sql     Generated PostgreSQL full-text search column/index
  0004_public_catalog_access.sql
                          Public column grants and catalog relationship rules

.env.example              Placeholder environment variable names only
.gitignore                Excludes local environments, builds, logs, and secrets
README.md                 This project guide
```

## Technology choices

| Area | Choice | Reason |
| --- | --- | --- |
| UI | Next.js App Router | Full-stack React with server routes and deployable web app |
| Language | TypeScript | Safer database and API contracts |
| Styling | CSS foundation, Tailwind-compatible direction | Responsive UI without locking the backend to a UI library |
| Icons | Lucide React | Accessible, consistent icon set |
| Database | Supabase PostgreSQL | Relational data, Auth, RLS, Realtime, and managed backups |
| Search | PostgreSQL `tsvector` initially | No extra search service required for the first release |
| Ingestion | Node.js or Python workers | Source-specific parsing and scheduling |
| PWA | Web App Manifest + Service Worker | Installable cross-platform experience |
| Push | Web Push/VAPID or FCM | Browser/device notifications |
| Hosting | Vercel/Cloudflare for web; worker runtime separately | Independent scaling and scheduling |

## Database schema

### `users`

Application profile linked one-to-one with Supabase `auth.users`.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Auth user primary key |
| `email` | `text` | Profile email |
| `display_name` | `text` | Display name |
| `phone` | `text` | Optional phone number; do not use for passwords or OTP storage |
| `preferred_language` | `text` | UI/alert language, initially `en` |
| `preferred_state` | `text` | Default state filter |
| `is_admin` | `boolean` | Administrative flag; never client-writable |
| `created_at`, `updated_at` | `timestamptz` | Audit timestamps |

### `sources`

Registry of government and approved private sources.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Source primary key |
| `name`, `slug` | `text` | Human and stable identifiers |
| `source_type` | enum | `government`, `private`, `rss`, `api`, `html`, or `partner_feed` |
| `organization` | `text` | Source owner or organization |
| `base_url`, `feed_url` | `text` | Canonical and feed endpoints |
| `parser_key` | `text` | Adapter registry key |
| `is_official` | `boolean` | Whether the source is official for the organization |
| `is_enabled` | `boolean` | Scheduler switch |
| `polling_interval_seconds` | `integer` | Minimum polling interval |
| `last_started_at`, `last_success_at` | `timestamptz` | Health monitoring |
| `last_error` | `text` | Latest sanitized error |

### `categories`

Hierarchical catalog categories. Seeded categories include Central Government, State Government, Banking, Railways, Defense, and Private Jobs. Add UPSC, SSC, Teaching, Police, Engineering, Healthcare, IT, and similar subcategories as product data evolves.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Category primary key |
| `name`, `slug` | `text` | Display and stable URL/filter values |
| `parent_id` | `uuid` | Optional hierarchy |
| `description` | `text` | User-facing explanation |
| `display_order` | `integer` | UI ordering |
| `is_active` | `boolean` | Hide without deleting history |

### `jobs`

Normalized job record. It stores discovery data and links back to the original source.

Important groups of columns:

- Identity: `id`, `source_id`, `external_id`, `fingerprint`, `slug`.
- Display: `title`, `organization`, `department`, `description`, `short_description`.
- Classification: `status`, `state`, `location`, `employment_type`, `qualification`.
- Eligibility: `age_limit_text`, `eligibility_text`.
- Compensation: `total_vacancies`, `salary_min`, `salary_max`, `salary_text`, `pay_scale`.
- Dates: `application_start_date`, `application_end_date`, `exam_date`, `result_date`, `published_at`, `source_published_at`.
- Links: `official_notification_url`, `official_apply_url`, `source_url`.
- Change tracking: `content_hash`, `last_seen_at`, `created_at`, `updated_at`.

Constraints prevent negative vacancies and invalid application date ranges. `fingerprint` prevents duplicate ingestion.

### `job_categories`

Many-to-many join between jobs and categories. A job may be both `Banking` and `Central Government`, or `Engineering` and `State Government`.

### `push_subscriptions`

Stores browser/device delivery endpoints. The `endpoint`, `p256dh`, and `auth_key` values are subscription material, not VAPID private keys. Track `provider`, `is_active`, `failure_count`, and `last_used_at` so invalid subscriptions can be retired.

### `user_preferences`

Stores category IDs, qualification labels, state labels, notification toggles, and quiet hours. Preferences must be evaluated server-side before sending notifications.

### `notification_events`

In-app notification history and delivery state. `status` is `pending`, `sent`, `failed`, or `skipped`; `read_at` controls the bell/unread count.

### `ingestion_runs`

Operational audit trail for source workers: start/completion times, status, record counters, and a sanitized error message.

### Schema relationships

```text
auth.users 1---1 users
users 1---N push_subscriptions
users 1---1 user_preferences
users 1---N notification_events
sources 1---N jobs
jobs N---N categories through job_categories
jobs 1---N notification_events
sources 1---N ingestion_runs
```

## Security and RLS

- Never commit `.env.local`, a Supabase service-role key, a database password, a VAPID private key, an FCM server key, or third-party API credentials.
- Only the Supabase anon/publishable key may be used in browser-facing configuration.
- Public users can read active jobs, active categories, enabled sources, and job-category links.
- Authenticated users can access only their own profile, subscriptions, preferences, and notifications.
- Admin ingestion writes must use a protected server worker, not a browser client.
- The public jobs API uses an explicit projection; do not change it to `select('*')` without reviewing data exposure.
- Validate and bound search/filter input to prevent expensive queries and wildcard abuse.
- Preserve source attribution and official URLs.
- Respect source terms of service, robots rules, rate limits, and API contracts.

## API contract

### `GET /api/jobs`

Returns active jobs with pagination.

```text
GET /api/jobs?search=engineer&category=banking&state=maharashtra&qualification=degree&page=1&limit=20
```

Supported parameters:

| Parameter | Description |
| --- | --- |
| `search` | Full-text search across indexed job title, organization, and description |
| `category` | Category slug such as `banking` or `railways` |
| `state` | Case-insensitive state filter |
| `qualification` | Qualification label contained in the job qualification array |
| `page` | Positive page number, maximum 10,000 |
| `limit` | Positive page size, maximum 50, default 20 |

Response shape:

```json
{
  "data": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

Invalid parameters return HTTP `400`. Database/configuration failures return HTTP `503`; query failures return HTTP `500` without exposing raw database errors.

### Planned endpoints

```text
GET    /api/jobs/:slug
GET    /api/categories
GET    /api/notifications
PATCH  /api/notifications/:id/read
POST   /api/push/subscribe
DELETE /api/push/subscribe
GET    /api/preferences
PUT    /api/preferences
POST   /api/admin/ingestion/run
GET    /api/admin/ingestion/runs
```

## Local development

### Prerequisites

- Node.js 22 LTS, 22.12 or later.
- npm.
- A Supabase project.
- Git for version control.

### Commands

```bash
npm install
copy .env.example .env.local       # Windows PowerShell/cmd
# cp .env.example .env.local       # macOS/Linux
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`.

The current environment previously lacked Node.js, so typecheck/build must be run after installing Node. Never report these checks as passed until they have actually run.

### Environment variables

Required for the public catalog:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Server-only future variables:

```dotenv
SUPABASE_SERVICE_ROLE_KEY=server-only-secret
VAPID_PUBLIC_KEY=public-web-push-key
VAPID_PRIVATE_KEY=server-only-web-push-key
VAPID_SUBJECT=mailto:alerts@example.com
FCM_PROJECT_ID=server-only-value
FCM_CLIENT_EMAIL=server-only-value
FCM_PRIVATE_KEY=server-only-value
```

Use a secret manager in production. The service-role and private push keys must never be prefixed with `NEXT_PUBLIC_`.

## Supabase setup

### Existing project

The development Supabase project is:

```text
https://mqjgqhlnvhqpastpbqzf.supabase.co
```

Do not place private database credentials in this README.

### Migration order

Apply in exact order:

```text
0001_initial_schema.sql
0002_rls_policies.sql
0003_job_search.sql
0004_public_catalog_access.sql
```

Migrations are not automatically idempotent in every statement. If `0001` reports that an enum or table already exists, do not blindly rerun the entire file; inspect the database and apply only the missing migration statements.

### Verify tables

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected application tables:

```text
categories
ingestion_runs
job_categories
jobs
notification_events
push_subscriptions
sources
user_preferences
users
```

### Verify policies

```sql
select tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

## Ingestion and scraper design

### Adapter contract

`lib/ingestion/types.ts` defines the initial contract:

```ts
type NormalizedJob = {
  externalId?: string;
  title: string;
  organization: string;
  description?: string;
  categorySlugs?: string[];
  qualification?: string[];
  state?: string;
  location?: string;
  vacancies?: number;
  salaryText?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  notificationPdfUrl?: string;
  officialApplyUrl: string;
  sourceUrl: string;
  publishedAt?: string;
};
```

Every adapter should:

1. Use a timeout and bounded response size.
2. Identify itself using a `parser_key`.
3. Respect rate limits and source terms.
4. Reject missing title, organization, official apply URL, or source URL.
5. Normalize dates and URLs.
6. Return only permitted content.
7. Be deterministic so repeated runs do not create duplicates.

### Recommended first sources

Start with one official RSS feed or documented public API, then add one permitted government HTML source. Do not begin with LinkedIn/Naukri scraping. The first adapter should prove ingestion, normalization, deduplication, database writes, and notification creation end to end.

### Fingerprint strategy

Normalize and hash:

```text
source slug
normalized title
normalized organization
application end date
canonical official apply URL
```

Use the fingerprint for upsert identity. Use a separate `content_hash` to detect meaningful updates to description, dates, vacancies, salary, and links.

### Worker pseudocode

```text
for each enabled source due for polling:
  create ingestion_run(status = running)
  fetch source with timeout and rate limit
  parse response using source.parser_key
  for each normalized job:
    validate required fields
    calculate fingerprint and content hash
    insert or update jobs
    resolve category slugs to job_categories
    if newly created:
      create notification matching candidates
  complete ingestion_run with counters
on error:
  complete ingestion_run(status = failed, sanitized error)
```

## Push notification design

### Subscription flow

1. Browser checks `Notification` and `serviceWorker` support.
2. User explicitly clicks **Enable alerts**.
3. Browser requests permission.
4. Service worker registers.
5. `pushManager.subscribe()` uses the public VAPID key.
6. Client sends the subscription object to `POST /api/push/subscribe`.
7. Server associates the subscription with the authenticated user and preferences.
8. A worker sends only matched notifications.
9. Invalid endpoints are marked inactive after a delivery failure.

### Notification payload

```json
{
  "type": "new_job",
  "jobId": "uuid",
  "title": "New government job notification",
  "body": "A new opening matches your alert preferences.",
  "url": "/jobs/example-job-slug"
}
```

Never put private credentials into a notification payload. The service worker should validate that URLs are same-origin or approved source links before opening them.

## PWA implementation plan

### Manifest

Add production icons in `public/icons/` with at least 192px and 512px sizes. Update `public/manifest.webmanifest` with `icons`, `scope`, `display`, `theme_color`, and a valid `start_url`.

### Service worker

Implement `public/sw.js` with:

- Versioned cache names.
- Cache-first strategy for app shell and icons.
- Network-first strategy for jobs/API data.
- Offline fallback page.
- `push` event handler.
- `notificationclick` handler.
- Cleanup of old caches during `activate`.

Do not cache personalized data in a shared cache. Keep user notification data private.

## LinkedIn and Naukri integration

LinkedIn and Naukri must be treated as restricted third-party sources. Use, in order of preference:

1. Official API.
2. Licensed partner feed.
3. Employer-provided feed.
4. Permitted RSS/public feed.
5. A public page only when automated access and republication are permitted.

Do not bypass login, CAPTCHA, robots restrictions, rate limits, or contractual controls. Do not mirror private job databases or copy full restricted descriptions. Store a permitted summary, attribution, source identifier, and original listing URL, then redirect the user to LinkedIn or Naukri.

## Deployment

### Web application

1. Push the repository to GitHub.
2. Import `ANIMAVE-E/niyukti` into Vercel or another Next.js host.
3. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host environment.
4. Configure production URL in Supabase Auth redirect settings.
5. Deploy and verify `/`, `/jobs`, and `/api/jobs`.

### Worker

Run ingestion separately from the web request lifecycle using one of:

- Supabase Edge Functions and scheduled invocations.
- GitHub Actions scheduled workflow for early prototypes.
- Cloud Run Jobs plus EventBridge/Cloud Scheduler.
- A managed queue and worker platform.

The worker needs server-only database access and source API credentials. It must write `ingestion_runs` for every run.

### Domain and HTTPS

Web Push requires HTTPS in production. Configure a custom domain, TLS, canonical metadata, sitemap, robots file, and correct Auth redirect URLs before public launch.

## Testing and observability

### Required checks

```bash
npm run typecheck
npm run build
```

Add a test runner and cover:

- Search returns matching active jobs.
- Expired/closed jobs are not publicly returned.
- Invalid pagination returns `400`.
- Wildcard/control-character filters are handled safely.
- Category filtering returns only the selected category.
- A job detail page renders official links.
- Duplicate source records update rather than duplicate.
- Invalid push subscriptions are deactivated.
- Users cannot read another user’s preferences or notifications.

### Monitoring metrics

Track:

- Source success/failure rate.
- Last successful source poll.
- Records seen/created/updated/skipped.
- Duplicate rate.
- Parse validation failures.
- Notification delivery success/failure.
- Invalid subscription count.
- API latency and error rates.
- Jobs expiring in the next 24/72 hours.

Do not log credentials, subscription authentication keys, database passwords, or full private source responses.

## Implementation roadmap

### Phase 1: Connect the application

- Add `.env.local` locally from Supabase API settings.
- Run `npm install`.
- Run typecheck and build.
- Verify `GET /api/jobs` against the live project.
- Apply migration `0004` if its grants have not been applied.

### Phase 2: Catalog UI

- Create a Supabase-backed jobs list.
- Add loading, empty, error, and pagination states.
- Add filter controls and URL query synchronization.
- Add `/jobs/[slug]` detail pages.
- Add official PDF and Apply Now links.
- Add source attribution and last-updated information.

### Phase 3: Authentication and preferences

- Add Supabase email or OAuth authentication.
- Create profile rows after signup.
- Add preference editor for category, state, qualification, and quiet hours.
- Add notification center and read/unread behavior.

### Phase 4: Ingestion

- Add source registry seed data.
- Implement one official RSS/API adapter.
- Implement normalization and deduplication.
- Add a protected ingestion route or worker.
- Add ingestion run dashboard and retry behavior.

### Phase 5: PWA and push

- Add icons and service worker.
- Add installability checks.
- Add Web Push subscription endpoint.
- Generate VAPID keys outside the repository.
- Add notification matching and delivery retries.

### Phase 6: Realtime and scale

- Add Supabase Realtime for new active jobs.
- Add database pagination improvements.
- Add `pg_trgm` or a dedicated search service if needed.
- Add queue-based notifications and dead-letter handling.
- Add source health alerts and admin tools.

### Phase 7: Private sources and launch

- Obtain approved LinkedIn/Naukri API or partner access.
- Implement attribution and source-specific retention rules.
- Add privacy policy, terms, disclaimer, and source policy pages.
- Perform security review, accessibility review, performance testing, and production launch checklist.

## Operating checklist

Before every release:

- [ ] No `.env.local` or secret files are staged.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Database migrations are applied in order.
- [ ] RLS policy query returns expected policies.
- [ ] Public API exposes only the approved projection.
- [ ] Official apply and notification links are valid.
- [ ] Source attribution is visible.
- [ ] Expired jobs are hidden or clearly marked.
- [ ] Push permission is requested only after user intent.
- [ ] Failed source polls are visible to operators.
- [ ] No restricted third-party data was copied without permission.
- [ ] GitHub commit is pushed and tagged when appropriate.

Before production launch:

- [ ] HTTPS domain configured.
- [ ] Supabase Auth redirect URLs configured.
- [ ] Production environment variables configured.
- [ ] Service worker tested on Android, iOS Safari, Chrome, Edge, and Firefox where supported.
- [ ] VAPID/FCM secrets stored in a secret manager.
- [ ] Database backups and retention verified.
- [ ] Privacy policy and terms published.
- [ ] Monitoring and alerts enabled.
- [ ] Rollback procedure documented.
