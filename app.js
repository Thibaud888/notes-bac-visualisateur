/* =====================================================================
   Mon Bac 2027 — simulateur de moyenne
   Source de vérité : la liste SUBJECTS ci-dessous (coefficients vérifiés).
   Tout le reste (moyenne, camembert, mentions, leviers) en découle.
   ===================================================================== */

"use strict";

/* -------------------- Configuration (données vérifiées) -------------------- */

// Bac général, session 2027. Base = 100 coef (60 épreuves + 40 contrôle continu),
// + options (4) => 104. Voir README.md et sources officielles.
const SUBJECTS = [
  // Épreuves anticipées (fin de 1re, juin 2026)
  { id: "fr_ecrit",  label: "Français — écrit",          group: "anticipe",     when: "Anticipé · 1re",        coef: 5, color: "#3b82f6" },
  { id: "fr_oral",   label: "Français — oral",           group: "anticipe",     when: "Anticipé · 1re",        coef: 5, color: "#60a5fa" },
  { id: "maths_ant", label: "Maths — épreuve anticipée", group: "anticipe",     when: "Anticipé · 1re · 2027", coef: 2, color: "#2563eb" },

  // Spécialités de terminale (épreuves 2027)
  { id: "spe_pc",    label: "Spé Physique-Chimie",       group: "specialite",   when: "Épreuve · Tle",         coef: 16, color: "#6366f1" },
  { id: "spe_maths", label: "Spé Mathématiques",         group: "specialite",   when: "Épreuve · Tle",         coef: 16, color: "#8b5cf6" },

  // Autres épreuves de terminale
  { id: "philo",     label: "Philosophie",               group: "terminale",    when: "Épreuve · Tle",         coef: 8, color: "#a855f7" },
  { id: "go",        label: "Grand oral",                group: "terminale",    when: "Épreuve · Tle",         coef: 8, color: "#d946ef" },

  // Contrôle continu — Première
  { id: "svt",   label: "SVT (spé abandonnée)",          group: "cc_premiere",  when: "Moyenne 1re",           coef: 8, color: "#0ea5e9" },
  { id: "hg_1",  label: "Histoire-Géographie",           group: "cc_premiere",  when: "Moyenne 1re",           coef: 3, color: "#14b8a6" },
  { id: "lva_1", label: "LVA (Anglais)",                 group: "cc_premiere",  when: "Moyenne 1re",           coef: 3, color: "#2dd4bf" },
  { id: "lvb_1", label: "LVB (Espagnol)",                group: "cc_premiere",  when: "Moyenne 1re",           coef: 3, color: "#34d399" },
  { id: "sci_1", label: "Enseignement scientifique",     group: "cc_premiere",  when: "Moyenne 1re",           coef: 3, color: "#10b981" },
  { id: "emc_1", label: "EMC",                           group: "cc_premiere",  when: "Moyenne 1re",           coef: 1, color: "#6ee7b7" },

  // Contrôle continu — Terminale
  { id: "hg_2",  label: "Histoire-Géographie",           group: "cc_terminale", when: "Moyenne Tle",           coef: 3, color: "#f59e0b" },
  { id: "lva_2", label: "LVA (Anglais)",                 group: "cc_terminale", when: "Moyenne Tle",           coef: 3, color: "#fbbf24" },
  { id: "lvb_2", label: "LVB (Espagnol)",                group: "cc_terminale", when: "Moyenne Tle",           coef: 3, color: "#f97316" },
  { id: "sci_2", label: "Enseignement scientifique",     group: "cc_terminale", when: "Moyenne Tle",           coef: 3, color: "#fb923c" },
  { id: "emc_2", label: "EMC",                           group: "cc_terminale", when: "Moyenne Tle",           coef: 1, color: "#fcd34d" },
  { id: "eps",   label: "EPS",                           group: "cc_terminale", when: "CCF · Tle",             coef: 6, color: "#eab308" },

  // Options (s'ajoutent au total : 100 -> 104)
  { id: "maths_exp", label: "Maths expertes (option)",   group: "option",       when: "Option · Tle",          coef: 2, color: "#f43f5e" },
  { id: "musique",   label: "Musique (option)",          group: "option",       when: "Option · Tle",          coef: 2, color: "#fb7185" },
];

