FROM busybox:stable-glibc

COPY www/ /www

EXPOSE 80
CMD ["busybox", "httpd", "-f", "-v", "-p", "80", "-h", "/www"]
