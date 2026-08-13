import type { GrantDetail } from "./types";

const siteBase = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://labs.wiplash.ai/grants").replace(/\/$/, "");

function absolutePath(path: string) {
  return `${siteBase}${path === "/" ? "" : path}`;
}

function meta(name: string, content: string, property = false) {
  const attribute = property ? "property" : "name";
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function setSeo({
  title,
  description,
  path,
  type = "website",
  structuredData
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
  structuredData: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  const url = absolutePath(path);
  document.title = title;
  meta("description", description);
  meta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  meta("og:title", title, true);
  meta("og:description", description, true);
  meta("og:type", type, true);
  meta("og:url", url, true);
  meta("og:site_name", "Grant Grinder", true);
  meta("og:image", absolutePath("/grant-radar-field-team-v2.webp"), true);
  meta("twitter:card", "summary_large_image");
  meta("twitter:title", title);
  meta("twitter:description", description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  let script = document.head.querySelector<HTMLScriptElement>("#page-structured-data");
  if (!script) {
    script = document.createElement("script");
    script.id = "page-structured-data";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(structuredData);
}

export function homeSeo(total?: number) {
  const description = `Find ${total ? `${total.toLocaleString()} ` : ""}current U.S. federal grants by purpose, eligibility, agency, deadline, and funding amount. Free public search with official source links.`;
  setSeo({
    title: "Grant Grinder — Find federal grants you can act on",
    description,
    path: "/",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Grant Grinder",
        url: absolutePath("/"),
        potentialAction: {
          "@type": "SearchAction",
          target: `${absolutePath("/search")}?q={search_term_string}#results`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Grant Grinder current federal funding opportunities",
        description,
        url: absolutePath("/"),
        creator: { "@type": "Organization", name: "Wiplash.ai", url: "https://wiplash.ai/" },
        isBasedOn: "https://www.grants.gov/",
        temporalCoverage: "Current posted and forecasted opportunities",
        license: "https://www.usa.gov/government-copyright"
      }
    ]
  });
}

export function searchSeo(total?: number) {
  const description = `Search${total ? ` ${total.toLocaleString()}` : ""} current U.S. federal grants by keyword, agency, eligibility, category, deadline, status, and funding amount.`;
  setSeo({
    title: "Search current federal grants | Grant Grinder",
    description,
    path: "/search",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      name: "Search current federal grants",
      description,
      url: absolutePath("/search"),
      isPartOf: { "@type": "WebSite", name: "Grant Grinder", url: absolutePath("/") },
      about: { "@type": "Dataset", name: "Current U.S. federal funding opportunities" }
    }
  });
}

export function opportunitySeo(grant: GrantDetail) {
  const description = (grant.descriptionExcerpt || grant.details?.description || grant.summary).replace(/\s+/g, " ").slice(0, 300);
  const amount = grant.programFundingUsd || grant.details?.programFundingUsd || grant.awardCeilingUsd;
  setSeo({
    title: `${grant.title} — Federal grant briefing | Grant Grinder`,
    description,
    path: `/opportunity/${encodeURIComponent(grant.key.replace(/^opportunity:/, ""))}`,
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "MonetaryGrant",
      name: grant.title,
      description,
      url: absolutePath(`/opportunity/${encodeURIComponent(grant.key.replace(/^opportunity:/, ""))}`),
      identifier: grant.opportunityNumber || grant.key,
      funder: { "@type": "GovernmentOrganization", name: grant.agency },
      amount: amount ? { "@type": "MonetaryAmount", currency: "USD", value: amount } : undefined,
      validThrough: grant.closeAt,
      sameAs: grant.details?.grantsGovUrl || grant.officialUrl,
      mainEntityOfPage: grant.details?.grantsGovUrl || grant.officialUrl
    }
  });
}

export function developerSeo() {
  setSeo({
    title: "Grant Grinder API documentation — Federal grants API",
    description: "Developer documentation for searching, filtering, sorting, and retrieving complete current U.S. federal grant opportunities through the paid Grant Grinder API.",
    path: "/developers",
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "Grant Grinder API documentation",
      description: "Build grant search, alerts, directories, research agents, and funding workflows with normalized federal opportunity data.",
      author: { "@type": "Organization", name: "Wiplash.ai", url: "https://wiplash.ai/" },
      url: absolutePath("/developers")
    }
  });
}

export function privacySeo() {
  setSeo({
    title: "Grant Grinder privacy policy",
    description: "Privacy practices for the Grant Grinder website, browser extension, and commercial government grants API from Wiplash.ai.",
    path: "/privacy",
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Grant Grinder privacy policy",
      dateModified: "2026-08-10",
      url: absolutePath("/privacy"),
      publisher: { "@type": "Organization", name: "Wiplash.ai", url: "https://wiplash.ai/" }
    }
  });
}
