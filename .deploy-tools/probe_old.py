"""Probe the OLD server to confirm reachability and inventory the data we need to migrate."""
import io
import sys
import paramiko

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

OLD_HOST = "161.97.135.226"
OLD_USER = "root"
OLD_PASS = "24680bek"  # from old deploy.py

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(OLD_HOST, port=22, username=OLD_USER, password=OLD_PASS, timeout=20, banner_timeout=20)
except Exception as e:
    print(f"CONNECT_FAIL: {type(e).__name__}: {e}")
    sys.exit(1)

probe = r"""
set +e
echo '=== OS ==='; cat /etc/os-release 2>/dev/null | head -3
echo '=== /var/www ==='; ls -la /var/www 2>/dev/null
APP=/var/www/chinesewave
if [ -d "$APP" ]; then
  echo "=== $APP ==="; ls -la "$APP"
  echo '=== data/ ==='; ls -la "$APP/data" 2>/dev/null
  echo '=== data sizes ==='; du -sb "$APP/data"/* 2>/dev/null
  echo '=== assets count ==='; ls "$APP/public/assets" 2>/dev/null | wc -l
  echo '=== assets size ==='; du -sh "$APP/public/assets" 2>/dev/null
  echo '=== assets/words count ==='; ls "$APP/public/assets/words" 2>/dev/null | wc -l
  echo '=== assets/words size ==='; du -sh "$APP/public/assets/words" 2>/dev/null
  echo '=== courses-data mtime ==='; stat -c '%y  %s bytes' "$APP/data/courses-data.json" 2>/dev/null
  echo '=== users-data mtime ==='; stat -c '%y  %s bytes' "$APP/data/users-data.json" 2>/dev/null
  echo '=== views mtime ==='; stat -c '%y  %s bytes' "$APP/data/views.json" 2>/dev/null
  echo '=== users count ==='; if [ -f "$APP/data/users-data.json" ]; then python3 -c "import json; d=json.load(open('$APP/data/users-data.json')); print(len(d) if isinstance(d,list) else 'not a list')" 2>/dev/null; fi
  echo '=== courses summary ==='; python3 -c "import json; d=json.load(open('$APP/data/courses-data.json')); print(len(d),'courses'); [print(c['slug'], len(c.get('lessons',[])),'lessons', sum(1 for l in c.get('lessons',[]) if not l.get('locked',True)),'unlocked') for c in d]" 2>/dev/null
fi
echo '=== nginx site ==='; cat /etc/nginx/sites-enabled/* 2>/dev/null | head -20
echo '=== pm2 ==='; pm2 list 2>/dev/null | head -10
"""

stdin, stdout, stderr = ssh.exec_command(probe, timeout=60)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err[:1000])
ssh.close()
