const fs = require("fs");

function patch(file, fn) {
  let t = fs.readFileSync(file, "utf8");
  const n = fn(t);
  if (n === t) {
    console.log("no change", file);
    return false;
  }
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, n);
  fs.renameSync(tmp, file);
  console.log("ok", file);
  return true;
}

const AV = "/images/favicon.png?v=20260914msg2";

// 1) Absolute asset paths — nested /tin-nhan/:peer otherwise loads /tin-nhan/css|js (404)
patch("tin-nhan.html", (t) =>
  t
    .replace(/href="css\//g, 'href="/css/')
    .replace(/src="js\//g, 'src="/js/')
    .replace(/style\.css\?v=[^"']+/, "style.css?v=20260914msg2")
    .replace(/messages-page\.js\?v=[^"']+/, "messages-page.js?v=20260914msg2")
    .replace(/src="\/images\/favicon\.png\?v=[^"']+"/, 'src="' + AV + '"')
);

// 2) Support public URL → vuaproxy (vuammo still resolves as support)
patch("js/messages-page.js", (t) => {
  let n = t;
  n = n.replace(/\/images\/favicon\.png\?v=[^"']+/g, AV);
  n = n.replace(
    "/** URL-facing key: /tin-nhan/phuongshop hoặc /tin-nhan/vuammo */",
    "/** URL-facing key: /tin-nhan/phuongshop hoặc /tin-nhan/vuaproxy */"
  );
  n = n.replace(
    'if (!room) return "vuammo";\n    if (room.roomId === SUPPORT_ID || room.channel === "support") return "vuammo";',
    'if (!room) return "vuaproxy";\n    if (room.roomId === SUPPORT_ID || room.channel === "support") return "vuaproxy";'
  );
  if (!n.includes('key === "vuaproxy"')) {
    n = n.replace(
      'key === "vuammo" ||\n      key === "support" ||',
      'key === "vuammo" ||\n      key === "vuaproxy" ||\n      key === "support" ||'
    );
  }
  if (!n.includes('key === "vuaproxy_support"')) {
    n = n.replace(
      'key === "vuammo_support" ||\n      key === SUPPORT_ID',
      'key === "vuammo_support" ||\n      key === "vuaproxy_support" ||\n      key === SUPPORT_ID'
    );
  }
  return n;
});

patch("js/chat-widget.js", (t) =>
  t
    .replace(/\/tin-nhan\/vuammo/g, "/tin-nhan/vuaproxy")
    .replace(/\/images\/favicon\.png\?v=[^"']+/g, AV)
);

// 3) Redirect old support URL
patch("vercel.json", (t) => {
  if (t.includes('"/tin-nhan/vuammo"')) return t;
  return t.replace(
    '"redirects": [',
    `"redirects": [
    {
      "source": "/tin-nhan/vuammo",
      "destination": "/tin-nhan/vuaproxy",
      "permanent": false
    },`
  );
});
