📦 Installationsanleitung: Osci-Motion Lagerverwaltung
Diese App ermöglicht dir eine professionelle Bestandsführung deiner Aquaristik-Lösungen direkt in Home Assistant. Um die App nutzen zu können, folge bitte diesen Schritten:

Schritt 1: Den Sicherheits-Token erstellen
Da die App sicher auf die Datenbank deines Raspberry Pi zugreifen muss, benötigt sie einen sogenannten Langlebigen Zugriffs-Token.
Klicke in deinem Home Assistant ganz unten links auf deinen Benutzernamen (dein Profil).
Scrolle ganz nach unten bis zum Bereich Langlebige Zugriffs-Token.
Klicke auf Token erstellen.
Gib ihm einen Namen (z. B. Lager-App) und bestätige mit OK.
WICHTIG: Kopiere den sehr langen Code, der nun angezeigt wird, sofort in eine Textdatei oder in deine Zwischenablage. Er wird dir nur dieses eine Mal angezeigt!

Schritt 2: Das Repository hinzufügen
Damit Home Assistant weiß, woher er die App laden soll, musst du mein GitHub-Repository hinzufügen.
Gehe zu Einstellungen -> Add-ons.
Klicke unten rechts auf den Button Add-on Store.
Klicke oben rechts auf die drei vertikalen Punkte (⋮) und wähle Repositories.
Kopiere diesen Link in das Feld:
https://github.com/mwolf269-droid/osci-lager-repo
Klicke auf Hinzufügen und schließe das Fenster.

Schritt 3: Die App installieren
Klicke im Add-on Store oben rechts auf die drei Punkte (⋮) und wähle Nach Updates suchen (oder lade die Seite einmal neu).
Suche in der Liste (ganz oben unter "Osci-Motion Add-on Repository") nach Osci-Motion Lagerverwaltung.
Klicke darauf und wähle Installieren.
Aktiviere nach der Installation den Schalter In der Seitenleiste anzeigen.
Klicke auf Starten.

Schritt 4: Den Token einfügen (Ersteinrichtung)
Öffne die App über den Link Web-Oberfläche öffnen oder über das Icon in deiner Seitenleiste.
Beim ersten Start erscheint ein Fenster mit der Aufforderung: "Bitte gib deinen Home Assistant Langlebigen Zugriffs-Token ein".
Füge hier den Code ein, den du in Schritt 1 kopiert hast.
Klicke auf OK.
Das Tool verbindet sich nun mit deinem System. Der grüne Punkt ● Synchronisiert oben rechts zeigt dir an, dass alles bereit ist.

Fehlerbehebung (FAQ)
Der grüne Punkt leuchtet nicht (Fehler): Überprüfe, ob du den Token korrekt kopiert hast. Du kannst den Browser-Speicher löschen, um den Token erneut einzugeben.
Die App startet nicht: Schaue im Add-on unter dem Reiter "Protokolle" nach Fehlermeldungen.
Wiege-Ergebnisse ungenau: Nutze den blauen Info-Button (i) in der Messstation, um die aktuell hinterlegten Dichtewerte zu prüfen.
Hinweis: Dies ist ein privates Projekt und steht in keiner Verbindung zur Firma Osci-Motion.
