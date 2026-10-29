import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createEventBus, type GameEvents } from "@/lib/events";
import { NotificationProvider, useNotify } from "./NotificationProvider";

function Trigger({label="melden"}:{label?:string}) {
  const notify=useNotify();
  return <button onClick={()=>notify("win","Gewonnen!","50 Jetons")}>{label}</button>;
}
describe("US-02 Observer im tatsächlichen Aufrufweg",()=>{
  it("veröffentlicht auch innerhalb des Providers über den injizierten Bus",()=>{
    const bus=createEventBus<GameEvents>(); const emit=vi.spyOn(bus,"emit");
    render(<NotificationProvider bus={bus}><Trigger/></NotificationProvider>);
    act(()=>screen.getByText("melden").click());
    expect(emit).toHaveBeenCalledExactlyOnceWith("notify",{kind:"win",title:"Gewonnen!",msg:"50 Jetons"});
    expect(screen.getAllByText("Gewonnen!")).toHaveLength(1);
  });
  it("isoliert zwei standardmässig erstellte App-Instanzen",()=>{
    render(<><section data-testid="a"><NotificationProvider><Trigger label="A"/></NotificationProvider></section><section data-testid="b"><NotificationProvider><Trigger label="B"/></NotificationProvider></section></>);
    act(()=>screen.getByText("A").click());
    expect(within(screen.getByTestId("a")).getByText("Gewonnen!")).toBeInTheDocument();
    expect(within(screen.getByTestId("b")).queryByText("Gewonnen!")).not.toBeInTheDocument();
  });
  it("meldet sein Abonnement und alle Timer beim Unmount ab",()=>{
    vi.useFakeTimers();
    const bus=createEventBus<GameEvents>(); const off=vi.fn();
    const original=bus.subscribe.bind(bus);
    vi.spyOn(bus,"subscribe").mockImplementation((type,handler)=>{const remove=original(type,handler); return ()=>{off();remove();};});
    const view=render(<NotificationProvider bus={bus}><Trigger/></NotificationProvider>);
    act(()=>screen.getByText("melden").click());
    view.unmount();
    expect(off).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
  it("verlangt ausserhalb des Providers einen expliziten Vertrag",()=>{
    const log=vi.spyOn(console,"error").mockImplementation(()=>{});
    expect(()=>render(<Trigger/>)).toThrow(/NotificationProvider/);
    log.mockRestore();
  });
});
