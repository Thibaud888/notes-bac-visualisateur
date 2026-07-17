# Backlog

> 1 item = 1 session Claude (issue labellisée `claude` ou session Cloud) = 1 PR.
> Cocher + lien PR quand c'est mergé. `/dispatch` (claude-ops) lit ce fichier.

- [x] Bouton « Réinitialiser la simulation » — remet notes/cadenas/libellés aux valeurs par défaut
  après confirmation, sans toucher au lien partagé. DoD : bouton visible dans la carte actions,
  `localStorage` purgé de la clé `bac2027.simulateur`, `node scripts/verify.mjs` passe.
  PR : https://github.com/Thibaud888/notes-bac-visualisateur/pull/14
- [x] Meta Open Graph + Twitter Card dans `index.html` — titre, description, image (emoji 🎓 en
  SVG inline data-URI acceptable) pour un partage propre du lien. DoD : balises présentes dans
  `<head>`, `node scripts/verify.mjs` passe, `?v=` inchangé (pas de modif JS/CSS).
  PR : https://github.com/Thibaud888/notes-bac-visualisateur/pull/22
