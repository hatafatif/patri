# Patri recorder on Oracle Cloud

The recorder is `server.js` running 24/7 on an Oracle VM. It keeps one live feed socket open and records every train's positions and station passes into SQLite (90 days). The Vercel API reads only recorded history from it (the speed chart and actual passing times), when a Train page opens, cached for a minute; live positions still come straight from the Pakistan Railways feed. If the recorder is down, the app simply shows no history. It is served at https://patri-monitor.hataf.dev.

The VM is a general-purpose machine shared with other projects, so the scripts only add what is missing (see "Shared machine" below).

You need: this repo on your PC with a working `.env` (it holds `PAKRAIL_API_KEY`), `ssh`, `rsync`, `curl` and `openssl`.

## 1. Oracle account

1. Go to https://www.oracle.com/cloud/free/ and click **Start for free**. A card is needed for identity checks.
2. Choose your **home region** carefully: it is permanent, and Always Free VMs can only be created there.
3. Upgrade to **Pay As You Go** (Billing in the console). Always Free resources stay $0, and it avoids idle reclaim of free VMs.
4. Set a budget alert: **Billing > Budgets > Create budget**, $1, with an email alert.

## 2. Create the VM

1. **Compute > Instances > Create instance**.
2. **Image**: Canonical **Ubuntu 24.04**.
3. **Shape**: prefer **Ampere > VM.Standard.A1.Flex** (Arm), for example 2 OCPU and 12 GB. If it says "out of capacity", fall back to **VM.Standard.E2.1.Micro** (AMD, small).
4. **Networking**: keep the default new VCN and public subnet, with **Assign a public IPv4 address** on. If that option is greyed out, create the VM anyway and add the address afterwards: **Attached VNICs > (the VNIC) > IPv4 Addresses > Edit > Ephemeral public IP**.
5. **SSH keys**: **Generate a key pair for me** and download the private key. Save it as `~/.ssh/oracle-vm.key` and run `chmod 600 ~/.ssh/oracle-vm.key`.
6. **Create**, wait for **Running**, and note the **Public IP address**.

## 3. Open ports 80 and 443

1. On the instance page click the **subnet**, then the **Default Security List**.
2. **Add Ingress Rules**, twice: source CIDR `0.0.0.0/0`, protocol TCP, destination port `80`; and the same with `443`.

(The VM's own firewall is opened by the script, only if the rules aren't there yet.)

## 4. DNS

hataf.dev's nameservers are Vercel's, so records go in **Vercel > Domains > hataf.dev > DNS Records**, not at the registrar (Porkbun). Add:

| Type  | Name           | Value            |
|-------|----------------|------------------|
| A     | `vm`           | the VM public IP |
| CNAME | `patri-monitor`| `vm.hataf.dev`   |

Other projects on the VM get their own CNAME to `vm.hataf.dev`; only the A record changes if the IP does.

## 5. SSH

Add this to `~/.ssh/config`:

```
Host vm
  HostName vm.hataf.dev
  User ubuntu
  IdentityFile ~/.ssh/oracle-vm.key
```

Then `ssh vm` works.

## 6. Deploy

From the repo root on this PC:

```
git checkout recorder        # until it is merged
bash deploy/oracle/deploy.sh vm patri-monitor.hataf.dev
```

Usage: `bash deploy/oracle/deploy.sh <ssh-target> <hostname> [port]`. The port is where the recorder listens on the VM's localhost (default 8787).

The script copies the code, installs Node 22 only if the VM has no Node 22 or newer, installs Caddy only if missing, writes `/etc/caddy/sites/patri-monitor.caddy`, creates the service, generates a secret key, starts everything and checks `https://patri-monitor.hataf.dev/healthz`. If that check fails, DNS or the certificate may still be settling: try again in a few minutes. At the end it prints:

```
RECORDER_URL=https://patri-monitor.hataf.dev
RECORDER_KEY=<long hex string>
```

Keep them. The key is printed only on the first run.

## 7. Connect Vercel

