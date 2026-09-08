// ============================================================
// ENGINE — reglas puras del juego + IA + eventos + persistencia
// ============================================================
import { TIDS, TERR, ADJ, ZONES, ZKEYS, MISSION_KEYS, PHRASES, pick, REP_TITLES } from './data.js';

export const clone = x => JSON.parse(JSON.stringify(x));
export const uid = () => Math.random().toString(36).slice(2, 10);

export const tName = id => (TERR.find(t => t.id === id) || { name: id }).name;

export const ownersCount = (s, p) => TIDS.filter(t => s.terr[t].owner === p).length;
export const ownedTerrs = (s, p) => TIDS.filter(t => s.terr[t].owner === p);

export function leaderId(s) {
  let best = null, bn = -1;
  s.players.forEach(p => { const n = ownersCount(s, p.id); if (n > bn) { bn = n; best = p.id; } });
  return best;
}
export function minPlayer(s) {
  let best = null, bn = 1e9;
  s.players.forEach(p => { const n = ownersCount(s, p.id); if (n < bn) { bn = n; best = p.id; } });
  return best;
}
export function randAlive(s) {
  const a = s.players.filter(p => ownersCount(s, p.id) > 0);
  return a.length ? a[Math.floor(Math.random() * a.length)].id : null;
}
export const playerName = (s, pid) => pid == null ? 'El Estado' : (s.players.find(p => p.id === pid) || { name: '?' }).name;
export const playerColor = (s, pid) => {
  if (pid == null) return '#7a8699';
  const p = s.players.find(p => p.id === pid);
  return p ? p.color : '#888888';
};
export function log(s, text, kind) {
  s.log.unshift({ t: Date.now(), text, kind: kind || 'sys' });
  if (s.log.length > 90) s.log.length = 90;
}
export function repTitleFor(terrCount, ownsCap) {
  let t = 'Punga';
  for (const r of REP_TITLES) if (terrCount >= r[0]) t = r[1];
  if (ownsCap && terrCount >= 12) t = 'Rey de la City';
  return t;
}

// ---------- Misiones (reglas TEG reales) ----------
function zoneOwned(s, p, k) { return ZONES[k].ids.every(t => s.terr[t].owner === p); }
function otherZones(s, p, excl) { return ZKEYS.filter(k => k !== excl && k !== 'capital').reduce((acc, k) => acc + ZONES[k].ids.filter(t => s.terr[t].owner === p).length, 0); }

export const MISSION_DEFS = {
  capital: { name: 'Dominar la Capital', desc: 'Tener La Capital y al menos 17 territorios del conurbano.', check: (s, p) => s.terr.capital.owner === p && ownersCount(s, p) >= 17 },
  norte:   { name: 'Conquistar el Norte', desc: 'Ocupar TODA la Zona Norte y 7 territorios de otras zonas.', check: (s, p) => zoneOwned(s, p, 'norte') && otherZones(s, p, 'norte') >= 7 },
  oeste:   { name: 'Conquistar el Oeste', desc: 'Ocupar TODA la Zona Oeste y 5 territorios de otras zonas.', check: (s, p) => zoneOwned(s, p, 'oeste') && otherZones(s, p, 'oeste') >= 5 },
  sur:     { name: 'Conquistar el Sur', desc: 'Ocupar TODA la Zona Sur y 6 territorios de otras zonas.', check: (s, p) => zoneOwned(s, p, 'sur') && otherZones(s, p, 'sur') >= 6 },
  eliminar:{ name: 'El Intocable', desc: 'Destruir por completo a un color rival.', check: (s, p) => s.players.some(o => o.id !== p && o.alive === false) },
  suroeste:{ name: 'Conquistar el Suroeste', desc: 'Ocupar La Matanza, San Justo, Flores y Ezeiza a la vez.', check: (s, p) => ['lamatanza','sanjusto','flores','ezeiza'].every(t => s.terr[t].owner === p) },
  contorno:{ name: 'Cercar la Capital', desc: 'Controlar todos los territorios que limitan con La Capital y 5 territorios más de cualquier zona.', check: (s, p) => ADJ['capital'].every(t => s.terr[t].owner === p) && ownersCount(s, p) >= ADJ['capital'].length + 5 },
  el10:    { name: 'El 10 del Sur', desc: 'Tener La Capital y 10 territorios de la Zona Sur.', check: (s, p) => s.terr.capital.owner === p && ZONES.sur.ids.filter(t => s.terr[t].owner === p).length >= 10 },
  triple:  { name: 'La Triple Corona', desc: 'Controlar 8 territorios de cada zona (Norte, Oeste y Sur).', check: (s, p) => ['norte','oeste','sur'].every(k => ZONES[k].ids.filter(t => s.terr[t].owner === p).length >= 8) },
};
// Objetivo común (TEG real): ocupar 30 de los 35 territorios
export const COMMON_GOAL = 30;

