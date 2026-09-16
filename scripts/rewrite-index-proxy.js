const fs = require("fs");
const file = "C:/Users/Admin/Downloads/VuaProxy/index.html";
let s = fs.readFileSync(file, "utf8");

s = s.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Vua Proxy — Proxy tĩnh &amp; proxy xoay đa quốc gia</title>"
);
s = s.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Vua Proxy — bán proxy tĩnh IPv4 và proxy xoay residential theo quốc gia. IP sạch, giao tự động, bảo hành rõ ràng.">'
);
s = s.replace(
  /<meta name="keywords" content="[^"]*">/,
  '<meta name="keywords" content="Vua Proxy, proxy tĩnh, proxy xoay, proxy residential, proxy Việt Nam, proxy US">'
);
s = s.replace(/https:\/\/vuammo\.com\//g, "https://vuaproxy.vn/");
s = s.replace(
  /<meta property="og:title" content="[^"]*">/,
  '<meta property="og:title" content="Vua Proxy — Proxy tĩnh &amp; proxy xoay">'
);
s = s.replace(
  /<meta property="og:description" content="[^"]*">/,
  '<meta property="og:description" content="Mua proxy tĩnh IPv4 và proxy xoay đa quốc gia tại Vua Proxy.">'
);
s = s.replace(
  /\{"@context":"https:\/\/schema\.org","@type":"Organization"[^}]+\}/,
  '{"@context":"https://schema.org","@type":"Organization","name":"Vua Proxy","url":"https://vuaproxy.vn/","logo":"https://vuaproxy.vn/images/logo-vuaproxy.png?v=20260914brand2","description":"Proxy tĩnh IPv4 và proxy xoay residential đa quốc gia"}'
);

s = s.replace(
  /<a href="\/tat-ca-san-pham\/tai-khoan-cong-cu-ai" class="side-nav-item" title="Tài khoản & Công cụ AI">[\s\S]*?<\/a>\s*<a href="\/tat-ca-san-pham\/game"[\s\S]*?<\/a>\s*<a href="\/tat-ca-san-pham\/khoa-hoc"[\s\S]*?<\/a>/,
  `<a href="/tat-ca-san-pham/proxy/static-ipv4" class="side-nav-item" title="Proxy Static">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
  </a>
  <a href="/tat-ca-san-pham/proxy/proxy-xoay" class="side-nav-item" title="Proxy Xoay">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
  </a>
  <a href="/lien-he" class="side-nav-item" title="Liên hệ">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
  </a>`
);

s = s.replace(/Đăng ký làm người bán/g, "Hỗ trợ 24/7");
s = s.replace(/href="\/dang-ky-nguoi-ban"/g, 'href="/lien-he"');
s = s.replace(/alt="Vua MMO[^"]*"/g, 'alt="Vua Proxy"');
s = s.replace(/Vua MMO/g, "Vua Proxy");
s = s.replace(/support@vuammo\.com/g, "support@vuaproxy.vn");

s = s.replace(
  /aria-label="Giới thiệu Vua Proxy"/,
  'aria-label="Giới thiệu Vua Proxy"'
);

s = s.replace(
  /Nền tảng sản phẩm số hàng đầu Việt Nam — Giao tự động 24\/7/,
  "Proxy tĩnh &amp; proxy xoay đa quốc gia — Giao tự động 24/7"
);
s = s.replace(
  /Giải pháp <span class="hero-text-gradient">tài khoản AI<\/span>/,
  'Giải pháp <span class="hero-text-gradient">proxy chuyên nghiệp</span>'
);
s = s.replace(
  /Mua sắm sản phẩm số giá tốt, <span class="hero-text-gradient">giao siêu tốc\.<\/span>/,
  'Static IPv4 &amp; residential xoay, <span class="hero-text-gradient">IP sạch ổn định.</span>'
);
s = s.replace(
  /Sàn giao dịch tài khoản AI, phần mềm bản quyền và dịch vụ số — giá tốt, giao email tự động trong 5–15 phút, bảo hành rõ ràng trên sàn\./,
  "Cửa hàng proxy của Vua Proxy — chọn quốc gia, gói thời hạn hoặc dung lượng, nhận thông tin proxy tự động sau thanh toán, bảo hành rõ ràng."
);

