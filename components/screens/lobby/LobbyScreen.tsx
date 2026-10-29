"use client";
import { useNavigation, useWalletState } from "@/components/casino/CasinoProvider";
import { useGames } from "@/components/games/registry";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { formatChf, formatNumber } from "@/lib/format";
import { chipsToChf } from "@/lib/wallet";
import styles from "./LobbyScreen.module.css";

export function LobbyScreen() {
  const state = useWalletState();
  const { navigate, cashOut } = useNavigation();
  const games = useGames();
  const notify = useNotify();
  const chips = formatNumber(state.chips);
  const chf = formatChf(chipsToChf(state.chips));
  const open = (gameId: string) => {
    const result = navigate({kind:"game",gameId});
    if (!result.ok) notify("warn",result.title,result.msg);
  };
  return <main className={styles.main}><div className={styles.wrap}>
    <div className={styles.head}><div><span className={styles.step}>Schritt 2 von 3</span><h1 className={styles.title}>Spielauswahl</h1>
    <p className={styles.intro}>Wähle deinen Tisch. Dein Guthaben bleibt beim Wechsel zwischen den Spielen erhalten.</p></div>
    <div className={styles.balanceBox}><div className={styles.balanceLabel}>Guthaben</div><div className={styles.balanceValue} data-testid="lobby-balance">{chips} <span className={styles.balanceUnit}>Jetons</span></div><div className={styles.balanceChf}>≈ CHF {chf} Auszahlungswert</div></div></div>
    <div className={styles.games}>{games.map((game)=><button key={game.id} className={styles.gameBtn} onClick={()=>open(game.id)}><div className={styles.gameCard}><game.Art/><div><h2 className={styles.gameTitle}>{game.title}</h2><p className={styles.gameText}>{game.description}</p></div><div className={styles.gameFoot}><span className={styles.gameMeta}>{game.meta}</span><span className={styles.gameCta}>{game.cta}</span></div></div></button>)}</div>
    <div className={styles.exitBar}><div><h2 className={styles.exitTitle}>Casino verlassen</h2><p className={styles.exitText}>Restguthaben <span className={styles.exitChips}>{chips} Jetons</span> = <span className={styles.exitChf}>CHF {chf}</span> Auszahlung</p></div><button className={styles.exitBtn} onClick={cashOut}>Auszahlen &amp; verlassen</button></div>
  </div></main>;
}