// ---------- Eventos del Informe Metropolitano ----------
export const EVENTS = [
  { h: 'Corte de ruta en la 197', f: 'Nadie pasa. Ni los ejércitos.', fx: (s) => { const lead = leaderId(s); if (lead != null) { const mine = ownedTerrs(s, lead).filter(t => s.terr[t].troops > 1); if (mine.length) { const t = pick(mine); s.terr[t].troops--; log(s, `» ${playerName(s, lead)} pierde 1 tropa en ${tName(t)} por el corte.`, 'lose'); } } } },
  { h: 'Cacerolazos en CABA', f: 'El ruido aturde hasta a los generales.', fx: (s) => { const o = s.terr.capital.owner; if (o != null && s.terr.capital.troops > 1) { s.terr.capital.troops--; log(s, `» Cacerolazo: ${playerName(s, o)} pierde 1 tropa en La Capital.`, 'lose'); } } },
  { h: 'Día de la milanesa con papas', f: 'Hay asado en todos los cuarteles.', fx: (s) => { const w = randAlive(s); if (w != null) { const ts = ownedTerrs(s, w); const t = ts.length ? pick(ts) : null; if (t) { s.terr[t].troops++; log(s, `» Asado general: ${playerName(s, w)} suma 1 tropa en ${tName(t)}.`, 'win'); } } } },
  { h: 'Paro de colectivos total', f: 'Nadie llega al frente de batalla.', fx: (s) => { const w = randAlive(s); if (w != null) { const ts = ownedTerrs(s, w).filter(t => s.terr[t].troops > 1); if (ts.length) { const t = pick(ts); s.terr[t].troops--; log(s, `» Paro: ${playerName(s, w)} pierde 1 tropa en ${tName(t)}.`, 'lose'); } } } },
  { h: 'Explota la venta en La Salada', f: 'La economía paralela financia todo.', fx: (s) => { const o = s.terr.lomas.owner; if (o != null) { s.terr.lomas.troops += 2; log(s, `» ${playerName(s, o)} factura en La Salada: +2 en Lomas de Zamora.`, 'win'); } else { log(s, '» La Salada explota en ventas... pero Lomas es neutral, el negocio se lo lleva el Estado.', 'sys'); } } },
  { h: 'Se arma la interna política', f: 'Todos se pelean por el presupuesto.', fx: (s) => log(s, 'Interna política: nadie gobierna, pero todos facturan. Sin efecto militar.', 'tv') },
  { h: 'El clima: tormenta en el conurbano', f: 'Barro para todos.', fx: (s) => log(s, 'Tormenta de la puta madre. Las tropas se resbalan pero siguen.', 'tv') },
  { h: 'Recital gratuito en la plaza', f: 'La cultura también conquista.', fx: (s) => log(s, 'Recital masivo: por unas horas nadie se mata, hay pogo.', 'tv') },
  { h: 'Falta el agua en los edificios', f: 'La crisis toca todas las puertas.', fx: (s) => log(s, 'Cortes de agua: el conurbano aguanta como siempre.', 'tv') },
  { h: 'Bono sorpresa para los menos favorecidos', f: 'La política redistribuye.', fx: (s) => { const poor = minPlayer(s); if (poor != null) { const ts = ownedTerrs(s, poor); if (ts.length) { const t = pick(ts); s.terr[t].troops++; log(s, `» Bono: ${playerName(s, poor)} suma 1 en ${tName(t)}.`, 'win'); } } } },
];

