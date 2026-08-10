import type { GrantDetailResponse, GrantResponse } from "./types";

const baseUrl = (import.meta.env.VITE_GRANTS_API_URL || "https://labs.wiplash.ai/grants/api").replace(/\/$/, "");
const apiKey = import.meta.env.VITE_GRANTS_API_KEY || "";

export type SearchInput = {
  q: string;
  status: string;
  agency: string;
  fundingCategory: string;
  fundingInstrument: string;
  eligibleApplicant: string;
  minAward: string;
  deadlineDays: string;
  hasFundingAmount: boolean;
  sort: string;
  page: number;
  limit: number;
};

export async function searchGrants(input: SearchInput, signal?: AbortSignal): Promise<GrantResponse> {
  const params = new URLSearchParams({ sort: input.sort, page: String(input.page), limit: String(input.limit) });
  if (input.q.trim()) params.set("q", input.q.trim());
  if (input.status) params.set("status", input.status);
  if (input.agency) params.set("agency", input.agency);
  if (input.fundingCategory) params.set("funding_category", input.fundingCategory);
  if (input.fundingInstrument) params.set("funding_instrument", input.fundingInstrument);
  if (input.eligibleApplicant) params.set("eligible_applicant", input.eligibleApplicant);
  if (input.minAward) params.set("min_award", input.minAward);
  if (input.hasFundingAmount) params.set("has_funding_amount", "true");
  if (input.deadlineDays) {
    const deadline = new Date();
    deadline.setUTCDate(deadline.getUTCDate() + Number(input.deadlineDays));
    params.set("closes_before", deadline.toISOString().slice(0, 10));
  }
  const response = await fetch(`${baseUrl}/v1/grants?${params}`, { signal, headers: apiKey ? { "x-api-key": apiKey } : {} });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Grant API returned ${response.status}.`);
  }
  return response.json();
}

export async function getGrant(id: string, signal?: AbortSignal): Promise<GrantDetailResponse> {
  const response = await fetch(`${baseUrl}/v1/grants/${encodeURIComponent(id)}`, { signal, headers: apiKey ? { "x-api-key": apiKey } : {} });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Grant API returned ${response.status}.`);
  }
  return response.json();
}
