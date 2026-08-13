const API_ENDPOINT = "https://labs.wiplash.ai/grants/api/public/v1/grants";
const defaults = { appUrl: "https://labs.wiplash.ai/grants/search", lastQuery: "", lastStatus: "", lastSort: "relevance-desc" };
const hashParameters = new URLSearchParams(window.location.hash.slice(1));
const token = hashParameters.get("token") || "standalone";

const form = document.getElementById("searchForm");
const queryInput = document.getElementById("query");
const registry = document.querySelector(".registry");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const empty = document.getElementById("empty");
const results = document.getElementById("results");
const deskPanel = document.getElementById("deskPanel");
const resultLabel = document.getElementById("resultLabel");
const resultCount = document.getElementById("resultCount");
const dragHandle = document.getElementById("dragHandle");
const contextBanner = document.getElementById("contextBanner");
const contextTitle = document.getElementById("contextTitle");
const deskButton = document.getElementById("deskButton");
const deskCount = document.getElementById("deskCount");

const dropdownValues = { status: "", sort: "relevance-desc" };
let requestController;
let contextController;
let dragPointer = null;
let similarContext = null;
let currentView = "results";
let accountLibrary = null;
let initialized = false;
let pendingPageContext = null;

function sendToHost(type, detail = {}) {
  if (window.parent !== window) {
    window.parent.postMessage({ source: "grant-grinder-widget", token, type, ...detail }, "*");
    return;
  }
  if (type === "open-full-app") void chrome.runtime.sendMessage({ type: "grant-grinder-open-full-app", criteria: detail.criteria || {} });
  if (type === "close") window.close();
}

function openTab(url) {
  if (url) void chrome.tabs.create({ url, active: true });
}

function currentCriteria() {
  return {
    query: queryInput.value.trim(),
    status: dropdownValues.status,
    sort: dropdownValues.sort,
    fundingCategory: similarContext?.category || ""
  };
}

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function resultUrl(grant, appUrl) {
  const configured = new URL(appUrl || defaults.appUrl);
  const rootPath = configured.pathname.replace(/\/search\/?$/, "").replace(/\/$/, "");
  const id = grant.key.replace(/^opportunity:/, "");
  return `${configured.origin}${rootPath}/opportunity/${encodeURIComponent(id)}`;
}

function appendText(parent, tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  parent.append(node);
  return node;
}

function closeDropdowns(except) {
  for (const root of document.querySelectorAll(".custom-dropdown")) {
    if (root === except) continue;
    root.querySelector(".dropdown-menu").hidden = true;
    root.querySelector(".dropdown-trigger").setAttribute("aria-expanded", "false");
    root.classList.remove("open");
  }
}

function setDropdownValue(name, value, run = false) {
  const root = document.querySelector(`[data-dropdown="${name}"]`);
  const option = root?.querySelector(`[data-value="${CSS.escape(value)}"]`);
  if (!root || !option) return;
  dropdownValues[name] = value;
  root.querySelector(".dropdown-trigger b").textContent = option.textContent;
  for (const item of root.querySelectorAll("[role=option]")) item.setAttribute("aria-selected", String(item === option));
  if (run && initialized) void runSearch();
}

for (const root of document.querySelectorAll(".custom-dropdown")) {
  const name = root.dataset.dropdown;
  const trigger = root.querySelector(".dropdown-trigger");
  const menu = root.querySelector(".dropdown-menu");
  trigger.addEventListener("click", () => {
    const opening = menu.hidden;
    closeDropdowns(root);
    menu.hidden = !opening;
    trigger.setAttribute("aria-expanded", String(opening));
    root.classList.toggle("open", opening);
    if (opening) menu.querySelector('[aria-selected="true"]')?.focus();
  });
  trigger.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    if (menu.hidden) trigger.click();
    const options = [...menu.querySelectorAll("[role=option]")];
    (event.key === "ArrowUp" ? options.at(-1) : options[0])?.focus();
  });
  menu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-value]");
    if (!option) return;
    setDropdownValue(name, option.dataset.value, true);
    closeDropdowns();
    trigger.focus();
  });
  menu.addEventListener("keydown", (event) => {
    const options = [...menu.querySelectorAll("[role=option]")];
    const index = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdowns();
      trigger.focus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[nextIndex]?.focus();
    }
  });
}

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".custom-dropdown")) closeDropdowns();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeDropdowns(); });

function setResultsView(view) {
  currentView = "results";
  deskPanel.hidden = true;
  deskButton.classList.remove("active");
  deskButton.firstChild.textContent = "My desk ";
  loading.hidden = view !== "loading";
  error.hidden = view !== "error";
  empty.hidden = view !== "empty";
  results.hidden = view !== "results";
  registry.setAttribute("aria-busy", String(view === "loading"));
}