// ---------- Refuerzos ----------
function componentsOf(s, pid) {
  const owned = ownedTerrs(s, pid), seen = new Set(), comps = [];
  owned.forEach(st => {
    if (seen.has(st)) return;
    const q = [st], c = []; seen.add(st);
    while (q.length) {
      const x = q.shift(); c.push(x);
      ADJ[x].forEach(y => { if (s.terr[y].owner === pid && !seen.has(y)) { seen.add(y); q.push(y); } });
    }
    comps.push(c);
  });
  return comps;
}
export function reinforceInfo(s, pid) {
  const own = ownersCount(s, pid);
  // TEG real: 50% de los países ocupados (redondeado hacia abajo), mín 3
  let base = Math.floor(own / 2);
  if (own < 6) base = 3;
  const zones = ZKEYS.filter(k => ZONES[k].ids.every(t => s.terr[t].owner === pid)).length;
  const cap = (s.terr.capital.owner === pid) ? 1 : 0;
  let total = base + zones * 4 + cap * 10;
  if (total < 3) total = 3;
  return { total, own, base, zones, cap };
}

// ---------- Cartas ----------
export function drawCard(s) {
  const d = s.deck;
  const c = d[s.deckPos % s.deck.length];
  s.deckPos++;
  return { emblem: c };
}
export function buildDeck() {
  const arr = [];
  TIDS.forEach(id => arr.push(id));
  for (let i = 0; i < 6; i++) arr.push('quilmes');
  for (let i = 0; i < 6; i++) arr.push('bragado');
  for (let i = 0; i < 6; i++) arr.push('capital');
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
export const emblemName = emblem => emblem === 'capital' ? 'La Capital' : emblem === 'bragado' ? 'Bragado' : tName(emblem);
export function tradeValue(s, pid, cards) {
  const n = cards.length; if (n < 3) return 0;
  // TEG real: canje escalonado 1º=4, 2º=7, 3º=10, luego +5 por canje
  const p = s.players.find(x => x.id === pid);
  const t = (p && p.trades) || 0;
  let base = 4;
  if (t >= 1) base = 7;
  if (t >= 2) base = 10;
  if (t >= 3) base = 10 + (t - 2) * 5;
  let bonus = 0;
  cards.forEach(c => {
    const e = c.emblem;
    if (e === 'bragado') bonus += 2;
    else if (e === 'capital') { if (s.terr.capital.owner === pid) bonus += 2; }
    else if (s.terr[e] && s.terr[e].owner === pid) bonus += 2;
  });
  return base + bonus;
}

// ---------- Batallas ----------
export function rollDice(n) { return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6)); }
export function battleResult(atk, def) {
  const a = [...atk].sort((x, y) => y - x), d = [...def].sort((x, y) => y - x);
  let al = 0, dl = 0;
  for (let i = 0; i < Math.min(a.length, d.length); i++) { if (a[i] > d[i]) dl++; else al++; }
  return { al, dl, a, d };
}
export function canAttack(s, pid, o, t, diceN) {
  if (s.terr[o].owner !== pid) return false;
  if (s.terr[t].owner === pid) return false;
  if (!ADJ[o].includes(t)) return false;
  const ot = s.terr[o].troops;
  if (t === 'capital') return ot >= 3 && diceN >= 2 && diceN <= 3 && diceN <= ot - 1;
  return ot >= 2 && diceN >= 1 && diceN <= 3 && diceN <= ot - 1;
}

