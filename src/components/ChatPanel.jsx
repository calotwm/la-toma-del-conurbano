import { useEffect, useRef, useState } from 'react';
import { getSocket, sendChat } from '../net.js';

// Chat "foro": no hay canal global — cada zona del mapa (Capital/Norte/Oeste/Sur)
// tiene su propia charla, y cada uno elige a cuál sumarse.
// El estado de los mensajes vive en OnlineGame (siempre montado durante la partida)
// para no perder nada que llegue mientras esta pestaña no está abierta; acá solo se
// muestra y se manda.
const ZONES = [
  { key: 'capital', label: 'Capital', color: 'var(--gold)' },
  { key: 'norte', label: 'Norte', color: '#ec4899' },
  { key: 'oeste', label: 'Oeste', color: '#f97316' },
  { key: 'sur', label: 'Sur', color: '#22c55e' },
];

export default function ChatPanel({ code, chat }) {
  const [zone, setZone] = useState('capital');
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const myId = getSocket().id;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chat, zone]);

  function send() {
    const t = text.trim();
    if (!t) return;
    sendChat(code, zone, t);
    setText('');
  }

  const msgs = (chat && chat[zone]) || [];
  const curZone = ZONES.find(z => z.key === zone);

  return (
    <div className="chat-panel">
      <div className="chat-tabs">
        {ZONES.map(z => (
          <button key={z.key} className={'chat-tab' + (zone === z.key ? ' on' : '')}
            style={{ '--zc': z.color }} onClick={() => setZone(z.key)}>
            {z.label}
          </button>
        ))}
      </div>
      <div className="chat-list" ref={listRef}>
        {msgs.length === 0 && <div className="chat-empty">Nadie escribió nada en Zona {curZone?.label} todavía. Rompé el hielo.</div>}
        {msgs.map((m, i) => (
          <div key={i} className={'chat-msg' + (m.by === myId ? ' mine' : '')}>
            <span className="chat-msg-name">{m.name}</span>
            <span className="chat-msg-text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" value={text} maxLength={300}
          placeholder={`Escribile a Zona ${curZone?.label}...`}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}/>
        <button className="btn-gold chat-send" onClick={send}><span className="mat">send</span></button>
      </div>
    </div>
  );
}
