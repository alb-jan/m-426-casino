# Release Verbesserung US 16

## Ergebnis und offene Freigabe

Die Arbeitsphase ab 29.10.2026 korrigiert Kaufvalidierung, Navigation und Rückerstattung, setzt das klassische State-Pattern im Roulette ein und vereinheitlicht den Observer. Poker verwendet getrennte Hooks und einen Presenter. Die Dokumente liegen als neue Abgabekopien unter [abgabe](abgabe).

Die persönlichen Reviews folgen auf ausdrücklichen Wunsch später. Deshalb bleibt `main` unverändert auf `808ae4881692f687dcf08604e13e5862c6459230`. Der Kandidat liegt auf `codex/US-16-release`. Das Vercel-Deployment führt der Auftraggeber später selbst durch. Der alte Vercel-Stand wird nicht als Nachweis dieses Kandidaten gewertet.

## Herkunft der Arbeit

Alle neuen Änderungen entstanden KI-unterstützt im Auftrag von Jan über `alb-jan`. Es wurden keine Autoren, Commitdaten oder Silas-Reviews erfunden. Die ursprünglichen technischen Feature-Commits mit `Silaz3142` bleiben erhalten. Die im Plan vorgesehene persönliche neue Aufgabenverteilung wurde nicht in dieser Form ausgeführt und wird nicht als nachgewiesen behauptet.

TypeScript, Poker und öffentliches GitHub sind laut ausdrücklicher Teamangabe von der Lehrperson erlaubt. Eine schriftliche Bestätigung wird nicht fingiert.

## Sicherung und Branches

Vor Änderungen wurden Originale mit Prüfsummen und alle Ausgangsreferenzen als Git-Bundle gesichert. Zwölf historische Feature-Referenzen wurden erst nach Prüfung identischer neuer Remote-Hashes umbenannt. [branch-renaming.md](branch-renaming.md) enthält alte Namen, neue Namen und vollständige unveränderte Commit-IDs. Dies ist eine nachträgliche Namenskorrektur.

Neue Branches enthalten ihre Story-ID von Beginn an. Abhängige Pakete begannen am gemeinsamen CI-Fundament oder Release-Kandidaten; der Plan, jedes Paket unmittelbar ab main zu starten, wurde damit nicht durchgängig eingehalten. Integrationsmerges im Kandidaten ersetzen den späteren Merge nach main nicht.

## Prüffähige Arbeitspakete

