const https = require("https");
https.get("https://www.vuaproxy.cloud/js/admin-app.js?v=20260911proxy2", (res) => {
  let d = "";
  res.on("data", (c) => (d += c));
  res.on("end", () => {
    console.log({
      status: res.statusCode,
      setView: d.includes("async function setView"),
      moneyCls: d.includes("function moneyCls"),
      paid: d.includes('paid: "warn"'),
      proxy: d.includes("Vua Proxy Admin"),
      broken: /function statusTag\(st\) \{\s*const map = \{\s*dashboard:/.test(d)
    });
  });
});
