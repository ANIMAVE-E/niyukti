create extension if not exists pgcrypto;

create type public.source_type as enum ('government', 'private', 'rss', 'api', 'html', 'partner_feed');
create type public.job_status as enum ('active', 'expired', 'closed', 'draft');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'skipped');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  phone text,
  preferred_language text not null default 'en',
  preferred_state text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  source_type public.source_type not null,
  organization text,
  base_url text not null,
  feed_url text,
  parser_key text not null,
  is_official boolean not null default false,
  is_enabled boolean not null default true,
  polling_interval_seconds integer not null default 900,
  last_started_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete restrict,
  external_id text,
  fingerprint text not null unique,
  title text not null,
  slug text not null unique,
  organization text not null,
  department text,
  description text,
  short_description text,
  status public.job_status not null default 'active',
  state text,
  location text,
  employment_type text,
  qualification text[],
  age_limit_text text,
  eligibility_text text,
  total_vacancies integer,
  salary_min numeric,
  salary_max numeric,
  salary_text text,
  pay_scale text,
  application_start_date date,
  application_end_date date,
  exam_date date,
  result_date date,
  published_at timestamptz,
  source_published_at timestamptz,
  official_notification_url text,
  official_apply_url text not null,
  source_url text not null,
  content_hash text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_application_dates check (application_end_date is null or application_start_date is null or application_end_date >= application_start_date),
  constraint valid_vacancies check (total_vacancies is null or total_vacancies >= 0)
);

create table public.job_categories (
  job_id uuid not null references public.jobs(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (job_id, category_id)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text,
  auth_key text,
  fcm_token text unique,
  provider text not null default 'web_push',
  device_type text,
  browser text,
  operating_system text,
  is_active boolean not null default true,
  last_used_at timestamptz,
  failure_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  categories uuid[],
  qualifications text[],
  states text[],
  notify_new_jobs boolean not null default true,
  notify_deadline_reminders boolean not null default true,
  notify_private_jobs boolean not null default true,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  message text not null,
  action_url text,
  status public.notification_status not null default 'pending',
  read_at timestamptz,
  sent_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  status text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  records_seen integer not null default 0,
  records_created integer not null default 0,
  records_updated integer not null default 0,
  records_skipped integer not null default 0,
  error_message text
);

create index jobs_status_idx on public.jobs(status);
create index jobs_end_date_idx on public.jobs(application_end_date);
create index jobs_source_idx on public.jobs(source_id);
create index jobs_state_idx on public.jobs(state);
create index jobs_published_at_idx on public.jobs(published_at desc);
create index notification_events_user_idx on public.notification_events(user_id, created_at desc);

insert into public.categories (name, slug, description, display_order) values
  ('Central Government', 'central-government', 'UPSC, SSC and central ministries', 1),
  ('State Government', 'state-government', 'State PSC and state department jobs', 2),
  ('Banking', 'banking', 'IBPS, SBI and public-sector bank jobs', 3),
  ('Railways', 'railways', 'RRB and railway zone recruitment', 4),
  ('Defense', 'defense', 'Army, Navy, Air Force and defense services', 5),
  ('Private Jobs', 'private-jobs', 'Jobs from approved private feeds', 6);
