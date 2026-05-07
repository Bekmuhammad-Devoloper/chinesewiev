"""Probe the new server: connectivity + already-installed software."""
import sys
import paramiko

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=20, banner_timeout=20)
except Exception as e:
    print(f"CONNECT_FAIL: {type(e).__name__}: {e}")
    sys.exit(1)

probe = r"""
set +e
echo '=== OS ==='; cat /etc/os-release 2>/dev/null | head -5
echo '=== UPTIME ==='; uptime
echo '=== DISK ==='; df -h / | tail -1
echo '=== MEM ==='; free -h | head -2
echo '=== CPU ==='; nproc
echo '=== node ==='; command -v node && node -v
echo '=== npm ==='; command -v npm && npm -v
echo '=== nginx ==='; command -v nginx && nginx -v 2>&1
echo '=== pm2 ==='; command -v pm2 && pm2 -v
echo '=== git ==='; command -v git && git --version
echo '=== port 80 ==='; ss -tlnp 2>/dev/null | grep -E ':80\b' || echo 'free'
echo '=== port 3002 ==='; ss -tlnp 2>/dev/null | grep -E ':3002\b' || echo 'free'
echo '=== /var/www ==='; ls -la /var/www 2>/dev/null || echo 'missing'
echo '=== nginx sites ==='; ls /etc/nginx/sites-enabled 2>/dev/null || echo 'missing'
"""

stdin, stdout, stderr = ssh.exec_command(probe, timeout=60)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
