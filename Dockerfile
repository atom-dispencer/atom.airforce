FROM busybox:stable-glibc

RUN adduser -D static
USER static
WORKDIR /home/static

COPY www/ .
EXPOSE 80
CMD ["busybox", "httpd", "-f", "-v", "-p", "80"]
