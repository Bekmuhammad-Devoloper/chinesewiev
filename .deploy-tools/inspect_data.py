"""Inspect what's making courses-data.json so heavy."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

cmd = r"""
python3 - <<'PY'
import json
with open('/var/www/chinesewave/data/courses-data.json') as f:
    d = json.load(f)
print(f"Total courses: {len(d)}")
total_size = 0
for c in d:
    s = len(json.dumps(c, ensure_ascii=False))
    total_size += s
    lessons = c.get('lessons', [])
    print(f"\n  {c['slug']}: {s:,} bytes, {len(lessons)} lessons")
    for l in lessons[:3]:
        ls = len(json.dumps(l, ensure_ascii=False))
        words = l.get('words', [])
        sections = l.get('sections', [])
        tasks = l.get('tasks', [])
        # find heavy sections
        heavy_secs = []
        for sec in sections:
            for child in sec.get('children', []) or []:
                if child.get('contentHtml'):
                    heavy_secs.append(f"{sec['type']}/{child.get('id','?')}: {len(child['contentHtml']):,}")
        print(f"    [{l.get('id','?')}] {l.get('name','?')}: {ls:,}B  | words={len(words)} sections={len(sections)} tasks={len(tasks)} | heavy: {heavy_secs[:5]}")
    if len(lessons) > 3:
        print(f"    ... and {len(lessons)-3} more lessons")

print(f"\nTotal: {total_size:,} bytes ({total_size/1024/1024:.1f} MB)")

# Find biggest contentHtml fields anywhere
biggest = []
def walk(obj, path=''):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == 'contentHtml' and isinstance(v, str):
                biggest.append((len(v), path + '/' + k))
            else:
                walk(v, path + '/' + str(k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, path + f'[{i}]')
walk(d)
biggest.sort(reverse=True)
print(f"\nTop 5 contentHtml fields by size:")
for size, path in biggest[:5]:
    print(f"  {size:>12,} B  {path}")
PY
"""

stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err[:1000])
ssh.close()
