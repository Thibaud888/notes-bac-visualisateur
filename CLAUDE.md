# CLAUDE.md — notes-bac-visualisateur

> Simulateur de moyenne au bac général 2027 — page statique HTML/CSS/JS purs, **zéro dépendance**,
> déployée sur GitHub Pages.

## Règles de travail (flotte)
- **Lis `MAP.md` avant toute exploration** ; n'explore que ce qu'elle ne couvre pas.
- **Aucune session ne rend la main sans avoir vérifié** : lance `node scripts/verify.mjs`
  (ou build + tests) et regarde le résultat avant de conclure.
- Branche + PR, **jamais de push direct sur `main`**. Commits **en français**.
- 1 session = 1 item de `BACKLOG.md` = 1 PR ; mets à jour `BACKLOG.md` en fin de session.
- 3e récurrence d'une même tâche → écris un script réutilisable (`scripts/`), pas juste le résultat.

## Stack & commandes
- Stack : HTML/CSS/JS vanilla (3 fichiers), aucune dépendance, persistance `localStorage`.
- Dev : `npx serve -l 4000 .` (ou double-clic sur `index.html` — tout marche hors-ligne).
- Test : `node scripts/verify.mjs`
- Build : aucun — le site est servi tel quel.
- Déploiement : GitHub Pages (`.github/workflows/pages.yml`, push sur `main`).

## Architecture (5-10 lignes)
- `index.html` — squelette : colonne visualisation (onglets camembert/treemap/radar + toolbar)
  et colonne pilotage (sliders injectés, leviers, partage/impression).
- `app.js` — tout le moteur : `SUBJECTS` (coefs, total 104), calcul `average()`, mentions,
  état `state` persisté (`localStorage`, clé `bac2027.simulateur`, migré par `migrate()`),
  rendus SVG faits main (`renderDonut/renderTreemap/renderRadar`), partage par hash `#s=`.
- `styles.css` — thème, hachures des notes figées, focus.

## Pièges connus
- **Cache-busting manuel** : incrémenter `?v=` dans `index.html` à CHAQUE modif de
  `app.js`/`styles.css`, sinon les visiteurs gardent l'ancienne version.
- Zéro dépendance est un **choix assumé** : ne pas introduire de framework ni de lib de charts.
- Les coefficients (Σ = 104, options incluses en moyenne) sont **vérifiés contre les textes
  officiels** (liens dans le footer) — ne pas les modifier sans source.
- Notes au pas de 0,25 (`clampNote`) ; `migrate()` protège la compat des anciens états stockés.
