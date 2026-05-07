"""Safe deploy: preserves untracked uploads (admin-uploaded files since last deploy)."""
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
cd /var/www/chinesewave || exit 1

echo '=== untracked files BEFORE deploy (these MUST survive) ==='
git status --short | grep -E '^\?\?' | wc -l

echo '=== fetch + reset (preserves untracked) ==='
git fetch origin main 2>&1 | tail -5
git reset --hard origin/main 2>&1 | tail -3

echo '=== untracked files AFTER reset (should be unchanged count) ==='
git status --short | grep -E '^\?\?' | wc -l

echo '=== build ==='
npm run build 2>&1 | tail -8

echo '=== restart ==='
pm2 restart chinesewave 2>&1 | tail -3
sleep 2
pm2 list | grep -E 'name|chinesewave'
"""

stdin, stdout, stderr = ssh.exec_command(cmds, timeout=600)
stdout.channel.settimeout(600)
stderr.channel.settimeout(600)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
