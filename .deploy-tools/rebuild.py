"""Rebuild Next.js so SSG pages use the slimmer JSON, then restart pm2 and measure."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

steps = [
    ("Rebuild app",
     "cd /var/www/chinesewave && npm run build 2>&1 | tail -20"),
    ("Restart pm2",
     "pm2 restart chinesewave --update-env"),
    ("Wait & verify pm2",
     "sleep 5 && pm2 list && curl -sS -o /dev/null -w 'local 127.0.0.1:3002 = %{http_code}\\n' http://127.0.0.1:3002/"),
    ("Page sizes & timings (compressed via nginx)",
     "for path in / /courses/hsk-1/lessons /courses/hsk-1/lessons/1 /courses/hsk-1/lessons/2 /courses/hsk-2/lessons/1 /admin /api/courses; do "
     "result=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}|%{time_total}|%{time_starttransfer}|%{http_code}' \"https://chinesewave.uz${path}\"); "
     "echo \"  ${path}  →  size=$(echo $result | cut -d'|' -f1)B  total=$(echo $result | cut -d'|' -f2)s  TTFB=$(echo $result | cut -d'|' -f3)s  http=$(echo $result | cut -d'|' -f4)\"; "
     "done"),
    ("Sample lesson HTML head",
     "curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/courses/hsk-1/lessons/1 | grep -oE 'data:image/[^\"]{0,40}' | head -5; "
     "echo '---'; "
     "curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/courses/hsk-1/lessons/1 | grep -oE '/assets/extracted/[a-f0-9]+\\.[a-z]+' | head -5"),
    ("Verify one extracted image is served",
     "FIRST=$(ls /var/www/chinesewave/public/assets/extracted/ | head -1); "
     "curl -sS -I --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/assets/extracted/$FIRST | grep -iE 'HTTP|Content-(Type|Length)|Cache-Control'"),
]

for label, cmd in steps:
    print(f"\n>>> {label}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=900, get_pty=False)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    rc = stdout.channel.recv_exit_status()
    if out.strip(): print(out.rstrip())
    if err.strip(): print("[stderr]", err.rstrip()[:2000])
    print(f"[rc={rc}]")
ssh.close()
print("\nDONE")
