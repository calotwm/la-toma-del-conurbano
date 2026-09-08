// ============================================================
// GAME SERVER — el motor de turnos corriendo del lado del server
// (autoridad de partida online). Reutiliza engine.js tal cual se
// usa en el cliente para modo local/bots; acá server-authoritative:
// el server tira los dados, aplica el resultado y les manda a
// todos los sockets de la sala el estado nuevo.
// ============================================================
import {
  createGame, advanceTurn, aiPlacementPlan, aiPickAttack, aiFortifyPlan,
  canAttack, rollDice, battleResult, applyConquest, clone, log,
  ownersCount, tName, playerName, MISSION_DEFS, tradeValue,
} from '../src/engine.js';
import { TIDS, PHRASES, pick, PLAYER_COLORS } from '../src/data.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const BATTLE_PAUSE_MS = 3100; // ritmo visual: igual al spin+hold de los dados en el cliente

// una corrida de turnos de bot por sala a la vez (guardia contra doble loop)
const running = new Set();

export function startGame(io, store, room) {
  const players = room.slots.map(s => ({ name: s.name, human: true, color: null }))
    .concat(room.bots.map(b => ({ name: b.name, human: false, level: b.level, color: null })));
  // colores en el mismo orden de PLAYER_COLORS, como hace Setup.jsx
  players.forEach((p, i) => { p.color = PLAYER_COLORS[i % PLAYER_COLORS.length]; });

  const s = createGame({ players, missionsOn: true });
  room.state = s;
  room.status = 'playing';

  // asignar cada slot humano a su playerId real (mismo orden en que se armaron los players)
  room.slots.forEach((slot, i) => { slot.id = s.players[i].id; });

  broadcastStart(io, room);
  maybeRunBots(io, store, room);
}

function broadcastStart(io, room) {
  room.slots.forEach(slot => {
    io.to(slot.socketId).emit('game:start', { state: room.state, youAre: slot.id });
  });
}

export function broadcastState(io, room) {
  if (!room.state) return;
  io.to(room.code).emit('game:state', room.state);
}

function curPlayer(s) { return s.players.find(p => p.id === s.order[s.tidx]); }

// ---------- resolución de batalla (compartida humano/bot) ----------
function resolveBattle(io, room, pid, o, t, diceN) {
  const s = room.state;
  if (!canAttack(s, pid, o, t, diceN)) return false;
  const dN = Math.min(3, s.terr[t].troops);
  const aRoll = rollDice(diceN), dRoll = rollDice(dN);
  const { al, dl } = battleResult(aRoll, dRoll);
  const prevOwner = s.terr[t].owner;
  s.terr[o].troops -= al;
  s.terr[t].troops -= dl;
  const conquered = s.terr[t].troops <= 0;
  const isCap = t === 'capital';
  let capC = false;

  if (conquered) {
    capC = applyConquest(s, pid, o, t, diceN, al, dl);
    s.stat[pid].bw++;
  } else {
    s.stat[pid].bl++;
    if (isCap) log(s, `» ${pick(PHRASES.capDefense)} — La Capital aguanta el ataque de ${playerName(s, pid)}.`, 'capital');
    else log(s, `» ${playerName(s, pid)} pierde ${al} en ${tName(o)} contra ${tName(t)}. ${pick(PHRASES.battleLose)}`, 'lose');
  }

  io.to(room.code).emit('game:battle', {
    pid, o, t, aN: diceN, dN, aRoll, dRoll, al, dl, conquered, capital: isCap, capitalConquered: capC, prevOwner,
  });
  broadcastState(io, room);
  return true;
}

// ---------- loop de turnos de bots ----------
async function maybeRunBots(io, store, room) {
  if (running.has(room.code)) return;
  const s = room.state;
  if (!s || s.winner) return;
  const cp = curPlayer(s);
  if (!cp || cp.human) return; // le toca a un humano: no hacemos nada, esperamos su acción

  running.add(room.code);
  try {
    await wait(700);
    let atkCount = 0;
    while (true) {
      // si la sala se destruyó o cambió de estado en el medio, cortamos
      if (!store.get(room.code) || room.state !== s) break;
      if (s.winner) break;
      const cur = curPlayer(s);
      if (!cur || cur.human) break;

      if (s.phase === 'reinforce') {
        if (s.pool > 0) {
          const plan = aiPlacementPlan(s, cur.id);
          plan.forEach(id => { s.terr[id].troops++; s.pool--; });
          broadcastState(io, room);
          await wait(500);
        } else {
          s.phase = 'attack';
          broadcastState(io, room);
          await wait(300);
        }
        continue;
      }
      if (s.phase === 'attack') {
        if (atkCount >= 8) { s.phase = 'fortify'; broadcastState(io, room); await wait(300); continue; }
        const m = aiPickAttack(s, cur.id);
        if (!m) { s.phase = 'fortify'; broadcastState(io, room); await wait(300); continue; }
        atkCount++;
        const ot = s.terr[m.o].troops;
        const aN = m.isCap ? Math.min(3, Math.max(2, ot - 1)) : Math.min(3, ot - 1);
        if (aN < 1 || (m.isCap && (ot < 3 || aN < 2))) continue;
        resolveBattle(io, room, cur.id, m.o, m.t, aN);
        await wait(BATTLE_PAUSE_MS);
        continue;
      }
      if (s.phase === 'fortify') {
        const f = aiFortifyPlan(s, cur.id);
        if (f) {
          const mv = Math.min(f.move, s.terr[f.o].troops - 1);
          if (mv > 0) {
            s.terr[f.o].troops -= mv; s.terr[f.t].troops += mv;
            log(s, `» ${playerName(s, cur.id)} reagrupa ${mv} tropa(s) de ${tName(f.o)} a ${tName(f.t)}.`, 'sys');
          }
          broadcastState(io, room);
          await wait(550);
        } else {
          await wait(300);
        }
        advanceTurn(s);
        broadcastState(io, room);
        break;
      }
      break;
    }
  } finally {
    running.delete(room.code);
    // si después de todo esto le sigue tocando a otro bot (turno salteado por eliminación, etc), seguimos
    const s2 = room.state;
    if (s2 && !s2.winner) { const cp2 = curPlayer(s2); if (cp2 && !cp2.human) maybeRunBots(io, store, room); }
  }
}

