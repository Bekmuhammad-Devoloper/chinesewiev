"""Restore PM2 processes after partner wiped them."""
import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", username="root", password="Yuksalish2026Bek", timeout=30)

step1 = r"""
set +e
echo '=== existing pm2 dump file ==='
ls -la /root/.pm2/dump.pm2* 2>&1
echo
echo '=== try pm2 resurrect ==='
pm2 resurrect 2>&1 | tail -20
echo
echo '=== pm2 list after resurrect ==='
pm2 list 2>&1
"""

print(">>> Step 1: try pm2 resurrect")
sys.stdout.flush()
stdin, stdout, stderr = ssh.exec_command(step1, timeout=300)
stdout.channel.settimeout(300)
stderr.channel.settimeout(300)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
