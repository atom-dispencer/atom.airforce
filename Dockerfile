FROM busybox:stable-glibc
COPY www/ .
CMD ["busybox", "httpd", "-f", "-v", "-p", "80"]