s = s.replace(
  /<div class="hero-dark-chips">[\s\S]*?<\/div>\s*<div class="hero-dark-cta-row">/,
  `<div class="hero-dark-chips">
          <a class="hero-dark-chip" href="/tat-ca-san-pham/proxy/static-ipv4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
            Proxy Static
          </a>
          <a class="hero-dark-chip" href="/tat-ca-san-pham/proxy/proxy-xoay">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
            Proxy Xoay
          </a>
          <a class="hero-dark-chip" href="/tat-ca-san-pham/proxy/viet-nam">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
            Việt Nam
          </a>
        </div>
        <div class="hero-dark-cta-row">`
);

s = s.replace(/Xem sản phẩm Hot/, "Xem gói proxy Hot");
s = s.replace(
  /<span class="hero-dark-stat-num">100\+<\/span>\s*<span class="hero-dark-stat-label">Sản phẩm số<\/span>/,
  '<span class="hero-dark-stat-num">12+</span>\n            <span class="hero-dark-stat-label">Quốc gia</span>'
);
s = s.replace(
  /Vua Proxy · Sàn sản phẩm số/,
  "Vua Proxy · Proxy Dashboard"
);
s = s.replace(/>Tài khoản AI</g, ">Proxy Static<");
s = s.replace(/>Đơn hàng</g, ">Proxy Xoay<");
s = s.replace(/>Hỗ trợ</g, ">Quốc gia<");

// Info block
s = s.replace(
  /<!-- ===== AI ACCOUNT INFO BLOCK ===== -->[\s\S]*?<!-- ===== HOT PRODUCTS BY CATEGORY ===== -->/,
  `<!-- ===== PROXY INFO BLOCK ===== -->
  <section class="container section">
    <div class="info-block">
      <h2>Proxy tĩnh và proxy xoay là gì?</h2>
      <p>Proxy tĩnh (Static IPv4) giữ một IP riêng ổn định — phù hợp ads, tool MMO, đăng nhập dài hạn. Proxy xoay (rotating residential) đổi IP theo phiên hoặc dung lượng — phù hợp scraping, kiểm thử và nhu cầu ẩn danh linh hoạt.</p>
      <p>Vua Proxy bán trực tiếp, không phải sàn nhiều shop. Bạn chọn quốc gia và gói, thanh toán xong nhận thông tin proxy tự động, có bảo hành rõ ràng trong thời hạn gói.</p>
      <div class="info-collapsible collapsed" id="infoCollapsible">
        <h3>Vì sao chọn Vua Proxy?</h3>
        <div class="info-cards">
          <div class="info-card">
            <h4>IP sạch, ổn định</h4>
            <p>Proxy được kiểm tra trước khi giao. Static riêng IP, xoay residential linh hoạt theo quốc gia.</p>
            <a href="/gioi-thieu">Tìm hiểu thêm <span>→</span></a>
          </div>
          <div class="info-card">
            <h4>Đa quốc gia</h4>
            <p>VN, US, UK, DE, SG, JP, KR và nhiều quốc gia khác — chọn đúng vùng bạn cần.</p>
            <a href="/tat-ca-san-pham">Xem danh mục <span>→</span></a>
          </div>
          <div class="info-card">
            <h4>Giao tự động nhanh</h4>
            <p>Thanh toán xong hệ thống gửi thông tin proxy kèm hướng dẫn sử dụng ngay.</p>
            <a href="/huong-dan-mua-hang">Hướng dẫn <span>→</span></a>
          </div>
          <div class="info-card">
            <h4>Bảo hành rõ ràng</h4>
            <p>Bảo hành trong thời hạn gói, hỗ trợ đổi IP khi lỗi thuộc phạm vi cam kết.</p>
            <a href="/bao-hanh-va-hoan-tien">Chính sách <span>→</span></a>
          </div>
        </div>
        <div class="info-tags">
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/static-ipv4">Static IPv4 <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/proxy-xoay">Proxy Xoay <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/viet-nam">Việt Nam <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/united-states">United States <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/singapore">Singapore <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/japan">Japan <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/germany">Germany <span>→</span></a>
          <a class="tag-pill" href="/tat-ca-san-pham/proxy/combo">Combo <span>→</span></a>
        </div>
      </div>
      <button class="info-toggle" id="infoToggleBtn">XEM THÊM <span>↓</span></button>
    </div>
  </section>

  <!-- ===== HOT PRODUCTS BY CATEGORY ===== -->`
);

s = s.replace(
  /Khám phá các tài khoản AI và phần mềm đang được nhiều khách hàng lựa chọn nhất tại Vua Proxy\./,
  "Các gói proxy tĩnh và proxy xoay đang được mua nhiều nhất tại Vua Proxy."
);