const GROUPS = {
  anticipe:     { title: "Épreuves anticipées",            note: "Passées en fin de première (juin 2026). Inclut la nouvelle épreuve de maths (coef 2, session 2027)." },
  specialite:   { title: "Spécialités de terminale",        note: "Le cœur du bac : 16 + 16 = 32 coefficients." },
  terminale:    { title: "Philosophie & Grand oral",        note: "Épreuves finales de terminale (juin 2027). Grand oral coef 8 en 2027." },
  cc_premiere:  { title: "Contrôle continu — Première",     note: "Moyennes annuelles de 1re. La SVT compte ici (spécialité abandonnée en fin de 1re)." },
  cc_terminale: { title: "Contrôle continu — Terminale",    note: "Moyennes annuelles de terminale (l'EPS est évaluée en CCF)." },
  option:       { title: "Options",                         note: "Évaluées en contrôle continu (terminale). Elles s'ajoutent au total : 100 → 104." },
};

const GROUP_ORDER = ["anticipe", "specialite", "terminale", "cc_premiere", "cc_terminale", "option"];

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

const STORE_KEY = "bac2027.simulateur";
const TOTAL_COEF = SUBJECTS.reduce((s, x) => s + x.coef, 0); // 104

/* -------------------- État -------------------- */

let state = { notes: {}, locked: {}, labels: {}, mode: "coef" };
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

/* -------------------- Persistance -------------------- */

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* mode privé : on ignore */ }
}

function loadState() {
  // 1) priorité au lien partagé (#s=...)
  const hash = location.hash.match(/s=([^&]+)/);
  if (hash) {
    const decoded = decodeState(hash[1]);
    if (decoded) { state = decoded; return; }
  }
  // 2) sinon localStorage
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) state = Object.assign({ notes: {}, locked: {}, labels: {}, mode: "coef" }, JSON.parse(raw));
  } catch (e) { /* ignore */ }
}

function encodeState() {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
  catch (e) { return ""; }
}
function decodeState(str) {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(str))));
    return Object.assign({ notes: {}, locked: {}, labels: {}, mode: "coef" }, obj);
  } catch (e) { return null; }
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
  const def = SUBJECTS.find((s) => s.id === id);
  // On synchronise les paires 1re/Tle (ex : LVA en 1re et en Tle)
  const base = /_(1|2)$/.test(id) ? id.replace(/_(1|2)$/, "") : null;
  const targets = base ? SUBJECTS.filter((s) => s.id.replace(/_(1|2)$/, "") === base).map((s) => s.id) : [id];
  for (const t of targets) {
    if (text && text !== (SUBJECTS.find((s) => s.id === t)?.label || "")) state.labels[t] = text;
    else delete state.labels[t];
    if (refs[t]) refs[t].name.textContent = state.labels[t] || SUBJECTS.find((s) => s.id === t).label;
  }
  save();
  update();
  void def;
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

/* -------------------- Rendu : viz -------------------- */

function update() {
  const m = average();

  // 1) sliders + champs + cadenas
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
  renderBlocks();
  renderScale(m);
  renderDonut(m);
  renderLeverage();
  renderObjectif(m);
}

