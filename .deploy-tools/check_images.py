"""Check image fields for every course and lesson; verify file existence on disk."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

cmd = r"""
python3 - <<'PY'
import json, os
APP='/var/www/chinesewave'
with open(f'{APP}/data/courses-data.json') as f:
    d = json.load(f)

print('=== COURSE IMAGES ===')
for c in d:
    img = c.get('image', '')
    pub = c.get('published', True)
    exists = '?'
    if img and img.startswith('/'):
        path = APP + '/public' + img
        exists = 'OK' if os.path.exists(path) else 'MISSING'
    elif not img:
        exists = 'EMPTY'
    print(f"  [{('Y' if pub != False else 'N')}] {c['slug']:<30} title={c['title']!r:<25} image={img!r:<60} -> {exists}")

print()
print('=== LESSON IMAGES (only set ones, by course) ===')
for c in d:
    lessons_with_imgs = [l for l in c.get('lessons', []) if l.get('image','').strip()]
    if not lessons_with_imgs:
        continue
    print(f"  {c['slug']}:")
    for l in lessons_with_imgs[:5]:
        img = l['image']
        path = APP + '/public' + img if img.startswith('/') else None
        exists = 'OK' if path and os.path.exists(path) else ('MISSING' if path else 'NON-LOCAL')
        print(f"    lesson {l.get('id'):<3} {l.get('name','?')[:25]:<25} image={img:<55} -> {exists}")
    if len(lessons_with_imgs) > 5:
        print(f"    ... and {len(lessons_with_imgs)-5} more")
PY
"""
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60, get_pty=False)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip(): print("STDERR:", err.rstrip()[:1500])
ssh.close()
