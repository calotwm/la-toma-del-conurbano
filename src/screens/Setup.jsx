import { useEffect, useState } from 'react';
import { PLAYER_COLORS, BOT_NAMES } from '../data.js';
import { Copyright } from '../components/common.jsx';

// Niveles de bot con su explicación
const LEVELS = [
  { key: 'chorro',   label: 'Chorro',   desc: 'Ataca sin pensar, se la juega. Ideal para aprender.' },
  { key: 'defensa',  label: 'Tibio',  desc: 'Juega a las escondidas: protege sus territorios y La Capital sin arriesgar.' },
  { key: 'capo',     label: 'Capo',     desc: 'Estratégico: va por La Capital y cumple su misión.' },
];

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
    <div className="setup screen">
      <button className="btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}><span className="mat" style={{ fontSize: 18, verticalAlign: -3 }}>arrow_back</span> Volver</button>
      <h1 className="logo embossed" style={{ fontSize: 30 }}>ARMAR LA PELOTERA</h1>

      <div style={{ fontFamily: "'Space Mono', monospace", color: 'var(--muted)', fontSize: 12 }}>JUGADORES: <strong style={{ color: 'var(--celeste)' }}>{count}</strong></div>
      <div className="countrow">
        {[2, 3, 4, 5, 6].map(n => (
          <button key={n} className={'countbtn' + (n === count ? ' on' : '')} onClick={() => setCount(n)}>{n}</button>
        ))}
      </div>

      <label className="chk">
        <input type="checkbox" checked={missions} onChange={e => setMissions(e.target.checked)}/>
        Misiones especiales (ganás apenas cumplís la tuya: dominar La Capital, el Norte, el Oeste o el Sur, o eliminar a un rival)
      </label>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>Mínimo 1 humano. La Capital arranca NEUTRAL con 8 tropas (El Estado defiende).</div>

      {metas.map((m, i) => (
        <div className="pcard" key={i} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <span className="dot" style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length], width: 22, height: 22, borderRadius: '50%', border: '2px solid #fff8', boxShadow: '0 0 6px ' + PLAYER_COLORS[i % PLAYER_COLORS.length], alignSelf: 'start' }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={m.name} maxLength={14} onChange={e => setMeta(i, { name: e.target.value })}/>
            {!m.human && (
              <div className="level-picker">
                {LEVELS.map(lv => (
                  <button key={lv.key}
                    className={'level-btn' + (m.level === lv.key ? ' on' : '')}
                    title={lv.desc}
                    onClick={() => setMeta(i, { level: lv.key })}>
                    {lv.label}
                  </button>
                ))}
              </div>
            )}
            {!m.human && (
              <div className="level-desc">
                {LEVELS.find(lv => lv.key === m.level)?.desc}
              </div>
            )}
          </div>
          <button className={'tagbtn' + (m.human ? ' on' : '')}
            style={{ alignSelf: 'start' }}
            onClick={() => setMeta(i, { human: !m.human, level: m.human ? 'capo' : m.level })}>
            {m.human ? 'Humano' : 'Bot'}
          </button>
        </div>
      ))}

      <div className="btns" style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', marginTop: 10 }}>
        <button className="btn-gold btn-big" disabled={humans < 1}
          onClick={() => onStart(metas.map((m, i) => ({ ...m, color: PLAYER_COLORS[i % PLAYER_COLORS.length] })), missions)}>
          <span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>flag</span> ¡A REPARTIR Y JUGAR!
        </button>
      </div>
      <Copyright/>
    </div>
  );
}
