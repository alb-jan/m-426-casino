import type { Toast } from "@/lib/notifications";
import styles from "./ToastStack.module.css";

export function ToastStack({ toasts }: { toasts: readonly Toast[] }) {
  return (
    <div className={styles.stack} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast} style={{ borderColor: t.border }} role="status">
          <span className={styles.icon} style={{ background: t.tint, color: t.color }}>
            {t.icon}
          </span>
          <div className={styles.body}>
            <span className={styles.title} style={{ color: t.color }}>
              {t.title}
            </span>
            <span className={styles.msg}>{t.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
