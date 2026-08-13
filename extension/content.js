(() => {
  const controllerKey = "__grantGrinderWidgetController";
  const existing = globalThis[controllerKey];
  if (existing?.toggle) {
    existing.toggle();
    return;
  }

  const token = crypto.randomUUID();
  const host = document.createElement("grant-grinder-widget");
  const shadow = host.attachShadow({ mode: "closed" });
  const frame = document.createElement("iframe");
  let dragOrigin = null;
  let visible = true;
  let account = null;
  let lastContextKey = "";

  function pageContext() {
    const match = window.location.pathname.match(/\/opportunity\/([^/?#]+)/i);
    return match ? { type: "opportunity", id: decodeURIComponent(match[1]) } : { type: "page" };
  }

  function sendToWidget(type, detail = {}) {
    frame.contentWindow?.postMessage({ source: "grant-grinder-host", token, type, ...detail }, "*");
  }

  function syncPageContext(force = false) {
    const context = pageContext();
    const key = `${context.type}:${context.id || ""}`;
    if (!force && key === lastContextKey) return;
    lastContextKey = key;
    sendToWidget("context-change", { context });
  }

  for (const [property, value] of Object.entries({
    all: "initial",
    position: "fixed",
    right: "18px",
    bottom: "18px",
    width: "440px",
    height: "840px",
    display: "block",
    zIndex: "2147483647",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 22px 70px rgba(5, 13, 8, .36), 0 0 0 1px rgba(20, 35, 25, .42)"
  })) host.style.setProperty(property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`), value, "important");

  const initialContext = pageContext();
  const widgetHash = new URLSearchParams({ token });
  if (initialContext.type === "opportunity") widgetHash.set("contextId", initialContext.id);
  frame.src = `${chrome.runtime.getURL("widget.html")}#${widgetHash}`;
  frame.title = "Grant Grinder federal grant search widget";
  frame.allow = "clipboard-write";
  for (const [property, value] of Object.entries({ width: "100%", height: "100%", display: "block", border: "0", background: "transparent" })) {
    frame.style.setProperty(property, value, "important");
  }
  shadow.append(frame);
  (document.documentElement || document.body).append(host);
  frame.addEventListener("load", () => {
    syncPageContext(true);
    sendToWidget("account-context", { account });
  });

  function clampPosition(left, top) {
    const margin = 8;
    return {
      left: Math.min(Math.max(margin, left), Math.max(margin, window.innerWidth - host.offsetWidth - margin)),
      top: Math.min(Math.max(margin, top), Math.max(margin, window.innerHeight - host.offsetHeight - margin))
    };
  }

  function setPosition(left, top) {
    const next = clampPosition(left, top);
    host.style.setProperty("left", `${next.left}px`, "important");
    host.style.setProperty("top", `${next.top}px`, "important");
    host.style.setProperty("right", "auto", "important");
    host.style.setProperty("bottom", "auto", "important");
    return next;
  }

  function currentPosition() {
    const rect = host.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }

  function show() {
    visible = true;
    host.style.setProperty("display", "block", "important");
    const position = currentPosition();
    setPosition(position.left, position.top);
  }

  function hide() {
    visible = false;
    host.style.setProperty("display", "none", "important");
  }

  const controller = {
    toggle() { if (visible) hide(); else show(); },
    hide,
    show,
    setAccount(nextAccount) {
      account = nextAccount || null;
      sendToWidget("account-context", { account });
    }
  };
  globalThis[controllerKey] = controller;

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "grant-grinder-account-context") controller.setAccount(message.account);
  });

  chrome.storage.local.get({ grantGrinderWidgetPosition: null }).then(({ grantGrinderWidgetPosition }) => {
    if (grantGrinderWidgetPosition && Number.isFinite(grantGrinderWidgetPosition.left) && Number.isFinite(grantGrinderWidgetPosition.top)) {
      setPosition(grantGrinderWidgetPosition.left, grantGrinderWidgetPosition.top);
    }
  });

  window.addEventListener("resize", () => {
    if (!visible) return;
    const position = currentPosition();
    setPosition(position.left, position.top);
  });

  window.setInterval(() => syncPageContext(), 750);

  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow || event.data?.source !== "grant-grinder-widget" || event.data?.token !== token) return;
    const { type, screenX, screenY } = event.data;

    if (type === "drag-start") {
      const position = currentPosition();
      dragOrigin = { pointerX: screenX, pointerY: screenY, left: position.left, top: position.top };
      host.style.setProperty("transition", "none", "important");
      return;
    }
    if (type === "drag-move" && dragOrigin) {
      setPosition(dragOrigin.left + screenX - dragOrigin.pointerX, dragOrigin.top + screenY - dragOrigin.pointerY);
      return;
    }
    if (type === "drag-end" && dragOrigin) {
      dragOrigin = null;
      const position = currentPosition();
      void chrome.storage.local.set({ grantGrinderWidgetPosition: position });
      return;
    }
    if (type === "nudge") {
      const position = currentPosition();
      const next = setPosition(position.left + Number(event.data.deltaX || 0), position.top + Number(event.data.deltaY || 0));
      void chrome.storage.local.set({ grantGrinderWidgetPosition: next });
      return;
    }
    if (type === "close") {
      hide();
      return;
    }
    if (type === "open-full-app") {
      void chrome.runtime.sendMessage({ type: "grant-grinder-open-full-app", criteria: event.data.criteria || {} });
    }
  });
})();
