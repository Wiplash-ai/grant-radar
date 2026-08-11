const MENU_ID = "grant-grinder-search-selection";
const defaults = { appUrl: "https://labs.wiplash.ai/grants/search" };

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

chrome.action.onClicked.addListener(async () => {
  await chrome.tabs.create({ url: await searchUrl() });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  await chrome.tabs.create({ url: await searchUrl(info.selectionText) });
});
