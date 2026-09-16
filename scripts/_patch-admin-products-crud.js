const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "js", "admin-app.js");
let h = fs.readFileSync(file, "utf8");

const start = h.indexOf("  async function renderProducts(body) {");
const end = h.indexOf("  async function renderStock(body) {");
if (start < 0 || end < 0) throw new Error("markers missing");

const newRender = String.raw`  async function renderProducts(body) {
    const locations = window.VUAPROXY_LOCATIONS || [];
    const packFn =
      typeof window.VUAPROXY_allCountryPackages === "function"
        ? window.VUAPROXY_allCountryPackages
        : null;
    let catalog = packFn
      ? packFn(locations)
      : getCatalogProducts().filter((p) => p && p.countryCode);

    const overrides = await api("/admin/products").catch(() => ({ overrides: [] }));
    const map = {};
    (overrides.overrides || []).forEach((o) => {
      map[String(o.product_id)] = o;
    });

    let cmsProducts = [];
    try {
      const cmsData = await api("/admin/cms-products");
      cmsProducts = (cmsData.products || []).map((p) =>
        Object.assign({}, p, { source: "cms" })
      );
    } catch (_) {
      cmsProducts = [];
    }

    const cmsIds = new Set(cmsProducts.map((p) => String(p.id)));
    const products = cmsProducts.concat(
      catalog.filter((p) => !cmsIds.has(String(p.id)))
    );

    if (!products.length) {
      body.innerHTML =
        '<div class="adm-card"><span class="adm-tag bad">Chưa có gói</span> Thiếu locations/proxy-packages.</div>';
      return;
    }

    const countries = locations
      .slice()
      .sort((a, b) =>
        String(a.nameVi || a.name).localeCompare(String(b.nameVi || b.name), "vi")
      );

    body.innerHTML =
      '<div class="adm-hint">Mỗi dòng là <b>sản phẩm đặt hàng được</b>. Tên gói luôn có <b>quốc gia</b>. Dùng <b>Mua</b> để mở trang sản phẩm / tạo đơn như khách.</div>' +
      '<div class="adm-grid">' +
      stat("Quốc gia", countries.length) +
      stat("Gói hiển thị", products.filter((p) => {
        const ov = map[String(p.id)] || {};
        return ov.active !== false && p.active !== false;
      }).length) +
      stat("Tổng gói", products.length) +
      "</div>" +
      '<div class="adm-card"><div class="adm-card-head"><h2>Gói proxy theo quốc gia</h2>' +
      '<button type="button" class="btn btn-primary" id="prodNew">Thêm gói mới</button></div>' +
      '<div id="prodCompose" class="hidden adm-compose">' +
      "<h3 id=\"prodComposeTitle\">Thêm gói mới</h3>" +
      '<input type="hidden" id="npEditId" value="">' +
      '<div class="adm-field"><label>Quốc gia *</label><select id="npCountry">' +
      countries
        .map(
          (c) =>
            '<option value="' +
            esc(c.code) +
            '">' +
            esc((c.nameVi || c.name) + " (" + c.code.toUpperCase() + ")") +
            "</option>"
        )
        .join("") +
      "</select></div>" +
      '<div class="adm-field"><label>Tên gói (có quốc gia) *</label><input id="npName" placeholder="VD: Proxy dân cư tĩnh share · Mỹ"></div>' +
      '<div class="adm-field"><label>Giá / 30 ngày ₫ *</label><input id="npPrice" type="number" min="0" step="1000" value="10000"></div>' +
      '<div class="adm-field"><label>Ghi chú</label><input id="npNote" placeholder="Share3/Share5, pack…"></div>' +
      '<div class="adm-field"><label>Ảnh (mặc định = cờ quốc gia)</label><input id="npImage" placeholder="/images/flags/us.png"></div>' +
      '<div class="adm-compose-actions">' +
      '<button type="button" class="btn btn-primary" id="npSave">Lưu</button>' +
      '<button type="button" class="btn btn-outline" id="npCancel">Huỷ</button></div></div>' +
      '<div class="adm-filters">' +
      '<input class="adm-search" id="prodFilter" placeholder="Lọc tên gói / quốc gia / id…">' +
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
      filterSelect(
        "prodActive",
        "Hiển thị",
        [
          { v: "all", t: "Tất cả" },
          { v: "on", t: "Đang hiện" },
          { v: "off", t: "Đã ẩn" }
        ],
        "all"
      ) +
      '<button type="button" class="btn btn-outline" id="prodApply">Lọc</button></div>' +
      '<p class="adm-muted" id="prodCount" style="margin:10px 0"></p>' +
      '<div class="adm-table-wrap"><table class="adm-table" id="prodTable"><thead><tr>' +
      "<th>ID</th><th>Quốc gia</th><th>Tên gói (có quốc gia)</th><th>Giá / 30 ngày</th><th>TT</th><th></th>" +
      "</tr></thead><tbody></tbody></table></div></div>";

    const compose = document.getElementById("prodCompose");
    const openCompose = (row) => {
      compose.classList.remove("hidden");
      document.getElementById("prodComposeTitle").textContent = row
        ? "Sửa gói"
        : "Thêm gói mới";
      document.getElementById("npEditId").value = row ? String(row.id) : "";
      if (row) {
        if (row.countryCode) document.getElementById("npCountry").value = row.countryCode;
        document.getElementById("npName").value = row.name || "";
        document.getElementById("npPrice").value = String(
          (map[String(row.id)] && map[String(row.id)].price_cents != null
            ? map[String(row.id)].price_cents
            : row.price) || 0
        );
        document.getElementById("npNote").value = row.note || "";
        document.getElementById("npImage").value = row.image || "";
      } else {
        document.getElementById("npName").value = "";
        document.getElementById("npPrice").value = "10000";
        document.getElementById("npNote").value = "";
        document.getElementById("npImage").value = "";
        syncNameFromCountry();
      }
      compose.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    function syncNameFromCountry() {
      const code = document.getElementById("npCountry").value;
      const c = countries.find((x) => x.code === code);
      const label = c ? c.nameVi || c.name : code;
      const cur = document.getElementById("npName").value.trim();
      if (!cur || /·/.test(cur) === false) {
        document.getElementById("npName").value = "Proxy dân cư tĩnh share · " + label;
      } else {
        document.getElementById("npName").value = cur.replace(/\s·\s.*$/, " · " + label);
      }
      document.getElementById("npImage").value = "/images/flags/" + code + ".png";
    }

    document.getElementById("prodNew")?.addEventListener("click", () => openCompose(null));
    document.getElementById("npCancel")?.addEventListener("click", () =>
      compose.classList.add("hidden")
    );
    document.getElementById("npCountry")?.addEventListener("change", syncNameFromCountry);

    document.getElementById("npSave")?.addEventListener("click", async () => {
      const code = document.getElementById("npCountry").value;
      const c = countries.find((x) => x.code === code);
      const label = c ? c.nameVi || c.name : code;
      let name = document.getElementById("npName").value.trim();
      if (!name) return toast("Nhập tên gói");
      if (!name.includes(label) && !name.includes(code.toUpperCase())) {
        name = name.replace(/\s·\s.*$/, "") + " · " + label;
      }
      const price = Number(document.getElementById("npPrice").value || 0);
      if (price <= 0) return toast("Giá phải > 0");
      const editId = document.getElementById("npEditId").value.trim();
      const image =
        document.getElementById("npImage").value.trim() ||
        "/images/flags/" + code + ".png";
      const note = document.getElementById("npNote").value.trim();

      if (editId && !cmsIds.has(editId) && catalog.some((p) => String(p.id) === editId)) {
        await api("/admin/products/" + encodeURIComponent(editId), {
          method: "PUT",
          body: JSON.stringify({
            productId: editId,
            name: name,
            price: price,
            note: note,
            active: true
          })
        });
        toast("Đã cập nhật gói catalog");
      } else {
        await api("/admin/cms-products", {
          method: "POST",
          body: JSON.stringify({
            id: editId || undefined,
            name,
            price,
            image,
            seller: "Vua Proxy",
            sellerSlug: "vuaproxy",
            sellerToken: "vuaproxy",
            catsText: "proxy," + code + ",custom",
            description: note || name,
            stock: 999
          })
        });
        toast(editId ? "Đã lưu gói CMS" : "Đã thêm gói mới");
      }
      renderProducts(body);
    });

    const tbody = body.querySelector("#prodTable tbody");
    function paint() {
      const needle = String(document.getElementById("prodFilter")?.value || "").toLowerCase();
      const cF = document.getElementById("prodCountry")?.value || "all";
      const actF = document.getElementById("prodActive")?.value || "all";
      const filtered = products.filter((p) => {
        const ov = map[String(p.id)] || {};
        const active = ov.active !== false && p.active !== false;
        const code = p.countryCode || (Array.isArray(p.cats) ? p.cats.find((x) => /^[a-z]{2}$/.test(x)) : "");
        if (cF !== "all" && code !== cF) return false;
        if (actF === "on" && !active) return false;
        if (actF === "off" && active) return false;
        if (!needle) return true;
        const name = ov.name || p.name || "";
        return (
          String(p.id).includes(needle) ||
          String(code).includes(needle) ||
          String(name).toLowerCase().includes(needle) ||
          String(p.countryName || "").toLowerCase().includes(needle)
        );
      });
      const countEl = document.getElementById("prodCount");
      if (countEl) {
        countEl.textContent =
          "Hiển thị " + filtered.length + " / " + products.length + " gói";
      }
      tbody.innerHTML = filtered.length
        ? filtered
            .map((p) => {
              const ov = map[String(p.id)] || {};
              const active = ov.active !== false && p.active !== false;
              const price = ov.price_cents != null ? Number(ov.price_cents) : p.price;
              const name = ov.name || p.name;
              const code =
                p.countryCode ||
                (Array.isArray(p.cats) ? p.cats.find((x) => /^[a-z]{2}$/.test(x)) : "") ||
                "";
              const cName =
                p.countryName ||
                (countries.find((x) => x.code === code) || {}).nameVi ||
                code.toUpperCase();
              const buyHref = p.href
                ? siteUrl(p.href)
                : siteUrl("/tat-ca-san-pham/" + (p.slug || "goi") + "-" + p.id);
              const prodHref = siteUrl(
                typeof productSeoPath === "function"
                  ? productSeoPath(Object.assign({}, p, { name: name, slug: p.slug || ("goi-" + p.id) }))
                  : "/tat-ca-san-pham/" + (p.slug || "goi") + "-" + p.id
              );
              const isCms = p.source === "cms";
              return (
                '<tr data-id="' +
                esc(String(p.id)) +
                '" data-cms="' +
                (isCms ? "1" : "0") +
                '"><td>#' +
                esc(String(p.id)) +
                '</td><td><span class="adm-cell-main">' +
                esc(cName) +
                '</span><span class="adm-cell-sub">' +
                esc(String(code).toUpperCase()) +
                "</span></td><td><span class=\"adm-cell-main\">" +
                esc(name) +
                "</span>" +
                (ov.note || p.note
                  ? '<span class="adm-cell-sub">' + esc(ov.note || p.note) + "</span>"
                  : "") +
                "</td><td><b>" +
                money(price) +
                "</b></td><td>" +
                (active
                  ? '<span class="adm-tag ok">Hiện</span>'
                  : '<span class="adm-tag bad">Ẩn</span>') +
                '</td><td><div class="adm-row-actions">' +
                '<a class="btn btn-primary btn-sm" href="' +
                esc(prodHref) +
                '" target="_blank" rel="noopener">Mua</a>' +
                '<a class="btn btn-outline btn-sm" href="' +
                esc(buyHref) +
                '" target="_blank" rel="noopener">Trang QG</a>' +
                '<button type="button" class="btn btn-ghost btn-sm js-edit">Sửa</button>' +
                '<button type="button" class="btn btn-ghost btn-sm js-toggle">' +
                (active ? "Ẩn" : "Hiện") +
                "</button>" +
                '<button type="button" class="btn btn-danger btn-sm js-del">Xóa</button>' +
                "</div></td></tr>"
              );
            })
            .join("")
        : '<tr><td colspan="6" class="adm-empty">Không khớp bộ lọc</td></tr>';

      tbody.querySelectorAll(".js-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("tr").getAttribute("data-id");
          const row = products.find((x) => String(x.id) === id);
          if (row) openCompose(Object.assign({}, row, map[id] || {}));
        });
      });
      tbody.querySelectorAll(".js-toggle").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("tr").getAttribute("data-id");
          const ov = map[id] || {};
          const cur = products.find((x) => String(x.id) === id);
          const currentlyOn = ov.active !== false && (!cur || cur.active !== false);
          const next = !currentlyOn;
          if (btn.closest("tr").getAttribute("data-cms") === "1") {
            await api("/admin/cms-products/" + encodeURIComponent(id), {
              method: "PUT",
              body: JSON.stringify(Object.assign({}, cur, { active: next, id }))
            });
          } else {
            await api("/admin/products/" + encodeURIComponent(id), {
              method: "PUT",
              body: JSON.stringify({ productId: id, active: next })
            });
          }
          toast(next ? "Đã hiện" : "Đã ẩn");
          renderProducts(body);
        });
      });
      tbody.querySelectorAll(".js-del").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const tr = btn.closest("tr");
          const id = tr.getAttribute("data-id");
          const isCms = tr.getAttribute("data-cms") === "1";
          if (isCms) {
            if (!confirm("Xóa gói CMS #" + id + "?")) return;
            await api("/admin/cms-products/" + encodeURIComponent(id), { method: "DELETE" });
            toast("Đã xóa");
          } else {
            if (!confirm("Gói mặc định không xóa cứng — ẩn khỏi bán?")) return;
            await api("/admin/products/" + encodeURIComponent(id), {
              method: "PUT",
              body: JSON.stringify({ productId: id, active: false })
            });
            toast("Đã ẩn gói mặc định");
          }
          renderProducts(body);
        });
      });
    }
    paint();
    document.getElementById("prodApply")?.addEventListener("click", paint);
    document.getElementById("prodFilter")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") paint();
    });
  }

`;

// Fix escaped quotes that String.raw left weird - the \"\" in template
const cleaned = newRender
  .replace('"<span class=\\"adm-cell-main\\">"', "'<span class=\"adm-cell-main\">'")
  .replace("</span>\" +", "</span>' +");

h = h.slice(0, start) + cleaned + h.slice(end);
fs.writeFileSync(file, h);
console.log("patched renderProducts", h.includes("Thêm gói mới"), h.includes("js-del"));