// ---------- Creación de partida ----------
export function createGame(meta) {
  const players = meta.players.map(m => ({ id: uid(), name: m.name, color: m.color, human: m.human, level: m.level || 'capo', mission: null, hand: [], trades: 0, alive: true }));
  const n = players.length;
  const mk = [...MISSION_KEYS];
  for (let i = mk.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mk[i], mk[j]] = [mk[j], mk[i]]; }
  players.forEach((p, i) => p.mission = mk[i % mk.length]);

  const pool = TIDS.filter(t => t !== 'capital');
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const terr = {};
  TIDS.forEach(id => { terr[id] = { owner: null, troops: id === 'capital' ? 8 : 0 }; });
  pool.forEach((id, i) => { terr[id].owner = players[i % n].id; terr[id].troops = 1; });
  players.forEach(p => {
    const mine = pool.filter(id => terr[id].owner === p.id);
    for (let k = 0; k < 4; k++) { const t = mine[Math.floor(Math.random() * mine.length)]; if (t) terr[t].troops++; }
  });
  const stat = {}; players.forEach(p => stat[p.id] = { conq: 0, capConq: 0, bw: 0, bl: 0 });
  const order = players.map(p => p.id);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }

  const s = {
    gid: uid(), screen: 'deal', missionsOn: meta.missionsOn !== false, meta,
    players, terr, deck: buildDeck(), deckPos: 0,
    order, tidx: 0, round: 1, phase: 'reinforce', pool: 0,
    turnFlags: { conquered: false, cardEarned: false, moved: false },
    busy: false, dice: null, stat, winner: null, winReason: '', log: [], eventFlash: 0,
  };
  log(s, '» ¡Arranca La Toma del Conurbano! Reparto territorial finalizado. La Capital es neutral y la vigila El Estado.', 'sys');
  players.forEach(p => log(s, p.human ? '· ' + p.name + ' (vos)' : '· ' + p.name + ' (bot ' + p.level + ')', 'sys'));
  startTurn(s, order[0]);
  return s;
}

export function alivePlayers(s) { return s.players.filter(p => ownersCount(s, p.id) > 0); }

export function startTurn(s, pid) {
  const p = s.players.find(x => x.id === pid);
  s.phase = 'reinforce';
  s.tidx = s.order.indexOf(pid);
  s.turnFlags = { conquered: false, cardEarned: false, moved: false };
  const info = reinforceInfo(s, pid);
  s.pool = info.total;
  if (!p.human) {
    while (p.hand.length >= 3) {
      const take = (p.hand.length >= 5) ? 5 : (p.hand.length >= 4) ? 4 : 3;
      const cards = p.hand.splice(0, take);
      const v = tradeValue(s, pid, cards);
      s.pool += v;
      log(s, `» ${p.name} canjea cartas y suma ${v} tropas.`, 'card');
    }
  }
  let bonusText = `50% de ${info.own} países = ${info.base}`;
  if (info.zones) bonusText += `, +${info.zones * 4} zonas`;
  if (info.cap) bonusText += ', +10 CABA';
  log(s, `» Turno de ${p.name}. Refuerzos: ${info.total} (${bonusText}).`, 'sys');
}

export function advanceTurn(s) {
  const n = s.order.length;
  for (let k = 1; k <= n; k++) {
    const idx = (s.tidx + k) % n;
    if (idx === 0) {
      s.round++;
      // La Capital (Estado) se fortalece progresivamente mientras avanzan las rondas
      if (s.terr.capital.owner == null) {
        const gain = 1 + Math.floor(s.round / 2);
        s.terr.capital.troops += gain;
        log(s, `🏛️ El Estado refuerza La Capital: +${gain} tropas (ahora ${s.terr.capital.troops}).`, 'capital');
      }
      applyEvent(s);
    }
    const pid = s.order[idx];
    if (ownersCount(s, pid) > 0) { startTurn(s, pid); return pid; }
  }
  return null;
}

export function applyEvent(s) {
  const ev = pick(EVENTS);
  log(s, `» INFORME METROPOLITANO — Ronda ${s.round}: ${ev.h}. ${ev.f}`, 'tv');
  ev.fx(s);
  s.eventFlash = (s.eventFlash || 0) + 1;
}

