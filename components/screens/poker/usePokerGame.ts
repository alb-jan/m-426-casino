"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLeaveGuard, useNavigation, useWalletActions, useWalletState } from "@/components/casino/CasinoProvider";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { newProfile, observe } from "@/lib/poker/opponentModel";
import { newDeck, type Card, type Rng } from "@/lib/poker/cards";
import { applyAction, BB, BOT_STACK, newHand, nextHandStacks, SEATS, type PokerAction, type PokerState } from "@/lib/poker/engine";
import { defaultRaise, outcomeMessage, presentOutcome, raiseStep } from "@/lib/poker/view";
import { useChipFlights } from "./useChipFlights";
import { usePokerTurnScheduler } from "./usePokerTurnScheduler";
export type { FlyingChip } from "./useChipFlights";
export interface PokerGameOptions { deckFactory?:()=>Card[];rng?:Rng;botDelay?:number;runoutDelay?:number }
export function usePokerGame({deckFactory=()=>newDeck(),rng=Math.random,botDelay=950,runoutDelay=900}:PokerGameOptions={}) {
 const wallet=useWalletState();
 const {setChips}=useWalletActions();
 const {navigate}=useNavigation();
 const notify=useNotify();
 const [hand,setHand]=useState(()=>newHand([wallet.chips,BOT_STACK,BOT_STACK,BOT_STACK],0,deckFactory()));
 const [game,setGame]=useState(hand);
 const [raiseAmt,setRaiseAmt]=useState(()=>defaultRaise(hand));
 const profile=useRef(newProfile());
 const {flights,fly,award}=useChipFlights(hand);
 const commit=useCallback((prev:PokerState,next:PokerState)=>{
   setGame(next);setRaiseAmt(defaultRaise(next));
   next.players.forEach((player,i)=>fly(i,player.committed-prev.players[i].committed));
   if(next.phase==="done"&&prev.phase!=="done"&&next.result) {
     const view=presentOutcome(next)!;notify(view.kind,view.title,outcomeMessage(next));
     if(next.result.winners.length)award(next.result.winners[0]);
   }
 },[fly,notify,award]);
 useEffect(()=>{setChips(game.players[0].stack);},[game,setChips]);
 usePokerTurnScheduler(game,commit,{rng,botDelay,runoutDelay,profile});
 useLeaveGuard("poker",()=>game.phase==="done"?{allowed:true}:{allowed:false},game.phase!=="done");
 const myTurn=game.phase==="bet"&&game.toAct===0;
 const act=(action:PokerAction,target?:number)=>{
   if(!myTurn)return;
   const next=applyAction(game,action,target);
   profile.current=observe(profile.current,action,next.players[0].committed-game.players[0].committed,game.pot);
   commit(game,next);
 };
 return {
   game,flights,raiseAmt,myTurn,waiting:game.phase==="bet"&&!myTurn,
   fold:()=>act("fold"),call:()=>act("call"),raise:()=>act("raise",raiseAmt),
   allIn:()=>act("raise",game.players[0].bet+game.players[0].stack),
   raiseUp:()=>setRaiseAmt((old)=>raiseStep(game,old,1)),raiseDown:()=>setRaiseAmt((old)=>raiseStep(game,old,-1)),
   nextHand:()=>{
     if(game.phase!=="done")return;
     if(game.players[0].stack<BB){navigate({kind:"lobby"});return;}
     const next=newHand(nextHandStacks(game),(game.dealer+1)%SEATS,deckFactory());
     setHand(next);setGame(next);setRaiseAmt(defaultRaise(next));
   },
   toLobby:()=>navigate({kind:"lobby"}),
 };
}
