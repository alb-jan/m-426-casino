import { describe, expect, it } from "vitest";
import { newHand, applyAction } from "./engine";
import { newDeck } from "./cards";
import { presentOutcome } from "./view";
describe("US-09 fachliches Handergebnis und Presenter",()=>{
 it("liefert Ergebnisdaten getrennt von deutschen Anzeigetexten",()=>{
  let game=newHand([1000,600,600,600],0,newDeck(()=>0.5));
  game=applyAction(game,"fold");game=applyAction(game,"raise",60);game=applyAction(game,"fold");game=applyAction(game,"fold");
  expect(game.result).toMatchObject({reason:"folds",showdown:false,winners:[0],nets:[30,-10,-20,0]});
  expect(presentOutcome(game)).toMatchObject({title:"Gewonnen!",kind:"win",sub:"Alle anderen haben gepasst."});
 });
});
