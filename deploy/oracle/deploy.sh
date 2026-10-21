#!/usr/bin/env bash
# Deploys the recorder to an Oracle VM. Run from the repo root on this PC:
#   bash deploy/oracle/deploy.sh ubuntu@<public-ip>
# Safe to run again: it updates the code and keeps the existing key and data.
set -euo pipefail

TARGET="${1:-}"
[ -n "$TARGET" ] || { echo "Usage: bash deploy/oracle/deploy.sh ubuntu@<public-ip>" >&2; exit 1; }
HOST="${TARGET#*@}"
cd "$(dirname "$0")/../.."
[ -f server.js ] || { echo "Run this from the Patri repo." >&2; exit 1; }

if ! [[ "$HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Use the VM's public IPv4 address (not a hostname): $HOST" >&2; exit 1
fi
IP_DASHED="${HOST//./-}"
URL="https://$IP_DASHED.sslip.io"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
run() { ssh "${SSH_OPTS[@]}" "$TARGET" "$@"; }

echo "==> Checking SSH to $TARGET"
run true || { echo "Cannot SSH to $TARGET. Check the IP, the user (ubuntu) and your key (ssh -i)." >&2; exit 1; }

echo "==> Copying files"
run 'sudo mkdir -p /opt/patri /etc/patri && sudo chown "$USER" /opt/patri'
FILES=(server.js lib.js data.js store.js routes.js package.json package-lock.json)
rsync -az -e "ssh ${SSH_OPTS[*]}" "${FILES[@]}" deploy/oracle/setup.sh "$TARGET:/opt/patri/"

echo "==> Creating /etc/patri/recorder.env (first run only)"
NEW_KEY=""
if run 'sudo test -f /etc/patri/recorder.env'; then
  echo "Already exists, keeping it."
else
  API_KEY="$(grep -E '^PAKRAIL_API_KEY=' .env 2>/dev/null | head -1 | cut -d= -f2- || true)"
  [ -n "$API_KEY" ] || { echo "PAKRAIL_API_KEY is missing from .env on this PC." >&2; exit 1; }
  NEW_KEY="$(openssl rand -hex 32)"
  printf 'PAKRAIL_API_KEY=%s\nRECORDER_KEY=%s\n' "$API_KEY" "$NEW_KEY" \
    | run 'sudo install -m 600 -o root -g root /dev/stdin /etc/patri/recorder.env'
fi

echo "==> Running setup on the VM (a few minutes the first time)"
run "sudo bash /opt/patri/setup.sh $HOST"

echo "==> Installing dependencies"
run 'sudo chown -R patri:patri /opt/patri && cd /opt/patri && sudo -u patri npm ci --omit=dev'

echo "==> Restarting the recorder"
run 'sudo systemctl restart patri-recorder'

echo "==> Checking $URL/healthz (Caddy may need a minute to get its certificate)"
ok=""
for _ in $(seq 1 12); do
  if out="$(curl -fsS --max-time 10 "$URL/healthz" 2>/dev/null)"; then ok=1; echo "$out"; break; fi
  sleep 5
done
[ -n "$ok" ] || echo "No answer yet. Check port 80/443 in the Oracle Security List, then: ssh $TARGET sudo journalctl -u patri-recorder -u caddy -n 50"

echo
if [ -n "$NEW_KEY" ]; then
  echo "Add these to the Vercel project (Production), then redeploy:"
  echo "  RECORDER_URL=$URL"
  echo "  RECORDER_KEY=$NEW_KEY"
else
  echo "Done. RECORDER_URL=$URL (the key is unchanged; see /etc/patri/recorder.env on the VM)."
fi
