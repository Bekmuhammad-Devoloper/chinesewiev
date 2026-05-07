"""Fix gzip config (no duplicate directives) and verify."""
import io, sys, paramiko
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.25.130", port=22, username="root", password="Yuksalish2026Bek", timeout=30)

# Only override what's needed; don't repeat `gzip on` (already in nginx.conf default).
GZIP_CONF = """# chinesewave: aggressive gzip for JSON/JS/CSS API responses
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 256;
gzip_buffers 16 8k;
gzip_types
    application/json
    application/javascript
    application/xml
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
"""

steps = [
    ("Show /etc/nginx/nginx.conf gzip block",
     "grep -n -A 0 -E '^\\s*gzip' /etc/nginx/nginx.conf"),
    ("Write fixed gzip override",
     "cat > /etc/nginx/conf.d/zz-gzip.conf <<'__GZIP__'\n" + GZIP_CONF + "__GZIP__\necho written"),
    ("Test+reload nginx",
     "nginx -t && systemctl reload nginx"),
    ("Verify response headers",
     "echo '--- /api/courses ---'; "
     "curl -sS -I -H 'Accept-Encoding: gzip,deflate,br' --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/api/courses 2>&1 | grep -iE 'HTTP|content-(encoding|length|type)'; "
     "echo '--- / ---'; "
     "curl -sS -I -H 'Accept-Encoding: gzip,deflate,br' --resolve chinesewave.uz:443:127.0.0.1 https://chinesewave.uz/ 2>&1 | grep -iE 'HTTP|content-(encoding|length|type)'"),
    ("Measure transferred bytes (compressed vs raw)",
     "echo '--- /api/courses ---'; "
     "raw=$(curl -sS --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}' https://chinesewave.uz/api/courses); "
     "gz=$(curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '%{size_download}' https://chinesewave.uz/api/courses); "
     "echo \"  raw  = $raw bytes\"; echo \"  gzip = $gz bytes\"; "
     "python3 -c \"r=$raw; g=$gz; print(f'  ratio: {g/r*100:.1f}% (saved {(r-g)/1024/1024:.1f} MB)')\""),
    ("Re-time API",
     "for i in 1 2 3; do "
     "curl -sS --compressed --resolve chinesewave.uz:443:127.0.0.1 -o /dev/null -w '  /api/courses #$i: total=%{time_total}s | TTFB=%{time_starttransfer}s | bytes=%{size_download}\\n' https://chinesewave.uz/api/courses ; "
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
