# Casino Goldenes Ass

Das Projekt verbindet Poker und Roulette mit Kauf, Lobby, Kasse und einem gemeinsamen Wallet. Kaufgrenzen sind CHF 5 bis 500. Ein CHF entspricht zehn Jetons; Bruchteile werden abgerundet. Nach einer aktiven Hand beziehungsweise Drehung ist die Rückkehr möglich. Offene Roulette-Einsätze werden beim Verlassen vor dem Dreh vollständig zurückerstattet.

## Architektur des Release-Kandidaten

- `lib/purchase.ts` prüft die vollständige Eingabe und rechnet mit ganzzahligen Rappen.
- `components/games/registry.tsx` enthält `GameDefinition` und die Spiel-Registry. Lobby und App-Shell lesen dieselben Definitionen. Ein Testspiel wird ohne neue Verzweigung integriert.
- `CasinoProvider` stellt getrennte Lese-, Aktions- und Navigationsverträge bereit. `navigate(AppRoute)` prüft Spiel-ID, Guthaben und Leave-Guard. Eine erlaubte Rückerstattung und der Wechsel bilden eine Wallet-Aktion.
- `RouletteGame` delegiert Aktionen an `BettingState`, `SpinningState` oder `ResultState`. Die Klassen benötigen weder React noch Wallet. Snapshots und Effekte sind unveränderlich; die Runden-ID verhindert doppelte und verspätete Auszahlungen.
- Poker bleibt eine funktionale Zustandsmaschine. `usePokerTurnScheduler` und `useChipFlights` kapseln Zeitabläufe und Animation. Die Engine liefert Ergebnisdaten; der Presenter in `lib/poker/view.ts` erzeugt Texte.
- `useNotify()` publiziert immer über den Bus des `NotificationProvider`. Der Provider besitzt eine eigene stabile Instanz oder erhält einen injizierten Bus. Sein Observer erzeugt die Toasts. Abonnements und Timer werden aufgeräumt.
- `RouletteWheel3D` akzeptiert eine SceneFactory mit `spinTo` und `dispose`. Der Standard lädt die echte three.js-Szene, Tests ersetzen den Vertrag. Ohne WebGL beziehungsweise bei Ladefehlern bleibt die Ersatzanimation bedienbar.

## Vorgehen und belegte Grenzen

Die vier ursprünglichen Inkremente und ihre Rückblicke stehen in [dev-integration.md](dev-integration.md). Diese Aufzeichnungen sind historische Teamdokumentation. Die frühere Integration aus `dev` wurde bereits nach `main` übernommen; die alte Aussage, `main` bleibe grundsätzlich unverändert, gilt nicht.

Die Verbesserung vom 29.10.2026 arbeitet mit Test-Commit, Push und geprüftem roten CI-Lauf vor der Umsetzung. Danach folgen Implementierungs-Commit, grüner CI-Lauf und Pull Request. Abhängige Pakete wurden auf dem gemeinsamen CI-Fundament beziehungsweise Release-Kandidaten aufgebaut. Dies weicht vom ursprünglich geplanten Start jedes Branches direkt ab `main` ab und ist in der Git-Historie sichtbar.

Die neue Arbeit wurde KI-unterstützt über `alb-jan` ausgeführt. Die im Verbesserungsplan vorgesehene persönliche Arbeitsteilung und die gegenseitigen Reviews sind damit nicht durchgeführt. Die persönlichen Reviews folgen laut Auftraggeber später. Erst danach soll der Kandidat mit Merge-Commit nach `main` übernommen werden; Quellbranches bleiben erhalten.

## Definition of Done

Akzeptanzkriterien haben passende Verhaltenstests. Tests, Typecheck, Lint und Produktionsbuild sind grün. Sichtbare Änderungen werden zusätzlich im Browser geprüft. Dokumente, Prüftag und Codecommit stimmen überein. Persönliche Reviews, Release-Merge und Deployment werden nur als erledigt geführt, wenn sie tatsächlich vorliegen.

## Dokumente

[Product Backlog](product-backlog.md), [Release-Nachweise](release-improvement.md), [Branch-Zuordnung](branch-renaming.md) und [Übergabe](release-handover.md) beschreiben den aktuellen Stand. Die zwölf `feature-*.md` bleiben als Entwicklungsaufzeichnungen erhalten. Ein Aktualisierungshinweis am Anfang grenzt den heutigen Vertrag von früheren Implementierungen ab.
