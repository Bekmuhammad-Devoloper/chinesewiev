"""Pull server's `data/` (courses, users, views) into local `data/`.

When to run:
- before making local code changes that touch the data shape
- as a periodic backup (the local working tree becomes a snapshot of prod)

Server is authoritative for `data/*.json`. Deploys preserve them in place.
This script just brings the local tree in sync for dev/backup purposes.
"""
import os
import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = "104.248.25.130"
USER = "root"
PASS = "Yuksalish2026Bek"
REMOTE_DATA = "/var/www/chinesewave/data"
LOCAL_DATA = os.path.join(os.path.dirname(__file__), "data")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30)
sftp = ssh.open_sftp()

os.makedirs(LOCAL_DATA, exist_ok=True)
remote_files = sftp.listdir(REMOTE_DATA)
print(f"server has {len(remote_files)} files in data/")

for name in remote_files:
    rpath = f"{REMOTE_DATA}/{name}"
    lpath = os.path.join(LOCAL_DATA, name)
    try:
        st = sftp.stat(rpath)
        sftp.get(rpath, lpath)
        print(f"  pulled {name:30s} {st.st_size:>12} bytes")
    except Exception as e:
        print(f"  SKIP {name}: {e}")

sftp.close()
ssh.close()
print("DONE")
