const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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
  const root = path.join(__dirname, "..");
  const apiDir = path.join(root, "api");
  const archive = path.join(process.env.TEMP || "/tmp", "vuaproxy-api.tar.gz");
  const remoteSh = path.join(__dirname, "provision-vuaproxy-remote.sh");

  console.log("Packing api...");
  execSync(
    `tar -czf "${archive}" --exclude=node_modules --exclude=.env -C "${apiDir}" .`,
    { stdio: "inherit", shell: true }
  );

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn
      .on("ready", resolve)
      .on("error", reject)
      .connect({ host, username: user, password, readyTimeout: 60000 });
  });

  console.log("Upload...");
  await upload(conn, archive, "/tmp/vuaproxy-api.tar.gz");
  await upload(conn, remoteSh, "/tmp/provision-vuaproxy-remote.sh");
  const r = await exec(conn, "sed -i 's/\\r$//' /tmp/provision-vuaproxy-remote.sh && bash /tmp/provision-vuaproxy-remote.sh");
  conn.end();
  process.exit(r.code === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
