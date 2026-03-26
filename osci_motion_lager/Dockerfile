# Wir nutzen ein minimalistisches Nginx-Image
FROM nginx:stable-alpine

# Verzeichnisse für die Webseite erstellen
WORKDIR /usr/share/nginx/html

# Alle Dateien kopieren
COPY index.html .
COPY header.png .
COPY footer.png .

# Nginx Konfiguration anpassen (Port 8099 für HA Ingress)
RUN sed -i 's/listen  80;/listen 8099;/g' /etc/nginx/conf.d/default.conf

# Keine run.sh mehr nötig, Nginx startet automatisch
