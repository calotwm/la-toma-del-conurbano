import { useState } from 'react';
import { TERR, ADJ, ADJ_PAIRS, CX, CY } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa geográfico estilizado del Conurbano: Río de la Plata al este,
// CABA como bastión central radiante, La Matanza como bastión gigante.
export default function MapView({ S, sel, onTerr }) {
  const phase = S.phase;
  const cur = S.players.find(p => p.id === S.order[S.tidx]);
  const me = cur && cur.human ? cur.id : null;
  const myTurn = me != null && !S.busy;
  const [hover, setHover] = useState(null);

  const dim = (id) => {
    const tt = S.terr[id];
    if (S.busy) return false;
    if (!myTurn) return false;
    if (phase === 'reinforce') return tt.owner !== me;
    if (phase === 'attack') {
      if (!sel || !sel.o) return tt.owner !== me || S.terr[id].troops < (id === 'capital' ? 3 : 2);
      if (id === sel.o) return false;
      if (ADJ[sel.o].includes(id) && tt.owner !== me) return false;
      return true;
    }
    if (phase === 'fortify') {
      if (!sel || !sel.o) return tt.owner !== me || S.terr[id].troops < 2;
      if (id === sel.o) return false;
      if (tt.owner === me && ADJ[sel.o].includes(id) && id !== sel.o) return false;
      return true;
    }
    return false;
  };

  const isCandidate = (id) => {
    if (!myTurn || S.busy) return false;
    if (!sel || !sel.o) return false;
    if (phase === 'attack' && ADJ[sel.o].includes(id) && S.terr[id].owner !== me) return true;
    if (phase === 'fortify' && ADJ[sel.o].includes(id) && S.terr[id].owner === me && id !== sel.o) return true;
    return false;
  };

  const hovered = hover ? TERR.find(t => t.id === hover) : null;
  const hoverOwner = hovered ? S.terr[hovered.id] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 900 760" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="waterGrad" cx="70%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#0f2647"/>
            <stop offset="60%" stopColor="#071324"/>
            <stop offset="100%" stopColor="#030812"/>
          </radialGradient>
          <pattern id="waterRipple" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 Q 10 5, 20 10 T 40 10" fill="none" opacity="0.35" stroke="#173154" strokeWidth="1.2"/>
          </pattern>
          <radialGradient id="cabaGrad" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#3a3320"/>
            <stop offset="70%" stopColor="#241f12"/>
            <stop offset="100%" stopColor="#14120a"/>
          </radialGradient>
          <filter id="cabaGlow" height="200%" width="200%" x="-50%" y="-50%">
            <feGaussianBlur result="b1" stdDeviation="12"/>
            <feGaussianBlur result="b2" stdDeviation="24"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="matanzaGlow" height="160%" width="160%" x="-30%" y="-30%">
            <feGaussianBlur result="b" stdDeviation="8"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Río de la Plata al este */}
        <path d="M 590,0 L 900,0 L 900,760 L 720,760 C 640,600 585,430 592,260 C 596,170 600,80 590,0 Z" fill="url(#waterGrad)"/>
        <path d="M 590,0 L 900,0 L 900,760 L 720,760 C 640,600 585,430 592,260 C 596,170 600,80 590,0 Z" fill="url(#waterRipple)"/>
        <path d="M 590,0 C 600,80 596,170 592,260 C 585,430 640,600 720,760" fill="none" opacity="0.6" stroke="#d4af37" strokeDasharray="8,4" strokeWidth="2"/>
        <text x="745" y="40" fontFamily="'Cinzel Decorative', serif" fontSize="13" fill="#5fa8d3" opacity="0.7" letterSpacing="4" fontStyle="italic" textAnchor="middle">RÍO DE LA PLATA</text>

        {/* Brújula */}
        <g transform="translate(830,140)" opacity="0.7">
          <circle cx="0" cy="0" r="46" fill="none" stroke="#d4af37" strokeWidth="2"/>
          <circle cx="0" cy="0" r="38" fill="none" stroke="#7bd0ff" strokeDasharray="3,3" strokeWidth="1.2"/>
          <polygon fill="#fce184" points="0,-44 6,-10 0,0 -6,-10"/>
          <polygon fill="#7bd0ff" points="0,44 6,10 0,0 -6,10"/>
          <polygon fill="#d4af37" points="-44,0 -10,6 0,0 -10,-6"/>
          <text x="0" y="-50" fill="#fce184" fontFamily="'Cinzel Decorative', serif" fontSize="9" fontWeight="900" textAnchor="middle">NORTE</text>
        </g>

        {/* decoraciones */}
        <text className="deco-text" x="70" y="50" fontSize="15">AGUANTE EL CONURBANO</text>
        <text className="deco-text" x="120" y="730" fontSize="13">JODA PESADA · LA TOMA ES DE TODOS</text>
        <text x={CX} y={CY - 84} textAnchor="middle" fill="#f2c94c" fontSize="9" opacity="0.5" fontStyle="italic" fontFamily="'Lora', serif">— GENERAL PAZ: LA FRONTERA —</text>

        {/* rutas */}
        {ADJ_PAIRS.map((p, ix) => {
          const a = TERR.find(t => t.id === p[0]), b = TERR.find(t => t.id === p[1]);
          const hub = a.special || b.special;
          return <line key={ix} className={'route' + (hub ? ' hub' : '')} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={hub ? (a.special ? '#7bd0ff' : '#fce184') : undefined}/>;
        })}

        {/* territorios */}
        {TERR.map(t => {
          const tt = S.terr[t.id];
          const owner = tt.owner;
          const col = owner == null ? '#0e131d' : playerColor(S, owner);
          const dimm = dim(t.id) ? 1 : 0;
          const cand = isCandidate(t.id);
          const isSel = sel && sel.o === t.id;
          const neutral = owner == null && !t.special;
          const r = t.special ? t.r : (t.big ? t.r + 10 : t.r);
          return (
            <g key={t.id}
              className={'node' + (neutral ? ' neutral' : '') + (dimm ? ' dim' : '') + (dim(t.id) ? ' locked' : '')}
              opacity={dimm ? 0.3 : 1}
              style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }}
              onClick={() => onTerr(t.id)}
              onMouseEnter={() => setHover(t.id)}
              onMouseLeave={() => setHover(null)}>
              {t.special && <circle className="caba-glow" cx={t.x} cy={t.y} r={t.r + 16} fill="#daa520" fillOpacity="0.22" filter="url(#cabaGlow)"/>}
              {t.big && <circle cx={t.x} cy={t.y} r={t.r + 6} fill="#8b1111" fillOpacity="0.5" filter="url(#matanzaGlow)"/>}
              {t.special
                ? <polygon points={oct(t.x, t.y, t.r)} fill="url(#cabaGrad)" stroke={owner == null ? '#8a7a3a' : col} strokeWidth={owner == null ? 2 : 4} className="fill"/>
                : <circle className="fill" cx={t.x} cy={t.y} r={r} fill={col} stroke={owner == null ? '#5a6882' : '#0a0c12'} strokeWidth="2"/>
              }
              {!t.special && owner == null && <circle cx={t.x} cy={t.y} r={r} fill="none" stroke="#5a6882" strokeWidth="1.2" strokeDasharray="4 4"/>}
              {isSel && <circle className="sel-ring" cx={t.x} cy={t.y} r={r + 8}/>}
              {cand && <circle className="cand-ring" cx={t.x} cy={t.y} r={r + 9}/>}
              {t.special
                ? <text className="count" x={t.x} y={t.y + 4} fontSize="17">{tt.troops}</text>
                : <text className="count" x={t.x} y={t.y + 5} fontSize={t.big ? 15 : 12}>{tt.troops}</text>}
              <text className={'label' + (owner != null ? ' owner' : '')} x={t.x} y={t.y + r + (t.special ? 22 : 14)}>{t.special ? 'LA CAPITAL · ' + playerName(S, owner) : t.name}</text>
            </g>
          );
        })}
      </svg>

      {/* inspector al hover */}
      <div className="inspector">
        <div className="inspector-title"><span className="turn-dot" style={{ width: 8, height: 8 }}></span>{hovered ? hovered.name : (sel && sel.o ? TERR.find(t => t.id === sel.o).name : 'Cartografía')}</div>
        <div className="inspector-grid">
          <div>Facción: <strong className="fac">{hoverOwner ? (hoverOwner.owner == null ? 'El Estado' : playerName(S, hoverOwner.owner)) : '—'}</strong></div>
          <div>Guarnición: <strong>{hoverOwner ? hoverOwner.troops + ' tropas' : '—'}</strong></div>
        </div>
        <div className="inspector-flavor">{hovered ? hovered.flavor : 'Pasá el mouse sobre un distrito para la telemetría.'}</div>
      </div>

      {/* leyenda */}
      <div className="legend">
        {[['#0284c7', 'Porteños'], ['#ff4d4d', 'Sur/Matanza'], ['#22c55e', 'Norte'], ['#eab308', 'Oeste'], ['#8a7a3a', 'El Estado']].map(([c, n]) => (
          <span key={n}><i style={{ background: c }}></i>{n}</span>
        ))}
      </div>
    </div>
  );
}

function oct(cx, cy, r) {
  // octágono para el bastión de CABA
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
