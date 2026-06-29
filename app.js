/* =====================================================================
   Mon Bac 2027 — simulateur de moyenne
   Source de vérité : la liste SUBJECTS ci-dessous (coefficients vérifiés).
   Tout le reste (moyenne, camembert, mentions, vues) en découle.
   Le calcul de la moyenne est une moyenne pondérée Σ(note×coef)/104.
   ===================================================================== */

"use strict";

/* -------------------- Configuration (données vérifiées) -------------------- */

// Bac général, session 2027. Base = 100 coef (60 épreuves + 40 contrôle continu),
// + options (4) => 104. domain/evalType ne servent qu'à la visualisation.
const SUBJECTS = [
  // Épreuves anticipées (fin de 1re, juin 2026)
  { id: "fr_ecrit",  label: "Français — écrit",          group: "anticipe",     when: "Anticipé · 1re",        coef: 5,  color: "#3b82f6", domain: "lettres", evalType: "ecrit" },
  { id: "fr_oral",   label: "Français — oral",           group: "anticipe",     when: "Anticipé · 1re",        coef: 5,  color: "#60a5fa", domain: "lettres", evalType: "oral" },
  { id: "maths_ant", label: "Maths — épreuve anticipée", group: "anticipe",     when: "Anticipé · 1re · 2027", coef: 2,  color: "#2563eb", domain: "sci",     evalType: "ecrit" },

  // Spécialités de terminale (épreuves 2027)
  { id: "spe_pc",    label: "Spé Physique-Chimie",       group: "specialite",   when: "Épreuve · Tle",         coef: 16, color: "#6366f1", domain: "sci",     evalType: "ecrit" },
  { id: "spe_maths", label: "Spé Mathématiques",         group: "specialite",   when: "Épreuve · Tle",         coef: 16, color: "#8b5cf6", domain: "sci",     evalType: "ecrit" },

  // Autres épreuves de terminale
  { id: "philo",     label: "Philosophie",               group: "terminale",    when: "Épreuve · Tle",         coef: 8,  color: "#a855f7", domain: "lettres", evalType: "ecrit" },
  { id: "go",        label: "Grand oral",                group: "terminale",    when: "Épreuve · Tle",         coef: 8,  color: "#d946ef", domain: "go",      evalType: "oral" },

  // Contrôle continu — Première
  { id: "svt",   label: "SVT (spé abandonnée)",          group: "cc_premiere",  when: "Moyenne 1re",           coef: 8,  color: "#0ea5e9", domain: "sci",     evalType: "continu" },
  { id: "hg_1",  label: "Histoire-Géographie",           group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#14b8a6", domain: "hum",     evalType: "continu" },
  { id: "lva_1", label: "LVA (Anglais)",                 group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#2dd4bf", domain: "lang",    evalType: "continu" },
  { id: "lvb_1", label: "LVB (Espagnol)",                group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#34d399", domain: "lang",    evalType: "continu" },
  { id: "sci_1", label: "Enseignement scientifique",     group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#10b981", domain: "sci",     evalType: "continu" },
  { id: "emc_1", label: "EMC",                           group: "cc_premiere",  when: "Moyenne 1re",           coef: 1,  color: "#6ee7b7", domain: "hum",     evalType: "continu" },

  // Contrôle continu — Terminale
  { id: "hg_2",  label: "Histoire-Géographie",           group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#f59e0b", domain: "hum",     evalType: "continu" },
  { id: "lva_2", label: "LVA (Anglais)",                 group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#fbbf24", domain: "lang",    evalType: "continu" },
  { id: "lvb_2", label: "LVB (Espagnol)",                group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#f97316", domain: "lang",    evalType: "continu" },
  { id: "sci_2", label: "Enseignement scientifique",     group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#fb923c", domain: "sci",     evalType: "continu" },
  { id: "emc_2", label: "EMC",                           group: "cc_terminale", when: "Moyenne Tle",           coef: 1,  color: "#fcd34d", domain: "hum",     evalType: "continu" },
  { id: "eps",   label: "EPS",                           group: "cc_terminale", when: "CCF · Tle",             coef: 6,  color: "#eab308", domain: "arts",    evalType: "continu" },

  // Options (s'ajoutent au total : 100 -> 104)
  { id: "maths_exp", label: "Maths expertes (option)",   group: "option",       when: "Option · Tle",          coef: 2,  color: "#f43f5e", domain: "sci",     evalType: "continu" },
  { id: "musique",   label: "Musique (option)",          group: "option",       when: "Option · Tle",          coef: 2,  color: "#fb7185", domain: "arts",    evalType: "continu" },
];

const GROUPS = {
  anticipe:     { title: "Épreuves anticipées",            note: "Passées en fin de première (juin 2026). Inclut la nouvelle épreuve de maths (coef 2, session 2027)." },
  specialite:   { title: "Spécialités de terminale",        note: "Le cœur du bac : 16 + 16 = 32 coefficients." },
  terminale:    { title: "Philosophie & Grand oral",        note: "Épreuves finales de terminale (juin 2027). Grand oral coef 8 en 2027." },
  cc_premiere:  { title: "Contrôle continu — Première",     note: "Moyennes annuelles de 1re. La SVT compte ici (spécialité abandonnée en fin de 1re)." },
  cc_terminale: { title: "Contrôle continu — Terminale",    note: "Moyennes annuelles de terminale (l'EPS est évaluée en CCF)." },
  option:       { title: "Options",                         note: "Coef 2 chacune, ajoutées au total (100 → 104). ⚠️ Une note &lt; 10 fait légèrement baisser la moyenne : ce n'est plus l'ancien système de bonus (points au-dessus de 10)." },
};

const GROUP_ORDER = ["anticipe", "specialite", "terminale", "cc_premiere", "cc_terminale", "option"];

// Familles pour la coloration / le radar
const DOMAIN_META = {
  sci:     { title: "Scientifique",    color: "#6366f1" },
  lang:    { title: "Langues",         color: "#14b8a6" },
  lettres: { title: "Lettres & Philo", color: "#a855f7" },
  hum:     { title: "Humanités",       color: "#f59e0b" },
  arts:    { title: "EPS & Arts",      color: "#fb7185" },
  go:      { title: "Grand oral",      color: "#d946ef" },
};
const DOMAIN_ORDER = ["sci", "lang", "lettres", "hum", "arts", "go"];

const TYPE_META = {
  continu: { title: "Contrôle continu", color: "#0ea5e9" },
  ecrit:   { title: "Épreuve écrite",   color: "#8b5cf6" },
  oral:    { title: "Épreuve orale",    color: "#f97316" },
};
const TYPE_ORDER = ["continu", "ecrit", "oral"];

// Mentions, de la plus haute à la plus basse (on prend la première dont min <= moyenne)
const MENTIONS = [
  { min: 18, label: "TB + félicitations", color: "#6366f1", status: "Admis·e avec les félicitations du jury 🎉" },
  { min: 16, label: "Très bien",          color: "#10b981", status: "Admis·e — Mention Très bien" },
  { min: 14, label: "Bien",               color: "#22c55e", status: "Admis·e — Mention Bien" },
  { min: 12, label: "Assez bien",         color: "#84cc16", status: "Admis·e — Mention Assez bien" },
  { min: 10, label: "Admis·e",            color: "#eab308", status: "Bac validé — sans mention" },
  { min: 8,  label: "Rattrapage",         color: "#f76808", status: "Oral de rattrapage (2ᵉ groupe)" },
  { min: 0,  label: "Non admis",          color: "#e5484d", status: "En l'état, le bac n'est pas validé" },
];

const NEXT_STEPS = [
  { at: 10, label: "l'admission" },
  { at: 12, label: "la mention Assez bien" },
  { at: 14, label: "la mention Bien" },
  { at: 16, label: "la mention Très bien" },
  { at: 18, label: "les félicitations du jury" },
];

const TARGETS = [
  [10, "Admission (10)"], [12, "Assez bien (12)"], [14, "Bien (14)"],
  [16, "Très bien (16)"], [18, "Félicitations (18)"],
];

const STORE_KEY = "bac2027.simulateur";
const TOTAL_COEF = SUBJECTS.reduce((s, x) => s + x.coef, 0); // 104

/* -------------------- État -------------------- */

const DEFAULTS = {
  notes: {}, locked: {}, labels: {},
  tab: "pie", donutView: "contrib", colorBy: "matiere",
  focusLocked: false, target: 14, barsMetric: "contrib",
};
let state = Object.assign({}, DEFAULTS);
const refs = {}; // refs DOM par id de matière

const getNote = (id) => {
  const v = state.notes[id];
  return typeof v === "number" && isFinite(v) ? clampNote(v) : 10;
};
const getLocked = (id) => !!state.locked[id];
const getLabel = (s) => state.labels[s.id] || s.label;

function clampNote(v) {
  v = Math.max(0, Math.min(20, v));
  return Math.round(v * 4) / 4; // pas de 0,25
}

/* -------------------- Calculs -------------------- */

function average(noteOf = getNote) {
  let pts = 0, coef = 0;
  for (const s of SUBJECTS) { pts += noteOf(s.id) * s.coef; coef += s.coef; }
  return coef ? pts / coef : 0;
}

function mentionFor(m) {
  return MENTIONS.find((x) => m >= x.min) || MENTIONS[MENTIONS.length - 1];
}
function nextStep(m) {
  return NEXT_STEPS.find((x) => m < x.at) || null;
}

const fmt = (x) => x.toFixed(2).replace(".", ",");
const fmt1 = (x) => x.toFixed(1).replace(".", ",");

function noteColor(v) {
  if (v < 8)  return "#e5484d";
  if (v < 10) return "#f76808";
  if (v < 12) return "#eab308";
  if (v < 14) return "#84cc16";
  if (v < 16) return "#22c55e";
  return "#10b981";
}

// Dimension de coloration active
function subjColor(s) {
  if (state.colorBy === "domaine") return DOMAIN_META[s.domain].color;
  if (state.colorBy === "type") return TYPE_META[s.evalType].color;
  return s.color;
}
function groupKeyOf(s) {
  if (state.colorBy === "domaine") return s.domain;
  if (state.colorBy === "type") return s.evalType;
  return s.id;
}
function orderIndexOf(s) {
  if (state.colorBy === "domaine") return DOMAIN_ORDER.indexOf(s.domain);
  if (state.colorBy === "type") return TYPE_ORDER.indexOf(s.evalType);
  return SUBJECTS.indexOf(s);
}
function groupTitleOf(key) {
  if (state.colorBy === "domaine") return DOMAIN_META[key].title;
  if (state.colorBy === "type") return TYPE_META[key].title;
  const s = SUBJECTS.find((x) => x.id === key);
  return getLabel(s);
}

/* -------------------- Persistance -------------------- */

function migrate(obj) {
  // ancien champ "mode" (v1) -> donutView
  if (obj.mode && !obj.donutView) obj.donutView = obj.mode === "coef" ? "coef" : "contrib";
  delete obj.mode;
  obj.target = Number(obj.target) || 14;
  return obj;
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* mode privé : on ignore */ }
}

function loadState() {
  const hash = location.hash.match(/s=([^&]+)/);
  if (hash) {
    const decoded = decodeState(hash[1]);
    if (decoded) { state = decoded; return; }
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) state = migrate(Object.assign({}, DEFAULTS, JSON.parse(raw)));
  } catch (e) { /* ignore */ }
}

function encodeState() {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
  catch (e) { return ""; }
}
function decodeState(str) {
  try { return migrate(Object.assign({}, DEFAULTS, JSON.parse(decodeURIComponent(escape(atob(str)))))); }
  catch (e) { return null; }
}

/* -------------------- Construction des contrôles (une seule fois) -------------------- */

function buildControls() {
  const host = document.getElementById("groups");
  host.innerHTML = "";

  for (const g of GROUP_ORDER) {
    const subs = SUBJECTS.filter((s) => s.group === g);
    const coefSum = subs.reduce((a, s) => a + s.coef, 0);

    const section = document.createElement("div");
    section.className = "group";
    section.innerHTML =
      `<div class="group-head"><h3>${GROUPS[g].title}</h3>` +
      `<span class="g-coef">coef ${coefSum}</span></div>` +
      `<p class="group-note">${GROUPS[g].note}</p>`;

    for (const s of subs) {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML =
        `<div class="row-top">` +
          `<span class="name" contenteditable="true" spellcheck="false" data-id="${s.id}">${escapeHtml(getLabel(s))}</span>` +
          `<span class="coef-badge">coef ${s.coef}</span>` +
          `<span class="when">${s.when}</span>` +
          `<span class="val">` +
            `<input type="number" min="0" max="20" step="0.25" inputmode="decimal" aria-label="Note ${escapeHtml(getLabel(s))}">` +
            `<button class="lock-btn" type="button" title="Figer / libérer cette note" aria-pressed="false"></button>` +
          `</span>` +
        `</div>` +
        `<input type="range" class="slider" min="0" max="20" step="0.25" aria-label="Curseur note ${escapeHtml(getLabel(s))}">`;

      const slider = row.querySelector(".slider");
      const number = row.querySelector('input[type="number"]');
      const lockBtn = row.querySelector(".lock-btn");
      const name = row.querySelector(".name");

      slider.addEventListener("input", () => setNote(s.id, parseFloat(slider.value)));
      number.addEventListener("input", () => setNote(s.id, parseFloat(number.value)));
      number.addEventListener("blur", () => { number.value = getNote(s.id); });
      lockBtn.addEventListener("click", () => toggleLock(s.id));

      name.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); name.blur(); } });
      name.addEventListener("blur", () => setLabel(s.id, name.textContent));

      refs[s.id] = { row, slider, number, lockBtn, name };
      section.appendChild(row);
    }
    host.appendChild(section);
  }
}

/* -------------------- Actions -------------------- */

function setNote(id, v) {
  if (isNaN(v)) return;
  state.notes[id] = clampNote(v);
  save();
  update();
}
function toggleLock(id) {
  state.locked[id] = !state.locked[id];
  save();
  update();
}
function setLabel(id, text) {
  text = (text || "").replace(/\s+/g, " ").trim();
  const base = /_(1|2)$/.test(id) ? id.replace(/_(1|2)$/, "") : null;
  const targets = base ? SUBJECTS.filter((s) => s.id.replace(/_(1|2)$/, "") === base).map((s) => s.id) : [id];
  for (const t of targets) {
    if (text && text !== (SUBJECTS.find((s) => s.id === t)?.label || "")) state.labels[t] = text;
    else delete state.labels[t];
    if (refs[t]) refs[t].name.textContent = state.labels[t] || SUBJECTS.find((s) => s.id === t).label;
  }
  save();
  update();
}
function applyScenario(kind) {
  for (const s of SUBJECTS) {
    if (getLocked(s.id)) continue; // on ne touche jamais aux notes figées
    let v = getNote(s.id);
    if (kind === "opt") v += 2;
    else if (kind === "pess") v -= 2;
    else v = parseFloat(kind === "reset" ? "10" : kind);
    state.notes[s.id] = clampNote(v);
  }
  save();
  update();
}

/* -------------------- Boucle de rendu -------------------- */

function update() {
  const m = average();

  for (const s of SUBJECTS) {
    const r = refs[s.id]; if (!r) continue;
    const v = getNote(s.id);
    const locked = getLocked(s.id);
    if (document.activeElement !== r.slider) r.slider.value = v;
    if (document.activeElement !== r.number) r.number.value = v;
    const pct = (v / 20) * 100;
    const col = noteColor(v);
    r.slider.style.background =
      `linear-gradient(90deg, ${col} 0%, ${col} ${pct}%, #e6e9f2 ${pct}%, #e6e9f2 100%)`;
    r.row.classList.toggle("is-locked", locked);
    r.lockBtn.textContent = locked ? "🔒" : "🔓";
    r.lockBtn.classList.toggle("locked", locked);
    r.lockBtn.setAttribute("aria-pressed", String(locked));
  }

  renderGauge(m);
  renderMention(m);
  renderObjectif(m);
  renderLeverage();
  renderActiveTab(m);
}

function renderActiveTab(m) {
  switch (state.tab) {
    case "radar":    renderRadar(m); break;
    case "bars":     renderBarsBySubject(); break;
    case "objectif": renderComparison(m); renderBlocksStacked(); renderScale(m); break;
    default:         renderDonut(m);
  }
}

/* -------------------- En-tête : jauge + mention -------------------- */

function renderGauge(m) {
  const col = mentionFor(m).color;
  const r = 72, c = 2 * Math.PI * r, prog = Math.max(0, Math.min(1, m / 20));
  const off = c * (1 - prog);
  document.getElementById("gauge").innerHTML =
    `<svg viewBox="0 0 180 180" role="img" aria-label="Moyenne ${fmt(m)} sur 20">
       <circle cx="90" cy="90" r="${r}" fill="none" stroke="#eef0fb" stroke-width="16"/>
       <circle cx="90" cy="90" r="${r}" fill="none" stroke="${col}" stroke-width="16"
               stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
               transform="rotate(-90 90 90)" style="transition:stroke-dashoffset .4s, stroke .3s"/>
       <text x="90" y="86" text-anchor="middle" font-size="40" font-weight="800" fill="${col}">${fmt(m)}</text>
       <text x="90" y="108" text-anchor="middle" font-size="13" fill="#5b627e">/ 20</text>
     </svg>`;
}

function renderMention(m) {
  const men = mentionFor(m);
  const badge = document.getElementById("mentionBadge");
  badge.textContent = men.label;
  badge.style.background = men.color;
  document.getElementById("mentionStatus").textContent = men.status;

  const next = nextStep(m);
  const nextEl = document.getElementById("mentionNext");
  if (!next) {
    nextEl.textContent = "Tu es tout en haut de l'échelle. 🎉";
  } else {
    const gap = next.at - m;
    nextEl.textContent = `Il te manque ${fmt(gap)} pt${gap >= 2 ? "s" : ""} pour ${next.label} (${next.at}/20).`;
  }
}

/* -------------------- Onglet Camembert -------------------- */

function shortLabel(txt) {
  const t = txt.replace(/\s*\(.*?\)\s*/g, "").trim();
  return t.length > 14 ? t.slice(0, 13) + "…" : t;
}

function renderDonut(m) {
  const view = state.donutView;
  const metric = (s) => (view === "coef" ? s.coef : getNote(s.id) * s.coef);

  let slices = SUBJECTS.map((s) => ({
    s, key: groupKeyOf(s), color: subjColor(s), value: metric(s),
    note: getNote(s.id), coef: s.coef, locked: getLocked(s.id), oi: orderIndexOf(s),
  })).filter((d) => d.value > 0).sort((a, b) => a.oi - b.oi || b.value - a.value);

  const sum = slices.reduce((a, d) => a + d.value, 0) || 1;
  const total = view === "objectif" ? Math.max(sum, state.target * TOTAL_COEF) : sum;

  const cx = 120, cy = 120, rO = 112, rI = 68;
  let svg = `<svg viewBox="0 0 240 240" role="img" aria-label="Camembert pondéré">`;
  svg += `<defs><pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">` +
         `<line x1="0" y1="0" x2="0" y2="7" stroke="rgba(255,255,255,.6)" stroke-width="2.6"/></pattern></defs>`;

  const groupSpans = [];
  let a0 = 0, curKey = null, spanStart = 0;
  for (const d of slices) {
    const a1 = a0 + (d.value / total) * 360;
    d.a0 = a0; d.a1 = a1;
    const dim = state.focusLocked && !d.locked ? ' opacity="0.14"' : "";
    svg += `<path d="${arcPath(cx, cy, rO, rI, a0, a1 - 0.5)}" fill="${d.color}"${dim} data-id="${d.s.id}" tabindex="0"></path>`;
    if (d.locked) {
      svg += `<path d="${arcPath(cx, cy, rO, rI, a0, a1 - 0.5)}" fill="url(#hatch)" stroke="rgba(28,33,56,.45)" stroke-width="1"${dim} pointer-events="none"></path>`;
    }
    if (d.key !== curKey) { if (curKey !== null) groupSpans.push({ key: curKey, a0: spanStart, a1: a0 }); curKey = d.key; spanStart = a0; }
    a0 = a1;
  }
  if (curKey !== null) groupSpans.push({ key: curKey, a0: spanStart, a1: a0 });

  // Arc « restant » en mode objectif (points manquants)
  if (view === "objectif" && sum < total) {
    svg += `<path d="${arcPath(cx, cy, rO, rI, a0, 360)}" fill="#e6e9f2"></path>`;
    const mid = (a0 + 360) / 2;
    if (360 - a0 >= 22) svg += sliceLabel(cx, cy, rO, rI, mid, "à gagner");
  }

  // Étiquettes dans les parts
  const lbl = (a, b, text) => sliceLabel(cx, cy, rO, rI, (a + b) / 2, text);
  if (state.colorBy === "matiere") {
    for (const d of slices) if (d.a1 - d.a0 >= 18) {
      const yt = yearTag(d.s.id);
      svg += lbl(d.a0, d.a1, shortLabel(getLabel(d.s)) + (yt ? " " + yt : ""));
    }
  } else {
    for (const g of groupSpans) if (g.a1 - g.a0 >= 18) svg += lbl(g.a0, g.a1, groupTitleOf(g.key));
  }

  // Centre
  const men = mentionFor(m);
  let sub;
  if (state.focusLocked) sub = `${slices.filter((d) => d.locked).length} note(s) figée(s)`;
  else if (view === "coef") sub = "poids (coef)";
  else if (view === "objectif") sub = `objectif ${state.target}/20`;
  else sub = "moyenne /20";
  svg += `<text x="120" y="116" text-anchor="middle" font-size="34" font-weight="800" fill="${men.color}">${fmt(m)}</text>`;
  svg += `<text x="120" y="137" text-anchor="middle" font-size="11" fill="#5b627e">${sub}</text>`;
  if (view === "objectif" && !state.focusLocked) {
    svg += `<text x="120" y="152" text-anchor="middle" font-size="10" fill="#5b627e">${fmt1(Math.min(100, (sum / total) * 100))} % atteint</text>`;
  }
  svg += `</svg>`;

  const donut = document.getElementById("donut");
  donut.innerHTML = svg;

  // Légende adaptée à la dimension
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  if (state.colorBy === "matiere") {
    for (const d of slices) {
      const right = view === "coef" ? `coef ${d.coef}` : `${fmt(d.value / TOTAL_COEF)} pts`;
      const yt = yearTag(d.s.id);
      const li = document.createElement("li");
      if (state.focusLocked && !d.locked) li.style.opacity = ".4";
      li.innerHTML = `<span class="dot" style="background:${d.color}"></span>` +
        `<span>${escapeHtml(getLabel(d.s))}${yt ? ` <span class="lv-when">${yt}</span>` : ""}${d.locked ? " 🔒" : ""}</span>` +
        `<span class="lg-coef">${right}</span>`;
      legend.appendChild(li);
    }
  } else {
    const order = state.colorBy === "domaine" ? DOMAIN_ORDER : TYPE_ORDER;
    const meta = state.colorBy === "domaine" ? DOMAIN_META : TYPE_META;
    for (const key of order) {
      const subs = SUBJECTS.filter((s) => groupKeyOf(s) === key);
      if (!subs.length) continue;
      const coef = subs.reduce((a, s) => a + s.coef, 0);
      const val = subs.reduce((a, s) => a + (view === "coef" ? s.coef : getNote(s.id) * s.coef), 0);
      const right = view === "coef" ? `coef ${coef}` : `${fmt(val / TOTAL_COEF)} pts`;
      const li = document.createElement("li");
      li.innerHTML = `<span class="dot" style="background:${meta[key].color}"></span>` +
        `<span>${meta[key].title}</span><span class="lg-coef">${right}</span>`;
      legend.appendChild(li);
    }
  }

  // Tooltip
  const tip = document.getElementById("donutTip");
  const showTip = (id) => {
    const s = SUBJECTS.find((x) => x.id === id); if (!s) return;
    const yt = yearTag(id), note = getNote(id);
    tip.hidden = false;
    tip.innerHTML =
      `<strong>${escapeHtml(getLabel(s))}${yt ? ` (${yt})` : ""}</strong> — coef ${s.coef} · note ${fmt(note)}/20 · ` +
      `${DOMAIN_META[s.domain].title} · ${TYPE_META[s.evalType].title} · ${getLocked(id) ? "🔒 figée" : "variable"} → ` +
      `apporte <strong>${fmt(note * s.coef / TOTAL_COEF)}</strong> pts à la moyenne.`;
  };
  donut.querySelectorAll("path[data-id]").forEach((p) => {
    const id = p.getAttribute("data-id");
    p.addEventListener("mouseenter", () => showTip(id));
    p.addEventListener("focus", () => showTip(id));
    p.addEventListener("click", () => showTip(id));
  });
  donut.addEventListener("mouseleave", () => { tip.hidden = true; });
}

function sliceLabel(cx, cy, rO, rI, mid, text) {
  const p = polar(cx, cy, (rO + rI) / 2, mid);
  return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" class="slice-label">${escapeHtml(text)}</text>`;
}

/* -------------------- Onglet Domaines : radar -------------------- */

function renderRadar(m) {
  const axes = DOMAIN_ORDER.map((key) => {
    const subs = SUBJECTS.filter((s) => s.domain === key);
    const coef = subs.reduce((a, s) => a + s.coef, 0);
    const avg = subs.reduce((a, s) => a + getNote(s.id) * s.coef, 0) / coef;
    return { key, title: DOMAIN_META[key].title, avg };
  });
  const n = axes.length, cx = 210, cy = 150, R = 96;
  const ang = (i) => (-90 + (i * 360) / n) * Math.PI / 180;
  const pt = (val, i) => [cx + (val / 20) * R * Math.cos(ang(i)), cy + (val / 20) * R * Math.sin(ang(i))];
  const ptR = (rad, i) => [cx + rad * Math.cos(ang(i)), cy + rad * Math.sin(ang(i))];
  const poly = (val) => axes.map((_, i) => pt(typeof val === "function" ? val(i) : val, i).map((x) => x.toFixed(1)).join(",")).join(" ");

  let svg = `<svg viewBox="0 0 420 300" role="img" aria-label="Radar des moyennes par domaine">`;
  for (const v of [5, 10, 15, 20]) svg += `<polygon points="${poly(v)}" fill="none" stroke="#e6e9f2" stroke-width="1"/>`;
  axes.forEach((ax, i) => {
    const [x, y] = pt(20, i);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6e9f2"/>`;
    const [lx, ly] = ptR(R + 16, i);
    const anchor = Math.abs(lx - cx) < 8 ? "middle" : lx > cx ? "start" : "end";
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="central" font-size="10" font-weight="600" fill="#1c2138">${ax.title}</text>`;
    svg += `<text x="${lx.toFixed(1)}" y="${(ly + 12).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="central" font-size="9" fill="${noteColor(ax.avg)}">${fmt(ax.avg)}</text>`;
  });
  svg += `<polygon points="${poly(state.target)}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  svg += `<polygon points="${poly((i) => axes[i].avg)}" fill="rgba(99,102,241,.22)" stroke="#6366f1" stroke-width="2"/>`;
  axes.forEach((ax, i) => { const [x, y] = pt(ax.avg, i); svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#6366f1"/>`; });
  svg += `</svg>`;
  document.getElementById("radar").innerHTML = svg;
}

