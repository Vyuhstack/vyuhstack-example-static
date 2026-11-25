# VyuhStack example: static site (Vite + nginx)

A static site built with Vite and served by nginx. The page shows the commit it
was built from, so you can see each push go live.

## One-time VM setup

Run on the VM with sudo:

```bash
apt update && apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs

# deploys run as vyuh-user in a non-interactive shell: this must print a path
runuser -l vyuh-user -c 'command -v npm && node -v'
```

Then connect the repo in VyuhStack (settings below) and click **Verify**, which
clones it into `/opt/app`. After that, point nginx at the build output:

```bash
cp /opt/app/deploy/nginx.conf /etc/nginx/sites-available/app
ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

nginx runs as `www-data`, so the app folder must be readable by others. Verify
creates `/opt/app` with mode 755, which is enough.

## Deploy from Git settings

| Field | Value |
|---|---|
| Repository URL | `https://github.com/Vyuhstack/vyuhstack-example-static.git` |
| Branch | `main` |
| Folder on VM | `/opt/app` |
| Run as user | `vyuh-user` |
| Build | `npm ci`<br>`npm run build` |
| Release | leave empty (nginx serves the new `dist/` files straight away) |

Application port in VyuhStack: `80`.

## Check it

Open the VM's hostname. The page shows `Commit <sha>`. Push a change and the
commit updates after the deploy finishes.

## Try a failed build

Add a syntax error to `src/main.js` and push. The deploy fails at the build
step; note that Vite clears `dist/` at the start of a build, so a failed build
can leave the site empty. For zero downtime, build into a new folder and switch
a symlink in the release step.
