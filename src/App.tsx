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
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { searchGrants } from "./api";
import { homeSeo } from "./seo";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import type { Grant, GrantFacetItem, GrantResponse } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatMoney = (value?: number) => value ? money.format(value) : "Not stated";
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Rolling / TBD";
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

type Filters = {
  status: string;
  agency: string;
  fundingCategory: string;
  fundingInstrument: string;
  eligibleApplicant: string;
  minAward: string;
  deadlineDays: string;
  hasFundingAmount: boolean;
  sort: string;
};

const initialFilters: Filters = {
  status: "",
  agency: "",
  fundingCategory: "",
  fundingInstrument: "",
  eligibleApplicant: "",
  minAward: "",
  deadlineDays: "",
  hasFundingAmount: false,
  sort: "relevance-desc"
};

function GrantCard({ grant, index, onSelect }: { grant: Grant; index: number; onSelect: (id: string) => void }) {
  const id = grant.key.replace(/^opportunity:/, "");
  const category = grant.fundingActivityCategories?.[0] || grant.themes?.[0];
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
        <p>{grant.descriptionExcerpt || grant.summary}</p>
        <div className="tags">
          {category ? <span>{category}</span> : null}
          {grant.fundingInstrumentTypes?.slice(0, 2).map((instrument) => <span key={instrument}>{instrument}</span>)}
          {grant.eligibleApplicants?.slice(0, 1).map((applicant) => <span key={applicant}>{applicant}</span>)}
        </div>
      </div>
      <aside className="card-brief">
        <dl>
          <div><dt><CalendarClock size={14} /> Deadline</dt><dd>{formatDate(grant.closeAt)}</dd></div>
          <div><dt><CircleDollarSign size={14} /> Available funding</dt><dd>{grant.awardCeilingLabel || formatMoney(grant.programFundingUsd || grant.awardCeilingUsd)}</dd></div>
          <div><dt><Compass size={14} /> Record signal</dt><dd>{grant.fitScore}/100</dd></div>
        </dl>
        <a href={`/opportunity/${id}`} onClick={(event) => { event.preventDefault(); onSelect(id); }}>Open the funding briefing <ArrowUpRight size={16} /></a>
      </aside>
    </article>
  );
}

function Options({ items, selected }: { items: GrantFacetItem[] | undefined; selected: string }) {
  const values = items || [];
  const hasSelected = values.some((item) => item.value === selected);
  return <>{selected && !hasSelected ? <option value={selected}>{selected}</option> : null}{values.map((item) => <option key={item.value} value={item.value}>{item.value} ({item.count})</option>)}</>;
}