/* -------------------- Onglet Détail : barres par matière -------------------- */

function renderBarsBySubject() {
  const host = document.getElementById("barsBySubject");
  host.innerHTML = "";
  const noteMode = state.barsMetric === "note";
  const vals = SUBJECTS.map((s) => ({ s, v: noteMode ? getNote(s.id) : getNote(s.id) * s.coef }));
  const max = noteMode ? 20 : Math.max(1, ...vals.map((x) => x.v));
  vals.sort((a, b) => b.v - a.v);
  for (const { s, v } of vals) {
    const yt = yearTag(s.id), locked = getLocked(s.id);
    const right = noteMode ? `${fmt(v)}/20` : `${fmt(v / TOTAL_COEF)} pts`;
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="b-name">${escapeHtml(getLabel(s))}${yt ? ` <span class="lv-when">${yt}</span>` : ""}${locked ? " 🔒" : ""}</span>` +
      `<span class="b-track"><span class="b-fill${locked ? " locked" : ""}" style="width:${(v / max * 100).toFixed(1)}%;background:${subjColor(s)}"></span></span>` +
      `<span class="b-val">${right}</span>`;
    host.appendChild(li);
  }
}

/* -------------------- Onglet Objectif -------------------- */

function renderComparison(m) {
  const T = state.target;
  let lockedPts = 0, varPts = 0, varCoef = 0;
  for (const s of SUBJECTS) {
    const p = getNote(s.id) * s.coef;
    if (getLocked(s.id)) lockedPts += p; else { varPts += p; varCoef += s.coef; }
  }
  const total = lockedPts + varPts, targetPts = T * TOTAL_COEF, maxScale = 20 * TOTAL_COEF;
  const W = 300, top = 26, H = 188, base = top + H;
  const y = (p) => base - (p / maxScale) * H;
  const barW = 66, x1 = 60, x2 = 174, col = "#6366f1";

  let svg = `<svg viewBox="0 0 ${W} 250" role="img" aria-label="Comparaison de mes points et de l'objectif">`;
  // objectif (référence)
  svg += `<rect x="${x1}" y="${y(targetPts).toFixed(1)}" width="${barW}" height="${(base - y(targetPts)).toFixed(1)}" rx="6" fill="#cbd5e1"/>`;
  // mes points : figées (vives) puis variables (estompées)
  const yLock = y(lockedPts);
  svg += `<rect x="${x2}" y="${yLock.toFixed(1)}" width="${barW}" height="${(base - yLock).toFixed(1)}" rx="6" fill="${col}"/>`;
  const yTot = y(total), hVar = yLock - yTot;
  if (hVar > 0.5) svg += `<rect x="${x2}" y="${yTot.toFixed(1)}" width="${barW}" height="${hVar.toFixed(1)}" fill="${col}" opacity="0.38"/>`;
  // ligne objectif
  svg += `<line x1="34" y1="${y(targetPts).toFixed(1)}" x2="266" y2="${y(targetPts).toFixed(1)}" stroke="#475569" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  // étiquettes
  svg += `<text x="${x1 + barW / 2}" y="${base + 18}" text-anchor="middle" font-size="11" fill="#1c2138">Objectif</text>`;
  svg += `<text x="${x1 + barW / 2}" y="${(y(targetPts) - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">${T}/20</text>`;
  svg += `<text x="${x2 + barW / 2}" y="${base + 18}" text-anchor="middle" font-size="11" fill="#1c2138">Mes points</text>`;
  svg += `<text x="${x2 + barW / 2}" y="${(yTot - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="${mentionFor(m).color}">${fmt(m)}/20</text>`;
  svg += `</svg>`;
  document.getElementById("comparison").innerHTML = svg;

  const cap = document.getElementById("comparisonCaption");
  let body;
  if (total >= targetPts) {
    cap.className = "cmp-caption ok";
    body = `✅ Objectif atteint : <strong>${fmt(m)}/20</strong> ≥ ${T}/20.`;
  } else {
    cap.className = "cmp-caption no";
    const perVar = varCoef > 0 ? ` — soit ≈ <strong>+${fmt((targetPts - total) / varCoef)}</strong> sur chaque note variable` : "";
    body = `Il manque <strong>${fmt(T - m)}</strong> pt de moyenne pour ${T}/20${perVar}.`;
  }
  cap.innerHTML = body +
    ` <span class="cmp-key"><span class="key vivid"></span>figées <span class="key faded"></span>variables</span>`;
}

function renderBlocksStacked() {
  const defs = [
    { label: "Contrôle continu", groups: ["cc_premiere", "cc_terminale"] },
    { label: "Épreuves",         groups: ["anticipe", "specialite", "terminale"] },
    { label: "Options",          groups: ["option"] },
  ];
  const bar = document.createElement("div"); bar.className = "bs-bar";
  const legend = document.createElement("ul"); legend.className = "bs-legend";
  for (const d of defs) {
    const subs = SUBJECTS.filter((s) => d.groups.includes(s.group));
    const coef = subs.reduce((a, s) => a + s.coef, 0);
    const avg = subs.reduce((a, s) => a + getNote(s.id) * s.coef, 0) / coef;
    const col = noteColor(avg);
    const seg = document.createElement("div");
    seg.className = "seg2";
    seg.style.flexBasis = (coef / TOTAL_COEF * 100) + "%";
    seg.style.background = col;
    seg.innerHTML = coef / TOTAL_COEF >= 0.08 ? `<span>coef ${coef}</span>` : "";
    bar.appendChild(seg);
    const li = document.createElement("li");
    li.innerHTML = `<span class="dot" style="background:${col}"></span>` +
      `<span>${d.label}</span><span class="lg-coef">coef ${coef} · ${fmt(avg)}/20</span>`;
    legend.appendChild(li);
  }
  const host = document.getElementById("blocksStacked");
  host.innerHTML = "";
  host.appendChild(bar);
  host.appendChild(legend);
}

function renderScale(m) {
  const W = 520, H = 78, pad = 26;
  const x = (v) => pad + (v / 20) * (W - 2 * pad);
  const zones = [
    [0, 8, "#e5484d"], [8, 10, "#f76808"], [10, 12, "#eab308"],
    [12, 14, "#84cc16"], [14, 16, "#22c55e"], [16, 18, "#10b981"], [18, 20, "#6366f1"],
  ];
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Position de la moyenne sur l'échelle des mentions">`;
  for (const [a, b, c] of zones) {
    svg += `<rect x="${x(a)}" y="28" width="${x(b) - x(a)}" height="18" fill="${c}" ${a === 0 ? 'rx="5"' : ""} ${b === 20 ? 'rx="5"' : ""}/>`;
  }
  for (const t of [8, 10, 12, 14, 16, 18]) {
    svg += `<line x1="${x(t)}" y1="26" x2="${x(t)}" y2="48" stroke="#fff" stroke-width="1.5"/>`;
    svg += `<text x="${x(t)}" y="62" text-anchor="middle" font-size="10" fill="#5b627e">${t}</text>`;
  }
  const mx = x(Math.max(0, Math.min(20, m)));
  svg += `<line x1="${mx}" y1="20" x2="${mx}" y2="50" stroke="#1c2138" stroke-width="2"/>`;
  svg += `<polygon points="${mx - 5},20 ${mx + 5},20 ${mx},27" fill="#1c2138"/>`;
  svg += `<text x="${mx}" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#1c2138">${fmt(m)}</text>`;
  svg += `</svg>`;
  document.getElementById("scale").innerHTML = svg;
}

/* -------------------- Objectif (texte, panneau de droite) -------------------- */

function renderObjectif(m) {
  const T = state.target;
  const el = document.getElementById("objResult");
  let lockedPts = 0, varCoef = 0;
  for (const s of SUBJECTS) {
    if (getLocked(s.id)) lockedPts += getNote(s.id) * s.coef;
    else varCoef += s.coef;
  }
  const set = (cls, txt) => { el.className = "obj-result " + cls; el.innerHTML = txt; };

  if (varCoef === 0) {
    set(m >= T ? "ok" : "no",
      `Toutes tes notes sont figées. Moyenne = <strong>${fmt(m)}/20</strong> → ` + (m >= T ? "objectif atteint ✅" : "objectif non atteint ❌"));
    return;
  }
  const required = (T * TOTAL_COEF - lockedPts) / varCoef;
  if (required <= 0) {
    set("ok", `C'est déjà acquis : même avec <strong>0/20</strong> sur tes notes variables, tu atteins <strong>${T}/20</strong>.`);
  } else if (required > 20) {
    set("no", `Hors de portée : il faudrait <strong>${fmt(required)}/20</strong> de moyenne sur tes notes variables (le maximum est 20).`);
  } else {
    set("info", `Pour viser <strong>${T}/20</strong>, il te faut <strong>${fmt(required)}/20</strong> de moyenne sur tes notes variables (coef ${varCoef}).`);
  }
}

/* -------------------- Levier (compact, top 3) -------------------- */

function renderLeverage() {
  const host = document.getElementById("leverageList");
  host.innerHTML = "";
  const top = SUBJECTS.filter((s) => !getLocked(s.id)).sort((a, b) => b.coef - a.coef).slice(0, 3);
  if (!top.length) { host.innerHTML = `<li class="lv-empty">Toutes les notes sont figées 🔒.</li>`; return; }
  for (const s of top) {
    const yt = yearTag(s.id);
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="lv-name">${escapeHtml(getLabel(s))}${yt ? ` <span class="lv-when">${yt}</span>` : ""}</span>` +
      `<span class="lv-coef-tag">coef ${s.coef}</span>` +
      `<span class="lv-delta">+${fmt(s.coef / TOTAL_COEF)}/pt</span>`;
    host.appendChild(li);
  }
}

/* -------------------- Helpers SVG -------------------- */

function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, rO, rI, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const o0 = polar(cx, cy, rO, a0), o1 = polar(cx, cy, rO, a1);
  const i1 = polar(cx, cy, rI, a1), i0 = polar(cx, cy, rI, a0);
  return `M ${o0.x.toFixed(2)} ${o0.y.toFixed(2)} ` +
         `A ${rO} ${rO} 0 ${large} 1 ${o1.x.toFixed(2)} ${o1.y.toFixed(2)} ` +
         `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} ` +
         `A ${rI} ${rI} 0 ${large} 0 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)} Z`;
}
function yearTag(id) { return /_1$/.test(id) ? "1re" : /_2$/.test(id) ? "Tle" : ""; }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* -------------------- Contrôles globaux (onglets, barre d'outils) -------------------- */

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".tab-btn").forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle("active", on); b.setAttribute("aria-selected", String(on));
  });
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === tab));
  save();
  renderActiveTab(average());
}

function setSeg(containerId, attr, value, stateKey, after) {
  state[stateKey] = value;
  document.querySelectorAll(`#${containerId} [data-${attr}]`).forEach((b) =>
    b.classList.toggle("active", b.dataset[attr] === value));
  save();
  after();
}

