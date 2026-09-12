// ============================================================
// NET — conexión Socket.IO al server de salas online (lazy: solo
// se conecta cuando entrás al modo online, no en modo bots/local).
// ============================================================
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io({ autoConnect: true, transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function createRoom(name) {
  return new Promise((resolve, reject) => {
    getSocket().emit('room:create', { name }, (res) => {
      if (res && res.ok) resolve(res); else reject(new Error((res && res.error) || 'No se pudo crear la sala.'));
    });
  });
}

export function joinRoom(code, name) {
  return new Promise((resolve, reject) => {
    getSocket().emit('room:join', { code, name }, (res) => {
      if (res && res.ok) resolve(res); else reject(new Error((res && res.error) || 'No se pudo unir a la sala.'));
    });
  });
}

export function sendChat(code, text) {
  getSocket().emit('chat:send', { code, text });
}

export function syncChat(code) {
  getSocket().emit('chat:sync', { code });
}

export function sendGlobalChat(zone, text) {
  getSocket().emit('chat:sendGlobal', { zone, text });
}

export function syncGlobalChat() {
  getSocket().emit('chat:syncGlobal');
}
