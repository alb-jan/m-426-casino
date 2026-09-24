import styles from "./Header.module.css";

/** Kleines Wappen „A ♠“ im Header. */
export function Logo() {
  return (
    <span className={styles.crest}>
      <span className={styles.crestInner}>
        <span className={styles.crestA}>A</span>
        <span className={styles.crestSpade}>♠</span>
      </span>
    </span>
  );
}
