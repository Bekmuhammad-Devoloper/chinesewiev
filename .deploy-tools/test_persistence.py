"""End-to-end test: simulate an admin upload, run deploy, verify it survives.

Creates two marker files (one in data/, one in public/assets/) directly on the
server before deploy, runs the safe deploy, and confirms the markers are still
there afterward. If they survive, the snapshot/restore logic works.
"""
import sys
import time
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"
APP = "/var/www/chinesewave"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.settimeout(timeout)
    stderr.channel.settimeout(timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    return out, err

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30)

stamp = int(time.time())
marker_asset = f"{APP}/public/assets/_test_marker_{stamp}.txt"
marker_data = f"{APP}/data/_test_marker_{stamp}.json"

print(f"=== STEP 1: plant test markers (simulating admin upload) ===")
out, _ = run(ssh, f"echo 'admin uploaded at {stamp}' > {marker_asset} && echo '{{\"stamp\":{stamp}}}' > {marker_data} && ls -la {marker_asset} {marker_data}")
print(out)

print(f"=== STEP 2: also tweak a real data file (simulating courses-data edit) ===")
out, _ = run(ssh, f"cd {APP} && cp data/courses-data.json /tmp/_pre_deploy.json && stat --printf='before bytes=%s mtime=%Y\\n' data/courses-data.json")
print(out)

print(f"=== STEP 3: run safe deploy (git reset + restore) ===")
out, err = run(ssh, f"""
set -e
cd {APP}
STAMP=$(date +%s)
SNAP=/tmp/chinesewave-snap-$STAMP
mkdir -p $SNAP
cp -a {APP}/data $SNAP/data
cp -a {APP}/public/assets $SNAP/assets
git fetch origin main 2>&1 | tail -3
git reset --hard origin/main 2>&1 | tail -1
rm -rf {APP}/data && cp -a $SNAP/data {APP}/data
rm -rf {APP}/public/assets && cp -a $SNAP/assets {APP}/public/assets
rm -rf $SNAP
echo 'reset+restore done'
""", timeout=180)
print(out)
if err.strip(): print("ERR:", err)

print(f"=== STEP 4: verify markers still there ===")
out, _ = run(ssh, f"ls -la {marker_asset} {marker_data} 2>&1; echo ---; cat {marker_asset} 2>&1; cat {marker_data} 2>&1")
print(out)

print(f"=== STEP 5: verify courses-data.json untouched (same bytes/mtime as before) ===")
out, _ = run(ssh, f"stat --printf='after  bytes=%s mtime=%Y\\n' {APP}/data/courses-data.json && diff {APP}/data/courses-data.json /tmp/_pre_deploy.json && echo 'IDENTICAL' || echo 'DIFFERS'")
print(out)

print(f"=== STEP 6: cleanup test markers ===")
run(ssh, f"rm -f {marker_asset} {marker_data} /tmp/_pre_deploy.json")
print("cleaned up")

ssh.close()
