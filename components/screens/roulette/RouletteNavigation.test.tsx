import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoApp } from "@/components/CasinoApp";
import { RouletteScreen } from "./RouletteScreen";
import type { GameDefinition } from "@/components/games/registry";
const wheel=vi.hoisted(()=>({finish:()=>{}}));
vi.mock("@/components/roulette3d/RouletteWheel3D",()=>({RouletteWheel3D:({onSpinEnd}:{onSpinEnd:()=>void})=>{wheel.finish=onSpinEnd;return <div/>;}}));
const games:GameDefinition[]=[{id:"roulette",title:"Roulette",minimum:10,entryReason:"kleinster Jeton",description:"Test",meta:"Test",cta:"Setzen →",Art:()=>null,Screen:()=> <RouletteScreen rng={()=>17.5/37}/>}];
const start=()=>render(<CasinoApp initial={{screen:"roulette",chips:250,bought:25,cashed:0}} games={games}/>);
const click=(name:string|RegExp)=>act(()=>screen.getByRole("button",{name}).click());
describe("US-11 Wallet und Navigation",()=>{
 beforeEach(()=>vi.useFakeTimers()); afterEach(()=>vi.useRealTimers());
 it("erstattet vor einer Drehung beim Zurückgehen alle Einsätze",()=>{
  start();click("Rot");expect(screen.getByTestId("header-balance")).toHaveTextContent("240");
  click(/Zurück zur Spielauswahl/);
  expect(screen.getByRole("heading",{name:"Spielauswahl"})).toBeInTheDocument();
  expect(screen.getByTestId("header-balance")).toHaveTextContent("250");
  click(/Setzen →/);expect(screen.getByTestId("total-bet")).toHaveTextContent("0");
 });
 it("sperrt die Rückkehr bis zur einmaligen Auszahlung",()=>{
  start();click("Schwarz");click("Zahl 17");click("Drehen");
  expect(screen.getByRole("button",{name:/Zurück zur Spielauswahl/})).toBeDisabled();
  const complete=wheel.finish;act(()=>{complete();complete();});
  expect(screen.getByTestId("header-balance")).toHaveTextContent("610");
  expect(screen.getByRole("button",{name:/Zurück zur Spielauswahl/})).toBeEnabled();
 });
 it("wertet eine neue Drehung nicht durch einen alten Animationscallback aus",()=>{
  start();click("Rot");click("Drehen");const previous=wheel.finish;act(()=>previous());
  click("Rot");click("Drehen");act(()=>previous());
  expect(screen.getByText("Kessel dreht")).toBeInTheDocument();
  expect(screen.getByRole("button",{name:/Zurück zur Spielauswahl/})).toBeDisabled();
 });
});
