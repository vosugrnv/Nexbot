const fs = require("fs");

let h = fs.readFileSync("chia-se.html", "utf8");
h = h.replace(
  /<h2 class="widget-title">Sản phẩm gợi ý<\/h2>[\s\S]*?<\/ul>/,
  `<h2 class="widget-title">Proxy gợi ý</h2>
          <ul class="sb-cats">
            <li><a href="/tat-ca-khu-vuc/us">Proxy Mỹ</a></li>
            <li><a href="/tat-ca-khu-vuc/sg">Proxy Singapore</a></li>
            <li><a href="/tat-ca-khu-vuc/vn">Proxy Việt Nam</a></li>
            <li><a href="/tat-ca-khu-vuc">Tất cả quốc gia</a></li>
          </ul>`
);
h = h.replace(/Chia sẻ \(99\+\)/g, "Chia sẻ");
h = h.replace(/chia-se-data\.js\?v=[^"]+/g, "chia-se-data.js?v=20260911proxy1");
h = h.replace(/blog-runtime\.js\?v=[^"]+/g, "blog-runtime.js?v=20260911proxy1");
h = h.replace(/chia-se\.js\?v=[^"]+/g, "chia-se.js?v=20260911proxy1");
fs.writeFileSync("chia-se.html", h);

let s = fs.readFileSync("js/site-header.js", "utf8");
s = s.replace('const SHELL_VER = "v19"', 'const SHELL_VER = "v20"');
s = s.replace("Chia sẻ (99+)", "Chia sẻ");
fs.writeFileSync("js/site-header.js", s);

let b = fs.readFileSync("js/side-banners.js", "utf8");
b = b.replace(
  /const LEFT = \{[\s\S]*?\};\n  const RIGHT = \{[\s\S]*?\};/,
  `const LEFT = {
    theme: "capcut",
    href: "/tat-ca-khu-vuc/us",
    title: "Proxy Mỹ",
    shop: "Vua Proxy",
    sub: "Residential & Datacenter",
    price: "Từ 10.000₫",
    image: "/images/flags/us.png",
    tag: "Hot",
    hot: "US",
    headline: "Proxy Mỹ\\nIP sạch · giao nhanh",
    pitch: "Chỉ từ",
    pitchStrong: "10.000₫"
  };
  const RIGHT = {
    theme: "netflix",
    href: "/tat-ca-khu-vuc",
    title: "Tất cả quốc gia",
    shop: "Vua Proxy",
    sub: "Đa quốc gia",
    price: "Xem gói",
    image: "/images/flags/vn.png",
    tag: "60+ nước",
    hot: "NEW",
    headline: "Chọn quốc gia\\nmua proxy ngay",
    pitch: "Khám phá",
    pitchStrong: "Tất cả khu vực"
  };`
);
fs.writeFileSync("js/side-banners.js", b);

// bump side-banners + site-header cache on chia-se if present
h = fs.readFileSync("chia-se.html", "utf8");
h = h.replace(/site-header\.js\?v=[^"]+/g, "site-header.js?v=20260911proxy1");
fs.writeFileSync("chia-se.html", h);

console.log({
  sidebar: /Proxy gợi ý/.test(h),
  static: /VUAPROXY_BLOG_STATIC/.test(fs.readFileSync("js/chia-se-data.js", "utf8")),
  shell: /SHELL_VER = "v20"/.test(fs.readFileSync("js/site-header.js", "utf8")),
  banners: /tat-ca-khu-vuc\/us/.test(fs.readFileSync("js/side-banners.js", "utf8"))
});
