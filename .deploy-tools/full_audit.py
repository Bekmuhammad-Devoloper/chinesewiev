"""Comprehensive audit: page sizes, timings, and look for base64 images in lesson HTML."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

cmd = r"""
echo '=== Page sizes & timings (compressed via nginx) ==='
for path in / /courses/hsk-1/lessons /courses/hsk-1/lessons/1 /courses/hsk-1/lessons/2 /courses/hsk-2/lessons/1 /admin; do
  result=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w "%{size_download}|%{time_total}|%{time_starttransfer}|%{http_code}|%{size_header}" "https://chinesewave.uz${path}")
  echo "  ${path}: $result"
done

echo ''
echo '=== Top heavy contentHtml — base64 image scan ==='
python3 - <<'PY'
import json, re
with open('/var/www/chinesewave/data/courses-data.json') as f:
    d = json.load(f)
# Find biggest contentHtml & analyze
biggest = []
def walk(o, p=''):
    if isinstance(o, dict):
        for k,v in o.items():
            if k == 'contentHtml' and isinstance(v, str):
                biggest.append((len(v), p+'/'+k, v))
            else:
                walk(v, p+'/'+str(k))
    elif isinstance(o, list):
        for i,v in enumerate(o):
            walk(v, p+f'[{i}]')
walk(d)
biggest.sort(reverse=True)
print(f'Total contentHtml fields: {len(biggest)}')
total_size = sum(s for s,_,_ in biggest)
total_b64 = 0
total_b64_count = 0
for s, path, html in biggest:
    # Find base64 images
    b64s = re.findall(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+', html)
    b64_size = sum(len(b) for b in b64s)
    total_b64 += b64_size
    total_b64_count += len(b64s)
print(f'Total contentHtml size: {total_size:,} bytes ({total_size/1024/1024:.1f} MB)')
print(f'Total base64 image data: {total_b64:,} bytes ({total_b64/1024/1024:.1f} MB) across {total_b64_count} images')
print(f'Base64 share of contentHtml: {total_b64/total_size*100:.1f}%')

print()
print('Top 5 biggest contentHtml fields:')
for s, path, html in biggest[:5]:
    b64s = re.findall(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+', html)
    b64_size = sum(len(b) for b in b64s)
    print(f'  {s:>10,}B  {len(b64s)} images = {b64_size:,}B  {path[:80]}')
PY

echo ''
echo '=== /api/lessons?slug=hsk-1 size ==='
raw=$(curl -sS --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}' 'https://chinesewave.uz/api/lessons?slug=hsk-1')
gz=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}' 'https://chinesewave.uz/api/lessons?slug=hsk-1')
echo "  raw  = $raw"
echo "  gzip = $gz"

echo ''
echo '=== Lesson page first paragraph (truncated) ==='
curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/courses/hsk-1/lessons/1 | head -c 500
"""
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=300, get_pty=False)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip(): print("STDERR:", err[:1500])
ssh.close()
