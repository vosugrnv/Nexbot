const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "js", "admin-app.js");
let s = fs.readFileSync(file, "utf8");

if (!s.includes("function confirmAction(")) {
  const toastBlock = `  function toast(msg) {
    if (window.VuammoApi && VuammoApi.showToast) VuammoApi.showToast(msg);
    else alert(msg);
  }`;
  if (!s.includes(toastBlock)) {
    // try shorter match
    const idx = s.indexOf("  function toast(msg) {");
    if (idx < 0) throw new Error("toast not found");
    const end = s.indexOf("\n  }", idx);
    // find end of toast function properly
  }
  const insertAfter = s.indexOf("  function toast(msg) {");
  if (insertAfter < 0) throw new Error("toast fn missing");
  // find closing of toast - next function at same indent
  const afterToast = s.indexOf("\n  async function ", insertAfter);
  const afterToast2 = s.indexOf("\n  function ", insertAfter + 5);
  let cut = afterToast > 0 ? afterToast : afterToast2;
  // toast is short; look for BADGE or similar after toast
  const m = s.slice(insertAfter).match(/^  function toast\(msg\) \{[\s\S]*?\n  \}\n/);
  if (!m) throw new Error("cannot parse toast");
  const toastEnd = insertAfter + m[0].length;

  const helper = `  /** Popup xác nhận cho thao tác nguy hiểm (xóa / ẩn / hoàn tiền) */
  function confirmAction(opts) {
    const o = opts || {};
    const title = o.title || "Xác nhận";
    const message = o.message || "Bạn có chắc muốn thực hiện thao tác này?";
    const okText = o.okText || "Xác nhận";
    const cancelText = o.cancelText || "Huỷ";
    const danger = o.danger !== false;
    return new Promise((resolve) => {
      const prev = document.getElementById("admConfirmModal");
      if (prev) prev.remove();
      const wrap = document.createElement("div");
      wrap.id = "admConfirmModal";
      wrap.className = "adm-modal-bg";
      wrap.innerHTML =
        '<div class="adm-modal" role="dialog" aria-modal="true">' +
        "<h3>" +
        esc(title) +
        "</h3><p>" +
        esc(message) +
        '</p><div class="adm-compose-actions">' +
        '<button type="button" class="btn btn-outline" data-c="0">' +
        esc(cancelText) +
        '</button><button type="button" class="btn ' +
        (danger ? "btn-danger" : "btn-primary") +
        '" data-c="1" autofocus>' +
        esc(okText) +
        "</button></div></div>";
      document.body.appendChild(wrap);
      const finish = (ok) => {
        wrap.remove();
        resolve(!!ok);
      };
      wrap.addEventListener("click", (e) => {
        if (e.target === wrap) finish(false);
      });
      wrap.querySelector('[data-c="0"]').addEventListener("click", () => finish(false));
      wrap.querySelector('[data-c="1"]').addEventListener("click", () => finish(true));
      document.addEventListener(
        "keydown",
        function onKey(e) {
          if (e.key === "Escape") {
            document.removeEventListener("keydown", onKey);
            finish(false);
          }
        },
        { once: true }
      );
    });
  }

`;
  s = s.slice(0, toastEnd) + helper + s.slice(toastEnd);
  console.log("inserted confirmAction");
}

function replaceConfirm(oldMsg, title, message, okText) {
  const needle = `if (!confirm("${oldMsg}")) return;`;
  const repl =
    `if (!(await confirmAction({ title: "${title}", message: "${message}", okText: "${okText}" }))) return;`;
  if (!s.includes(needle)) {
    console.warn("missing confirm:", oldMsg);
    return false;
  }
  s = s.replace(needle, repl);
  return true;
}

