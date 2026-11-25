# VyuhStack example: static site (Vite + nginx)

A static site built with Vite and served by nginx. The page shows the commit it
was built from, so you can see each push go live.

## One-time VM setup

Run on the VM as a user with sudo (for example `vyuh-user`):

```bash
sudo apt update && sudo apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs

# deploys run as vyuh-user in a non-interactive shell: this must print a path
sudo runuser -l vyuh-user -c 'command -v npm && node -v'
```

Put `sudo` on `bash`, not on `curl`: the setup script must run as root to add the
NodeSource repository. If `node -v` shows v18 and `npm` is missing, Ubuntu's own
Node package got installed instead; remove it with
`sudo apt remove -y nodejs libnode109 nodejs-doc` and run the two lines again.

Then connect the repo in VyuhStack (settings below) and click **Verify**, which
clones it into `/opt/app`. After that, point nginx at the build output:

```bash
sudo cp /opt/app/deploy/nginx.conf /etc/nginx/sites-available/app
sudo ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
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
