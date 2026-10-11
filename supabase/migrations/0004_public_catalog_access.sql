-- Public catalog consumers may read only the fields used by the catalog API.
-- RLS policies from 0002 still restrict rows to active/enabled catalog data.
drop policy if exists "Anyone can read job category links" on public.job_categories;

create policy "Anyone can read active job category links"
  on public.job_categories for select
  using (
    exists (
      select 1
      from public.jobs
      where jobs.id = job_categories.job_id
        and jobs.status = 'active'
    )
    and exists (
      select 1
      from public.categories
      where categories.id = job_categories.category_id
        and categories.is_active = true
    )
  );

revoke select on public.jobs, public.sources, public.categories, public.job_categories
  from anon, authenticated;

grant select (
  id,
  source_id,
  title,
  slug,
  organization,
  department,
  description,
  short_description,
  status,
  state,
  location,
  employment_type,
  qualification,
  age_limit_text,
  eligibility_text,
  total_vacancies,
  salary_min,
  salary_max,
  salary_text,
  pay_scale,
  application_start_date,
  application_end_date,
  exam_date,
  result_date,
  published_at,
  source_published_at,
  official_notification_url,
  official_apply_url,
  source_url,
  -- Generated from public title/organization/description for full-text filtering.
  search_document
)
  on public.jobs to anon, authenticated;

grant select (id, name, slug, organization, is_official)
  on public.sources to anon, authenticated;

grant select (id, name, slug, parent_id, description, display_order, is_active)
  on public.categories to anon, authenticated;

grant select (job_id, category_id)
  on public.job_categories to anon, authenticated;