// ---------- Conquista ----------
export function applyConquest(s, pid, o, t, diceN, al, dl) {
  const prevOwner = s.terr[t].owner;
  const mover = t === 'capital' ? Math.max(diceN, 2) : diceN;
  s.terr[o].troops -= al + mover;
  s.terr[t].owner = pid;
  s.terr[t].troops = mover;
  s.stat[pid].conq++;
  s.turnFlags.conquered = true;
  const capConq = (t === 'capital');
  if (capConq) { s.stat[pid].capConq++; s.terr.capital.troops = Math.max(mover, 2); }
  if (!s.turnFlags.cardEarned && s.turnFlags.conquered) {
    s.turnFlags.cardEarned = true;
    const c = drawCard(s);
    s.players.find(p => p.id === pid).hand.push(c);
    log(s, `» ${playerName(s, pid)} gana una carta de conquista: ${emblemName(c.emblem)}.`, 'card');
  }
  if (capConq) {
    log(s, `★ ${playerName(s, pid)} CONQUISTA LA CAPITAL. ${prevOwner == null ? pick(PHRASES.capitalWin) : '¡' + pick(PHRASES.capitalLose) + ' — dice ' + playerName(s, prevOwner) + '!'}`, 'capital');
  } else {
    log(s, `» ${playerName(s, pid)} conquista ${tName(t)} (${pick(PHRASES.territoryWin)})`, 'win');
  }
  if (prevOwner != null && ownersCount(s, prevOwner) === 0) {
    const lost = s.players.find(p => p.id === prevOwner);
    if (lost) {
      lost.alive = false;
      if (lost.hand.length) { lost.hand.forEach(c => s.players.find(p => p.id === pid).hand.push(c)); lost.hand = []; }
      log(s, `» ${lost.name} quedó sin territorios: ELIMINADO. Sus cartas van para ${playerName(s, pid)}.`, 'lose');
    }
  }
  // Objetivo común (TEG real): ocupar 25 territorios
  if (!s.winner && ownersCount(s, pid) >= COMMON_GOAL) { s.winner = pid; s.winReason = 'common'; }
  if (s.missionsOn && !s.winner) {
    const mp = s.players.find(p => p.id === pid);
    if (mp && MISSION_DEFS[mp.mission] && MISSION_DEFS[mp.mission].check(s, pid)) {
      s.winner = pid; s.winReason = 'mission:' + mp.mission;
    }
  }
  if (!s.winner && alivePlayers(s).length <= 1) { s.winner = pid; s.winReason = 'map'; }
  return capConq;
}

// ---------- IA ----------
export function aiPlacementPlan(s, pid) {
  const p = s.players.find(x => x.id === pid);
  const pool = s.pool, terr = s.terr;
  const frontier = ownedTerrs(s, pid).filter(o => ADJ[o].some(t => terr[t].owner !== pid));
  const score = o => {
    let sc = terr[o].troops * 3 + ADJ[o].length;
    if (ADJ[o].includes('capital') && terr.capital.owner !== pid) sc += (p.level === 'capo' ? 14 : 6);
    if (terr.capital.owner === pid && ADJ[o].includes('capital')) sc += 8;
    if (p.mission === 'capital' && ADJ[o].includes('capital')) sc += 10;
    if (p.mission === 'oeste' && ZONES.oeste.ids.includes(o)) sc += 5;
    if (p.mission === 'sur' && ZONES.sur.ids.includes(o)) sc += 5;
    if (p.mission === 'norte' && ZONES.norte.ids.includes(o)) sc += 5;
    if (p.mission === 'suroeste' && ['lamatanza','sanjusto','flores','ezeiza'].includes(o)) sc += 6;
    if (p.mission === 'contorno' && ADJ[o].includes('capital')) sc += 6;
    if (p.mission === 'el10' && ZONES.sur.ids.includes(o)) sc += 5;
    if (p.mission === 'triple') sc += 2;
    if (p.level === 'defensa' && ADJ[o].some(t => terr[t].owner !== pid && terr[t].troops >= terr[o].troops)) sc += 5;
    return sc;
  };
  const cands = (frontier.length ? frontier : ownedTerrs(s, pid)).slice().sort((a, b) => score(b) - score(a));
  // Concentrar refuerzos en pocos frentes (como jugador real): ~60% en el mejor,
  // ~25% en el segundo, resto repartido. Evita dispersar tropas sin poder atacar.
  const plan = [];
  let left = pool;
  while (left > 0) {
    const top = cands[0] || ownedTerrs(s, pid)[0];
    const second = cands[1] || top;
    let t;
    const r = Math.random();
    if (r < 0.6) t = top;
    else if (r < 0.85) t = second;
    else t = cands[Math.floor(Math.random() * cands.length)] || top;
    plan.push(t); left--;
  }
  return plan;
}

