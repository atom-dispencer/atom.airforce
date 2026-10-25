#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
    echo "Run as root: $0" >&2
    exit 1
fi

DOMAIN="atom.airforce"
ROOT="/atom.airforce"
HTTPD_USER="httpd-atom-airforce"
REPO="https://github.com/atom-dispencer/atom.airforce.git"

apt-get update
apt-get install -y git apache2 certbot python3-certbot-apache

if [ -e "$ROOT" ]; then
    echo "$ROOT already exists; refusing to overwrite it." >&2
    exit 1
fi

git clone "$REPO" "$ROOT"

if ! id "$HTTPD_USER" >/dev/null 2>&1; then
    adduser --system --no-create-home --group "$HTTPD_USER"
fi

# Point Apache at the cloned site.
sed -i 's#/srv/atom.airforce/www#/atom.airforce/www#g' "$ROOT/apache/atom.airforce.conf"

# Keep the repository private by default.
chown -R root:root "$ROOT"
chmod -R 0700 "$ROOT"

# Allow the Apache worker to traverse the repository root,
# without allowing it to list the directory.
chown root:"$HTTPD_USER" "$ROOT"
chmod 0710 "$ROOT"

# Allow Apache to read, but not modify, the static site.
chown -R root:"$HTTPD_USER" "$ROOT/www"
find "$ROOT/www" -type d -exec chmod 0750 {} +
find "$ROOT/www" -type f -exec chmod 0640 {} +

# Configure Apache's worker user and group.
sed -i \
    -e "s/^export APACHE_RUN_USER=.*/export APACHE_RUN_USER=$HTTPD_USER/" \
    -e "s/^export APACHE_RUN_GROUP=.*/export APACHE_RUN_GROUP=$HTTPD_USER/" \
    /etc/apache2/envvars

# Link and enable the Apache configuration.
ln -sf "$ROOT/apache/security.conf" \
    /etc/apache2/conf-available/atom-airforce-security.conf
ln -sf "$ROOT/apache/atom.airforce.conf" \
    /etc/apache2/sites-available/atom.airforce.conf

a2enmod headers
a2enconf atom-airforce-security
a2ensite atom.airforce

apache2ctl configtest
systemctl enable apache2
systemctl restart apache2

# Obtain a certificate and enable HTTPS redirection.
certbot --apache --redirect -d "$DOMAIN"