"""Diagnose site slowness on the new server."""
import io
import sys
import paramiko

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=30, banner_timeout=30)

probe = r"""
set +e
echo '=== Load + uptime ==='
uptime
echo
echo '=== Memory ==='
free -h
echo
echo '=== CPU top ==='
top -bn1 | head -15
echo
echo '=== pm2 list ==='
pm2 list
echo
echo '=== pm2 logs (recent errors) ==='
pm2 logs chinesewave --nostream --err --lines 25 2>/dev/null
echo
echo '=== pm2 logs (recent stdout) ==='
pm2 logs chinesewave --nostream --out --lines 15 2>/dev/null
echo
echo '=== Local timing — homepage (uncached) ==='
for i in 1 2 3 4 5; do
  curl -sS -o /dev/null -w "  attempt $i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B | code=%{http_code}\n" http://127.0.0.1:3002/
done
echo
echo '=== Local timing — courses API ==='
for i in 1 2 3; do
  curl -sS -o /dev/null -w "  attempt $i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B | code=%{http_code}\n" http://127.0.0.1:3002/api/courses
done
echo
echo '=== Local timing — lesson page ==='
curl -sS -o /dev/null -w "  /courses/hsk-1/lessons/1: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B | code=%{http_code}\n" http://127.0.0.1:3002/courses/hsk-1/lessons/1
echo
echo '=== HTTPS via nginx timing ==='
for i in 1 2 3; do
  curl -sS -o /dev/null --resolve chinesewave.uz:443:127.0.0.1 -w "  attempt $i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B\n" https://chinesewave.uz/
done
echo
echo '=== Image opt timing (first hit + cache) ==='
IMG=/_next/image?url=%2Fassets%2Fcourse-1.png&w=640&q=75
curl -sS -o /dev/null -w "  first:  total=%{time_total}s | size=%{size_download}B\n" "http://127.0.0.1:3002${IMG}"
curl -sS -o /dev/null -w "  second: total=%{time_total}s | size=%{size_download}B\n" "http://127.0.0.1:3002${IMG}"
echo
echo '=== Disk usage ==='
df -h /
echo
echo '=== App data sizes ==='
du -sh /var/www/chinesewave/.next 2>/dev/null
du -sh /var/www/chinesewave/data 2>/dev/null
du -sh /var/www/chinesewave/public/assets 2>/dev/null
ls -la /var/www/chinesewave/data/courses-data.json 2>/dev/null
echo
echo '=== nginx access log tail ==='
tail -10 /var/log/nginx/access.log 2>/dev/null
echo
echo '=== nginx error log tail ==='
tail -10 /var/log/nginx/error.log 2>/dev/null
"""

stdin, stdout, stderr = ssh.exec_command(probe, timeout=180)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err[:1500])
ssh.close()
