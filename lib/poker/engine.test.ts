import { presentOutcome } from "./view";
import { describe, expect, it } from "vitest";
import { cards, newDeck, type Card } from "./cards";
import {
  advanceRunout,
  applyAction,
  BB,
  BOT_NAMES,
  buildPots,
  callAmount,
  maxRaiseTarget,
  minRaiseTarget,
  newHand,
  nextHandStacks,
  SB,
  type PokerState,
} from "./engine";

/**
 * Erzeugt ein Deck, aus dem (per pop) zuerst die Startkarten der Spieler 0–3
 * und danach die fünf Gemeinschaftskarten gezogen werden.
 */
function rig(holes: [string, string, string, string], board: string): Card[] {
  const order = [...holes.flatMap((h) => cards(h)), ...cards(board)];
  const used = new Set(order.map((c) => c.r + c.s));
  const filler = newDeck(() => 0.5).filter((c) => !used.has(c.r + c.s));
  return [...filler, ...order.reverse()];
}

/** Jetonsumme am Tisch; nach Handende ist der Pot bereits verteilt. */
const total = (s: PokerState) => s.players.reduce((a, p) => a + p.stack, 0) + (s.phase === "done" ? 0 : s.pot);

/** Alle Spieler schieben/gehen mit, bis die Hand vorbei ist. */
function checkDown(s: PokerState): PokerState {
  let guard = 0;
  while (s.phase === "bet" && guard++ < 50) s = applyAction(s, "call");
  while (s.phase === "runout" && guard++ < 60) s = advanceRunout(s);
  return s;
}

const RANDOM_DECK = () => newDeck(() => 0.3);

describe("Konstanten", () => {
  it("Blinds 10 / 20 und drei Bots", () => {
    expect(SB).toBe(10);
    expect(BB).toBe(20);
    expect(BOT_NAMES).toEqual(["Vera", "Ruben", "Milla"]);
  });
});

describe("newHand", () => {
  it("teilt aus und setzt die Blinds", () => {
    const s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    expect(s.players.map((p) => p.name)).toEqual(["Du", "Vera", "Ruben", "Milla"]);
    expect(s.players[0].human).toBe(true);
    expect(s.players.every((p) => p.hole.length === 2)).toBe(true);
    expect(s.deck).toHaveLength(52 - 8);
    expect(s.players[1]).toMatchObject({ bet: SB, stack: 590, last: {kind:"small-blind"} });
    expect(s.players[2]).toMatchObject({ bet: BB, stack: 580, last: {kind:"big-blind"} });
    expect(s.pot).toBe(30);
    expect(s.currentBet).toBe(BB);
    expect(s.toAct).toBe(3);
    expect(s.street).toBe(0);
    expect(s.phase).toBe("bet");
  });

  it("rotiert Blinds mit dem Dealer", () => {
    const s = newHand([1000, 600, 600, 600], 2, RANDOM_DECK());
    expect(s.players[3].bet).toBe(SB);
    expect(s.players[0].bet).toBe(BB);
    expect(s.toAct).toBe(1);
  });

  it("setzt einen Spieler ohne genügend Jetons beim Blind All-In", () => {
    const s = newHand([15, 600, 600, 600], 2, RANDOM_DECK());
    expect(s.players[0]).toMatchObject({ bet: 15, stack: 0, allIn: true });
  });
});

