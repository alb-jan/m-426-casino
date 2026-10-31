# Mobile Regression vom 29 Oktober 2026

Browser vor Korrektur: Viewport 390 × 844, Dokumentbreite 551 CSS-Pixel. Der Kaufbereich war horizontal abgeschnitten. Ursache: automatische Mindestbreite der Grid-Spalte bei intrinsischer Formularbreite. Screenshot im Abgabepaket: Pruefberichte/browser/purchase-mobile-before.png.

Dies ist ein vor der CSS-Korrektur dokumentierter Browserbefund. Die Unit-CI kann das tatsächliche Layout nicht messen und wird deshalb nicht als roter Layoutnachweis ausgegeben. Nachweis der Korrektur erfolgt durch eine erneute Breitenmessung und Screenshots im echten Browser.

Nach der Korrektur wurden bei 390 × 844 jeweils clientWidth = scrollWidth = 375 CSS-Pixel gemessen (15 Pixel Scrollbar). Kauf, Lobby, Roulette und Poker haben keinen horizontalen Überstand. Die aktuellen Aufnahmen liegen im Abgabepaket unter Pruefberichte/browser.
