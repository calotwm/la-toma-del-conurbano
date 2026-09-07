import { TERR } from '../data.js';
import { ownersCount, MISSION_DEFS } from '../engine.js';
import { Copyright } from '../components/common.jsx';

// Sorteo inicial (tipo TEG): muestra qué territorios te tocaron a vos y TU misión
// secreta. La misión de los bots queda oculta (es secreta, no la tenés que saber).
export default function Deal({ S, onStart }) {
  const human = S.players.find(p => p.human);
  const mine = human ? Object.keys(S.terr).filter(t => S.terr[t].owner === human.id && t !== 'capital') : [];
  const myMis = human && human.mission ? MISSION_DEFS[human.mission] : null;

  return (
    <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 30 }}>
      <div className="medallion" style={{ width: 54, height: 54 }}>
        <div className="medallion-in"><span className="mat" style={{ fontSize: 28 }}>style</span></div>
      </div>
      <h1 className="logo embossed" style={{ fontSize: 28 }}>SORTEO INICIAL</h1>
      <p className="tagline" style={{ maxWidth: 560, fontSize: 13 }}>
        Se repartieron {Object.keys(S.terr).length} territorios. {S.players.length} facciones en juego.
        La Capital quedó neutral bajo El Estado.
      </p>

      {/* TU carta / territorio inicial */}
      {human && (
        <div className="frame panel" style={{ width: 400, maxWidth: '92vw', padding: 14, marginTop: 6 }}>
          <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
          <span className="corner corner-bl"></span><span className="corner corner-br"></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2d3852', paddingBottom: 6 }}>
            <span className="dot" style={{ background: human.color, width: 16, height: 16, borderRadius: '50%', boxShadow: '0 0 6px ' + human.color }}/>
            <b style={{ color: human.color, fontSize: 15 }}>{human.name}</b>
            <span className="minitag" style={{ color: 'var(--celeste)', background: 'rgba(116,182,232,.15)', padding: '2px 8px' }}>VOS</span>
            <span style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>{mine.length} territorios</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '10px 0' }}>
            {mine.map(t => (
              <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: '#0d1017', border: '1px solid var(--line)', borderRadius: 5, color: 'var(--txt)' }}>
                {TERR.find(x => x.id === t)?.name}
              </span>
            ))}
          </div>

          {myMis && (
            <div style={{ fontSize: 12, background: '#160d1f', borderLeft: '3px solid var(--pink)', padding: '8px 10px', borderRadius: '0 6px 6px 0' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--celeste)', textTransform: 'uppercase', letterSpacing: 1 }}>Tu misión secreta</div>
              <b style={{ color: 'var(--pink)' }}>{myMis.name}</b><br/>
              <span style={{ color: 'var(--txt)', fontSize: 11 }}>{myMis.desc}</span>
            </div>
          )}
        </div>
      )}

      {/* Resumen de rivales: solo cuántos territorios, sin revelar misiones */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 700 }}>
        {S.players.filter(p => !p.human).map(p => {
          const n = Object.keys(S.terr).filter(t => S.terr[t].owner === p.id && t !== 'capital').length;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
              <span className="dot" style={{ background: p.color, width: 12, height: 12, borderRadius: '50%' }}/>
              <b style={{ color: p.color }}>{p.name}</b>
              <span style={{ color: 'var(--muted)', fontFamily: "'Space Mono', monospace" }}>{n} terr · misión secreta</span>
            </div>
          );
        })}
      </div>

      <button className="btn-gold btn-big" style={{ marginTop: 18 }} onClick={onStart}>
        <span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>play_arrow</span> EMPEZAR LA TOMA
      </button>
      <Copyright/>
    </div>
  );
}