function renderGauge(m) {
  const col = mentionFor(m).color;
  const r = 72, c = 2 * Math.PI * r, prog = Math.max(0, Math.min(1, m / 20));
  const off = c * (1 - prog);
  document.getElementById("gauge").innerHTML =
    `<svg viewBox="0 0 180 180" role="img" aria-label="Moyenne ${fmt(m)} sur 20">
       <circle cx="90" cy="90" r="${r}" fill="none" stroke="#eef0fb" stroke-width="14"/>
       <circle cx="90" cy="90" r="${r}" fill="none" stroke="${col}" stroke-width="14"
               stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
               transform="rotate(-90 90 90)" style="transition:stroke-dashoffset .4s, stroke .3s"/>
       <text class="gauge-val" x="90" y="86" text-anchor="middle" font-size="38" fill="${col}">${fmt(m)}</text>
       <text x="90" y="106" text-anchor="middle" font-size="13" fill="#5b627e">/ 20 de moyenne</text>
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

function renderBlocks() {
  const defs = [
    { label: "Contrôle continu", groups: ["cc_premiere", "cc_terminale"] },
    { label: "Épreuves",         groups: ["anticipe", "specialite", "terminale"] },
    { label: "Options",          groups: ["option"] },
  ];
  const host = document.getElementById("blocks");
  host.innerHTML = "";
  for (const d of defs) {
    const subs = SUBJECTS.filter((s) => d.groups.includes(s.group));
    const coef = subs.reduce((a, s) => a + s.coef, 0);
    const avg = subs.reduce((a, s) => a + getNote(s.id) * s.coef, 0) / coef;
    const col = noteColor(avg);
    const el = document.createElement("div");
    el.className = "block";
    el.innerHTML =
      `<div class="b-label">${d.label}</div>` +
      `<div class="b-val" style="color:${col}">${fmt(avg)}</div>` +
      `<div class="b-coef">coef ${coef}</div>` +
      `<div class="b-bar"><span style="width:${(avg / 20) * 100}%;background:${col}"></span></div>`;
    host.appendChild(el);
  }
}

function renderScale(m) {
  const W = 520, pad = 26, H = 78;
  const x = (v) => pad + (v / 20) * (W - 2 * pad);
  const zones = [
    [0, 8, "#e5484d"], [8, 10, "#f76808"], [10, 12, "#eab308"],
    [12, 14, "#84cc16"], [14, 16, "#22c55e"], [16, 18, "#10b981"], [18, 20, "#6366f1"],
  ];
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Position de la moyenne sur l'échelle des mentions">`;
  for (const [a, b, c] of zones) {
    svg += `<rect x="${x(a)}" y="28" width="${x(b) - x(a)}" height="18" fill="${c}"
                  ${a === 0 ? 'rx="5"' : ""} ${b === 20 ? 'rx="5"' : ""}/>`;
  }
  for (const t of [8, 10, 12, 14, 16, 18]) {
    svg += `<line x1="${x(t)}" y1="26" x2="${x(t)}" y2="48" stroke="#fff" stroke-width="1.5"/>`;
    svg += `<text x="${x(t)}" y="62" text-anchor="middle" font-size="10" fill="#5b627e">${t}</text>`;
  }
  // curseur
  const mx = x(Math.max(0, Math.min(20, m)));
  svg += `<line x1="${mx}" y1="20" x2="${mx}" y2="50" stroke="#1c2138" stroke-width="2"/>`;
  svg += `<polygon points="${mx - 5},20 ${mx + 5},20 ${mx},27" fill="#1c2138"/>`;
  svg += `<text x="${mx}" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#1c2138">${fmt(m)}</text>`;
  svg += `</svg>`;
  document.getElementById("scale").innerHTML = svg;
}

function renderDonut(m) {
  const mode = state.mode;
  const data = SUBJECTS.map((s) => ({
    s, label: getLabel(s), coef: s.coef, note: getNote(s.id), color: s.color,
    value: mode === "coef" ? s.coef : getNote(s.id) * s.coef,
  }));
  const slices = data.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const total = slices.reduce((a, d) => a + d.value, 0) || 1;

  const cx = 100, cy = 100, rO = 92, rI = 58;
  let svg = `<svg viewBox="0 0 200 200" role="img" aria-label="Camembert pondéré">`;
  let a0 = 0;
  for (const d of slices) {
    const a1 = a0 + (d.value / total) * 360;
    svg += `<path d="${arcPath(cx, cy, rO, rI, a0, a1 - 0.4)}" fill="${d.color}"
                  data-id="${d.s.id}" tabindex="0"
                  aria-label="${escapeHtml(d.label)}, coef ${d.coef}, note ${fmt(d.note)}"></path>`;
    a0 = a1;
  }
  svg += `<text class="center-val" x="100" y="96" text-anchor="middle" font-size="30" fill="${mentionFor(m).color}">${fmt(m)}</text>`;
  svg += `<text class="center-sub" x="100" y="116" text-anchor="middle" font-size="11">${mode === "coef" ? "moyenne /20" : "moyenne /20"}</text>`;
  svg += `</svg>`;

  const donut = document.getElementById("donut");
  donut.innerHTML = svg;

  // légende (triée comme les parts)
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  for (const d of slices) {
    const li = document.createElement("li");
    const right = mode === "coef" ? `coef ${d.coef}` : `${fmt(d.value / TOTAL_COEF)} pts`;
    const yt = yearTag(d.s.id);
    li.innerHTML = `<span class="dot" style="background:${d.color}"></span>` +
                   `<span>${escapeHtml(d.label)}${yt ? ` <span class="lv-when">${yt}</span>` : ""}</span>` +
                   `<span class="lg-coef">${right}</span>`;
    legend.appendChild(li);
  }

  // tooltip
  const tip = document.getElementById("donutTip");
  const showTip = (id) => {
    const d = data.find((x) => x.s.id === id);
    if (!d) return;
    const yt = yearTag(d.s.id);
    tip.hidden = false;
    tip.innerHTML =
      `<strong>${escapeHtml(d.label)}${yt ? ` (${yt})` : ""}</strong> — coef ${d.coef} · note ${fmt(d.note)}/20 → ` +
      `apporte <strong>${fmt(d.note * d.coef / TOTAL_COEF)}</strong> pts à la moyenne ` +
      `(${fmt1(d.coef / TOTAL_COEF * 100)} % du poids total).`;
  };
  donut.querySelectorAll("path").forEach((p) => {
    const id = p.getAttribute("data-id");
    p.addEventListener("mouseenter", () => showTip(id));
    p.addEventListener("focus", () => showTip(id));
    p.addEventListener("click", () => showTip(id));
  });
  donut.addEventListener("mouseleave", () => { tip.hidden = true; });
}

