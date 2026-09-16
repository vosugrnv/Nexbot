const fs = require("fs");

function patch(file, fn) {
  let t = fs.readFileSync(file, "utf8");
  const n = fn(t);
  if (n === t) {
    console.log("no change", file);
    return;
  }
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, n);
  fs.renameSync(tmp, file);
  console.log("ok", file);
}

const AV = "/images/favicon.png?v=20260914av1";

patch("js/messages-page.js", (t) =>
  t.replace(/\/images\/logo-vuaproxy\.png\?v=[^"']+/g, AV)
);
patch("js/shops-data.js", (t) =>
  t.replace(/\/images\/logo-vuaproxy\.png\?v=[^"']+/g, AV)
);
patch("js/chat-widget.js", (t) =>
  t.replace(/\/images\/icon-vuaproxy\.png\?v=[^"']+/g, AV)
);
patch("tin-nhan.html", (t) =>
  t
    .replace(
      'src="/images/logo-vuaproxy.png?v=20260914brand4" alt=""',
      'src="' + AV + '" alt="Vua Proxy"'
    )
    .replace(/messages-page\.js\?v=[^"']+/, "messages-page.js?v=20260914av1")
    .replace(/shops-data\.js\?v=[^"']+/, "shops-data.js?v=20260914av1")
    .replace(/style\.css\?v=[^"']+/, "style.css?v=20260914av1")
    .replace(/chat-widget\.js\?v=[^"']+/, "chat-widget.js?v=20260914av1")
);

patch("css/style.css", (t) =>
  t
    .replace(
      ".msg-thread-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#fee2e2;flex-shrink:0}",
      ".msg-thread-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;object-position:center;background:#0f172a;flex-shrink:0;display:block}"
    )
    .replace(
      ".msg-chat-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#fff;flex-shrink:0}",
      ".msg-chat-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:center;background:#0f172a;flex-shrink:0;display:block}"
    )
    .replace(
      ".chat-panel-header .chat-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#fff}",
      ".chat-panel-header .chat-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:center;background:#0f172a}"
    )
);
