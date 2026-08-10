import { ArrowDown, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  return (
    <>
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
          <a href="/#mission">Mission</a>
          <a href="/#search">Find funding</a>
          <a href="https://github.com/Wiplash-ai/grant-radar">Get the extension</a>
        </nav>
        <a className="header-cta" href="/#search">Search the registry <ArrowDown size={14} /></a>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="labs-link" href="https://labs.wiplash.ai/">Wiplash Labs</a>
      <p>Produced by <a href="https://wiplash.ai/">Wiplash.ai</a></p>
      <nav aria-label="Footer navigation">
        <a href="/">Grant search</a>
        <a href="https://github.com/Wiplash-ai/grant-radar">GitHub <ArrowUpRight size={12}/></a>
      </nav>
    </footer>
  );
}
