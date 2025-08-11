FROM busybox:stable-glibc

WORKDIR /www
COPY www/ /www

EXPOSE 80
CMD busybox https -f -v -p 80 -h /www
