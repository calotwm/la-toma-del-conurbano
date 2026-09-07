import { TERR, ADJ, ADJ_PAIRS, CX, CY } from '../data.js';
import { playerColor, playerName } from '../engine.js';

// Mapa SVG estilizado del Conurbano con La Capital en el centro.
export default function MapView({ S, sel, onTerr }) {
  const phase = S.phase;
  const cur = S.players.find(p => p.id === S.order[S.tidx]);
  const me = cur && cur.human ? cur.id : null;
  const myTurn = me != null && !S.busy;

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

  return (
    <svg viewBox="0 0 1260 950" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="capGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#3a3320"/>
          <stop offset="70%" stopColor="#241f12"/>
          <stop offset="100%" stopColor="#14120a"/>
        </radialGradient>
      </defs>

      {/* decoraciones */}
      <text className="river" x="1175" y="75" textAnchor="middle" fontSize="15">RÍO DE LA PLATA 🌊</text>
      <text className="deco" x="70" y="52" fontSize="16">AGUANTE EL CONURBANO</text>
      <text className="deco" x="1178" y="860" fontSize="15" transform="rotate(-6 1178 860)">JODA PESADA</text>
      <text className="deco" x="620" y="945" fontSize="14">LA TOMA ES DE TODOS… PERO GANA UNO</text>

      {/* anillo General Paz */}
      <circle className="ring-gp" cx={CX} cy={CY} r={214}/>
      <text x={CX} y={CY - 182} textAnchor="middle" fill="#f2c94c" fontSize="11" opacity=".5" fontStyle="italic">— GENERAL PAZ: LA FRONTERA —</text>

      {/* conexiones */}
      {ADJ_PAIRS.map((p, ix) => {
        const a = TERR.find(t => t.id === p[0]), b = TERR.find(t => t.id === p[1]);
        return <line key={ix} className="borderline" x1={a.x} y1={a.y} x2={b.x} y2={b.y} opacity=".5"/>;
      })}

      {/* territorios */}
      {TERR.map(t => {
        const tt = S.terr[t.id];
        const owner = tt.owner;
        const col = owner == null ? '#2a3145' : playerColor(S, owner);
        const dimm = dim(t.id) ? 1 : 0;
        const cand = isCandidate(t.id);
        const isSel = sel && sel.o === t.id;
        return (
          <g key={t.id} opacity={dimm ? 0.32 : 1} style={{ cursor: dim(t.id) ? 'not-allowed' : 'pointer' }} onClick={() => onTerr(t.id)}>
            {t.special && <circle className="cap-glow" cx={t.x} cy={t.y} r={t.r + 14} fill="none" stroke={owner == null ? '#ffd23f' : '#fff'} strokeWidth="1.5"/>}
            {t.special
              ? <circle cx={t.x} cy={t.y} r={t.r} fill="url(#capGrad)" stroke={owner == null ? '#8a7a3a' : col} strokeWidth={owner == null ? 2 : 5}/>
              : <circle className="terr" cx={t.x} cy={t.y} r={t.r} fill={col} stroke="#0a0c12" strokeWidth="2"/>
            }
            {!t.special && owner == null && <circle cx={t.x} cy={t.y} r={t.r} fill="none" stroke="#5c6880" strokeWidth="1.5" strokeDasharray="4 4"/>}
            {isSel && <circle className="sel-ring" cx={t.x} cy={t.y} r={t.r + 8}/>}
            {cand && <circle className="cand" cx={t.x} cy={t.y} r={t.r + 9}/>}
            {t.special
              ? <text className="node-emoji" x={t.x} y={t.y - 30} fontSize="40">🏛️</text>
              : <text className="node-emoji" x={t.x} y={t.y - 2} fontSize={t.big ? 26 : 22}>{t.emoji}</text>}
            {t.special
              ? <text className="cap-label" x={t.x} y={t.y + 18}>LA CAPITAL</text>
              : <text className="node-count" x={t.x} y={t.y + 24} fontSize={t.big ? 22 : 19}>{tt.troops}</text>}
            {t.special && <text className="node-count" x={t.x} y={t.y + 52} fontSize={t.big ? 22 : 19}>{tt.troops}</text>}
            {!t.special && <text className="node-label" x={t.x} y={t.y + t.r + 16} textAnchor="middle">{t.name}</text>}
            {t.special && <text x={t.x} y={t.y + t.r + 30} textAnchor="middle" fontSize="12" fontWeight="800" fill={owner == null ? '#b9a24a' : '#fff'} style={{ paintOrder: 'stroke', stroke: '#0a0c12', strokeWidth: 3 }}>{owner == null ? 'EL ESTADO' : playerName(S, owner)}</text>}
          </g>
        );
      })}
    </svg>
  );
}
