"""Bootstrap fresh Ubuntu 22.04 server: install Node 20, nginx, pm2; clone repo; build; configure nginx; start with pm2."""
import io
import sys
import paramiko

# Force UTF-8 stdout so apt/npm progress chars don't crash on Windows cp1251 console.
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"

REPO_URL = "https://github.com/Bekmuhammad-Devoloper/chinesewiev.git"
APP_DIR = "/var/www/chinesewave"
APP_NAME = "chinesewave"
PORT = 3002
DOMAIN_NAMES = "chinesewave.uz www.chinesewave.uz"

NGINX_CONF = f"""server {{
    listen 80;
    server_name {DOMAIN_NAMES};

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    client_max_body_size 20M;

    location / {{
        proxy_pass http://127.0.0.1:{PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }}

    location /_next/static {{
        proxy_pass http://127.0.0.1:{PORT};
        add_header Cache-Control "public, max-age=31536000, immutable";
    }}

    location /assets {{
        alias {APP_DIR}/public/assets;
        add_header Cache-Control "public, max-age=86400";
        try_files $uri @nextjs;
    }}

    location @nextjs {{
        proxy_pass http://127.0.0.1:{PORT};
    }}
}}
"""

ENV_FILE = """# Admin parol — production'da o'zgartiring!
NEXT_PUBLIC_ADMIN_PASSWORD=boburbek

# Sayt URL
NEXT_PUBLIC_SITE_URL=https://chinesewave.uz

# API uchun secret (ishlatilmasa bo'sh qoldiring)
# API_SECRET_KEY=
"""

# All commands wrapped to fail fast.
STEPS = [
    ("Update apt", "set -e; export DEBIAN_FRONTEND=noninteractive; apt-get update -qq"),
    ("Install base packages", "set -e; export DEBIAN_FRONTEND=noninteractive; apt-get install -y -qq nginx curl ca-certificates gnupg build-essential ufw"),
    ("Add NodeSource repo (Node 20)", "set -e; curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null"),
    ("Install Node.js 20", "set -e; export DEBIAN_FRONTEND=noninteractive; apt-get install -y -qq nodejs && node -v && npm -v"),
    ("Install pm2 globally", "set -e; npm install -g pm2 --silent && pm2 -v"),
    ("Clone repo",
     f"set -e; mkdir -p /var/www; rm -rf {APP_DIR}; "
     f"git clone --depth 1 {REPO_URL} {APP_DIR} && cd {APP_DIR} && git rev-parse HEAD"),
    ("Write .env",
     f"cat > {APP_DIR}/.env <<'__ENV__'\n{ENV_FILE}__ENV__\nls -la {APP_DIR}/.env"),
    ("npm ci",
     f"set -e; cd {APP_DIR} && npm ci --no-audit --no-fund --loglevel=error 2>&1 | tail -10"),
    ("npm run build",
     f"set -e; cd {APP_DIR} && npm run build 2>&1 | tail -40"),
    ("Configure nginx site",
     "cat > /etc/nginx/sites-available/chinesewave <<'__NGINX__'\n" + NGINX_CONF + "__NGINX__\n"
     "rm -f /etc/nginx/sites-enabled/default; "
     "ln -sf /etc/nginx/sites-available/chinesewave /etc/nginx/sites-enabled/chinesewave; "
     "nginx -t && systemctl reload nginx && systemctl enable nginx"),
    ("Start app with pm2",
     f"set -e; cd {APP_DIR}; pm2 delete {APP_NAME} >/dev/null 2>&1 || true; "
     f"PORT={PORT} pm2 start npm --name {APP_NAME} -- start; "
     f"pm2 save; "
     f"pm2 startup systemd -u root --hp /root | tail -5"),
    ("Open firewall (if ufw active)",
     "ufw status | head -1; ufw allow 22/tcp >/dev/null 2>&1 || true; ufw allow 80/tcp >/dev/null 2>&1 || true; ufw allow 443/tcp >/dev/null 2>&1 || true"),
    ("Verify",
     f"sleep 3; curl -sS -o /dev/null -w 'HTTP %{{http_code}} via 127.0.0.1:{PORT}\\n' http://127.0.0.1:{PORT}/ ; "
     f"curl -sS -o /dev/null -w 'HTTP %{{http_code}} via nginx\\n' -H 'Host: chinesewave.uz' http://127.0.0.1/ ; "
     f"pm2 list"),
]


def run():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"[connect] {USER}@{HOST}")
    ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=30, banner_timeout=30)

    for label, cmd in STEPS:
        print(f"\n>>> {label}")
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=900, get_pty=False)
        out = stdout.read().decode(errors="replace")
        err = stderr.read().decode(errors="replace")
        rc = stdout.channel.recv_exit_status()
        if out.strip():
            print(out.rstrip())
        if err.strip():
            print("[stderr]", err.rstrip())
        if rc != 0:
            print(f"[FAIL rc={rc}]")
            ssh.close()
            sys.exit(rc)
        print(f"[ok rc=0]")

    ssh.close()
    print("\nDONE")


if __name__ == "__main__":
    run()
