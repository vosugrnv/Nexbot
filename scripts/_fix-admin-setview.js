const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const file = path.join(__dirname, "..", "js", "admin-app.js");
let cur = fs.readFileSync(file, "utf8");
const orig = execSync("git show HEAD:js/admin-app.js", {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
  cwd: path.join(__dirname, "..")
});

const origStart = orig.indexOf("  function statusTag");
const origEnd = orig.indexOf("  async function boot()");
if (origStart < 0 || origEnd < 0) throw new Error("orig markers missing");

let block = orig.slice(origStart, origEnd);

// Apply Vua Proxy branding + remove shop views from setView
block = block.replace(
  'if (view !== "chatSupport" && view !== "chatShop") setAdminChatLayout(false);\n    state.view = view;',
  `if (view === "shops" || view === "virtualShops" || view === "chatShop") {
      view = "dashboard";
    }
    if (view !== "chatSupport") setAdminChatLayout(false);
    state.view = view;`
);

const oldMap = `    const map = {
      dashboard: ["Dashboard", "Theo dõi doanh thu, đơn hàng và hoạt động sàn Vua MMO"],
      orders: [
        "Đơn hàng",
        "Lọc theo trạng thái · tìm khách · giao / huỷ / hoàn tất đơn số"
      ],
      disputes: [
        "Khiếu nại",
        "Admin cập nhật trạng thái xử lý khiếu nại đơn hàng tại đây"
      ],
      products: ["Sản phẩm", "Ẩn/hiện catalog · ghi chú · gắn nhập kho nhanh"],
      stock: ["Tồn kho", "Thêm / xoá dòng hàng giao tự động (1 dòng = 1 đơn vị)"],
      shops: ["Gian hàng", "80 shop thật — chỉnh hồ sơ, bật/tắt hiển thị từng shop"],
      virtualShops: [
        "Shop ảo",
        "Shop filler hiển thị khám phá — tách biệt 80 gian hàng thật"
      ],
      promos: [
        "Khuyến mãi",
        "Chọn hiện công khai hoặc chỉ nhập mã; giới hạn số lần mỗi user (0 = không giới hạn)."
      ],
      notifications: [
        "Thông báo",
        "Gửi thông báo hệ thống tới tất cả khách / nhóm audience"
      ],
      blog: ["Blog / Viết bài", "Đồng bộ từ website · form SEO đầy đủ · publish lên Chia sẻ"],
      users: ["Quản lý Users", "Danh sách tài khoản khách trên Vua MMO"],
      blacklist: [
        "Blacklist",
        "User trong list bị chặn mua hàng. Gỡ blacklist để mở lại."
      ],
      wallet: [
        "Ví người dùng",
        "Tất cả user và số dư (mặc định 0₫ nếu chưa có giao dịch). Nạp / trừ thủ công."
      ],
      ledger: [
        "Giao dịch ví",
        "Lịch sử nạp PayOS · mua hàng · hoàn / điều chỉnh admin"
      ],
      chatSupport: [
        "Chat Vua MMO ↔ Khách",
        "Kênh hỗ trợ sàn — tách biệt hoàn toàn với chat shop"
      ],
      chatShop: [
        "Chat Shop ↔ Khách",
        "Mỗi shop một phòng chat riêng (80 phòng) — không lẫn sang support"
      ]
    };`;

const newMap = `    const map = {
      dashboard: ["Dashboard", "Theo dõi doanh thu, đơn proxy, ví và hoạt động Vua Proxy"],
      orders: [
        "Đơn hàng",
        "Lọc theo trạng thái · tìm khách · giao / huỷ / hoàn tất đơn proxy"
      ],
      disputes: [
        "Khiếu nại",
        "Admin cập nhật trạng thái xử lý khiếu nại đơn hàng tại đây"
      ],
      products: ["Sản phẩm / Gói proxy", "Ẩn/hiện catalog · ghi chú · gắn nhập kho nhanh"],
      stock: ["Tồn kho proxy", "Thêm / xoá dòng IP giao tự động (1 dòng = 1 đơn vị)"],
      promos: [
        "Khuyến mãi",
        "Chọn hiện công khai hoặc chỉ nhập mã; giới hạn số lần mỗi user (0 = không giới hạn)."
      ],
      notifications: [
        "Thông báo",
        "Gửi thông báo hệ thống tới tất cả khách / nhóm audience"
      ],
      blog: ["Blog / Viết bài", "Đồng bộ từ website · form SEO đầy đủ · publish lên Chia sẻ"],
      users: ["Quản lý Users", "Danh sách tài khoản khách trên Vua Proxy"],
      blacklist: [
        "Blacklist",
        "User trong list bị chặn mua hàng. Gỡ blacklist để mở lại."
      ],
      wallet: [
        "Ví người dùng",
        "Tất cả user và số dư (mặc định 0₫ nếu chưa có giao dịch). Nạp / trừ thủ công."
      ],
      ledger: [
        "Giao dịch ví",
        "Lịch sử nạp PayOS · mua hàng · hoàn / điều chỉnh admin"
      ],
      chatSupport: [
        "Chat hỗ trợ ↔ Khách",
        "Kênh hỗ trợ khách hàng Vua Proxy (đơn, nạp tiền, bảo hành proxy)"
      ]
    };`;

if (!block.includes(oldMap)) {
  // try looser: find map inside setView
  const m0 = block.indexOf("    const map = {\n      dashboard:");
  const m1 = block.indexOf("    const t = map[view]", m0);
  if (m0 < 0 || m1 < 0) throw new Error("could not find map in orig block");
  block = block.slice(0, m0) + newMap + "\n" + block.slice(m1);
} else {
  block = block.replace(oldMap, newMap);
}

const curStart = cur.indexOf("  function statusTag");
const curEnd = cur.indexOf("  async function boot()");
if (curStart < 0 || curEnd < 0) throw new Error("cur markers missing");

cur = cur.slice(0, curStart) + block + cur.slice(curEnd);
fs.writeFileSync(file, cur);

// sanity
const ok =
  cur.includes("async function setView") &&
  cur.includes('paid: "warn"') &&
  cur.includes("function moneyCls") &&
  !/function statusTag[\s\S]*dashboard: \["Dashboard"/.test(
    cur.slice(cur.indexOf("function statusTag"), cur.indexOf("async function setView"))
  );
console.log({
  ok,
  hasSetView: cur.includes("async function setView"),
  hasStatusPaid: cur.includes('paid: "warn"'),
  hasMoneyCls: cur.includes("function moneyCls"),
  shopsInSetViewMap: /async function setView[\s\S]*?const t = map\[view\]/.test(cur) &&
    /shops: \["Gian/.test(cur.match(/async function setView[\s\S]*?const t = map\[view\]/)[0])
});
