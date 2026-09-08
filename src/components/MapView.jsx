import { useEffect, useRef, useState } from 'react';
import { TERR, ADJ, ADJ_PAIRS, CX, CY, STATE_COLOR, ZONES } from '../data.js';
import { playerColor, playerName } from '../engine.js';

const W = 1200, H = 800;
const MIN_SCALE = 1, MAX_SCALE = 4;

// clampea el paneo para que el contenido zoomeado siempre cubra el viewport (sin huecos) y no se pierda
function clampView(v, rect) {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale));
  const minX = rect.width * (1 - scale), maxX = 0;
  const minY = rect.height * (1 - scale), maxY = 0;
  return { scale, x: Math.min(maxX, Math.max(minX, v.x)), y: Math.min(maxY, Math.max(minY, v.y)) };
}

export default function MapView({ S, sel, battle, onTerr }) {
  const phase = S.phase;
  const cur = S.players.find(p => p.id === S.order[S.tidx]);
  const me = cur && cur.human ? cur.id : null;
  const myTurn = me != null && !S.busy;
  const [isMobile, setIsMobile] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 }); // pan/zoom táctil (solo móvil)
  const containerRef = useRef(null);
  const gesture = useRef({ pointers: new Map(), mode: null, moved: false, startView: null, startPointer: null, startDist: 0, startScale: 1, startMid: null });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const OX = isMobile ? 0 : 150;
  // en desktop el lienzo completo 1200x800 sobra (mucho margen y agua vacíos);
  // en mobile recortamos a un encuadre casi cuadrado que contiene todos los distritos,
  // así el mapa aprovecha mejor un contenedor angosto y alto en vez de quedar chiquito
  // con barras vacías arriba/abajo por el "meet".
  const vb = isMobile ? '40 10 860 800' : `0 0 ${W} ${H}`;

  // ---------- Pan & zoom táctil (mapa nunca se deforma, se agranda con pellizco y se arrastra) ----------
  const onPointerDown = (e) => {
    if (!isMobile) return;
    try { containerRef.current?.setPointerCapture?.(e.pointerId); } catch { /* pointer no activo, ignorar */ }
    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current.moved = false;
    const pts = [...gesture.current.pointers.values()];
    if (pts.length === 1) {
      gesture.current.mode = 'pan';
      gesture.current.startView = { ...view };
      gesture.current.startPointer = { x: e.clientX, y: e.clientY };
    } else if (pts.length === 2) {
      gesture.current.mode = 'pinch';
      gesture.current.startDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      gesture.current.startScale = view.scale;
      gesture.current.startMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      gesture.current.startView = { ...view };
    }
  };
  const onPointerMove = (e) => {
    if (!isMobile || !gesture.current.pointers.has(e.pointerId) || !containerRef.current) return;
    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = containerRef.current.getBoundingClientRect();
    const pts = [...gesture.current.pointers.values()];
    if (gesture.current.mode === 'pan' && pts.length === 1) {
      const dx = e.clientX - gesture.current.startPointer.x;
      const dy = e.clientY - gesture.current.startPointer.y;
      if (Math.hypot(dx, dy) > 6) gesture.current.moved = true;
      setView(clampView({ ...gesture.current.startView, x: gesture.current.startView.x + dx, y: gesture.current.startView.y + dy }, rect));
    } else if (gesture.current.mode === 'pinch' && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const s0 = gesture.current.startScale;
      const s1 = s0 * (dist / gesture.current.startDist);
      const localMid = { x: gesture.current.startMid.x - rect.left, y: gesture.current.startMid.y - rect.top };
      const x1 = localMid.x - (localMid.x - gesture.current.startView.x) * (s1 / s0);
      const y1 = localMid.y - (localMid.y - gesture.current.startView.y) * (s1 / s0);
      gesture.current.moved = true;
      setView(clampView({ x: x1, y: y1, scale: s1 }, rect));
    }
  };
  const endPointer = (e) => {
    gesture.current.pointers.delete(e.pointerId);
    const pts = [...gesture.current.pointers.values()];
    if (pts.length === 1) {
      gesture.current.mode = 'pan';
      gesture.current.startView = { ...view };
      gesture.current.startPointer = { ...pts[0] };
    } else if (pts.length === 0) {
      gesture.current.mode = null;
    }
  };
  const resetView = () => setView({ x: 0, y: 0, scale: 1 });

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

  const selectedNodeData = selectedNode ? TERR.find(t => t.id === selectedNode) : null;
  const selectedNodeOwner = selectedNodeData ? S.terr[selectedNodeData.id] : null;

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

  const handleNodeClick = (id) => {
    if (gesture.current.moved) { gesture.current.moved = false; return; } // fue un arrastre/pellizco, no un toque
    onTerr(id);
    if (isMobile) setSelectedNode(id);
  };

  return (
    <div
      ref={containerRef} className="map-pan-surface"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', touchAction: isMobile ? 'none' : 'auto' }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer}
    >
      <svg
        viewBox={vb} preserveAspectRatio="xMidYMid meet" className="w-full h-full select-none"
        style={isMobile ? { transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0', transition: gesture.current.mode ? 'none' : 'transform .2s ease-out' } : undefined}
      >
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
            const hitboxR = 22;
            return (
              <g key={t.id}
                className={'node' + (dimm ? ' dim' : '')}
                opacity={dimm ? 0.3 : 1}
                style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }}
                onClick={() => handleNodeClick(t.id)}>
                {/* hitbox invisible (44x44px) para móvil */}
                <circle cx={t.x} cy={t.y} r={hitboxR} fill="transparent" pointerEvents="auto"/>
                {/* halo de selección */}
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

      {/* botón de reset de zoom táctil, solo cuando estás ampliado */}
      {isMobile && view.scale > 1.02 && (
        <button className="map-reset-zoom" onClick={resetView}>
          <span className="mat">center_focus_weak</span>
        </button>
      )}

      {/* inspector desktop */}
      {!isMobile && (
        <div className="inspector">
          <div className="inspector-title"><span className="turn-dot" style={{ width: 8, height: 8 }}></span>Cartografía</div>
          <div className="inspector-grid">
            <div>Facción: <strong className="fac">—</strong></div>
            <div>Guarnición: <strong>—</strong></div>
          </div>
          <div className="inspector-flavor">Hover sobre un distrito para info.</div>
        </div>
      )}

      {/* bottom sheet móvil */}
      {isMobile && selectedNodeData && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-header">
            <div className="bs-title">{selectedNodeData.name}</div>
            <button className="bs-close" onClick={() => setSelectedNode(null)}>✕</button>
          </div>
          <div className="bs-content">
            <div className="bs-row">
              <span className="bs-label">Facción:</span>
              <span className="bs-value fac">{selectedNodeOwner ? (selectedNodeOwner.owner == null ? 'El Estado' : playerName(S, selectedNodeOwner.owner)) : '—'}</span>
            </div>
            <div className="bs-row">
              <span className="bs-label">Guarnición:</span>
              <span className="bs-value">{selectedNodeOwner ? selectedNodeOwner.troops + ' tropas' : '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* leyenda compacta */}
      {!isMobile && (
        <div className="legend">
          {[['#facc15', 'Capital'], ['#ec4899', 'Norte'], ['#f97316', 'Oeste'], ['#22c55e', 'Sur'], ['#475569', 'El Estado']].map(([c, n]) => (
            <span key={n}><i style={{ background: c }}></i>{n}</span>
          ))}
        </div>
      )}
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