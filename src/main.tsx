import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import AccountPage from "./AccountPage";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import OpportunityPage from "./OpportunityPage";
import { DeveloperPage, PrivacyPage } from "./StaticPages";
import { appPath, routePath } from "./routes";
import "./styles.css";

const SEARCH_RETURN_KEY = "grant-grinder.search-return-url";

function routeId() {
  return decodeURIComponent(routePath().match(/^\/opportunity\/([^/]+)\/?$/)?.[1] || "");
}

function currentRouteUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function rememberSearchReturn(url: string) {
  try { window.sessionStorage.setItem(SEARCH_RETURN_KEY, url); } catch { /* Storage can be unavailable in hardened browsers. */ }
}

function rememberedSearchReturn() {
  try { return window.sessionStorage.getItem(SEARCH_RETURN_KEY) || ""; } catch { return ""; }
}

function Root() {
  const [opportunityId, setOpportunityId] = useState(routeId);
  const [pathname, setPathname] = useState(routePath());

  useEffect(() => {
    const handleNavigation = () => { setOpportunityId(routeId()); setPathname(routePath()); };
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  function openOpportunity(id: string) {
    const returnUrl = currentRouteUrl();
    rememberSearchReturn(returnUrl);
    window.history.pushState({ grantReturnUrl: returnUrl }, "", appPath(`/opportunity/${encodeURIComponent(id)}`));
    setOpportunityId(id);
    setPathname(routePath());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnToRegistry() {
    const state = window.history.state as { grantReturnUrl?: unknown } | null;
    if (typeof state?.grantReturnUrl === "string" && state.grantReturnUrl.startsWith("/")) {
      window.history.back();
      return;
    }
    const returnUrl = rememberedSearchReturn() || appPath("/search#results");
    window.history.pushState({}, "", returnUrl);
    setOpportunityId("");
    setPathname(routePath());
    requestAnimationFrame(() => document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }));
  }

  if (opportunityId) return <OpportunityPage id={opportunityId} onBack={returnToRegistry} />;
  if (/^\/search\/?$/.test(pathname)) return <App page="search" onSelectOpportunity={openOpportunity} />;
  if (/^\/account\/?$/.test(pathname)) return <AccountPage />;
  if (/^\/developers\/?$/.test(pathname)) return <DeveloperPage />;
  if (/^\/privacy\/?$/.test(pathname)) return <PrivacyPage />;
  return <App onSelectOpportunity={openOpportunity} />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><AuthProvider><Root /></AuthProvider></StrictMode>);
