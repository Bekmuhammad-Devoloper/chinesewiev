"""Check if old server still has the audio files."""
import paramiko, sys

HOST = "161.97.135.226"
USER = "root"
# Try same password first
PASS = "Yuksalish2026Bek"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=15, banner_timeout=15)
except Exception as e:
    print(f"CONNECT_FAIL: {type(e).__name__}: {e}")
    sys.exit(1)

probe = r"""
set +e
echo '=== /var/www listing ==='
ls /var/www 2>/dev/null
echo '=== look for chinesewave ==='
ls /var/www/chinesewave 2>/dev/null | head
echo '=== mp3 count any chinesewave dir ==='
find /var/www -name '*.mp3' -path '*chinesewave*' 2>/dev/null | head -5
find /var/www -name '*.mp3' -path '*chinese*' 2>/dev/null | wc -l
echo '=== sample lookup ==='
find /var/www -name '1775828672047*' 2>/dev/null | head
echo '=== check root home ==='
find /root -maxdepth 3 -name 'words' -type d 2>/dev/null
"""
stdin, stdout, stderr = ssh.exec_command(probe, timeout=60)
stdout.channel.settimeout(60)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
