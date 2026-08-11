import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const siteBase = (process.env.PUBLIC_SITE_URL || "https://labs.wiplash.ai/grants").replace(/\/$/, "");
const distDir = path.resolve("dist");
const shell = await readFile(path.join(distDir, "index.html"), "utf8");
const catalog = JSON.parse(await readFile(path.resolve("seo/catalog.json"), "utf8"));

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function replaceMeta(html, { title, description, url, type = "website", structuredData, fallback }) {
  const safeDescription = description.replace(/\s+/g, " ").slice(0, 300);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(safeDescription)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(safeDescription)}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
    .replace(/<script id="page-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/, `<script id="page-structured-data" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
}

async function writeRoute(route, html) {
  const directory = path.join(distDir, route.replace(/^\//, ""));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
}

for (const grant of catalog.grants) {
  const id = grant.key.replace(/^opportunity:/, "");
  const route = `/opportunity/${encodeURIComponent(id)}`;
  const url = `${siteBase}${route}`;
  const title = `${grant.title} — Federal grant briefing | Grant Grinder`;
  const description = grant.description || `${grant.agency} federal funding opportunity.`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MonetaryGrant",
    name: grant.title,
    description,
    url,
    identifier: grant.opportunityNumber || grant.key,
    funder: { "@type": "GovernmentOrganization", name: grant.agency },
    amount: grant.programFundingUsd ? { "@type": "MonetaryAmount", currency: "USD", value: grant.programFundingUsd } : undefined,
    validThrough: grant.closeAt,
    sameAs: grant.officialUrl
  };
  const fallback = `<main class="seo-fallback"><p>${escapeHtml(grant.status)} federal funding opportunity</p><h1>${escapeHtml(grant.title)}</h1><p>${escapeHtml(description)}</p><dl><dt>Agency</dt><dd>${escapeHtml(grant.agency)}</dd><dt>Opportunity number</dt><dd>${escapeHtml(grant.opportunityNumber || "Not stated")}</dd></dl><a href="${escapeHtml(grant.officialUrl)}">View the official government notice</a></main>`;
  await writeRoute(route, replaceMeta(shell, { title, description, url, type: "article", structuredData, fallback }));
}

const staticRoutes = [
  {
    route: "/search",
    title: "Search current federal grants | Grant Grinder",
    description: `Search ${catalog.grants.length.toLocaleString()} current U.S. federal grants by keyword, agency, eligibility, category, deadline, status, and funding amount.`,
    type: "website",
    structuredType: "SearchResultsPage",
    fallback: `<main class="seo-fallback"><h1>Search current federal grants</h1><p>Search ${catalog.grants.length.toLocaleString()} current federal funding opportunities by the work you do, the people you serve, your organization type, agency, deadline, and funding amount.</p><a href="${siteBase}">About Grant Grinder</a></main>`
  },
  {
    route: "/developers",
    title: "Grant Grinder API documentation — Federal grants API",
    description: "Developer documentation for searching, filtering, sorting, and retrieving complete current U.S. federal grant opportunities through the paid Grant Grinder API.",
    type: "article",
    fallback: "<main class=\"seo-fallback\"><h1>Grant Grinder API documentation</h1><p>Build grant search, alerts, directories, research agents, and funding workflows with normalized federal opportunity data.</p></main>"
  },
  {
    route: "/privacy",
    title: "Grant Grinder privacy policy",
    description: "Privacy practices for the Grant Grinder website, browser extension, and commercial government grants API from Wiplash.ai.",
    type: "article",
    fallback: "<main class=\"seo-fallback\"><h1>Grant Grinder privacy policy</h1><p>Grant Grinder does not sell personal information or use searches for behavioral advertising.</p></main>"
  }
];

for (const page of staticRoutes) {
  const url = `${siteBase}${page.route}`;
  await writeRoute(page.route, replaceMeta(shell, {
    ...page,
    url,
    structuredData: { "@context": "https://schema.org", "@type": page.structuredType || "WebPage", name: page.title, description: page.description, url }
  }));
}

const accountUrl = `${siteBase}/account`;
const accountHtml = replaceMeta(shell, {
  title: "Sign in or register | Grant Grinder",
  description: "Access your private Grant Grinder funding desk for favorite opportunities, saved search criteria, and previous searches.",
  url: accountUrl,
  structuredData: { "@context": "https://schema.org", "@type": "WebPage", name: "Grant Grinder funding desk", url: accountUrl },
  fallback: "<main class=\"seo-fallback\"><h1>Your Grant Grinder funding desk</h1><p>Sign in to manage favorite opportunities and saved searches.</p></main>"
}).replace(/<meta name="robots" content="[^"]*"\s*\/>/, '<meta name="robots" content="noindex,nofollow" />');
await writeRoute("/account", accountHtml);

const urls = [
  { loc: siteBase, lastmod: catalog.generatedAt },
  ...staticRoutes.map((page) => ({ loc: `${siteBase}${page.route}`, lastmod: catalog.generatedAt })),
  ...catalog.grants.map((grant) => ({ loc: `${siteBase}/opportunity/${encodeURIComponent(grant.key.replace(/^opportunity:/, ""))}`, lastmod: grant.lastVerifiedAt || catalog.generatedAt }))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc><lastmod>${String(lastmod).slice(0,10)}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(path.join(distDir, "sitemap.xml"), sitemap);
console.log(`Pre-rendered ${catalog.grants.length} opportunity pages, ${staticRoutes.length} public information pages, and the private account shell.`);
