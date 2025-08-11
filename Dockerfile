FROM httpd:2.4-alpine3.22 

COPY www/ /usr/local/apache2/htdocs/

EXPOSE 80