function setDonutView(v) {
  setSeg("donutViewSeg", "view", v, "donutView", () => {
    document.getElementById("pieTargetWrap").style.display = v === "objectif" ? "" : "none";
    renderDonut(average());
  });
}
function setColorBy(c) { setSeg("colorBySeg", "color", c, "colorBy", () => renderDonut(average())); }
function setBarsMetric(mtr) { setSeg("barsMetricSeg", "metric", mtr, "barsMetric", () => renderBarsBySubject()); }

function toggleFocusLocked() {
  state.focusLocked = !state.focusLocked;
  const btn = document.getElementById("focusLockedBtn");
  btn.classList.toggle("active", state.focusLocked);
  btn.setAttribute("aria-pressed", String(state.focusLocked));
  save();
  renderDonut(average());
}

function setTarget(v) {
  state.target = Number(v);
  document.querySelectorAll(".target-select").forEach((el) => { el.value = String(state.target); });
  save();
  renderObjectif(average());
  renderActiveTab(average());
}

function populateTargets() {
  const opts = TARGETS.map(([v, lbl]) => `<option value="${v}">${lbl}</option>`).join("");
  document.querySelectorAll(".target-select").forEach((el) => { el.innerHTML = opts; el.value = String(state.target); });
}

function syncToolbar() {
  setTab(state.tab);
  ["view:donutViewSeg:donutView", "color:colorBySeg:colorBy", "metric:barsMetricSeg:barsMetric"].forEach((d) => {
    const [attr, id, key] = d.split(":");
    document.querySelectorAll(`#${id} [data-${attr}]`).forEach((b) => b.classList.toggle("active", b.dataset[attr] === state[key]));
  });
  const fl = document.getElementById("focusLockedBtn");
  fl.classList.toggle("active", state.focusLocked); fl.setAttribute("aria-pressed", String(state.focusLocked));
  document.getElementById("pieTargetWrap").style.display = state.donutView === "objectif" ? "" : "none";
}

