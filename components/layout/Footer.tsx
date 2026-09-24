export function Footer() {
  return (
    <footer
      style={{
        padding: "18px 32px",
        borderTop: "1px solid rgba(242,239,230,.07)",
        display: "flex",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        fontSize: 11.5,
        color: "#5F6E65",
      }}
    >
      <span>Casino Goldenes Ass · Prototyp für das Schulprojekt · Next.js / React / TypeScript</span>
      <span>Spielgeld ohne echten Wert · Spiel-Events lösen die Benachrichtigungskomponente aus (Observer)</span>
    </footer>
  );
}
