ARG BUILD_FROM
FROM $BUILD_FROM

# Installiere Nginx
RUN apk add --no-cache nginx

# Verzeichnisse anlegen
WORKDIR /www
RUN mkdir -p /etc/nginx/http.d/

# Alle Dateien kopieren
COPY index.html /www/index.html
COPY header.png /www/header.png
COPY footer.png /www/footer.png
COPY run.sh /run.sh

# Rechte vergeben
RUN chmod a+x /run.sh

# Nginx Konfiguration (Port 8099 ist Standard für HA Ingress)
RUN echo 'server { listen 8099 default_server; root /www; index index.html; location / { try_files $uri $uri/ =404; } }' > /etc/nginx/http.d/default.conf

# Start-Skript ausführen
CMD [ "/run.sh" ]
