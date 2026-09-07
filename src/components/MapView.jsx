import { useMemo, useState } from 'react';
import { Delaunay } from 'd3-delaunay';
import { TERR, ADJ, CX, CY, STATE_COLOR, ZONES, ZKEYS } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa estilo TEG: territorios como REGIONES CONTIGUAS (diagrama de Voronoi),
// con fronteras compartidas y divididos por zonas. El Río de la Plata (mar) al este,
// recortado contra la costa real.
const SF = 1.18;          // escala: "menos zoom", más separación
const W = 1100, H = 900;  // viewBox

export default function MapView({ S, sel, onTerr }) {
  const phase = S.phase;
  const cur = S.players.find(p => p.id === S.order[S.tidx]);
  const me = cur && cur.human ? cur.id : null;
  const myTurn = me != null && !S.busy;
  const [hover, setHover] = useState(null);

  // polígonos de Voronoi por territorio (escalados)
  const polys = useMemo(() => {
    const pts = TERR.map(t => [t.x * SF, t.y * SF]);
    const voronoi = Delaunay.from(pts).voronoi([0, 0, W, H]);
    return TERR.map((_, i) => {
      const poly = voronoi.cellPolygon(i);
      return poly ? poly.map(p => `${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`).join(' ') : '';
    });
  }, []);
  const centroids = useMemo(() => {
    const pts = TERR.map(t => [t.x * SF, t.y * SF]);
    const voronoi = Delaunay.from(pts).voronoi([0, 0, W, H]);
    return TERR.map((_, i) => {
      const poly = voronoi.cellPolygon(i);
      if (!poly) return { x: TERR[i].x * SF, y: TERR[i].y * SF };
      let x = 0, y = 0, n = 0;
      poly.forEach(p => { x += p[0]; y += p[1]; n++; });
      return { x: x / n, y: y / n };
    });
  }, []);
  // centroide por zona para las etiquetas
  const zoneCentroids = useMemo(() => {
    const out = {};
    ZKEYS.forEach(k => {
      const ids = ZONES[k].ids;
      let x = 0, y = 0, n = 0;
      ids.forEach(id => { const t = TERR.find(t => t.id === id); x += t.x * SF; y += t.y * SF; n++; });
      out[k] = { x: x / n, y: y / n };
    });
    return out;
  }, []);

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
            <stop offset="0%" stopColor="#141a26"/>
            <stop offset="100%" stopColor="#0a0e16"/>
          </linearGradient>
          {/* clip del continente: recorta las celdas contra la costa (el mar queda al este) */}
          <clipPath id="landClip">
            <path fillRule="evenodd" d={`M0,0 H${W} V${H} H0 Z ${coastPath()}`}/>
          </clipPath>
        </defs>

        {/* MAR al este (Río de la Plata), detrás del continente */}
        <path d={coastPath()} fill="url(#waterGrad)"/>
        <path d={coastPath()} fill="url(#waterRipple)"/>
        <text x={W - 90} y={H / 2} transform={`rotate(90 ${W - 90} ${H / 2})`} fill="#5fa8d3" opacity="0.6" fontSize="22" letterSpacing="10" fontStyle="italic" fontFamily="'Archivo', sans-serif" textAnchor="middle">RÍO DE LA PLATA</text>

        {/* continente (celdas de Voronoi recortadas contra la costa) */}
        <g clipPath="url(#landClip)">
          {TERR.map((t, i) => {
            const tt = S.terr[t.id];
            const owner = tt.owner;
            const col = owner == null ? STATE_COLOR : playerColor(S, owner);
            const dimm = dim(t.id) ? 1 : 0;
            const cand = isCandidate(t.id);
            const isSel = sel && sel.o === t.id;
            const zc = ZONES[t.zone]?.color || '#55637f';
            const poly = polys[i];
            if (!poly) return null;
            return (
              <g key={t.id}
                className={'node' + (dimm ? ' dim' : '')}
                opacity={dimm ? 0.3 : 1}
                style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }}
                onClick={() => onTerr(t.id)}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}>
                <polygon points={poly} fill={col} stroke={zc} strokeWidth={t.special ? 4 : 2.5} strokeOpacity={t.special ? 1 : 0.8}
                  fillOpacity={t.special ? 0.95 : 0.9}/>
                {/* frontera interna más oscura para separar territorios */}
                <polygon points={poly} fill="none" stroke="#0a0c12" strokeWidth="0.8" opacity="0.5"/>
                {isSel && <polygon points={poly} fill="none" stroke="var(--celeste)" strokeWidth="4"/>}
                {cand && <polygon points={poly} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6,4" opacity="0.9"/>}
                <text className="count" x={centroids[i].x} y={centroids[i].y + 5} fontSize={t.special ? 20 : t.big ? 17 : 13}>{tt.troops}</text>
              </g>
            );
          })}
        </g>

        {/* etiquetas de territorio (dentro de cada celda, bajo el conteo) */}
        <g pointerEvents="none">
          {TERR.map((t, i) => (
            <text key={t.id} className="label" x={centroids[i].x} y={centroids[i].y + (t.special ? 26 : 18)} textAnchor="middle" fontSize={t.special ? 13 : 10}>
              {t.special ? 'LA CAPITAL' : t.name}
            </text>
          ))}
        </g>

        {/* etiquetas de zona */}
        <g pointerEvents="none" opacity="0.85">
          {ZKEYS.map(k => {
            const c = zoneCentroids[k];
            return <text key={k} x={c.x} y={c.y + (k === 'sur' ? 8 : -8)} textAnchor="middle" fill={ZONES[k].color} fontSize="14" fontWeight="800" letterSpacing="4" fontFamily="'Archivo', sans-serif" style={{ paintOrder: 'stroke', stroke: 'rgba(5,7,13,.8)', strokeWidth: 3 }}>
              {ZONES[k].label.toUpperCase()}
            </text>;
          })}
        </g>

        {/* CABA glow */}
        <circle cx={capital.x * SF} cy={capital.y * SF} r={70} fill="#eab308" fillOpacity="0.12"/>
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

// Costa del Río de la Plata al este (escalada). Define el mar y el clip del continente.
function coastPath() {
  const pts = [
    [440, 0], [480, 60], [520, 120], [560, 200], [600, 300],
    [660, 380], [720, 410], [800, 470], [850, 560], [880, 700], [900, H],
  ];
  const p = pts.map(q => `${(q[0] * SF).toFixed(0)},${(q[1] * SF).toFixed(0)}`);
  return `M${p[0]} L${p.slice(1).join(' L')} L${W},${H} L0,${H} Z`;
}