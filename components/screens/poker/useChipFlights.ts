"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { calculateChips } from "@/lib/chips";
import type { PokerState } from "@/lib/poker/engine";
export interface FlyingChip { id:number;val:number;seat:number;at:"seat"|"pot"|"win";win?:number;jx:number;jy:number;rot:number;z:number }
export function useChipFlights(hand:PokerState) {
 const [flights,setFlights]=useState<FlyingChip[]>([]);
 const timers=useRef(new Set<ReturnType<typeof setTimeout>>());
 const ids=useRef({id:0,z:10});
 const cancel=useCallback(()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);
 const later=useCallback((fn:()=>void,ms:number)=>{
   const pending=timers.current;
   const timer=setTimeout(()=>{pending.delete(timer);fn();},ms);pending.add(timer);
 },[]);
 const fly=useCallback((seat:number,amount:number)=>{
   if(amount<=0)return;
   const items=calculateChips(amount).slice(0,10).map((val)=>({id:++ids.current.id,val,seat,at:"seat" as const,jx:Math.round((Math.random()-.5)*30),jy:Math.round((Math.random()-.5)*30),rot:Math.round((Math.random()-.5)*90),z:++ids.current.z}));
   setFlights((old)=>[...old,...items]);
   items.forEach((item,i)=>later(()=>setFlights((old)=>old.map((chip)=>chip.id===item.id?{...chip,at:"pot"}:chip)),30+i*65));
 },[later]);
 const award=useCallback((seat:number)=>later(()=>{
   setFlights((old)=>old.map((chip)=>({...chip,at:"win",win:seat})));
   later(()=>setFlights([]),900);
 },700),[later]);
 useEffect(()=>{
   hand.players.forEach((player,i)=>fly(i,player.committed));
   return ()=>{cancel();setFlights([]);};
 },[hand,fly,cancel]);
 return {flights,fly,award};
}
