"""Probe audio file presence and pm2 cwd to diagnose 'audio not playing' issue."""
import paramiko

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=20)

probe = r"""
set +e
echo '=== repo public/assets/words mp3 count ==='
ls /var/www/chinesewave/public/assets/words/*.mp3 2>/dev/null | wc -l
echo '=== standalone public/assets/words mp3 count ==='
ls /var/www/chinesewave/.next/standalone/public/assets/words/*.mp3 2>/dev/null | wc -l
echo '=== sample file in repo dir ==='
ls -la /var/www/chinesewave/public/assets/words/1775828672047--.mp3 2>&1 | head -3
echo '=== sample file in standalone ==='
ls -la /var/www/chinesewave/.next/standalone/public/assets/words/1775828672047--.mp3 2>&1 | head -3
echo '=== package.json scripts ==='
grep -E '"(start|build|dev)"' /var/www/chinesewave/package.json | head -10
echo '=== ecosystem files ==='
ls /var/www/chinesewave/ecosystem* 2>/dev/null
echo '=== pm2 jlist (summary) ==='
pm2 jlist 2>/dev/null | python3 -c "import sys,json; data=json.load(sys.stdin); [print(p['name'], '|cwd:', p['pm2_env'].get('pm_cwd'), '|script:', p['pm2_env'].get('pm_exec_path'), '|args:', p['pm2_env'].get('args')) for p in data]" 2>&1 | head -20
"""

stdin, stdout, stderr = ssh.exec_command(probe, timeout=180)
stdout.channel.settimeout(180)
stderr.channel.settimeout(180)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
