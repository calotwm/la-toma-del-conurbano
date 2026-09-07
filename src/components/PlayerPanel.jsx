import { ZONES, ZKEYS, PHRASES, pick } from '../data.js';
import {
  ownersCount, reinforceInfo, repTitleFor, playerName, emblemName, tradeValue, log, clone, MISSION_DEFS,
} from '../engine.js';
import { Sound } from '../sound.js';

// Panel izquierdo: info del jugador actual + cartas + misiones + zonas.
export default function PlayerPanel({ S, setS, curP, me, selCards, setSelCards }) {
  if (!curP) return null;
  const ownsCap = S.terr.capital.owner === curP.id;
  const n = ownersCount(S, curP.id);
  const rep = repTitleFor(n, ownsCap);
  const info = reinforceInfo(S, curP.id);
  const misDef = S.missionsOn && curP.mission ? (MISSION_DEFS[curP.mission] || null) : null;
  const canTrade = me != null && curP.id === me && S.phase === 'reinforce' && !S.busy;
  const isMyTurn = me === curP.id;

  const selected = selCards || [];
  const selCount = selected.length;
  const tradePreview = selCount >= 3 && selCount <= 5 ? tradeValue(S, me, selected.map(i => curP.hand[i])) : 0;

  return (
    <div className="panel">
      <h3>🎖️ Tu comando</h3>
      <div className="pcard2">
        <span className="dot" style={{ background: curP.color }}/>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{curP.name} {curP.human ? '(vos)' : '🤖'}</div>
          <div className="rep">{rep === 'Rey de la City' ? '👑 Rey de la City' : rep}</div>
        </div>
      </div>

      <div className="kv"><span>Territorios</span><b>{n} / 27</b></div>
      <div className="kv">
        <span>Próximo refuerzo</span>
        <b>{info.total} <span style={{ fontSize: 10, color: 'var(--dim)' }}>(1 c/u{info.comps ? ', +' + info.comps + ' grupos' : ''}{info.zones ? ', +' + info.zones * 5 + ' zonas' : ''}{info.cap ? ', +10 CABA' : ''})</span></b>
      </div>
      {S.phase === 'reinforce' && isMyTurn && (
        <div className="kv" style={{ background: '#1f2410', borderRadius: 8, padding: '4px 8px' }}>
          <span>💰 A colocar ahora</span><b style={{ color: 'var(--gold)' }}>{S.pool}</b>
        </div>
      )}

      {ownsCap
        ? <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: 'var(--gold)' }}>🏛️ CONTROLÁS LA CAPITAL: +10 por ronda (defendela con tu vida)</div>
        : <div style={{ marginTop: 6, fontSize: 12, color: 'var(--dim)' }}>🏛️ La Capital es de <b>{playerName(S, S.terr.capital.owner)}</b>. Si no es tuya, es tu objetivo.</div>}

      <div style={{ marginTop: 8 }}>
        {ZKEYS.map(k => {
          const z = ZONES[k];
          const done = z.ids.filter(t => S.terr[t].owner === curP.id).length;
          const full = done === z.ids.length;
          return (
            <div className="zonerow" key={k}>
              <span style={{ color: z.color, fontWeight: 800, width: 14 }}>{full ? '✓' : '•'}</span>
              <span style={{ width: 122, fontSize: 10.5 }}>{z.label}</span>
              <div className="zbar"><i style={{ width: (done / z.ids.length * 100) + '%', background: z.color }}/></div>
              <b style={{ fontSize: 10.5, width: 40, textAlign: 'right' }}>{done}/{z.ids.length}{full ? ' +5' : ''}</b>
            </div>
          );
        })}
      </div>

      {misDef && (
        <div className="mission">
          🎯 Misión: <b>{misDef.name}</b><br/>
          <span style={{ color: 'var(--dim)' }}>{misDef.desc}</span>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <div className="kv"><span>🃏 Cartas</span><b>{curP.hand.length}</b></div>
        {curP.hand.length
          ? <div className="cards">
              {curP.hand.map((c, i) => {
                const nm = emblemName(c.emblem);
                const sel = selected.includes(i);
                return (
                  <span key={i} className={'cardchip' + (sel ? ' sel' : '')}
                    onClick={canTrade ? () => setSelCards(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]) : null}
                    title={nm}>
                    {nm === 'La Capital' ? '🏛️' : nm === 'Quilmes' ? '🍺' : nm === 'Bragado' ? '🧉' : '📍'} {nm}
                  </span>
                );
              })}
            </div>
          : <div style={{ fontSize: 11, color: 'var(--dim)' }}>Conquistá territorios para ganar cartas (1 por turno).</div>}

        {canTrade && selCount >= 3 && (
          <div style={{ marginTop: 8 }}>
            <button className="btn small" onClick={() => {
              const s = clone(S);
              const p = s.players.find(x => x.id === me);
              const cards = selected.map(i => p.hand[i]);
              const v = tradeValue(s, me, cards);
              if (v > 0) {
                selected.slice().sort((a, b) => b - a).forEach(i => p.hand.splice(i, 1));
                s.pool += v;
                log(s, `🃏 ${p.name} canjea ${cards.length} cartas por +${v}. ${pick(PHRASES.trade)}`, 'card');
                Sound.conquest();
                setS(s);
              }
              setSelCards([]);
            }}>
              🃏 Canjear {selCount} → +{tradePreview || (selCount === 3 ? 5 : selCount === 4 ? 8 : 10)} (más bonus)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
