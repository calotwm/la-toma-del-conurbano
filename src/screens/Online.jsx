import { useEffect, useRef, useState } from 'react';
import { getSocket, createRoom, joinRoom, disconnectSocket } from '../net.js';
import { BOT_NAMES } from '../data.js';
import { Copyright } from '../components/common.jsx';

const LEVELS = [
  { key: 'chorro', label: 'Chorro' },
  { key: 'defensa', label: 'Tibio' },
  { key: 'capo', label: 'Capo' },
];

export default function Online({ onBack, onGameStart }) {
  const [step, setStep] = useState('choice'); // choice | create | join | lobby
  const [name, setName] = useState(() => localStorage.getItem('lomaConurbanoNombre') || '');
  const [code, setCode] = useState('');
  const [room, setRoom] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const myCode = useRef(null);

  useEffect(() => {
    const s = getSocket();
    const onUpdate = (r) => setRoom(r);
    const onStart = ({ state, youAre }) => onGameStart({ state, youAre, code: myCode.current });
    const onErr = (msg) => setErr(msg);
    s.on('room:update', onUpdate);
    s.on('game:start', onStart);
    s.on('room:error', onErr);
    return () => { s.off('room:update', onUpdate); s.off('game:start', onStart); s.off('room:error', onErr); };
  }, [onGameStart]);

  const saveName = (n) => { setName(n); try { localStorage.setItem('lomaConurbanoNombre', n); } catch (e) {} };

  const doCreate = async () => {
    setErr(''); setBusy(true);
    try {
      const res = await createRoom(name);
      myCode.current = res.code;
      setRoom(res.room);
      setStep('lobby');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const doJoin = async () => {
    setErr(''); setBusy(true);
    try {
      const res = await joinRoom(code, name);
      myCode.current = res.code;
      setRoom(res.room);
      setStep('lobby');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const addBot = () => {
    if (!room) return;
    const used = room.players.map(p => p.name).concat(room.bots.map(b => b.name));
    let nm = BOT_NAMES.find(n => !used.includes(n)) || ('Bot ' + (room.bots.length + 1));
    getSocket().emit('room:addBot', { code: myCode.current, name: nm, level: 'chorro' });
  };
  const removeBot = (idx) => getSocket().emit('room:removeBot', { code: myCode.current, idx });
  const startGame = () => getSocket().emit('room:start', { code: myCode.current });
  const leaveRoom = () => {
    getSocket().emit('room:leave', { code: myCode.current });
    disconnectSocket();
    setRoom(null); myCode.current = null; setStep('choice');
  };
  const backToChoice = () => { setErr(''); setStep('choice'); };
  const backToHome = () => { disconnectSocket(); onBack(); };

  if (step === 'choice') {
    return (
      <div className="screen">
        <div className="medallion" style={{ width: 64, height: 64 }}>
          <div className="medallion-in"><span className="mat" style={{ fontSize: 34 }}>public</span></div>
        </div>
        <h1 className="logo embossed" style={{ fontSize: 30 }}>JUGAR ONLINE</h1>
        <p className="tagline" style={{ maxWidth: 480 }}>Creá una sala y pasale el código a tus amigos, o metete con el código de una sala que ya existe.</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-gold btn-big" onClick={() => setStep('create')}><span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>add_circle</span> CREAR SALA</button>
          <button className="btn-ghost btn-big" onClick={() => setStep('join')}><span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>login</span> UNIRME CON UN CÓDIGO</button>
        </div>
        <button className="btn-ghost" style={{ marginTop: 6 }} onClick={backToHome}><span className="mat" style={{ fontSize: 16, verticalAlign: -3 }}>arrow_back</span> Volver</button>
        <Copyright/>
      </div>
    );
  }

  if (step === 'create' || step === 'join') {
    const isJoin = step === 'join';
    return (
      <div className="screen">
        <h1 className="logo embossed" style={{ fontSize: 26 }}>{isJoin ? 'UNIRME A UNA SALA' : 'CREAR SALA'}</h1>
        <div className="frame panel" style={{ width: 380, maxWidth: '92vw', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
          <span className="corner corner-bl"></span><span className="corner corner-br"></span>
          <label style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>Tu nombre
            <input value={name} onChange={e => saveName(e.target.value)} maxLength={18} placeholder="Ej: El Ruso"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '9px 10px', borderRadius: 8, background: '#0d1017', border: '1px solid var(--line)', color: 'var(--txt)', fontSize: 14 }}/>
          </label>
          {isJoin && (
            <label style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>Código de sala
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={5} placeholder="Ej: 7K3QP"
                style={{ display: 'block', width: '100%', marginTop: 4, padding: '9px 10px', borderRadius: 8, background: '#0d1017', border: '1px solid var(--line)', color: 'var(--celeste)', fontSize: 18, letterSpacing: 4, fontFamily: "'Inter', sans-serif", textTransform: 'uppercase' }}/>
            </label>
          )}
          {err && <div style={{ color: 'var(--red-l)', fontSize: 12 }}>{err}</div>}
          <button className="btn-gold btn-big" disabled={busy || !name.trim() || (isJoin && code.trim().length < 4)} onClick={isJoin ? doJoin : doCreate}>
            {busy ? 'Un segundo...' : (isJoin ? 'ENTRAR A LA SALA' : 'CREAR Y CONSEGUIR CÓDIGO')}
          </button>
        </div>
        <button className="btn-ghost" onClick={backToChoice}><span className="mat" style={{ fontSize: 16, verticalAlign: -3 }}>arrow_back</span> Volver</button>
        <Copyright/>
      </div>
    );
  }

  // lobby
  const iAmHost = room && room.players.find(p => p.isHost);
  const total = room ? room.players.length + room.bots.length : 0;
  return (
    <div className="screen">
      <h1 className="logo embossed" style={{ fontSize: 26 }}>SALA DE ESPERA</h1>
      <div className="frame panel" style={{ width: 420, maxWidth: '94vw', padding: 18 }}>
        <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
        <span className="corner corner-bl"></span><span className="corner corner-br"></span>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Código de sala — pasaselo a tus amigos</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 900, color: 'var(--celeste)', letterSpacing: 8 }}>{myCode.current}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {room && room.players.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: '#0d1017', border: '1px solid var(--line)', borderRadius: 8 }}>
              <span className="dot" style={{ background: room.colors[i % room.colors.length], width: 12, height: 12, borderRadius: '50%' }}/>
              <b style={{ fontSize: 13 }}>{p.name}</b>
              {p.isHost && <span className="minitag" style={{ color: 'var(--gold-light)' }}>HOST</span>}
              {!p.connected && <span className="minitag" style={{ color: 'var(--muted)' }}>desconectado</span>}
              <div style={{ flex: 1 }}/>
              <span className="mat" style={{ fontSize: 15, color: 'var(--muted)' }}>person</span>
            </div>
          ))}
          {room && room.bots.map((b, i) => (
            <div key={'b' + i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: '#0d1017', border: '1px solid var(--line)', borderRadius: 8 }}>
              <span className="dot" style={{ background: room.colors[(room.players.length + i) % room.colors.length], width: 12, height: 12, borderRadius: '50%' }}/>
              <b style={{ fontSize: 13 }}>{b.name}</b>
              <span className="minitag" style={{ color: 'var(--muted)' }}>bot {LEVELS.find(l => l.key === b.level)?.label}</span>
              <div style={{ flex: 1 }}/>
              {iAmHost && <button className="btn-dark" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => removeBot(i)}>✕</button>}
            </div>
          ))}
        </div>
        {iAmHost && (
          <button className="btn-ghost" style={{ marginTop: 10, width: '100%' }} disabled={total >= 6} onClick={addBot}>
            <span className="mat" style={{ fontSize: 16, verticalAlign: -3 }}>smart_toy</span> Agregar bot
          </button>
        )}
        {err && <div style={{ color: 'var(--red-l)', fontSize: 12, marginTop: 8 }}>{err}</div>}
        {iAmHost ? (
          <button className="btn-gold btn-big" style={{ marginTop: 14, width: '100%' }} disabled={total < 2} onClick={startGame}>
            <span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>play_arrow</span> EMPEZAR PARTIDA
          </button>
        ) : (
          <div className="hint" style={{ marginTop: 14 }}>Esperando a que el host arranque la partida...</div>
        )}
      </div>
      <button className="btn-ghost" onClick={leaveRoom}><span className="mat" style={{ fontSize: 16, verticalAlign: -3 }}>arrow_back</span> Salir de la sala</button>
      <Copyright/>
    </div>
  );
}
