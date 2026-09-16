const fs = require("fs");
const path = require("path");

const root = "C:/Users/Admin/Downloads/VuaProxy";

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "vi" || ent.name === "gian-hang" || ent.name === "data") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (/\.(html|js)$/i.test(ent.name)) out.push(full);
  }
  return out;
}

const pairs = [
  [/Vua MMO/g, "Vua Proxy"],
  [/vuammo\.com/g, "vuaproxy.vn"],
  [/support@vuammo\.com/g, "support@vuaproxy.vn"],
  [/Nền tảng giao dịch sản phẩm số/g, "Proxy tĩnh & proxy xoay đa quốc gia"],
  [/sàn mua bán tài khoản AI, CapCut, ChatGPT, VPN và phần mềm bản quyền/gi, "cửa hàng proxy tĩnh IPv4 và proxy xoay residential"],
  [/tài khoản AI, phần mềm bản quyền/gi, "proxy tĩnh và proxy xoay"],
  [/Đăng ký làm người bán/g, "Liên hệ hỗ trợ"],
  [/\/dang-ky-nguoi-ban/g, "/lien-he"],
  [/Về Vua Proxy/g, "Về Vua Proxy"]
];

let changed = 0;
for (const file of walk(root)) {
  if (file.includes("build-proxy") || file.includes("rebrand-product")) continue;
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  for (const [re, to] of pairs) s = s.replace(re, to);
  if (s !== before) {
    fs.writeFileSync(file, s);
    changed++;
  }
}
console.log("updated files:", changed);
