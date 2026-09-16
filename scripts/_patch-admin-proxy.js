const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "js", "admin-app.js");
let h = fs.readFileSync(p, "utf8");

const mapStart = h.indexOf("    const map = {");
const mapEnd = h.indexOf("    const t = map[view]", mapStart);
if (mapStart < 0 || mapEnd < 0) throw new Error("map not found");

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
    };
`;
h = h.slice(0, mapStart) + newMap + h.slice(mapEnd);

h = h.replace(
  /'<div class="adm-brand"><img src="images\/logo-vuammo\.png" alt="">'\s*\+\s*"<div><strong>Vua MMO Admin<\/strong><span>Điều hành đơn, shop, ví &amp; chat<\/span><\/div><\/div>"\s*\+/,
  `'<div class="adm-brand"><img src="/images/logo-vuaproxy.png" alt="Vua Proxy">' +
      "<div><strong>Vua Proxy Admin</strong><span>Đơn proxy, ví, kho IP &amp; chat hỗ trợ</span></div></div>" +`
);

h = h.replace(/\s*\+\s*btn\("shops", "Gian hàng",[^)]+\)/g, "");
h = h.replace(/\s*\+\s*btn\("virtualShops", "Shop ảo",[^)]+\)/g, "");
h = h.replace(/\s*\+\s*btn\("chatShop", "Chat Shop ↔ Khách",[^)]+\)/g, "");
h = h.replace(/btn\("products", "Sản phẩm",/g, 'btn("products", "Sản phẩm / Gói proxy",');
h = h.replace(/btn\("stock", "Tồn kho",/g, 'btn("stock", "Tồn kho proxy",');
h = h.replace(/btn\("chatSupport", "Chat Vua MMO ↔ Khách",/g, 'btn("chatSupport", "Chat hỗ trợ ↔ Khách",');

h = h.replace(
  "Kênh <b>Vua MMO ↔ Khách</b> (room <code>vuammo_support</code>). Danh sách hội thoại luôn hiện — trống cũng check được.",
  "Kênh <b>Chat hỗ trợ Vua Proxy ↔ Khách</b>. Danh sách hội thoại luôn hiện — trống cũng check được."
);

h = h.replace(/Vua MMO Admin/g, "Vua Proxy Admin");
h = h.replace(/sàn Vua MMO/g, "Vua Proxy");
h = h.replace(/trên Vua MMO/g, "trên Vua Proxy");
h = h.replace(/Chat Vua MMO ↔ Khách/g, "Chat hỗ trợ ↔ Khách");

fs.writeFileSync(p, h);
console.log("OK", p);
console.log({
  shopsBtn: /btn\("shops"/.test(h),
  virtualBtn: /btn\("virtualShops"/.test(h),
  chatShopBtn: /btn\("chatShop"/.test(h),
  proxyAdmin: (h.match(/Vua Proxy Admin/g) || []).length,
  mmoLeft: (h.match(/Vua MMO/g) || []).length,
  logo: h.includes("logo-vuaproxy.png")
});
