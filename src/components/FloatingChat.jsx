import { useState } from 'react';
import ChatPanel from './ChatPanel.jsx';

// Chat flotante, chiquito y siempre activo (sin burbuja para abrir/cerrar),
// clavado abajo a la derecha en modo local y online por igual.
export default function FloatingChat({ chat, myId, onSend }) {
  const [zone, setZone] = useState('capital');

  return (
    <div className="floating-chat">
      <div className="floating-chat-panel">
        <ChatPanel chat={chat} myId={myId} onSend={onSend} zone={zone} setZone={setZone}/>
      </div>
    </div>
  );
}
