import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "@/components/CasinoApp";
import { CasinoProvider, useCasino, useLeaveGuard } from "./CasinoProvider";
import { Header } from "@/components/layout/Header";
import type { GameDefinition } from "@/components/games/registry";

const demo:GameDefinition={id:"demo",title:"Testspiel",description:"Neues Spiel",minimum:50,entryReason:"Mindesteinsatz",meta:"Test",cta:"Öffnen",Art:()=>null,Screen:()=> <h1>Testspiel läuft</h1>};
function Probe(){
 const {state,navigate}=useCasino();
 return <><output data-testid="route">{state.route.kind==="game"?state.route.gameId:state.route.kind}</output><output data-testid="chips">{state.chips}</output><button onClick={()=>navigate({kind:"game",gameId:"demo"})}>direkter Einstieg</button><button onClick={()=>navigate({kind:"game",gameId:"missing"})}>unbekannt</button><button onClick={()=>navigate({kind:"lobby"})}>direkt zurück</button></>;
}
function Guard({locked=false}:{locked?:boolean}) {
 useLeaveGuard("demo",()=>locked?{allowed:false}:{allowed:true,refund:10},locked);
 return null;
}
describe("US-06 Registry und zentrale Navigation",()=>{
 it("integriert ein zusätzliches Spiel nur über seine Definition",()=>{
   render(<CasinoApp initial={{screen:"lobby",chips:100,bought:10,cashed:0}} games={[demo]}/>);
   act(()=>screen.getByRole("button",{name:/Öffnen/}).click());
   expect(screen.getByRole("heading",{name:"Testspiel läuft"})).toBeInTheDocument();
 });
 it("verhindert auch direkte Einstiege unter dem Mindestguthaben",()=>{
   render(<CasinoProvider initial={{screen:"lobby",chips:49,bought:5,cashed:0}} games={[demo]}><Probe/></CasinoProvider>);
   act(()=>screen.getByText("direkter Einstieg").click());
   expect(screen.getByTestId("route")).toHaveTextContent("lobby");
   expect(screen.getByTestId("chips")).toHaveTextContent("49");
 });
 it("verhindert unbekannte Spiele",()=>{
   render(<CasinoProvider games={[demo]}><Probe/></CasinoProvider>);
   act(()=>screen.getByText("unbekannt").click());
   expect(screen.getByTestId("route")).toHaveTextContent("landing");
 });
 it("sperrt Header und direkte Navigation während einer aktiven Runde",()=>{
   render(<CasinoProvider initial={{screen:"demo",chips:90,bought:10,cashed:0}} games={[demo]}><Guard locked/><Header/><Probe/></CasinoProvider>);
   expect(screen.getByRole("button",{name:/Zurück zur Spielauswahl/})).toBeDisabled();
   act(()=>screen.getByText("direkt zurück").click());
   expect(screen.getByTestId("route")).toHaveTextContent("demo");
   expect(screen.getByTestId("chips")).toHaveTextContent("90");
 });
 it("verbucht Rückerstattung und Navigation atomar und nur einmal",()=>{
   render(<CasinoProvider initial={{screen:"demo",chips:90,bought:10,cashed:0}} games={[demo]}><Guard/><Probe/></CasinoProvider>);
   act(()=>screen.getByText("direkt zurück").click());
   expect(screen.getByTestId("route")).toHaveTextContent("lobby");
   expect(screen.getByTestId("chips")).toHaveTextContent("100");
   act(()=>screen.getByText("direkt zurück").click());
   expect(screen.getByTestId("chips")).toHaveTextContent("100");
 });
});