1. Vercel > the Patri project > **Settings > Environment Variables**.
2. Add `RECORDER_URL=https://patri-monitor.hataf.dev` and `RECORDER_KEY=<the printed key>`, for **Production**.
3. **Deployments > latest > Redeploy**.

## 8. Check

```
curl https://patri-monitor.hataf.dev/healthz
```

Expected: `{"ok":true,"feed":true,"runs":...,"lastUpdate":...,"timetable":true}`. Right after a deploy `runs` may be 0 for a minute while the feed joins. Then open the app: train pages show recorded history after a few minutes.

## Archive

The live database keeps 90 days. Every night at 00:45 PKT (19:45 UTC) `archive.js` writes the previous Pakistan day's positions and passes into a small SQLite file, gzips it and uploads it to an Oracle Object Storage bucket as `daily/YYYY-MM-DD.db.gz`. Each day is uploaded once and kept forever; together the files are the full history. Only Node built-ins are used.

### Bucket and write-only URL

1. **Storage > Buckets > Create bucket**: name `patri-archive`, tier **Standard**, **Auto-Tiering off**. Everything stays inside the 10 GiB Always Free allowance.
2. Optional: **Lifecycle Policy Rules** on the bucket, to move objects older than 90 days to the **Archive** tier (note that archived objects must be restored before they can be downloaded).
3. In the bucket, **Pre-Authenticated Requests > Create**: type **Permit object writes** (write-only), target **Bucket**, a far-off expiry. Copy the URL when it is shown; it appears once. It must end in `/o/`.

### Save it on the VM

This keeps the URL out of the shell history:

```
read -rsp "Paste the archive URL: " U && echo "ARCHIVE_URL=$U" | sudo tee -a /etc/patri/recorder.env >/dev/null && unset U
```

Until `ARCHIVE_URL` is set the job logs "ARCHIVE_URL not set; nothing to do" and succeeds.

### Running and checking

- Run now: `sudo systemctl start patri-archive.service`. The first run archives every finished day in the live DB (at most 90 days back); after that, each run archives the days since the last success.
- Logs: `journalctl -u patri-archive -n 50`. One line per day: rows (positions/passes), bytes and result. Days with no data are skipped.
- Timer: `systemctl list-timers patri-archive.timer`
- Progress is in `/opt/patri/data/archive-state.json` (`lastDay`, `uploadedBytes`, `files`). A failed upload leaves it untouched, so the next run retries the same day.

### Restore a day

Download the object from the bucket (console, or a read PAR of your own), then:

```
gunzip 2026-10-20.db.gz
sqlite3 2026-10-20.db 'select count(*) from positions'   # or any SQLite tool
```

or from another database: `ATTACH 'file:2026-10-20.db?mode=ro' AS day;`. The file has the same `positions` and `passes` tables as `trains.db`.

### Cap and heartbeat

- `ARCHIVE_CAP_BYTES` (default 8 GiB) is checked against the total uploaded so far before every upload. If the next file would pass it, the job stops with an error and exits 1, so the bucket never exceeds the 10 GiB free tier. Raise it or clean the bucket by hand to continue.
- Optional: set `ARCHIVE_HEARTBEAT_URL` in `/etc/patri/recorder.env` to a Healthchecks.io-style ping URL. It is pinged after a fully successful run, and at `<url>/fail` after an error, so a silent failure gets noticed.

## Automatic deploys (GitHub Actions)

`.github/workflows/deploy-monitor.yml` runs `deploy.sh` for you whenever server files change on `main` (server.js, lib.js, data.js, store.js, routes.js, archive.js, alerts.js, push.js, package.json, package-lock.json, `deploy/oracle/**`, or the workflow itself). It can also be started by hand from the Actions tab on any branch. It has no pull request trigger, so forks never see the secrets. The repository is public and so are the logs: nothing secret is printed, and in CI the script never prints `RECORDER_KEY`.

The first-ever deploy must still be done from your PC (section 6): it creates `/etc/patri/recorder.env`. In CI the script stops with a clear message if that file is missing.

