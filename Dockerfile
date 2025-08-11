FROM httpd:2.4-alpine3.22 

COPY www/ /var/www/html/
COPY atom-airforce.conf /etc/apache2/sites-available/atom-airforce

RUN a2enmod ssl \
  && a2dissite 000-default default-ssl \
  && a2ensite atom-airforce

EXPOSE 80
