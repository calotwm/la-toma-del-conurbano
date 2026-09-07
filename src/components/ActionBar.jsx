import { tName, playerName } from '../engine.js';

// Barra central de acciones según la fase del turno (solo humano).
export default function ActionBar(props) {
  const { S, sel, setSel, me, humanTurn, dn, setDn, amt, setAmt,
    onAttack, onFortify, onToFortify, onEndTurn, onAutoPlace, maxD, isCapT } = props;

  if (!humanTurn) return null;

  const lastBattleChip = () => S.lastBattle && !S.busy ? (
    <div className="infobar" style={{ fontSize: 12, color: 'var(--dim)' }}>
      {S.lastBattle.conquered
        ? (S.lastBattle.capital ? '👑 ¡La Capital es de ' + playerName(S, S.lastBattle.attacker) + '!' : '✅ ' + tName(S.lastBattle.t) + ' conquistado.')
        : '❌ ' + tName(S.lastBattle.o) + ' perdió ' + S.lastBattle.al + '.'}
    </div>
  ) : null;

  if (S.phase === 'reinforce') {
    return (
      <div className="infobar" style={{ flexWrap: 'wrap' }}>
        <b style={{ color: 'var(--gold)' }}>FASE 1 · REFUERZO ({S.pool} para colocar)</b>
        <span style={{ color: 'var(--dim)', flex: 1, minWidth: 200 }}>Tocá tus territorios en el mapa para dejar tropas (1 clic = 1 tropa).</span>
        <button className="btn small" onClick={onAutoPlace}>⚡ Repartir automático</button>
      </div>
    );
  }

  if (S.phase === 'attack') {
    const oT = sel && sel.o ? S.terr[sel.o] : null;
    const tT = sel && sel.t ? S.terr[sel.t] : null;
    const opts = [];
    for (let i = 1; i <= maxD; i++) opts.push(i);
    const minD = isCapT ? 2 : 1;
    return (
      <div>
        <div className="infobar" style={{ flexWrap: 'wrap' }}>
          <b style={{ color: 'var(--pink)' }}>FASE 2 · ATAQUE</b>
          {!sel || !sel.o
            ? <span style={{ color: 'var(--dim)' }}>Elegí un territorio tuyo con al menos 2 tropas para atacar.</span>
            : !sel.t
              ? <span style={{ color: 'var(--dim)' }}>Desde <b style={{ color: '#fff' }}>{tName(sel.o)}</b> ({oT.troops} 🪖) — ahora elegí un territorio <b>lindero enemigo o neutral</b>.</span>
              : <span style={{ color: 'var(--dim)' }}>⚔️ <b style={{ color: '#fff' }}>{tName(sel.o)}</b> ({oT.troops}) ataca a <b style={{ color: '#ff8fa3' }}>{tName(sel.t)}</b> ({tT.troops}){sel.t === 'capital' ? ' 🏛️ ¡LA JOYA!' : ''}</span>}
          <button className="btn gray small" style={{ marginLeft: 'auto' }} onClick={() => setSel(null)}>Quitar selección</button>
        </div>

        {sel && sel.o && sel.t && (
          <div className="dice" style={{ justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>Dados atacante:</span>
            {opts.filter(n => n >= minD).map(n => (
              <button key={n} className={'btn small' + (dn === n ? ' pink' : '')} onClick={() => setDn(n)}>{n} 🎲</button>
            ))}
            <button className="btn green" style={{ fontSize: 16, padding: '10px 20px' }} disabled={dn == null || dn > maxD} onClick={onAttack}>¡A DARLE! ⚔️</button>
          </div>
        )}

        {S.dice && (
          <div className="dice" style={{ justifyContent: 'center' }}>
            <div className="dice atk" style={{ flexDirection: 'column', background: 'none', border: 'none', padding: 0 }}>
              <span style={{ fontSize: 10, color: 'var(--dim)' }}>ATACANTE</span>
              <div style={{ display: 'flex', gap: 6 }}>{S.dice.a.map((v, i) => <span key={i} className={'die' + (S.busy ? ' roll' : '')}>{S.busy ? '🎲' : v}</span>)}</div>
            </div>
            <span className="vs">VS</span>
            <div className="dice def" style={{ flexDirection: 'column', background: 'none', border: 'none', padding: 0 }}>
              <span style={{ fontSize: 10, color: 'var(--dim)' }}>DEFENSOR</span>
              <div style={{ display: 'flex', gap: 6 }}>{S.dice.d.map((v, i) => <span key={i} className={'die' + (S.busy ? ' roll' : '')}>{S.busy ? '🎲' : v}</span>)}</div>
            </div>
          </div>
        )}

        {lastBattleChip()}
        <div className="actions">
          <button className="btn gray" onClick={onToFortify}>🛡️ Cortar ataque → reagrupar</button>
          <button className="btn pink" style={{ marginLeft: 'auto' }} onClick={onEndTurn}>Terminar turno</button>
        </div>
      </div>
    );
  }

  // fortify
  const oT = sel && sel.o ? S.terr[sel.o] : null;
  const tT = sel && sel.t ? S.terr[sel.t] : null;
  const maxA = oT ? oT.troops - 1 : 0;
  return (
    <div>
      <div className="infobar" style={{ flexWrap: 'wrap' }}>
        <b style={{ color: '#7fe03a' }}>FASE 3 · REAGRUPO</b>
        {!sel || !sel.o
          ? <span style={{ color: 'var(--dim)' }}>Movés tropas entre territorios tuyos linderos (una sola vez). Elegí el origen (mín. 2).</span>
          : !sel.t
            ? <span style={{ color: 'var(--dim)' }}>Origen: <b>{tName(sel.o)}</b> ({oT.troops}). Elegí un territorio tuyo lindero como destino.</span>
            : <span style={{ color: 'var(--dim)' }}>{tName(sel.o)} → {tName(sel.t)}</span>}
        <button className="btn gray small" style={{ marginLeft: 'auto' }} onClick={() => setSel(null)}>Quitar</button>
      </div>

      {sel && sel.o && sel.t && (
        <div className="actions" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Mover:</span>
          <button className="btn small gray" onClick={() => setAmt(Math.max(1, amt - 1))}>−</button>
          <b style={{ fontSize: 16, width: 30, textAlign: 'center' }}>{amt}</b>
          <button className="btn small gray" onClick={() => setAmt(Math.min(maxA, amt + 1))}>+</button>
          <button className="btn green" disabled={amt < 1 || amt > maxA} onClick={onFortify}>Mover 🚚</button>
        </div>
      )}

      {lastBattleChip()}
      <div className="actions">
        {(!sel || !sel.o || !sel.t) && <span className="hint" style={{ margin: 0, alignSelf: 'center' }}>Sin mover no pasa nada: podés cerrar el turno igual.</span>}
        <button className="btn pink" style={{ marginLeft: 'auto' }} onClick={onEndTurn}>Terminar turno →</button>
      </div>
    </div>
  );
}
