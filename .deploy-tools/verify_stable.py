"""Verify all PM2 processes stayed up (not crash-looping)."""
import sys, time
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
echo '=== pm2 list ==='
pm2 list 2>&1 | tail -12
echo
echo '=== pm2 startup configured? ==='
systemctl is-enabled pm2-root 2>&1
"""

stdin, stdout, stderr = ssh.exec_command(cmds, timeout=120)
stdout.channel.settimeout(120)
stderr.channel.settimeout(120)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
