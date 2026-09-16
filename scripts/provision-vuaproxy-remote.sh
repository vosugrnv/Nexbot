#!/bin/bash
set -euo pipefail
mkdir -p /var/www/vuaproxy-api /var/www/vuaproxy/uploads
rm -rf /var/www/vuaproxy-api/*
tar -xzf /tmp/vuaproxy-api.tar.gz -C /var/www/vuaproxy-api

python3 <<'PY'
import re, os, subprocess, urllib.parse, secrets

envf = "/var/www/vuammo-api/.env"
text = open(envf).read() if os.path.exists(envf) else ""

def get(key, default=""):
    m = re.search(rf"^{re.escape(key)}=(.*)$", text, re.M)
    return (m.group(1).strip() if m else default)

m = re.search(r"DATABASE_URL=postgres://([^:]+):([^@]+)@([^:/]+):(\d+)/([^?\s]+)", text)
if not m:
    raise SystemExit("Cannot parse vuammo DATABASE_URL")
dbuser, dbpass, oldhost, port, _olddb = m.groups()
# Prefer direct supabase-db IP (avoid pooler on 127.0.0.1:5432)
try:
    pghost = subprocess.check_output(
        ["docker", "inspect", "-f", "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}", "supabase-db"],
        text=True,
    ).strip() or oldhost
except Exception:
    pghost = oldhost or "172.16.1.2"
port = port or "5432"

admins = get("ADMIN_EMAILS")
jwt = secrets.token_hex(32)
cid = get("PAYOS_CLIENT_ID")
akey = get("PAYOS_API_KEY")
csum = get("PAYOS_CHECKSUM_KEY")
mock = get("PAYOS_MOCK") or "0"
smtp_host = get("SMTP_HOST")
smtp_port = get("SMTP_PORT") or "587"
smtp_user = get("SMTP_USER")
smtp_pass = get("SMTP_PASS")
smtp_secure = get("SMTP_SECURE") or "0"
mail_from = get("MAIL_FROM")

def dpsql(sql, db="postgres"):
    return subprocess.check_output(
        ["docker", "exec", "-i", "supabase-db", "psql", "-U", "postgres", "-d", db, "-v", "ON_ERROR_STOP=1", "-c", sql],
        text=True,
    )

def dpsql_at(sql, db="postgres"):
    return subprocess.check_output(
        ["docker", "exec", "-i", "supabase-db", "psql", "-U", "postgres", "-d", db, "-Atc", sql],
        text=True,
    ).strip()

exists = dpsql_at("SELECT 1 FROM pg_database WHERE datname='vuaproxy'")
if exists != "1":
    dpsql("CREATE DATABASE vuaproxy;")
# Keep owner as postgres (supabase restriction). Grant to existing app role.
u = dbuser.replace('"', '""')
dpsql(f'GRANT ALL PRIVILEGES ON DATABASE vuaproxy TO "{u}";')
dpsql(f'GRANT ALL ON SCHEMA public TO "{u}";', db="vuaproxy")
dpsql(f'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "{u}";', db="vuaproxy")
dpsql(f'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "{u}";', db="vuaproxy")

enc_user = urllib.parse.quote(dbuser, safe="")
enc_pass = urllib.parse.quote(dbpass, safe="")
url = f"postgres://{enc_user}:{enc_pass}@{pghost}:{port}/vuaproxy"
open("/var/www/vuaproxy-api/.env", "w").write(
    f"""PORT=3101
HOST=127.0.0.1
WEB_ORIGIN=https://www.vuaproxy.cloud
DATABASE_URL={url}
JWT_SECRET={jwt}
JWT_DAYS=14
HOLD_DAYS=3
PAYOS_CLIENT_ID={cid}
PAYOS_API_KEY={akey}
PAYOS_CHECKSUM_KEY={csum}
PAYOS_MOCK={mock}
ADMIN_EMAILS={admins}
UPLOAD_DIR=/var/www/vuaproxy/uploads
SMTP_HOST={smtp_host}
SMTP_PORT={smtp_port}
SMTP_USER={smtp_user}
SMTP_PASS={smtp_pass}
SMTP_SECURE={smtp_secure}
MAIL_FROM={mail_from}
"""
)
os.chmod("/var/www/vuaproxy-api/.env", 0o600)
print("ENV OK user", dbuser, "admins", admins)
PY

cd /var/www/vuaproxy-api
npm install --omit=dev
node src/migrate.js

python3 <<'PY'
import re, subprocess, urllib.parse
from urllib.parse import urlparse

env = open("/var/www/vuaproxy-api/.env").read()
url = re.search(r"^DATABASE_URL=(.*)$", env, re.M).group(1).strip()
u = urlparse(url)
dbuser = urllib.parse.unquote(u.username or "")
dbpass = urllib.parse.unquote(u.password or "")
dbhost = u.hostname
dbport = str(u.port or 5432)
dbname = (u.path or "/vuaproxy").lstrip("/")

def app_psql(sql):
    envp = dict(**{k: v for k, v in __import__("os").environ.items()}, PGPASSWORD=dbpass)
    subprocess.check_call(
        [
            "psql",
            f"postgres://{urllib.parse.quote(dbuser)}:{urllib.parse.quote(dbpass)}@{dbhost}:{dbport}/{dbname}",
            "-v",
            "ON_ERROR_STOP=1",
            "-c",
            sql,
        ],
        env=envp,
    )

def dpsql_at(sql, db):
    return subprocess.check_output(
        ["docker", "exec", "-i", "supabase-db", "psql", "-U", "postgres", "-d", db, "-AtF", "|", "-c", sql],
        text=True,
    )

vuammo_env = open("/var/www/vuammo-api/.env").read()
admins = re.search(r"^ADMIN_EMAILS=(.*)$", vuammo_env, re.M)
admin_list = [x.strip().lower() for x in (admins.group(1) if admins else "").split(",") if x.strip()]
print("seed admins", admin_list)
if admin_list:
    in_list = ",".join("'" + e.replace("'", "''") + "'" for e in admin_list)
    q = f"SELECT id, email, password_hash, COALESCE(name,''), created_at FROM users WHERE lower(email) IN ({in_list})"
    out = dpsql_at(q, "vuammo")
    for line in out.splitlines():
        parts = line.split("|")
        if len(parts) < 5:
            continue
        id_, email, ph, name, created = parts[:5]
        def esc(s):
            return s.replace("'", "''")
        ins = (
            "INSERT INTO users (id, email, password_hash, name, created_at) VALUES ("
            f"'{id_}', '{esc(email)}', '{esc(ph)}', '{esc(name)}', '{created}'"
            ") ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash;"
        )
        app_psql(ins)
        print("seeded", email)
print("users ready (balance on users.balance_cents)")
PY

pm2 delete vuaproxy-api >/dev/null 2>&1 || true
pm2 start src/server.js --name vuaproxy-api --cwd /var/www/vuaproxy-api
pm2 save

cat > /etc/nginx/conf.d/vuaproxy-api.conf <<'NGX'
server {
  listen 8088;
  server_name _;
  client_max_body_size 20m;
  location / {
    proxy_pass http://127.0.0.1:3101;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGX
nginx -t && systemctl reload nginx
ufw allow 8088/tcp >/dev/null 2>&1 || true
iptables -I INPUT -p tcp --dport 8088 -j ACCEPT 2>/dev/null || true

sleep 1
echo '--- health ---'
curl -sS http://127.0.0.1:3101/health; echo
curl -sS http://127.0.0.1:8088/health; echo
URL=$(grep '^DATABASE_URL=' /var/www/vuaproxy-api/.env | cut -d= -f2-)
echo '--- vuaproxy orders ---'
psql "$URL" -Atc 'SELECT count(*) FROM orders;'
echo '--- vuaproxy users ---'
psql "$URL" -Atc 'SELECT count(*) FROM users;'
echo '--- vuammo orders (unchanged) ---'
docker exec -i supabase-db psql -U postgres -d vuammo -Atc 'SELECT count(*) FROM orders;'
echo DONE
