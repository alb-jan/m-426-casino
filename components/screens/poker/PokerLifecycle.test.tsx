import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoProvider, useCasino } from "@/components/casino/CasinoProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { Header } from "@/components/layout/Header";
import { PokerScreen } from "./PokerScreen";
import { rigDeck } from "@/lib/poker/testDeck";
const deckFactory=()=>rigDeck(["As Ah","8c 3h","8d 3s","7s 2d"],"Ac 9d 5s Jh 4c");
function Probe(){const {navigate,state}=useCasino();return <><output data-testid="route">{state.route.kind}</output><button onClick={()=>navigate({kind:"lobby"})}>direkt verlassen</button></>;}
const run=()=>{for(let i=0;i<30;i++)act(()=>vi.advanceTimersByTime(10));};
function setup(){return render(<NotificationProvider><CasinoProvider initial={{screen:"poker",chips:1000,bought:100,cashed:0}}><Header/><Probe/><PokerScreen deckFactory={deckFactory} rng={()=>0.5} botDelay={1} runoutDelay={1}/></CasinoProvider></NotificationProvider>);}
describe("US-09 Rundenvertrag und Ressourcen",()=>{
 beforeEach(()=>vi.useFakeTimers());afterEach(()=>vi.useRealTimers());
 it("sperrt auch direkte Navigation bis zum Handende",()=>{
  setup();expect(screen.getByRole("button",{name:/Zurück zur Spielauswahl/})).toBeDisabled();
  act(()=>screen.getByText("direkt verlassen").click());expect(screen.getByTestId("route")).toHaveTextContent("game");
  run();act(()=>screen.getByRole("button",{name:"Passen"}).click());run();
  expect(screen.getByRole("button",{name:"← Zurück zur Spielauswahl"})).toBeEnabled();
 });
 it("räumt nach einer neuen Hand auch neu angelegte Animationstimer auf",()=>{
  const view=setup();run();act(()=>screen.getByRole("button",{name:"Passen"}).click());run();
  act(()=>screen.getByRole("button",{name:"Nächste Runde"}).click());view.unmount();
  expect(vi.getTimerCount()).toBe(0);
 });
});
