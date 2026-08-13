const MENU_ID = "grant-grinder-search-selection";
const defaults = { appUrl: "https://labs.wiplash.ai/grants/search" };
const accountCacheKey = "grantGrinderAccountContext";
const accountCacheLifetime = 15 * 60_000;

async function searchUrl(query = "") {
  const { appUrl } = await chrome.storage.sync.get(defaults);
  const url = new URL(appUrl || defaults.appUrl);
  if (query) url.searchParams.set("q", query.slice(0, 200));
  url.hash = "results";
  return url.toString();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => chrome.contextMenus.create({ id: MENU_ID, title: "Search Grant Grinder for “%s”", contexts: ["selection"] }));
});

function applyCriteria(url, criteria = {}) {
  const mappings = [
    ["query", "q"], ["q", "q"], ["status", "status"], ["agency", "agency"],
    ["fundingCategory", "funding_category"], ["fundingInstrument", "funding_instrument"],
    ["eligibleApplicant", "eligible_applicant"], ["minAward", "min_award"],
    ["deadlineDays", "deadline_days"], ["sort", "sort"]
  ];
  for (const [source, target] of mappings) {
    const value = criteria[source];
    if (value !== undefined && value !== null && String(value).trim()) url.searchParams.set(target, String(value).trim().slice(0, 240));
  }
  if (criteria.hasFundingAmount) url.searchParams.set("has_funding_amount", "true");
}

async function openFullApp(criteria = {}) {
  const { appUrl } = await chrome.storage.sync.get(defaults);
  const url = new URL(appUrl || defaults.appUrl);
  applyCriteria(url, criteria);
  url.hash = "results";
  return chrome.tabs.create({ url: url.toString(), active: true });
}

function isGrantGrinderPage(tab) {
  return typeof tab?.url === "string" && tab.url.startsWith("https://labs.wiplash.ai/grants/");
}

async function readAccountFromPage(tabId) {
  const [{ result } = {}] = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: async () => {
      try {
        const response = await fetch("/grants/api/account/v1/library", { credentials: "include", headers: { Accept: "application/json" } });
        if (response.status === 401) return { checked: true, account: null };
        if (!response.ok) return { checked: false, account: null };
        const body = await response.json();
        return { checked: true, account: body?.data || null };
      } catch {
        return { checked: false, account: null };
      }
    }
  });
  return result || { checked: false, account: null };
}

async function accountContext(preferredTab) {
  let sourceTab = isGrantGrinderPage(preferredTab) ? preferredTab : null;
  if (!sourceTab) {
    const candidates = await chrome.tabs.query({ url: "https://labs.wiplash.ai/grants/*" });
    sourceTab = candidates.find((tab) => typeof tab.id === "number") || null;
  }

  if (sourceTab?.id) {
    try {
      const result = await readAccountFromPage(sourceTab.id);
      if (result.checked) {
        if (result.account) await chrome.storage.local.set({ [accountCacheKey]: { account: result.account, updatedAt: Date.now() } });
        else await chrome.storage.local.remove(accountCacheKey);
        return result.account;
      }
    } catch (error) {
      console.warn("Grant Grinder could not refresh the signed-in funding desk.", error);
    }
  }

  const cached = (await chrome.storage.local.get(accountCacheKey))[accountCacheKey];
  return cached?.account && Date.now() - Number(cached.updatedAt || 0) < accountCacheLifetime ? cached.account : null;
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return openFullApp();
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const account = await accountContext(tab);
    await chrome.tabs.sendMessage(tab.id, { type: "grant-grinder-account-context", account }).catch(() => undefined);
  } catch (error) {
    console.warn("Grant Grinder cannot attach to this protected page; opening the full app in a tab instead.", error);
    await openFullApp();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "grant-grinder-open-full-app") return false;
  openFullApp(message.criteria)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "Unable to open the full app." }));
  return true;
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  await chrome.tabs.create({ url: await searchUrl(info.selectionText) });
});
