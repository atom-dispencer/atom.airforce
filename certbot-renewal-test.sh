#!/bin/bash

sudo -u docker-http bash -c 'cd /home/docker-http/atom.airforce && docker-compose down'

sudo certbot renew --dry-run

sudo -u docker-http bash -c 'cd /home/docker-http/atom.airforce && docker-compose down'
