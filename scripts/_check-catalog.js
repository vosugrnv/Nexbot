const http = require("http");
http
  .get("http://127.0.0.1:5174/js/products-data.js?v=check", (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      console.log("status", res.statusCode);
      console.log("LUNA", /LUNA Proxy/i.test(d));
      console.log("datauri", /data:image\/svg/.test(d));
      console.log("santhovn", /santhovn\.com/.test(d));
      console.log("STATIC NL fake", /STATIC NL/.test(d));
      const m = d.match(/const RAW_PRODUCTS = (\[[\s\S]*?\]);\s*\nRAW_PRODUCTS/);
      if (m) console.log("count", JSON.parse(m[1]).length);
    });
  })
  .on("error", (e) => console.error(e.message));