describe("applyAction – Setzrunde", () => {
  it("verändert den ursprünglichen Zustand nicht", () => {
    const s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    const snapshot = JSON.stringify(s);
    applyAction(s, "call");
    expect(JSON.stringify(s)).toBe(snapshot);
  });

  it("wechselt nach allen Calls auf den Flop", () => {
    let s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    s = applyAction(s, "call"); // Milla 20
    expect(s.players[3].last).toEqual({kind:"call",amount:20});
    s = applyAction(s, "call"); // Du 20
    s = applyAction(s, "call"); // Vera +10
    expect(s.street).toBe(0);
    s = applyAction(s, "call"); // Ruben schiebt
    expect(s.street).toBe(1);
    expect(s.community).toHaveLength(3);
    expect(s.pot).toBe(80);
    expect(s.currentBet).toBe(0);
    expect(s.players.every((p) => p.bet === 0)).toBe(true);
    expect(s.toAct).toBe(1); // erster aktiver Spieler links vom Dealer
  });

  it("deckt Turn und River einzeln auf", () => {
    let s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    for (let i = 0; i < 4; i++) s = applyAction(s, "call");
    expect(s.players[1].last).toBeNull();
    s = applyAction(s, "call");
    expect(s.players[1].last).toEqual({kind:"check"});
    for (let i = 0; i < 3; i++) s = applyAction(s, "call");
    expect(s.street).toBe(2);
    expect(s.community).toHaveLength(4);
    for (let i = 0; i < 4; i++) s = applyAction(s, "call");
    expect(s.street).toBe(3);
    expect(s.community).toHaveLength(5);
  });

  it("überspringt Spieler, die gepasst haben", () => {
    let s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    s = applyAction(s, "fold"); // Milla
    expect(s.players[3]).toMatchObject({ folded: true, last: {kind:"fold"} });
    expect(s.toAct).toBe(0);
  });

  it("erzwingt die Mindesterhöhung", () => {
    let s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    expect(minRaiseTarget(s)).toBe(40);
    s = applyAction(s, "raise", 25);
    expect(s.currentBet).toBe(40);
    expect(s.players[3].last).toEqual({kind:"raise",amount:40});
    s = applyAction(s, "raise", 100); // Du erhöht um 60
    expect(s.minRaise).toBe(60);
    expect(minRaiseTarget(s)).toBe(160);
  });

  it("eine Erhöhung eröffnet die Runde für alle anderen neu", () => {
    let s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    s = applyAction(s, "call"); // Milla
    s = applyAction(s, "call"); // Du
    s = applyAction(s, "call"); // Vera
    s = applyAction(s, "raise", 60); // Ruben
    expect(s.street).toBe(0);
    expect(s.players.filter((p) => !p.folded && p.acted).map((p) => p.name)).toEqual(["Ruben"]);
    expect(s.toAct).toBe(3);
  });

  it("ein All-In unter dem Einsatz eröffnet die Runde nicht neu", () => {
    let s = newHand([30, 600, 600, 600], 0, RANDOM_DECK());
    s = applyAction(s, "raise", 100); // Milla auf 100
    s = applyAction(s, "raise", 30); // Du All-In 30 (weniger als 100)
    expect(s.players[0]).toMatchObject({ allIn: true, bet: 30, stack: 0, last: {kind:"all-in",amount:30} });
    expect(s.currentBet).toBe(100);
    expect(s.players[3].acted).toBe(true);
    expect(s.toAct).toBe(1);
  });

  it("liefert Hilfswerte für die Aktionsleiste", () => {
    const s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    expect(callAmount(s, 3)).toBe(20);
    expect(callAmount(s, 2)).toBe(0);
    expect(maxRaiseTarget(s, 0)).toBe(1000);
    expect(maxRaiseTarget(s, 1)).toBe(600);
  });
});

