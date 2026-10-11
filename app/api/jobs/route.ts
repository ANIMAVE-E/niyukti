import { NextRequest, NextResponse } from "next/server";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_LIMIT = 50;
const MAX_PAGE = 10_000;
const MAX_SEARCH_LENGTH = 200;
const MAX_FILTER_LENGTH = 100;

const JOB_COLUMNS =
  "id, source_id, title, slug, organization, department, description, short_description, status, state, location, employment_type, qualification, age_limit_text, eligibility_text, total_vacancies, salary_min, salary_max, salary_text, pay_scale, application_start_date, application_end_date, exam_date, result_date, published_at, source_published_at, official_notification_url, official_apply_url, source_url" as const;

const JOB_SELECT = `${JOB_COLUMNS}, sources(name, slug, organization, is_official), job_categories(categories(name, slug))`;
const JOB_SELECT_WITH_CATEGORY = `${JOB_COLUMNS}, sources(name, slug, organization, is_official), job_categories!inner(categories!inner(name, slug))`;

type CatalogSource = Pick<Tables<"sources">, "name" | "slug" | "organization" | "is_official">;
type CatalogCategory = Pick<Tables<"categories">, "name" | "slug">;
type CatalogJob = Pick<
  Tables<"jobs">,
  | "id"
  | "source_id"
  | "title"
  | "slug"
  | "organization"
  | "department"
  | "description"
  | "short_description"
  | "status"
  | "state"
  | "location"
  | "employment_type"
  | "qualification"
  | "age_limit_text"
  | "eligibility_text"
  | "total_vacancies"
  | "salary_min"
  | "salary_max"
  | "salary_text"
  | "pay_scale"
  | "application_start_date"
  | "application_end_date"
  | "exam_date"
  | "result_date"
  | "published_at"
  | "source_published_at"
  | "official_notification_url"
  | "official_apply_url"
  | "source_url"
> & {
  sources: CatalogSource | null;
  job_categories: Array<{ categories: CatalogCategory | null }>;
};

type JobsResponse = {
  data: CatalogJob[];
  page: number;
  limit: number;
  total: number;
};

class InvalidQueryError extends Error {}

function getOptionalParam(
  params: URLSearchParams,
  name: string,
  maxLength: number,
): string | undefined {
  const value = params.get(name)?.trim();
  if (!value) return undefined;
  if (value.length > maxLength || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new InvalidQueryError(`Invalid ${name} filter.`);
  }
  return value;
}

function getPositiveInteger(
  params: URLSearchParams,
  name: string,
  defaultValue: number,
  max: number,
): number {
  const raw = params.get(name)?.trim();
  if (!raw) return defaultValue;
  if (!/^\d+$/.test(raw)) throw new InvalidQueryError("Invalid pagination.");

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > max) {
    throw new InvalidQueryError("Invalid pagination.");
  }
  return value;
}

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function parseFilters(params: URLSearchParams) {
  const category = getOptionalParam(params, "category", MAX_FILTER_LENGTH);
  if (category && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) {
    throw new InvalidQueryError("Invalid category filter.");
  }

  return {
    search: getOptionalParam(params, "search", MAX_SEARCH_LENGTH),
    category,
    state: getOptionalParam(params, "state", MAX_FILTER_LENGTH),
    qualification: getOptionalParam(params, "qualification", MAX_FILTER_LENGTH),
    page: getPositiveInteger(params, "page", 1, MAX_PAGE),
    limit: getPositiveInteger(params, "limit", 20, MAX_LIMIT),
  };
}

export async function GET(request: NextRequest) {
  let filters: ReturnType<typeof parseFilters>;
  try {
    filters = parseFilters(request.nextUrl.searchParams);
  } catch (error) {
    if (error instanceof InvalidQueryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }

  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("jobs")
      .select(filters.category ? JOB_SELECT_WITH_CATEGORY : JOB_SELECT, { count: "exact" })
      .eq("status", "active")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (filters.search) {
      query = query.textSearch("search_document", filters.search, {
        type: "websearch",
        config: "english",
      });
    }

    if (filters.state) {
      query = query.ilike("state", `%${escapeIlikePattern(filters.state)}%`);
    }
    if (filters.qualification) {
      query = query.contains("qualification", [filters.qualification]);
    }
    if (filters.category) {
      query = query.eq("job_categories.categories.slug", filters.category);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Unable to load jobs." }, { status: 500 });
    }

    return NextResponse.json<JobsResponse>({
      data: (data ?? []) as CatalogJob[],
      page: filters.page,
      limit: filters.limit,
      total: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Job service is not configured or unavailable." }, { status: 503 });
  }
}
