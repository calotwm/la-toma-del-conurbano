import { useEffect, useState } from 'react';
import { TERR, ADJ, ADJ_PAIRS, CX, CY, STATE_COLOR, ZONES } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa estilo TEG con geografía real del AMBA (grilla 1000x800).
// Capas: 1) regiones de zona (bgPath), 2) conexiones, 3) nodos interactivos.
const W = 1200, H = 800, OX = 150;

export default function MapView({ S, sel, battle, onTerr }) {
  const phase = S.phase;
  const cur = S.players.find(p => p.id === S.order[S.tidx]);
  const me = cur && cur.human ? cur.id : null;
  const myTurn = me != null && !S.busy;
  const [hover, setHover] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // en móvil el mapa debe quedar COMPLETO (meet), en desktop puede llenar (slice)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  // Capa de batalla: anillos atacante/defensor + flecha animada + rótulo lunfardo
  const battleVis = (() => {
    if (!battle) return null;
    const oT = TERR.find(t => t.id === battle.o);
    const tT = TERR.find(t => t.id === battle.t);
    if (!oT || !tT) return null;
    const nodeR = (t) => (t.special ? 26 : t.big ? 22 : 18);
    const rO = nodeR(oT), rT = nodeR(tT);
    const atkColor = playerColor(S, battle.atkId);
    const defColor = playerColor(S, battle.defId);
    const defending = battle.defId != null && battle.defId === me;
    const ox = oT.x, oy = oT.y, tx = tT.x, ty = tT.y;
    const dx = tx - ox, dy = ty - oy;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    const gap = 6;
    const sx = ox + ux * (rO + gap), sy = oy + uy * (rO + gap);
    const ex = tx - ux * (rT + gap), ey = ty - uy * (rT + gap);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const mx = (ox + tx) / 2, my = (oy + ty) / 2 - 14;
    const atkName = playerName(S, battle.atkId);
    const defName = playerName(S, battle.defId);
    return { oT, tT, rO, rT, atkColor, defColor, defending, sx, sy, ex, ey, ang, mx, my, atkName, defName };
  })();

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={isMobile ? 'xMidYMid meet' : 'xMidYMid slice'} className="w-full h-full select-none overflow-hidden">
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="40%" r="90%">
            <stop offset="0%" stopColor="#10263f"/>
            <stop offset="60%" stopColor="#0a1a2e"/>
            <stop offset="100%" stopColor="#050e1b"/>
          </radialGradient>
          <pattern id="waterRipple" width="44" height="22" patternUnits="userSpaceOnUse">
            <path d="M 0 11 Q 11 5, 22 11 T 44 11" fill="none" opacity="0.3" stroke="#1c3a5c" strokeWidth="1"/>
          </pattern>
          <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13151c"/>
            <stop offset="100%" stopColor="#0a0c10"/>
          </linearGradient>
        </defs>

        {/* fondo de tierra (cubre todo el viewBox) */}
        <rect x="0" y="0" width={W} height={H} fill="url(#landGrad)"/>
        {/* contenido del mapa desplazado a la derecha para ocupar mejor el ancho */}
        <g transform={`translate(${OX},0)`}>
        {/* MAR al este (Río de la Plata), con costa suave */}
        <path d="M 810,0 L 1000,0 L 1000,800 L 860,800 C 830,720 810,640 810,560 C 810,440 795,300 800,150 C 802,90 806,40 810,0 Z" fill="url(#waterGrad)"/>
        <path d="M 810,0 L 1000,0 L 1000,800 L 860,800 C 830,720 810,640 810,560 C 810,440 795,300 800,150 C 802,90 806,40 810,0 Z" fill="url(#waterRipple)"/>
        <text x={W - OX - 40} y={H / 2} transform={`rotate(90 ${W - OX - 40} ${H / 2})`} fill="#5fa8d3" opacity="0.6" fontSize="18" letterSpacing="8" fontStyle="italic" fontFamily="'Archivo', sans-serif" textAnchor="middle">RÍO DE LA PLATA</text>

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
                {/* halo de selección (suprimido durante una batalla para evitar dobles anillos) */}
                {!battle && isSel && <circle cx={t.x} cy={t.y} r={r + 8} fill="none" stroke="#ffffff" strokeWidth="3" className="animate-pulse"/>}
                {!battle && cand && <circle cx={t.x} cy={t.y} r={r + 9} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="5,3" opacity="0.9"/>}
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

        {/* CAPA 4: BATALLA (anillos + flecha + rótulo) — siempre por encima de los nodos */}
        {battleVis && (
          <g className="battle-layer" pointerEvents="none">
            <circle cx={battleVis.oT.x} cy={battleVis.oT.y} r={battleVis.rO + 6} fill="none" stroke={battleVis.atkColor} strokeWidth="3" className="battle-ring-atk"/>
            <circle cx={battleVis.tT.x} cy={battleVis.tT.y} r={battleVis.rT + 6} fill="none" stroke={battleVis.defColor} strokeWidth={battleVis.defending ? 5 : 3} className={'battle-ring-def' + (battleVis.defending ? ' defend' : '')}/>
            <line x1={battleVis.sx} y1={battleVis.sy} x2={battleVis.ex} y2={battleVis.ey} stroke={battleVis.atkColor} strokeWidth="3" strokeDasharray="8 6" className="battle-arrow"/>
            <polygon points="0,0 -9,-5 -9,5" fill={battleVis.atkColor} transform={`translate(${battleVis.ex} ${battleVis.ey}) rotate(${battleVis.ang})`}/>
            <text x={battleVis.mx} y={battleVis.my} textAnchor="middle" fontSize="12" fontWeight="700" style={{ paintOrder: 'stroke', stroke: 'rgba(5,7,13,.9)', strokeWidth: 3 }}>
              <tspan fill={battleVis.atkColor}>{battleVis.atkName}</tspan>
              <tspan fill="#cbd5e1"> le pisa el rancho a </tspan>
              <tspan fill={battleVis.defColor}>{battleVis.defName}</tspan>
            </text>
          </g>
        )}
        </g>{/* cierre del translate(OX) */}
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