s = s.replace(
  /<div class="hot-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>\s*<!-- ===== AI TOOLS ===== -->/,
  `<div class="hot-grid">
        <div class="hot-card">
          <div class="hot-icon"><img src="/images/logo-vuaproxy.png?v=20260914brand2" alt="Static VN" loading="lazy"></div>
          <h3>Static Việt Nam</h3>
          <a href="/tat-ca-san-pham/proxy/viet-nam">Xem gói <span>→</span></a>
        </div>
        <div class="hot-card">
          <div class="hot-icon"><img src="/images/logo-vuaproxy.png?v=20260914brand2" alt="Static US" loading="lazy"></div>
          <h3>Static United States</h3>
          <a href="/tat-ca-san-pham/proxy/united-states">Xem gói <span>→</span></a>
        </div>
        <div class="hot-card">
          <div class="hot-icon"><img src="/images/logo-vuaproxy.png?v=20260914brand2" alt="Proxy Xoay" loading="lazy"></div>
          <h3>Proxy Xoay Residential</h3>
          <a href="/tat-ca-san-pham/proxy/proxy-xoay">Xem danh mục <span>→</span></a>
        </div>
        <div class="hot-card">
          <div class="hot-icon"><img src="/images/logo-vuaproxy.png?v=20260914brand2" alt="Combo" loading="lazy"></div>
          <h3>Combo đa quốc gia</h3>
          <a href="/tat-ca-san-pham/proxy/combo">Xem combo <span>→</span></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== AI TOOLS ===== -->`
);

s = s.replace(
  /<p class="eyebrow">Công cụ AI 2026<\/p>\s*<h2 class="section-title">Top những công cụ AI có nhiều người mua nhất<\/h2>/,
  '<p class="eyebrow">Proxy Static</p>\n    <h2 class="section-title">Top proxy tĩnh đang được mua nhiều</h2>'
);
s = s.replace(/Top tài khoản bán chạy/, "Top proxy bán chạy");
s = s.replace(
  /<section class="container section" id="hoctap">[\s\S]*?<\/section>\s*<!-- ===== STATS ===== -->/,
  `<section class="container section" id="hoctap">
    <h2 class="section-title">Chọn theo nhu cầu</h2>
    <div class="tabs" id="tabs">
      <button class="tab active" data-tab="static">Proxy Static</button>
      <button class="tab" data-tab="rotating">Proxy Xoay</button>
      <button class="tab" data-tab="vn">Việt Nam</button>
      <button class="tab" data-tab="us">United States</button>
      <button class="tab" data-tab="combo">Combo</button>
    </div>
    <div class="card-grid" id="learnGrid"></div>
  </section>

  <!-- ===== STATS ===== -->`
);

s = s.replace(
  /Hơn <span class="stats-highlight">12\.000\+<\/span> khách hàng đã tin dùng <span class="stats-brand">Vua Proxy<\/span>/,
  'Hơn <span class="stats-highlight">5.000+</span> khách hàng đã tin dùng <span class="stats-brand">Vua Proxy</span>'
);
s = s.replace(
  /Dữ liệu thực tế từ hệ thống bán hàng tự động — giao nhanh, ổn định và hỗ trợ liên tục\./,
  "Giao proxy tự động, IP ổn định và hỗ trợ kỹ thuật liên tục."
);
s = s.replace(/>12\.860\+</, ">5.240+<");
s = s.replace(/>4\.520\+</, ">1.860+<");
s = s.replace(/Giao tài khoản/, "Giao proxy");
s = s.replace(/dùng ngay sau khi mua/, "nhận IP ngay sau khi mua");

s = s.replace(
  /<h2>Khám phá<br>Công cụ AI<\/h2>\s*<p>Truy cập các công cụ AI hàng đầu với chi phí tối ưu – dùng ngay, ổn định, không lo giới hạn\.<\/p>/,
  "<h2>Khám phá<br>Gói proxy</h2>\n          <p>Chọn proxy tĩnh hoặc xoay theo quốc gia — IP sạch, giao nhanh, bảo hành trong hạn gói.</p>"
);
s = s.replace(/Truy cập AI Premium/g, "Xem Proxy Static");
s = s.replace(/Tiết kiệm đến 70% chi phí/g, "Đa quốc gia sẵn sàng");
s = s.replace(/Dùng ngay sau khi mua/g, "Giao tự động 24/7");
s = s.replace(/Hỗ trợ 1-1 từ Vua Proxy/g, "Hỗ trợ kỹ thuật 1-1");
s = s.replace(/href="\/tat-ca-san-pham\/tai-khoan-cong-cu-ai"/g, 'href="/tat-ca-san-pham/proxy/static-ipv4"');
s = s.replace(/href="#ai"/g, 'href="/tat-ca-san-pham"');

