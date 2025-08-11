#!/bin/bash

{
  sudo -u docker-http bash -c 'cd /home/docker-http/atom.airforce && docker-compose down'

  sudo certbot renew

  sudo -u docker-http bash -c 'cd /home/docker-http/atom.airforce && docker-compose down'
} >> /home/docker-http/atom.airforce/certbot-cron.log 2>&1
