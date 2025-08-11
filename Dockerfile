FROM httpd:2.4-alpine3.22 

COPY www/ /usr/local/apache2/htdocs/
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

EXPOSE 80
