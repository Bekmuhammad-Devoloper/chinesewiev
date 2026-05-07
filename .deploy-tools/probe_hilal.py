"""Inspect hilal-bot stack to plan restart."""
import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", username="root", password="Yuksalish2026Bek", timeout=30)

probe = r"""
set +e
echo '=== /var/www/hilal-bot tree (top 2 levels) ==='
ls -la /var/www/hilal-bot/ 2>&1
echo
echo '=== backend dir ==='
ls /var/www/hilal-bot/backend 2>&1
echo
echo '=== backend dist exists? ==='
ls /var/www/hilal-bot/backend/dist/src/main.js 2>&1
echo '=== backend package.json scripts ==='
grep -E '"(start|build|dev|main)"' /var/www/hilal-bot/backend/package.json 2>&1 | head
echo
echo '=== admin dir ==='
ls /var/www/hilal-bot/admin 2>&1 | head -20
echo '=== admin .next exists? ==='
ls /var/www/hilal-bot/admin/.next/BUILD_ID 2>&1
echo '=== admin package.json scripts ==='
grep -E '"(start|build|dev)"' /var/www/hilal-bot/admin/package.json 2>&1 | head
echo
echo '=== bot dir ==='
ls /var/www/hilal-bot/bot 2>&1 | head -20
echo '=== bot dist exists? ==='
ls /var/www/hilal-bot/bot/dist/index.js 2>&1
echo '=== bot package.json scripts ==='
grep -E '"(start|build|dev|main)"' /var/www/hilal-bot/bot/package.json 2>&1 | head
echo
echo '=== nginx hilal-bot site config ==='
cat /etc/nginx/sites-enabled/hilal-bot 2>&1 | grep -E 'proxy_pass|listen|server_name' | head -20
echo
echo '=== .env presence (shows files but not contents) ==='
ls /var/www/hilal-bot/backend/.env /var/www/hilal-bot/admin/.env /var/www/hilal-bot/bot/.env 2>&1
echo
echo '=== node_modules presence ==='
[ -d /var/www/hilal-bot/backend/node_modules ] && echo "backend: yes" || echo "backend: NO"
[ -d /var/www/hilal-bot/admin/node_modules ] && echo "admin: yes" || echo "admin: NO"
[ -d /var/www/hilal-bot/bot/node_modules ] && echo "bot: yes" || echo "bot: NO"
"""

stdin, stdout, stderr = ssh.exec_command(probe, timeout=180)
stdout.channel.settimeout(180)
stderr.channel.settimeout(180)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
