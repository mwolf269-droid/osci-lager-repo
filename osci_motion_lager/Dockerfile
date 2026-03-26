ARG BUILD_FROM
FROM $BUILD_FROM

# Installiere Nginx
RUN apk add --no-cache nginx

# Arbeitsverzeichnis für Web-Dateien
WORKDIR /www

# Kopiere die Dateien (Achtung: Dateinamen müssen exakt stimmen!)
COPY index.html /www/index.html
COPY header.png /www/header.png
COPY footer.png /www/footer.png
COPY run.sh /run.sh

# Berechtigungen setzen
RUN chmod a+x /run.sh

# Nginx Konfiguration erstellen
RUN mkdir -p /etc/nginx/http.d/
RUN echo 'server { listen 8099 default_server; root /www; index index.html; location / { try_files $uri $uri/ =404; } }' > /etc/nginx/http.d/default.conf

CMD [ "/run.sh" ]