| Story | Branch | Vorbereiteter Pull Request | Tatsächliche Änderung |
|---|---|---|---|
| US-01 | codex/US-01-ci-evidence | [1](https://github.com/alb-jan/m-426-casino/pull/1) | CI und maschinenlesbare Testberichte |
| US-05 | codex/US-05-purchase-validation | [2](https://github.com/alb-jan/m-426-casino/pull/2) | Vollständige Syntaxprüfung und Rappenrechnung |
| US-02 | codex/US-02-observer | [3](https://github.com/alb-jan/m-426-casino/pull/3) | Provider-eigener oder injizierter Bus, ein Publisherweg, Cleanup |
| US-11 | codex/US-11-roulette-state | [4](https://github.com/alb-jan/m-426-casino/pull/4) | Drei Zustandsklassen, Rückerstattung, eindeutige Auswertung |
| US-06 | codex/US-06-game-registry | [5](https://github.com/alb-jan/m-426-casino/pull/5) | Registry, typisierte Routen, zentrale Eintritts- und Verlassensprüfung |
| US-09 | codex/US-09-poker-separation | [6](https://github.com/alb-jan/m-426-casino/pull/6) | Timer und Jetonanimation getrennt, fachliche Ergebnisdaten, Navigationssperre |
| US-15 | codex/US-15-favicon | [7](https://github.com/alb-jan/m-426-casino/pull/7) | Vierformatiges Icon aus dem bestehenden Wappen |
| US-10 | codex/US-10-roulette-presenter | [8](https://github.com/alb-jan/m-426-casino/pull/8) | Deutsche Labels und CSS-Farben aus den Roulette-Regeln entfernt |
| US-16 | codex/US-16-release | Gemeinsamer Release-PR nach main | Dokumente, Browserabnahme, Prüfberichte und ZIP |

## Test vor Implementierung

Die Test-Commits wurden tatsächlich gepusht und der erwartete rote CI-Lauf wurde vor der Umsetzung geprüft. Die Rohberichte im Abgabepaket enthalten Datum, Commit und echte Resultate.

| Paket | Test-Commit | Roter Lauf | Grüner Implementierungsstand |
|---|---|---|---|
| US-05 | ed55fc2 | [40852019953](https://github.com/alb-jan/m-426-casino/actions/runs/40852019953) | ec94b71 / [40852369424](https://github.com/alb-jan/m-426-casino/actions/runs/40852369424) |
| US-02 | 98c300d | [40852254318](https://github.com/alb-jan/m-426-casino/actions/runs/40852254318) | 3c64721 / [40855356507](https://github.com/alb-jan/m-426-casino/actions/runs/40855356507) |
| US-11 State | b4a37c0 | [40852448809](https://github.com/alb-jan/m-426-casino/actions/runs/40852448809) | cbc0f62 / [40854617713](https://github.com/alb-jan/m-426-casino/actions/runs/40854617713) |
| US-06 | 84e1ae7 | [40852983226](https://github.com/alb-jan/m-426-casino/actions/runs/40852983226) | 5e98a4b / [40853870050](https://github.com/alb-jan/m-426-casino/actions/runs/40853870050) |
| US-11 UI | 235a5d9 | [40854039297](https://github.com/alb-jan/m-426-casino/actions/runs/40854039297) | cbc0f62 / [40854617713](https://github.com/alb-jan/m-426-casino/actions/runs/40854617713) |
| US-09 | b539a20 | [40854319880](https://github.com/alb-jan/m-426-casino/actions/runs/40854319880) | f1544f6 / [40855345594](https://github.com/alb-jan/m-426-casino/actions/runs/40855345594) |
| US-15 | eca9f80 | [40857432235](https://github.com/alb-jan/m-426-casino/actions/runs/40857432235) | 412a959 / [40857799639](https://github.com/alb-jan/m-426-casino/actions/runs/40857799639) |
| US-10 | d5ff3fa | [40861318489](https://github.com/alb-jan/m-426-casino/actions/runs/40861318489) | 2d93193 / [40970211633](https://github.com/alb-jan/m-426-casino/actions/runs/40970211633) |

Der erste Icon-Test hatte einen jsdom-URL-Fehler. Erst der korrigierte Test mit belegtem ENOENT zählt als erwarteter roter Ressourcennachweis. Der US-09-Lauf enthielt zusätzlich alte Provider-Fixtures, die in einem eigenen Commit repariert wurden. Die State-Red-Phase scheiterte beim Modulimport und hatte daher noch keine fehlgeschlagenen Einzeltests. Ein zwischenzeitlicher US-10-Lauf bestand 309 Tests, Typecheck und Lint, scheiterte aber am Produktionsbuild; die Direktivenreihenfolge wurde anschliessend separat korrigiert.

Die mobile CSS-Korrektur wurde durch einen vorher dokumentierten Browserfehler beschrieben. Die Unit-CI misst kein reales Layout und wird nicht als künstlicher roter Layoutnachweis ausgegeben. Die abschliessenden Gewinn-Observer-Tests ergänzen die Abnahme einer bereits implementierten Funktion.

## Fachliche Abnahme

- Kauf akzeptiert nur vollständige gültige Beträge mit optionalem CHF-Präfix, Punkt oder Komma und höchstens zwei Nachkommastellen. Rappen sind ganzzahlig; Jetons werden abgerundet.
- Navigation verwendet dieselbe Registry für Lobby, Mindestguthaben und Bildschirm. Unbekannte Spiele und gesperrte Wechsel werden auch bei direktem Aufruf abgewiesen.
- Roulette: BettingState erlaubt Rückerstattung beim Verlassen; SpinningState sperrt Änderungen und Rückkehr; ResultState gibt sie wieder frei. Context und Zustände benötigen weder React noch Wallet.
- Eine Runden-ID verhindert Mehrfachauszahlung und die Auswertung einer neuen Runde durch alte Animationscallbacks.
- Ein real berechneter Roulette-Gewinn erzeugt im Integrationstest ein Bus-Ereignis und genau einen Toast, auch bei doppeltem Abschlusscallback.
- Poker-Regeltests zu Blinds, Side-Pots, Gleichständen, All-In, Dealerrotation und Wallet bleiben erhalten.
- Der injizierte Szenenvertrag wird auf spinTo und dispose geprüft. Der WebGL-Ersatzkessel wurde zusätzlich im Browser mit der unveränderten Release-Komponente in einem temporären Harness geprüft.

## Browser und Dokumente

Desktop: 1440 × 1000. Mobil: 390 × 844. Die Abnahme prüfte Kauf, Lobby, Roulette, Poker, Kasse und Neustart. Die Rückerstattung 250 → 240 → 250 wurde sichtbar bestätigt. Nach der mobilen CSS-Korrektur wurden clientWidth und scrollWidth für Kauf, Lobby, Roulette und Poker gleich gemessen; vorher war der Kaufbereich 551 CSS-Pixel breit.

Word wurde mit Microsoft Word nativ gerendert, das Inhaltsverzeichnis aktualisiert und sämtliche Seiten visuell geprüft. Alle sechs Powerpoints wurden mit dem vorgeschriebenen Präsentationswerkzeug exportiert, strukturell validiert und in PowerPoint gerendert. Die sechs editierbaren Einbettungen im Word stimmen bytegenau mit den gelieferten PPTX-Dateien überein. Der vollständige Dokumentprüfbericht nennt Hashes und Seitenzahl.

## Verbleibende Schritte

Persönliche Reviews, Übernahme nach main und das vom Auftraggeber selbst durchzuführende Vercel-Deployment bleiben offen. [release-handover.md](release-handover.md) beschreibt die konkrete Übergabe. Frühere, nicht dokumentierte Pushes oder persönliche Arbeitsschritte werden durch die neuen Nachweise nicht rückwirkend belegt.

Die abschliessenden Desktopaufnahmen vom 31.10.2026 zeigen den bereits vollständig grün geprüften Codecommit 5a4c5d2. Die reine Dokumentaktualisierung danach verändert den Anwendungscode nicht.
