import { describe, expect, it } from "vitest";
import { RouletteGame } from "./state";

const place=(game:RouletteGame,key:"red"|"black"|`n:${number}`="red",amount=10,balance=250)=>game.dispatch({type:"place",key,amount,balance});
describe("US-11 Roulette State-Pattern",()=>{
  it("erstattet offene Einsätze beim Verlassen genau einmal",()=>{
    const g=new RouletteGame(()=>0.5);
    expect(place(g).walletDelta).toBe(-10);
    expect(g.dispatch({type:"leave"}).walletDelta).toBe(10);
    expect(g.dispatch({type:"leave"}).walletDelta).toBe(0);
    expect(g.snapshot.bets).toEqual({});
  });
  it("nimmt weder ungedeckte noch negative Einsätze an",()=>{
    const g=new RouletteGame();
    expect(place(g,"red",500,250).allowed).toBe(false);
    expect(place(g,"red",-10,250).walletDelta).toBe(0);
    expect(place(g,"n:99").allowed).toBe(false);
    expect(g.snapshot.bets).toEqual({});
  });
  it("lehnt eine Drehung ohne Einsatz ab",()=>{
    const g=new RouletteGame();
    expect(g.dispatch({type:"spin"}).allowed).toBe(false);
    expect(g.snapshot.phase).toBe("betting");
  });
  it("sperrt im SpinningState alle finanziellen Aktionen und das Verlassen",()=>{
    const g=new RouletteGame();place(g);g.dispatch({type:"spin"});
    expect(g.snapshot.phase).toBe("spinning");
    for(const c of [{type:"clear"},{type:"leave"},{type:"spin"}] as const) {
      const r=g.dispatch(c);expect(r.allowed).toBe(false);expect(r.walletDelta).toBe(0);
    }
    expect(place(g).allowed).toBe(false);
  });
  it("wertet eingefrorene Mehrfachwetten einmal aus",()=>{
    const g=new RouletteGame(()=>(17.5/37));
    place(g,"black");place(g,"n:17");
    const start=g.dispatch({type:"spin"});
    const done=g.dispatch({type:"finish",roundId:start.snapshot.roundId});
    expect(done.walletDelta).toBe(380);
    expect(done.snapshot.result).toEqual({num:17,total:20,out:380,net:360});
    expect(done.snapshot.phase).toBe("result");
    expect(g.dispatch({type:"finish",roundId:start.snapshot.roundId}).walletDelta).toBe(0);
    expect(g.dispatch({type:"leave"}).allowed).toBe(true);
  });
  it("ignoriert veraltete Runden-Callbacks auch in einer neuen Drehung",()=>{
    const g=new RouletteGame(()=>0);
    place(g);const first=g.dispatch({type:"spin"}).snapshot.roundId;
    g.dispatch({type:"finish",roundId:first});
    place(g);const second=g.dispatch({type:"spin"}).snapshot.roundId;
    expect(second).toBeGreaterThan(first);
    expect(g.dispatch({type:"finish",roundId:first}).allowed).toBe(false);
    expect(g.snapshot.phase).toBe("spinning");
    expect(g.dispatch({type:"finish",roundId:second}).snapshot.history).toEqual([0,0]);
  });
  it("startet aus ResultState mit einem neuen Einsatz die Einsatzphase",()=>{
    const g=new RouletteGame(()=>0);place(g);const id=g.dispatch({type:"spin"}).snapshot.roundId;
    g.dispatch({type:"finish",roundId:id});
    expect(place(g).snapshot.phase).toBe("betting");
    expect(g.snapshot.result).toBeNull();
  });
  it("behält veröffentlichte Snapshots unverändert",()=>{
    const g=new RouletteGame();const first=place(g).snapshot;
    place(g);expect(first.bets).toEqual({red:10});expect(g.snapshot.bets).toEqual({red:20});
    expect(Object.isFrozen(first.bets)).toBe(true);
  });
  it("begrenzt den Verlauf auf zehn abgeschlossene Runden",()=>{
    const g=new RouletteGame(()=>0);
    for(let i=0;i<12;i++){place(g);const id=g.dispatch({type:"spin"}).snapshot.roundId;g.dispatch({type:"finish",roundId:id});}
    expect(g.snapshot.history).toHaveLength(10);
  });
});