function tagsFor(grant) {
  return [
    ...(grant.fundingActivityCategories || grant.themes || []).slice(0, 2),
    ...(grant.eligibleApplicants || []).slice(0, 1)
  ].filter(Boolean);
}

function renderGrant(grant, appUrl, index, favorite = false) {
  const article = document.createElement("article");
  article.className = "grant-result";
  article.dataset.url = resultUrl(grant, appUrl);
  article.dataset.key = grant.key;
  article.grantRecord = grant;

  const summaryButton = document.createElement("button");
  summaryButton.type = "button";
  summaryButton.className = "grant-card";
  summaryButton.setAttribute("aria-expanded", "false");

  const top = document.createElement("span");
  top.className = "card-top";
  const left = document.createElement("span");
  left.className = "card-signals";
  appendText(left, "span", `status ${grant.status || "current"}`, grant.statusLabel || grant.status || "Current");
  if (favorite) appendText(left, "span", "saved-signal", "Saved");
  top.append(left);
  appendText(top, "span", "card-index", String(index + 1).padStart(2, "0"));
  summaryButton.append(top);
  appendText(summaryButton, "span", "agency", grant.agency || "Federal agency");
  appendText(summaryButton, "strong", "title", grant.title || "Untitled opportunity");
  appendText(summaryButton, "span", "summary", grant.descriptionExcerpt || grant.summary || "Expand this result for the available funding details.");

  const details = document.createElement("span");
  details.className = "card-details";
  appendText(details, "span", "", `Deadline ${grant.closeDateLabel || "not listed"}`);
  appendText(details, "span", "", grant.awardCeilingLabel || "Award varies");
  const expandHint = appendText(details, "span", "expand-hint", "Details +");
  summaryButton.append(details);

  const expanded = document.createElement("div");
  expanded.className = "grant-expanded";
  expanded.hidden = true;
  appendText(expanded, "p", "expanded-summary", grant.summary || grant.descriptionExcerpt || "Additional description is available in the full funding briefing.");
  const tags = document.createElement("div");
  tags.className = "expanded-tags";
  for (const tag of tagsFor(grant)) appendText(tags, "span", "", tag);
  if (tags.childElementCount) expanded.append(tags);
  const facts = document.createElement("div");
  facts.className = "expanded-facts";
  appendText(facts, "span", "", grant.opportunityNumber || "Federal opportunity");
  appendText(facts, "span", "", grant.fundingInstrumentTypes?.[0] || "Funding instrument varies");
  expanded.append(facts);
  const open = appendText(expanded, "button", "open-briefing", "Open opportunity in new tab ↗");
  open.type = "button";

  summaryButton.addEventListener("click", () => {
    const opening = expanded.hidden;
    const container = article.parentElement;
    for (const other of container?.querySelectorAll(".grant-result.expanded") || []) {
      if (other === article) continue;
      other.classList.remove("expanded");
      other.querySelector(".grant-card")?.setAttribute("aria-expanded", "false");
      other.querySelector(".grant-expanded").hidden = true;
      const hint = other.querySelector(".expand-hint");
      if (hint) hint.textContent = "Details +";
    }
    article.classList.toggle("expanded", opening);
    expanded.hidden = !opening;
    summaryButton.setAttribute("aria-expanded", String(opening));
    expandHint.textContent = opening ? "Details −" : "Details +";
    if (opening) void hydrateGrantDetails(article);
  });
  open.addEventListener("click", () => openTab(article.dataset.url));
  article.append(summaryButton, expanded);
  return article;
}

