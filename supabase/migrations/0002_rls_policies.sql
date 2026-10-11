alter table public.sources enable row level security;
alter table public.categories enable row level security;
alter table public.jobs enable row level security;
alter table public.job_categories enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.notification_events enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.users enable row level security;

create policy "Anyone can read active jobs"
  on public.jobs for select
  using (status = 'active');

create policy "Anyone can read active categories"
  on public.categories for select
  using (is_active = true);

create policy "Anyone can read enabled sources"
  on public.sources for select
  using (is_enabled = true);

create policy "Anyone can read job category links"
  on public.job_categories for select
  using (true);

create policy "Users can read their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can manage their own subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their own notifications"
  on public.notification_events for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notification_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS limits rows, not columns. Never let clients grant themselves admin
-- privileges or rewrite notification payloads/delivery state.
revoke update on public.users from anon, authenticated;
grant update (display_name, phone, preferred_language, preferred_state)
  on public.users to authenticated;
revoke update on public.notification_events from anon, authenticated;
grant update (read_at) on public.notification_events to authenticated;
