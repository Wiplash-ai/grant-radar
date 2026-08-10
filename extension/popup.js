const form = document.getElementById("searchForm");
const query = document.getElementById("query");
const status = document.getElementById("status");
const results = document.getElementById("results");
const meta = document.getElementById("meta");
const defaults = { apiUrl: "https://api.grants.wiplash.ai", apiKey: "" };

function escapeHtml(value) { const node = document.createElement("span"); node.textContent = value || ""; return node.innerHTML; }
function date(value) { return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "TBD"; }
function money(value) { return value ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(value) : "Not stated"; }

async function search() {
  const settings = { ...defaults, ...await chrome.storage.sync.get(defaults) };
  const params = new URLSearchParams({ q: query.value.trim(), status: status.value, sort: "close-date-asc", limit: "20" });
  if (!status.value) params.delete("status");
  results.innerHTML = '<div class="empty">Scanning official-source opportunities…</div>';
  try {
    const response = await fetch(`${settings.apiUrl.replace(/\/$/, "")}/v1/grants?${params}`, { headers: settings.apiKey ? { "x-api-key": settings.apiKey } : {} });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || `API returned ${response.status}`);
    meta.textContent = `${body.pagination.total} matches · page 1 of ${body.pagination.pages}`;
    results.innerHTML = body.data.length ? body.data.map((grant) => `<article class="card"><div class="agency">${escapeHtml(grant.agency)} · ${escapeHtml(grant.status)}</div><h2>${escapeHtml(grant.title)}</h2><p>${escapeHtml(grant.summary)}</p><div class="facts"><span>Closes ${date(grant.closeAt)}</span><span>Up to ${escapeHtml(grant.awardCeilingLabel || money(grant.awardCeilingUsd))}</span></div><a href="${escapeHtml(grant.officialUrl)}" target="_blank">Official notice <span>↗</span></a></article>`).join("") : '<div class="empty">No opportunities matched. Try a broader phrase.</div>';
  } catch (error) {
    meta.textContent = "Connection issue";
    results.innerHTML = `<div class="empty error">${escapeHtml(error.message)}<br>Check API settings from the menu above.</div>`;
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); search(); });
document.getElementById("settings").addEventListener("click", () => chrome.runtime.openOptionsPage());
const initial = new URLSearchParams(location.search).get("q");
if (initial) { query.value = initial; search(); } else chrome.storage.session.get("pendingGrantQuery").then(({ pendingGrantQuery }) => { if (pendingGrantQuery) { query.value = pendingGrantQuery; chrome.storage.session.remove("pendingGrantQuery"); search(); } });
