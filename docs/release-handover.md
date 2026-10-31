# Release prüfen und übernehmen

Der Kandidat liegt auf `codex/US-16-release`. Die persönlichen Reviews und das Deployment werden nach ausdrücklicher Rückmeldung des Auftraggebers später durchgeführt.

1. Silas prüft die vorbereiteten Pull Requests mit seinem eigenen Account. Er kontrolliert insbesondere Auszahlung, Navigation, Timer und die geänderten Schnittstellen. Falls er Änderungen verlangt, folgen echte Korrekturcommits und neue Prüfungen.
2. Die Abhängigkeiten der Pull Requests beachten. Die Zusammenführung der Pakete im Release-Branch sind Integrationsmerges; sie ersetzen keinen persönlichen Review und keinen Merge nach `main`.
3. Den vollständig geprüften Release-PR mit **Create a merge commit** nach `main` übernehmen. Weder Squash noch Rebase verwenden; Quellbranches behalten.
4. Im bestehenden Vercel-Projekt `m-426-casino` das Deployment dieses neuen `main`-Commits auslösen. Kein neues Projekt oder kostenpflichtiges Angebot ist nötig.
5. Den tatsächlich bereitgestellten Commit mit dem Merge-Commit vergleichen. Auf https://m-426-casino.vercel.app/ den Kauf, beide Spiele, die Sperre während aktiver Runden, Kasse und Neustart prüfen. Desktop 1440 × 1000 und Mobil 390 × 844 testen.
6. Deployment-ID, URL, Commit, Zeitpunkt und Beobachtungen im Bericht ergänzen. Erst dann ist die bestehende Vercel-Adresse ein Nachweis für diesen Release.

Die GitHub-Actions-Pipeline führt mit Node 24.16.0 `npm ci`, Tests mit JSON-Bericht, Typecheck, Lint und Produktionsbuild aus. Ein grüner CI-Lauf belegt die Softwareprüfungen; er ersetzt die persönliche Prüfung und die Browserabnahme auf Vercel nicht.
