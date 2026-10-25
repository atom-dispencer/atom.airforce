# atom.airforce — Debian Apache deployment

This package serves the repository's static website using **Apache installed directly on Debian**. Docker is not required or included. Each task is kept separate: fetch the site, deploy files, install/configure Apache, and enable HTTPS.

## Files

- `config/deployment.conf` — domain and upstream repository settings.
- `apache/site.conf.template` — the per-domain Apache virtual host.
- `apache/security.conf` — shared Apache hardening and response headers.
- `scripts/fetch-site.sh` — copies the upstream repository's `www/` assets into `site/`.
- `scripts/deploy-site.sh` — publishes `site/` to `/srv/www/<domain>/public/`.
- `scripts/install-apache.sh` — installs Apache and enables the above configuration.
- `scripts/enable-https.sh` — separately installs Certbot and configures HTTPS.

The original website files could not be downloaded while this package was built. The `site/` directory is therefore intentionally empty until `fetch-site.sh` is run.

## Deploy

Run from the extracted package directory on a Debian server. Edit `config/deployment.conf` first if the domain or source repository differs.

1. Install Git and fetch the published website source:

   ```sh
   sudo apt update
   sudo apt install -y git
   ./scripts/fetch-site.sh
   ```

   Review the downloaded files before publishing them.

2. Copy the static files into the dedicated document root:

   ```sh
   sudo ./scripts/deploy-site.sh
   ```

3. Install Apache and apply its configuration:

   ```sh
   sudo ./scripts/install-apache.sh
   ```

4. Point DNS at the server and allow inbound TCP 80 and 443 in both the host and provider firewalls. Then request a certificate and enable HTTP-to-HTTPS redirection in a separate step:

   ```sh
   sudo ./scripts/enable-https.sh
   sudo certbot renew --dry-run
   ```

5. Verify:

   ```sh
   sudo apache2ctl configtest
   curl -I http://atom.airforce/
   curl -I https://atom.airforce/
   ```

   Replace `atom.airforce` in these commands if you changed `SITE_DOMAIN` in `config/deployment.conf`.

## Updating the site

Run `./scripts/fetch-site.sh` to refresh the local `site/` directory, review the changes, then run `sudo ./scripts/deploy-site.sh`. This keeps source retrieval and publication as separate operations.

## Security choices

- The published content is owned by `root:root`, with directories `0755` and files `0644`. Apache can read it but cannot modify it.
- Directory indexes, `.htaccess` overrides, symlink following and methods other than `GET`/`HEAD` are disabled for the site.
- Dotfiles and common backup, configuration, key and database file suffixes are denied.
- Apache version disclosure and TRACE are disabled; baseline security headers are configured.
- Certbot is not installed or run by the Apache installer. HTTPS setup is its own script and should be run only after public DNS and port 80 are ready.
- Content Security Policy and HSTS are intentionally omitted from the default config. A CSP needs to match the actual site's resources; HSTS should be enabled only after HTTPS works and all affected hostnames support it.

The scripts do not enable a firewall or change SSH configuration; do those deliberately for your server. Keep Debian and Apache security updates current.
