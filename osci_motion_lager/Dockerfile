ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nginx

WORKDIR /www
COPY . /www/

RUN chmod a+x /www/run.sh

RUN echo 'server { listen 8099 default_server; root /www; index index.html; location / { try_files $uri $uri/ =404; } }' > /etc/nginx/http.d/default.conf

CMD [ "/www/run.sh" ]
