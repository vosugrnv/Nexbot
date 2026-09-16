const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "js", "admin-app.js");
let h = fs.readFileSync(file, "utf8");

if (!h.includes("function countryCodeOfItem")) {
  h = h.replace(
    /function shopOfItem\(item\) \{\n    return item\.seller \|\| item\.shopName \|\| item\.shop \|\| "—";\n  \}/,
    `function shopOfItem(item) {
    return item.seller || item.shopName || item.shop || "—";
  }
  function countryCodeOfItem(item) {
    if (!item) return "";
    if (item.countryCode) return String(item.countryCode).toLowerCase();
    if (item.country) return String(item.country).toLowerCase();
    const img = String(item.image || "");
    const mImg = img.match(/\\/flags\\/([a-z]{2})\\./i);
    if (mImg) return mImg[1].toLowerCase();
    const id = String(item.id || "");
    const mId = id.match(/^lcp-([a-z]{2})-/i);
    if (mId) return mId[1].toLowerCase();
    return "";
  }
  function countryLabelOfItem(item) {
    const code = countryCodeOfItem(item);
    if (!code) {
      const parts = String((item && item.name) || "").split(" · ");
      if (parts.length >= 2) return parts[1];
      return "—";
    }
    const locs = window.VUAPROXY_LOCATIONS || [];
    const hit = locs.find((x) => x.code === code);
    if (hit) return (hit.nameVi || hit.name) + " (" + code.toUpperCase() + ")";
    return code.toUpperCase();
  }
  function countriesOfOrder(o) {
    return (
      [
        ...new Set(
          (o.items || [])
            .map((i) => countryLabelOfItem(i))
            .filter((x) => x && x !== "—")
        )
      ].join(", ") || "—"
    );
  }`
  );
}

// Dashboard table header
h = h.replace(
  '"<th>Mã</th><th>Khách</th><th>Sản phẩm</th><th>Giá</th><th>Trạng thái</th><th>Ngày</th>"',
  '"<th>Mã</th><th>Khách</th><th>Quốc gia</th><th>Sản phẩm</th><th>Giá</th><th>Trạng thái</th><th>Ngày</th>"'
);

// Dashboard row: buyer + country
h = h.replace(
  /esc\(\(o\.items && o\.items\[0\] && shopOfItem\(o\.items\[0\]\)\) \|\| "—"\) \+\n            "<\/span><\/td><td>" \+\n            esc\(items\) \+/,
  `esc(o.buyerName || o.buyerEmail || "—") +
            '</span><span class="adm-cell-sub">' +
            esc(o.buyerEmail || "") +
            "</span></td><td>" +
            esc(countriesOfOrder(o)) +
            "</td><td>" +
            esc(items) +`
);

// Orders header
h = h.replace(
  '"<th>ID</th><th>Khách</th><th>Shop</th><th>Sản phẩm</th><th>Giá</th><th>Trạng thái</th><th>Ngày</th><th></th>"',
  '"<th>ID</th><th>Khách</th><th>Quốc gia</th><th>Sản phẩm / Gói</th><th>Giá</th><th>Trạng thái</th><th>Ngày</th><th></th>"'
);

h = h.replace(
  /const shops = \[\n            \.\.\.new Set\(\(o\.items \|\| \[\]\)\.map\(\(i\) => shopOfItem\(i\)\)\.filter\(Boolean\)\)\n          \]\.join\(", "\);\n          const items =/,
  `const countries = countriesOfOrder(o);
          const items =`
);

h = h.replace(
  /esc\(o\.buyerEmail\) \+\n            "<\/span><\/td><td>" \+\n            esc\(shops \|\| "—"\) \+\n            "<\/td><td>" \+\n            items \+/,
  `esc(o.buyerEmail) +
            "</span></td><td>" +
            esc(countries) +
            "</td><td>" +
            items +`
);

// Replace renderProducts function body start through end - find markers
const start = h.indexOf("  async function renderProducts(body) {");
const end = h.indexOf("  async function renderStock(body) {");
if (start < 0 || end < 0) throw new Error("renderProducts markers missing");

