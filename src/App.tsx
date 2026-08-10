import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Building2, CalendarClock, ChevronLeft, ChevronRight, CircleDollarSign, RadioTower, Search, SlidersHorizontal } from "lucide-react";
import { searchGrants } from "./api";
import type { Grant, GrantResponse } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatMoney = (value?: number) => value ? money.format(value) : "Not stated";
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Rolling / TBD";

function GrantCard({ grant, index }: { grant: Grant; index: number }) {
  return (
    <article className="grant-card" style={{ "--delay": `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}>
      <div className="card-rule"><span>{grant.status}</span><span>{grant.opportunityNumber || "Federal opportunity"}</span></div>
      <div className="card-body">
        <div className="agency"><Building2 size={15} />{grant.agency}</div>
        <h2>{grant.title}</h2>
        <p>{grant.summary}</p>
        <div className="tags">{grant.themes.slice(0, 4).map((theme) => <span key={theme}>{theme}</span>)}</div>
      </div>
      <div className="card-footer">
        <dl>
          <div><dt><CalendarClock size={14} />Closes</dt><dd>{formatDate(grant.closeAt)}</dd></div>
          <div><dt><CircleDollarSign size={14} />Ceiling</dt><dd>{grant.awardCeilingLabel || formatMoney(grant.awardCeilingUsd)}</dd></div>
        </dl>
        <a href={grant.officialUrl} target="_blank" rel="noreferrer">Official notice <ArrowUpRight size={16} /></a>
      </div>
    </article>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("close-date-asc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<GrantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    searchGrants({ q: submittedQuery, status, sort, page, limit: 18 }, controller.signal)
      .then(setResult)
      .catch((caught) => { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Grant Radar could not reach the API."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [submittedQuery, status, sort, page]);

  const agencies = useMemo(() => new Set(result?.data.map((grant) => grant.agency)).size, [result]);
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedQuery(query); }

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="/"><img src="/radar-mark.svg" alt="" /><span>Grant Radar</span></a>
        <nav><a href="#results">Explore</a><a href="https://github.com/Wiplash-ai/grant-radar">Extension</a><a href="mailto:support@wiplash.ai">Contact</a></nav>
        <span className="byline">A Wiplash Labs field tool</span>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><RadioTower size={15} /> Official-source signal</div>
            <h1>Funding is out there.<br/><em>Find your signal.</em></h1>
            <p>Search active and forecasted U.S. government opportunities without wrestling a thicket of agency portals.</p>
          </div>
          <div className="radar-art" aria-hidden="true"><i/><i/><i/><span/></div>
        </section>

        <section className="search-deck" aria-label="Grant search">
          <form onSubmit={submit}>
            <label className="search-box"><Search size={22}/><span className="sr-only">Search grants</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="AI safety, rural broadband, clean energy…"/><button>Scan grants</button></label>
            <div className="filters">
              <span><SlidersHorizontal size={15}/> Refine signal</span>
              <label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Open + forecasted</option><option value="open">Open now</option><option value="forecasted">Forecasted</option></select></label>
              <label>Order<select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="close-date-asc">Deadline soonest</option><option value="posted-date-desc">Newest posted</option><option value="award-max-desc">Largest ceiling</option><option value="fit-desc">Wiplash fit</option><option value="agency-asc">Agency A–Z</option></select></label>
            </div>
          </form>
          <div className="deck-stats">
            <div data-index="01"><strong>{result?.pagination.total ?? "—"}</strong><span>matching opportunities</span></div>
            <div data-index="02"><strong>{agencies || "—"}</strong><span>agencies on this page</span></div>
            <div data-index="03"><strong>{result?.meta.last_refresh_at ? formatDate(result.meta.last_refresh_at) : "—"}</strong><span>source refresh</span></div>
          </div>
        </section>

        <section id="results" className="results-section">
          <div className="section-heading"><div><span>Current sweep</span><h2>{submittedQuery ? `Results for “${submittedQuery}”` : "Government grant opportunities"}</h2></div><p>Every result links back to an official government destination. Verify eligibility and deadlines before applying.</p></div>
          {error ? <div className="state error"><strong>The radar is quiet.</strong><span>{error}</span><button onClick={() => setSubmittedQuery((value) => value)}>Try again</button></div> : null}
          {loading ? <div className="state"><span className="pulse"/>Scanning official sources…</div> : null}
          {!loading && !error && result?.data.length === 0 ? <div className="state"><strong>No signal matched.</strong><span>Try a broader program, technology, population, or agency term.</span></div> : null}
          {!loading && !error ? <div className="results-grid">{result?.data.map((grant, index) => <GrantCard key={grant.key} grant={grant} index={index}/>)}</div> : null}
          {result && result.pagination.pages > 1 ? <div className="pagination"><button disabled={page <= 1} onClick={() => { setPage((value) => value - 1); window.scrollTo({ top: 520, behavior: "smooth" }); }}><ChevronLeft size={16}/>Previous</button><span>Page {page} of {result.pagination.pages}</span><button disabled={page >= result.pagination.pages} onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 520, behavior: "smooth" }); }}>Next<ChevronRight size={16}/></button></div> : null}
        </section>
      </main>
      <footer><div><img src="/radar-mark.svg" alt=""/><strong>Grant Radar</strong></div><p>Discovery support, not legal or eligibility advice. Official notices control.</p><a href="https://wiplash.ai">Wiplash.ai ↗</a></footer>
    </div>
  );
}
