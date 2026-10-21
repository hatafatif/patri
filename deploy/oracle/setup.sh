#!/usr/bin/env bash
# Run on the VM as root (deploy.sh does this). Safe to run again.
# Usage: setup.sh [public-ip]   (detected when omitted)
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo)." >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive

IP="${1:-$(curl -fsS https://ifconfig.me)}"
HOSTNAME_SSLIP="${IP//./-}.sslip.io"
echo "==> Public address: $HOSTNAME_SSLIP"

echo "==> Installing packages"
apt-get update -y
apt-get install -y curl ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https iptables-persistent

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  echo "==> Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v caddy >/dev/null; then
  echo "==> Installing Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> Creating user and folders"
id patri >/dev/null 2>&1 || useradd --system --home /opt/patri --shell /usr/sbin/nologin patri
mkdir -p /opt/patri/data /etc/patri
chown -R patri:patri /opt/patri

echo "==> Opening ports 80 and 443 in the VM firewall"
for port in 80 443; do
  iptables -C INPUT -m state --state NEW -p tcp --dport "$port" -j ACCEPT 2>/dev/null \
    || iptables -I INPUT 6 -m state --state NEW -p tcp --dport "$port" -j ACCEPT
done
netfilter-persistent save

echo "==> Writing services"
cat > /etc/systemd/system/patri-recorder.service <<UNIT
[Unit]
Description=Patri recorder (live feed and history)
After=network-online.target
Wants=network-online.target

[Service]
User=patri
WorkingDirectory=/opt/patri
EnvironmentFile=/etc/patri/recorder.env
Environment=PORT=8787 HOST=127.0.0.1 DATA_DIR=/opt/patri/data KEEP_DAYS=90
ExecStart=/usr/bin/node --disable-warning=ExperimentalWarning server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=/opt/patri/data

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/caddy/Caddyfile <<CADDY
$HOSTNAME_SSLIP {
	encode gzip
	reverse_proxy 127.0.0.1:8787
}
CADDY

systemctl daemon-reload
systemctl enable caddy patri-recorder
systemctl restart caddy
# The recorder needs its code and env file; deploy.sh starts it after npm ci.
if [ -f /opt/patri/server.js ] && [ -f /etc/patri/recorder.env ]; then systemctl restart patri-recorder; fi
echo "==> Setup done: https://$HOSTNAME_SSLIP"
