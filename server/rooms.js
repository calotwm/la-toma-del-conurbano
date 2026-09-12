// ============================================================
// ROOMS — salas en memoria (sin base de datos: alcanza y sobra
// para jugar entre amigos; si el server reinicia, se pierden).
// ============================================================
import { PLAYER_COLORS } from '../src/data.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para no confundir
const MAX_PLAYERS = 6;
const ROOM_TTL_MS = 6 * 60 * 60 * 1000; // 6hs sin actividad -> se limpia sola
const CHAT_ZONES = ['capital', 'norte', 'oeste', 'sur'];
const CHAT_HISTORY_MAX = 200;

function genCode() {
  let c = '';
  for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}

export class RoomStore {
  constructor() { this.rooms = new Map(); }

  get(code) { return this.rooms.get(String(code || '').toUpperCase()); }

  create(socketId, name) {
    let code;
    do { code = genCode(); } while (this.rooms.has(code));
    const room = {
      code,
      hostSocketId: socketId,
      status: 'lobby', // 'lobby' | 'playing'
      slots: [{ socketId, name: cleanName(name), human: true, connected: true, id: null }],
      bots: [], // { name, level }
      state: null, // estado del motor (engine.js) una vez arrancada
      // chat: un solo feed compartido por sala — cada uno elige su zona como identidad/bandera,
      // no como canal separado (todos leen y escriben en el mismo lugar)
      chat: [],
      createdAt: Date.now(), lastActivity: Date.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  join(code, socketId, name) {
    const room = this.get(code);
    if (!room) return { error: 'No existe esa sala. Fijate el código.' };
    room.lastActivity = Date.now();

    // reconexión: mismo nombre ya jugando, se reengancha con el socket nuevo
    if (room.status === 'playing') {
      const slot = room.slots.find(s => s.name.toLowerCase() === cleanName(name).toLowerCase());
      if (slot) { slot.socketId = socketId; slot.connected = true; return { room, reconnected: true }; }
      return { error: 'La partida ya arrancó y no había nadie con ese nombre para reengancharse.' };
    }

    if (room.slots.length + room.bots.length >= MAX_PLAYERS) return { error: 'La sala está llena (máximo 6).' };
    const nm = cleanName(name);
    if (room.slots.some(s => s.connected && s.name.toLowerCase() === nm.toLowerCase())) {
      return { error: 'Ya hay alguien con ese nombre en la sala.' };
    }
    room.slots.push({ socketId, name: nm, human: true, connected: true, id: null });
    return { room };
  }

  bySocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.slots.some(s => s.socketId === socketId)) return room;
    }
    return null;
  }

  leave(socketId) {
    const room = this.bySocket(socketId);
    if (!room) return null;
    if (room.status === 'lobby') {
      room.slots = room.slots.filter(s => s.socketId !== socketId);
      if (!room.slots.length) { this.rooms.delete(room.code); return { room: null, destroyed: true }; }
      if (room.hostSocketId === socketId) room.hostSocketId = room.slots[0].socketId;
      return { room };
    }
    // en partida: no lo sacamos, solo lo marcamos desconectado (puede reengancharse con el código)
    const slot = room.slots.find(s => s.socketId === socketId);
    if (slot) slot.connected = false;
    return { room };
  }

  addChat(code, socketId, zone, text) {
    const room = this.get(code);
    if (!room) return null;
    const slot = room.slots.find(s => s.socketId === socketId);
    if (!slot) return null;
    const t = String(text || '').trim().slice(0, 300);
    if (!t) return null;
    room.lastActivity = Date.now();
    const msg = { by: socketId, name: slot.name, zone: CHAT_ZONES.includes(zone) ? zone : null, text: t, ts: Date.now() };
    room.chat.push(msg);
    if (room.chat.length > CHAT_HISTORY_MAX) room.chat.splice(0, room.chat.length - CHAT_HISTORY_MAX);
    return msg;
  }

  addBot(code, name, level) {
    const room = this.get(code);
    if (!room || room.status !== 'lobby') return null;
    if (room.slots.length + room.bots.length >= MAX_PLAYERS) return null;
    room.bots.push({ name, level });
    return room;
  }
  removeBot(code, idx) {
    const room = this.get(code);
    if (!room || room.status !== 'lobby') return null;
    room.bots.splice(idx, 1);
    return room;
  }

  // limpieza periódica de salas abandonadas
  sweep() {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      const dead = room.status === 'lobby'
        ? room.slots.every(s => !s.connected) || now - room.lastActivity > ROOM_TTL_MS
        : (room.slots.every(s => !s.connected) && now - room.lastActivity > 10 * 60 * 1000) || now - room.lastActivity > ROOM_TTL_MS;
      if (dead) this.rooms.delete(code);
    }
  }
}

function cleanName(n) {
  const s = String(n || '').trim().slice(0, 18);
  return s || 'Jugador';
}

export function roomSummary(room) {
  return {
    code: room.code,
    hostSocketId: room.hostSocketId,
    status: room.status,
    players: room.slots.map(s => ({ name: s.name, connected: s.connected, isHost: s.socketId === room.hostSocketId })),
    bots: room.bots,
    colors: PLAYER_COLORS,
  };
}
