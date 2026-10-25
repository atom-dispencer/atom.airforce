# atom.airforce — Debian Apache deployment

Serves the repository's static site using Apache installed directly on Debian. Docker is not used. The site is served from `/atom.airforce/www`; Apache worker processes run as the dedicated `httpd-atom-airforce` user.

## First-time setup

Run this on a **fresh Debian server**. The script refuses to overwrite an existing `/atom.airforce` directory. Before running it, make sure:

- `atom.airforce` resolves to this server's public IP address.
- Inbound TCP ports 80 and 443 are allowed by the server and provider firewalls.
- You have an email address for Let's Encrypt certificate and renewal notices.

Open a root shell, then download and run the non-interactive setup script:

```sh
sudo -i
export CERTBOT_EMAIL="you@example.com"
curl -fsSL https://raw.githubusercontent.com/atom-dispencer/atom.airforce/main/scripts/setup.sh -o /root/atom-airforce-setup.sh
chmod 700 /root/atom-airforce-setup.sh
/root/atom-airforce-setup.sh
```

Replace `you@example.com` with an email address you monitor. The `scripts/setup.sh` file must be committed to the repository on the `main` branch for the download URL above to work.

The setup script installs Git, Apache and Certbot; clones the repository to `/atom.airforce`; creates the `httpd-atom-airforce` system user; configures Apache; enables and starts the service; and requests a Let's Encrypt certificate with HTTP-to-HTTPS redirection. Certbot configures certificate renewal automatically.

## Start, stop and restart Apache

Run service commands with root privileges. The repository is restricted to root, so invoke its scripts through `sudo` when using a non-root shell.

```sh
# Start Apache
sudo /atom.airforce/scripts/start.sh

# Stop Apache
sudo /atom.airforce/scripts/stop.sh

# Check the configuration, then reload it without a full restart
sudo apache2ctl configtest && sudo systemctl reload apache2

# Check the configuration, then perform a full restart
sudo apache2ctl configtest && sudo systemctl restart apache2
```

Setup enables Apache at boot. A stop only stops the running service; it does not disable startup at boot. Static-file changes normally do not require a restart. Use a reload or restart after Apache configuration changes.

## Verify and troubleshoot

```sh
curl -I http://atom.airforce/
curl -I https://atom.airforce/
sudo systemctl status apache2 --no-pager
sudo journalctl -u apache2 -n 100 --no-pager
sudo certbot certificates
sudo certbot renew --dry-run
```

HTTP should redirect to HTTPS. Test HTTPS using the domain name, not the server's bare IP address: the certificate is issued for `atom.airforce`.

## Files

- `apache/atom.airforce.conf` — HTTP virtual host and static-site rules.
- `apache/security.conf` — shared Apache security settings and response headers.
- `scripts/setup.sh` — non-interactive first-time setup and HTTPS configuration.
- `scripts/start.sh` / `scripts/stop.sh` — Apache service controls.
- `www/` — published static website content.

Certbot generates an HTTPS virtual-host configuration on the server when it provisions the certificate.

## Permissions and runtime identity

The setup script keeps the repository root owned by `root` and limits access. `/atom.airforce` is `0710` with group `httpd-atom-airforce` so the Apache worker can traverse it; `www/` directories are `0750` and regular site files are `0640`, owned by `root:httpd-atom-airforce`. Apache can read the static site but cannot modify it. The privileged Apache parent process remains root to bind ports 80 and 443; serving worker processes run as `httpd-atom-airforce`.

The script does not configure a firewall or change SSH settings. Keep Debian, Apache and Certbot updates current.
