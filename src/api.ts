import type { GrantResponse } from "./types";

const baseUrl = (import.meta.env.VITE_GRANTS_API_URL || "http://localhost:8791").replace(/\/$/, "");
const apiKey = import.meta.env.VITE_GRANTS_API_KEY || "";

export type SearchInput = { q: string; status: string; sort: string; page: number; limit: number };

export async function searchGrants(input: SearchInput, signal?: AbortSignal): Promise<GrantResponse> {
  const params = new URLSearchParams({ sort: input.sort, page: String(input.page), limit: String(input.limit) });
  if (input.q.trim()) params.set("q", input.q.trim());
  if (input.status) params.set("status", input.status);
  const response = await fetch(`${baseUrl}/v1/grants?${params}`, { signal, headers: apiKey ? { "x-api-key": apiKey } : {} });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Grant API returned ${response.status}.`);
  }
  return response.json();
}
