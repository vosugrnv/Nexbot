  function cartoonAvatar(variant) {
    const map = {
      a:
        '<svg class="lcp-cartoon" viewBox="0 0 80 80" aria-hidden="true">' +
        '<rect width="80" height="80" fill="#fde68a"/>' +
        '<ellipse cx="40" cy="72" rx="26" ry="18" fill="#fb7185"/>' +
        '<circle cx="40" cy="38" r="18" fill="#f5c6a5"/>' +
        '<path d="M22 34c2-16 34-16 36 0 0-14-10-24-18-24S22 20 22 34Z" fill="#7c2d12"/>' +
        '<circle cx="33" cy="38" r="2.2" fill="#1f2937"/><circle cx="47" cy="38" r="2.2" fill="#1f2937"/>' +
        '<path d="M35 46c2.5 3 7.5 3 10 0" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
        "</svg>",
      b:
        '<svg class="lcp-cartoon" viewBox="0 0 80 80" aria-hidden="true">' +
        '<rect width="80" height="80" fill="#bfdbfe"/>' +
        '<ellipse cx="40" cy="72" rx="26" ry="18" fill="#2563eb"/>' +
        '<circle cx="40" cy="38" r="18" fill="#e8b892"/>' +
        '<path d="M20 36c3-18 37-18 40 0v-4c0-12-10-20-20-20S20 20 20 32Z" fill="#111827"/>' +
        '<circle cx="33" cy="38" r="2.2" fill="#111827"/><circle cx="47" cy="38" r="2.2" fill="#111827"/>' +
        '<path d="M35 47c2.8 2.4 7.2 2.4 10 0" stroke="#9a3412" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
        "</svg>",
      c:
        '<svg class="lcp-cartoon" viewBox="0 0 80 80" aria-hidden="true">' +
        '<rect width="80" height="80" fill="#ddd6fe"/>' +
        '<ellipse cx="40" cy="72" rx="26" ry="18" fill="#8b5cf6"/>' +
        '<circle cx="40" cy="38" r="18" fill="#f0c4a8"/>' +
        '<path d="M18 34c4-18 40-18 44 0 1-16-12-26-22-26S17 18 18 34Z" fill="#f59e0b"/>' +
        '<circle cx="33" cy="38" r="2.2" fill="#1f2937"/><circle cx="47" cy="38" r="2.2" fill="#1f2937"/>' +
        '<path d="M35 46c2.5 3 7.5 3 10 0" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
        "</svg>",
      you:
        '<svg class="lcp-cartoon" viewBox="0 0 80 80" aria-hidden="true">' +
        '<rect width="80" height="80" fill="#1e293b"/>' +
        '<ellipse cx="40" cy="74" rx="24" ry="16" fill="#0f172a"/>' +
        '<circle cx="40" cy="40" r="17" fill="#cbd5e1"/>' +
        '<path d="M18 34c6-18 38-18 44 0H18Z" fill="#020617"/>' +
        '<path d="M22 28c8-14 28-14 36 0-4-12-12-18-18-18S26 16 22 28Z" fill="#111827"/>' +
        '<rect x="24" y="36" width="32" height="10" rx="5" fill="#020617"/>' +
        '<circle cx="32" cy="41" r="2.4" fill="#38bdf8"/><circle cx="48" cy="41" r="2.4" fill="#38bdf8"/>' +
        '<path d="M36 50h8" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>' +
        "</svg>"
    };
    return map[variant] || map.a;
  }

  function bentoVisual(kind, country) {
    const cc = String(country.code || "us").toUpperCase();
    const flag = String(country.code || "us").toLowerCase();
    const ipsShort = fmtIps(Math.max(80, Math.round((country.ips || 160) / 280)));
    const uid = "lcp" + kind + cc;

    if (kind === "uptime") {
      return (
        '<div class="lcp-viz-panel" aria-hidden="true">' +
        '<div class="lcp-viz lcp-viz--net">' +
        '<svg class="lcp-viz-svg" viewBox="0 0 320 148" fill="none">' +
        '<defs><filter id="' + uid + 'g" x="-80%" y="-80%" width="260%" height="260%">' +
        '<feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        '<g stroke="rgba(255,255,255,.22)" stroke-width="1">' +
        '<path d="M16 24 H304 M16 48 H304 M16 72 H304 M16 96 H304 M16 120 H304"/>' +
        '<path d="M40 12 V136 M80 12 V136 M120 12 V136 M160 12 V136 M200 12 V136 M240 12 V136 M280 12 V136"/>' +
        "</g>" +
        '<path d="M28 118 L72 86 L120 98 L168 52 L216 70 L268 34" stroke="rgba(255,255,255,.92)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<g fill="rgba(255,255,255,.7)">' +
        '<circle cx="72" cy="86" r="3"/><circle cx="120" cy="98" r="2.5"/><circle cx="216" cy="70" r="2.8"/><circle cx="268" cy="34" r="3"/>' +
        "</g>" +
        '<g class="lcp-node-hot" filter="url(#' + uid + 'g)" transform="translate(168 52)">' +
        '<circle r="12" fill="rgba(255,255,255,.16)"/><circle r="5" fill="#fff"/>' +
        '<path d="M-6.5 -6.5 L6.5 6.5 M6.5 -6.5 L-6.5 6.5" stroke="#05070d" stroke-width="1.8" stroke-linecap="round"/>' +
        "</g></svg>" +
        '<span class="lcp-viz-pill"><span class="lcp-viz-pill-plus">+</span>99% Success</span>' +
        "</div></div>"
      );
    }

    if (kind === "privacy") {
      const tiles = ["a", "b", "you", "c"];
      return (
        '<div class="lcp-viz-panel" aria-hidden="true">' +
        '<div class="lcp-viz lcp-viz--faces">' +
        tiles
          .map(function (v) {
            const you = v === "you";
            return (
              '<span class="lcp-face lcp-face--' + v + (you ? " is-you" : "") + '">' +
              cartoonAvatar(v) +
              (you ? '<em>You</em><span class="lcp-cursor" aria-hidden="true"></span>' : "") +
              "</span>"
            );
          })
          .join("") +
        "</div></div>"
      );
    }

    if (kind === "speed") {
      return (
        '<div class="lcp-viz-panel" aria-hidden="true">' +
        '<div class="lcp-viz lcp-viz--chart">' +
        '<div class="lcp-ping-label"><b>12ms</b> Ping</div>' +
        '<svg class="lcp-viz-svg" viewBox="0 0 320 148" fill="none">' +
        '<defs><linearGradient id="' + uid + 'a" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#fff" stop-opacity=".28"/>' +
        '<stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
        '<g stroke="rgba(255,255,255,.08)" stroke-width="1">' +
        '<path d="M18 30 H302 M18 58 H302 M18 86 H302 M18 114 H302"/>' +
        "</g>" +
        '<path class="lcp-chart-area" d="M18 112 C58 104,78 96,108 88 C138 80,158 70,188 52 C218 34,248 44,302 28 L302 138 L18 138 Z" fill="url(#' + uid + 'a)"/>' +
        '<path class="lcp-chart-line" d="M18 112 C58 104,78 96,108 88 C138 80,158 70,188 52 C218 34,248 44,302 28" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
        '<circle class="lcp-chart-dot" cx="188" cy="52" r="5.5" fill="#fff"/>' +
        "</svg>" +
        '<span class="lcp-flag-float"><img src="/images/flags/' + flag + '.png" alt="" width="14" height="14" loading="lazy" onerror="this.style.display=\'none\'">' + cc + "</span>" +
        "</div></div>"
      );
    }

    if (kind === "ip") {
      return (
        '<div class="lcp-viz-panel lcp-viz-panel--soft" aria-hidden="true">' +
        '<div class="lcp-viz lcp-viz--dash">' +
        '<div class="lcp-dash-left">' +
        '<span class="lcp-dash-kicker">Total Usage</span>' +
        '<strong class="lcp-dash-stat">' + ipsShort + " IPs</strong>" +
        '<div class="lcp-bars" aria-hidden="true">' +
        '<i style="--h:42%"></i><i style="--h:68%"></i><i style="--h:55%"></i><i style="--h:88%"></i><i style="--h:72%"></i><i style="--h:96%"></i><i style="--h:64%"></i>' +
        "</div></div>" +
        '<div class="lcp-dash-toggles">' +
        '<button type="button" tabindex="-1" class="is-on">Total</button>' +
        '<button type="button" tabindex="-1">Refresh</button>' +
        '<button type="button" tabindex="-1">Rotation</button>' +
        "</div></div></div>"
      );
    }

    if (kind === "support") {
      return (
        '<div class="lcp-viz-panel lcp-viz-panel--soft" aria-hidden="true">' +
        '<div class="lcp-viz lcp-viz--support">' +
        '<div class="lcp-support-thread">' +
        '<div class="lcp-support-row">' +
        '<span class="lcp-chat-av">' + cartoonAvatar("a") + "</span>" +
        '<span class="lcp-chat-bubble">Xin chào, cần hỗ trợ proxy ' + cc + "?</span>" +
        "</div>" +
        '<div class="lcp-support-row is-me">' +
        '<span class="lcp-chat-bubble is-me"><span class="lcp-online-dot"></span>Online 24/7 ✓</span>' +
        "</div></div>" +
        '<div class="lcp-support-side">' +
        "<div><b>User A</b><em>24 chats</em></div>" +
        "<div><b>User B</b><em>12 chats</em></div>" +
        '<div class="is-active"><b>You</b><em>Live</em></div>' +
        "</div></div></div>"
      );
    }

    return (
      '<div class="lcp-viz-panel lcp-viz-panel--soft" aria-hidden="true">' +
      '<div class="lcp-viz lcp-viz--price">' +
      '<span class="lcp-price-pill">Từ 8.000đ / IP</span>' +
      '<div class="lcp-price-row">' +
      '<span class="lcp-price-input">Số lượng IP</span>' +
      '<span class="lcp-price-send" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg>' +
      "</span></div>" +
      '<span class="lcp-price-note">Giá tốt · chất lượng ổn định</span>' +
      "</div></div>"
    );
  }

  function renderWhy(country) {
    const name = country.nameVi || country.name;
    const titleEl = document.getElementById("lcpWhyTitle");
    const subEl = document.getElementById("lcpWhySub");
    const bento = document.getElementById("lcpBento");
    if (titleEl) {
      titleEl.textContent = "Tại Sao Nên Chọn Proxy Dân Cư Của Vua Proxy";
    }
    if (subEl) {
      subEl.textContent =
        "Mạng proxy dân cư " + name + " chất lượng cao — khoảng " +
        fmtIps(country.ips) +
        " IP, giao tự động, ổn định cho ads, MMO, SEO và kiểm thử.";
    }
    if (!bento) return;

    const cards = [
      {
        tag: "Tính năng nổi bật",
        tone: "green",
        title: "Quản lý proxy thông minh",
        body:
          "Dễ dàng theo dõi và quản lý proxy " + name + " theo thời gian thực trên dashboard hiện đại. Uptime 99% giúp bạn scale mượt mà.",
        viz: "uptime"
      },
      {
        tag: "Tính năng nổi bật",
        tone: "green",
        title: "Bảo mật hàng đầu",
        body:
          "Bảo vệ hoạt động online với IP dân cư " + name + " thật. Tách phiên, giảm lộ IP gốc — phù hợp antidetect browser.",
        viz: "privacy"
      },
      {
        tag: "Tính năng nổi bật",
        tone: "green",
        title: "Tốc độ & Hiệu năng",
        body:
          "Duy trì hiệu suất cao khi chạy đa phiên tới " + name + ". Ping thấp, ổn định cho tool, game và kiểm thử realtime.",
        viz: "speed"
      },
      {
        tag: "Tính năng nổi bật",
        tone: "green",
        title: "Quản lý IP linh hoạt",
        body:
          "Tự động thay IP, xoay phiên và cấu hình port linh hoạt. HTTP/SOCKS5 giúp duy trì hoạt động liên tục với tỷ lệ thành công cao.",
        viz: "ip"
      },
      {
        tag: "Hỗ trợ",
        tone: "amber",
        title: "Hỗ trợ 24/7",
        body:
          "Đội ngũ Vua Proxy luôn sẵn sàng hỗ trợ kỹ thuật và hướng dẫn gắn proxy " + name + " — kể cả ngày lễ.",
        viz: "support"
      },
      {
        tag: "Bảng giá",
        tone: "amber",
        title: "Tối ưu chi phí",
        body:
          "Gói dân cư & datacenter " + name + " giá rõ, mua đúng nhu cầu. Theo dõi đơn hàng dễ dàng — chất lượng ổn định.",
        viz: "price"
      }
    ];

    bento.innerHTML = cards
      .map(function (c) {
        return (
          '<article class="lcp-bento-card">' +
          '<p class="lcp-bento-tag lcp-bento-tag--' + c.tone + '">' + c.tag + "</p>" +
          "<h3>" + c.title + "</h3>" +
          "<p>" + c.body + "</p>" +
          bentoVisual(c.viz, country) +
          "</article>"
        );
      })
      .join("");
  }
