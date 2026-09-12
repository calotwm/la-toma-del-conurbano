// ============================================================
// SERVER — Express (sirve la SPA build) + Socket.IO (salas online)
// Un solo proceso Node: mismo deploy de siempre en Railway, ahora
// con soporte de multijugador online por código de sala.
// ============================================================
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomStore, roomSummary } from './rooms.js';
import {
  startGame, broadcastState, maybeRunBots,
  handleReinforcePlace, handleReinforceAuto, handleAttack,
  handleToFortify, handleFortify, handleEndTurn, handleTradeCards,
} from './gameServer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;

const app = express();
const httpServer = createServer(app);
// Sin cors abierto: este mismo server sirve la SPA (mismo origen) y en dev el proxy de
// Vite hace que el navegador solo vea localhost:5173 — nunca hace falta cross-origin real.
// origin:'*' dejaba que cualquier sitio de internet abriera un socket contra las salas.
const io = new Server(httpServer);
const store = new RoomStore();

app.get('/healthz', (req, res) => res.json({ ok: true, rooms: store.rooms.size }));

// en producción, este mismo server sirve el build de Vite (dist/)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get(/^(?!\/socket\.io).*/, (req, res) => res.sendFile(path.join(distDir, 'index.html')));

function emitRoomUpdate(room) {
  if (!room) return;
  io.to(room.code).emit('room:update', roomSummary(room));
}
function emitRoomError(socket, msg) { socket.emit('room:error', msg); }

io.on('connection', (socket) => {
  socket.on('room:create', ({ name } = {}, ack) => {
    const room = store.create(socket.id, name);
    socket.join(room.code);
    if (typeof ack === 'function') ack({ ok: true, code: room.code, room: roomSummary(room) });
    socket.emit('chat:history', { chat: room.chat });
  });

  socket.on('room:join', ({ code, name } = {}, ack) => {
    const res = store.join(code, socket.id, name);
    if (res.error) { if (typeof ack === 'function') ack({ ok: false, error: res.error }); return; }
    socket.join(res.room.code);
    if (typeof ack === 'function') ack({ ok: true, code: res.room.code, room: roomSummary(res.room) });
    socket.emit('chat:history', { chat: res.room.chat });
    if (res.reconnected && res.room.state) {
      const slot = res.room.slots.find(s => s.socketId === socket.id);
      socket.emit('game:start', { state: res.room.state, youAre: slot ? slot.id : null });
    } else {
      emitRoomUpdate(res.room);
    }
  });

  socket.on('room:addBot', ({ code, name, level } = {}) => {
    const room = store.get(code);
    if (!room || room.hostSocketId !== socket.id) return;
    const updated = store.addBot(code, name, level);
    emitRoomUpdate(updated);
  });

  socket.on('room:removeBot', ({ code, idx } = {}) => {
    const room = store.get(code);
    if (!room || room.hostSocketId !== socket.id) return;
    const updated = store.removeBot(code, idx);
    emitRoomUpdate(updated);
  });

  socket.on('room:start', ({ code } = {}) => {
    const room = store.get(code);
    if (!room || room.hostSocketId !== socket.id || room.status !== 'lobby') return;
    if (room.slots.length + room.bots.length < 2) { emitRoomError(socket, 'Necesitás al menos 2 jugadores (contando bots).'); return; }
    startGame(io, store, room);
  });

  socket.on('room:leave', ({ code } = {}) => {
    socket.leave(code);
    const res = store.leave(socket.id);
    if (res && res.room) emitRoomUpdate(res.room);
  });

  socket.on('game:reinforcePlace', ({ code, terrId } = {}) => { const r = store.get(code); if (r) handleReinforcePlace(io, r, socket.id, terrId); });
  socket.on('game:reinforceAuto', ({ code } = {}) => { const r = store.get(code); if (r) handleReinforceAuto(io, r, socket.id); });
  socket.on('game:reinforceSkip', ({ code } = {}) => { const r = store.get(code); if (r) handleReinforceAuto(io, r, socket.id, { skip: true }); });
  socket.on('game:attack', ({ code, o, t, diceN } = {}) => { const r = store.get(code); if (r) handleAttack(io, store, r, socket.id, { o, t, diceN }); });
  socket.on('game:toFortify', ({ code } = {}) => { const r = store.get(code); if (r) handleToFortify(io, r, socket.id); });
  socket.on('game:fortify', ({ code, o, t, amt } = {}) => { const r = store.get(code); if (r) handleFortify(io, r, socket.id, { o, t, amt }); });
  socket.on('game:endTurn', ({ code } = {}) => { const r = store.get(code); if (r) handleEndTurn(io, store, r, socket.id); });
  socket.on('game:tradeCards', ({ code, indices } = {}) => { const r = store.get(code); if (r) handleTradeCards(io, r, socket.id, { indices }); });

  // chat "foro" por zona (Capital/Norte/Oeste/Sur): sin canal global, cada uno elige dónde hablar
  socket.on('chat:send', ({ code, zone, text } = {}) => {
    const msg = store.addChat(code, socket.id, zone, text);
    if (msg) io.to(String(code || '').toUpperCase()).emit('chat:new', { message: msg });
  });
  // pide el historial de nuevo (al entrar a la pantalla de juego, o tras reconectar)
  socket.on('chat:sync', ({ code } = {}) => {
    const r = store.get(code);
    if (r) socket.emit('chat:history', { chat: r.chat });
  });

  socket.on('disconnect', () => {
    const res = store.leave(socket.id);
    if (res && res.room) emitRoomUpdate(res.room);
  });
});

setInterval(() => store.sweep(), 5 * 60 * 1000);

httpServer.listen(PORT, () => console.log(`[server] La Toma del Conurbano escuchando en :${PORT}`));
