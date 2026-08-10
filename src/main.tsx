import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import OpportunityPage from "./OpportunityPage";
import "./styles.css";

function routeId() {
  return decodeURIComponent(window.location.pathname.match(/^\/opportunity\/([^/]+)\/?$/)?.[1] || "");
}

function Root() {
  const [opportunityId, setOpportunityId] = useState(routeId);

  useEffect(() => {
    const handleNavigation = () => setOpportunityId(routeId());
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  function openOpportunity(id: string) {
    window.history.pushState({}, "", `/opportunity/${encodeURIComponent(id)}`);
    setOpportunityId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnToRegistry() {
    window.history.pushState({}, "", "/#results");
    setOpportunityId("");
    document.title = "Grant Radar — Fund the mission";
    requestAnimationFrame(() => document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }));
  }

  return opportunityId ? <OpportunityPage id={opportunityId} onBack={returnToRegistry} /> : <App onSelectOpportunity={openOpportunity} />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Root /></StrictMode>);
