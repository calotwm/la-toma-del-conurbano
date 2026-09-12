import { useEffect, useRef, useState } from 'react';

// Chat: un solo feed compartido — no hay canales separados por zona. Cada uno elige
// una vez de qué zona es (Capital/Norte/Oeste/Sur) como bandera/identidad, y esa
// elección queda pegada a sus mensajes en el mismo chat de todos.
export const CHAT_ZONES = [
  { key: 'capital', label: 'Capital', color: 'var(--gold)' },
  { key: 'norte', label: 'Norte', color: '#ec4899' },
  { key: 'oeste', label: 'Oeste', color: '#f97316' },
  { key: 'sur', label: 'Sur', color: '#22c55e' },
];

export default function ChatPanel({ chat, myId, myZone, setMyZone, onSend, showZonePicker }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chat]);

  function send() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  }

  const msgs = chat || [];

  return (
    <div className="chat-panel">
      {showZonePicker && (
        <div className="chat-zone-picker">
          <span className="chat-zone-picker-lbl">Vos sos de:</span>
          <div className="chat-tabs">
            {CHAT_ZONES.map(z => (
              <button key={z.key} className={'chat-tab' + (myZone === z.key ? ' on' : '')}
                style={{ '--zc': z.color }} onClick={() => setMyZone(z.key)}>
                {z.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="chat-list" ref={listRef}>
        {msgs.length === 0 && <div className="chat-empty">Nadie escribió nada todavía. Rompé el hielo.</div>}
        {msgs.map((m, i) => {
          const z = CHAT_ZONES.find(zz => zz.key === m.zone);
          return (
            <div key={i} className={'chat-msg' + (m.by === myId ? ' mine' : '')}>
              <span className="chat-msg-name" style={z ? { color: z.color } : undefined}>
                {m.name}{z ? ` · ${z.label}` : ''}
              </span>
              <span className="chat-msg-text">{m.text}</span>
            </div>
          );
        })}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" value={text} maxLength={300}
          placeholder="Escribí algo..."
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}/>
        <button className="btn-gold chat-send" onClick={send}><span className="mat">send</span></button>
      </div>
    </div>
  );
}
