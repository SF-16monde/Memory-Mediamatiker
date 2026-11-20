/* ===== Inhalt: Bilder & Texte ===== */
// Wichtig: Hier liegen alle Paare und ihre Texte.
// Jedes Objekt beschreibt eine Karte: Bild, Titel, kurze Beschreibung und Detailtext.
// In der Spiel-Logik werden daraus Match-Paare gebaut.
const BILDER_ORDNER = "bilder";
const PAIRS = [
  {id:"foto",title:"Fotografieren",image:`${BILDER_ORDNER}/paar-1.png`,alt:"Mediamatiker mit Fotoapparat",
   text:"Fotografieren",
   description:["Punkt 1: Fotos für verschiedene Zwecke aufnehmen","Punkt 2: Kamera, Licht und Bildkomposition richtig einsetzen","Punkt 3: Bilder auswählen und bearbeiten/optimieren"],
   details:"Das Fotografieren gehört in der Lehre zum Mediamatiker, weil Websites, Social Media und Printprodukte oft eigene Bilder brauchen. Dabei lernt man, auf Licht, Bildaufbau und Perspektive zu achten und die Fotos danach zu bearbeiten. So wirken die Inhalte persönlicher und passen besser zum Betrieb als austauschbare Stockbilder"},
  {id:"kommunikation",title:"Kommunikation",image:`${BILDER_ORDNER}/paar-2.png`,alt:"Mediamatiker in einem Onlinegespräch mit einem Kunden",
   text:"Kommunikation",
   description:["Punkt 1: Informationen verständlich und zielgruppengerecht vermitteln","Punkt 2: Präsentationen und Kommunikationsmittel erstellen","Punkt 3: Mit Kundinnen, Kunden und Mitarbeitenden kommunizieren"],
   details:"Kundenkontakt gehört in der Lehre zum Mediamatiker, weil man Projekte meistens für andere umsetzt und deren Wünsche genau verstehen muss. Dabei lernt man, Bedürfnisse zu erfragen, Ideen verständlich zu präsentieren und Lösungen freundlich und professionell zu erklären. Auch bei Rückmeldungen oder Änderungswünschen ist eine klare Kommunikation wichtig, damit am Ende das Ergebnis passt und die Kunden zufrieden sind."},
  {id:"some",title:"Social Media",image:`${BILDER_ORDNER}/paar-3.png`,alt:"Mediamatiker während des Videodrehs mit einem Gimball",
   text:"Social Media",
   description:["Punkt 1: Beiträge für Social-Media-Kanäle erstellen","Punkt 2: Texte, Bilder und Videos für die Zielgruppe aufbereiten","Punkt 3: Beiträge planen, veröffentlichen und deren Erfolg auswerten"],
   details:"Social Media gehört in der Lehre zum Mediamatiker, weil Betriebe heute über Plattformen wie Instagram, LinkedIn oder TikTok mit ihren Kunden in Kontakt bleiben. Dabei lernt man, Beiträge zu planen, passende Bilder, Videos und Texte zu erstellen und die Zielgruppe gezielt anzusprechen. Auch das Beantworten von Kommentaren und das Auswerten der Reichweite gehört dazu, damit die Inhalte besser ankommen."},
  {id:"design",title:"Printdesign",image:`${BILDER_ORDNER}/paar-4.png`,alt:"Mediamatiker erstellt ein Printprodukt",
   text:"Printdesign",
   description:["Punkt 1: Flyer, Plakate, Broschüren und andere Druckprodukte gestalten","Punkt 2: Texte, Bilder, Farben und Schriften passend kombinieren","Punkt 3: Dateien druckfertig aufbereiten"],
   details:"Beim Printdesign werden unterschiedliche Druckprodukte wie Flyer, Plakate oder Broschüren gestaltet. Dabei werden Texte, Bilder und Farben passend angeordnet und das fertige Design für den Druck vorbereitet."},
  {id:"web",title:"Webseitenbetreuung",image:`${BILDER_ORDNER}/paar-5.png`,alt:"Mediamatiker erstellt einen neuen, responsive Inhalt für die Webseite.",
   text:"Webseitenbetreuung",
   description:["Punkt 1: Inhalte wie Texte, Bilder und Downloads aktualisieren","Punkt 2: Webseiten über ein CMS pflegen und verwalten","Punkt 3: Darstellung, Links und Funktionen überprüfen"],
   details:"Bei der Webseitenbetreuung geht es darum, bestehende Webseiten zu pflegen, aktuell zu halten und weiterzuentwickeln. Dazu gehören das Aktualisieren von Texten und Bildern, das Erstellen neuer Inhalte sowie kleinere Anpassungen am Aufbau oder Design. Auch das Überprüfen der Webseite und das Beheben kleinerer Fehler gehören dazu."},
  {id:"code",title:"Programmieren",image:`${BILDER_ORDNER}/paar-6.png`,alt:"Mediamatiker erklärt seinen Code in VS Code.",
   text:"Programmieren",
   description:["Punkt 1: Grundlagen mit HTML, CSS und JavaScript anwenden","Punkt 2: Kleinere Funktionen und Anpassungen umsetzen","Punkt 3: Technische Zusammenhänge von Webseiten und Anwendungen verstehen"],
   details:"Programmieren bedeutet nicht nur, selbst Code zu schreiben. Wichtig ist vor allem ein grundlegendes Verständnis von HTML, CSS und JavaScript sowie der Umgang mit CMS-Systemen. So können Webseiten angepasst, Inhalte verwaltet und kleinere technische Probleme selbstständig gelöst werden."}
];
const PAIRS_BY_ID = Object.fromEntries(PAIRS.map(p => [p.id, p]));

