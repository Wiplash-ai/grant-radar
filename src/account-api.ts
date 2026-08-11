import type { AccountLibrary, AccountSnapshot, SearchCriteria } from "./types";

const baseUrl = (import.meta.env.VITE_GRANTS_API_URL || "https://labs.wiplash.ai/grants/api").replace(/\/$/, "");

async function accountRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers || {}) }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Account request returned ${response.status}.`);
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json();
  return body.data as T;
}

export const getAccount = () => accountRequest<AccountSnapshot | null>("/account/v1/me");
export const getAccountLibrary = () => accountRequest<AccountLibrary>("/account/v1/library");
export const registerAccount = (input: { name?: string; email: string; password: string }) => accountRequest<AccountSnapshot>("/account/v1/register", { method: "POST", body: JSON.stringify(input) });
export const loginAccount = (input: { email: string; password: string }) => accountRequest<AccountSnapshot>("/account/v1/login", { method: "POST", body: JSON.stringify(input) });
export const logoutAccount = () => accountRequest<void>("/account/v1/logout", { method: "POST" });
export const setFavorite = (key: string, favorite: boolean) => accountRequest<AccountSnapshot>(`/account/v1/favorites/${encodeURIComponent(key)}`, { method: favorite ? "PUT" : "DELETE" });
export const saveAccountSearch = (name: string, criteria: SearchCriteria) => accountRequest<AccountSnapshot>("/account/v1/saved-searches", { method: "POST", body: JSON.stringify({ name, criteria }) });
export const deleteAccountSearch = (id: string) => accountRequest<AccountSnapshot>(`/account/v1/saved-searches/${encodeURIComponent(id)}`, { method: "DELETE" });
export const recordAccountSearch = (criteria: SearchCriteria) => accountRequest<AccountSnapshot | null>("/account/v1/search-history", { method: "POST", body: JSON.stringify(criteria) });
