/**
 * Rebrand visible vuammo / Vua MMO → Vua Proxy across site HTML+JS
 * Skips: node_modules, .git, api, scripts that are tooling-only
 */
const fs = require("fs");
const path = require("path");

const ROOT = "C:/Users/Admin/Downloads/VuaProxy";
const SKIP_DIRS = new Set([
  "node_modules", ".git", "api", ".vercel", "agent-transcripts",
  "scripts", "terminals"
]);

const FOOTER_PROXY =
  "Vua Proxy cung cấp proxy tĩnh IPv4 và proxy xoay residential đa quốc gia — IP sạch, giao tự động, bảo hành rõ ràng.";

const replacements = [
  ["https://www.facebook.com/vuammo", "https://www.facebook.com/vuaproxy"],
  ["https://twitter.com/vuammo", "https://twitter.com/vuaproxy"],
  ["https://www.instagram.com/vuammo", "https://www.instagram.com/vuaproxy"],
  ["https://www.youtube.com/@VuaMMO", "https://www.youtube.com/@VuaProxy"],
  ["https://www.tiktok.com/@vuammo", "https://www.tiktok.com/@vuaproxy"],
  ["https://www.pinterest.com/vuammo", "https://www.pinterest.com/vuaproxy"],
  ["support@vuammo.com", "support@vuaproxy.vn"],
  ["https://vuammo.com", "https://www.vuaproxy.cloud"],
  ["http://vuammo.com", "https://www.vuaproxy.cloud"],
  ["www.vuammo.com", "www.vuaproxy.cloud"],
  ["vuammo.vn", "vuaproxy.vn"],
  ["@vuammo", "@vuaproxy"],
  ["Vua MMO", "Vua Proxy"],
  ["VuaMMO", "VuaProxy"],
  ["logo-vuammo.png", "logo-vuaproxy.png"],
  [
    "Vua Proxy là nền tảng giao dịch sản phẩm số — tài khoản, phần mềm bản quyền chính hãng với giá thành tốt nhất.",
    FOOTER_PROXY
  ],
  [
    "Vua MMO là nền tảng giao dịch sản phẩm số — tài khoản, phần mềm bản quyền chính hãng với giá thành tốt nhất.",
    FOOTER_PROXY
  ],
  ["Nền tảng giao dịch sản phẩm số", "Giải pháp proxy chuyên nghiệp"],
  ["nền tảng giao dịch sản phẩm số", "giải pháp proxy chuyên nghiệp"],
  ["Về Vua MMO", "Về Vua Proxy"],
  // footer regenerate bump
  ['data-vuammo-footer="home3"', 'data-vuammo-footer="home4"'],
  ["footer.dataset.vuammoFooter === \"home3\"", "footer.dataset.vuammoFooter === \"home4\""],
  ["footer.dataset.vuammoFooter = \"home3\"", "footer.dataset.vuammoFooter = \"home4\""]
];

let filesTouched = 0;
let replacementsDone = 0;

function walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const ent of ents) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(html|js)$/i.test(ent.name)) processFile(full);
  }
}

function processFile(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  // skip internal event-only files that only mention vuammo: as events? still process brand strings
  let next = text;
  let local = 0;
  for (const [from, to] of replacements) {
    if (!next.includes(from)) continue;
    const parts = next.split(from);
    local += parts.length - 1;
    next = parts.join(to);
  }
  if (next !== text) {
    fs.writeFileSync(file, next);
    filesTouched++;
    replacementsDone += local;
  }
}

walk(ROOT);
console.log(JSON.stringify({ filesTouched, replacementsDone }, null, 2));
