async function main() {
  const r = await fetch("https://www.vuaproxy.cloud/tin-nhan/vuammo", { redirect: "manual" });
  console.log("vuammo redirect", r.status, r.headers.get("location"));
  const html = await (await fetch("https://www.vuaproxy.cloud/tin-nhan/vuaproxy")).text();
  console.log("css", (html.match(/href="([^"]*style\.css[^"]*)"/) || [])[1]);
  console.log("js", (html.match(/src="([^"]*messages-page\.js[^"]*)"/) || [])[1]);
  const cssUrl = new URL((html.match(/href="([^"]*style\.css[^"]*)"/) || [])[1], "https://www.vuaproxy.cloud/tin-nhan/vuaproxy").href;
  const cr = await fetch(cssUrl);
  console.log("css fetch", cssUrl, cr.status, cr.headers.get("content-type"));
}
main();
