# Casino Goldenes Ass – Projektdokumentation

Schulprojekt (Modul 426 – Software agil entwickeln). Eine Casino-Web-App mit
**Texas Hold'em Poker** und **europäischem Roulette** (inkl. 3D-Kessel aus Blender),
umgesetzt mit **Next.js (App Router) · React · TypeScript**.

Das visuelle Design stammt aus dem Prototyp `Casino Goldenes Ass.dc.html`
(Zip „Casino-App mit Poker und Roulette“) und wird möglichst 1:1 umgesetzt.

## Vorgehen: Scrum-light + TDD

| Element | Umsetzung im Projekt |
|---|---|
| Product Backlog | [`product-backlog.md`](./product-backlog.md) – User Stories mit Priorität und Story Points |
| Sprints | 4 Sprints (siehe unten), jeder Sprint liefert ein lauffähiges Inkrement |
| Sprint Planning | Pro Feature-Branch: Abschnitt „Planung“ im zugehörigen Dokument |
| Daily / Review | Kurze Notizen „Probleme & Lösungen“ in jedem Feature-Dokument |
| Retrospektive | Abschnitt „Retrospektive“ am Ende jedes Sprints in [`dev-integration.md`](./dev-integration.md) |
| Definition of Done | siehe unten |

### Test Driven Development (Red → Green → Refactor)

Jedes Feature wird in drei (bis vier) Schritten committet:

1. `docs(...)`: Planung – Funktionen, Aufbau, Akzeptanzkriterien werden dokumentiert.
2. `test(...)`: **Rote Tests** – die Tests werden geschrieben und committet, **bevor** Code existiert.
   Die Tests schlagen zu diesem Zeitpunkt fehl (Nachweis im Dokument).
3. `feat(...)`: **Grüne Umsetzung** – minimaler Code, bis alle Tests grün sind.
4. `refactor(...)` / `docs(...)`: optionales Aufräumen und Nachführen der Dokumentation.

### Definition of Done

- Alle Akzeptanzkriterien der User Story sind durch Tests abgedeckt.
- `npm test` ist grün, `npm run lint` und `npx tsc --noEmit` ohne Fehler.
- Das Feature-Dokument beschreibt Funktionen, Tests, Probleme und Lösungen.
- Das UI entspricht visuell dem Design-Prototyp.

## Branch-Strategie

- `main` wird **nicht** verändert.
- Jedes Feature hat einen eigenen Branch `feature/<name>`.
- Features, die auf einem anderen Feature aufbauen, werden von diesem Branch abgezweigt.
- Am Schluss werden alle Features in den lokalen Branch `dev` gemerged (Integrationstest der ganzen App).

```
main
 └─ feature/project-setup
     └─ feature/notifications
         └─ feature/chips-wallet
             ├─ feature/landing-page
             ├─ feature/chip-purchase
             ├─ feature/lobby
             ├─ feature/cashout
             ├─ feature/poker-engine ── feature/poker-table
             └─ feature/roulette-engine ── feature/roulette-table ── feature/roulette-3d-wheel
                                                         ▼
                                                        dev
```

## Sprints

| Sprint | Ziel | Branches |
|---|---|---|
| 1 – Fundament | Projekt, Tests, Design-Grundlagen, Guthaben, Benachrichtigungen | project-setup, notifications, chips-wallet |
| 2 – Casino-Rahmen | Landing, Jetons-Kauf, Spielauswahl, Kasse | landing-page, chip-purchase, lobby, cashout |
| 3 – Poker | Spiellogik und Pokertisch | poker-engine, poker-table |
| 4 – Roulette | Spiellogik, Tableau, 3D-Kessel | roulette-engine, roulette-table, roulette-3d-wheel |

## Feature-Dokumente

| Branch | Dokument |
|---|---|
| feature/project-setup | [feature-project-setup.md](./feature-project-setup.md) |
| feature/notifications | [feature-notifications.md](./feature-notifications.md) |
| feature/chips-wallet | [feature-chips-wallet.md](./feature-chips-wallet.md) |
| feature/landing-page | [feature-landing-page.md](./feature-landing-page.md) |
| feature/chip-purchase | [feature-chip-purchase.md](./feature-chip-purchase.md) |
| feature/lobby | [feature-lobby.md](./feature-lobby.md) |
| feature/cashout | [feature-cashout.md](./feature-cashout.md) |
| feature/poker-engine | [feature-poker-engine.md](./feature-poker-engine.md) |
| feature/poker-table | [feature-poker-table.md](./feature-poker-table.md) |
| feature/roulette-engine | [feature-roulette-engine.md](./feature-roulette-engine.md) |
| feature/roulette-table | [feature-roulette-table.md](./feature-roulette-table.md) |
| feature/roulette-3d-wheel | [feature-roulette-3d-wheel.md](./feature-roulette-3d-wheel.md) |
| dev | [dev-integration.md](./dev-integration.md) |

## Befehle

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:3000
npm test           # alle Tests (Vitest, einmalig)
npm run test:watch # Tests im Watch-Modus
npm run lint
```
