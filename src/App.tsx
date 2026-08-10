import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { searchGrants } from "./api";
import type { Grant, GrantResponse } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatMoney = (value?: number) => value ? money.format(value) : "Not stated";
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Rolling / TBD";
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function GrantCard({ grant, index }: { grant: Grant; index: number }) {
  return (
    <article className="grant-card" style={{ "--delay": `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}>
      <div className="card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
      <div className="card-content">
        <div className="card-classification">
          <span className={`status-badge ${grant.status}`}>{titleCase(grant.status)}</span>
          <span>{grant.opportunityNumber || "Federal opportunity"}</span>
          <span className="card-agency"><Building2 size={13} /> {grant.agency}</span>
        </div>
        <h2>{grant.title}</h2>
        <p>{grant.summary}</p>
        <div className="tags">{grant.themes.slice(0, 4).map((theme) => <span key={theme}>{theme}</span>)}</div>
      </div>
      <aside className="card-brief">
        <dl>
          <div><dt><CalendarClock size={14} /> Deadline</dt><dd>{formatDate(grant.closeAt)}</dd></div>
          <div><dt><CircleDollarSign size={14} /> Award ceiling</dt><dd>{grant.awardCeilingLabel || formatMoney(grant.awardCeilingUsd)}</dd></div>
          <div><dt><Compass size={14} /> Match signal</dt><dd>{grant.fitScore}/100</dd></div>
        </dl>
        <a href={grant.officialUrl} target="_blank" rel="noreferrer">Read official notice <ArrowUpRight size={16} /></a>
      </aside>
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
    setLoading(true);
    setError("");
    searchGrants({ q: submittedQuery, status, sort, page, limit: 12 }, controller.signal)
      .then(setResult)
      .catch((caught) => {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Grant Radar could not reach the API.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [submittedQuery, status, sort, page]);

  const agencies = useMemo(() => new Set(result?.data.map((grant) => grant.agency)).size, [result]);
  const total = result?.pagination.total ?? 0;
  function submit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSubmittedQuery(query);
  }

  return (
    <div className="page-shell">
      <div className="utility-bar">
        <span>Wiplash Labs / Public Funding Intelligence</span>
        <span className="catalog-status"><i /> Official-source catalog online</span>
      </div>
      <header className="site-header">
        <a className="brand" href="/">
          <img src="/radar-mark.svg" alt="" />
          <span><strong>Grant Radar</strong><small>Federal Opportunity Desk</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#mission">Mission</a>
          <a href="#search">Find funding</a>
          <a href="https://github.com/Wiplash-ai/grant-radar">Get the extension</a>
        </nav>
        <a className="header-cta" href="#search">Search the registry <ArrowDown size={14} /></a>
      </header>

      <main>
        <section id="mission" className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><ShieldCheck size={16} /> Mission briefing / FY 2026</div>
            <h1>Fund the mission.<br/><em>Build what matters.</em></h1>
            <p>Turn the federal grants catalog into a clear field of opportunity. Search active and forecasted programs, assess the signal, and move directly to the official notice.</p>
            <div className="hero-actions">
              <a className="primary-action" href="#search">Explore {total || 274} opportunities <ArrowDown size={16} /></a>
              <a className="text-action" href="https://github.com/Wiplash-ai/grant-radar">Deploy the browser extension <ArrowUpRight size={15} /></a>
            </div>
            <div className="mission-tags" aria-label="Featured funding sectors">
              <span>Science</span><span>Infrastructure</span><span>Public health</span><span>Technology</span>
            </div>
          </div>
          <figure className="hero-visual">
            <img src="/usace-field-planning.jpg" alt="U.S. Army Corps of Engineers staff reviewing field survey plans beside a creek." />
            <div className="image-grid" aria-hidden="true" />
            <figcaption>
              <span>Field report / Public infrastructure</span>
              <strong>Funding becomes work in the field.</strong>
              <small>U.S. Army Corps of Engineers · Omaha District</small>
            </figcaption>
          </figure>
        </section>

        <section className="service-strip" aria-label="Grant catalog summary">
          <div><span>01</span><strong>{total || "—"}</strong><small>Opportunities indexed</small></div>
          <div><span>02</span><strong>{agencies || "—"}</strong><small>Agencies in this briefing</small></div>
          <div><span>03</span><strong>Official</strong><small>Source-linked notices</small></div>
          <div><span>04</span><strong>{result?.meta.last_refresh_at ? formatDate(result.meta.last_refresh_at) : "Daily"}</strong><small>Registry refresh</small></div>
        </section>

        <section id="search" className="search-command" aria-label="Grant search">
          <div className="command-heading">
            <span className="section-number">01</span>
            <div><span>Opportunity command</span><h2>What are you building?</h2></div>
            <p>Describe a program, technology, community, or public need. We’ll scan every current source record.</p>
          </div>
          <form onSubmit={submit}>
            <label className="search-box">
              <Search size={24} />
              <span className="sr-only">Search grants</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “rural healthcare,” “AI safety,” or “clean water”…" />
              <button>Search opportunities <ArrowUpRight size={16} /></button>
            </label>
            <div className="filters">
              <span><SlidersHorizontal size={15}/> Refine the briefing</span>
              <label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Open + forecasted</option><option value="open">Open now</option><option value="forecasted">Forecasted</option></select></label>
              <label>Order<select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="close-date-asc">Deadline soonest</option><option value="posted-date-desc">Newest posted</option><option value="award-max-desc">Largest ceiling</option><option value="fit-desc">Strongest signal</option><option value="agency-asc">Agency A–Z</option></select></label>
            </div>
          </form>
        </section>

        <section id="results" className="results-section">
          <div className="section-heading">
            <div className="section-number">02</div>
            <div><span>Opportunity registry</span><h2>{submittedQuery ? `Results for “${submittedQuery}”` : "Current federal opportunities"}</h2></div>
            <div className="result-summary"><strong>{total || "—"}</strong><span>matches in the current sweep</span></div>
          </div>
          <div className="registry-note"><ShieldCheck size={16} /><span>Every record routes to an official government destination. Official notices control eligibility, dates, and application requirements.</span></div>
          {error ? <div className="state error"><strong>The registry is unavailable.</strong><span>{error}</span><button onClick={() => setSubmittedQuery((value) => value)}>Try again</button></div> : null}
          {loading ? <div className="state"><span className="pulse"/>Scanning official sources…</div> : null}
          {!loading && !error && result?.data.length === 0 ? <div className="state"><strong>No opportunity matched.</strong><span>Try a broader program, technology, population, or agency term.</span></div> : null}
          {!loading && !error ? <div className="results-list">{result?.data.map((grant, index) => <GrantCard key={grant.key} grant={grant} index={index}/>)}</div> : null}
          {result && result.pagination.pages > 1 ? <div className="pagination"><button disabled={page <= 1} onClick={() => { setPage((value) => value - 1); document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }); }}><ChevronLeft size={16}/>Previous briefing</button><span>Page {page} / {result.pagination.pages}</span><button disabled={page >= result.pagination.pages} onClick={() => { setPage((value) => value + 1); document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }); }}>Next briefing<ChevronRight size={16}/></button></div> : null}
        </section>
      </main>

      <footer>
        <div className="footer-brand"><img src="/radar-mark.svg" alt=""/><span><strong>Grant Radar</strong><small>A Wiplash Labs field tool</small></span></div>
        <p>Discovery support—not legal, eligibility, or application advice. <a href="https://www.dvidshub.net/image/8521138/levee-inspection-team-papillion-creek-nebraska-june-28-2024" target="_blank" rel="noreferrer">Hero image: USACE Omaha District.</a></p>
        <a href="https://wiplash.ai">Wiplash.ai <ArrowUpRight size={14}/></a>
      </footer>
    </div>
  );
}
