import { useEffect, useState } from 'react';
import { PLAYER_COLORS, BOT_NAMES } from '../data.js';
import { Copyright } from '../components/common.jsx';

export default function Setup({ onStart, onBack, initial }) {
  const [count, setCount] = useState(initial && initial.length ? initial.length : 2);
  const [missions, setMissions] = useState(true);
  const [metas, setMetas] = useState(() => {
    if (initial && initial.length) return initial.map(m => ({ name: m.name, human: m.human, level: m.level || 'capo' }));
    return [
      { name: 'Vos', human: true, level: 'capo' },
      { name: 'Ringo', human: false, level: 'chorro' },
      { name: 'Cacho', human: false, level: 'defensa' },
      { name: 'La Tota', human: false, level: 'capo' },
      { name: 'Bocha', human: false, level: 'defensa' },
      { name: 'El Pity', human: false, level: 'capo' },
    ].slice(0, 2);
  });

  useEffect(() => {
    setMetas(prev => {
      const next = [];
      for (let i = 0; i < count; i++) {
        if (prev[i]) { next.push({ ...prev[i] }); }
        else {
          const taken = prev.map(p => p.name);
          let nm = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
          let g = 0; while (taken.includes(nm) && g++ < 30) nm = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
          next.push({ name: nm, human: false, level: ['chorro', 'defensa', 'capo'][Math.floor(Math.random() * 3)] });
        }
      }
      return next;
    });
  }, [count]);

  const setMeta = (i, patch) => setMetas(prev => prev.map((m, ix) => ix === i ? { ...m, ...patch } : m));
  const humans = metas.filter(m => m.human).length;

  return (
    <div className="setup">
      <button className="btn-ghost" onClick={onBack}>← Volver</button>
      <h1 style={{ fontSize: 26, margin: '10px 0' }}>ARMAR LA PELOTERA</h1>

      <div className="kv"><span>Jugadores</span><b>{count}</b></div>
      <div className="countrow">
        {[2, 3, 4, 5, 6].map(n => (
          <button key={n} className={'countbtn' + (n === count ? ' on' : '')} onClick={() => setCount(n)}>{n}</button>
        ))}
      </div>

      <label className="chk">
        <input type="checkbox" checked={missions} onChange={e => setMissions(e.target.checked)}/>
        Misiones especiales (ganás apenas cumplís la tuya: La Matanza, La Capital, El Doble Comando, El 10)
      </label>
      <div style={{ margin: '12px 0 6px', fontSize: 12, color: 'var(--dim)' }}>⚠️ Mínimo 1 humano. La Capital arranca NEUTRAL con 8 tropas (El Estado defiende).</div>

      {metas.map((m, i) => (
        <div className="pcard" key={i}>
          <span className="dot" style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}/>
          <input value={m.name} maxLength={14} onChange={e => setMeta(i, { name: e.target.value })}/>
          <button className={'tagbtn' + (m.human ? ' on' : '')} onClick={() => setMeta(i, { human: !m.human, level: m.human ? 'capo' : m.level })}>{m.human ? '🧑 Humano' : '🤖 Bot'}</button>
          {!m.human && <button className={'tagbtn' + (m.level === 'chorro' ? ' on' : '')} onClick={() => setMeta(i, { level: 'chorro' })}>Chorro</button>}
          {!m.human && <button className={'tagbtn' + (m.level === 'defensa' ? ' on' : '')} onClick={() => setMeta(i, { level: 'defensa' })}>Defensa</button>}
          {!m.human && <button className={'tagbtn' + (m.level === 'capo' ? ' on' : '')} onClick={() => setMeta(i, { level: 'capo' })}>Capo</button>}
        </div>
      ))}

      <div className="btns" style={{ justifyContent: 'flex-start' }}>
        <button className="btn-big" disabled={humans < 1}
          onClick={() => onStart(metas.map((m, i) => ({ ...m, color: PLAYER_COLORS[i % PLAYER_COLORS.length] })), missions)}>
          ¡A REPARTIR Y JUGAR!
        </button>
      </div>
      <Copyright/>
    </div>
  );
}