const newRender = `  async function renderProducts(body) {
    const locations = window.VUAPROXY_LOCATIONS || [];
    const packFn =
      typeof window.VUAPROXY_allCountryPackages === "function"
        ? window.VUAPROXY_allCountryPackages
        : null;
    const packages = packFn ? packFn(locations) : [];

    let cmsProducts = [];
    try {
      const cmsData = await api("/admin/cms-products");
      cmsProducts = (cmsData.products || []).map((p) =>
        Object.assign({}, p, { source: "cms" })
      );
    } catch (_) {
      cmsProducts = [];
    }

    if (!packages.length && !cmsProducts.length) {
      body.innerHTML =
        '<div class="adm-card"><span class="adm-tag bad">Chưa có dữ liệu</span> Không đọc được danh sách quốc gia (<code>js/locations-data.js</code> / <code>js/proxy-packages.js</code>).</div>';
      return;
    }

    const countries = locations
      .slice()
      .sort((a, b) => String(a.nameVi || a.name).localeCompare(String(b.nameVi || b.name), "vi"));

    body.innerHTML =
      '<div class="adm-hint">Sản phẩm Vua Proxy = <b>gói proxy gắn theo từng quốc gia</b> (trang <code>/tat-ca-khu-vuc/{mã}</code>). Không còn mô hình shop/gian hàng.</div>' +
      '<div class="adm-grid">' +
      stat("Quốc gia", countries.length) +
      stat("Gói / quốc gia", packages.length ? Math.round(packages.length / Math.max(countries.length, 1)) : 0) +
      stat("Tổng dòng gói", packages.length) +
      (cmsProducts.length ? stat("CMS thêm", cmsProducts.length) : "") +
      "</div>" +
      '<div class="adm-card"><div class="adm-card-head"><h2>Gói theo quốc gia</h2></div>' +
      '<div class="adm-filters">' +
      '<input class="adm-search" id="prodFilter" placeholder="Lọc tên gói / quốc gia / mã…">' +
      filterSelect(
        "prodCountry",
        "Quốc gia",
        [{ v: "all", t: "Mọi quốc gia" }].concat(
          countries.map((c) => ({
            v: c.code,
            t: (c.nameVi || c.name) + " (" + c.code.toUpperCase() + ")"
          }))
        ),
        "all"
      ) +
      '<button type="button" class="btn btn-outline" id="prodApply">Lọc</button></div>' +
      '<p class="adm-muted" id="prodCount" style="margin:10px 0"></p>' +
      '<div class="adm-table-wrap"><table class="adm-table" id="prodTable"><thead><tr>' +
      "<th>Quốc gia</th><th>Gói proxy</th><th>Giá / 30 ngày</th><th>Ghi chú</th><th></th>" +
      "</tr></thead><tbody></tbody></table></div></div>" +
      (cmsProducts.length
        ? '<div class="adm-card"><div class="adm-card-head"><h2>CMS bổ sung (' +
          cmsProducts.length +
          ")</h2></div>" +
          '<div class="adm-table-wrap"><table class="adm-table"><thead><tr>' +
          "<th>ID</th><th>Tên</th><th>Giá</th></tr></thead><tbody>" +
          cmsProducts
            .map(
              (p) =>
                "<tr><td>#" +
                esc(p.id) +
                "</td><td>" +
                esc(p.name) +
                "</td><td>" +
                money(p.price) +
                "</td></tr>"
            )
            .join("") +
          "</tbody></table></div></div>"
        : "");

    const tbody = body.querySelector("#prodTable tbody");
    function paint() {
      const needle = String(document.getElementById("prodFilter")?.value || "").toLowerCase();
      const cF = document.getElementById("prodCountry")?.value || "all";
      const filtered = packages.filter((p) => {
        if (cF !== "all" && p.countryCode !== cF) return false;
        if (!needle) return true;
        return (
          String(p.countryCode).includes(needle) ||
          String(p.countryName || "").toLowerCase().includes(needle) ||
          String(p.name || "").toLowerCase().includes(needle) ||
          String(p.packageKey || "").toLowerCase().includes(needle)
        );
      });
      const countEl = document.getElementById("prodCount");
      if (countEl) {
        countEl.textContent =
          "Hiển thị " + filtered.length + " / " + packages.length + " gói";
      }
      tbody.innerHTML =
        filtered.length
          ? filtered
              .map((p) => {
                const priceTxt =
                  p.pricePrivate != null
                    ? money(p.price) +
                      ' <span class="adm-cell-sub">chung</span> · ' +
                      money(p.pricePrivate) +
                      ' <span class="adm-cell-sub">riêng</span>'
                    : money(p.price);
                return (
                  '<tr><td><span class="adm-cell-main">' +
                  esc(p.countryName) +
                  '</span><span class="adm-cell-sub">' +
                  esc(String(p.countryCode || "").toUpperCase()) +
                  "</span></td><td>" +
                  esc(p.name) +
                  "</td><td>" +
                  priceTxt +
                  "</td><td>" +
                  esc(p.note || "") +
                  '</td><td><a class="btn btn-outline btn-sm" href="' +
                  siteUrl(p.href) +
                  '" target="_blank" rel="noopener">Mở trang</a></td></tr>'
                );
              })
              .join("")
          : '<tr><td colspan="5" class="adm-empty">Không khớp bộ lọc</td></tr>';
    }
    paint();
    document.getElementById("prodApply")?.addEventListener("click", paint);
    document.getElementById("prodFilter")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") paint();
    });
  }

`;

h = h.slice(0, start) + newRender + h.slice(end);
fs.writeFileSync(file, h);
console.log({
  countryHelpers: h.includes("countriesOfOrder"),
  quocGia: (h.match(/Quốc gia/g) || []).length,
  renderProducts: h.includes("Gói theo quốc gia"),
  shopHeader: h.includes("<th>Shop</th>")
});
