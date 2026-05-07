"""Measure /api/courses size + timing after slim patch."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

cmd = r"""
echo '=== /api/courses (post-slim) ==='
raw=$(curl -sS --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}' https://chinesewave.uz/api/courses)
gz=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}' https://chinesewave.uz/api/courses)
echo "  uncompressed = $raw bytes"
echo "  gzipped wire = $gz bytes"

echo ''
echo '=== Timing (3 runs each, compressed) ==='
for i in 1 2 3; do
  curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w "  /api/courses #$i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B\n" https://chinesewave.uz/api/courses
done

echo ''
echo '=== Homepage timing ==='
for i in 1 2 3; do
  curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w "  / #$i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B\n" https://chinesewave.uz/
done

echo ''
echo '=== Sample (slim) — first course summary ==='
curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/api/courses | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'courses: {len(d)}')
for c in d[:3]:
    has_sections = any('sections' in (l or {}) for l in c.get('lessons', []))
    print(f\"  {c['slug']}: {len(c.get('lessons',[]))} lessons | sections present: {has_sections}\")
"
"""
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=180)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip(): print("STDERR:", err[:1000])
ssh.close()
