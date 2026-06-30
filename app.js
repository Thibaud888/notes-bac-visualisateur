/* =====================================================================
   Mon Bac 2027 — simulateur de moyenne
   Source de vérité : la liste SUBJECTS (coefficients vérifiés).
   Moyenne = moyenne pondérée Σ(note×coef)/104 (calcul jamais modifié).
   Les représentations (camembert / barres / treemap / radar) montrent
   les MÊMES données sous des formes différentes.
   ===================================================================== */

"use strict";

/* -------------------- Configuration (données vérifiées) -------------------- */

const SUBJECTS = [
  { id: "fr_ecrit",  label: "Français — écrit",          group: "anticipe",     when: "Anticipé · 1re",        coef: 5,  color: "#3b82f6", domain: "lettres", evalType: "ecrit" },
  { id: "fr_oral",   label: "Français — oral",           group: "anticipe",     when: "Anticipé · 1re",        coef: 5,  color: "#60a5fa", domain: "lettres", evalType: "oral" },
  { id: "maths_ant", label: "Maths — épreuve anticipée", group: "anticipe",     when: "Anticipé · 1re · 2027", coef: 2,  color: "#2563eb", domain: "sci",     evalType: "ecrit" },

  { id: "spe_pc",    label: "Spé Physique-Chimie",       group: "specialite",   when: "Épreuve · Tle",         coef: 16, color: "#6366f1", domain: "sci",     evalType: "ecrit" },
  { id: "spe_maths", label: "Spé Mathématiques",         group: "specialite",   when: "Épreuve · Tle",         coef: 16, color: "#8b5cf6", domain: "sci",     evalType: "ecrit" },

  { id: "philo",     label: "Philosophie",               group: "terminale",    when: "Épreuve · Tle",         coef: 8,  color: "#a855f7", domain: "lettres", evalType: "ecrit" },
  { id: "go",        label: "Grand oral",                group: "terminale",    when: "Épreuve · Tle",         coef: 8,  color: "#d946ef", domain: "go",      evalType: "oral" },

  { id: "svt",   label: "SVT (spé abandonnée)",          group: "cc_premiere",  when: "Moyenne 1re",           coef: 8,  color: "#0ea5e9", domain: "sci",     evalType: "continu" },
  { id: "hg_1",  label: "Histoire-Géographie",           group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#14b8a6", domain: "hum",     evalType: "continu" },
  { id: "lva_1", label: "LVA (Anglais)",                 group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#2dd4bf", domain: "lang",    evalType: "continu" },
  { id: "lvb_1", label: "LVB (Espagnol)",                group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#34d399", domain: "lang",    evalType: "continu" },
  { id: "sci_1", label: "Enseignement scientifique",     group: "cc_premiere",  when: "Moyenne 1re",           coef: 3,  color: "#10b981", domain: "sci",     evalType: "continu" },
  { id: "emc_1", label: "EMC",                           group: "cc_premiere",  when: "Moyenne 1re",           coef: 1,  color: "#6ee7b7", domain: "hum",     evalType: "continu" },

  { id: "hg_2",  label: "Histoire-Géographie",           group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#f59e0b", domain: "hum",     evalType: "continu" },
  { id: "lva_2", label: "LVA (Anglais)",                 group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#fbbf24", domain: "lang",    evalType: "continu" },
  { id: "lvb_2", label: "LVB (Espagnol)",                group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#f97316", domain: "lang",    evalType: "continu" },
  { id: "sci_2", label: "Enseignement scientifique",     group: "cc_terminale", when: "Moyenne Tle",           coef: 3,  color: "#fb923c", domain: "sci",     evalType: "continu" },
  { id: "emc_2", label: "EMC",                           group: "cc_terminale", when: "Moyenne Tle",           coef: 1,  color: "#fcd34d", domain: "hum",     evalType: "continu" },
  { id: "eps",   label: "EPS",                           group: "cc_terminale", when: "CCF · Tle",             coef: 6,  color: "#eab308", domain: "arts",    evalType: "continu" },

  { id: "maths_exp", label: "Maths expertes (option)",   group: "option",       when: "Option · Tle",          coef: 2,  color: "#f43f5e", domain: "sci",     evalType: "continu" },
  { id: "musique",   label: "Musique (option)",          group: "option",       when: "Option · Tle",          coef: 2,  color: "#fb7185", domain: "arts",    evalType: "continu" },
];

const GROUPS = {
  anticipe:     { title: "Épreuves anticipées",          note: "Passées en fin de première (juin 2026). Inclut la nouvelle épreuve de maths (coef 2, session 2027)." },
  specialite:   { title: "Spécialités de terminale",      note: "Le cœur du bac : 16 + 16 = 32 coefficients." },
  terminale:    { title: "Philosophie & Grand oral",      note: "Épreuves finales de terminale (juin 2027). Grand oral coef 8 en 2027." },
  cc_premiere:  { title: "Contrôle continu — Première",   note: "Moyennes annuelles de 1re. La SVT compte ici (spécialité abandonnée en fin de 1re)." },
  cc_terminale: { title: "Contrôle continu — Terminale",  note: "Moyennes annuelles de terminale (l'EPS est évaluée en CCF)." },
  option:       { title: "Options",                       note: "Coef 2 chacune, ajoutées au total (100 → 104). ⚠️ Une note &lt; 10 fait légèrement baisser la moyenne : ce n'est plus l'ancien système de bonus (points au-dessus de 10)." },
};
const GROUP_ORDER = ["anticipe", "specialite", "terminale", "cc_premiere", "cc_terminale", "option"];

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
  { at: 10, label: "l'admission" }, { at: 12, label: "la mention Assez bien" },
  { at: 14, label: "la mention Bien" }, { at: 16, label: "la mention Très bien" },
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
  tab: "pie",          // représentation : pie | bars | treemap | radar
  view: "contrib",     // mesure : contrib (note×coef, cible) | coef
  colorBy: "matiere",  // matiere | domaine | type
  focusLocked: false,
  target: 14,
};
let state = Object.assign({}, DEFAULTS);
let pinnedId = null;   // matière épinglée (détail figé) — non persisté
const refs = {};

const getNote = (id) => {
  const v = state.notes[id];
  return typeof v === "number" && isFinite(v) ? clampNote(v) : 10;
};
const getLocked = (id) => !!state.locked[id];
const getLabel = (s) => state.labels[s.id] || s.label;

function clampNote(v) { v = Math.max(0, Math.min(20, v)); return Math.round(v * 4) / 4; }

/* -------------------- Calculs -------------------- */

function average(noteOf = getNote) {
  let pts = 0, coef = 0;
  for (const s of SUBJECTS) { pts += noteOf(s.id) * s.coef; coef += s.coef; }
  return coef ? pts / coef : 0;
}
function mentionFor(m) { return MENTIONS.find((x) => m >= x.min) || MENTIONS[MENTIONS.length - 1]; }
function nextStep(m) { return NEXT_STEPS.find((x) => m < x.at) || null; }

const fmt = (x) => x.toFixed(2).replace(".", ",");
const fmt1 = (x) => x.toFixed(1).replace(".", ",");

function noteColor(v) {
  if (v < 8) return "#e5484d"; if (v < 10) return "#f76808"; if (v < 12) return "#eab308";
  if (v < 14) return "#84cc16"; if (v < 16) return "#22c55e"; return "#10b981";
}

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
  return getLabel(SUBJECTS.find((x) => x.id === key));
}

// Données partagées par camembert / barres / treemap
function chartData() {
  const view = state.view;
  return SUBJECTS.map((s) => ({
    id: s.id, s, key: groupKeyOf(s), color: subjColor(s),
    value: view === "coef" ? s.coef : getNote(s.id) * s.coef,
    note: getNote(s.id), coef: s.coef, locked: getLocked(s.id), oi: orderIndexOf(s),
  }));
}

/* -------------------- Persistance -------------------- */

function migrate(o) {
  if (o.donutView && !o.view) o.view = o.donutView === "coef" ? "coef" : "contrib";
  delete o.donutView; delete o.barsMetric; delete o.mode;
  if (!["contrib", "coef"].includes(o.view)) o.view = "contrib";
  if (o.tab === "objectif") o.tab = "pie";
  if (!["pie", "bars", "treemap", "radar"].includes(o.tab)) o.tab = "pie";
  if (!["matiere", "domaine", "type"].includes(o.colorBy)) o.colorBy = "matiere";
  o.focusLocked = !!o.focusLocked;
  o.target = Number(o.target) || 14;
  return o;
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
function loadState() {
  const hash = location.hash.match(/s=([^&]+)/);
  if (hash) { const d = decodeState(hash[1]); if (d) { state = d; return; } }
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) state = migrate(Object.assign({}, DEFAULTS, JSON.parse(raw))); }
  catch (e) {}
}
function encodeState() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); } catch (e) { return ""; } }
function decodeState(str) { try { return migrate(Object.assign({}, DEFAULTS, JSON.parse(decodeURIComponent(escape(atob(str)))))); } catch (e) { return null; } }