async function hydrateGrantDetails(article) {
  if (article.dataset.hydrated === "true" || article.dataset.hydrating === "true") return;
  article.dataset.hydrating = "true";
  const id = article.dataset.key.replace(/^opportunity:/, "");
  try {
    const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(id)}`, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const grant = (await response.json()).data;
    article.grantRecord = grant;
    const summary = grant?.details?.description || grant?.summary || grant?.descriptionExcerpt;
    if (summary) article.querySelector(".expanded-summary").textContent = summary.length > 850 ? `${summary.slice(0, 847).trim()}…` : summary;
    const tagContainer = article.querySelector(".expanded-tags");
    tagContainer.replaceChildren();
    for (const tag of tagsFor(grant)) appendText(tagContainer, "span", "", tag);
    tagContainer.hidden = !tagContainer.childElementCount;
    article.dataset.hydrated = "true";
  } catch {
    // The search-list summary remains useful if the optional detail request fails.
  } finally {
    delete article.dataset.hydrating;
  }
}

function clearSimilarContext(run = false) {
  const hadContext = Boolean(similarContext);
  similarContext = null;
  contextBanner.hidden = true;
  contextTitle.textContent = "";
  queryInput.placeholder = "Try rural health, housing, veterans…";
  if (run && hadContext) void runSearch();
}

async function loadSimilarOpportunity(id) {
  if (!id || similarContext?.id === id) return;
  contextController?.abort();
  contextController = new AbortController();
  similarContext = { id, title: "Current opportunity", category: "" };
  contextBanner.hidden = false;
  contextTitle.textContent = "Reading the current funding record…";
  queryInput.value = "";
  queryInput.placeholder = "Refine this similarity scan…";
  setDropdownValue("status", "");
  setDropdownValue("sort", "relevance-desc");
  setResultsView("loading");
  resultLabel.textContent = "Building similarity scan";
  resultCount.textContent = "—";

  try {
    const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(id)}`, { headers: { Accept: "application/json" }, signal: contextController.signal });
    if (!response.ok) throw new Error(`Opportunity returned ${response.status}`);
    const grant = (await response.json()).data;
    const category = grant.fundingActivityCategories?.[0] || grant.themes?.[0] || "";
    similarContext = { id, title: grant.title, category, fallbackQuery: category || grant.agency || grant.title.split(/\s+/).slice(0, 6).join(" ") };
    contextTitle.textContent = grant.title;
    await runSearch({ persist: false });
  } catch (cause) {
    if (cause?.name === "AbortError") return;
    clearSimilarContext();
    await runSearch();
  }
}

async function runSearch({ persist = true } = {}) {
  requestController?.abort();
  requestController = new AbortController();
  const query = queryInput.value.trim();
  const params = new URLSearchParams({ page: "1", limit: similarContext ? "8" : "7", sort: dropdownValues.sort || "relevance-desc" });
  if (query) params.set("q", query);
  else if (similarContext?.category) params.set("funding_category", similarContext.category);
  else if (similarContext?.fallbackQuery) params.set("q", similarContext.fallbackQuery);
  if (dropdownValues.status) params.set("status", dropdownValues.status);

  setResultsView("loading");
  resultLabel.textContent = similarContext ? "Similar opportunities" : query ? `Targets for “${query}”` : "Current opportunities";
  resultCount.textContent = "—";

  try {
    const [response, settings] = await Promise.all([
      fetch(`${API_ENDPOINT}?${params}`, { headers: { Accept: "application/json" }, signal: requestController.signal }),
      chrome.storage.sync.get(defaults)
    ]);
    if (!response.ok) throw new Error(`Registry returned ${response.status}`);
    const payload = await response.json();
    let grants = Array.isArray(payload.data) ? payload.data : [];
    if (similarContext) grants = grants.filter((grant) => grant.key.replace(/^opportunity:/, "") !== similarContext.id);
    grants = grants.slice(0, 7);
    const favoriteKeys = new Set(accountLibrary?.favoriteKeys || []);
    results.replaceChildren(...grants.map((grant, index) => renderGrant(grant, settings.appUrl, index, favoriteKeys.has(grant.key))));
    const total = Math.max(0, Number(payload.pagination?.total || grants.length) - (similarContext ? 1 : 0));
    resultCount.textContent = `${formatCount(total)} found`;
    if (persist && !similarContext) await chrome.storage.sync.set({ lastQuery: query, lastStatus: dropdownValues.status, lastSort: dropdownValues.sort });
    setResultsView(grants.length ? "results" : "empty");
  } catch (cause) {
    if (cause?.name === "AbortError") return;
    document.getElementById("errorMessage").textContent = cause?.message || "Try the search again.";
    resultLabel.textContent = "Registry unavailable";
    resultCount.textContent = "Offline";
    setResultsView("error");
  }
}

function criteriaSummary(criteria = {}) {
  return [criteria.q, criteria.fundingCategory, criteria.agency, criteria.status, criteria.eligibleApplicant].filter(Boolean).slice(0, 3).join(" · ") || "Saved funding criteria";
}

