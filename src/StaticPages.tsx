import { ArrowUpRight, BookOpen, Braces, CheckCircle2, Copy, KeyRound, LockKeyhole, ShieldCheck, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter, SiteHeader } from "./SiteChrome";
import { developerSeo, privacySeo } from "./seo";

const API_BASE = "https://labs.wiplash.ai/grants/api";
const curlExample = `curl "${API_BASE}/v1/grants?q=rural+health&status=open&sort=relevance-desc&limit=10" \\
  -H "x-api-key: YOUR_API_KEY"`;
const jsExample = `const response = await fetch(
  "${API_BASE}/v1/grants?funding_category=Education&min_award=50000",
  { headers: { "x-api-key": process.env.GRANT_GRINDER_API_KEY } }
);

const { data, pagination, meta } = await response.json();`;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }
  return <div className="code-block"><pre><code>{code}</code></pre><button onClick={copy}><Copy size={13}/>{copied ? "Copied" : "Copy"}</button></div>;
}

export function DeveloperPage() {
  useEffect(() => developerSeo(), []);
  return <div className="page-shell docs-page"><SiteHeader />
    <main>
      <section className="static-hero-shell">
        <div className="static-hero docs-hero">
          <div className="static-hero-copy">
            <span className="static-eyebrow"><Braces size={16}/> Grant Grinder API / v1</span>
            <h1>Federal grant data,<br/><em>ready to build with.</em></h1>
            <p>Build research agents, funding alerts, directories, CRMs, and eligibility workflows on one normalized, source-attributed interface.</p>
            <div className="hero-actions"><a className="primary-action signal" href="#quickstart">Make your first request</a><a className="text-action light" href={`${API_BASE}/openapi.json`}>OpenAPI specification <ArrowUpRight size={15}/></a></div>
            <div className="static-proof-row"><span><b>All current</b> posted + forecasted</span><span><b>Official links</b> on every record</span><span><b>Daily</b> source refresh</span></div>
          </div>
          <aside className="static-visual-panel docs-visual" aria-label="Grant Grinder API interface status">
            <div className="visual-panel-head"><span>Interface status</span><i/> Live</div>
            <div className="visual-sigil"><Braces size={42}/></div>
            <span className="visual-kicker">Primary route</span>
            <strong className="visual-route">GET /v1/grants</strong>
            <div className="visual-readouts"><span><b>JSON</b>Normalized records</span><span><b>FACETS</b>Decision-ready filters</span><span><b>SOURCE</b>Grants.gov attributed</span></div>
          </aside>
        </div>
      </section>

      <div className="docs-layout">
        <aside className="docs-nav"><span>On this page</span><a href="#quickstart">Quickstart</a><a href="#authentication">Authentication</a><a href="#endpoints">Endpoints</a><a href="#filters">Filters and sorting</a><a href="#responses">Responses</a><a href="#agents">Agent skill</a><a href="#usage">Usage and attribution</a></aside>
        <article className="docs-content">
          <section id="quickstart"><div className="docs-label"><Terminal size={16}/> Quickstart</div><h2>Search the catalog in one request</h2><p>The API returns normalized JSON and preserves the official Grants.gov destination on every opportunity.</p><CodeBlock code={curlExample}/><h3>JavaScript</h3><CodeBlock code={jsExample}/></section>

          <section id="authentication"><div className="docs-label"><KeyRound size={16}/> Authentication</div><h2>Send your issued API key</h2><p>Commercial API requests accept <code>x-api-key: YOUR_API_KEY</code> or <code>Authorization: Bearer YOUR_API_KEY</code>. Keep keys on your server or in an agent secret store. Never embed a paid key in a public website or extension bundle.</p><div className="docs-callout"><LockKeyhole size={18}/><div><strong>Getting access</strong><p>Use a key issued by Wiplash.ai or an approved API marketplace listing. Rate limits and billing follow the plan attached to that key.</p></div></div></section>

          <section id="endpoints"><div className="docs-label"><BookOpen size={16}/> Endpoints</div><h2>The complete v1 surface</h2><div className="endpoint-list"><div><code>GET /v1/grants</code><span>Search, filter, sort, facet, and paginate current opportunities.</span></div><div><code>GET /v1/grants/:key</code><span>Retrieve one complete opportunity briefing by key, Grants.gov ID, or opportunity number.</span></div><div><code>GET /v1/meta</code><span>Inspect catalog coverage, official sources, and refresh metadata.</span></div><div><code>GET /openapi.json</code><span>Download the machine-readable OpenAPI 3.1 contract.</span></div></div></section>

          <section id="filters"><div className="docs-label"><Braces size={16}/> Query controls</div><h2>Filter for the people and work you serve</h2><div className="parameter-table" role="table" aria-label="Grant search parameters"><div className="parameter-head" role="row"><span>Parameter</span><span>Purpose</span><span>Example</span></div>{[
            ["q", "Full-text search across title, agency, description, eligibility, and taxonomy", "rural healthcare"],
            ["status", "Current notice state", "open | forecasted"],
            ["agency", "Exact agency name from facets", "Department of Agriculture"],
            ["funding_category", "Official funding activity category", "Arts"],
            ["funding_instrument", "Official award instrument", "Grant"],
            ["eligible_applicant", "Official applicant type", "Small businesses"],
            ["assistance_listing", "Assistance Listing number", "10.001"],
            ["min_award / max_award", "Funding range in U.S. dollars", "50000"],
            ["closes_after / closes_before", "ISO date or timestamp deadline window", "2026-12-31"],
            ["posted_after / posted_before", "ISO date or timestamp posting window", "2026-08-01"],
            ["has_funding_amount", "Require a published award or program amount", "true"],
            ["sort", "Relevance, deadline, posted date, amount, agency, title, or completeness", "relevance-desc"],
            ["page / limit", "Pagination; limit is 1–100", "page=2&limit=50"]
          ].map(([name, purpose, example]) => <div role="row" key={name}><code>{name}</code><span>{purpose}</span><code>{example}</code></div>)}</div></section>

          <section id="responses"><div className="docs-label"><CheckCircle2 size={16}/> Responses</div><h2>Normalized records with decision-ready fields</h2><p>List responses include compact descriptions, eligibility, categories, instruments, funding amounts, official links, facets, and pagination. Detail responses add the complete official description, contact, assistance listings, application guidance, and source materials.</p><CodeBlock code={`{
  "data": [{
    "key": "opportunity:363515",
    "title": "Public Diplomacy Grants / Small Grants Program",
    "status": "open",
    "agency": "U.S. Mission to Ghana",
    "eligibleApplicants": ["Individuals", "Nonprofits with 501(c)(3) status"],
    "fundingActivityCategories": ["Education", "Business and Commerce"],
    "programFundingUsd": 120000,
    "officialUrl": "https://www.grants.gov/search-results-detail/363515"
  }],
  "pagination": { "total": 1, "page": 1, "limit": 10, "pages": 1 },
  "meta": { "facets": { "agencies": [], "fundingCategories": [] } }
}`}/></section>

          <section id="agents"><div className="docs-label"><Braces size={16}/> Agent integration</div><h2>Give an agent the official Grant Grinder skill</h2><p>The public skill teaches Codex and other compatible agents how to authenticate, search efficiently, follow pagination, retrieve complete records, cite official sources, and avoid exposing API keys.</p><div className="docs-actions"><a className="briefing-action" href="/skills/grant-grinder-api/SKILL.md">Download SKILL.md <ArrowUpRight size={15}/></a><a className="briefing-action secondary" href="/skills/grant-grinder-api/references/api.md">Agent API reference <ArrowUpRight size={15}/></a></div></section>

          <section id="usage"><div className="docs-label"><ShieldCheck size={16}/> Usage and attribution</div><h2>Present the data honestly</h2><ul className="docs-checklist"><li><CheckCircle2/>Link users to each record’s <code>officialUrl</code>.</li><li><CheckCircle2/>Treat the government notice as controlling for eligibility, dates, and application rules.</li><li><CheckCircle2/>Do not imply Wiplash.ai or Grant Grinder is a government agency.</li><li><CheckCircle2/>Cache responsibly and refresh from the API daily when freshness matters.</li></ul></section>
        </article>
      </div>
    </main><SiteFooter /></div>;
}

