const fs = require("fs");
const path = require("path");

const widgetPath = path.join(__dirname, "..", "js", "chat-widget.js");
let s = fs.readFileSync(widgetPath, "utf8");

const old = `  function visitorKey() {
    try {
      let k = localStorage.getItem("vuammo_visitor_key");
      if (!k) {
        k =
          "v_" +
          Math.random().toString(36).slice(2) +
          Date.now().toString(36);
        localStorage.setItem("vuammo_visitor_key", k);
      }
      return k;
    } catch (_) {
      return "anon";
    }
  }`;

const neu = `  function visitorKey() {
    try {
      const u =
        window.VuammoAuth && typeof VuammoAuth.getUser === "function"
          ? VuammoAuth.getUser()
          : null;
      if (u && u.id) {
        const uidKey = "u_" + String(u.id);
        try {
          localStorage.setItem("vuammo_visitor_key", uidKey);
        } catch (_) {}
        return uidKey;
      }
      let k = localStorage.getItem("vuammo_visitor_key");
      if (!k || String(k).indexOf("u_") === 0) {
        k =
          "v_" +
          Math.random().toString(36).slice(2) +
          Date.now().toString(36);
        localStorage.setItem("vuammo_visitor_key", k);
      }
      return k;
    } catch (_) {
      return "anon";
    }
  }`;

if (!s.includes(old)) {
  console.error("visitorKey block not found");
  process.exit(1);
}
s = s.replace(old, neu);

if (!s.includes('get("openChat")')) {
  const marker = "  fab.addEventListener(\"click\", function () {";
  const idx = s.indexOf(marker);
  if (idx < 0) {
    console.error("fab click marker missing");
    process.exit(1);
  }
  s =
    s.slice(0, idx) +
    `  try {
    if (new URLSearchParams(location.search).get("openChat") === "1") {
      setTimeout(function () {
        fab.click();
      }, 400);
    }
  } catch (_) {}

` +
    s.slice(idx);
}

fs.writeFileSync(widgetPath, s);
console.log("patched chat-widget.js");

const widgetHtml = `<!-- ===== LIVE CHAT WIDGET ===== -->
<div class="chat-widget">
  <button class="chat-fab" id="chatFabBtn" aria-label="Chat trực tiếp với Vua Proxy">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    <span class="chat-fab-badge" id="chatFabBadge">1</span>
  </button>
  <div class="chat-panel" id="chatPanel" hidden>
    <div class="chat-panel-header">
      <img src="/images/logo-vuaproxy.png" alt="Vua Proxy" class="chat-avatar">
      <div>
        <p class="chat-panel-title">Vua Proxy</p>
        <p class="chat-panel-sub"><span class="chat-online-dot"></span>Thường trả lời trong vài phút</p>
      </div>
      <button type="button" class="chat-panel-close" id="chatCloseBtn" aria-label="Đóng">&times;</button>
    </div>
    <div class="chat-panel-body" id="chatMessages">
      <div class="chat-msg chat-msg-bot">Xin chào 👋 Bạn cần Vua Proxy hỗ trợ gì hôm nay?</div>
    </div>
    <form class="chat-panel-input" id="chatForm">
      <input type="text" id="chatInput" placeholder="Nhập tin nhắn..." autocomplete="off">
      <button type="submit" aria-label="Gửi"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>
    </form>
  </div>
</div>
`;

function injectChat(file) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('id="chatFabBtn"')) return false;
  if (!html.includes("chat-widget.js")) return false;
  if (html.includes('<div class="toast" id="toast"></div>')) {
    html = html.replace(
      '<div class="toast" id="toast"></div>',
      widgetHtml + "\n<div class=\"toast\" id=\"toast\"></div>"
    );
  } else if (html.includes('<nav class="bottom-nav">')) {
    html = html.replace('<nav class="bottom-nav">', widgetHtml + "\n<nav class=\"bottom-nav\">");
  } else {
    html = html.replace("</body>", widgetHtml + "\n</body>");
  }
  html = html.replace(
    /chat-widget\.js\?v=[^"']+/g,
    "chat-widget.js?v=20260911chat2"
  );
  fs.writeFileSync(file, html);
  return true;
}

const root = path.join(__dirname, "..");
let n = 0;
for (const f of fs.readdirSync(path.join(root, "tat-ca-khu-vuc"))) {
  if (!f.endsWith(".html")) continue;
  if (injectChat(path.join(root, "tat-ca-khu-vuc", f))) n++;
}
if (injectChat(path.join(root, "khu-vuc-quoc-gia.html"))) n++;
if (injectChat(path.join(root, "product.html"))) n++;
console.log("injected chat widget into", n, "pages");