Setup, once, on your PC:

1. Make a dedicated key:
   ```
   ssh-keygen -t ed25519 -N "" -C "github-actions-patri" -f ~/.ssh/patri-gh-deploy
   ```
2. Authorise it on the VM (either one):
   ```
   ssh-copy-id -i ~/.ssh/patri-gh-deploy.pub hataf-oracle
   cat ~/.ssh/patri-gh-deploy.pub | ssh hataf-oracle 'cat >> ~/.ssh/authorized_keys'
   ```
3. Pin the host key, and check it is really the VM's:
   ```
   ssh-keyscan -t ed25519 vm.hataf.dev > /tmp/vm_known_hosts
   ssh-keygen -lf /tmp/vm_known_hosts
   ssh hataf-oracle 'ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub'
   ```
   The two fingerprints (the `SHA256:...` part) must be identical.
4. Add the secrets without printing them:
   ```
   gh secret set VM_SSH_KEY < ~/.ssh/patri-gh-deploy
   gh secret set VM_KNOWN_HOSTS < /tmp/vm_known_hosts
   gh variable set VM_HOST --body vm.hataf.dev
   ```
   Optional: `gh variable set MONITOR_HOSTNAME --body patri-monitor.hataf.dev` (that is the default).
5. Test it:
   ```
   gh workflow run deploy-monitor.yml --ref main
   gh run watch
   ```
6. To revoke: remove the key's line (the one ending `github-actions-patri`) from `~/.ssh/authorized_keys` on the VM, and delete the secret with `gh secret delete VM_SSH_KEY`.

Order of changes: if a Vercel change needs a newer recorder, deploy the VM first (merge to main and let the workflow finish), or merge both together.

## Shared machine

Each project on the VM gets its own:

- Linux user (Patri uses `patri`, home `/opt/patri`);
- systemd service (`patri-recorder`);
- localhost-only port;
- Caddy file `/etc/caddy/sites/<name>.caddy`, holding a `<hostname> { reverse_proxy 127.0.0.1:<port> }` block.

`/etc/caddy/Caddyfile` only contains `import sites/*.caddy`. The Patri setup never edits other projects' site files, never replaces a Caddyfile that has other content (it only appends the import line if missing), and leaves an existing Node 22+ and Caddy alone.

Ports on the VM:

| Port | Project        |
|------|----------------|
| 8787 | Patri monitor  |
| 8790+ | pick the next free one for each new project |

## Everyday use

- Logs: `ssh vm sudo journalctl -u patri-recorder -f`. It prints one "Recorded N positions in the last hour" line per hour.
- Restart: `ssh vm sudo systemctl restart patri-recorder`
- Update after code changes: `bash deploy/oracle/deploy.sh vm patri-monitor.hataf.dev` again. It keeps the key and the data.
- Data lives in `/opt/patri/data/trains.db` on the VM. Positions older than 90 days are deleted automatically.
- Caddy logs: `ssh vm sudo journalctl -u caddy -n 50`

## How HTTPS works

Caddy serves `https://patri-monitor.hataf.dev` and forwards to the recorder on 127.0.0.1:8787. It gets and renews a Let's Encrypt certificate automatically (it needs the DNS record to resolve and ports 80 and 443 open). Every `/api/*` request needs the `x-recorder-key` header; only `/healthz` is open.

## Troubleshooting

- `curl` to /healthz fails or times out: check the DNS records (step 4), the Security List rules (step 3), and wait a few minutes for the certificate.
- Setup stops with "Caddy config is invalid": Caddy was not reloaded, so other sites keep running. Fix the file named in the error under `/etc/caddy` and run the deploy again.
- `feed: false`: the live feed is unreachable or `PAKRAIL_API_KEY` is wrong; edit `/etc/patri/recorder.env` on the VM and restart.
- Change the key: edit `RECORDER_KEY` in `/etc/patri/recorder.env`, restart, and update Vercel.
