async function main() {
  const js = await (await fetch("https://www.vuaproxy.cloud/js/messages-page.js?v=20260914av1")).text();
  const m = js.match(/avatar:\s*"([^"]+)"/);
  console.log("SUPPORT.avatar", m && m[1]);
  console.log("has logo-vuaproxy", js.includes("logo-vuaproxy"));
  const html = await (await fetch("https://www.vuaproxy.cloud/tin-nhan")).text();
  const img = html.match(/id="msgChatAvatar"[^>]*>/);
  console.log("img", img && img[0]);
}
main();
