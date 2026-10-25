#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root: $0" >&2
    exit 1
fi

DOMAIN="atom.airforce"
REPO="https://github.com/atom-dispencer/atom.airforce.git"
ROOT="/atom.airforce"
HTTPD_USER="httpd-atom-airforce"

if [ -z "${CERTBOT_EMAIL:-}" ]; then
    echo "Set CERTBOT_EMAIL before running, e.g. CERTBOT_EMAIL=admin@example.com $0" >&2
    exit 1
fi

if [ -e "$ROOT" ]; then
    echo "$ROOT already exists; refusing to overwrite it." >&2
    exit 1
fi

# Keep package installation and service restarts unattended.
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

apt-get update
apt-get install -y --no-install-recommends git apache2 certbot python3-certbot-apache

git clone --depth 1 "$REPO" "$ROOT"

for path in "$ROOT/www" "$ROOT/apache/security.conf" "$ROOT/apache/atom.airforce.conf"; do
    if [ ! -e "$path" ]; then
        echo "Required repository path is missing: $path" >&2
        exit 1
    fi
done

if ! getent passwd "$HTTPD_USER" >/dev/null 2>&1; then
    adduser --system --no-create-home --group "$HTTPD_USER"
fi

# Apache serves the site from /atom.airforce/www.
sed -i 's#/srv/atom.airforce/www#/atom.airforce/www#g' \
    "$ROOT/apache/atom.airforce.conf"

# Lock down the repository, then grant the Apache worker read-only site access.
chown -R root:root "$ROOT"
chmod -R 0700 "$ROOT"
chown root:"$HTTPD_USER" "$ROOT"
chmod 0710 "$ROOT"
chown -R root:"$HTTPD_USER" "$ROOT/www"
find "$ROOT/www" -type d -exec chmod 0750 {} +
find "$ROOT/www" -type f -exec chmod 0640 {} +

# Run Apache workers as the dedicated site user.
sed -i \
    -e "s/^export APACHE_RUN_USER=.*/export APACHE_RUN_USER=$HTTPD_USER/" \
    -e "s/^export APACHE_RUN_GROUP=.*/export APACHE_RUN_GROUP=$HTTPD_USER/" \
    /etc/apache2/envvars

ln -sf "$ROOT/apache/security.conf" \
    /etc/apache2/conf-available/atom-airforce-security.conf
ln -sf "$ROOT/apache/atom.airforce.conf" \
    /etc/apache2/sites-available/atom.airforce.conf

a2enmod headers
a2enconf atom-airforce-security
a2ensite atom.airforce

apache2ctl configtest
systemctl enable --now apache2
systemctl restart apache2

certbot --apache --redirect \
    --non-interactive --agree-tos --no-eff-email \
    --email "$CERTBOT_EMAIL" -d "$DOMAIN"