replaceConfirm(
  "Hoàn tiền đơn này về ví khách?",
  "Hoàn tiền đơn hàng",
  "Số tiền đơn sẽ được cộng lại vào ví khách. Thao tác không hoàn tác được.",
  "Hoàn tiền"
);
replaceConfirm(
  "Hoàn tiền khiếu nại này về ví khách?",
  "Hoàn tiền khiếu nại",
  "Sẽ hoàn tiền về ví khách và đánh dấu khiếu nại đã xử lý.",
  "Hoàn tiền"
);
replaceConfirm(
  "Từ chối khiếu nại? Trạng thái sẽ là Từ chối KN (không hoàn tiền).",
  "Từ chối khiếu nại",
  "Khiếu nại sẽ chuyển sang Từ chối KN. Không hoàn tiền cho khách.",
  "Từ chối"
);
replaceConfirm(
  "Xóa shop ảo này?",
  "Xóa shop ảo",
  "Shop ảo sẽ bị xóa khỏi danh sách. Không hoàn tác được.",
  "Xóa"
);
replaceConfirm(
  "Xóa mã này?",
  "Xóa mã khuyến mãi",
  "Mã khuyến mãi sẽ bị xóa vĩnh viễn.",
  "Xóa"
);
replaceConfirm(
  "Xóa bài này?",
  "Xóa bài viết",
  "Bài blog sẽ bị xóa khỏi admin/DB.",
  "Xóa"
);

// Product delete CMS / hide default — may have different quotes
s = s.replace(
  `if (!confirm("Xóa gói CMS #" + id + "?")) return;`,
  `if (!(await confirmAction({ title: "Xóa gói proxy", message: "Xóa vĩnh viễn gói CMS #" + id + "?", okText: "Xóa gói" }))) return;`
);
s = s.replace(
  `if (!confirm("Gói mặc định không xóa cứng — ẩn khỏi bán?")) return;`,
  `if (!(await confirmAction({ title: "Ẩn gói proxy", message: "Gói mặc định không xóa cứng — sẽ ẩn khỏi bán. Tiếp tục?", okText: "Ẩn gói" }))) return;`
);

// Product toggle hide — add confirm before hide
const toggleOld = `      tbody.querySelectorAll(".js-toggle").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("tr").getAttribute("data-id");
          const ov = map[id] || {};
          const cur = products.find((x) => String(x.id) === id);
          const currentlyOn = ov.active !== false && (!cur || cur.active !== false);
          const next = !currentlyOn;
          if (btn.closest("tr").getAttribute("data-cms") === "1") {`;

const toggleNew = `      tbody.querySelectorAll(".js-toggle").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("tr").getAttribute("data-id");
          const ov = map[id] || {};
          const cur = products.find((x) => String(x.id) === id);
          const currentlyOn = ov.active !== false && (!cur || cur.active !== false);
          const next = !currentlyOn;
          if (!next) {
            const ok = await confirmAction({
              title: "Ẩn gói proxy",
              message: "Gói #" + id + " sẽ bị ẩn khỏi bán. Bạn có chắc?",
              okText: "Ẩn gói"
            });
            if (!ok) return;
          }
          if (btn.closest("tr").getAttribute("data-cms") === "1") {`;

if (s.includes(toggleOld)) {
  s = s.replace(toggleOld, toggleNew);
  console.log("patched product toggle");
} else {
  console.warn("toggle block not found");
}

// Virtual shop hide
const visOld = `      rows.querySelectorAll(".js-vis").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("tr").getAttribute("data-id");
          const s = data.items.find((x) => String(x.id) === id);
          await api("/admin/virtual-shops/" + id, {`;

const visNew = `      rows.querySelectorAll(".js-vis").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("tr").getAttribute("data-id");
          const s = data.items.find((x) => String(x.id) === id);
          if (s && s.visible) {
            const ok = await confirmAction({
              title: "Ẩn shop ảo",
              message: "Ẩn shop \\"" + (s.name || id) + "\\" khỏi danh sách hiển thị?",
              okText: "Ẩn"
            });
            if (!ok) return;
          }
          await api("/admin/virtual-shops/" + id, {`;

