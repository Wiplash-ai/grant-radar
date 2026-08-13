import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiBase = (process.env.SEO_API_URL || "http://localhost:8791").replace(/\/$/, "");
const apiKey = process.env.SEO_API_KEY || "";
const headers = apiKey ? { "x-api-key": apiKey } : {};
const grants = [];
let page = 1;
let pages = 1;

do {
  const response = await fetch(`${apiBase}/v1/grants?sort=posted-date-desc&page=${page}&limit=100`, { headers });
  if (!response.ok) throw new Error(`SEO catalog request failed with ${response.status}.`);
  const payload = await response.json();
  grants.push(...payload.data.map((grant) => ({
    key: grant.key,
    title: grant.title,
    agency: grant.agency,
    status: grant.status,
    opportunityNumber: grant.opportunityNumber,
    closeAt: grant.closeAt,
    description: grant.descriptionExcerpt || grant.summary,
    officialUrl: grant.officialUrl,
    lastVerifiedAt: grant.lastVerifiedAt,
    fundingActivityCategories: grant.fundingActivityCategories || [],
    eligibleApplicants: grant.eligibleApplicants || [],
    programFundingUsd: grant.programFundingUsd || grant.awardCeilingUsd
  })));
  pages = payload.pagination.pages;
  page += 1;
} while (page <= pages);

const targetDir = path.resolve("seo");
await mkdir(targetDir, { recursive: true });
await writeFile(path.join(targetDir, "catalog.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), grants }, null, 2)}\n`);
console.log(`Synced ${grants.length} public grant records for static SEO rendering.`);
