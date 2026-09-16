const { Client } = require("ssh2");
const c = new Client();
const cmd = [
  "docker exec supabase-db psql -U postgres -Atc \"SELECT datname FROM pg_database ORDER BY 1\"",
  "grep '^DATABASE_URL=' /var/www/vuammo-api/.env | sed -E 's#://[^:]+:[^@]+@#://USER:PASS@#'",
  "docker port supabase-db 2>/dev/null || true",
  "docker inspect supabase-db --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'"
].join("; echo '---'; ");
c.on("ready", () => {
  c.exec(cmd, (e, s) => {
    s.on("data", (d) => process.stdout.write(d));
    s.stderr.on("data", (d) => process.stderr.write(d));
    s.on("close", (code) => {
      c.end();
      process.exit(code || 0);
    });
  });
})
  .on("error", (e) => {
    console.error(e);
    process.exit(1);
  })
  .connect({
    host: process.env.VPS_HOST || "187.52.116.85",
    username: "root",
    password: process.env.VPS_PASS,
    readyTimeout: 30000
  });
