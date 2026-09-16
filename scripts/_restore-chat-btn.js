const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const CHAT =
  '        <a class="icon-btn chat-btn" href="/tin-nhan" aria-label="Tin nhắn" title="Tin nhắn">\n' +
  '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H10l-4.2 3.2A.8.8 0 0 1 4.5 18.5V16A2.5 2.5 0 0 1 4 13.5v-8z"/></svg>\n' +
  '          <span class="nav-badge hidden" id="chatBadgeTop">0</span>\n' +
  "        </a>\n";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "api") continue;
    const full = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

let n = 0;
for (const file of walk(root)) {
  let s;
  try {
    s = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  let changed = false;
  if (s.includes("nav-actions") && s.includes("account-btn") && !s.includes("chat-btn")) {
    const next = s.replace(
      /(<a class="icon-btn account-btn"[\s\S]*?<\/a>)(\s*)(<\/div>)/,
      (m, a, sp, c) => a + "\n" + CHAT + c
    );
    if (next !== s) {
      s = next;
      changed = true;
    }
  }
  if (s.includes("site-header.js")) {
    const next = s.replace(/site-header\.js\?v=[^"]+/g, "site-header.js?v=20260914chat1");
    if (next !== s) {
      s = next;
      changed = true;
    }
  }
  if (changed) {
    try {
      fs.writeFileSync(file, s);
      n++;
    } catch (_) {}
  }
}
console.log("updated", n);