export default function App({ onSelectOpportunity }: { onSelectOpportunity: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<GrantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchGrants({ q: submittedQuery, ...filters, page, limit: 12 }, controller.signal)
      .then(setResult)
      .catch((caught) => {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Grant Grinder could not reach the API.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [submittedQuery, filters, page]);

  const activeFilterCount = useMemo(() => Object.entries(filters).filter(([key, value]) => key !== "sort" && Boolean(value)).length, [filters]);
  const agencies = result?.meta.facets?.agencies.length || 0;
  const total = result?.pagination.total ?? 0;

  useEffect(() => { homeSeo(total || undefined); }, [total]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSubmittedQuery(query);
    if (query.trim()) setFilters((current) => ({ ...current, sort: "relevance-desc" }));
  }

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setSubmittedQuery("");
    setFilters(initialFilters);
    setPage(1);
  }

  return (
    <div className="page-shell">
      <SiteHeader />

      <main>
        <section id="mission" className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><ShieldCheck size={16} /> Every current federal opportunity / refreshed daily</div>
            <h1>Stop missing funding<br/><em>you can act on.</em></h1>
            <p>Your nonprofit, school, business, tribe, city, research team, or community project deserves a fair shot. Find the federal opportunities that fit your work before the deadline passes.</p>
            <div className="hero-actions">
              <a className="primary-action" href="#search">Find funding for your work <ArrowDown size={16} /></a>
              <a className="text-action" href="/developers">Build with the grants API <ArrowUpRight size={15} /></a>
            </div>
            <div className="mission-tags" aria-label="Funding sectors in the catalog">
              <span>Small business</span><span>Nonprofits</span><span>Education</span><span>Agriculture</span><span>Arts</span><span>Housing</span><span>Health</span><span>Tribal programs</span><span>Climate</span><span>Community development</span>
            </div>
          </div>
          <figure className="hero-visual">
            <img src="/grant-radar-field-team-v2.webp" alt="Civil engineers reviewing infrastructure plans at a reservoir field site." />
            <div className="image-grid" aria-hidden="true" />
            <figcaption>
              <span>Funding belongs in the field</span>
              <strong>Turn a public need into funded work.</strong>
              <small>Original Wiplash Labs visual concept</small>
            </figcaption>
          </figure>
        </section>

        <section className="service-strip" aria-label="Grant catalog summary">
          <div><span>01</span><strong>{total || "—"}</strong><small>Current opportunities</small></div>
          <div><span>02</span><strong>{agencies || "—"}</strong><small>Federal agencies</small></div>
          <div><span>03</span><strong>All fields</strong><small>Eligibility through contacts</small></div>
          <div><span>04</span><strong>{result?.meta.last_refresh_at ? formatDate(result.meta.last_refresh_at) : "Daily"}</strong><small>Catalog refresh</small></div>
        </section>

        <section id="search" className="search-command" aria-label="Grant search">
          <div className="command-heading">
            <span className="section-number">01</span>
            <div><span>Funding desk</span><h2>What do you need to fund?</h2></div>
            <p>Search the full current federal catalog by the people you serve, the work you do, your organization type, or a specific agency.</p>
          </div>
          <form onSubmit={submit}>
            <label className="search-box">
              <Search size={24} />
              <span className="sr-only">Search grants</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “after-school arts,” “farm equipment,” or “veteran housing”…" />
              <button>Find matching grants <ArrowUpRight size={16} /></button>
            </label>
            <div className="filter-panel">
              <div className="filter-panel-heading">
                <span><SlidersHorizontal size={15}/> Narrow the field {activeFilterCount ? <b>{activeFilterCount}</b> : null}</span>
                <button type="button" onClick={clearFilters}><RotateCcw size={13}/> Clear all</button>
              </div>
              <div className="filter-grid">
                <label>Status<select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">Open + forecasted</option><option value="open">Open now</option><option value="forecasted">Forecasted</option></select></label>
                <label>Funding purpose<select value={filters.fundingCategory} onChange={(event) => updateFilter("fundingCategory", event.target.value)}><option value="">Every category</option><Options items={result?.meta.facets?.fundingCategories} selected={filters.fundingCategory}/></select></label>
                <label><UsersRound size={13}/> Who can apply<select value={filters.eligibleApplicant} onChange={(event) => updateFilter("eligibleApplicant", event.target.value)}><option value="">Any applicant type</option><Options items={result?.meta.facets?.eligibleApplicants} selected={filters.eligibleApplicant}/></select></label>
                <label>Agency<select value={filters.agency} onChange={(event) => updateFilter("agency", event.target.value)}><option value="">Every agency</option><Options items={result?.meta.facets?.agencies} selected={filters.agency}/></select></label>
                <label>Funding instrument<select value={filters.fundingInstrument} onChange={(event) => updateFilter("fundingInstrument", event.target.value)}><option value="">Any instrument</option><Options items={result?.meta.facets?.fundingInstruments} selected={filters.fundingInstrument}/></select></label>
                <label>Minimum available<select value={filters.minAward} onChange={(event) => updateFilter("minAward", event.target.value)}><option value="">Any amount</option><option value="10000">$10,000+</option><option value="50000">$50,000+</option><option value="100000">$100,000+</option><option value="500000">$500,000+</option><option value="1000000">$1 million+</option></select></label>
                <label>Deadline window<select value={filters.deadlineDays} onChange={(event) => updateFilter("deadlineDays", event.target.value)}><option value="">Any deadline</option><option value="30">Next 30 days</option><option value="60">Next 60 days</option><option value="90">Next 90 days</option><option value="180">Next 6 months</option></select></label>
                <label>Sort results<select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}><option value="relevance-desc">Best match</option><option value="close-date-asc">Deadline soonest</option><option value="posted-date-desc">Newest posted</option><option value="award-max-desc">Largest funding amount</option><option value="fit-desc">Most complete record</option><option value="agency-asc">Agency A–Z</option><option value="title-asc">Title A–Z</option></select></label>
              </div>
              <label className="funding-only"><input type="checkbox" checked={filters.hasFundingAmount} onChange={(event) => updateFilter("hasFundingAmount", event.target.checked)}/><span>Only show records with a published funding amount</span></label>
            </div>
          </form>
        </section>

        <section id="results" className="results-section">
          <div className="section-heading">
            <div className="section-number">02</div>
            <div><span>Opportunity registry</span><h2>{submittedQuery ? `Funding matches for “${submittedQuery}”` : "Current federal opportunities"}</h2></div>
            <div className="result-summary"><strong>{total || "—"}</strong><span>matches after filters</span></div>
          </div>
          <div className="registry-note"><ShieldCheck size={16} /><span>We reorganize official public data for faster decisions. The linked government notice controls eligibility, dates, and application requirements.</span></div>
          {error ? <div className="state error"><strong>The registry is unavailable.</strong><span>{error}</span><button onClick={() => setSubmittedQuery((value) => value)}>Try again</button></div> : null}
          {loading ? <div className="state"><span className="pulse"/>Scanning the federal catalog…</div> : null}
          {!loading && !error && result?.data.length === 0 ? <div className="state"><strong>No opportunity matched.</strong><span>Remove a filter or try a broader description of the people or work you need to fund.</span><button onClick={clearFilters}>Reset the search</button></div> : null}
          {!loading && !error ? <div className="results-list">{result?.data.map((grant, index) => <GrantCard key={grant.key} grant={grant} index={index} onSelect={onSelectOpportunity}/>)}</div> : null}
          {result && result.pagination.pages > 1 ? <div className="pagination"><button disabled={page <= 1} onClick={() => { setPage((value) => value - 1); document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }); }}><ChevronLeft size={16}/>Previous</button><span>Page {page} / {result.pagination.pages}</span><button disabled={page >= result.pagination.pages} onClick={() => { setPage((value) => value + 1); document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }); }}>Next<ChevronRight size={16}/></button></div> : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
