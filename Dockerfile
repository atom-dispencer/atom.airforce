FROM busybox:stable-glibc

RUN adduser -D static
USER static
WORKDIR /home/static

COPY www/ .
CMD ["busybox", "httpd", "-f", "-v", "-p", "80"]