function wireGlobal() {
  document.querySelectorAll("[data-scenario]").forEach((b) =>
    b.addEventListener("click", () => applyScenario(b.dataset.scenario)));
  document.querySelectorAll(".tab-btn").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
  document.querySelectorAll("#donutViewSeg [data-view]").forEach((b) => b.addEventListener("click", () => setDonutView(b.dataset.view)));
  document.querySelectorAll("#colorBySeg [data-color]").forEach((b) => b.addEventListener("click", () => setColorBy(b.dataset.color)));
  document.querySelectorAll("#barsMetricSeg [data-metric]").forEach((b) => b.addEventListener("click", () => setBarsMetric(b.dataset.metric)));
  document.getElementById("focusLockedBtn").addEventListener("click", toggleFocusLocked);
  document.querySelectorAll(".target-select").forEach((el) => el.addEventListener("change", () => setTarget(el.value)));

  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("shareBtn").addEventListener("click", async () => {
    const url = location.origin + location.pathname + "#s=" + encodeState();
    try {
      history.replaceState(null, "", url);
      await navigator.clipboard.writeText(url);
      document.getElementById("shareHint").textContent = "Lien copié ✅ — colle-le où tu veux pour retrouver cette simulation.";
    } catch (e) {
      document.getElementById("shareHint").textContent = "Copie automatique impossible — copie l'URL de la barre d'adresse.";
    }
  });
  document.getElementById("totalCoefTxt").textContent = String(TOTAL_COEF);
}

/* -------------------- Init -------------------- */

function init() {
  console.assert(TOTAL_COEF === 104, "Total des coefficients attendu : 104, obtenu :", TOTAL_COEF);
  loadState();
  buildControls();
  populateTargets();
  wireGlobal();
  syncToolbar();
  update();
}

document.addEventListener("DOMContentLoaded", init);
