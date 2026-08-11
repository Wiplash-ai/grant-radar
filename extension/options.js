const defaults = { appUrl: "https://labs.wiplash.ai/grants/search" };
const form = document.getElementById("optionsForm");
const appUrl = document.getElementById("appUrl");
chrome.storage.sync.get(defaults).then((settings) => { appUrl.value = settings.appUrl; });
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await chrome.storage.sync.set({ appUrl: appUrl.value.replace(/\/$/, "") });
  const saved = document.getElementById("saved");
  saved.textContent = "Search app saved";
  setTimeout(() => saved.textContent = "", 1800);
});
