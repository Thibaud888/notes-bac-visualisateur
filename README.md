# 🎓 Mon Bac 2027 — simulateur de moyenne

Page web **dynamique, sans dépendance** (HTML/CSS/JS purs) pour simuler sa **moyenne au baccalauréat
général, session 2027**, en jouant sur ses notes (figées ou variables) et en visualisant aussitôt la
moyenne, la mention, les marges et la répartition par coefficients.

> Profil pris en compte : élève en **première en 2025‑2026**, **terminale en 2026‑2027**.
> Spécialités de terminale : **Physique‑Chimie** et **Mathématiques** (SVT abandonnée en fin de 1re).
> Options de terminale : **Maths expertes** et **Musique**.

## Utilisation

- **En local** : ouvrir `index.html` dans un navigateur (double‑clic). Tout fonctionne hors‑ligne.
- **En ligne** : voir la section *Déploiement* (GitHub Pages).

Pilotage :
- **Curseurs (0–20, pas de 0,25)** ou champ numérique pour chaque matière.
- **Cadenas 🔒 / 🔓** : fige une note « sûre » (déjà obtenue) ou la laisse variable. Les scénarios et
  le calcul d'objectif ne touchent **jamais** aux notes figées.
- **Camembert pondéré** : bascule entre *Poids (coefficients)* et *Contribution (note × coef)*.
- **Scénarios rapides**, **objectif de mention**, **tableau de levier** (où gagner le plus de points),
  **lien partageable** et **impression/PDF**.
- L'état (notes, cadenas, libellés) est **sauvegardé automatiquement** (localStorage) et peut être
  partagé via un lien (`#s=…`).

## Comment la note est calculée

Bac général **session 2027** : **100 coefficients de base** (60 d'épreuves + 40 de contrôle continu),
auxquels **s'ajoutent les options**. La moyenne est une **moyenne pondérée** :

```
moyenne = Σ(note × coef) / Σ(coef)          (ici Σ coef = 104)
```

### Coefficients retenus (vérifiés)

| Bloc | Épreuve / enseignement | Quand | Coef |
|------|------------------------|-------|-----:|
| Épreuves anticipées | Français écrit | Fin 1re (juin 2026) | 5 |
| Épreuves anticipées | Français oral | Fin 1re (juin 2026) | 5 |
| Épreuves anticipées | **Maths (anticipée — nouveauté 2027)** | Fin 1re (juin 2026) | 2 |
| Épreuves terminales | Spé Physique‑Chimie | Terminale 2027 | 16 |
| Épreuves terminales | Spé Mathématiques | Terminale 2027 | 16 |
| Épreuves terminales | Philosophie | Juin 2027 | 8 |
| Épreuves terminales | **Grand oral** (10 → **8** en 2027) | Juin 2027 | 8 |
| Contrôle continu | SVT (spécialité abandonnée) | Moyenne 1re | 8 |
| Contrôle continu | Histoire‑Géographie | 1re + Tle | 6 |
| Contrôle continu | LVA | 1re + Tle | 6 |
| Contrôle continu | LVB | 1re + Tle | 6 |
| Contrôle continu | Enseignement scientifique | 1re + Tle | 6 |
| Contrôle continu | EPS | Tle (CCF) | 6 |
| Contrôle continu | EMC | 1re + Tle | 2 |
| Option | Maths expertes | Terminale | 2 |
| Option | Musique | Terminale | 2 |
| | | **Total** | **104** |

> **Spécificité session 2027** : tous les élèves de 1re passent une **épreuve anticipée de mathématiques
> (coef 2)** en juin 2026 ; en contrepartie, le **Grand oral passe de coef 10 à coef 8**. Pour un élève
> ayant la spé maths, l'épreuve anticipée porte sur le programme de spé maths de 1re.
>
> Les enseignements de contrôle continu suivis sur les deux ans (Hist‑Géo, LVA, LVB, Ens. scientifique,
> EMC) sont scindés dans l'appli en **deux notes 1re / Tle** (coef divisé), pour pouvoir **figer** la
> partie déjà connue.

### Mentions

| Moyenne | Résultat |
|--------:|----------|
| < 8 | Non admis |
| 8 – < 10 | Oral de rattrapage (2ᵉ groupe) |
| 10 – < 12 | Admis, sans mention |
| 12 – < 14 | Mention Assez bien |
| 14 – < 16 | Mention Bien |
| 16 – < 18 | Mention Très bien |
| ≥ 18 | Très bien + félicitations du jury |

> ⚠️ Outil **indicatif**. Les règles fines du jury (arrondis, modalités de l'oral de rattrapage du
> 2ᵉ groupe, félicitations) sont simplifiées.

## Modifier le profil

Tout part de la liste `SUBJECTS` au début de `app.js` (un objet par matière : `id`, `label`, `group`,
`coef`, `color`). Modifier un coefficient ou ajouter/retirer une matière met automatiquement à jour la
moyenne, le camembert, les blocs et les mentions. Les libellés (ex. LVA → « Anglais ») sont aussi
éditables directement dans la page.

## Déploiement (GitHub Pages)

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publie le site à chaque push.
Activation en une fois : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
L'URL sera de la forme `https://<utilisateur>.github.io/<repo>/`.

## Sources officielles

- [education.gouv.fr — Comment calculer votre note au baccalauréat](https://www.education.gouv.fr/reussir-au-lycee/comment-calculer-votre-note-au-baccalaureat-325511)
- [éduscol — Détail des épreuves du bac général](https://eduscol.education.fr/727/detail-des-epreuves-du-baccalaureat-general)
- [éduscol — Épreuve anticipée de mathématiques](https://eduscol.education.gouv.fr/5688/epreuve-anticipee-de-mathematiques-aux-baccalaureats-general-et-technologique)
- [éduscol — Le contrôle continu](https://eduscol.education.gouv.fr/5676/le-controle-continu-des-candidats-scolaires-au-baccalaureat-general-ou-technologique)
