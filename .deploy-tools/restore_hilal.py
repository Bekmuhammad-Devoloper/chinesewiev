"""Restart hilal-bot stack: backend (3001), admin (4000), telegram bot."""
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
echo '=== ports already in use? ==='
ss -tlnp 2>/dev/null | grep -E ':(3001|4000)\b'
echo
echo '=== start hilal-backend (port 3001) ==='
cd /var/www/hilal-bot/backend && pm2 start dist/src/main.js --name hilal-backend 2>&1 | tail -10
echo
echo '=== start hilal-admin (port 4000) ==='
cd /var/www/hilal-bot/admin && pm2 start npm --name hilal-admin -- start 2>&1 | tail -10
echo
echo '=== start hilal-bot (telegram) ==='
cd /var/www/hilal-bot/bot && pm2 start dist/index.js --name hilal-bot 2>&1 | tail -10
echo
echo '=== save pm2 ==='
pm2 save 2>&1 | tail -5
echo
sleep 4
echo '=== final pm2 list ==='
pm2 list 2>&1
echo
echo '=== ports ==='
ss -tlnp 2>/dev/null | grep -E ':(3001|3002|4000)\b'
"""

stdin, stdout, stderr = ssh.exec_command(cmds, timeout=300)
stdout.channel.settimeout(300)
stderr.channel.settimeout(300)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
