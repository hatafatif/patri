# Patri recorder on Oracle Cloud (Always Free)

The recorder is `server.js` running 24/7 on a small free VM. It keeps one live feed socket open and records every train's positions and station passes into SQLite (90 days). The Vercel API reads live positions and history from it, and falls back to reading the feed directly if the recorder is down. Cost: $0.

You need: this repo on your PC with a working `.env` (it holds `PAKRAIL_API_KEY`), `ssh`, `rsync` and `openssl`.

## 1. Create an Oracle Cloud Free Tier account

1. Go to https://www.oracle.com/cloud/free/ and click **Start for free**.
2. Sign up. A credit or debit card is needed for identity checks; Always Free resources are not charged.
3. Choose your **home region** carefully: it is permanent. Pick one near Pakistan (for example Mumbai, Hyderabad, or a Middle East region) or a US region. Always Free VMs can only be created in the home region.

## 2. Create the VM

1. In the Oracle Console open the menu, then **Compute > Instances > Create instance**.
2. **Image**: Change image, choose **Canonical Ubuntu 24.04**.
3. **Shape**: Change shape, then **VM.Standard.E2.1.Micro** (Always Free, AMD). If it says "out of capacity" or is not offered, use **Ampere > VM.Standard.A1.Flex** with 1 OCPU and 6 GB memory.
4. **Networking**: keep the default new VCN and public subnet, and make sure **Assign a public IPv4 address** is on.
5. **SSH keys**: choose **Generate a key pair for me** and download the private key (or upload your own public key). Save the private key as `~/.ssh/oracle.key`, then run `chmod 600 ~/.ssh/oracle.key`.
6. Click **Create**. Wait until the state is **Running**, then copy the **Public IP address**.

## 3. Open ports 80 and 443

1. On the instance page click the **subnet** link, then the **Security List** (Default Security List).
2. **Add Ingress Rules**, twice:
   - Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination Port `80`
   - Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination Port `443`

(The VM's own firewall is opened for you by the script.)

## 4. Deploy

From the repo root on this PC:

```
ssh-add ~/.ssh/oracle.key          # or pass the key as: ssh -i is not needed after this
bash deploy/oracle/deploy.sh ubuntu@<IP>
```

If you prefer not to use `ssh-add`, add this to `~/.ssh/config`:

```
Host <IP>
  IdentityFile ~/.ssh/oracle.key
```

The script copies the code, installs Node 22 and Caddy, creates the service, generates a secret key, and starts everything. At the end it prints two lines:

```
RECORDER_URL=https://<ip-with-dashes>.sslip.io
RECORDER_KEY=<long hex string>
```

Keep them. The key is only printed on the first run.

## 5. Connect Vercel

1. Vercel dashboard > your Patri project > **Settings > Environment Variables**.
2. Add `RECORDER_URL` and `RECORDER_KEY` with the printed values, for **Production**.
3. **Deployments > latest > Redeploy** so the new variables take effect.

## 6. Check

```
curl https://<ip-with-dashes>.sslip.io/healthz
```

Expected: `{"ok":true,"feed":true,"runs":...,"lastUpdate":...,"timetable":true}`. (If your IP is 1.2.3.4 the address is `1-2-3-4.sslip.io`.) Right after a deploy `runs` may be 0 for a minute while the feed joins. Then open the app: train pages should show recorded history after a few minutes.

## Everyday use

- Logs: `ssh ubuntu@<IP> sudo journalctl -u patri-recorder -f`. It prints one "Recorded N positions in the last hour" line per hour.
- Restart: `ssh ubuntu@<IP> sudo systemctl restart patri-recorder`
- Update after code changes: run `bash deploy/oracle/deploy.sh ubuntu@<IP>` again. It keeps the key and the data.
- Data lives in `/opt/patri/data/trains.db` on the VM. Positions older than 90 days are deleted automatically.
- Caddy logs: `sudo journalctl -u caddy -n 50`

## How HTTPS works

Caddy (installed by the script) serves `https://<ip-with-dashes>.sslip.io` and forwards to the recorder on 127.0.0.1:8787. sslip.io is a free service whose names resolve to the IP in the name, so there is no domain to buy. Caddy gets and renews a Let's Encrypt certificate automatically (it needs ports 80 and 443 open). Every `/api/*` request needs the `x-recorder-key` header; only `/healthz` is open.

## Idle reclaim

Oracle may reclaim Always Free VMs that stay idle for a week. This one is busy all the time (feed socket, SQLite writes), so it should not count as idle. To be safe, you can upgrade the account to **Pay-As-You-Go** (Billing in the console). Always Free resources stay $0; you are only charged if you create paid resources.

## Troubleshooting

- `curl` to /healthz times out: check the Security List rules (step 3) and wait a minute for the certificate.
- `feed: false`: the live feed is unreachable or `PAKRAIL_API_KEY` is wrong; edit `/etc/patri/recorder.env` on the VM and restart.
- Change the key: edit `RECORDER_KEY` in `/etc/patri/recorder.env`, restart, and update Vercel.
