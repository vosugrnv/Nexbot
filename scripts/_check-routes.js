const http = require("http");

const urls = [
  "/",
  "/tat-ca-san-pham",
  "/tat-ca-san-pham/proxy",
  "/tat-ca-san-pham/proxy/luna-proxy",
  "/tat-ca-san-pham/luna-proxy-residential-unlimited-theo-ngay-24096",
  "/tat-ca-san-pham/proxy-vn-ipv4-ipv6-private-dan-cu-ip-sach-toc-do-cao-bao-hanh-1-doi-1-15506",
  "/gioi-thieu",
  "/lien-he",
  "/product.html",
  "/js/products-data.js"
];

function get(url) {
  return new Promise((resolve) => {
    http
      .get("http://127.0.0.1:5174" + url, (res) => {
        res.resume();
        resolve({ url, status: res.statusCode });
      })
      .on("error", (e) => resolve({ url, status: "ERR " + e.message }));
  });
}

(async () => {
  for (const u of urls) {
    const r = await get(u);
    console.log(r.status, r.url);
  }
})();
