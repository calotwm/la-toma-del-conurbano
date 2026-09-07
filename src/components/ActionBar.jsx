import { tName, playerName } from '../engine.js';

// Barra de acciones según la fase (solo humano). Estilo filéteado.
export default function ActionBar(props) {
  const { S, sel, setSel, me, humanTurn, dn, setDn, amt, setAmt,
    onAttack, onFortify, onToFortify, onEndTurn, onAutoPlace, maxD, isCapT } = props;

  if (!humanTurn) return null;

  const lastBattleChip = () => S.lastBattle && !S.busy ? (
    <div className="outcome" style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="win-ic"><span className="mat">{S.lastBattle.conquered ? (S.lastBattle.capital ? 'emoji_events' : 'military_tech') : 'block'}</span></span>
        <div>
          <div className="outcome-title" style={{ color: S.lastBattle.conquered ? 'var(--gold-light)' : 'var(--warn)' }}>
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
      <div className="frame subhud" style={{ flexWrap: 'wrap' }}>
        <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
        <span className="corner corner-bl"></span><span className="corner corner-br"></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="bastion-ic"><span className="mat">group_add</span></div>
          <div>
            <div className="bastion-t">FASE 1 · REFUERZO</div>
            <div className="bastion-s" style={{ color: 'var(--muted)' }}>Tocá tus territorios en el mapa (1 clic = 1 tropa).</div>
          </div>
        </div>
        <div style={{ flex: 1 }}></div>
        <button className="btn-gold" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: "'Cinzel Decorative', serif", fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onAutoPlace}>
          <span className="mat" style={{ fontSize: 18 }}>bolt</span>Reparto automático
        </button>
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
          <button className="btn-dark" style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12 }} onClick={() => setSel(null)}>Quitar selección</button>
        </div>

        {sel && sel.o && sel.t && (
          <div className="dice-picker" style={{ margin: '10px 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>DADOS ATACANTE:</span>
            {opts.filter(n => n >= minD).map(n => (
              <button key={n} className={'btn-red' + (dn === n ? ' sel' : '')} onClick={() => setDn(n)}>{n}</button>
            ))}
            <div style={{ flex: 1 }}></div>
            <button className="btn-red" disabled={dn == null || dn > maxD} style={{ padding: '12px 26px', borderRadius: 10, fontFamily: "'Cinzel Decorative', serif", fontWeight: 900, fontSize: 14, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onAttack}>
              <span className="mat" style={{ fontSize: 18 }}>gps_fixed</span>¡A DARLE!
            </button>
          </div>
        )}

        {S.dice && (
          <div className="arena">
            <div className="dice-box atk">
              <div className="dice-box-hdr">
                <div className="who"><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#0284c7', boxShadow: '0 0 8px #0284c7' }}></span>Atacante</div>
                <span className="n" style={{ background: '#3a0808', color: 'var(--warn)', border: '1px solid rgba(255,107,107,.4)' }}>{S.dice.aN} DADOS</span>
              </div>
              <div className="dice-row">
                {S.dice.a.map((v, i) => <span key={i} className={'dice-slot red' + (S.busy ? ' rolling' : '')}><span className="pip">{S.busy ? '?' : v}</span>{i === 0 && !S.busy ? <span className="cap">MAYOR</span> : null}</span>)}
                {Array.from({ length: 3 - S.dice.a.length }).map((_, i) => <span key={'e' + i} className="dice-slot red empty"><span className="mat" style={{ fontSize: 20, opacity: .3 }}>block</span></span>)}
              </div>
            </div>
            <div className="dice-box def">
              <div className="dice-box-hdr">
                <div className="who"><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 8px #ff4d4d' }}></span>Defensor</div>
                <span className="n" style={{ background: '#2e2104', color: 'var(--gold-light)', border: '1px solid rgba(212,175,55,.5)' }}>{S.dice.dN} DADOS</span>
              </div>
              <div className="dice-row">
                {S.dice.d.map((v, i) => <span key={i} className={'dice-slot gold' + (S.busy ? ' rolling' : '')}><span className="pip">{S.busy ? '?' : v}</span>{i === 0 && !S.busy ? <span className="cap">EMPATA</span> : null}</span>)}
                {Array.from({ length: 2 - S.dice.d.length }).map((_, i) => <span key={'e' + i} className="dice-slot gold empty"><span className="mat" style={{ fontSize: 20, opacity: .3 }}>block</span></span>)}
              </div>
            </div>
          </div>
        )}

        {lastBattleChip()}
        <div className="btns" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn-dark" style={{ padding: '10px 16px', borderRadius: 8, fontFamily: "'Cinzel Decorative', serif", textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onToFortify}>
            <span className="mat" style={{ fontSize: 18, color: 'var(--tertiary)' }}>swap_horiz</span>Cortar ataque → reagrupar
          </button>
          <div style={{ flex: 1 }}></div>
          <button className="btn-red" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: "'Cinzel Decorative', serif", textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onEndTurn}>
            <span className="mat" style={{ fontSize: 18 }}>forward</span>Terminar turno
          </button>
        </div>
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
        <button className="btn-dark" style={{ padding: '8px 14px', borderRadius: 8 }} onClick={() => setSel(null)}>Quitar</button>
      </div>

      {sel && sel.o && sel.t && (
        <div className="dice-picker" style={{ margin: '10px 0' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>MOVER:</span>
          <button className="btn-dark" onClick={() => setAmt(Math.max(1, amt - 1))}>−</button>
          <b style={{ fontSize: 18, width: 34, textAlign: 'center', color: 'var(--gold-light)' }}>{amt}</b>
          <button className="btn-dark" onClick={() => setAmt(Math.min(maxA, amt + 1))}>+</button>
          <button className="btn-gold" disabled={amt < 1 || amt > maxA} style={{ padding: '9px 16px', borderRadius: 8, fontFamily: "'Cinzel Decorative', serif", fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onFortify}>
            <span className="mat" style={{ fontSize: 17 }}>local_shipping</span>Mover
          </button>
          <div style={{ flex: 1 }}></div>
          <button className="btn-red" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: "'Cinzel Decorative', serif", textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onEndTurn}>
            <span className="mat" style={{ fontSize: 18 }}>forward</span>Terminar turno
          </button>
        </div>
      )}

      {lastBattleChip()}
      {(!sel || !sel.o || !sel.t) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="btn-red" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: "'Cinzel Decorative', serif", textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onEndTurn}>
            <span className="mat" style={{ fontSize: 18 }}>forward</span>Terminar turno
          </button>
        </div>
      )}
    </div>
  );
}
