const fs = require("fs");
const sharp = require("sharp");

async function check(url) {
  const r = await fetch(url, { redirect: "manual" });
  const buf = Buffer.from(await r.arrayBuffer());
  let meta = null;
  try {
    meta = await sharp(buf).metadata();
  } catch (e) {
    meta = { err: e.message };
  }
  console.log(url, r.status, r.headers.get("content-type"), buf.length, meta);
  return buf;
}

(async () => {
  await check("https://www.vuaproxy.cloud/favicon.ico");
  await check("https://www.vuaproxy.cloud/favicon.png");
  await check("https://www.vuaproxy.cloud/images/favicon.png?v=20260915fav2");
  await check("https://www.vuaproxy.cloud/images/favicon-32.png?v=20260915fav2");
  await check("https://www.vuaproxy.cloud/images/favicon-16.png?v=20260915fav2");
  const html = await (await fetch("https://www.vuaproxy.cloud/")).text();
  const icons = [...html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi)].map((m) => m[0]);
  console.log("html icons:\n" + icons.join("\n"));
})();
