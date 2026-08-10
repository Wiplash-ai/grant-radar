const MENU_ID = "grant-radar-search-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => chrome.contextMenus.create({ id: MENU_ID, title: "Search Grant Radar for “%s”", contexts: ["selection"] }));
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  await chrome.storage.session.set({ pendingGrantQuery: info.selectionText.slice(0, 200) });
  chrome.windows.create({ url: chrome.runtime.getURL(`popup.html?q=${encodeURIComponent(info.selectionText.slice(0, 200))}`), type: "popup", width: 520, height: 720 });
});