if (s.includes(visOld)) {
  s = s.replace(visOld, visNew);
  console.log("patched virtual shop hide");
} else console.warn("vis block missing");

// Notifications delete
s = s.replace(
  `    body.querySelectorAll(".js-del").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await api("/admin/notifications/" + btn.closest("tr").getAttribute("data-id"), {
          method: "DELETE"
        });
        renderNotifications(body);
      });
    });`,
  `    body.querySelectorAll(".js-del").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ok = await confirmAction({
          title: "Xóa thông báo",
          message: "Thông báo này sẽ bị xóa. Tiếp tục?",
          okText: "Xóa"
        });
        if (!ok) return;
        await api("/admin/notifications/" + btn.closest("tr").getAttribute("data-id"), {
          method: "DELETE"
        });
        renderNotifications(body);
      });
    });`
);

// Blacklist remove
s = s.replace(
  `      document.querySelectorAll("#blRows .js-rm").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await api("/admin/blacklist/" + btn.closest("tr").getAttribute("data-id"), {
            method: "DELETE"
          });
          toast("Đã gỡ blacklist");
          renderBlacklist(body);
        });
      });`,
  `      document.querySelectorAll("#blRows .js-rm").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const ok = await confirmAction({
            title: "Gỡ blacklist",
            message: "User sẽ được mua hàng lại. Xác nhận gỡ?",
            okText: "Gỡ blacklist",
            danger: false
          });
          if (!ok) return;
          await api("/admin/blacklist/" + btn.closest("tr").getAttribute("data-id"), {
            method: "DELETE"
          });
          toast("Đã gỡ blacklist");
          renderBlacklist(body);
        });
      });`
);

// Stock void
s = s.replace(
  `      box.querySelectorAll(".js-void").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const productId = btn.closest("tr").getAttribute("data-id");
          const count = Number(prompt("Xóa bao nhiêu dòng còn lại?", "10") || 0);
          if (!count) return;
          await api("/admin/stock/void", {
            method: "POST",
            body: JSON.stringify({ productId, count })
          });
          toast("Đã xóa tồn");
          renderStock(body);
        });
      });`,
  `      box.querySelectorAll(".js-void").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const productId = btn.closest("tr").getAttribute("data-id");
          const count = Number(prompt("Xóa bao nhiêu dòng còn lại?", "10") || 0);
          if (!count) return;
          const ok = await confirmAction({
            title: "Xóa tồn kho",
            message: "Xóa " + count + " dòng tồn còn lại của sản phẩm #" + productId + "?",
            okText: "Xóa tồn"
          });
          if (!ok) return;
          await api("/admin/stock/void", {
            method: "POST",
            body: JSON.stringify({ productId, count })
          });
          toast("Đã xóa tồn");
          renderStock(body);
        });
      });`
);

// Sync confirm can stay native or upgrade
s = s.replace(
  `if (!confirm("Đồng bộ " + sitePosts.length + " bài từ Chia sẻ vào admin/DB?")) return;`,
  `if (!(await confirmAction({ title: "Đồng bộ blog", message: "Đồng bộ " + sitePosts.length + " bài từ Chia sẻ vào admin/DB?", okText: "Đồng bộ", danger: false }))) return;`
);

const left = (s.match(/\bif\s*\(\s*!\s*confirm\s*\(/g) || []).length;
console.log("remaining native confirm:", left);

fs.writeFileSync(file, s);

// CSS polish for confirm modal
const cssPath = path.join(__dirname, "..", "css", "admin.css");
let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes(".adm-modal .adm-compose-actions")) {
  css += `
.adm-modal .adm-compose-actions{justify-content:flex-end;margin-top:8px}
.adm-modal-bg{backdrop-filter:blur(2px)}
`;
  fs.writeFileSync(cssPath, css);
  console.log("css updated");
}
