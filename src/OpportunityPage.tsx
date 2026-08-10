import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Database,
  FileText,
  Landmark,
  Mail,
  MessageCircle,
  Phone,
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

function markdownFallback(description: string) {
  return description
    .replace(/\s+((?:Project|Program) (?:Audiences|Goals|Objectives)|Funding Priorities|Areas of Interest)\s*:\s*/gi, "\n\n## $1\n\n")
    .replace(/\s*[•●▪◦·]\s*/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return <div><dt>{label}</dt><dd>{meaningful(value) || "Not stated"}</dd></div>;
}

export default function OpportunityPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [grant, setGrant] = useState<GrantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [descriptionView, setDescriptionView] = useState<"reader" | "official">("reader");

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
  const descriptionMarkdown = useMemo(
    () => grant?.details?.descriptionMarkdown || markdownFallback(description),
    [description, grant?.details?.descriptionMarkdown]
  );

  if (!grant) {
    return <div className="page-shell"><SiteHeader />
      <main className="opportunity-state">
        {loading ? <><span className="pulse"/><strong>Retrieving opportunity briefing…</strong></> : <><strong>Briefing unavailable.</strong><span>{error}</span><button onClick={onBack}>Return to the registry</button></>}
      </main><SiteFooter /></div>;
  }

  const details = grant.details;
  const officialDestination = details?.grantsGovUrl || grant.officialUrl;
  const documents = [...(details?.documents || []), ...(details?.additionalInformation || [])];
  const applicantHighlights = details?.eligibilityHighlights?.length
    ? details.eligibilityHighlights
    : details?.eligibleApplicants || grant.eligibleApplicants;
  const contactPhones = details?.grantorContactPhones || [];
  const contactNarrative = contactPhones.reduce(
    (value, phone) => value.replace(phone.raw, ""),
    details?.grantorContactDescription || ""
  ).replace(/^\s*phone\s*[:.-]?\s*$/i, "").trim();
  const expectedAwards = grant.expectedAwardsLabel || grant.expectedAwards;

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
            </div>
          </div>
          <aside className="detail-glance">
            <div className="detail-glance-label"><Landmark size={17}/><span>At a glance</span></div>
            <dl>
              <InfoRow label="Opportunity" value={grant.opportunityNumber}/>
              <InfoRow label="Category" value={details?.opportunityCategory}/>
              <InfoRow label="Instrument" value={details?.fundingInstrumentTypes.join(", ")}/>
              <InfoRow label="Cost sharing" value={details?.costSharingOrMatchingRequirement}/>
              <InfoRow label="Posted" value={formatDate(grant.postedAt)}/>
              <InfoRow label="Archive date" value={details?.archiveDateLabel}/>
            </dl>
          </aside>
        </section>

        <section className="detail-facts" aria-label="Opportunity summary">
          <div><CalendarClock/><span>Application deadline</span><strong>{formatDate(grant.closeAt)}</strong><small>Official close date</small></div>
          <div><CircleDollarSign/><span>Total funding pool</span><strong>{meaningful(details?.programFundingLabel) || formatMoney(grant.programFundingUsd)}</strong><small>Across all planned awards</small></div>
          <div><Target/><span>Maximum single award</span><strong>{grant.awardCeilingLabel || formatMoney(grant.awardCeilingUsd)}</strong><small>No one award may exceed this</small></div>
          <div><Users/><span>Planned grants</span><strong>{expectedAwards || "Not stated"}</strong><small>Agency estimate, not a guarantee</small></div>
        </section>

        <section id="briefing" className="briefing-board">
          <div className="briefing-grid briefing-dossier">
            <div className="briefing-main-column">
              <article className="briefing-card mission-card">
                <div className="briefing-card-toolbar">
                  <div className="briefing-card-label"><span>01</span><Target size={17}/> Mission</div>
                  <div className="description-view-switch" role="group" aria-label="Description format">
                    <button className={descriptionView === "reader" ? "active" : ""} onClick={() => setDescriptionView("reader")}>Reader view</button>
                    <button className={descriptionView === "official" ? "active" : ""} onClick={() => setDescriptionView("official")}>Official text</button>
                  </div>
                </div>
                <h3>What this opportunity funds</h3>
                {descriptionView === "reader"
                  ? <div className="grant-markdown"><ReactMarkdown components={{
                      h1: ({ children }) => <h4>{children}</h4>,
                      h2: ({ children }) => <h4>{children}</h4>,
                      h3: ({ children }) => <h5>{children}</h5>
                    }}>{descriptionMarkdown}</ReactMarkdown></div>
                  : <div className="raw-description-scroll">{description}</div>}
              </article>

              <article className="briefing-card eligibility-card">
                <div className="briefing-card-label"><span>02</span><Users size={17}/> Eligibility</div>
                <h3>Who can apply</h3>
                {applicantHighlights.length ? <ul className="eligibility-list applicant-highlights">{applicantHighlights.map((applicant) => <li key={applicant}><CheckCircle2 size={17}/><span>{applicant}</span></li>)}</ul> : <p className="detail-muted">The source does not provide a structured applicant list.</p>}
                {details?.eligibleApplicants?.length ? <div className="official-applicant-code"><span>Official Grants.gov classification</span><strong>{details.eligibleApplicants.join(" · ")}</strong></div> : null}
                {details?.eligibilityAdditionalInformation ? <details className="secondary-disclosure"><summary>Read every eligibility term <ChevronDown size={15}/></summary><div>{details.eligibilityAdditionalInformation}</div></details> : null}
              </article>

              {documents.length ? <article className="briefing-card resources-card">
                <div className="briefing-card-label"><span>05</span><FileText size={17}/> Source materials</div>
                <h3>Documents and program links</h3>
                <div className="document-list compact-documents">
                  {documents.map((item) => <a key={`${item.url}-${item.name}`} href={item.url} target="_blank" rel="noreferrer"><FileText size={16}/><span>{item.name}</span><ArrowUpRight size={14}/></a>)}
                </div>
              </article> : null}
            </div>

            <aside className="briefing-rail briefing-rail-left" aria-label="Opportunity classification">
              <article className="briefing-card taxonomy-card">
                <div className="briefing-card-label"><span>Funding map</span><Building2 size={17}/></div>
                <h3>Programs and activity</h3>
                {details?.assistanceListings.length ? <div className="assistance-grid">{details.assistanceListings.map((listing) => <div key={listing.number}><strong>{listing.number}</strong><span>{listing.title}</span></div>)}</div> : null}
                <div className="sidebar-tags board-tags">{(details?.fundingActivityCategories.length ? details.fundingActivityCategories : grant.themes).map((theme) => <a key={theme} href={`/search?funding_category=${encodeURIComponent(theme)}#results`} target="_blank" rel="noreferrer"><span>{theme}</span><ArrowUpRight size={12}/></a>)}</div>
                {details?.fundingActivityCategoryExplanation ? <p className="taxonomy-note">{details.fundingActivityCategoryExplanation}</p> : null}
              </article>
            </aside>

            <aside className="briefing-rail briefing-rail-right" aria-label="Opportunity contacts and source control">
              <article className="briefing-card application-card source-card">
                <div className="briefing-card-label"><span>03</span><Route size={17}/> Application &amp; source</div>
                <h3>Submit with the official record</h3>
                <p>{details?.applicationInstructions || "Use the official opportunity record to review the application package and submission instructions."}</p>
                <a className="briefing-action" href={officialDestination} target="_blank" rel="noreferrer">Continue to Grants.gov <ArrowUpRight size={15}/></a>
                <div className="source-assurance"><ShieldCheck size={17}/><p><strong>Source checked {formatDate(details?.fetchedAt || grant.lastVerifiedAt)}</strong>The government notice controls final eligibility, amendments, deadlines, and submission rules.</p></div>
                <details className="raw-data-disclosure">
                  <summary><Database size={15}/> View raw API record <ChevronDown size={14}/></summary>
                  <pre>{JSON.stringify(grant, null, 2)}</pre>
                </details>
              </article>

              <article className="briefing-card contact-card">
                <div className="briefing-card-label"><span>04</span><Mail size={17}/> Grantor contact</div>
                <h3>Questions about the notice</h3>
                {contactNarrative ? <p>{contactNarrative}</p> : null}
                {contactPhones.length ? <div className="contact-phone-list">{contactPhones.map((phone) => <div className="contact-phone" key={phone.telUrl}>
                  <Phone size={17}/><div><span>Phone</span><strong>{phone.display}</strong></div>
                  <div className="contact-phone-actions"><a href={phone.telUrl}><Phone size={13}/>Call</a>{phone.whatsappUrl ? <a href={phone.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={13}/>WhatsApp</a> : null}</div>
                </div>)}</div> : null}
                {details?.grantorContactEmail ? <a className="briefing-action secondary" href={`mailto:${details.grantorContactEmail}`}><Mail size={15}/>{details.grantorContactEmail}</a> : null}
                {!contactNarrative && !contactPhones.length && !details?.grantorContactEmail ? <p className="detail-muted">No grantor contact was included in the source record.</p> : null}
              </article>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
