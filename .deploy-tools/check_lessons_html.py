"""Verify lesson images in the rendered public HTML."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

cmd = r"""
echo '=== Image refs in /courses/hsk-1/lessons HTML ==='
curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/courses/hsk-1/lessons | grep -oE '/assets/[^"]+' | sort -u | head -20

echo ''
echo '=== Are they served? Pick first ==='
img=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/courses/hsk-1/lessons | grep -oE '/assets/177[0-9]+[^"]+\.(png|jpg|webp)' | head -1)
echo "  testing: $img"
curl -sS -I --resolve chinesewave.uz:443:127.0.0.1 "https://chinesewave.uz$img" 2>&1 | grep -iE 'HTTP|Content-Type|Content-Length'

echo ''
echo '=== Images on Hsk 4 lessons (course-1775828345029) ==='
curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 'https://chinesewave.uz/courses/course-1775828345029/lessons' | grep -oE '/assets/[^"]+' | sort -u | head -10

echo ''
echo '=== course-3.png (default seed) exists? ==='
ls -la /var/www/chinesewave/public/assets/course-*.png 2>/dev/null
"""
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60, get_pty=False)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip(): print("STDERR:", err.rstrip()[:1500])
ssh.close()
