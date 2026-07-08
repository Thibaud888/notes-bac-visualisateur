# MAP — notes-bac-visualisateur

> Carte du repo pour démarrer sans explorer. Entretenue par le workflow MAP (fleet-kit).

## Quoi
Simulateur de moyenne au **bac général session 2027** : l'élève règle ses notes (figées 🔒 ou
variables), la page recalcule moyenne pondérée, mention, marges et leviers, avec plusieurs
visualisations des mêmes données. 100 % statique (HTML/CSS/JS purs), hors-ligne, GitHub Pages.

## Arborescence annotée
```
index.html            # Squelette : 2 colonnes (viz + pilotage), footer sources officielles
                      # ⚠️ porte le cache-buster ?v=N sur app.js et styles.css
app.js  (~585 l.)     # Tout le moteur, sans dépendance :
                      #   SUBJECTS/GROUPS/DOMAIN_META/TYPE_META : matières, coefs (Σ=104), taxonomies
                      #   state (+ save/loadState/migrate) : notes, cadenas, libellés → localStorage
                      #   average/mentionFor/nextStep : calculs
                      #   buildControls/update/renderActiveTab : cycle de rendu
                      #   renderDonut/renderTreemap/renderRadar : SVG faits main
                      #   encodeState/decodeState : partage par lien #s=<base64>
styles.css            # Thème, hachures (notes figées), tabs, cartes
scripts/verify.mjs    # Vérif kit : le site démarre (npx serve) et répond
.claude/              # settings.json (allowlist) + launch.json (serve port 4000)
.github/workflows/
  pages.yml           # Déploiement Pages sur push main (fait main, PAS un stub kit)
  map.yml             # Stub flotte → régénère cette MAP à chaque push main
  claude.yml          # Stub flotte → issue labellisée `claude` = session Actions → PR
BACKLOG.md            # Items dispatchables (1 item = 1 issue = 1 PR)
```

## Points d'entrée
- Comprendre les données : `SUBJECTS` en tête d'`app.js` (id, label, coef, groupe, domaine, type).
- Comprendre le rendu : `update()` (app.js ~l.259) — appelé après chaque changement d'état.
- Ajouter une visualisation : suivre le motif `renderDonut` + onglet dans `index.html` (`.tabs`).

## Flux
1. Chargement : `loadState()` (localStorage ou `#s=` de l'URL) → `buildControls()` → `update()`.
2. Interaction slider/cadenas → `setNote`/`toggleLock` → `save()` + `update()`.
3. `update()` recalcule moyenne/mention puis `renderActiveTab()` redessine la vue active.
4. Partage : `encodeState()` → lien `#s=<base64>` ; impression via CSS print.

## Commandes
- Dev local : `npx serve -l 4000 .` (ou ouvrir `index.html`)
- Vérifier : `node scripts/verify.mjs`
- Déployer : merger sur `main` (Pages se déclenche seul)

## Pièges
- **Incrémenter `?v=` dans `index.html`** à chaque modif de `app.js`/`styles.css` (cache).
- Zéro dépendance : ne rien installer, pas de lib de charts — SVG à la main.
- Coefficients officiels vérifiés (footer) : toute modif exige une source.
- `migrate()` doit rester rétro-compatible avec les états localStorage existants.
