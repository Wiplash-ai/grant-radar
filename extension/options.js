const defaults = { apiUrl: "https://labs.wiplash.ai/grants/api", apiKey: "" };
const form = document.getElementById("optionsForm");
const apiUrl = document.getElementById("apiUrl");
const apiKey = document.getElementById("apiKey");
chrome.storage.sync.get(defaults).then((settings) => { apiUrl.value = settings.apiUrl; apiKey.value = settings.apiKey; });
form.addEventListener("submit", async (event) => { event.preventDefault(); await chrome.storage.sync.set({ apiUrl: apiUrl.value.replace(/\/$/, ""), apiKey: apiKey.value.trim() }); const saved = document.getElementById("saved"); saved.textContent = "Saved"; setTimeout(() => saved.textContent = "", 1500); });
