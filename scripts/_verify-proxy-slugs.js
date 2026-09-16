async function check(url) {
  const r = await fetch(url, { redirect: "manual" });
  console.log(url, r.status, r.headers.get("location") || "");
}
(async () => {
  await check("https://www.vuaproxy.cloud/tat-ca-khu-vuc/united-states");
  await check("https://www.vuaproxy.cloud/tat-ca-khu-vuc/us");
  await check("https://www.vuaproxy.cloud/tat-ca-khu-vuc/proxy-my");
  await check("https://www.vuaproxy.cloud/tat-ca-khu-vuc/thailand");
  await check("https://www.vuaproxy.cloud/tat-ca-khu-vuc/proxy-thai-lan");
})();
