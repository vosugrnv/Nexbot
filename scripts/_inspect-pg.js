const { Client } = require("ssh2");
const c = new Client();
const cmd = [
  "which psql; docker ps --format '{{.Names}} {{.Image}}' | head",
  "ls /var/run/postgresql 2>/dev/null || true",
  "sudo -u postgres psql -Atc 'SELECT current_database()' 2>&1 | head -5 || true",
  "CID=$(docker ps -qf name=postgres | head -1); echo CID=$CID; docker exec $CID psql -U postgres -Atc 'SELECT datname FROM pg_database' 2>&1 | head -30 || true"
].join("; echo '---'; ");
c.on("ready", () => {
  c.exec(cmd, (e, s) => {
    s.on("data", (d) => process.stdout.write(d));
    s.stderr.on("data", (d) => process.stderr.write(d));
    s.on("close", () => c.end());
  });
})
  .on("error", (e) => {
    console.error(e);
    process.exit(1);
  })
  .connect({
    host: process.env.VPS_HOST || "187.52.116.85",
    username: process.env.VPS_USER || "root",
    password: process.env.VPS_PASS,
    readyTimeout: 30000
  });
