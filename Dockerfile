FROM busybox:stable-glibc

WORKDIR /www
COPY www/ /www

EXPOSE 80
CMD ["busybox", "httpd", "-f", "-v", "-p", "8080", "-h", "/www"]
