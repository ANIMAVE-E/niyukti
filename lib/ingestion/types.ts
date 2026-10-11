export type NormalizedJob = {
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

export type SourceAdapter = {
  key: string;
  fetchJobs: () => Promise<NormalizedJob[]>;
};
