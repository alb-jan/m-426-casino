# Casino Goldenes Ass

Schulprojekt M426 von Silas Zwicker und Jan Albers. Texas Hold'em an vier Plätzen gegen drei Bots und europäisches Roulette teilen ein Jeton-Guthaben. Die Anwendung verwendet ausschliesslich Spielgeld und speichert die Sitzung im Arbeitsspeicher.

## Start und Prüfung

Node **24.16.0** (siehe `.nvmrc`) verwenden. Das Lockfile bleibt verbindlich.

```sh
npm ci
npm run test:ci
npm run typecheck
npm run lint
npm run build
npm run start
```

Anschliessend http://localhost:3000 öffnen. Für die Entwicklung: `npm run dev`.
Der Testbericht liegt unter `artifacts/tests.json`.

## Release und Nachweise

Der verbesserte Stand liegt auf `codex/US-16-release`. Die Pull Requests sind für persönliche Reviews vorbereitet. Auf Wunsch des Auftraggebers erfolgen diese Reviews später. Dieser Kandidat wurde deshalb noch nicht nach `main` übernommen. Das Deployment führt der Auftraggeber ebenfalls später selbst durch; die bisherige Vercel-Adresse belegt den neuen Kandidaten noch nicht.

- [Release und Prozessnachweise](docs/release-improvement.md)
- [Architektur und Arbeitsweise](docs/README.md)
- [Product Backlog](docs/product-backlog.md)
- [Nachträgliche Branch-Namenskorrektur](docs/branch-renaming.md)
- [Manuelle Freigabe und Bereitstellung](docs/release-handover.md)

TypeScript, Poker als eigene Spielidee und öffentliches GitHub sind laut ausdrücklicher Teamangabe von der Lehrperson erlaubt. Frühere Nachweislücken werden durch die Ergänzungen nicht rückwirkend geschlossen. Die neue Arbeit erfolgte KI-unterstützt über `alb-jan`; persönliche Beiträge oder Reviews von Silas werden dadurch nicht behauptet.
