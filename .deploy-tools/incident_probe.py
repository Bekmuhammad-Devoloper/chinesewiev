"""Investigate what was deleted/broken on the server after partner's actions."""
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
echo '=== /var/www listing ==='
ls -la /var/www 2>&1
echo
echo '=== /var/www/chinesewave ==='
ls -la /var/www/chinesewave 2>&1 | head -20
echo
echo '=== /var/www/hilal-bot ==='
ls -la /var/www/hilal-bot 2>&1 | head -20
echo
echo '=== chinesewave git status & remote ==='
cd /var/www/chinesewave 2>/dev/null && git remote -v 2>&1 && git status --short 2>&1 | head -10 && git log --oneline -3 2>&1
echo
echo '=== hilal-bot/backend git ==='
cd /var/www/hilal-bot/backend 2>/dev/null && git remote -v 2>&1 && git log --oneline -3 2>&1
echo
echo '=== hilal-bot/admin git ==='
cd /var/www/hilal-bot/admin 2>/dev/null && git remote -v 2>&1 && git log --oneline -3 2>&1
echo
echo '=== hilal-bot/bot git ==='
cd /var/www/hilal-bot/bot 2>/dev/null && git remote -v 2>&1 && git log --oneline -3 2>&1
echo
echo '=== pm2 processes ==='
pm2 jlist 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); [print(p['name'], '|', p['pm2_env'].get('status'), '|cwd:', p['pm2_env'].get('pm_cwd'), '|exec:', p['pm2_env'].get('pm_exec_path'), '|restarts:', p['pm2_env'].get('restart_time')) for p in d]"
echo
echo '=== nginx status ==='
systemctl is-active nginx 2>&1
echo
echo '=== nginx sites enabled ==='
ls /etc/nginx/sites-enabled/ 2>&1
echo
echo '=== nginx config test ==='
nginx -t 2>&1
echo
echo '=== ports listening ==='
ss -tlnp 2>/dev/null | grep -E ':(80|443|3000|3001|3002|3003|4000)\b' | head -20
echo
echo '=== disk usage ==='
df -h / | tail -1
echo
echo '=== recent server logs (auth+pm2) ==='
journalctl -u nginx --since '6 hours ago' 2>&1 | tail -10
echo '--- pm2 logs of chinesewave (last 30 lines) ---'
pm2 logs chinesewave --lines 30 --nostream 2>&1 | tail -40
"""

stdin, stdout, stderr = ssh.exec_command(probe, timeout=180)
stdout.channel.settimeout(180)
stderr.channel.settimeout(180)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
