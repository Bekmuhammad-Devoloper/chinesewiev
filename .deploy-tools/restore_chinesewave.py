"""Restart chinesewave under PM2 (port 3002)."""
import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", username="root", password="Yuksalish2026Bek", timeout=30)

cmds = r"""
set +e
echo '=== port 3002 already in use? ==='
ss -tlnp 2>/dev/null | grep ':3002\b'
echo
echo '=== check existing build ==='
ls /var/www/chinesewave/.next/BUILD_ID 2>&1
echo
echo '=== start chinesewave (port 3002) ==='
cd /var/www/chinesewave && PORT=3002 pm2 start npm --name chinesewave -- start 2>&1 | tail -25
echo
echo '=== save pm2 config ==='
pm2 save 2>&1 | tail -5
echo
echo '=== status ==='
pm2 list 2>&1 | head -20
"""

stdin, stdout, stderr = ssh.exec_command(cmds, timeout=300)
stdout.channel.settimeout(300)
stderr.channel.settimeout(300)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
