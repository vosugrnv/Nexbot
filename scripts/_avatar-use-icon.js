const fs = require("fs");
const files = ["js/messages-page.js", "js/chat-widget.js", "js/shops-data.js", "tin-nhan.html"];
for (const f of files) {
  let t = fs.readFileSync(f, "utf8");
  const n = t.replace(/\/images\/favicon\.png\?v=[^"']+/g, "/images/icon-vuaproxy.png?v=20260915logo1");
  if (n !== t) {
    fs.writeFileSync(f, n);
    console.log("ok", f);
  } else console.log("skip", f);
}
