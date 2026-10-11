alter table public.jobs add column search_document tsvector
generated always as (
  to_tsvector('english', coalesce(title, '') || ' ' ||
    coalesce(organization, '') || ' ' || coalesce(description, ''))
) stored;

create index jobs_search_document_idx on public.jobs using gin(search_document);