export function aiPickAttack(s, pid) {
  const p = s.players.find(x => x.id === pid);
  const terr = s.terr;
  const moves = [];
  ownedTerrs(s, pid).forEach(o => {
    const ot = terr[o].troops;
    ADJ[o].forEach(t => {
      if (terr[t].owner === pid) return;
      const isCap = t === 'capital';
      const need = isCap ? 3 : 2;
      if (ot < need) return;
      const tt = terr[t].troops;
      const margin = (ot - 1) - tt;
      moves.push({ o, t, isCap, tt, margin, ot });
    });
  });
  if (!moves.length) return null;
  const lvl = p.level;
  if (lvl === 'chorro') {
    const legal = moves.filter(m => m.margin >= -2 || m.isCap);
    if (!legal.length) return null;
    if (Math.random() < 0.35) return null;
    return pick(legal);
  }
  const score = m => {
    let sc = m.margin * 3;
    if (m.isCap) sc += 18 + (m.tt <= 6 ? 12 : 0);
    if (p.mission === 'capital') sc += (m.isCap ? 12 : 0);
    if (p.mission === 'oeste' && ZONES.oeste.ids.includes(m.t)) sc += 4;
    if (p.mission === 'sur' && ZONES.sur.ids.includes(m.t)) sc += 4;
    if (p.mission === 'norte' && ZONES.norte.ids.includes(m.t)) sc += 4;
    if (p.mission === 'suroeste' && ['lamatanza','sanjusto','flores','ezeiza'].includes(m.t)) sc += 6;
    if (p.mission === 'contorno' && ADJ[m.t].includes('capital')) sc += 6;
    if (p.mission === 'el10' && ZONES.sur.ids.includes(m.t)) sc += 5;
    if (p.mission === 'triple') sc += 3;
    if (m.margin >= -1) sc += 2;
    if (m.ot >= 5) sc += 2;
    return sc;
  };
  moves.sort((a, b) => score(b) - score(a));
  const m = moves[0];
  if (lvl === 'defensa') {
    if (m.isCap && m.margin < 0) return null;
    if (!m.isCap && m.margin < 1) return null;
    return m;
  }
  if (m.margin < (m.isCap ? -3 : -2)) return null;
  return m;
}

export function aiFortifyPlan(s, pid) {
  const terr = s.terr;
  let best = null, bestSc = -1e9;
  ownedTerrs(s, pid).forEach(o => {
    const ot = terr[o].troops;
    if (ot < 2) return;
    ADJ[o].forEach(t => {
      if (terr[t].owner !== pid) return;
      const threat = ADJ[t].filter(x => terr[x].owner !== pid).length;
      const sc = threat * 6 + (ADJ[t].includes('capital') && terr.capital.owner !== pid ? 8 : 0) + Math.min(ot - 1, 4);
      if (bestSc < sc) { bestSc = sc; best = { o, t, move: Math.max(1, Math.min(ot - 1, Math.round((ot - 1) / 2))) }; }
    });
  });
  if (best && bestSc <= 0) return null;
  return best;
}

// ---------- Persistencia ----------
export const SAVE_KEY = 'lomaConurbanoUrquisoftSaveV1';
export function saveGame(s) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      gid: s.gid, screen: s.screen, missionsOn: s.missionsOn, meta: s.meta,
      players: s.players, terr: s.terr, deck: s.deck, deckPos: s.deckPos,
      order: s.order, tidx: s.tidx, round: s.round, phase: s.phase, pool: s.pool,
      turnFlags: s.turnFlags, stat: s.stat, winner: s.winner, winReason: s.winReason, log: s.log.slice(0, 60),
    }));
  } catch (e) { /* localStorage lleno/denegado: no crashear */ }
}
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    s.busy = false; s.dice = null; s.eventFlash = 0; s.gid = uid();
    return s;
  } catch (e) { return null; }
}
