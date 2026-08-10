import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
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
import { homeSeo, searchSeo } from "./seo";
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

type DropdownOption = { value: string; label: string };

function facetOptions(defaultLabel: string, items: GrantFacetItem[] | undefined, selected: string): DropdownOption[] {
  const options = (items || []).map((item) => ({ value: item.value, label: `${item.value} (${item.count})` }));
  if (selected && !options.some((option) => option.value === selected)) options.unshift({ value: selected, label: selected });
  return [{ value: "", label: defaultLabel }, ...options];
}

function CustomDropdown({ label, value, options, icon, onChange }: {
  label: string;
  value: string;
  options: DropdownOption[];
  icon?: ReactNode;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingFocusRef = useRef<number | null>(null);
  const menuId = useId();
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    function closeOnOutsidePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsidePointer);
    return () => document.removeEventListener("mousedown", closeOnOutsidePointer);
  }, []);

  useEffect(() => {
    if (!open || pendingFocusRef.current === null) return;
    focusOption(pendingFocusRef.current);
    pendingFocusRef.current = null;
  }, [open]);

  function focusOption(index: number) {
    const optionButtons = rootRef.current?.querySelectorAll<HTMLButtonElement>("[role='option']");
    if (!optionButtons?.length) return;
    optionButtons[Math.max(0, Math.min(index, optionButtons.length - 1))]?.focus();
  }

  function openWithKeyboard(direction: 1 | -1) {
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
    pendingFocusRef.current = direction === 1 ? selectedIndex : options.length - 1;
    setOpen(true);
  }

  function handleOptionKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index + (event.key === "ArrowDown" ? 1 : -1));
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusOption(event.key === "Home" ? 0 : options.length - 1);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return <div className={`field-select${open ? " open" : ""}`} ref={rootRef}>
    <span className="field-select-label">{icon}{label}</span>
    <button
      ref={triggerRef}
      className="field-select-trigger"
      type="button"
      aria-haspopup="listbox"
      aria-label={`${label}: ${selected?.label}`}
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          openWithKeyboard(event.key === "ArrowDown" ? 1 : -1);
        }
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span>{selected?.label}</span><ChevronDown size={16}/>
    </button>
    {open ? <div className="field-select-menu" id={menuId} role="listbox" aria-label={label}>
      {options.map((option, index) => <button
        type="button"
        role="option"
        aria-selected={option.value === value}
        className="field-select-option"
        key={`${option.value}-${option.label}`}
        onKeyDown={(event) => handleOptionKey(event, index)}
        onClick={() => {
          onChange(option.value);
          setOpen(false);
          triggerRef.current?.focus();
        }}
      ><span>{option.label}</span>{option.value === value ? <Check size={15}/> : null}</button>)}
    </div> : null}
  </div>;
}

export default function App({ onSelectOpportunity, page: view = "home" }: { onSelectOpportunity: (id: string) => void; page?: "home" | "search" }) {
  const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
  const isSearchPage = view === "search";
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
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

  useEffect(() => {
    if (isSearchPage) searchSeo(total || undefined);
    else homeSeo(total || undefined);
  }, [isSearchPage, total]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSubmittedQuery(query);
    if (isSearchPage) {
      const search = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      window.history.replaceState({}, "", `/search${search}#results`);
    }
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
    if (isSearchPage) window.history.replaceState({}, "", "/search");
  }

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className={isSearchPage ? "registry-page" : undefined}>
        {!isSearchPage ? <>
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
          <div><span>01</span><strong>{total || "—"}</strong><small>Funding opportunities</small></div>
          <div><span>02</span><strong>{agencies || "—"}</strong><small>Grantmaking agencies</small></div>
          <div><span>03</span><strong>Decision ready</strong><small>Eligibility, amounts &amp; contacts</small></div>
          <div><span>04</span><strong>{result?.meta.last_refresh_at ? formatDate(result.meta.last_refresh_at) : "Daily"}</strong><small>Last official-source sync</small></div>
        </section>
        </> : null}

        <section id="search" className={`search-command${isSearchPage ? " search-command-page" : ""}`} aria-label="Grant search">
          <div className="command-heading">
            <span className="section-number">01</span>
            <div><span>{isSearchPage ? "Dedicated registry" : "Funding desk"}</span><h2>What do you need to fund?</h2></div>
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
                <CustomDropdown label="Status" value={filters.status} onChange={(value) => updateFilter("status", value)} options={[{ value: "", label: "Open + forecasted" }, { value: "open", label: "Open now" }, { value: "forecasted", label: "Forecasted" }]}/>
                <CustomDropdown label="Funding purpose" value={filters.fundingCategory} onChange={(value) => updateFilter("fundingCategory", value)} options={facetOptions("Every category", result?.meta.facets?.fundingCategories, filters.fundingCategory)}/>
                <CustomDropdown label="Who can apply" icon={<UsersRound size={14}/>} value={filters.eligibleApplicant} onChange={(value) => updateFilter("eligibleApplicant", value)} options={facetOptions("Any applicant type", result?.meta.facets?.eligibleApplicants, filters.eligibleApplicant)}/>
                <CustomDropdown label="Agency" value={filters.agency} onChange={(value) => updateFilter("agency", value)} options={facetOptions("Every agency", result?.meta.facets?.agencies, filters.agency)}/>
                <CustomDropdown label="Funding instrument" value={filters.fundingInstrument} onChange={(value) => updateFilter("fundingInstrument", value)} options={facetOptions("Any instrument", result?.meta.facets?.fundingInstruments, filters.fundingInstrument)}/>
                <CustomDropdown label="Minimum available" value={filters.minAward} onChange={(value) => updateFilter("minAward", value)} options={[{ value: "", label: "Any amount" }, { value: "10000", label: "$10,000+" }, { value: "50000", label: "$50,000+" }, { value: "100000", label: "$100,000+" }, { value: "500000", label: "$500,000+" }, { value: "1000000", label: "$1 million+" }]}/>
                <CustomDropdown label="Deadline window" value={filters.deadlineDays} onChange={(value) => updateFilter("deadlineDays", value)} options={[{ value: "", label: "Any deadline" }, { value: "30", label: "Next 30 days" }, { value: "60", label: "Next 60 days" }, { value: "90", label: "Next 90 days" }, { value: "180", label: "Next 6 months" }]}/>
                <CustomDropdown label="Sort results" value={filters.sort} onChange={(value) => updateFilter("sort", value)} options={[{ value: "relevance-desc", label: "Best match" }, { value: "close-date-asc", label: "Deadline soonest" }, { value: "posted-date-desc", label: "Newest posted" }, { value: "award-max-desc", label: "Largest funding amount" }, { value: "fit-desc", label: "Most complete record" }, { value: "agency-asc", label: "Agency A–Z" }, { value: "title-asc", label: "Title A–Z" }]}/>
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
