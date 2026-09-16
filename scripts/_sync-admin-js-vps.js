const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const host = process.env.VPS_HOST || "187.52.116.85";
const password = process.env.VPS_PASS;
const user = process.env.VPS_USER || "root";
if (!password) {
  console.error("Need VPS_PASS");
  process.exit(1);
}

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

function upload(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      sftp.fastPut(local, remote, (e) => (e ? reject(e) : resolve()));
    });
  });
}

(async () => {
  const local = path.join(__dirname, "..", "api", "src", "admin.js");
  const remote = "/var/www/vuaproxy-api/src/admin.js";
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn
      .on("ready", resolve)
      .on("error", reject)
      .connect({ host, username: user, password, readyTimeout: 60000 });
  });
  console.log("Upload admin.js...");
  await upload(conn, local, remote);
  const r = await exec(conn, "pm2 restart vuaproxy-api && sleep 1 && curl -sS http://127.0.0.1:3101/health");
  conn.end();
  process.exit(r.code === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
