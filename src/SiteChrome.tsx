import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useAuth } from "./AuthContext";
import { appPath, routePath } from "./routes";

export function SiteHeader() {
  const isHome = routePath() === "/";
  const searchHref = appPath(isHome ? "/#search" : "/search");
  const { account, loading } = useAuth();
  return (
    <>
      <div className="utility-bar">
        <span>Wiplash Labs / Public Funding Intelligence</span>
        <span className="catalog-status"><i /> Official-source catalog online</span>
      </div>
      <header className="site-header">
        <a className="brand" href={appPath("/")}>
          <img src={appPath("/radar-mark.svg")} alt="" />
          <span><strong>Grant Grinder</strong><small>Federal Funding Desk</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href={appPath("/#mission")}>Mission</a>
          <a href={searchHref}>Find funding</a>
          <a href={appPath("/developers")}>Developers</a>
          <a href="https://github.com/Wiplash-ai/grant-radar">Get the extension</a>
          <a className="account-nav-link" href={appPath("/account")}>{loading ? "Account" : account ? "My desk" : "Sign in"}</a>
        </nav>
        <a className="header-cta" href={searchHref}>Search the registry {isHome ? <ArrowDown size={14} /> : <ArrowUpRight size={14} />}</a>
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
        <a href={appPath("/search")}>Grant search</a>
        <a href={appPath("/developers")}>API docs</a>
        <a href={appPath("/privacy")}>Privacy</a>
        <a href="https://github.com/Wiplash-ai/grant-radar">GitHub <ArrowUpRight size={12}/></a>
      </nav>
    </footer>
  );
}
