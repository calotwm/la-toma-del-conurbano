import { TIDS, pick } from '../data.js';
import { ownersCount, MISSION_DEFS } from '../engine.js';
import { Copyright } from '../components/common.jsx';

export default function EndScreen({ S, onAgain, onHome }) {
  const w = S.players.find(p => p.id === S.winner);
  const sorted = [...S.players].sort((a, b) => ownersCount(S, b.id) - ownersCount(S, a.id));
  const total = TIDS.length;
  const mkName = w && S.winReason.startsWith('mission') ? MISSION_DEFS[w.mission].name : null;

  return (
    <div className="screen">
      <div className="medallion" style={{ width: 84, height: 84 }}>
        <div className="medallion-in"><span className="mat" style={{ fontSize: 46, color: 'var(--celeste)' }}>emoji_events</span></div>
      </div>
      <h1 className="logo embossed" style={{ fontSize: 40 }}>
        {mkName ? 'MISIÓN CUMPLIDA' : '¡TERRITORIO CONQUISTADO!'}
        <small style={{ display: 'block', fontSize: 14, letterSpacing: 4 }}>ganó {w ? w.name : ''}</small>
      </h1>
      <p className="tagline">
        {mkName
          ? `${w.name} cumplió la misión "${mkName}" y se quedó con el conurbano.`
          : 'Dominó TODO el Gran Buenos Aires, de Tigre a Almirante Brown.'}{' '}
        {pick(['El que no corre, vuela.', 'Fin de la joda, pa.', 'Se armó la podrida y la ganó el mejor.'])}
      </p>

      <div className="stats">
        {sorted.map(p => {
          const n = ownersCount(S, p.id);
          const st = S.stat[p.id] || { conq: 0, capConq: 0, bw: 0, bl: 0 };
          return (
            <div className="statcard frame" key={p.id} style={{ borderColor: p.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span className="dot" style={{ background: p.color, width: 16, height: 16, borderRadius: '50%', boxShadow: '0 0 8px ' + p.color }}/>{p.name}{p.human ? '' : ' (bot)'}
              </div>
              <b style={{ color: p.color }}>{n}</b><div>territorios</div>
              <div style={{ fontSize: 11, marginTop: 6, color: 'var(--muted)' }}>{st.conq} conquistas · {st.capConq} CABA · {st.bw}V/{st.bl}D</div>
            </div>
          );
        })}
      </div>

      <div className="grad">
        {sorted.map(p => {
          const n = ownersCount(S, p.id);
          return <i key={p.id} style={{ width: (n / total * 100) + '%', background: p.color }}/>;
        })}
      </div>

      <div className="btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-gold btn-big" onClick={onAgain}><span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>replay</span> REVANCHA (mismos pibes)</button>
        <button className="btn-ghost btn-big" onClick={onHome}><span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>home</span> Menú principal</button>
      </div>
      <Copyright/>
    </div>
  );
}
