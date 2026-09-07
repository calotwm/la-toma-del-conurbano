import { TERR } from '../data.js';
import { ownersCount, MISSION_DEFS } from '../engine.js';
import { Copyright } from '../components/common.jsx';

// Pantalla de sorteo inicial (tipo TEG): revela qué territorios le tocaron
// a cada jugador y su misión secreta antes de empezar.
export default function Deal({ S, onStart }) {
  const human = S.players.find(p => p.human);
  return (
    <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
      <div className="medallion" style={{ width: 56, height: 56 }}>
        <div className="medallion-in"><span className="mat" style={{ fontSize: 30 }}>style</span></div>
      </div>
      <h1 className="logo embossed" style={{ fontSize: 30 }}>SORTEO INICIAL</h1>
      <p className="tagline" style={{ maxWidth: 640 }}>
        Se repartieron los {Object.keys(S.terr).length} territorios del conurbano.
        {human ? <> A vos te toca <b style={{ color: human.color }}>{ownersCount(S, human.id)}</b> distritos.</> : null}{' '}
        Cada uno arranca con su misión secreta. La Capital queda neutral bajo El Estado.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {S.players.map(p => {
          const mine = Object.keys(S.terr).filter(t => S.terr[t].owner === p.id && t !== 'capital');
          const mis = MISSION_DEFS[p.mission];
          return (
            <div key={p.id} className="frame panel" style={{ width: 260, minWidth: 240, padding: 12 }}>
              <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
              <span className="corner corner-bl"></span><span className="corner corner-br"></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2d3852', paddingBottom: 6 }}>
                <span className="dot" style={{ background: p.color, width: 16, height: 16, borderRadius: '50%', boxShadow: '0 0 6px ' + p.color }}/>
                <b style={{ color: p.color }}>{p.name}</b>
                {p.human ? <span className="minitag" style={{ color: 'var(--celeste)' }}>VOS</span> : <span className="minitag" style={{ color: 'var(--muted)' }}>bot</span>}
                <span style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>{mine.length} terr</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
                {mine.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: '2px 6px', background: '#0d1017', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--txt)' }}>
                    {TERR.find(x => x.id === t)?.name}
                  </span>
                ))}
              </div>
              {mis && (
                <div style={{ fontSize: 11, background: '#0d1017', borderLeft: '3px solid var(--pink)', padding: '6px 8px', borderRadius: '0 6px 6px 0' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--celeste)', textTransform: 'uppercase', letterSpacing: 1 }}>Misión secreta</div>
                  <b style={{ color: 'var(--pink)' }}>{mis.name}</b>: {mis.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-gold btn-big" style={{ marginTop: 20 }} onClick={onStart}>
        <span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>play_arrow</span> EMPEZAR LA TOMA
      </button>
      <Copyright/>
    </div>
  );
}