async function renderDesk() {
  if (!accountLibrary) return;
  currentView = "desk";
  loading.hidden = true;
  error.hidden = true;
  empty.hidden = true;
  results.hidden = true;
  deskPanel.hidden = false;
  registry.setAttribute("aria-busy", "false");
  deskButton.classList.add("active");
  deskButton.firstChild.textContent = "Results ";
  resultLabel.textContent = "My funding desk";
  resultCount.textContent = accountLibrary.user?.name || accountLibrary.user?.email || "Signed in";
  const settings = await chrome.storage.sync.get(defaults);
  deskPanel.replaceChildren();

  const favoriteSection = document.createElement("section");
  favoriteSection.className = "desk-section";
  appendText(favoriteSection, "h2", "", `Favorite opportunities · ${accountLibrary.favorites?.length || 0}`);
  const favoriteList = document.createElement("div");
  favoriteList.className = "desk-favorites";
  const favorites = (accountLibrary.favorites || []).slice(0, 5);
  if (favorites.length) favoriteList.append(...favorites.map((grant, index) => renderGrant(grant, settings.appUrl, index, true)));
  else appendText(favoriteList, "p", "desk-empty", "No favorite opportunities yet.");
  favoriteSection.append(favoriteList);
  deskPanel.append(favoriteSection);

  const searches = accountLibrary.savedSearches || [];
  const searchSection = document.createElement("section");
  searchSection.className = "desk-section desk-searches";
  appendText(searchSection, "h2", "", `Saved searches · ${searches.length}`);
  if (searches.length) {
    for (const saved of searches.slice(0, 6)) {
      const button = document.createElement("button");
      button.type = "button";
      appendText(button, "strong", "", saved.name);
      appendText(button, "span", "", criteriaSummary(saved.criteria));
      appendText(button, "b", "", "Open ↗");
      button.addEventListener("click", () => sendToHost("open-full-app", { criteria: saved.criteria }));
      searchSection.append(button);
    }
  } else appendText(searchSection, "p", "desk-empty", "No saved searches yet.");
  deskPanel.append(searchSection);
}

function setAccountContext(account) {
  accountLibrary = account || null;
  deskButton.hidden = !accountLibrary;
  if (!accountLibrary) {
    if (currentView === "desk") setResultsView("results");
    return;
  }
  deskCount.textContent = String((accountLibrary.favorites?.length || 0) + (accountLibrary.savedSearches?.length || 0));
  if (currentView === "desk") void renderDesk();
}

function handlePageContext(context) {
  if (!initialized) {
    pendingPageContext = context;
    return;
  }
  if (context?.type === "opportunity" && context.id) void loadSimilarOpportunity(context.id);
  else if (similarContext) clearSimilarContext(true);
}

window.addEventListener("message", (event) => {
  if (event.source !== window.parent || event.data?.source !== "grant-grinder-host" || event.data?.token !== token) return;
  if (event.data.type === "context-change") handlePageContext(event.data.context);
  if (event.data.type === "account-context") setAccountContext(event.data.account);
});

dragHandle.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button")) return;
  dragPointer = event.pointerId;
  dragHandle.setPointerCapture(event.pointerId);
  dragHandle.classList.add("dragging");
  sendToHost("drag-start", { screenX: event.screenX, screenY: event.screenY });
});
dragHandle.addEventListener("pointermove", (event) => {
  if (event.pointerId === dragPointer) sendToHost("drag-move", { screenX: event.screenX, screenY: event.screenY });
});
function finishDrag(event) {
  if (event.pointerId !== dragPointer) return;
  dragPointer = null;
  dragHandle.classList.remove("dragging");
  sendToHost("drag-end", { screenX: event.screenX, screenY: event.screenY });
}
dragHandle.addEventListener("pointerup", finishDrag);
dragHandle.addEventListener("pointercancel", finishDrag);
dragHandle.addEventListener("keydown", (event) => {
  if (event.target !== dragHandle || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const distance = event.shiftKey ? 40 : 10;
  const directions = {
    ArrowLeft: { deltaX: -distance, deltaY: 0 }, ArrowRight: { deltaX: distance, deltaY: 0 },
    ArrowUp: { deltaX: 0, deltaY: -distance }, ArrowDown: { deltaX: 0, deltaY: distance }
  };
  sendToHost("nudge", directions[event.key]);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearSimilarContext();
  void runSearch();
});
document.querySelector(".quick-searches").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-query]");
  if (!button) return;
  clearSimilarContext();
  queryInput.value = button.dataset.query;
  setDropdownValue("sort", "relevance-desc");
  void runSearch();
});
document.getElementById("retry").addEventListener("click", () => { void runSearch(); });
document.getElementById("clearContext").addEventListener("click", () => clearSimilarContext(true));
document.getElementById("closeWidget").addEventListener("click", () => sendToHost("close"));
document.getElementById("openFullApp").addEventListener("click", () => sendToHost("open-full-app", { criteria: currentCriteria() }));
deskButton.addEventListener("click", () => { if (currentView === "desk") setResultsView("results"); else void renderDesk(); });

chrome.storage.sync.get(defaults).then((settings) => {
  queryInput.value = settings.lastQuery || "";
  setDropdownValue("status", settings.lastStatus || "");
  setDropdownValue("sort", settings.lastSort || "relevance-desc");
  initialized = true;
  const contextId = hashParameters.get("contextId");
  if (pendingPageContext) handlePageContext(pendingPageContext);
  else if (contextId) void loadSimilarOpportunity(contextId);
  else void runSearch();
});