function renderLeverage() {
  const host = document.getElementById("leverageList");
  host.innerHTML = "";
  const variable = SUBJECTS.filter((s) => !getLocked(s.id));
  if (variable.length === 0) {
    host.innerHTML = `<li>Toutes tes notes sont figées 🔒. Libère-en une pour voir son impact.</li>`;
    return;
  }
  const sorted = [...variable].sort((a, b) => b.coef - a.coef);
  const maxDelta = sorted[0].coef / TOTAL_COEF;
  for (const s of sorted) {
    const delta = s.coef / TOTAL_COEF; // effet de +1 pt sur la moyenne
    const yt = yearTag(s.id);
    const li = document.createElement("li");
    li.innerHTML =
      `<span>${escapeHtml(getLabel(s))}${yt ? ` <span class="lv-when">${yt}</span>` : ""}</span>` +
      `<span class="lv-bar"><span style="width:${(delta / maxDelta) * 100}%"></span></span>` +
      `<span class="lv-delta">+${fmt(delta)}</span>`;
    host.appendChild(li);
  }
}

function renderObjectif(m) {
  const T = parseFloat(document.getElementById("targetSelect").value);
  const el = document.getElementById("objResult");

  let lockedPts = 0, varCoef = 0;
  for (const s of SUBJECTS) {
    if (getLocked(s.id)) lockedPts += getNote(s.id) * s.coef;
    else varCoef += s.coef;
  }

  const reach = (cls, txt) => { el.className = "obj-result " + cls; el.innerHTML = txt; };

  if (varCoef === 0) {
    reach(m >= T ? "ok" : "no",
      `Toutes tes notes sont figées. Moyenne = <strong>${fmt(m)}/20</strong> → ` +
      (m >= T ? "objectif atteint ✅" : "objectif non atteint ❌"));
    return;
  }

  const required = (T * TOTAL_COEF - lockedPts) / varCoef;
  if (required <= 0) {
    reach("ok", `🎉 C'est déjà dans la poche : même avec <strong>0/20</strong> sur tes notes variables, tu atteins <strong>${T}/20</strong>.`);
  } else if (required > 20) {
    reach("no", `❌ Hors de portée : il faudrait <strong>${fmt(required)}/20</strong> de moyenne sur tes notes variables (le maximum est 20).`);
  } else {
    const cls = required <= 12 ? "ok" : required <= 16 ? "hard" : "no";
    const mood = required <= 12 ? "👍 jouable" : required <= 16 ? "💪 exigeant" : "🔥 très ambitieux";
    reach(cls,
      `Pour viser <strong>${T}/20</strong>, il te faut en moyenne <strong>${fmt(required)}/20</strong> ` +
      `sur tes notes variables (coef ${varCoef}). ${mood}.`);
  }
}

/* -------------------- SVG arc helper -------------------- */

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

function yearTag(id) {
  return /_1$/.test(id) ? "1re" : /_2$/.test(id) ? "Tle" : "";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* -------------------- Câblage des contrôles globaux -------------------- */

function setMode(mode) {
  state.mode = mode;
  document.getElementById("modeCoef").classList.toggle("active", mode === "coef");
  document.getElementById("modeContrib").classList.toggle("active", mode === "contrib");
  document.getElementById("modeCoef").setAttribute("aria-selected", String(mode === "coef"));
  document.getElementById("modeContrib").setAttribute("aria-selected", String(mode === "contrib"));
  save();
  renderDonut(average());
}

function wireGlobal() {
  document.querySelectorAll("[data-scenario]").forEach((b) =>
    b.addEventListener("click", () => applyScenario(b.getAttribute("data-scenario"))));

  document.getElementById("modeCoef").addEventListener("click", () => setMode("coef"));
  document.getElementById("modeContrib").addEventListener("click", () => setMode("contrib"));
  document.getElementById("targetSelect").addEventListener("change", () => renderObjectif(average()));

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
  // Garde-fou : la base doit faire 100 et le total 104 (cohérence des coefficients).
  console.assert(TOTAL_COEF === 104, "Total des coefficients attendu : 104, obtenu :", TOTAL_COEF);
  loadState();
  if (state.mode !== "contrib") state.mode = "coef";
  buildControls();
  wireGlobal();
  setMode(state.mode);
  update();
}

document.addEventListener("DOMContentLoaded", init);
