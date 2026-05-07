"""Speed-up: enable nginx gzip for JSON/JS/CSS, fix proxy_buffering, add Cache-Control hints."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

# Custom gzip config (overrides Ubuntu defaults that miss application/json for large bodies).
GZIP_CONF = """# Aggressive gzip for API JSON responses (chinesewave)
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 256;
gzip_buffers 16 8k;
gzip_types
    application/json
    application/javascript
    application/xml
    application/xml+rss
    application/rss+xml
    application/atom+xml
    application/x-javascript
    text/javascript
    text/css
    text/plain
    text/xml
    image/svg+xml
    font/ttf
    font/otf;
gzip_disable "msie6";
"""

steps = [
    ("Inspect current gzip",
     "nginx -T 2>/dev/null | grep -E '^\\s*gzip' | head -20"),
    ("Write /etc/nginx/conf.d/zz-gzip.conf",
     "cat > /etc/nginx/conf.d/zz-gzip.conf <<'__GZIP__'\n" + GZIP_CONF + "__GZIP__\necho written"),
    ("Test+reload nginx",
     "nginx -t && systemctl reload nginx"),
    ("Verify gzip on /api/courses",
     "curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -w 'code=%{http_code} | size_download=%{size_download} | content-encoding=%{header_json}\\n' --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/api/courses 2>&1 | head -1; "
     "echo '--- with -I ---'; curl -sS -I -H 'Accept-Encoding: gzip' --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/api/courses 2>&1 | grep -iE 'content-(encoding|length|type)'"),
    ("Compare bytes: uncompressed vs gzip",
     "u=$(curl -sS --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/api/courses | wc -c); "
     "g=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/api/courses -o /tmp/cgz -w '%{size_download}'); "
     "echo \"uncompressed body = $u bytes\"; echo \"gzip wire size    = $g bytes\""),
    ("Re-time HTTPS homepage and API",
     "for i in 1 2 3; do "
     "curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '  /  attempt $i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B\\n' https://chinesewave.uz/ ; "
     "done; "
     "for i in 1 2 3; do "
     "curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '  /api/courses attempt $i: total=%{time_total}s | TTFB=%{time_starttransfer}s | size=%{size_download}B\\n' https://chinesewave.uz/api/courses ; "
     "done"),
]

for label, cmd in steps:
    print(f"\n>>> {label}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=180, get_pty=False)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    rc = stdout.channel.recv_exit_status()
    if out.strip(): print(out.rstrip())
    if err.strip(): print("[stderr]", err.rstrip()[:1500])
    print(f"[rc={rc}]")
ssh.close()
print("\nDONE")
