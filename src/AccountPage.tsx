import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, CalendarClock, History, KeyRound, LogOut, Radar, Save, ShieldCheck, UserPlus } from "lucide-react";

import { getAccountLibrary } from "./account-api";
import { useAuth } from "./AuthContext";
import RadarLoader from "./RadarLoader";
import { criteriaSummary, searchCriteriaUrl } from "./search-links";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import type { AccountLibrary } from "./types";

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Rolling / TBD";

function safeReturnPath() {
  const value = new URLSearchParams(window.location.search).get("return");
  return value?.startsWith("/") && !value.startsWith("//") ? value : "";
}

export default function AccountPage() {
  const { account, loading, login, logout, register, deleteSavedSearch } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [library, setLibrary] = useState<AccountLibrary | null>(null);

  useEffect(() => {
    document.title = account ? "Your funding desk | Grant Grinder" : "Sign in or register | Grant Grinder";
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex,nofollow";
  }, [account]);

  useEffect(() => {
    if (!account) { setLibrary(null); return; }
    getAccountLibrary().then(setLibrary).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load your funding desk."));
  }, [account?.user.id, account?.favoriteKeys.join("|")]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const credentials = { email: String(data.get("email") || ""), password: String(data.get("password") || "") };
      if (mode === "register") await register({ ...credentials, name: String(data.get("name") || "") || undefined });
      else await login(credentials);
      const returnPath = safeReturnPath();
      if (returnPath) window.location.assign(returnPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-shell"><SiteHeader/><main className="account-loading" role="status"><RadarLoader compact/>Checking your funding desk…</main><SiteFooter/></div>;

  if (!account) return <div className="page-shell">
    <SiteHeader/>
    <main className="account-entry">
      <section className="account-entry-copy">
        <span className="account-kicker"><ShieldCheck size={16}/> Private funding workspace</span>
        <h1>Keep every promising grant <em>on your radar.</em></h1>
        <p>Sign in to favorite opportunities, preserve exact search criteria, and return to previous funding scans from any device.</p>
        <div className="account-capabilities"><span><Bookmark/>Favorite opportunities</span><span><Save/>Saved search criteria</span><span><History/>Recent funding scans</span></div>
      </section>
      <section className="account-form-station">
        <div className="account-mode-switch" role="tablist" aria-label="Account action">
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }} role="tab" aria-selected={mode === "login"}>Sign in</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }} role="tab" aria-selected={mode === "register"}>Register</button>
        </div>
        <div className="account-form-heading"><span>{mode === "login" ? <KeyRound/> : <UserPlus/>}</span><div><small>Access control / 01</small><h2>{mode === "login" ? "Return to your desk" : "Create your funding desk"}</h2></div></div>
        <form onSubmit={submit}>
          {mode === "register" ? <label><span>Name</span><input name="name" autoComplete="name" placeholder="Your name or team lead" required/></label> : null}
          <label><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="you@organization.org" required/></label>
          <label><span>Password</span><input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={10} placeholder="10 characters minimum" required/></label>
          {error ? <p className="account-error" role="alert">{error}</p> : null}
          <button className="account-submit" disabled={submitting}>{submitting ? "Securing access…" : mode === "login" ? "Sign in to Grant Grinder" : "Create account"}<ArrowUpRight size={16}/></button>
        </form>
        <p className="account-form-note">Public grant search remains available without an account. Account sessions use a secure HTTP-only cookie.</p>
      </section>
    </main>
    <SiteFooter/>
  </div>;

  return <div className="page-shell">
    <SiteHeader/>
    <main className="account-dashboard">
      <section className="account-command-banner">
        <div><span>Funding desk / authenticated</span><h1>{account.user.name ? `${account.user.name}’s grant watch` : "Your grant watch"}</h1><p>{account.user.email}</p></div>
        <div className="account-command-actions"><a href="/search">Run a new search <Radar size={16}/></a><button onClick={() => logout()}><LogOut size={15}/>Sign out</button></div>
      </section>

      <section className="account-dashboard-grid">
        <article className="account-panel account-favorites-panel">
          <div className="account-panel-heading"><span><Bookmark/>01</span><div><small>Opportunity watchlist</small><h2>Favorites</h2></div><strong>{account.favoriteKeys.length}</strong></div>
          {library?.favorites.length ? <div className="account-favorite-list">{library.favorites.map((grant) => <a href={`/opportunity/${grant.key.replace(/^opportunity:/, "")}`} key={grant.key}><span>{grant.agency}</span><h3>{grant.title}</h3><p><CalendarClock size={14}/> {formatDate(grant.closeAt)}</p><ArrowUpRight size={16}/></a>)}</div> : <div className="account-empty"><Bookmark/><strong>No favorites yet.</strong><span>Save promising opportunities from search results or a funding briefing.</span><a href="/search">Search the registry</a></div>}
        </article>

        <article className="account-panel">
          <div className="account-panel-heading"><span><Save/>02</span><div><small>Reusable criteria</small><h2>Saved searches</h2></div><strong>{account.savedSearches.length}</strong></div>
          {account.savedSearches.length ? <div className="account-search-list">{account.savedSearches.map((search) => <div key={search.id}><a href={searchCriteriaUrl(search.criteria)}><strong>{search.name}</strong><span>{criteriaSummary(search.criteria)}</span></a><button onClick={() => deleteSavedSearch(search.id)} aria-label={`Delete ${search.name}`}>×</button></div>)}</div> : <div className="account-empty compact"><Save/><strong>No saved criteria.</strong><span>Use “Save this search” from the registry.</span></div>}
        </article>

        <article className="account-panel">
          <div className="account-panel-heading"><span><History/>03</span><div><small>Recent activity</small><h2>Previous searches</h2></div><strong>{account.searchHistory.length}</strong></div>
          {account.searchHistory.length ? <div className="account-search-list history-list">{account.searchHistory.map((search) => <div key={search.id}><a href={searchCriteriaUrl(search.criteria)}><strong>{search.label}</strong><span>{criteriaSummary(search.criteria)}</span><small>{formatDate(search.searchedAt)}</small></a></div>)}</div> : <div className="account-empty compact"><History/><strong>No previous searches.</strong><span>Your signed-in registry searches will appear here.</span></div>}
        </article>
      </section>
    </main>
    <SiteFooter/>
  </div>;
}
