"""Probe server's actual courses-data.json contents and live API."""
import paramiko, sys

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=20)

probe = r"""
set +e
echo '=== git status (may show local server changes) ==='
cd /var/www/chinesewave && git status --short | head -30
echo
echo '=== file size + mtime of courses-data.json ==='
ls -la /var/www/chinesewave/data/courses-data.json
echo
echo '=== HSK 1 lesson count on server ==='
node -e "const d=require('/var/www/chinesewave/data/courses-data.json'); console.log('courses count:', d.length); d.forEach(c => console.log(c.slug, '| lessons:', c.lessons?.length || 0));"
echo
echo '=== Live API response from local server ==='
curl -s 'http://localhost:3002/api/lessons?slug=hsk-1' | head -c 500
echo
echo '=== Live API courses ==='
curl -s 'http://localhost:3002/api/courses' | python3 -c "import json,sys; d=json.load(sys.stdin); print('courses:', len(d)); [print(c.get('slug'), '|', c.get('title') or c.get('name'), '| lessons:', len(c.get('lessons') or [])) for c in d]"
echo
echo '=== DATA_DIR env in pm2 ==='
pm2 jlist | python3 -c "import json,sys; d=json.load(sys.stdin); cw=[p for p in d if p['name']=='chinesewave'][0]; env=cw['pm2_env']; print('DATA_DIR:', env.get('DATA_DIR')); print('NODE_ENV:', env.get('NODE_ENV'))"
"""
stdin, stdout, stderr = ssh.exec_command(probe, timeout=120)
stdout.channel.settimeout(120)
stderr.channel.settimeout(120)
print(stdout.read().decode(errors="replace"))
err = stderr.read().decode(errors="replace")
if err.strip():
    print("STDERR:", err)
ssh.close()
