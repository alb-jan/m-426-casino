import { formatNumber } from "@/lib/format";
import { BB, callAmount, maxRaiseTarget, minRaiseTarget, SB, type PokerState } from "./engine";
import { evalBest, handName } from "./evaluate";

const STREETS = ["Pre-Flop", "Flop", "Turn", "River", "Showdown"];
const ME = 0;

export const streetLabel = (street: number) => STREETS[Math.min(street, 4)];

/** Beschriftung des Mitgehen-Buttons für den menschlichen Spieler. */
export function callLabel(s: PokerState): string {
  const need = callAmount(s, ME);
  const stack = s.players[ME].stack;
  if (need <= 0) return "Schieben";
  if (need >= stack) return `Mitgehen (All-In ${formatNumber(stack)})`;
  return `Mitgehen (${formatNumber(need)})`;
}

export const raiseLabel = (s: PokerState, amount: number) =>
  (s.currentBet > 0 ? "Erhöhen auf " : "Setzen ") + formatNumber(amount);

/** Startwert des Erhöhungsbetrags: mindestens 2 × Big Blind, höchstens All-In. */
export const defaultRaise = (s: PokerState) =>
  Math.min(maxRaiseTarget(s, ME), Math.max(minRaiseTarget(s), BB * 2));

/** Erhöhungsbetrag um einen Big Blind verändern, innerhalb Min/Max. */
export function raiseStep(s: PokerState, amount: number, dir: 1 | -1): number {
  const max = maxRaiseTarget(s, ME);
  const min = Math.min(minRaiseTarget(s), max);
  return Math.max(min, Math.min(max, amount + dir * BB));
}

export function myHandLabel(s: PokerState): string {
  if (!s.community.length) return `Blinds ${SB} / ${BB} Jetons`;
  return "Deine Hand: " + handName(evalBest([...s.players[ME].hole, ...s.community]));
}

export function seatStatus(s: PokerState, seat: number): { text: string; color: string } {
  const p = s.players[seat];
  const active = s.phase === "bet" && s.toAct === seat;
  return {
    text: p.folded ? "Gepasst" : actionText(p.last) || (active ? "Am Zug …" : ""),
    color: p.folded ? "#8A6F6C" : p.allIn ? "#F0C75C" : "#C9D3CA",
  };
}

/** Toast-Text zum Handende. */
export function outcomeMessage(s: PokerState): string {
  const res = s.result;
  if (!res) return "";
  const me = s.players[ME];
  const myNet = me.stack - me.startStack;
  if (myNet > 0) {
    return `Du gewinnst ${formatNumber(myNet)} Jetons${me.hand ? " mit " + handName(me.hand) : ""}.`;
  }
  const winners = res.winners.map((i) => s.players[i]);
  const best = winners[0]?.hand ? handName(winners[0].hand) : undefined;
  return `${winners.map((w) => w.name).join(" & ")} gewinnt den Pot${best ? " mit " + best : ""}.`;
}

export interface HandOutcomeView {
 title:string;kind:"win"|"lose"|"info";sub:string;
 rows:{name:string;hand:string;win:boolean;net:number}[];
}
export function actionText(action:PokerState["players"][number]["last"]):string {
 if(!action)return "";
 switch(action.kind){
 case "small-blind":return "Small Blind";
 case "big-blind":return "Big Blind";
 case "fold":return "Passt";
 case "check":return "Schiebt";
 case "call":return `Geht mit ${formatNumber(action.amount ?? 0)}`;
 case "all-in":return `All-In ${formatNumber(action.amount ?? 0)}`;
 case "raise":return `Erhöht auf ${formatNumber(action.amount ?? 0)}`;
 }
}
export function presentOutcome(game:PokerState):HandOutcomeView|null {
 const result=game.result;if(!result)return null;
 const net=result.nets[0];const folded=game.players[0].folded;
 return {
  title:net>0?"Gewonnen!":net===0||folded?"Runde beendet":"Verloren",
  kind:net>0?"win":net===0||folded?"info":"lose",
  sub:(result.reason==="folds"?"Alle anderen haben gepasst.":"Showdown – die besten fünf Karten zählen.")+(result.pots>1&&result.allIn?` · ${result.pots} Pots (All-In)`:""),
  rows:game.players.map((player,i)=>({name:player.name,hand:player.folded?"gepasst":result.showdown?(player.hand?handName(player.hand):"—"):"gewinnt ohne Showdown",win:result.winners.includes(i)&&result.nets[i]>0,net:result.nets[i]})),
 };
}
