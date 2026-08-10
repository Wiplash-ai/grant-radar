import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import OpportunityPage from "./OpportunityPage";
import { DeveloperPage, PrivacyPage } from "./StaticPages";
import "./styles.css";

function routeId() {
  return decodeURIComponent(window.location.pathname.match(/^\/opportunity\/([^/]+)\/?$/)?.[1] || "");
}

function Root() {
  const [opportunityId, setOpportunityId] = useState(routeId);
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => { setOpportunityId(routeId()); setPathname(window.location.pathname); };
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  function openOpportunity(id: string) {
    window.history.pushState({}, "", `/opportunity/${encodeURIComponent(id)}`);
    setOpportunityId(id);
    setPathname(window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnToRegistry() {
    window.history.pushState({}, "", "/search#results");
    setOpportunityId("");
    setPathname("/search");
    requestAnimationFrame(() => document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }));
  }

  if (opportunityId) return <OpportunityPage id={opportunityId} onBack={returnToRegistry} />;
  if (/^\/search\/?$/.test(pathname)) return <App page="search" onSelectOpportunity={openOpportunity} />;
  if (/^\/developers\/?$/.test(pathname)) return <DeveloperPage />;
  if (/^\/privacy\/?$/.test(pathname)) return <PrivacyPage />;
  return <App onSelectOpportunity={openOpportunity} />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Root /></StrictMode>);
