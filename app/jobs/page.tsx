type JobsPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const query = params.search?.trim();

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">niyukti<span>.</span></a>
        <a className="muted" href="/">Back to home</a>
      </header>
      <section className="content" style={{ paddingTop: "3rem" }}>
        <div className="section-heading">
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Job openings</h1>
          <span className="muted">{query ? `Search: ${query}` : "All jobs"}</span>
        </div>
        <div className="empty">
          <strong>Job catalogue is not connected yet.</strong>
          <p>Once the first permitted source is ingested, matching openings will appear here with official application links.</p>
        </div>
      </section>
    </main>
  );
}
