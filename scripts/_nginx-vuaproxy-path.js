const { Client } = require("ssh2");
const password = process.env.VPS_PASS;
const host = process.env.VPS_HOST || "187.52.116.85";

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream.on("data", (d) => {
        out += d.toString();
        process.stdout.write(d);
      });
      stream.stderr.on("data", (d) => {
        out += d.toString();
        process.stderr.write(d);
      });
      stream.on("close", (code) => resolve({ code, out }));
    });
  });
}

(async () => {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on("ready", resolve).on("error", reject).connect({
      host,
      username: "root",
      password,
      readyTimeout: 30000
    });
  });

  // Find where /api is proxied today
  await exec(
    conn,
    "grep -RIn '3100\\|location /api' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -40"
  );

  const script = `
set -e
# Add path-based proxy on the same server that already exposes /api on :80
# Prefer injecting into the vuammo site config if present
CFG=$(grep -Rl 'proxy_pass http://127.0.0.1:3100' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -1 || true)
echo "CFG=$CFG"
if [ -n "$CFG" ]; then
  if ! grep -q 'location /vuaproxy-api/' "$CFG"; then
    # Insert before the closing brace of server — append a dedicated location via include snippet
    cat > /etc/nginx/snippets/vuaproxy-api-location.conf <<'SNIP'
location /vuaproxy-api/ {
  proxy_pass http://127.0.0.1:3101/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  client_max_body_size 20m;
}
SNIP
    # Ensure include exists inside server block once
    if ! grep -q 'vuaproxy-api-location.conf' "$CFG"; then
      # Insert include after first "server {" line
      sed -i '0,/server {/s//server {\\n    include \\/etc\\/nginx\\/snippets\\/vuaproxy-api-location.conf;/' "$CFG"
    fi
  fi
else
  # Fallback standalone server on :80 with unique server_name
  cat > /etc/nginx/conf.d/vuaproxy-api-path.conf <<'NGX'
server {
  listen 80;
  server_name 187.52.116.85;
  location /vuaproxy-api/ {
    proxy_pass http://127.0.0.1:3101/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 20m;
  }
}
NGX
fi

# Remove conflicting listen 8088 file if it causes issues (keep process on 3101)
rm -f /etc/nginx/conf.d/vuaproxy-api.conf
nginx -t && systemctl reload nginx
curl -sS -H 'Host: 187.52.116.85' http://127.0.0.1/vuaproxy-api/health; echo
curl -sS http://127.0.0.1:3101/health; echo
echo DONE
`;
  const r = await exec(conn, script);
  conn.end();
  process.exit(r.code === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
