ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nginx

COPY index.html wwwindex.html
COPY run.sh 
RUN chmod a+x run.sh

# Nginx Konfiguration direkt erstellen
RUN echo 'server { listen 8099 default_server; root www; index index.html; location  { try_files $uri $uri =404; } }'  etcnginxhttp.ddefault.conf

CMD [ run.sh ]