s = s.replace(
  /Quy trình mua hàng tại Vua Proxy/,
  "Quy trình mua proxy tại Vua Proxy"
);
s = s.replace(
  /Mua nhanh – nhận tài khoản ngay – kích hoạt linh hoạt tùy từng dịch vụ/,
  "Chọn gói – thanh toán – nhận proxy tự động"
);
s = s.replace(
  /<h3>Chọn tài khoản phù hợp<\/h3><p>Lựa chọn tài khoản AI, học tập, giải trí hoặc các dịch vụ bạn cần sử dụng\.<\/p>/,
  "<h3>Chọn gói proxy</h3><p>Chọn static hoặc xoay, quốc gia và thời hạn/dung lượng phù hợp nhu cầu.</p>"
);
s = s.replace(
  /<h3>Nhận tài khoản &amp; kích hoạt<\/h3><p>Tài khoản được gửi tự động sau khi thanh toán\. Một số dịch vụ nâng cấp có thể mất thêm thời gian xử lý\.<\/p>/,
  "<h3>Nhận proxy &amp; dùng ngay</h3><p>Thông tin proxy được gửi tự động sau thanh toán kèm hướng dẫn gắn vào tool/trình duyệt.</p>"
);
s = s.replace(
  /Mua tài khoản giá tốt – khách hàng nói gì\?/,
  "Mua proxy ổn định – khách hàng nói gì?"
);

// SEO hub cleanup
s = s.replace(/<a class="seo-hub-link" href="\/danh-sach-shop">[\s\S]*?<\/a>\s*/, "");
s = s.replace(/<a class="seo-hub-link" href="\/dang-ky-nguoi-ban">[\s\S]*?<\/a>\s*/, "");
s = s.replace(/<a class="seo-hub-link" href="\/chia-se\/[^"]+">[\s\S]*?<\/a>\s*/g, "");
s = s.replace(/<a class="seo-hub-link" href="\/[a-z0-9-]+">Shop [\s\S]*?<\/a>\s*/g, "");

s = s.replace(
  /Vua Proxy là nền tảng giao dịch sản phẩm số — tài khoản, phần mềm bản quyền chính hãng với giá thành tốt nhất\./,
  "Vua Proxy cung cấp proxy tĩnh IPv4 và proxy xoay residential đa quốc gia — IP sạch, giao tự động, bảo hành rõ ràng."
);
s = s.replace(/Về Vua Proxy/g, "Về chúng tôi");
s = s.replace(
  /Có vấn đề hoặc thắc mắc\? Nhắn trực tiếp với Vua Proxy để được hỗ trợ nhanh nhất\./,
  "Có vấn đề về proxy hoặc gói hàng? Chat trực tiếp với Vua Proxy để được hỗ trợ nhanh."
);
s = s.replace(
  /<a href="\/tat-ca-san-pham\/tai-khoan-cong-cu-ai">Tài khoản &amp; Công cụ AI<\/a>\s*<a href="\/tat-ca-san-pham\/game">Game<\/a>\s*<a href="\/tat-ca-san-pham\/khoa-hoc">Khóa học<\/a>/,
  `<a href="/tat-ca-san-pham/proxy/static-ipv4">Proxy Static</a>
      <a href="/tat-ca-san-pham/proxy/proxy-xoay">Proxy Xoay</a>
      <a href="/tat-ca-san-pham/proxy/viet-nam">Proxy Việt Nam</a>`
);

s = s.replace(
  /alt="Tài khoản giá tốt"/,
  'alt="Proxy giá tốt"'
);
s = s.replace(
  /css\/style\.css\?v=[^"]+/,
  "css/style.css?v=20260910proxy1"
);
s = s.replace(
  /js\/products-data\.js\?v=[^"]+/,
  "js/products-data.js?v=20260910proxy1"
);
s = s.replace(
  /js\/app\.js\?v=[^"]+/,
  "js/app.js?v=20260910proxy1"
);
s = s.replace(
  /js\/site-header\.js\?v=[^"]+/,
  "js/site-header.js?v=20260910proxy1"
);

fs.writeFileSync(file, s);
console.log("index.html updated, remaining Vua MMO:", (s.match(/Vua MMO/g) || []).length);
