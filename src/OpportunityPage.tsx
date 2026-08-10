import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Landmark,
  Mail,
  Route,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { getGrant } from "./api";
import { opportunitySeo } from "./seo";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import type { GrantDetail } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatMoney = (value?: number) => value ? money.format(value) : "Not stated";
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Rolling / TBD";
const meaningful = (value?: string) => value && !/^(--|not stated|none)$/i.test(value.trim()) ? value : undefined;

function missionSummary(description: string) {
  const normalized = description.replace(/\s+/g, " ").trim();
  const sentences = typeof Intl.Segmenter === "function"
    ? [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(normalized)].map(({ segment }) => segment)
    : normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const selected: string[] = [];
  for (const sentence of sentences) {
    if (selected.join(" ").length + sentence.length > 620) {
      if (!selected.length) return `${sentence.slice(0, 600).replace(/\s+\S*$/, "").trimEnd()}…`;
      break;
    }
    selected.push(sentence.trim());
    if (selected.length >= 3) break;
  }
  return selected.join(" ");
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return <div><dt>{label}</dt><dd>{meaningful(value) || "Not stated"}</dd></div>;
}

export default function OpportunityPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [grant, setGrant] = useState<GrantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getGrant(id, controller.signal)
      .then(({ data }) => {
        setGrant(data);
        opportunitySeo(data);
      })
      .catch((caught) => { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Unable to load this opportunity."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const description = grant?.details?.description || grant?.summary || "The official source does not include a description.";
  const summary = useMemo(() => missionSummary(description), [description]);

  if (!grant) {
    return <div className="page-shell"><SiteHeader />
      <main className="opportunity-state">
        {loading ? <><span className="pulse"/><strong>Retrieving opportunity briefing…</strong></> : <><strong>Briefing unavailable.</strong><span>{error}</span><button onClick={onBack}>Return to the registry</button></>}
      </main><SiteFooter /></div>;
  }

  const details = grant.details;
  const officialDestination = details?.grantsGovUrl || grant.officialUrl;
  const documents = [...(details?.documents || []), ...(details?.additionalInformation || [])];

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="opportunity-page">
        <div className="detail-breadcrumb">
          <a href="/search#results" onClick={(event) => { event.preventDefault(); onBack(); }}><ArrowLeft size={14}/> All opportunities</a>
          <span>/</span><span>{grant.opportunityNumber || "Federal opportunity"}</span>
        </div>

        <section className="detail-hero detail-hero-compact">
          <div className="detail-identity">
            <div className="detail-eyebrow"><span className={`status-badge ${grant.status}`}>{grant.status}</span><span>Funding briefing / {grant.opportunityNumber || id.slice(0,8)}</span></div>
            <h1>{grant.title}</h1>
            <p><Building2 size={17}/>{grant.agency}</p>
            <div className="detail-actions">
              <a className="primary-action signal" href={officialDestination} target="_blank" rel="noreferrer">Review official notice <ArrowUpRight size={16}/></a>
              <button className="text-action light" onClick={onBack}><ArrowLeft size={15}/> Back to results</button>
            </div>
          </div>
          <aside className="detail-verification">
            <ShieldCheck size={25}/>
            <span>Source status</span>
            <strong>Official record matched</strong>
            <p>Verified {formatDate(details?.fetchedAt || grant.lastVerifiedAt)}. Confirm final terms before applying.</p>
          </aside>
        </section>

        <section className="detail-facts" aria-label="Opportunity summary">
          <div><CalendarClock/><span>Application deadline</span><strong>{formatDate(grant.closeAt)}</strong></div>
          <div><CircleDollarSign/><span>Program funding</span><strong>{meaningful(details?.programFundingLabel) || formatMoney(grant.programFundingUsd || grant.awardCeilingUsd)}</strong></div>
          <div><Target/><span>Award ceiling</span><strong>{grant.awardCeilingLabel || formatMoney(grant.awardCeilingUsd)}</strong></div>
          <div><Users/><span>Expected awards</span><strong>{grant.expectedAwardsLabel || grant.expectedAwards || "Not stated"}</strong></div>
        </section>

        <section id="briefing" className="briefing-board">
          <div className="briefing-board-heading">
            <div><span>Opportunity board</span><h2>Everything you need to decide whether to apply.</h2></div>
            <p>We reorganized the official notice into a compact decision briefing. Expand the source language only when you need every detail.</p>
          </div>

          <div className="briefing-grid briefing-dossier">
            <div className="briefing-main-column">
              <article className="briefing-card mission-card">
                <div className="briefing-card-label"><span>01</span><Target size={17}/> Mission</div>
                <h3>What this opportunity funds</h3>
                <p className="mission-summary">{summary}</p>
                {description !== summary ? <details className="official-disclosure">
                  <summary>Read the full official description <ChevronDown size={16}/></summary>
                  <div className="official-copy-scroll">{description}</div>
                </details> : null}
              </article>

              <div className="briefing-main-support">
                <article className="briefing-card eligibility-card">
                  <div className="briefing-card-label"><span>02</span><Users size={17}/> Eligibility</div>
                  <h3>Who can apply</h3>
                  {details?.eligibleApplicants.length ? <ul className="eligibility-list compact-list">{details.eligibleApplicants.map((applicant) => <li key={applicant}><CheckCircle2 size={16}/><span>{applicant}</span></li>)}</ul> : <p className="detail-muted">The source does not provide a structured applicant list.</p>}
                  {details?.eligibilityAdditionalInformation ? <details className="secondary-disclosure"><summary>Additional eligibility terms <ChevronDown size={15}/></summary><div>{details.eligibilityAdditionalInformation}</div></details> : null}
                </article>

                <article className="briefing-card application-card">
                  <div className="briefing-card-label"><span>03</span><Route size={17}/> Application</div>
                  <h3>Your route to submission</h3>
                  <p>{details?.applicationInstructions || "Use the official opportunity record to review the application package and submission instructions."}</p>
                  <a className="briefing-action" href={officialDestination} target="_blank" rel="noreferrer">Continue to Grants.gov <ArrowUpRight size={15}/></a>
                </article>
              </div>

              {documents.length ? <article className="briefing-card resources-card">
                <div className="briefing-card-label"><span>05</span><FileText size={17}/> Source materials</div>
                <h3>Documents and program links</h3>
                <div className="document-list compact-documents">
                  {documents.map((item) => <a key={`${item.url}-${item.name}`} href={item.url} target="_blank" rel="noreferrer"><FileText size={16}/><span>{item.name}</span><ArrowUpRight size={14}/></a>)}
                </div>
              </article> : null}
            </div>

            <aside className="briefing-rail briefing-rail-left" aria-label="Opportunity classification">
              <article className="briefing-card decision-card">
                <div className="briefing-card-label"><span>At a glance</span><Landmark size={17}/></div>
                <h3>Program classification</h3>
                <dl className="compact-record">
                  <InfoRow label="Opportunity" value={grant.opportunityNumber}/>
                  <InfoRow label="Category" value={details?.opportunityCategory}/>
                  <InfoRow label="Instrument" value={details?.fundingInstrumentTypes.join(", ")}/>
                  <InfoRow label="Cost sharing" value={details?.costSharingOrMatchingRequirement}/>
                  <InfoRow label="Posted" value={formatDate(grant.postedAt)}/>
                  <InfoRow label="Archive date" value={details?.archiveDateLabel}/>
                </dl>
              </article>

              <article className="briefing-card taxonomy-card">
                <div className="briefing-card-label"><span>Funding map</span><Building2 size={17}/></div>
                <h3>Programs and activity</h3>
                {details?.assistanceListings.length ? <div className="assistance-grid">{details.assistanceListings.map((listing) => <div key={listing.number}><strong>{listing.number}</strong><span>{listing.title}</span></div>)}</div> : null}
                <div className="sidebar-tags board-tags">{(details?.fundingActivityCategories.length ? details.fundingActivityCategories : grant.themes).map((theme) => <span key={theme}>{theme}</span>)}</div>
                {details?.fundingActivityCategoryExplanation ? <p className="taxonomy-note">{details.fundingActivityCategoryExplanation}</p> : null}
              </article>
            </aside>

            <aside className="briefing-rail briefing-rail-right" aria-label="Opportunity contacts and source control">
              <article className="briefing-card contact-card">
                <div className="briefing-card-label"><span>04</span><Mail size={17}/> Grantor contact</div>
                <h3>Questions about the notice</h3>
                {details?.grantorContactDescription ? <p>{details.grantorContactDescription}</p> : <p className="detail-muted">No contact description was included.</p>}
                {details?.grantorContactEmail ? <a className="briefing-action secondary" href={`mailto:${details.grantorContactEmail}`}><Mail size={15}/>{details.grantorContactEmail}</a> : null}
              </article>

              <article className="briefing-card source-card">
                <div className="briefing-card-label"><span>Source control</span><ShieldCheck size={17}/></div>
                <h3>Official record still controls</h3>
                <p>Grant Grinder makes public funding data easier to scan. Always use the government notice for final eligibility, deadlines, amendments, and submission rules.</p>
                <a className="briefing-action secondary" href={officialDestination} target="_blank" rel="noreferrer">Open official record <ArrowUpRight size={15}/></a>
              </article>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
