"use client";
import { useEffect, type RefObject } from "react";
import { botDecision } from "@/lib/poker/bot";
import { advanceRunout, applyAction, type PokerState } from "@/lib/poker/engine";
import type { Rng } from "@/lib/poker/cards";
import type { newProfile } from "@/lib/poker/opponentModel";
interface Options {rng:Rng;botDelay:number;runoutDelay:number;profile:RefObject<ReturnType<typeof newProfile>>}
export function usePokerTurnScheduler(game:PokerState,commit:(before:PokerState,after:PokerState)=>void,{rng,botDelay,runoutDelay,profile}:Options) {
 useEffect(()=>{
   if(game.phase==="bet"&&!game.players[game.toAct].human) {
     const timer=setTimeout(()=>{const choice=botDecision(game,rng,{profile:profile.current});commit(game,applyAction(game,choice.action,choice.target));},botDelay);
     return ()=>clearTimeout(timer);
   }
   if(game.phase==="runout") {
     const timer=setTimeout(()=>commit(game,advanceRunout(game)),runoutDelay);
     return ()=>clearTimeout(timer);
   }
 },[game,commit,rng,botDelay,runoutDelay,profile]);
}
