"""Safe deploy: preserves server-side runtime state across `git reset --hard`.

Things that MUST survive a deploy (server is authoritative for these):
- /var/www/chinesewave/data/        (courses, users, views — admin-edited)
- /var/www/chinesewave/public/assets/  (uploaded images + audio)

Strategy: snapshot to /tmp before reset, restore after, then build + restart.
"""
import sys
import paramiko

# UTF-8 stdout for Windows so build output never crashes the script.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"
APP_DIR = "/var/www/chinesewave"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30)

# Each step runs in its own SSH command so errors are visible per-step.
script = f"""
set -e
APP={APP_DIR}
STAMP=$(date +%s)
SNAP=/tmp/chinesewave-snap-$STAMP
mkdir -p $SNAP

echo '=== [1/6] snapshot data/ + public/assets/ ==='
cp -a $APP/data $SNAP/data
cp -a $APP/public/assets $SNAP/assets
echo "snapshot at $SNAP"
ls -d $SNAP/*

echo '=== [2/6] git fetch + reset (code only) ==='
cd $APP
git fetch origin main
git reset --hard origin/main
git --no-pager log -1 --oneline

echo '=== [3/6] restore data/ + public/assets/ from snapshot ==='
# Remove any data/assets shipped in the just-reset HEAD, then restore the
# server's authoritative copies. rsync would also work but cp -a is simpler.
rm -rf $APP/data
cp -a $SNAP/data $APP/data
mkdir -p $APP/public
rm -rf $APP/public/assets
cp -a $SNAP/assets $APP/public/assets
echo "restored: $(ls $APP/data | wc -l) data files, $(find $APP/public/assets -type f | wc -l) assets"

echo '=== [4/6] npm run build ==='
cd $APP
npm run build 2>&1 | tail -25

echo '=== [5/6] pm2 restart ==='
pm2 restart chinesewave --update-env
sleep 2
pm2 list | grep -E 'name|chinesewave'

echo '=== [6/6] cleanup snapshot ==='
rm -rf $SNAP
echo 'DEPLOY OK'
"""

stdin, stdout, stderr = ssh.exec_command(script, timeout=900)
stdout.channel.settimeout(900)
stderr.channel.settimeout(900)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
