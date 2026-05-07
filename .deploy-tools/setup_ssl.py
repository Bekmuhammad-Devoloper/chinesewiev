"""Install certbot and provision Let's Encrypt SSL for chinesewave.uz and www."""
import io
import sys
import paramiko

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"
EMAIL = "bekmuhammad.devoloper@gmail.com"
DOMAINS = ["chinesewave.uz", "www.chinesewave.uz"]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print(f"[connect] {USER}@{HOST}")
ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=30, banner_timeout=30)

domain_args = " ".join(f"-d {d}" for d in DOMAINS)

steps = [
    ("Install certbot",
     "set -e; export DEBIAN_FRONTEND=noninteractive; apt-get update -qq && "
     "apt-get install -y -qq certbot python3-certbot-nginx"),
    ("Pre-check ports/DNS",
     "echo '--- listening ports ---'; ss -tlnp | grep -E ':(80|443)\\b' || true; "
     "echo '--- DNS A records ---'; "
     "for d in chinesewave.uz www.chinesewave.uz; do echo \"$d -> $(dig +short $d A | tr '\\n' ' ')\"; done"),
    ("Provision certificate (nginx plugin, redirect HTTP->HTTPS)",
     f"certbot --nginx {domain_args} --non-interactive --agree-tos -m {EMAIL} --redirect 2>&1 | tail -40"),
    ("Reload nginx",
     "nginx -t && systemctl reload nginx"),
    ("Show new vhost",
     "cat /etc/nginx/sites-available/chinesewave"),
    ("Verify",
     "echo '--- listening ports ---'; ss -tlnp | grep -E ':(80|443)\\b' || true; "
     "echo '--- HTTP (should redirect 301) ---'; curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}\\n' http://chinesewave.uz/ ; "
     "echo '--- HTTPS ---'; curl -sS -o /dev/null -w '%{http_code} | %{ssl_verify_result} | %{time_total}s\\n' https://chinesewave.uz/ ; "
     "echo '--- HTTPS www ---'; curl -sS -o /dev/null -w '%{http_code}\\n' https://www.chinesewave.uz/ ; "
     "echo '--- cert info ---'; echo | openssl s_client -servername chinesewave.uz -connect chinesewave.uz:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates"),
    ("Setup auto-renewal timer",
     "systemctl enable --now certbot.timer 2>&1; systemctl status certbot.timer --no-pager | head -5"),
]

for label, cmd in steps:
    print(f"\n>>> {label}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=600, get_pty=False)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    rc = stdout.channel.recv_exit_status()
    if out.strip():
        print(out.rstrip())
    if err.strip():
        print("[stderr]", err.rstrip()[:2000])
    print(f"[rc={rc}]")
    if rc != 0 and label.startswith(("Install", "Provision", "Reload")):
        print("[FAIL — stopping]")
        ssh.close()
        sys.exit(rc)

ssh.close()
print("\nDONE")
