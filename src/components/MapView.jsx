import { useState } from 'react';
import { TERR, ADJ, ADJ_PAIRS, CX, CY, STATE_COLOR, ZONES } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa estilo TEG con geografía real del AMBA (grilla 1000x800).
// Capas: 1) regiones de zona (bgPath), 2) conexiones, 3) nodos interactivos.
const W = 1000, H = 800;

export default function MapView({ S, sel, onTerr }) {
  const phase = S.phase;
  const cur = S.players.find(p => p.id === S.order[S.tidx]);
  const me = cur && cur.human ? cur.id : null;
  const myTurn = me != null && !S.busy;
  const [hover, setHover] = useState(null);

  const getCoords = (id) => { const t = TERR.find(x => x.id === id); return t ? { x: t.x, y: t.y } : { x: 0, y: 0 }; };

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
  const capital = TERR.find(t => t.id === 'capital');

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none overflow-hidden">
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="40%" r="90%">
            <stop offset="0%" stopColor="#10263f"/>
            <stop offset="60%" stopColor="#0a1a2e"/>
            <stop offset="100%" stopColor="#050e1b"/>
          </radialGradient>
          <pattern id="waterRipple" width="44" height="22" patternUnits="userSpaceOnUse">
            <path d="M 0 11 Q 11 5, 22 11 T 44 11" fill="none" opacity="0.3" stroke="#1c3a5c" strokeWidth="1"/>
          </pattern>
        </defs>

        {/* MAR al este (Río de la Plata) */}
        <path d="M 800,0 L 1000,0 L 1000,800 L 850,800 L 830,660 L 800,560 L 780,400 L 790,180 Z" fill="url(#waterGrad)"/>
        <path d="M 800,0 L 1000,0 L 1000,800 L 850,800 L 830,660 L 800,560 L 780,400 L 790,180 Z" fill="url(#waterRipple)"/>
        <text x={W - 40} y={H / 2} transform={`rotate(90 ${W - 40} ${H / 2})`} fill="#5fa8d3" opacity="0.6" fontSize="20" letterSpacing="8" fontStyle="italic" fontFamily="'Archivo', sans-serif" textAnchor="middle">RÍO DE LA PLATA</text>

        {/* CAPA 1: REGIONES DE ZONA (dibujadas a mano) */}
        <g id="capa-regiones">
          {Object.keys(ZONES).filter(k => k !== 'capital').map(k => {
            const z = ZONES[k];
            return (
              <g key={k} pointerEvents="none">
                <path d={z.bgPath} fill={z.color} fillOpacity="0.18" stroke={z.stroke} strokeWidth="3" strokeLinejoin="round"/>
                <text x={bgLabelPos(k).x} y={bgLabelPos(k).y} textAnchor="middle" fill={z.color} fontSize="16" fontWeight="800" letterSpacing="4" fontFamily="'Archivo', sans-serif" style={{ paintOrder: 'stroke', stroke: 'rgba(5,7,13,.85)', strokeWidth: 3 }}>
                  {z.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>

        {/* CAPA 2: CONEXIONES (aristas de ataque) */}
        <g id="capa-conexiones" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" pointerEvents="none">
          {ADJ_PAIRS.map(([a, b], i) => {
            const p1 = getCoords(a), p2 = getCoords(b);
            return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
          })}
        </g>

        {/* CAPA 3: NODOS Y LOCALIDADES */}
        <g id="capa-territorios">
          {TERR.map(t => {
            const tt = S.terr[t.id];
            const owner = tt.owner;
            const dimm = dim(t.id) ? 1 : 0;
            const cand = isCandidate(t.id);
            const isSel = sel && sel.o === t.id;
            const zona = ZONES[t.zone];
            const troopCol = owner == null ? '#475569' : playerColor(S, owner);
            const r = t.special ? 26 : t.big ? 22 : 18;
            return (
              <g key={t.id}
                className={'node' + (dimm ? ' dim' : '')}
                opacity={dimm ? 0.3 : 1}
                style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }}
                onClick={() => onTerr(t.id)}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}>
                {/* halo de selección */}
                {isSel && <circle cx={t.x} cy={t.y} r={r + 8} fill="none" stroke="#ffffff" strokeWidth="3" className="animate-pulse"/>}
                {cand && <circle cx={t.x} cy={t.y} r={r + 9} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="5,3" opacity="0.9"/>}
                {/* aura CABA */}
                {t.special && <circle cx={t.x} cy={t.y} r={r + 14} fill="#facc15" fillOpacity="0.15"/>}
                {/* círculo principal */}
                <circle cx={t.x} cy={t.y} r={r} fill={troopCol} stroke={zona ? zona.color : '#64748b'} strokeWidth="3"/>
                {/* número de tropas */}
                <text x={t.x} y={t.y + 5} textAnchor="middle" fill="#fff" fontSize={t.special ? 15 : 12} fontWeight="bold" pointerEvents="none">{tt.troops}</text>
                {/* nombre */}
                <text x={t.x} y={t.y + (t.special ? 50 : 34)} textAnchor="middle" fill="#cbd5e1" fontSize={t.special ? 12 : 10} fontWeight="600" pointerEvents="none" style={{ paintOrder: 'stroke', stroke: 'rgba(5,7,13,.9)', strokeWidth: 3 }}>{t.special ? 'LA CAPITAL' : t.name}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* inspector */}
      <div className="inspector">
        <div className="inspector-title"><span className="turn-dot" style={{ width: 8, height: 8 }}></span>{hovered ? hovered.name : 'Cartografía'}</div>
        <div className="inspector-grid">
          <div>Facción: <strong className="fac">{hoverOwner ? (hoverOwner.owner == null ? 'El Estado' : playerName(S, hoverOwner.owner)) : '—'}</strong></div>
          <div>Guarnición: <strong>{hoverOwner ? hoverOwner.troops + ' tropas' : '—'}</strong></div>
        </div>
        <div className="inspector-flavor">{hovered ? hovered.flavor : 'Pasá el mouse sobre un distrito para la telemetría.'}</div>
      </div>

      {/* leyenda */}
      <div className="legend">
        {[['#facc15', 'Capital'], ['#ec4899', 'Norte'], ['#f97316', 'Oeste'], ['#22c55e', 'Sur'], ['#475569', 'El Estado']].map(([c, n]) => (
          <span key={n}><i style={{ background: c }}></i>{n}</span>
        ))}
      </div>
    </div>
  );
}

// posiciones de las etiquetas de zona
function bgLabelPos(k) {
  return {
    norte: { x: 380, y: 150 },
    oeste: { x: 260, y: 430 },
    sur: { x: 560, y: 650 },
  }[k] || { x: 500, y: 300 };
}