export function PrivacyPage() {
  useEffect(() => privacySeo(), []);
  return <div className="page-shell policy-page"><SiteHeader />
    <main>
      <section className="static-hero-shell">
        <div className="static-hero policy-hero">
          <div className="static-hero-copy">
            <span className="static-eyebrow"><ShieldCheck size={16}/> Privacy policy / Effective August 10, 2026</span>
            <h1>Plain-language privacy,<br/><em>with a narrow footprint.</em></h1>
            <p>This policy covers the Grant Grinder website, browser extension, and commercial API operated by Wiplash.ai through Wiplash Labs.</p>
            <div className="static-proof-row"><span><b>No ads</b> or ad profiles</span><span><b>No sale</b> of personal data</span><span><b>No account</b> needed to search</span></div>
          </div>
          <aside className="static-visual-panel policy-visual" aria-label="Grant Grinder privacy baseline">
            <div className="visual-panel-head"><span>Data posture</span><i/> Minimal</div>
            <div className="visual-sigil"><LockKeyhole size={40}/></div>
            <span className="visual-kicker">Processing map</span>
            <strong className="visual-route">Purpose in. Result out.</strong>
            <div className="privacy-flow"><span><b>Search phrase</b><i/>Grant results</span><span><b>API key</b><i/>Authorized access</span><span><b>Support email</b><i/>Human reply</span></div>
          </aside>
        </div>
      </section>

      <article className="policy-content">
        <section><span>01</span><div><h2>What this policy covers</h2><p>Grant Grinder helps people and software agents find U.S. government funding opportunities. This policy explains what information the website, extension, and API process, why we process it, and the choices available to you. Grant Grinder is not a government service.</p></div></section>
        <section><span>02</span><div><h2>Information you provide</h2><p>The public website does not require an account. When you search, we process the words and filters you submit. The extension can store an API URL and optional API key in browser sync storage. If you contact support, we process your email address and message. API customers may provide account, subscriber, and support information through Wiplash.ai or an API marketplace.</p></div></section>
        <section><span>03</span><div><h2>Information processed automatically</h2><p>Our hosting, security, and marketplace providers can process standard request information such as IP address, browser or user-agent, request time, endpoint, response status, and API usage count. The Grant Grinder application does not maintain a separate personal search-history profile.</p></div></section>
        <section><span>04</span><div><h2>How the browser extension works</h2><p>The extension reads only text you deliberately select when you choose the Grant Grinder context-menu command. That phrase is held briefly in browser session storage and sent as a search query. The extension does not read full pages, browsing history, forms, passwords, or unrelated tabs, and it does not inject scripts into webpages.</p></div></section>
        <section><span>05</span><div><h2>How we use information</h2><p>We use information to return grant results, authenticate and meter API requests, prevent abuse, diagnose failures, provide support, improve reliability, comply with law, and communicate material service or policy changes. We do not use searches for behavioral advertising.</p></div></section>
        <section><span>06</span><div><h2>Service providers and marketplaces</h2><p>Infrastructure providers process requests needed to host and secure the service. When you subscribe through an API marketplace, that marketplace processes account and payment information under its own policy; Wiplash.ai can receive a subscriber identifier, plan, entitlement, and usage information needed to provide the API. We can disclose information when legally required or during a business transaction subject to appropriate protections.</p></div></section>
        <section><span>07</span><div><h2>Sale, sharing, and advertising</h2><p>We do not sell personal information. We do not share personal information for cross-context behavioral advertising. Grant Grinder currently uses no advertising pixels and no third-party behavioral analytics in the public web app or extension.</p></div></section>
        <section><span>08</span><div><h2>Cookies and local storage</h2><p>The public web app does not currently set advertising or analytics cookies. The extension uses browser sync storage for its API URL and optional key, and session storage for a user-selected search phrase. Your browser vendor can sync extension settings according to your browser account settings.</p></div></section>
        <section><span>09</span><div><h2>Retention</h2><p>Extension settings remain until you change them, clear browser storage, or remove the extension. Session search text is removed after use or when browser session storage is cleared. API account and entitlement records remain while access is active and as needed for billing, security, dispute resolution, and legal obligations. Infrastructure and marketplace logs follow those providers’ configured retention schedules.</p></div></section>
        <section><span>10</span><div><h2>Security</h2><p>Production traffic uses HTTPS. API keys are accepted in request headers and should be stored as secrets. We limit access to operational systems and use source-attributed public government data. No system is perfectly secure, so please report a suspected issue to support@wiplash.ai.</p></div></section>
        <section><span>11</span><div><h2>Your choices and rights</h2><p>You can search the public site without an account, remove the extension, clear its storage, rotate or revoke an API key, and contact us to request access, correction, or deletion of personal information we control. Depending on where you live, you may also have rights to object, restrict processing, receive a portable copy, or appeal a rights decision.</p></div></section>
        <section><span>12</span><div><h2>International processing</h2><p>Grant Grinder is operated from the United States. If you access it elsewhere, information may be processed in the United States and other locations used by our service providers, where privacy rules may differ.</p></div></section>
        <section><span>13</span><div><h2>Children’s privacy</h2><p>Grant Grinder is a general-audience funding research tool and is not directed to children under 13. We do not knowingly collect personal information from children. Contact us if you believe a child submitted personal information.</p></div></section>
        <section><span>14</span><div><h2>Government and external links</h2><p>Opportunity pages link to Grants.gov, Simpler.Grants.gov, agency websites, and application materials. Those services operate under their own privacy policies. Grant Grinder reorganizes public grant information but does not control external application systems.</p></div></section>
        <section><span>15</span><div><h2>Changes and contact</h2><p>We will update the effective date and post a revised policy here when practices materially change. For privacy questions or rights requests, email <a href="mailto:support@wiplash.ai">support@wiplash.ai</a>. We may need to verify your identity before fulfilling a request.</p></div></section>
      </article>
    </main><SiteFooter /></div>;
}
