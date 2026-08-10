import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Landmark,
  Mail,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { getGrant } from "./api";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import type { GrantDetail } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatMoney = (value?: number) => value ? money.format(value) : "Not stated";
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Rolling / TBD";
const meaningful = (value?: string) => value && !/^(\$?--|not stated|unknown)$/i.test(value.trim()) ? value : undefined;

export default function OpportunityPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [grant, setGrant] = useState<GrantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getGrant(id, controller.signal)
      .then((response) => {
        setGrant(response.data);
        document.title = `${response.data.title} | Grant Radar`;
      })
      .catch((caught) => { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Unable to load this opportunity."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  if (loading || error || !grant) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="opportunity-state">
          {loading ? <><span className="pulse"/><strong>Retrieving opportunity briefing…</strong></> : <><strong>Briefing unavailable.</strong><span>{error}</span><button onClick={onBack}>Return to the registry</button></>}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const details = grant.details;
  const officialDestination = details?.grantsGovUrl || grant.officialUrl;
  const awardRange = meaningful(grant.awardFloorLabel) && meaningful(grant.awardCeilingLabel)
    ? `${grant.awardFloorLabel} – ${grant.awardCeilingLabel}`
    : meaningful(grant.awardCeilingLabel) || formatMoney(grant.awardCeilingUsd);

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="opportunity-page">
        <div className="detail-breadcrumb">
          <a href="/" onClick={(event) => { event.preventDefault(); onBack(); }}><ArrowLeft size={14}/> Opportunity registry</a>
          <span>/</span><span>{grant.opportunityNumber || "Federal opportunity"}</span>
        </div>

        <section className="detail-hero">
          <div className="detail-identity">
            <div className="detail-eyebrow"><span className={`status-badge ${grant.status}`}>{grant.status}</span><span>Opportunity briefing / {grant.opportunityNumber || id.slice(0,8)}</span></div>
            <h1>{grant.title}</h1>
            <p><Building2 size={18}/>{grant.agency}</p>
            <div className="detail-actions">
              <a className="primary-action" href={officialDestination} target="_blank" rel="noreferrer">View official listing <ArrowUpRight size={16}/></a>
              {grant.officialUrl !== officialDestination ? <a className="text-action" href={grant.officialUrl} target="_blank" rel="noreferrer">Agency information <ArrowUpRight size={14}/></a> : null}
            </div>
          </div>
          <aside className="detail-verification">
            <ShieldCheck size={24}/>
            <span>Source verification</span>
            <strong>Official record retrieved</strong>
            <p>Verified {formatDate(details?.fetchedAt || grant.lastVerifiedAt)}. Always confirm final terms before applying.</p>
          </aside>
        </section>

        <section className="detail-facts" aria-label="Opportunity summary">
          <div><CalendarClock/><span>Deadline</span><strong>{formatDate(grant.closeAt)}</strong></div>
          <div><CircleDollarSign/><span>Program funding</span><strong>{meaningful(details?.programFundingLabel) || "Not stated"}</strong></div>
          <div><Target/><span>Award range</span><strong>{awardRange}</strong></div>
          <div><Users/><span>Expected awards</span><strong>{grant.expectedAwardsLabel || grant.expectedAwards || "Not stated"}</strong></div>
        </section>

        <div className="detail-layout">
          <article className="detail-article">
            <section>
              <div className="detail-section-label"><span>01</span> Mission description</div>
              <h2>What this opportunity funds</h2>
              <div className="official-copy">{details?.description || grant.summary}</div>
            </section>

            <section>
              <div className="detail-section-label"><span>02</span> Eligibility</div>
              <h2>Who may apply</h2>
              {details?.eligibleApplicants.length ? <ul className="eligibility-list">{details.eligibleApplicants.map((applicant) => <li key={applicant}><CheckCircle2 size={17}/><span>{applicant}</span></li>)}</ul> : <p className="detail-muted">The source does not provide a structured applicant list. Review the official notice before deciding eligibility.</p>}
              {details?.eligibilityAdditionalInformation ? <div className="official-copy compact">{details.eligibilityAdditionalInformation}</div> : null}
            </section>

            <section>
              <div className="detail-section-label"><span>03</span> Application route</div>
              <h2>How to proceed</h2>
              <p>{details?.applicationInstructions || "Use the official listing to review instructions, required forms, and submission deadlines."}</p>
              <a className="inline-official-link" href={officialDestination} target="_blank" rel="noreferrer">Continue to the official application record <ArrowUpRight size={15}/></a>
            </section>

            {details?.grantorContactDescription || details?.grantorContactEmail ? <section>
              <div className="detail-section-label"><span>04</span> Grantor contact</div>
              <h2>Questions about the notice</h2>
              {details.grantorContactDescription ? <div className="official-copy compact">{details.grantorContactDescription}</div> : null}
              {details.grantorContactEmail ? <a className="contact-link" href={`mailto:${details.grantorContactEmail}`}><Mail size={16}/>{details.grantorContactEmail}</a> : null}
            </section> : null}

            {details?.documents.length || details?.additionalInformation.length ? <section>
              <div className="detail-section-label"><span>05</span> Source materials</div>
              <h2>Documents and program links</h2>
              <div className="document-list">
                {[...(details?.documents || []), ...(details?.additionalInformation || [])].map((item) => <a key={`${item.url}-${item.name}`} href={item.url} target="_blank" rel="noreferrer"><FileText size={17}/><span>{item.name}</span><ArrowUpRight size={15}/></a>)}
              </div>
            </section> : null}
          </article>

          <aside className="detail-sidebar">
            <div className="sidebar-heading"><Landmark size={17}/><span>Official record</span></div>
            <dl>
              <div><dt>Opportunity number</dt><dd>{grant.opportunityNumber || "Not stated"}</dd></div>
              <div><dt>Posted</dt><dd>{formatDate(grant.postedAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{details?.lastUpdatedLabel || formatDate(grant.lastVerifiedAt)}</dd></div>
              <div><dt>Archive date</dt><dd>{details?.archiveDateLabel || "Not stated"}</dd></div>
              <div><dt>Funding instrument</dt><dd>{details?.fundingInstrumentTypes.join(", ") || "Not stated"}</dd></div>
              <div><dt>Opportunity category</dt><dd>{meaningful(details?.opportunityCategory) || "Not stated"}</dd></div>
              <div><dt>Cost sharing</dt><dd>{meaningful(details?.costSharingOrMatchingRequirement) || "Not stated"}</dd></div>
              <div><dt>Version</dt><dd>{details?.version || "Not stated"}</dd></div>
            </dl>
            {details?.assistanceListings.length ? <div className="assistance-block"><span>Assistance listings</span>{details.assistanceListings.map((listing) => <div key={listing.number}><strong>{listing.number}</strong><p>{listing.title}</p></div>)}</div> : null}
            {details?.fundingActivityCategories.length ? <div className="assistance-block"><span>Funding activity</span>{details.fundingActivityCategories.map((category) => <p key={category}>{category}</p>)}</div> : null}
            <div className="sidebar-tags">{grant.themes.map((theme) => <span key={theme}>{theme}</span>)}</div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
