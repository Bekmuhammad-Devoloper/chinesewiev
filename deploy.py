import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('104.248.25.130', username='root', password='Yuksalish2026Bek')

commands = [
    'cd /var/www/chinesewave && git fetch origin main',
    'cd /var/www/chinesewave && git reset --hard origin/main',
    'cd /var/www/chinesewave && npm run build',
    'cd /var/www/chinesewave && pm2 restart chinesewave'
]

for cmd in commands:
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=300)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out)
    if err: print(err)

ssh.close()
print('\n✅ Deploy complete!')
