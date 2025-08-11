FROM busybox:stable-glibc

WORKDIR /www
COPY . /www

EXPOSE 80
CMD ["busybox", "httpd", "-f", "-v", "-p", "80", "-h", "www"]
