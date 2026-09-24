# Feature: Spielauswahl / Lobby (`feature/lobby`)

**User Story:** US-06 · **Sprint:** 2 · **Story Points:** 3 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
„Schritt 2 von 3“: Der Spieler sieht sein Guthaben (inkl. Auszahlungswert in CHF), wählt Poker oder
Roulette oder verlässt das Casino über die Kasse.

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `lib/lobby.ts` → `GAME_MIN_CHIPS` | Mindestguthaben: Poker 20 (Big Blind), Roulette 10 (kleinster Jeton) | Konstante |
| `lib/lobby.ts` → `checkGameEntry(game, chips)` | Darf der Spieler an den Tisch? | `{ ok: true }` oder `{ ok: false, title, msg }` (Warn-Toast-Texte aus dem Prototyp) |
| `components/screens/lobby/LobbyScreen.tsx` | Kopfbereich mit Guthaben-Box, zwei Spielkarten, „Casino verlassen“-Leiste | Karten sind Buttons; Hover hebt Karte an und färbt den Rand gold |
| `components/screens/lobby/GameArt.tsx` | Kartenpaar A♠/K♥ und Mini-Roulettekessel (conic-gradient) | reine Darstellung |
| `CasinoApp` | Bildschirm `lobby` verwendet `LobbyScreen` | |

### Akzeptanzkriterien
- Guthaben `1’000 Jetons` und `≈ CHF 100.00 Auszahlungswert` sind sichtbar.
- Klick auf Poker/Roulette mit genügend Jetons öffnet den Tisch.
- Mit zu wenig Jetons erscheint ein Warn-Toast („Zu wenig Jetons“) und die Lobby bleibt offen.
- „Auszahlen & verlassen“ führt zur Kasse.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/lobby.test.ts` | Mindestguthaben, Zutritt erlaubt, Poker < 20 und Roulette < 10 verweigert inkl. Texte |
| `components/screens/lobby/LobbyScreen.test.tsx` | Schritt/Titel/Guthaben/CHF-Wert, beide Spielkarten, Poker öffnen, Roulette öffnen, Warnung bei zu wenig Jetons, Auszahlung |

**Ergebnis Red-Phase:** 2 Testdateien rot. ✔
