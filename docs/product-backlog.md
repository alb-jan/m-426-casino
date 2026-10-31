# Product Backlog

Priorität: 1 = höchste. Story Points (SP) nach Fibonacci.

| ID | User Story | Prio | SP | Sprint | Branch |
|---|---|---|---|---|---|
| US-01 | Als Entwickler möchte ich ein Test-Setup (Vitest + Testing Library) und die Design-Grundlagen (Farben, Schriften, Formatierung), damit alle Features testgetrieben und im einheitlichen Look entwickelt werden können. | 1 | 3 | 1 | codex/US-01-project-setup |
| US-02 | Als Spieler möchte ich über Ereignisse (Gewinn, Verlust, Hinweise) mit kurzen Meldungen informiert werden, damit ich immer weiss, was passiert ist. | 1 | 3 | 1 | codex/US-02-notifications |
| US-03 | Als Spieler möchte ich ein Jeton-Guthaben haben, das in beiden Spielen gilt und im Header sichtbar ist. | 1 | 5 | 1 | codex/US-03-chips-wallet |
| US-04 | Als Besucher möchte ich eine einladende Startseite sehen und das Casino betreten können. | 2 | 2 | 2 | codex/US-04-landing-page |
| US-05 | Als Spieler möchte ich Franken in Jetons tauschen (Kurs 1 CHF = 10 Jetons, min. CHF 5, max. CHF 500) und bei falscher Eingabe eine verständliche Fehlermeldung erhalten. | 1 | 5 | 2 | codex/US-05-chip-purchase |
| US-06 | Als Spieler möchte ich in einer Lobby zwischen Poker und Roulette wählen und mein Guthaben sehen. | 1 | 3 | 2 | codex/US-06-lobby |
| US-07 | Als Spieler möchte ich mein Restguthaben auszahlen lassen und eine Bilanz (eingezahlt/ausgezahlt) sehen. | 2 | 2 | 2 | codex/US-07-cashout |
| US-08 | Als Spieler möchte ich, dass Poker nach offiziellen Texas-Hold'em-Regeln ausgewertet wird (Handrangfolge, Blinds, Setzrunden, Side-Pots). | 1 | 8 | 3 | codex/US-08-poker-engine |
| US-09 | Als Spieler möchte ich am Pokertisch gegen drei Computergegner spielen (Passen, Mitgehen, Erhöhen, All-In) und das Rundenergebnis sehen. | 1 | 8 | 3 | codex/US-09-poker-table |
| US-10 | Als Spieler möchte ich, dass Roulette-Einsätze korrekt ausbezahlt werden (Zahl 35:1, Dutzend 2:1, einfache Chancen 1:1, Zéro). | 1 | 5 | 4 | codex/US-10-roulette-engine |
| US-11 | Als Spieler möchte ich auf dem Roulette-Tableau mehrere Einsätze platzieren, den Kessel drehen und das Ergebnis samt Verlauf sehen. | 1 | 5 | 4 | codex/US-11-roulette-table |
| US-12 | Als Spieler möchte ich einen animierten 3D-Roulettekessel (Blender-Modell) sehen, in dem die Kugel auf der Gewinnzahl landet. | 2 | 8 | 4 | codex/US-12-roulette-3d-wheel |

## Ergänzungen aus dem Review

| ID | User Story | Status |
|---|---|---|
| US-13 | Als Spieler möchte ich auf Kolonnen setzen, damit weitere Wettarten verfügbar sind. | Weiterhin nicht umgesetzt; ausserhalb des Release-Umfangs. |
| US-14 | Als Spieler möchte ich eine Sitzung speichern, damit ich sie fortsetzen kann. | Weiterhin nicht umgesetzt; Persistenz ist nicht gefordert. |
| US-15 | Als Besucher möchte ich das Casino-Wappen im Browsertab sehen, damit ich die Seite erkenne. | Favicon mit vier Grössen umgesetzt und geprüft. |
| US-16 | Als Lehrperson möchte ich den geprüften Release mit Codecommit, Tests, Dokumenten und Git-Historie nachvollziehen, damit ich die Abgabe überprüfen kann. | Akzeptanz: reproduzierbare Installation, Tests und Build; konsistente Word- und PPTX-Kopien; Nachweismatrix für 14 Kriterien; ZIP und Git-Bundle; verbleibende persönliche Reviews und Deployment ausdrücklich offen. |
