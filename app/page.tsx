import { Bell, Search, ShieldCheck } from "lucide-react";

const categories = [
  ["Central Government", "UPSC, SSC and ministries"],
  ["Banking", "IBPS, SBI and public banks"],
  ["Railways", "RRB and railway zones"],
  ["Defense", "Army, Navy and Air Force"],
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">niyukti<span>.</span></a>
        <nav className="nav" aria-label="Primary navigation">
          <a href="#categories">Categories</a>
          <a href="#latest">Latest jobs</a>
          <a href="#alerts"><Bell size={16} /> Alerts</a>
        </nav>
      </header>
      <section className="hero">
        <div className="eyebrow"><ShieldCheck size={14} /> Verified source links</div>
        <h1>Find your next government opportunity.</h1>
        <p className="lead">One trusted place for fresh government, public-sector and approved private job openings. We send you to the official application portal.</p>
        <form className="search" action="/jobs" method="get">
          <input name="search" aria-label="Search jobs" placeholder="Search by role, organization or qualification" />
          <button className="button" type="submit"><Search size={17} /> Search jobs</button>
        </form>
      </section>
      <section className="content" id="categories">
        <div className="grid">
          {categories.map(([title, description]) => <article className="card" key={title}><strong>{title}</strong><p>{description}</p></article>)}
        </div>
        <div className="section-heading" id="latest"><h2>Latest openings</h2><span className="muted">Live catalogue coming next</span></div>
        <div className="empty">No jobs have been ingested yet. Connect an approved source and run the first ingestion to populate this feed.</div>
        <div className="section-heading" id="alerts"><h2>Stay ahead of deadlines</h2></div>
        <div className="card"><strong>Push notifications are coming next</strong><p>Subscribe once the service worker and notification preferences are connected. You will be able to choose categories, qualifications and states.</p></div>
      </section>
    </main>
  );
}
