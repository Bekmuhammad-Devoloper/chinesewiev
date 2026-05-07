"""Extract base64 images from courses-data.json contentHtml into /assets/extracted/.
Runs ON the server (uploaded via SSH). Replaces data: URLs with file URLs in-place.
"""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

# Server-side migration script
remote_script = r'''
set -e
APP=/var/www/chinesewave
DATA=$APP/data/courses-data.json
EXTRACT=$APP/public/assets/extracted

# Backup
cp -n $DATA ${DATA}.bak.$(date +%s) 2>/dev/null || true
ls -la ${DATA}*

mkdir -p $EXTRACT

python3 - <<'PY'
import json, re, base64, hashlib, os

DATA = '/var/www/chinesewave/data/courses-data.json'
EXTRACT_DIR = '/var/www/chinesewave/public/assets/extracted'
URL_PREFIX = '/assets/extracted'

print(f'[load] {DATA}')
with open(DATA, 'r', encoding='utf-8') as f:
    d = json.load(f)
orig_size = os.path.getsize(DATA)
print(f'[size before] {orig_size:,} bytes ({orig_size/1024/1024:.2f} MB)')

mime_to_ext = {
    'image/png':'png','image/jpeg':'jpg','image/jpg':'jpg',
    'image/gif':'gif','image/webp':'webp','image/svg+xml':'svg',
    'image/x-emf':'emf','image/wmf':'wmf','image/bmp':'bmp',
}

# Pattern matches: data:<mime>;base64,<payload>  (payload allowed chars + may include = padding)
DATA_URL = re.compile(r'data:([\w./+\-]+);base64,([A-Za-z0-9+/=\s]+?)(?=["\'\s)>]|$)', re.DOTALL)

stats = {'extracted': 0, 'reused': 0, 'unknown_mime': 0, 'fields_changed': 0, 'bytes_freed': 0}
seen_hashes = {}  # hash -> filename

def replace_in_html(html: str) -> str:
    def sub(m):
        mime = m.group(1).lower().strip()
        b64_blob = re.sub(r'\s+', '', m.group(2))
        try:
            raw = base64.b64decode(b64_blob, validate=False)
        except Exception:
            return m.group(0)
        if not raw:
            return m.group(0)
        ext = mime_to_ext.get(mime)
        if not ext:
            stats['unknown_mime'] += 1
            print(f'  [warn] unknown mime: {mime}')
            return m.group(0)
        h = hashlib.sha256(raw).hexdigest()[:16]
        fname = f'{h}.{ext}'
        if h in seen_hashes:
            stats['reused'] += 1
        else:
            path = os.path.join(EXTRACT_DIR, fname)
            with open(path, 'wb') as out:
                out.write(raw)
            seen_hashes[h] = fname
            stats['extracted'] += 1
        stats['bytes_freed'] += len(m.group(0)) - len(URL_PREFIX) - 1 - len(fname)
        return f'{URL_PREFIX}/{fname}'
    new = DATA_URL.sub(sub, html)
    return new

def walk(o):
    if isinstance(o, dict):
        for k, v in list(o.items()):
            if k == 'contentHtml' and isinstance(v, str) and 'data:image' in v:
                new = replace_in_html(v)
                if new != v:
                    o[k] = new
                    stats['fields_changed'] += 1
            else:
                walk(v)
    elif isinstance(o, list):
        for v in o:
            walk(v)

walk(d)
print(f'[stats] {stats}')

with open(DATA + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False)
os.replace(DATA + '.tmp', DATA)

new_size = os.path.getsize(DATA)
print(f'[size after]  {new_size:,} bytes ({new_size/1024/1024:.2f} MB)')
print(f'[saved]       {(orig_size-new_size):,} bytes ({(orig_size-new_size)/1024/1024:.2f} MB)')

# Show extracted directory size
total = sum(os.path.getsize(os.path.join(EXTRACT_DIR, f)) for f in os.listdir(EXTRACT_DIR) if os.path.isfile(os.path.join(EXTRACT_DIR, f)))
n = len(os.listdir(EXTRACT_DIR))
print(f'[extracted]   {n} files, {total:,} bytes ({total/1024/1024:.2f} MB) in {EXTRACT_DIR}')
PY

echo ''
echo '=== File listing (sample) ==='
ls -la $EXTRACT | head -10
'''

stdin, stdout, stderr = ssh.exec_command(remote_script, timeout=600, get_pty=False)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip(): print("STDERR:", err.rstrip()[:2000])
ssh.close()
