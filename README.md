# VyuhStack example: static site (Vite + nginx)

A static site built with Vite and served by nginx. The page shows the commit it
was built from, so you can see each push go live.

Follow the steps in order: the VM setup in step 3 needs the files that Verify
clones in step 2.

## 1. Prepare the VM

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

## 2. Connect the repo in VyuhStack and Verify

On the VM's page in VyuhStack, open **Deploy from Git**, click
**Connect repository** and enter:

| Field | Value |
|---|---|
| Repository URL | `https://github.com/Vyuhstack/vyuhstack-example-static.git` |
| Branch | `main` |
| Folder on VM | `/opt/app` |
| Run as user | `vyuh-user` |
| Step 1: Build | `npm ci`<br>`npm run build` |
| Step 2: Release | leave empty |

Click **Save**, then **Verify**. Verify creates `/opt/app`, clones the repo into
it and checks the VM can pull from GitHub. The card then shows **Connected**.

The release step stays empty: nginx reads files from disk on every request, so
it serves the new `dist/` straight away. A reload is only needed when the nginx
config itself changes.

## 3. Point nginx at the build output

Now that the repo is in `/opt/app`, install its nginx config:

```bash
sudo cp /opt/app/deploy/nginx.conf /etc/nginx/sites-available/app
sudo ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

nginx runs as `www-data`, so the app folder must be readable by others. Verify
creates `/opt/app` with mode 755, which is enough. Until the first deploy builds
`dist/`, nginx shows an error page; that's expected.

Set the VM's application port in VyuhStack to `80`.

## 4. Deploy and check

Click **Deploy now**. The deploy goes Queued, Running, Success; expand the row to
see the log. Then open the VM's hostname: the page shows `Commit <sha>`, matching
the commit in the deploy row.

## 5. Deploy on every push

In GitHub, open the repo's **Settings**, **Webhooks**, **Add webhook**, and paste
the **Payload URL** and **Secret** from the **Auto-deploy on push** box on the
card. Set **Content type** to `application/json` and pick **Just the push event**.

Push a change (for example edit `index.html`). A new deploy with trigger **Push**
appears; click **Refresh** under Recent deploys to see it. When it finishes, the
page shows the new commit.

## 6. Try a failed build

Add a syntax error to `src/main.js` and push. The deploy fails at the build step
with the Vite error in the log.

Vite clears `dist/` at the start of a build, so a failed build can leave the
site empty until the next good deploy. For zero downtime, build into a new
folder and switch a symlink in the release step.
