import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('161.97.135.226', username='root', password='24680bek')

commands = [
    'cd /var/www/chinesewave && git pull origin main',
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
