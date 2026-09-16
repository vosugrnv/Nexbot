const fs = require("fs");
const path = require("path");
const vm = require("vm");
const https = require("https");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const STOCK_FILE = "C:/Users/Admin/Downloads/tk proxy.txt";
const API = process.env.VP_API || "https://www.vuaproxy.cloud/api";
const EMAIL = process.env.VP_ADMIN_EMAIL || "phamquynhanh.hd.1994@gmail.com";
const PASS = process.env.VP_ADMIN_PASS || "Gabeo432@";

function request(method, urlPath, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(API.replace(/\/$/, "") + urlPath);
    const lib = u.protocol === "https:" ? https : http;
    const data = body != null ? JSON.stringify(body) : null;
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
        }
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch (_) {
            json = { raw };
          }
          if (res.statusCode >= 400) {
            const err = new Error(json.error || json.message || raw || res.statusCode);
            err.status = res.statusCode;
            err.body = json;
            reject(err);
          } else resolve(json);
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function loadProductIds() {
  const code = fs.readFileSync(path.join(ROOT, "js", "products-data.js"), "utf8");
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const products =
    (typeof ctx.RAW_PRODUCTS !== "undefined" && ctx.RAW_PRODUCTS) ||
    ctx.window.RAW_PRODUCTS ||
    [];
  const ids = new Set();
  for (const p of products) {
    if (p && p.id != null) ids.add(String(p.id));
    for (const v of p.variants || []) {
      if (v && v.id != null) ids.add(String(v.id));
    }
  }
  return { products: products.length, ids: [...ids] };
}

async function main() {
  const text = fs.readFileSync(STOCK_FILE, "utf8");
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  console.log("stock lines:", lines.length);

  const { products, ids } = loadProductIds();
  console.log("catalog products:", products, "ids(+variants):", ids.length);

  const login = await request("POST", "/auth/login", {
    body: { email: EMAIL, password: PASS }
  });
  const token = login.token || login.accessToken || login.jwt;
  if (!token) throw new Error("Login OK but no token: " + JSON.stringify(login));
  console.log("logged in as", login.user?.email || EMAIL);

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < ids.length; i++) {
    const productId = ids[i];
    try {
      const r = await request("POST", "/stock/import", {
        token,
        body: { productId, text }
      });
      ok++;
      if (i < 5 || i === ids.length - 1 || i % 25 === 0) {
        console.log(`[${i + 1}/${ids.length}] #${productId} +${r.added} avail=${r.available}`);
      }
    } catch (e) {
      fail++;
      console.warn(`[${i + 1}/${ids.length}] FAIL #${productId}:`, e.message);
    }
  }
  console.log("DONE ok=", ok, "fail=", fail);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
