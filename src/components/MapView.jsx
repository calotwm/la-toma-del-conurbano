import { useState } from 'react';
import { TERR, ADJ, ADJ_PAIRS, CX, CY, STATE_COLOR } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa del Conurbano con geografía REAL: el Río de la Plata corre por el
// noreste/este (costa desde Tigre-San Isidro bajando por Avellaneda-Quilmes-
// Berazategui). CABA en el centro, La Matanza como bastión gigante al oeste.
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
      <svg viewBox="0 0 920 760" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="30%" r="90%">
            <stop offset="0%" stopColor="#10263f"/>
            <stop offset="55%" stopColor="#0a1a2e"/>
            <stop offset="100%" stopColor="#050e1b"/>
          </radialGradient>
          <pattern id="waterRipple" width="44" height="22" patternUnits="userSpaceOnUse">
            <path d="M 0 11 Q 11 5, 22 11 T 44 11" fill="none" opacity="0.3" stroke="#1c3a5c" strokeWidth="1"/>
          </pattern>
          <radialGradient id="landGrad" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#141a26"/>
            <stop offset="70%" stopColor="#0d121c"/>
            <stop offset="100%" stopColor="#0a0e16"/>
          </radialGradient>
          <filter id="cabaGlow" height="200%" width="200%" x="-50%" y="-50%">
            <feGaussianBlur result="b1" stdDeviation="10"/>
            <feGaussianBlur result="b2" stdDeviation="20"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="matanzaGlow" height="160%" width="160%" x="-30%" y="-30%">
            <feGaussianBlur result="b" stdDeviation="7"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Río de la Plata: ocupa el NORTE-ESTE. Costa real desde Tigre (325,23)
            bajando por San Fernando, San Isidro, Vicente López, por el este hasta
            Avellaneda (645,369), Quilmes (760,438) y Berazategui (833,508). */}
        <path d="M 200,0 L 920,0 L 920,760 L 880,700 L 850,560 L 800,470 L 720,410 L 660,380 L 600,300 L 560,200 L 520,120 L 480,60 L 440,0 Z"
          fill="url(#waterGrad)"/>
        <path d="M 200,0 L 920,0 L 920,760 L 880,700 L 850,560 L 800,470 L 720,410 L 660,380 L 600,300 L 560,200 L 520,120 L 480,60 L 440,0 Z"
          fill="url(#waterRipple)"/>

        {/* línea de costa (frontera con el río) */}
        <path d="M 440,0 L 480,60 L 520,120 L 560,200 L 600,300 L 660,380 L 720,410 L 800,470 L 850,560 L 880,700"
          fill="none" stroke="#3b6d9e" strokeWidth="2.5" strokeDasharray="9,5" opacity="0.8"/>

        {/* tierra (continente) */}
        <rect x="0" y="0" width="920" height="760" fill="url(#landGrad)"/>

        {/* delimitaciones geográficas por zona (regiones suaves) */}
        <g pointerEvents="none" opacity="0.5">
          {/* NORTE: Tigre-San Fernando-San Isidro-Vicente López-San Martín-San Miguel-José C Paz-Malvinas */}
          <path d="M 60,60 Q 300,10 500,40 L 560,80 L 540,160 L 480,180 L 430,220 L 400,290 L 330,280 L 250,220 L 150,200 L 70,200 Z"
            fill="#7bd0ff" fillOpacity="0.05" stroke="#7bd0ff" strokeWidth="1" strokeDasharray="4,4"/>
          <text x="280" y="60" fill="#7bd0ff" opacity="0.7" fontSize="13" fontWeight="800" letterSpacing="3" fontFamily="'Archivo', sans-serif">ZONA NORTE</text>
          {/* OESTE: Moreno-Merlo-Ituzaingó-Morón-Hurlingham-Tres de Febrero-Ciudadela-Ramos Mejía */}
          <path d="M 40,300 L 180,320 L 300,300 L 420,280 L 450,320 L 400,400 L 340,420 L 260,400 L 180,410 L 90,380 Z"
            fill="#f9c03d" fillOpacity="0.05" stroke="#f9c03d" strokeWidth="1" strokeDasharray="4,4"/>
          <text x="200" y="330" fill="#f9c03d" opacity="0.7" fontSize="13" fontWeight="800" letterSpacing="3" fontFamily="'Archivo', sans-serif">ZONA OESTE</text>
          {/* MATANZA */}
          <path d="M 180,460 L 340,440 L 460,450 L 520,500 L 470,560 L 340,560 L 230,540 Z"
            fill="#ff6b6b" fillOpacity="0.05" stroke="#ff6b6b" strokeWidth="1" strokeDasharray="4,4"/>
          <text x="350" y="540" fill="#ff6b6b" opacity="0.7" fontSize="13" fontWeight="800" letterSpacing="3" fontFamily="'Archivo', sans-serif">LA MATANZA</text>
          {/* SUR: Avellaneda-Lanús-Lomas-Brown-Ezeiza-Echeverría-Quilmes-Berazategui-Varela */}
          <path d="M 420,430 L 640,420 L 760,470 L 840,520 L 820,640 L 700,640 L 560,600 L 480,620 L 440,540 Z"
            fill="#c77dff" fillOpacity="0.05" stroke="#c77dff" strokeWidth="1" strokeDasharray="4,4"/>
          <text x="620" y="700" fill="#c77dff" opacity="0.7" fontSize="13" fontWeight="800" letterSpacing="3" fontFamily="'Archivo', sans-serif">ZONA SUR</text>
        </g>

        {/* etiqueta del río */}
        <text x="640" y="640" transform="rotate(35 640 640)" fill="#5fa8d3" opacity="0.6" fontSize="20" letterSpacing="6" fontStyle="italic" fontFamily="'Archivo', sans-serif">RÍO DE LA PLATA</text>
        <text x="735" y="150" fill="#5fa8d3" opacity="0.5" fontSize="13" letterSpacing="4" fontStyle="italic" fontFamily="'Archivo', sans-serif">BANCO SANTAMARINA</text>

        {/* brújula */}
        <g transform="translate(840,150)" opacity="0.6">
          <circle cx="0" cy="0" r="42" fill="none" stroke="#55637f" strokeWidth="2"/>
          <polygon fill="#eab308" points="0,-40 5,-9 0,0 -5,-9"/>
          <polygon fill="#7bd0ff" points="0,40 5,9 0,0 -5,9"/>
          <text x="0" y="-46" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="'Archivo', sans-serif" fontWeight="700">N</text>
        </g>

        {/* rutas */}
        {ADJ_PAIRS.map((p, ix) => {
          const a = TERR.find(t => t.id === p[0]), b = TERR.find(t => t.id === p[1]);
          const hub = a.special || b.special;
          return <line key={ix} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={hub ? (a.special ? '#2e9be0' : '#eab308') : '#33415c'}
            strokeWidth={hub ? 2 : 1.3} strokeDasharray={hub ? '5,5' : '3,4'} opacity="0.7"/>;
        })}

        {/* territorios */}
        {TERR.map(t => {
          const tt = S.terr[t.id];
          const owner = tt.owner;
          const col = owner == null ? STATE_COLOR : playerColor(S, owner);
          const dimm = dim(t.id) ? 1 : 0;
          const cand = isCandidate(t.id);
          const isSel = sel && sel.o === t.id;
          const neutral = owner == null && !t.special;
          const r = t.special ? t.r : (t.big ? t.r + 10 : t.r);
          return (
            <g key={t.id}
              className={'node' + (neutral ? ' neutral' : '') + (dimm ? ' dim' : '')}
              opacity={dimm ? 0.3 : 1}
              style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }}
              onClick={() => onTerr(t.id)}
              onMouseEnter={() => setHover(t.id)}
              onMouseLeave={() => setHover(null)}>
              {t.special && <circle className="caba-glow" cx={t.x} cy={t.y} r={t.r + 14} fill="#eab308" fillOpacity="0.18" filter="url(#cabaGlow)"/>}
              {t.big && <circle cx={t.x} cy={t.y} r={t.r + 5} fill="#8b1111" fillOpacity="0.5" filter="url(#matanzaGlow)"/>}
              {t.special
                ? <circle cx={t.x} cy={t.y} r={t.r} fill="#121826" stroke={owner == null ? '#8a7a3a' : col} strokeWidth={owner == null ? 2 : 4}/>
                : <circle className="fill" cx={t.x} cy={t.y} r={r} fill={col} stroke={owner == null ? '#3b4764' : '#0a0c12'} strokeWidth="2"/>
              }
              {!t.special && owner == null && <circle cx={t.x} cy={t.y} r={r} fill="none" stroke="#3b4764" strokeWidth="1.2" strokeDasharray="4 4"/>}
              {isSel && <circle className="sel-ring" cx={t.x} cy={t.y} r={r + 8}/>}
              {cand && <circle className="cand-ring" cx={t.x} cy={t.y} r={r + 9}/>}
              {t.special
                ? <text className="count" x={t.x} y={t.y + 4} fontSize="16">{tt.troops}</text>
                : <text className="count" x={t.x} y={t.y + 5} fontSize={t.big ? 15 : 12}>{tt.troops}</text>}
              {t.special
                ? <text className={'label owner'} x={t.x} y={t.y + t.r + 22}>{'LA CAPITAL'}</text>
                : <TLabel t={t} r={r}/>}
            </g>
          );
        })}
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
        {[['#0284c7', 'Porteños'], ['#ff4d4d', 'Sur/Matanza'], ['#22c55e', 'Norte'], ['#eab308', 'Oeste'], [STATE_COLOR, 'El Estado']].map(([c, n]) => (
          <span key={n}><i style={{ background: c }}></i>{n}</span>
        ))}
      </div>
    </div>
  );
}

// Etiqueta de territorio con posición configurable para evitar solapamientos.
function TLabel({ t, r }) {
  const gap = r + 6;
  const pos = t.lp || 'b';
  let x = t.x, y = t.y, anchor = 'middle';
  if (pos === 'b') { y = t.y + gap + 8; }
  else if (pos === 't') { y = t.y - gap - 6; }
  else if (pos === 'l') { x = t.x - gap - 4; anchor = 'end'; }
  else if (pos === 'r') { x = t.x + gap + 4; anchor = 'start'; }
  return <text className="label" x={x} y={y} textAnchor={anchor}>{t.name}</text>;
}
