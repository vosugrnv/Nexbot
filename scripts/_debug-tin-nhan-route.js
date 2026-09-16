async function main() {
  for (const url of [
    "https://www.vuaproxy.cloud/tin-nhan/vuammo",
    "https://www.vuaproxy.cloud/tin-nhan",
    "https://www.vuaproxy.cloud/images/favicon.png"
  ]) {
    const r = await fetch(url, { redirect: "manual" });
    const ct = r.headers.get("content-type");
    const t = await r.text();
    console.log("\n===", url);
    console.log("status", r.status, "ct", ct, "len", t.length);
    console.log("start", t.slice(0, 200).replace(/\n/g, " "));
    if (ct && ct.includes("html")) {
      const imgs = [...t.matchAll(/<img[^>]+>/gi)].slice(0, 8).map((m) => m[0]);
      console.log("imgs", imgs);
      const css = [...t.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);
      console.log("css", css);
    }
  }
}
main();
