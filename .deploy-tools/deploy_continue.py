"""Continue deploy from build step (deploy.py crashed on Unicode in build output)."""
import sys
import paramiko

# Force UTF-8 stdout on Windows
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", username="root", password="Yuksalish2026Bek", timeout=30)

commands = [
    "cd /var/www/chinesewave && npm run build 2>&1 | tail -40",
    "cd /var/www/chinesewave && pm2 restart chinesewave",
    "pm2 status chinesewave 2>&1 | tail -10",
]

for cmd in commands:
    print(f"\n>>> {cmd}")
    sys.stdout.flush()
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=600)
    stdout.channel.settimeout(600)
    stderr.channel.settimeout(600)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out:
        print(out)
    if err:
        print("STDERR:", err)
    sys.stdout.flush()

ssh.close()
print("\n[DONE] Deploy complete")
