import { tName, playerName } from '../engine.js';

// Barra de acciones según la fase (solo humano). Estilo filéteado.
export default function ActionBar(props) {
  const { S, sel, setSel, me, humanTurn, dn, setDn, amt, setAmt,
    onAttack, onFortify, onToFortify, onEndTurn, onAutoPlace, onSkipReinforce, maxD, isCapT } = props;

  if (!humanTurn) return null;

  const lastBattleChip = () => S.lastBattle && !S.busy ? (
    <div className="outcome" style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="win-ic"><span className="mat">{S.lastBattle.conquered ? (S.lastBattle.capital ? 'emoji_events' : 'military_tech') : 'block'}</span></span>
        <div>
          <div className="outcome-title" style={{ color: S.lastBattle.conquered ? 'var(--celeste)' : 'var(--warn)' }}>
            {S.lastBattle.conquered ? (S.lastBattle.capital ? '¡LA CAPITAL ES TUYA!' : tName(S.lastBattle.t) + ' CONQUISTADO') : 'ASALTO RECHAZADO'}
          </div>
          <div className="outcome-body">{S.lastBattle.conquered
            ? (S.lastBattle.capital ? playerName(S, me) + ' tomó la joya: la Casa Rosada es suya' : '')
            : tName(S.lastBattle.o) + ' perdió ' + S.lastBattle.al + ' en el intento.'}</div>
        </div>
      </div>
    </div>
  ) : null;

  // ---------- REFUERZO ----------
  if (S.phase === 'reinforce') {
    return (
      <div className="frame subhud reinforce-bar">
        <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
        <span className="corner corner-bl"></span><span className="corner corner-br"></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="bastion-ic"><span className="mat">group_add</span></div>
          <div>
            <div className="bastion-t">FASE 1 · REFUERZO</div>
            <div className="bastion-s" style={{ color: 'var(--muted)' }}>Tocá tus territorios en el mapa.</div>
          </div>
        </div>
        <div style={{ flex: 1 }}></div>
        <div className="btn-fill-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn-gold reinforce-btn" onClick={onAutoPlace}>
            <span className="mat">auto_awesome</span><span className="btn-label">Auto</span>
          </button>
          <button className="btn-red reinforce-btn" onClick={onSkipReinforce}>
            <span className="mat">swords</span><span className="btn-label">Atacar</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------- ATAQUE ----------
  if (S.phase === 'attack') {
    const oT = sel && sel.o ? S.terr[sel.o] : null;
    const tT = sel && sel.t ? S.terr[sel.t] : null;
    const opts = [];
    for (let i = 1; i <= maxD; i++) opts.push(i);
    const minD = isCapT ? 2 : 1;
    return (
      <div>
        <div className="frame subhud" style={{ flexWrap: 'wrap' }}>
          <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
          <span className="corner corner-bl"></span><span className="corner corner-br"></span>
          <div className="phase-pill" style={{ borderColor: 'rgba(255,107,107,.5)' }}>
            <span className="mat" style={{ fontSize: 18, color: 'var(--warn)' }}>swords</span>
            <span className="lbl" style={{ color: 'var(--warn)' }}>FASE 2 · ATAQUE</span>
          </div>
          {!sel || !sel.o
            ? <div className="bastion-s" style={{ color: 'var(--muted)' }}>Elegí un territorio tuyo con al menos 2 tropas.</div>
            : !sel.t
              ? <div className="bastion-s" style={{ color: 'var(--muted)' }}>Desde <b style={{ color: '#fff' }}>{tName(sel.o)}</b> ({oT.troops}) — elegí un territorio lindero enemigo o neutral.</div>
              : <div className="bastion-s" style={{ color: 'var(--muted)' }}><b style={{ color: '#fff' }}>{tName(sel.o)}</b> ataca a <b style={{ color: 'var(--warn)' }}>{tName(sel.t)}</b> ({tT.troops}){sel.t === 'capital' ? ' — ¡LA JOYA!' : ''}</div>}
          <div style={{ flex: 1 }}></div>
          {sel && sel.o && sel.t && (
            <button className="btn-red tirar-subhud" disabled={dn == null || dn > maxD} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={onAttack}>
              <span className="mat" style={{ fontSize: 15 }}>casino</span><span className="btn-label">Atacar</span>
            </button>
          )}
          <button className="btn-dark" style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setSel(null)}>
            <span className="mat" style={{ fontSize: 15 }}>close</span><span className="btn-label">Quitar selección</span>
          </button>
        </div>

        <div className="action-row">
          {sel && sel.o && sel.t && (
            <div className="action-group action-group-dice">
              <span className="action-row-label">DADOS:</span>
              {opts.filter(n => n >= minD).map(n => (
                <button key={n} className={'btn-red' + (dn === n ? ' sel' : '')} onClick={() => setDn(n)}>{n}</button>
              ))}
              <button className="btn-red tirar-inline" disabled={dn == null || dn > maxD} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 12, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }} onClick={onAttack}>
                <span className="mat" style={{ fontSize: 16 }}>casino</span><span className="btn-label">TIRAR</span>
              </button>
              <span className="action-row-sep"/>
            </div>
          )}
          <div className="action-group action-group-final">
            <button className="btn-dark" style={{ padding: '10px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onToFortify}>
              <span className="mat" style={{ fontSize: 18, color: 'var(--tertiary)' }}>swap_horiz</span>
              <span className="btn-label lbl-full">Cortar ataque → reagrupar</span><span className="btn-label lbl-short">Cortar</span>
            </button>
            <button className="btn-red" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onEndTurn}>
              <span className="mat" style={{ fontSize: 18 }}>forward</span>
              <span className="btn-label lbl-full">Terminar turno</span><span className="btn-label lbl-short">Terminar</span>
            </button>
          </div>
        </div>

        {lastBattleChip()}
      </div>
    );
  }

  // ---------- REAGRUPO ----------
  const oT = sel && sel.o ? S.terr[sel.o] : null;
  const tT = sel && sel.t ? S.terr[sel.t] : null;
  const maxA = oT ? oT.troops - 1 : 0;
  return (
    <div>
      <div className="frame subhud" style={{ flexWrap: 'wrap' }}>
        <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
        <span className="corner corner-bl"></span><span className="corner corner-br"></span>
        <div className="phase-pill" style={{ borderColor: 'rgba(134,239,172,.5)' }}>
          <span className="mat" style={{ fontSize: 18, color: 'var(--ok)' }}>swap_horiz</span>
          <span className="lbl" style={{ color: 'var(--ok)' }}>FASE 3 · REAGRUPO</span>
        </div>
        {!sel || !sel.o
          ? <div className="bastion-s" style={{ color: 'var(--muted)' }}>Movés tropas entre territorios tuyos linderos (una vez). Elegí el origen (mín. 2).</div>
          : !sel.t
            ? <div className="bastion-s" style={{ color: 'var(--muted)' }}>Origen: <b style={{ color: '#fff' }}>{tName(sel.o)}</b> ({oT.troops}). Elegí destino tuyo lindero.</div>
            : <div className="bastion-s" style={{ color: 'var(--muted)' }}>{tName(sel.o)} → {tName(sel.t)}</div>}
        <div style={{ flex: 1 }}></div>
        <button className="btn-dark" style={{ padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setSel(null)}>
          <span className="mat" style={{ fontSize: 15 }}>close</span><span className="btn-label">Quitar</span>
        </button>
      </div>

      <div className="action-row">
        {sel && sel.o && sel.t && (
          <div className="action-group action-group-dice">
            <span className="action-row-label">MOVER:</span>
            <button className="btn-dark" onClick={() => setAmt(Math.max(1, amt - 1))}>−</button>
            <b style={{ fontSize: 18, width: 34, textAlign: 'center', color: 'var(--celeste)' }}>{amt}</b>
            <button className="btn-dark" onClick={() => setAmt(Math.min(maxA, amt + 1))}>+</button>
            <button className="btn-gold" disabled={amt < 1 || amt > maxA} style={{ padding: '9px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onFortify}>
              <span className="mat" style={{ fontSize: 17 }}>local_shipping</span><span className="btn-label">Mover</span>
            </button>
            <span className="action-row-sep"/>
          </div>
        )}
        <div className="action-group action-group-final">
          <button className="btn-red" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onEndTurn}>
            <span className="mat" style={{ fontSize: 18 }}>forward</span>
            <span className="btn-label lbl-full">Terminar turno</span><span className="btn-label lbl-short">Terminar</span>
          </button>
        </div>
      </div>

      {lastBattleChip()}
    </div>
  );
}
