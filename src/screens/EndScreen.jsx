import { TIDS, pick } from '../data.js';
import { ownersCount, MISSION_DEFS } from '../engine.js';
import { Copyright } from '../components/common.jsx';

export default function EndScreen({ S, onAgain, onHome }) {
  const w = S.players.find(p => p.id === S.winner);
  const sorted = [...S.players].sort((a, b) => ownersCount(S, b.id) - ownersCount(S, a.id));
  const total = TIDS.length;
  const mkName = w && S.winReason.startsWith('mission') ? MISSION_DEFS[w.mission].name : null;

  return (
    <div className="end">
      <div className="crown">👑</div>
      <h1 className="logo" style={{ fontSize: 40 }}>
        {mkName ? 'MISIÓN CUMPLIDA' : '¡TERRITORIO CONQUISTADO!'}
        <small>ganó {w ? w.name : ''}</small>
      </h1>
      <div className="tag">
        {mkName
          ? `${w.name} cumplió la misión "${mkName}" y se quedó con el conurbano.`
          : 'Dominó TODO el Gran Buenos Aires, de Tigre a Almirante Brown.'}{' '}
        {pick(['El que no corre, vuela.', 'Fin de la joda, pa.', 'Se armó la podrida y la ganó el mejor.'])}
      </div>

      <div className="statbar">
        {sorted.map(p => {
          const n = ownersCount(S, p.id);
          const st = S.stat[p.id] || { conq: 0, capConq: 0, bw: 0, bl: 0 };
          return (
            <div className="statcard" key={p.id} style={{ borderColor: p.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <span className="dot" style={{ background: p.color }}/>{p.name}{p.human ? ' 🧑' : ' 🤖'}
              </div>
              <b style={{ color: p.color }}>{n}</b><div>territorios</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>⚔️ {st.conq} conquistas · 👑 {st.capConq} CABA<br/>✅ {st.bw} / ❌ {st.bl} batallas</div>
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

      <div className="btns">
        <button className="btn-big" onClick={onAgain}>🔄 REVANCHA (mismos pibes)</button>
        <button className="btn-ghost" onClick={onHome}>Menú principal</button>
      </div>
      <Copyright/>
    </div>
  );
}