/* ===== Spiellogik (wie im Original) ===== */
// Die Spiel-Logik verwaltet Karten, Treffer, Fehler und Punkte.
// Ein Treffer erhöht die Punktzahl; ein Fehler kostet Punkte und setzt den Streak zurück.
const POINTS_PER_PAIR = 100, MISS_PENALTY = -20;
const RESULTS_DELAY = 1200;
const pointsForStreak = s => Math.max(1, s) * POINTS_PER_PAIR;
const buildDeck = () => PAIRS.flatMap(p => [
  {id:`${p.id}-image`, pairId:p.id, kind:"image"},
  {id:`${p.id}-text`,  pairId:p.id, kind:"text"}]);
function shuffle(items){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
const createGame = cards => ({cards, flipped:[], matched:[], points:0, streak:0, bestStreak:0, moves:0, lastEvent:null});
const isWaiting  = s => s.flipped.length === 2;
const isFinished = s => s.cards.length > 0 && s.matched.length * 2 === s.cards.length;

function flip(s, index){
  const card = s.cards[index];
  if(!card || s.matched.includes(card.pairId)) return s;
  if(isWaiting(s)){
    if(s.flipped.includes(index)) return {...s, flipped:[], streak:0};
    s = {...s, flipped:[], streak:0};
  }
  if(s.flipped.includes(index)) return s;
  const flipped = [...s.flipped, index];
  if(flipped.length < 2) return {...s, flipped};
  const moves = s.moves + 1, seq = (s.lastEvent?.seq ?? 0) + 1;
  const first = s.cards[flipped[0]];
  if(first.pairId === card.pairId){
    const streak = s.streak + 1, delta = pointsForStreak(streak);
    return {...s, flipped:[], matched:[...s.matched, card.pairId], points:s.points+delta, streak, bestStreak:Math.max(s.bestStreak, streak), moves, lastEvent:{delta,streak,seq}};
  }
  return {...s, flipped, moves, streak:0, points:s.points+MISS_PENALTY, lastEvent:{delta:MISS_PENALTY,streak:0,seq}};
}
/* ===== Rangliste (Supabase REST) ===== */
// Diese Abschnitt lädt und speichert Ergebnisse in der Rangliste.
const SUPA_URL = "https://hlhhngaaoioidslrabrp.supabase.co";
const SUPA_KEY = "sb_publishable_XmsGBkePC-85sPWoHuLh3A_28J0FcIf";
const H = {apikey:SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}`, "Content-Type":"application/json"};
const TABLE = `${SUPA_URL}/rest/v1/leaderboard_scores`;
async function fetchTop(){
  const r = await fetch(`${TABLE}?select=id,name,score,moves,best_streak,created_at&order=score.desc,moves.asc,created_at.asc&limit=10`, {headers:H});
  if(!r.ok) throw new Error(r.status);
  return r.json();
}
async function submitScore(name, score, moves, bestStreak){
  const r = await fetch(`${TABLE}?select=id,name,score,moves,best_streak,created_at`, {
    method:"POST", headers:{...H, Prefer:"return=representation"}, body:JSON.stringify({name, score, moves, best_streak:bestStreak})});
  if(!r.ok) throw new Error(r.status);
  const entry = (await r.json())[0];
  const c = await fetch(`${TABLE}?select=id&score=gt.${score}`, {headers:{...H, Prefer:"count=exact", Range:"0-0"}});
  const total = parseInt((c.headers.get("content-range") || "").split("/")[1], 10);
  return {entry, rank:(isNaN(total) ? 0 : total) + 1};
}

/* ===== Oberfläche ===== */
// DOM-Helfer und Rendering-Funktionen.
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FLAME = '<svg viewBox="0 0 24 24"><path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 7 13c0-2 1-3.5 2-4.5.3 1.5 1 2.2 1.8 2.5C10.5 8 10.5 5 12 2z"/></svg>';
let state, savedIds = [], timers = [];

function openMenu(){
  $("menu-overlay").classList.remove("hidden");
  $("shuffle").setAttribute("aria-expanded", "true");
}

function closeMenu(){
  $("menu-overlay").classList.add("hidden");
  $("shuffle").setAttribute("aria-expanded", "false");
}

function newGame(){
  // Spiel neu starten: Timer löschen, Karten mischen und Board neu rendern.
  timers.forEach(clearTimeout); timers = [];
  savedIds = [];
  state = createGame(shuffle(buildDeck()));
  $("results").classList.add("hidden");
  $("board-wrap").classList.remove("hidden");
  buildBoard(); update();
}

function buildBoard(){
  // Karten im Spielfeld bauen: Bildkarten und Textkarten erzeugen.
  const board = $("board"); board.innerHTML = "";
  state.cards.forEach((card, index) => {
    const pair = PAIRS_BY_ID[card.pairId];
    const b = document.createElement("button");
    b.type = "button"; b.className = "memory-card";
    b.dataset.kind = card.kind;
    b.setAttribute("aria-label", "Verdeckte Karte");
    b.innerHTML = `<div class="inner"><div class="face back"><span class="q">?</span></div><div class="face front">` +
      (card.kind === "image"
        ? `<img src="${esc(pair.image)}" alt="${esc(pair.alt)}">`
        : `<div class="txt"><small>Beschreibung</small><p>${esc(pair.text)}</p><ul class="txt-list">${(Array.isArray(pair.description) ? pair.description : [pair.description || "Platzhaltertext für die kurze Beschreibung."]).slice(0,3).map(item => `<li>${esc(item)}</li>`).join("")}</ul></div>`) + `</div></div>`;
    b.addEventListener("click", () => onFlip(index));
    board.appendChild(b);
  });
}

function onFlip(index){
  // Beim Klick eine Karte umdrehen und prüfen, ob ein Paar gefunden wurde.
  const next = flip(state, index);
  if(next === state) return;
  state = next; update();
  if(isFinished(state)){
    timers.push(setTimeout(showResults, RESULTS_DELAY));
  }
}

let lastSeq = 0;
function update(){
  // Spielstand und Kartenstatus aktualisieren.
  $("points").textContent = state.points;
  [...$("board").children].forEach((b, i) => {
    const card = state.cards[i], pair = PAIRS_BY_ID[card.pairId];
    const matched = state.matched.includes(card.pairId);
    const open = matched || state.flipped.includes(i);
    b.dataset.open = open; b.dataset.matched = matched; b.disabled = matched;
    b.setAttribute("aria-label", open ? (card.kind === "image" ? pair.alt : pair.text) : "Verdeckte Karte");
  });
  const ev = state.lastEvent;
  if(!ev){ lastSeq = 0; }
  else if(ev.seq !== lastSeq){
    lastSeq = ev.seq;
    document.querySelectorAll(".popup").forEach(p => p.remove());
    const plus = ev.delta > 0;
    const el = document.createElement("div");
    el.className = "popup"; el.setAttribute("role", "status");
    el.innerHTML = `<div><span class="num ${plus ? "plus" : "minus"}"><i>${plus ? "+" : "−"}</i>${Math.abs(ev.delta)}</span>` +
      (ev.streak >= 2 ? `<span class="streak">${FLAME} ${ev.streak} in Serie</span>` : "") + `</div>`;
    $("board-wrap").appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

function showResults(){
  // Am Ende alle Paare übersichtlich anzeigen und Rangliste laden.
  $("board-wrap").classList.add("hidden");
  $("results").classList.remove("hidden");
  $("summary").innerHTML = PAIRS.map((p, i) =>
    `<li class="pop-in" style="animation-delay:${i * 70}ms"><img src="${esc(p.image)}" alt="${esc(p.alt)}">` +
    `<div class="t"><h3>${esc(p.title)}</h3><p>${esc(p.details)}</p></div></li>`).join("");
  $("res-points").textContent = `${state.points} Punkte!`;
  $("res-best-streak").textContent = state.bestStreak;
  $("res-moves").textContent = `Alle Paare gefunden in ${state.moves} Zügen.`;
  renderSave(); loadTop();
}

function renderSave(){
  // Formular für den Spielername und das Speichern der Punktzahl.
  const box = $("save");
  box.innerHTML = `<div class="row"><span>Deine Punkte</span><b>${state.points}<small>Punkte</small></b></div>` +
    `<form><input maxlength="24" placeholder="Dein Name" aria-label="Name"><button class="btn btn-primary" type="submit">Eintragen</button></form><p class="err hidden"></p>`;
  const form = box.querySelector("form"), input = box.querySelector("input"), err = box.querySelector(".err"), btn = box.querySelector("button");
  try { input.value = localStorage.getItem("memory-player-name") || ""; } catch(e) {}
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = input.value.trim();
    if(!name){ err.textContent = "Bitte gib einen Namen ein."; err.classList.remove("hidden"); return; }
    if(name.length > 24){ err.textContent = "Höchstens 24 Zeichen."; err.classList.remove("hidden"); return; }
    err.classList.add("hidden"); btn.disabled = true; btn.textContent = "…";
    try {
      const {entry, rank} = await submitScore(name, state.points, state.moves, state.bestStreak);
      try { localStorage.setItem("memory-player-name", entry.name); } catch(e) {}
      savedIds.push(entry.id);
      form.remove();
      const ok = document.createElement("p"); ok.className = "ok";
      ok.textContent = `✓ Gespeichert als «${entry.name}» – Platz ${rank}`;
      box.appendChild(ok);
      loadTop();
    } catch(e2) {
      btn.disabled = false; btn.textContent = "Eintragen";
      err.textContent = "Speichern hat nicht geklappt. Bitte nochmals versuchen."; err.classList.remove("hidden");
    }
  });
}

async function loadTop(){
  // Rangliste auslesen und anzeigen.
  const box = $("top");
  box.innerHTML = '<p class="info">Lädt …</p>';
  try {
    const data = await fetchTop();
    if(!data.length){ box.innerHTML = '<p class="info">Noch keine Einträge – sei die oder der Erste!</p>'; return; }
    box.innerHTML = "<ol>" + data.map((e, i) => {
      const mine = savedIds.includes(e.id);
      return `<li class="${mine ? "mine" : i % 2 === 0 ? "alt" : ""}"><span class="rk">${i === 0 ? "👑" : (i + 1) + "."}</span>` +
        `<span class="nm">${esc(e.name)}</span><span class="mv">${e.moves} Züge</span><span class="sc">${e.score}</span><span class="st">🔥 ${e.best_streak}</span></li>`;
    }).join("") + "</ol>";
  } catch(e) {
    box.innerHTML = '<p class="info">Die Rangliste konnte nicht geladen werden.</p>';
  }
}

$("shuffle").addEventListener("click", openMenu);
$("menu-close").addEventListener("click", closeMenu);
$("menu-restart").addEventListener("click", () => {
  closeMenu();
  newGame();
});
$("menu-exit").addEventListener("click", closeMenu);
$("again").addEventListener("click", newGame);
$("start-game").addEventListener("click", () => $("intro-overlay").classList.add("hidden"));
newGame();
