import { useState } from 'react';
import { TERR, ADJ, STATE_COLOR, ZONES, ZKEYS } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa estilo TEG con geografía REAL del AMBA:
// - Zonas como REGIONES CONTIGUAS (polígonos): Norte arriba, Oeste izquierda, Sur abajo.
// - CABA en el centro, Río de la Plata al este.
// - Cada territorio = círculo con número de tropas (color = dueño).
const W = 1180, H = 950;

// Polígonos aproximados de cada zona (regiones contiguas del mapa real)
const ZONE_REGIONS = {
  norte: [[10,10],[860,10],[1040,300],[820,410],[600,320],[300,250],[10,280]],
  oeste: [[10,310],[290,265],[470,300],[560,450],[520,650],[420,720],[230,720],[10,650]],
  sur:   [[10,720],[420,735],[580,700],[640,820],[660,940],[820,940],[1060,900],[10,940]],
};

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
  const capital = TERR.find(t => t.id === 'capital');
  const zoneLabelPos = {
    norte: { x: 300, y: 120 },
    oeste: { x: 150, y: 430 },
    sur: { x: 470, y: 830 },
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="30%" r="90%">
            <stop offset="0%" stopColor="#10263f"/>
            <stop offset="55%" stopColor="#0a1a2e"/>
            <stop offset="100%" stopColor="#050e1b"/>
          </radialGradient>
          <pattern id="waterRipple" width="44" height="22" patternUnits="userSpaceOnUse">
            <path d="M 0 11 Q 11 5, 22 11 T 44 11" fill="none" opacity="0.3" stroke="#1c3a5c" strokeWidth="1"/>
          </pattern>
          <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#131926"/>
            <stop offset="100%" stopColor="#0a0e16"/>
          </linearGradient>
        </defs>

        {/* MAR al este (Río de la Plata) */}
        <path d={coastPath()} fill="url(#waterGrad)"/>
        <path d={coastPath()} fill="url(#waterRipple)"/>
        <text x={W - 60} y={H / 2} transform={`rotate(90 ${W - 60} ${H / 2})`} fill="#5fa8d3" opacity="0.6" fontSize="22" letterSpacing="10" fontStyle="italic" fontFamily="'Archivo', sans-serif" textAnchor="middle">RÍO DE LA PLATA</text>

        {/* tierra */}
        <rect x="0" y="0" width={W} height={H} fill="url(#landGrad)"/>

        {/* REGIONES DE ZONA (delimitación clara por color) */}
        {ZKEYS.filter(k => k !== 'capital').map(k => {
          const region = ZONE_REGIONS[k];
          if (!region) return null;
          const c = ZONES[k].color;
          const pts = region.map(p => p.join(',')).join(' ');
          return (
            <g key={k} pointerEvents="none">
              <polygon points={pts} fill={c} fillOpacity="0.20" stroke={c} strokeWidth="3" strokeOpacity="0.9"/>
              <polygon points={pts} fill="none" stroke="#0a0c12" strokeWidth="1.2" opacity="0.4"/>
              <text x={zoneLabelPos[k].x} y={zoneLabelPos[k].y} textAnchor="middle" fill={c} fontSize="20" fontWeight="800" letterSpacing="5" fontFamily="'Archivo', sans-serif" style={{ paintOrder: 'stroke', stroke: 'rgba(5,7,13,.85)', strokeWidth: 3 }}>
                {ZONES[k].label.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* círculos de tropas (color = dueño) */}
        {TERR.map(t => {
          const tt = S.terr[t.id];
          const owner = tt.owner;
          const dimm = dim(t.id) ? 1 : 0;
          const cand = isCandidate(t.id);
          const isSel = sel && sel.o === t.id;
          const troopCol = owner == null ? '#5a6882' : playerColor(S, owner);
          const rT = t.special ? 26 : 18;
          const rO = t.special ? 34 : 25;
          return (
            <g key={t.id}
              className={'node' + (dimm ? ' dim' : '')}
              opacity={dimm ? 0.3 : 1}
              style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }}
              onClick={() => onTerr(t.id)}
              onMouseEnter={() => setHover(t.id)}
              onMouseLeave={() => setHover(null)}>
              {t.special && <circle cx={t.x} cy={t.y} r={46} fill="#eab308" fillOpacity="0.15"/>}
              {isSel && <circle cx={t.x} cy={t.y} r={rO + 6} fill="none" stroke="var(--celeste)" strokeWidth="4"/>}
              {cand && <circle cx={t.x} cy={t.y} r={rO + 7} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6,4" opacity="0.9"/>}
              <circle cx={t.x} cy={t.y} r={rO} fill={ZONES[t.zone]?.color || '#55637f'} fillOpacity="0.14"/>
              <circle cx={t.x} cy={t.y} r={rT} fill={troopCol} stroke="#0a0c12" strokeWidth={t.special ? 3 : 2}/>
              <text className="count" x={t.x} y={t.y + (t.special ? 6 : 4)} fontSize={t.special ? 15 : 11}>{tt.troops}</text>
            </g>
          );
        })}

        {/* etiquetas de territorio (debajo del círculo) */}
        <g pointerEvents="none">
          {TERR.map(t => (
            <text key={t.id} className="label" x={t.x} y={t.y + (t.special ? 50 : 40)} textAnchor="middle" fontSize={t.special ? 13 : 10}>
              {t.special ? 'LA CAPITAL' : t.name}
            </text>
          ))}
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
        {[['#eab308', 'Capital'], ['#ec4899', 'Norte'], ['#f97316', 'Oeste'], ['#22c55e', 'Sur'], ['#5a6882', 'El Estado']].map(([c, n]) => (
          <span key={n}><i style={{ background: c }}></i>{n}</span>
        ))}
      </div>
    </div>
  );
}

// Costa del Río de la Plata al este (Tigre/San Fernando al noreste, Avellaneda/Quilmes/Berazategui al este)
function coastPath() {
  const pts = [
    [950, 0], [1040, 220], [1090, 400], [1080, 600], [1050, 760], [1030, H],
  ];
  const p = pts.map(q => `${q[0].toFixed(0)},${q[1].toFixed(0)}`);
  return `M${p[0]} L${p.slice(1).join(' L')} L${W},${H} L0,${H} Z`;
}