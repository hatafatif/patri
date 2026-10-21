#!/usr/bin/env bash
# Run on the VM as root (deploy.sh does this). Safe to run again, and safe on a shared machine:
# it only adds what is missing and never removes other projects' config.
# Usage: setup.sh <hostname> [port]
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo)." >&2; exit 1; }
HOSTNAME_PUBLIC="${1:-}"
PORT="${2:-8787}"
[ -n "$HOSTNAME_PUBLIC" ] || { echo "Usage: setup.sh <hostname> [port]" >&2; exit 1; }
[[ "$PORT" =~ ^[0-9]+$ ]] || { echo "Port must be a number: $PORT" >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive

echo "==> Swap (small machines only)"
# An E2.1.Micro has 1 GB of memory; apt and npm can briefly need more. Add a 2 GB swap file once.
mem_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
if [ "$mem_kb" -lt 2000000 ] && ! swapon --show=NAME --noheadings | grep -q .; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "    added a 2 GB swap file"
else
  echo "    not needed"
fi

echo "==> Installing base packages"
apt-get update -y
apt-get install -y curl ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https iptables-persistent

echo "==> Node.js"
if command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]; then
  echo "Found Node $(node -v), leaving it alone."
else
  echo "Installing Node.js 22 (NodeSource)"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "==> Caddy"
if command -v caddy >/dev/null; then
  echo "Found $(caddy version | head -1), leaving it alone."
else
  echo "Installing Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> Caddy per-site files (/etc/caddy/sites/*.caddy)"
mkdir -p /etc/caddy/sites
CADDYFILE=/etc/caddy/Caddyfile
if [ ! -f "$CADDYFILE" ]; then
  echo "No Caddyfile, creating one that imports the site files."
  echo 'import sites/*.caddy' > "$CADDYFILE"
elif grep -qF 'root * /usr/share/caddy' "$CADDYFILE" && grep -qE '^[[:space:]]*:80([[:space:]]|\{|$)' "$CADDYFILE"; then
  echo "Caddyfile is the package's default placeholder, replacing it."
  echo 'import sites/*.caddy' > "$CADDYFILE"
elif grep -qE '^[[:space:]]*import[[:space:]]+sites/' "$CADDYFILE"; then
  echo "Caddyfile already imports sites/, leaving it alone."
else
  echo "Caddyfile has other content, appending the import line (nothing removed)."
  { [ -z "$(tail -c1 "$CADDYFILE")" ] || echo; echo 'import sites/*.caddy'; } >> "$CADDYFILE"
fi
cat > /etc/caddy/sites/patri-monitor.caddy <<CADDY
$HOSTNAME_PUBLIC {
	encode gzip
	reverse_proxy 127.0.0.1:$PORT
}
CADDY

echo "==> Creating user and folders"
id patri >/dev/null 2>&1 || useradd --system --home /opt/patri --shell /usr/sbin/nologin patri
mkdir -p /opt/patri/data /etc/patri
chown -R patri:patri /opt/patri

echo "==> Opening ports 80 and 443 in the VM firewall"
# Oracle's images end INPUT with a REJECT rule, and its position varies by image. Each ACCEPT must sit
# above it, so remove any existing copy (a rule below the REJECT never matches) and insert it right
# before the REJECT; without one, append.
for port in 443 80; do
  rule=(-m state --state NEW -p tcp --dport "$port" -j ACCEPT)
  while iptables -C INPUT "${rule[@]}" 2>/dev/null; do iptables -D INPUT "${rule[@]}"; done
  reject=$(iptables -L INPUT -n --line-numbers | awk '$2 == "REJECT" { print $1; exit }')
  if [ -n "$reject" ]; then iptables -I INPUT "$reject" "${rule[@]}"; else iptables -A INPUT "${rule[@]}"; fi
done
netfilter-persistent save

echo "==> Writing the recorder service"
cat > /etc/systemd/system/patri-recorder.service <<UNIT
[Unit]
Description=Patri recorder (live feed and history)
After=network-online.target
Wants=network-online.target

[Service]
User=patri
WorkingDirectory=/opt/patri
EnvironmentFile=/etc/patri/recorder.env
Environment=PORT=$PORT HOST=127.0.0.1 DATA_DIR=/opt/patri/data KEEP_DAYS=90
ExecStart=$(command -v node) --disable-warning=ExperimentalWarning server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=/opt/patri/data

[Install]
WantedBy=multi-user.target
UNIT

echo "==> Writing the archive service and timer"
cat > /etc/systemd/system/patri-archive.service <<UNIT
[Unit]
Description=Patri nightly archive (uploads the previous day's history)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=patri
WorkingDirectory=/opt/patri
EnvironmentFile=/etc/patri/recorder.env
Environment=DATA_DIR=/opt/patri/data
ExecStart=$(command -v node) --disable-warning=ExperimentalWarning archive.js
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=/opt/patri/data
UNIT
cat > /etc/systemd/system/patri-archive.timer <<UNIT
[Unit]
Description=Patri nightly archive (00:45 PKT)

[Timer]
OnCalendar=*-*-* 19:45:00 UTC
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
UNIT

echo "==> Validating the Caddy config"
if ! caddy validate --config "$CADDYFILE" --adapter caddyfile; then
  echo "Caddy config is invalid (see above). Not reloading Caddy. Fix /etc/caddy and run again." >&2
  exit 1
fi

systemctl daemon-reload
systemctl enable patri-recorder
systemctl enable --now patri-archive.timer
if systemctl is-active --quiet caddy; then
  echo "==> Reloading Caddy"
  systemctl reload caddy
else
  echo "==> Starting Caddy"
  systemctl enable --now caddy
fi
# The recorder needs its code and env file; deploy.sh restarts it after npm ci.
if [ -f /opt/patri/server.js ] && [ -f /etc/patri/recorder.env ]; then systemctl restart patri-recorder; fi
echo "==> Setup done: https://$HOSTNAME_PUBLIC"