describe("Handende", () => {
  it("gewinnt ohne Showdown, wenn alle anderen passen", () => {
    let s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    s = applyAction(s, "fold"); // Milla
    s = applyAction(s, "raise", 60); // Du
    s = applyAction(s, "fold"); // Vera
    s = applyAction(s, "fold"); // Ruben
    expect(s.phase).toBe("done");
    expect(s.players[0].stack).toBe(1030);
    expect(presentOutcome(s)).toMatchObject({ title: "Gewonnen!", kind: "win", sub: "Alle anderen haben gepasst." });
    expect(presentOutcome(s)!.rows[0]).toMatchObject({ name: "Du", hand: "gewinnt ohne Showdown", win: true, net: 30 });
    expect(presentOutcome(s)!.rows[1]).toMatchObject({ hand: "gepasst", net: -10 });
    expect(total(s)).toBe(2800);
  });

  it("wertet den Showdown aus", () => {
    const deck = rig(["As Ah", "Kd Kc", "7s 2d", "9c 4h"], "Ac 8d 3s Jh 5c");
    const s = checkDown(newHand([1000, 600, 600, 600], 0, deck));
    expect(s.phase).toBe("done");
    expect(s.players[0].stack).toBe(1060);
    expect(s.players[0].hand?.cat).toBe(3);
    expect(presentOutcome(s)).toMatchObject({ title: "Gewonnen!", kind: "win" });
    expect(presentOutcome(s)!.sub).toBe("Showdown – die besten fünf Karten zählen.");
    expect(presentOutcome(s)!.rows.map((r) => r.hand)).toEqual(["Drilling", "Paar", "Höchste Karte", "Höchste Karte"]);
    expect(s.result!.winners).toEqual([0]);
  });

  it("meldet eine verlorene Hand", () => {
    const deck = rig(["7s 2d", "Kd Kc", "As Ah", "9c 4h"], "Ac 8d 3s Jh 5c");
    const s = checkDown(newHand([1000, 600, 600, 600], 0, deck));
    expect(presentOutcome(s)).toMatchObject({ title: "Verloren", kind: "lose" });
    expect(s.players[2].stack).toBe(660);
  });

  it("teilt einen Split-Pot, Restjeton an den ersten Gewinner links vom Dealer", () => {
    const deck = rig(["2c 3d", "4h 5h", "2d 3c", "2h 3s"], "As Kd Qh Jc Ts");
    let s = newHand([1000, 600, 600, 600], 0, deck);
    s = applyAction(s, "call"); // Milla
    s = applyAction(s, "call"); // Du
    s = applyAction(s, "fold"); // Vera (10 bleiben im Pot)
    s = checkDown(s);
    // Pot 70 → 3 Gewinner: 24 / 23 / 23; Ruben (Dealer+2) sitzt als erster Gewinner links vom Dealer
    expect(s.players[2].stack).toBe(600 - 20 + 24);
    expect(s.players[0].stack).toBe(1000 - 20 + 23);
    expect(s.players[3].stack).toBe(600 - 20 + 23);
    expect(total(s)).toBe(2800);
  });

  it("verteilt Haupt- und Nebenpot bei All-In", () => {
    const deck = rig(["As Ah", "Kd Kc", "Qs Qd", "2c 3c"], "7h 8s 2d 9c 4s");
    let s = newHand([100, 600, 600, 600], 0, deck);
    s = applyAction(s, "fold"); // Milla
    s = applyAction(s, "raise", 100); // Du All-In
    s = applyAction(s, "call"); // Vera
    s = applyAction(s, "call"); // Ruben
    expect(s.street).toBe(1);
    expect(s.phase).toBe("bet");
    s = applyAction(s, "raise", 100); // Vera setzt 100 auf dem Flop
    s = applyAction(s, "call"); // Ruben
    s = checkDown(s);
    expect(s.players[0].stack).toBe(300); // Hauptpot 3 × 100
    expect(s.players[1].stack).toBe(600); // Nebenpot 2 × 100 an Vera (KK > QQ)
    expect(s.players[2].stack).toBe(400);
    expect(presentOutcome(s)!.sub).toContain("2 Pots (All-In)");
    expect(total(s)).toBe(1900);
  });

  it("deckt bei All-In ohne weitere Gegner die restlichen Karten automatisch auf", () => {
    const deck = rig(["As Ah", "Kd Kc", "Qs Qd", "2c 3c"], "7h 8s 2d 9c 4s");
    let s = newHand([100, 600, 600, 600], 0, deck);
    s = applyAction(s, "fold"); // Milla
    s = applyAction(s, "raise", 100); // Du All-In
    s = applyAction(s, "fold"); // Vera
    s = applyAction(s, "call"); // Ruben
    expect(s.phase).toBe("runout");
    expect(s.community).toHaveLength(3);
    s = advanceRunout(s);
    expect(s.community).toHaveLength(4);
    s = advanceRunout(s);
    expect(s.community).toHaveLength(5);
    s = advanceRunout(s);
    expect(s.phase).toBe("done");
    expect(s.players[0].stack).toBe(210);
  });
});

describe("buildPots", () => {
  it("bildet Stufen nach den eingezahlten Beträgen", () => {
    const players = [
      { committed: 100, folded: false },
      { committed: 300, folded: false },
      { committed: 300, folded: false },
      { committed: 50, folded: true },
    ];
    expect(buildPots(players)).toEqual([
      { amount: 200, eligible: [0, 1, 2] },
      { amount: 150, eligible: [0, 1, 2] },
      { amount: 400, eligible: [1, 2] },
    ]);
  });
});

describe("nextHandStacks", () => {
  it("füllt pleite Bots wieder auf 600 auf", () => {
    const s = newHand([1000, 600, 600, 600], 0, RANDOM_DECK());
    s.players[1].stack = 5;
    s.players[0].stack = 5;
    expect(nextHandStacks(s)).toEqual([5, 600, 580, 600]);
  });
});