/* -------------------- Contrôles de notes (sliders) -------------------- */

function buildControls() {
  const host = document.getElementById("groups");
  host.innerHTML = "";
  for (const g of GROUP_ORDER) {
    const subs = SUBJECTS.filter((s) => s.group === g);
    const coefSum = subs.reduce((a, s) => a + s.coef, 0);
    const section = document.createElement("div");
    section.className = "group";
    section.innerHTML =
      `<div class="group-head"><h3>${GROUPS[g].title}</h3><span class="g-coef">coef ${coefSum}</span></div>` +
      `<p class="group-note">${GROUPS[g].note}</p>`;
    for (const s of subs) {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML =
        `<div class="row-top">` +
          `<span class="name" contenteditable="true" spellcheck="false" data-id="${s.id}">${escapeHtml(getLabel(s))}</span>` +
          `<span class="coef-badge">coef ${s.coef}</span><span class="when">${s.when}</span>` +
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

function setNote(id, v) { if (isNaN(v)) return; state.notes[id] = clampNote(v); save(); update(); }
function toggleLock(id) { state.locked[id] = !state.locked[id]; save(); update(); }
function setLabel(id, text) {
  text = (text || "").replace(/\s+/g, " ").trim();
  const base = /_(1|2)$/.test(id) ? id.replace(/_(1|2)$/, "") : null;
  const targets = base ? SUBJECTS.filter((s) => s.id.replace(/_(1|2)$/, "") === base).map((s) => s.id) : [id];
  for (const t of targets) {
    if (text && text !== (SUBJECTS.find((s) => s.id === t)?.label || "")) state.labels[t] = text;
    else delete state.labels[t];
    if (refs[t]) refs[t].name.textContent = state.labels[t] || SUBJECTS.find((s) => s.id === t).label;
  }
  save(); update();
}

/* -------------------- Boucle de rendu -------------------- */

function update() {
  const m = average();
  for (const s of SUBJECTS) {
    const r = refs[s.id]; if (!r) continue;
    const v = getNote(s.id), locked = getLocked(s.id);
    if (document.activeElement !== r.slider) r.slider.value = v;
    if (document.activeElement !== r.number) r.number.value = v;
    const pct = (v / 20) * 100, col = noteColor(v);
    r.slider.style.background = `linear-gradient(90deg, ${col} 0%, ${col} ${pct}%, #e6e9f2 ${pct}%, #e6e9f2 100%)`;
    r.row.classList.toggle("is-locked", locked);
    r.lockBtn.textContent = locked ? "🔒" : "🔓";
    r.lockBtn.classList.toggle("locked", locked);
    r.lockBtn.setAttribute("aria-pressed", String(locked));
  }
  renderMention(m);
  renderLeverage();
  renderActiveTab(m);
}

function renderActiveTab(m) {
  switch (state.tab) {
    case "bars":    renderBars(m); break;
    case "treemap": renderTreemap(m); break;
    case "radar":   renderRadar(m); break;
    default:        renderDonut(m);
  }
}

/* -------------------- En-tête : jauge + mention -------------------- */

function renderMention(m) {
  const men = mentionFor(m);
  const badge = document.getElementById("mentionBadge");
  badge.textContent = men.label; badge.style.background = men.color;
  document.getElementById("mentionStatus").textContent = men.status;
  const next = nextStep(m), el = document.getElementById("mentionNext");
  if (!next) el.textContent = "Tu es tout en haut de l'échelle. 🎉";
  else { const gap = next.at - m; el.textContent = `Il te manque ${fmt(gap)} pt${gap >= 2 ? "s" : ""} pour ${next.label} (${next.at}/20).`; }
}

/* -------------------- Détail épinglable (tooltip partagé) -------------------- */

function detailHTML(id) {
  const s = SUBJECTS.find((x) => x.id === id); if (!s) return "";
  const yt = yearTag(id), note = getNote(id);
  return `<strong>${escapeHtml(getLabel(s))}${yt ? ` (${yt})` : ""}</strong> — coef ${s.coef} · note ${fmt(note)}/20 · ` +
    `${DOMAIN_META[s.domain].title} · ${TYPE_META[s.evalType].title} · ${getLocked(id) ? "🔒 figée" : "variable"} → ` +
    `apporte <strong>${fmt(note * s.coef / TOTAL_COEF)}</strong> pts à la moyenne.`;
}
function showTipFor(id) { const t = document.getElementById("chartTip"); t.hidden = false; t.innerHTML = (pinnedId === id ? "📌 " : "") + detailHTML(id); }
function refreshTip() {
  const t = document.getElementById("chartTip");
  if (pinnedId && SUBJECTS.some((s) => s.id === pinnedId)) { t.hidden = false; t.innerHTML = "📌 " + detailHTML(pinnedId); }
  else { t.hidden = true; t.innerHTML = ""; }
}
function setHint(txt) { document.getElementById("chartHint").textContent = txt; }
function clearLegend() { document.getElementById("legend").innerHTML = ""; }

// Clic = épingle/désépingle ; survol = aperçu ; sortie = revient à l'épinglé.
function wireChartInteractions() {
  const chart = document.getElementById("chart");
  chart.querySelectorAll("[data-id]").forEach((el) => {
    const id = el.getAttribute("data-id");
    el.addEventListener("mouseenter", () => showTipFor(id));
    el.addEventListener("focus", () => showTipFor(id));
    el.addEventListener("click", () => { pinnedId = pinnedId === id ? null : id; renderActiveTab(average()); });
  });
  chart.onmouseleave = () => refreshTip();
  refreshTip();
}

/* -------------------- Légende partagée (camembert / treemap) -------------------- */

function buildLegend() {
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  const view = state.view;
  if (state.colorBy === "matiere") {
    const items = chartData().filter((d) => d.value > 0).sort((a, b) => a.oi - b.oi || b.value - a.value);
    for (const d of items) {
      const right = view === "coef" ? `coef ${d.coef}` : `${fmt(d.value / TOTAL_COEF)} pts`;
      const yt = yearTag(d.id), li = document.createElement("li");
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
      const subs = SUBJECTS.filter((s) => groupKeyOf(s) === key); if (!subs.length) continue;
      const coef = subs.reduce((a, s) => a + s.coef, 0);
      const val = subs.reduce((a, s) => a + (view === "coef" ? s.coef : getNote(s.id) * s.coef), 0);
      const right = view === "coef" ? `coef ${coef}` : `${fmt(val / TOTAL_COEF)} pts`;
      const li = document.createElement("li");
      li.innerHTML = `<span class="dot" style="background:${meta[key].color}"></span><span>${meta[key].title}</span><span class="lg-coef">${right}</span>`;
      legend.appendChild(li);
    }
  }
}

/* -------------------- Représentation : Camembert -------------------- */

function renderDonut(m) {
  const view = state.view;
  // Figées d'abord (regroupées au début), puis le reste — ordonné par famille/valeur.
  let slices = chartData().filter((d) => d.value > 0)
    .sort((a, b) => (a.locked === b.locked ? (a.oi - b.oi || b.value - a.value) : (a.locked ? -1 : 1)));
  const sum = slices.reduce((a, d) => a + d.value, 0) || 1;
  const total = view === "contrib" ? Math.max(sum, state.target * TOTAL_COEF) : sum;

  const cx = 120, cy = 120, rO = 112, rI = 68;
  let svg = `<svg viewBox="0 0 240 240" role="img" aria-label="Camembert pondéré">`;
  svg += `<defs><pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(255,255,255,.6)" stroke-width="2.6"/></pattern></defs>`;
  const spans = []; let a0 = 0, curKey = null, spanStart = 0;
  for (const d of slices) {
    const a1 = a0 + (d.value / total) * 360; d.a0 = a0; d.a1 = a1;
    const dim = state.focusLocked && !d.locked ? ' opacity="0.14"' : "";
    const pin = pinnedId === d.id ? ' stroke="#1c2138" stroke-width="2.5"' : "";
    svg += `<path d="${arcPath(cx, cy, rO, rI, a0, a1 - 0.5)}" fill="${d.color}"${dim}${pin} data-id="${d.id}" tabindex="0" style="cursor:pointer"></path>`;
    if (d.locked) svg += `<path d="${arcPath(cx, cy, rO, rI, a0, a1 - 0.5)}" fill="url(#hatch)" stroke="rgba(28,33,56,.45)" stroke-width="1"${dim} pointer-events="none"></path>`;
    if (d.key !== curKey) { if (curKey !== null) spans.push({ key: curKey, a0: spanStart, a1: a0 }); curKey = d.key; spanStart = a0; }
    a0 = a1;
  }
  if (curKey !== null) spans.push({ key: curKey, a0: spanStart, a1: a0 });
  if (view === "contrib" && sum < total) {
    svg += `<path d="${arcPath(cx, cy, rO, rI, a0, 360)}" fill="#e6e9f2"></path>`;
    if (360 - a0 >= 22) svg += sliceLabel(cx, cy, rO, rI, (a0 + 360) / 2, "à gagner");
  }
  const lbl = (a, b, t) => sliceLabel(cx, cy, rO, rI, (a + b) / 2, t);
  if (state.colorBy === "matiere") {
    for (const d of slices) if (d.a1 - d.a0 >= 18) { const yt = yearTag(d.id); svg += lbl(d.a0, d.a1, shortLabel(getLabel(d.s)) + (yt ? " " + yt : "")); }
  } else { for (const g of spans) if (g.a1 - g.a0 >= 18) svg += lbl(g.a0, g.a1, groupTitleOf(g.key)); }

  const men = mentionFor(m);
  let sub = state.focusLocked ? `${slices.filter((d) => d.locked).length} note(s) figée(s)` : view === "coef" ? "poids (coef)" : "moyenne /20";
  svg += `<text x="120" y="116" text-anchor="middle" font-size="34" font-weight="800" fill="${men.color}">${fmt(m)}</text>`;
  svg += `<text x="120" y="137" text-anchor="middle" font-size="11" fill="#5b627e">${sub}</text>`;
  if (view === "contrib" && !state.focusLocked)
    svg += `<text x="120" y="152" text-anchor="middle" font-size="10" fill="#5b627e">${fmt1(Math.min(100, sum / total * 100))} % de la cible ${state.target}/20</text>`;
  svg += `</svg>`;
  document.getElementById("chart").innerHTML = svg;
  buildLegend();
  setHint("Survole ou clique une part pour épingler 📌 son détail. Les notes figées (hachurées 🔒) sont regroupées au début.");
  wireChartInteractions();
}

function sliceLabel(cx, cy, rO, rI, mid, text) {
  const p = polar(cx, cy, (rO + rI) / 2, mid);
  return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" class="slice-label">${escapeHtml(text)}</text>`;
}

/* -------------------- Représentation : Barres -------------------- */

function renderBars(m) {
  const view = state.view;
  // Colonne empilée verticale : figées en bas (regroupées), puis le reste.
  const items = chartData().filter((d) => d.value > 0)
    .sort((a, b) => (a.locked === b.locked ? (a.oi - b.oi || b.value - a.value) : (a.locked ? -1 : 1)));
  const sum = items.reduce((a, d) => a + d.value, 0) || 1;
  const total = view === "contrib" ? Math.max(sum, state.target * TOTAL_COEF) : sum;

  const W = 200, H = 380, colX = 40, colW = 120, top = 14, bottom = H - 14, colH = bottom - top;
  let svg = `<svg class="stacked" viewBox="0 0 ${W} ${H}" role="img" aria-label="Barres empilées par matière">`;
  svg += `<defs><pattern id="hatchB" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(255,255,255,.6)" stroke-width="2.6"/></pattern></defs>`;
  let y = bottom;
  for (const d of items) {
    const h = (d.value / total) * colH, yTop = y - h;
    const dim = state.focusLocked && !d.locked ? ' opacity="0.16"' : "";
    const pin = pinnedId === d.id ? ' stroke="#1c2138" stroke-width="2.5"' : "";
    svg += `<g data-id="${d.id}" tabindex="0">`;
    svg += `<rect x="${colX}" y="${yTop.toFixed(1)}" width="${colW}" height="${h.toFixed(1)}" fill="${d.color}"${dim}${pin}/>`;
    if (d.locked) svg += `<rect x="${colX}" y="${yTop.toFixed(1)}" width="${colW}" height="${h.toFixed(1)}" fill="url(#hatchB)"${dim} pointer-events="none"/>`;
    if (h >= 16) svg += `<text x="${colX + colW / 2}" y="${(yTop + h / 2).toFixed(1)}" text-anchor="middle" dominant-baseline="central" class="slice-label">${escapeHtml(shortLabel(getLabel(d.s)))}</text>`;
    svg += `</g>`;
    y = yTop;
  }
  if (view === "contrib" && sum < total && y - top > 1) {
    svg += `<rect x="${colX}" y="${top}" width="${colW}" height="${(y - top).toFixed(1)}" fill="#e6e9f2"/>`;
    if (y - top > 14) svg += `<text x="${colX + colW / 2}" y="${(top + (y - top) / 2).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="#5b627e">à gagner</text>`;
  }
  svg += `<rect x="${colX}" y="${top}" width="${colW}" height="${colH}" fill="none" stroke="#e6e9f2"/>`;
  svg += `</svg>`;
  document.getElementById("chart").innerHTML = svg;
  buildLegend();
  setHint("Colonne empilée — chaque segment = une matière (hauteur ∝ " + (view === "coef" ? "coefficient" : "contribution") + "). Clique pour épingler 📌. Les figées sont regroupées en bas.");
  wireChartInteractions();
}

/* -------------------- Représentation : Treemap (binaire) -------------------- */

function treemapLayout(items, x, y, w, h, out) {
  if (!items.length) return;
  if (items.length === 1) { out.push({ d: items[0], x, y, w, h }); return; }
  const total = items.reduce((a, b) => a + b.value, 0);
  let i = 0, acc = 0;
  while (i < items.length - 1 && acc + items[i].value < total / 2) { acc += items[i].value; i++; }
  const cut = Math.min(i, items.length - 2);   // garantit deux groupes non vides (sinon récursion infinie)
  const a = items.slice(0, cut + 1), b = items.slice(cut + 1);
  const r = a.reduce((s, d) => s + d.value, 0) / total;
  if (w >= h) { const aw = w * r; treemapLayout(a, x, y, aw, h, out); treemapLayout(b, x + aw, y, w - aw, h, out); }
  else { const ah = h * r; treemapLayout(a, x, y, w, ah, out); treemapLayout(b, x, y + ah, w, h - ah, out); }
}

function renderTreemap(m) {
  const view = state.view;
  const items = chartData().filter((d) => d.value > 0)
    .sort((a, b) => (a.locked === b.locked ? b.value - a.value : (a.locked ? -1 : 1)));
  const W = 360, H = 232, gap = 2, cells = [];
  treemapLayout(items, 0, 0, W, H, cells);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Treemap par matière">`;
  svg += `<defs><pattern id="hatchT" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(255,255,255,.55)" stroke-width="2.6"/></pattern></defs>`;
  for (const c of cells) {
    const x = c.x + gap / 2, y = c.y + gap / 2, w = Math.max(0, c.w - gap), hh = Math.max(0, c.h - gap);
    const dim = state.focusLocked && !c.d.locked ? ' opacity="0.16"' : "";
    const pin = pinnedId === c.d.id ? ' stroke="#1c2138" stroke-width="2.5"' : "";
    svg += `<g data-id="${c.d.id}" tabindex="0" style="cursor:pointer">`;
    svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" rx="3" fill="${c.d.color}"${dim}${pin}/>`;
    if (c.d.locked) svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" rx="3" fill="url(#hatchT)"${dim} pointer-events="none"/>`;
    if (w > 46 && hh > 22) {
      svg += `<text x="${(x + 5).toFixed(1)}" y="${(y + 15).toFixed(1)}" class="tm-label"${dim}>${escapeHtml(shortLabel(getLabel(c.d.s)))}</text>`;
      if (hh > 36) svg += `<text x="${(x + 5).toFixed(1)}" y="${(y + 28).toFixed(1)}" class="tm-sub"${dim}>${view === "coef" ? `coef ${c.d.coef}` : `${fmt(c.d.value / TOTAL_COEF)} pts`}</text>`;
    }
    svg += `</g>`;
  }
  svg += `</svg>`;
  document.getElementById("chart").innerHTML = svg;
  buildLegend();
  setHint("Clique une case pour épingler son détail. Surface ∝ " + (view === "coef" ? "coefficient." : "contribution (note × coef)."));
  wireChartInteractions();
}

/* -------------------- Représentation : Domaines (radar) -------------------- */

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
  document.getElementById("chart").innerHTML = svg;
  clearLegend();
  setHint("Moyenne par domaine. Contour pointillé = ton objectif (mention visée).");
  refreshTip();
}

/* -------------------- Levier (compact, top 3) -------------------- */

function renderLeverage() {
  const host = document.getElementById("leverageList");
  host.innerHTML = "";
  const top = SUBJECTS.filter((s) => !getLocked(s.id)).sort((a, b) => b.coef - a.coef).slice(0, 3);
  if (!top.length) { host.innerHTML = `<li class="lv-empty">Toutes les notes sont figées 🔒.</li>`; return; }
  for (const s of top) {
    const yt = yearTag(s.id), li = document.createElement("li");
    li.innerHTML = `<span class="lv-name">${escapeHtml(getLabel(s))}${yt ? ` <span class="lv-when">${yt}</span>` : ""}</span>` +
      `<span class="lv-coef-tag">coef ${s.coef}</span><span class="lv-delta">+${fmt(s.coef / TOTAL_COEF)}/pt</span>`;
    host.appendChild(li);
  }
}

/* -------------------- Helpers -------------------- */

function polar(cx, cy, r, deg) { const a = ((deg - 90) * Math.PI) / 180; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
function arcPath(cx, cy, rO, rI, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const o0 = polar(cx, cy, rO, a0), o1 = polar(cx, cy, rO, a1), i1 = polar(cx, cy, rI, a1), i0 = polar(cx, cy, rI, a0);
  return `M ${o0.x.toFixed(2)} ${o0.y.toFixed(2)} A ${rO} ${rO} 0 ${large} 1 ${o1.x.toFixed(2)} ${o1.y.toFixed(2)} ` +
    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} A ${rI} ${rI} 0 ${large} 0 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)} Z`;
}
function yearTag(id) { return /_1$/.test(id) ? "1re" : /_2$/.test(id) ? "Tle" : ""; }
function shortLabel(txt) { const t = txt.replace(/\s*\(.*?\)\s*/g, "").trim(); return t.length > 14 ? t.slice(0, 13) + "…" : t; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* -------------------- Contrôles globaux -------------------- */

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".tab-btn").forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle("active", on); b.setAttribute("aria-selected", String(on)); });
  updateToolbarVisibility();
  save();
  renderActiveTab(average());
}
function updateToolbarVisibility() {
  const subjectRep = state.tab !== "radar";
  document.querySelector('[data-tb="view"]').style.display = subjectRep ? "" : "none";
  document.querySelector('[data-tb="color"]').style.display = subjectRep ? "" : "none";
  document.getElementById("focusLockedBtn").style.display = subjectRep ? "" : "none";
  const showTarget = (state.tab === "pie" && state.view === "contrib") || state.tab === "radar";
  document.getElementById("pieTargetWrap").style.display = showTarget ? "" : "none";
}
function setSeg(containerId, attr, value, key) {
  state[key] = value;
  document.querySelectorAll(`#${containerId} [data-${attr}]`).forEach((b) => b.classList.toggle("active", b.dataset[attr] === value));
}
function setView(v) { setSeg("donutViewSeg", "view", v, "view"); updateToolbarVisibility(); save(); renderActiveTab(average()); }
function setColorBy(c) { setSeg("colorBySeg", "color", c, "colorBy"); save(); renderActiveTab(average()); }
function toggleFocusLocked() {
  state.focusLocked = !state.focusLocked;
  const btn = document.getElementById("focusLockedBtn");
  btn.classList.toggle("active", state.focusLocked); btn.setAttribute("aria-pressed", String(state.focusLocked));
  save(); renderActiveTab(average());
}
function setTarget(v) {
  state.target = Number(v);
  document.querySelectorAll(".target-select").forEach((el) => { el.value = String(state.target); });
  save(); renderActiveTab(average());
}
function populateTargets() {
  const opts = TARGETS.map(([v, lbl]) => `<option value="${v}">${lbl}</option>`).join("");
  document.querySelectorAll(".target-select").forEach((el) => { el.innerHTML = opts; el.value = String(state.target); });
}
function syncToolbar() {
  document.querySelectorAll(".tab-btn").forEach((b) => { const on = b.dataset.tab === state.tab; b.classList.toggle("active", on); b.setAttribute("aria-selected", String(on)); });
  document.querySelectorAll("#donutViewSeg [data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
  document.querySelectorAll("#colorBySeg [data-color]").forEach((b) => b.classList.toggle("active", b.dataset.color === state.colorBy));
  const fl = document.getElementById("focusLockedBtn");
  fl.classList.toggle("active", state.focusLocked); fl.setAttribute("aria-pressed", String(state.focusLocked));
  updateToolbarVisibility();
}

function wireGlobal() {
  document.querySelectorAll(".tab-btn").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
  document.querySelectorAll("#donutViewSeg [data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  document.querySelectorAll("#colorBySeg [data-color]").forEach((b) => b.addEventListener("click", () => setColorBy(b.dataset.color)));
  document.getElementById("focusLockedBtn").addEventListener("click", toggleFocusLocked);
  document.querySelectorAll(".target-select").forEach((el) => el.addEventListener("change", () => setTarget(el.value)));
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("shareBtn").addEventListener("click", async () => {
    const url = location.origin + location.pathname + "#s=" + encodeState();
    try { history.replaceState(null, "", url); await navigator.clipboard.writeText(url); document.getElementById("shareHint").textContent = "Lien copié ✅ — colle-le où tu veux pour retrouver cette simulation."; }
    catch (e) { document.getElementById("shareHint").textContent = "Copie automatique impossible — copie l'URL de la barre d'adresse."; }
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