// ---------- acciones de un jugador humano ----------
function playerForSocket(room, socketId) {
  const slot = room.slots.find(x => x.socketId === socketId);
  return slot ? slot.id : null;
}

function isMyTurn(room, pid) {
  const s = room.state;
  if (!s || s.winner) return false;
  const cp = curPlayer(s);
  return !!cp && cp.human && cp.id === pid;
}

export function handleReinforcePlace(io, room, socketId, terrId) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  if (s.phase !== 'reinforce' || s.terr[terrId].owner !== pid || s.pool <= 0) return;
  s.terr[terrId].troops++; s.pool--;
  if (s.pool <= 0) { s.phase = 'attack'; log(s, '» Refuerzos listos. ¡A atacar!', 'sys'); }
  broadcastState(io, room);
}

export function handleTradeCards(io, room, socketId, { indices } = {}) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  if (s.phase !== 'reinforce') return;
  const p = s.players.find(x => x.id === pid);
  const idx = Array.isArray(indices) ? [...new Set(indices)].filter(i => Number.isInteger(i) && i >= 0 && i < p.hand.length) : [];
  if (idx.length < 3 || idx.length > 5) return;
  const cards = idx.map(i => p.hand[i]);
  const v = tradeValue(s, pid, cards);
  if (v <= 0) return;
  idx.slice().sort((a, b) => b - a).forEach(i => p.hand.splice(i, 1));
  p.trades = (p.trades || 0) + 1;
  s.pool += v;
  log(s, `» ${p.name} canjea ${cards.length} naipes por +${v}. ${pick(PHRASES.trade)}`, 'card');
  broadcastState(io, room);
}

export function handleReinforceAuto(io, room, socketId, { skip } = {}) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  if (s.phase !== 'reinforce') return;
  const own = TIDS.filter(t => s.terr[t].owner === pid);
  let g = 0;
  while (s.pool > 0 && own.length && g++ < 500) { const t = own[Math.floor(Math.random() * own.length)]; s.terr[t].troops++; s.pool--; }
  s.phase = 'attack';
  log(s, skip ? '» ¡A atacar!' : '» Reparto automático listo. ¡A atacar!', 'sys');
  broadcastState(io, room);
}

export function handleAttack(io, store, room, socketId, { o, t, diceN }) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  if (s.phase !== 'attack') return;
  const ot = s.terr[o] ? s.terr[o].troops : 0;
  let aN = Math.min(diceN || 1, ot - 1);
  if (t === 'capital') aN = Math.max(2, Math.min(3, aN));
  if (!resolveBattle(io, room, pid, o, t, aN)) return;
  // si conquistó y ganó la partida, no hace falta más; si no, sigue en su turno
}

export function handleToFortify(io, room, socketId) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  if (s.phase !== 'attack') return;
  s.phase = 'fortify';
  broadcastState(io, room);
}

export function handleFortify(io, room, socketId, { o, t, amt }) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  if (s.phase !== 'fortify') return;
  if (s.terr[o].owner !== pid || s.terr[t].owner !== pid) return;
  const mv = Math.min(amt || 1, s.terr[o].troops - 1);
  if (mv > 0) {
    s.terr[o].troops -= mv; s.terr[t].troops += mv;
    s.turnFlags.moved = true;
    log(s, `» ${playerName(s, pid)} reagrupa ${mv} tropa(s): ${tName(o)} → ${tName(t)}`, 'sys');
    broadcastState(io, room);
  }
}

export function handleEndTurn(io, store, room, socketId) {
  const pid = playerForSocket(room, socketId);
  if (!pid || !isMyTurn(room, pid)) return;
  const s = room.state;
  advanceTurn(s);
  broadcastState(io, room);
  maybeRunBots(io, store, room);
}

export { maybeRunBots };
