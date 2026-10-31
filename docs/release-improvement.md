# Release-Verbesserung US-16

## Ausgangspunkt und Verantwortlichkeit

Ausgangsstand: 808ae4881692f687dcf08604e13e5862c6459230.
Die bisherigen 258 Tests in 43 Dateien, Typecheck, Lint und Build wurden bei der Bewertung ausgeführt.
Originaldokumente und Git-Referenzen wurden vor den Änderungen gesichert.

Die Ergänzungen entstehen KI-unterstützt im Auftrag von Jan Albers über den Account alb-jan.
Es werden keine Commits, persönlichen Reviews oder Beiträge von Silas Zwicker stellvertretend bestätigt.
Die geplante persönliche Aufgabenaufteilung wird erst nach tatsächlicher Durchführung als Nachweis gewertet.

## Prozess

Jedes Arbeitspaket hat einen Branch mit Story-ID. Neue Verhaltenstests werden vor der Implementierung committet und gepusht.
Der rote CI-Lauf muss den erwarteten Fehler zeigen. Danach folgen Umsetzung, grüner Lauf und Pull Request.
Persönliche Reviews bleiben für das jeweils andere Teammitglied offen, bis sie tatsächlich erfolgt sind.

## Vereinbarte Ausnahmen

Der Auftraggeber bestätigt die Freigabe der Lehrperson für TypeScript, Poker und ein öffentliches GitHub-Repository.
Diese Angaben sind Teamangaben und keine erfundenen schriftlichen Bestätigungen der Lehrperson.

## Arbeitspakete

- US-01: CI mit Node 24.16.0, npm ci und JSON-Testbericht.
- US-05: vollständige Kaufvalidierung und Rappenrechnung.
- US-02: injizierbarer Observer für alle Benachrichtigungen.
- US-06: Game-Registry und zentrale Navigationsprüfung.
- US-11: klassisches State-Pattern im Roulette und Rückerstattung offener Einsätze.
- US-09: Poker-Aufgabentrennung und Sperre während aktiver Hände.
- US-16: aktualisierte Dokumentation, sichtbare Personas und prüfbares Abgabepaket.
