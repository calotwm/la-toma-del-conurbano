import { ZONES, ZKEYS, PHRASES, pick } from '../data.js';
import {
  ownersCount, totalTroops, reinforceInfo, repTitleFor, playerName, emblemName, tradeValue, log, clone, MISSION_DEFS,
} from '../engine.js';
import { Sound } from '../sound.js';

const SUIT = { cañon: { icon: 'hardware', cls: 'cañon', name: 'Cañón' }, caballeria: { icon: 'military_tech', cls: 'caballeria', name: 'Caballería' }, infanteria: { icon: 'person_shield', cls: 'infanteria', name: 'Infantería' }, comodin: { icon: 'stars', cls: 'comodin', name: 'Comodín' } };
const suitFor = emblem => emblem === 'capital' ? 'comodin' : (['quilmes','bragado'].includes(emblem) ? 'comodin' : (emblem ? 'infanteria' : 'infanteria'));

export default function PlayerPanel({ S, setS, curP, me, selCards, setSelCards, onTrade }) {
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
  const repAccent = ownsCap ? '#ff4d4d' : curP.color;

  return (
    <div className="frame panel">
      <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
      <span className="corner corner-bl"></span><span className="corner corner-br"></span>

      {/* perfil */}
      <div className="panel-title">
        <span className="minitag" style={{ background: curP.color + '22', border: `1px solid ${curP.color}88`, color: curP.color }}>Facción {curP.name}</span>
        {isMyTurn ? <span className="minitag" style={{ color: 'var(--celeste)' }}>TURNO EN CURSO</span> : null}
      </div>
      <div className="crest-row">
        <div className="crest">
          <div className="crest-in">
            <span className="mat">shield_person</span>
            <div className="cinta" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 }}></div>
          </div>
          <div className="crest-rank">★</div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="crest-name">Comandante en Jefe · {curP.human ? 'humano' : 'bot ' + curP.level}</div>
          <div className="crest-title" style={{ color: repAccent }}>{rep === 'Rey de la City' ? 'Rey de la City' : rep}</div>
        </div>
      </div>

      {/* contadores */}
      <div className="counters">
        <div className="counter"><b>{n}</b><span>Municipios</span></div>
        <div className="counter blue"><b>{S.terr.capital.owner === curP.id ? 'SÍ' : 'NO'}</b><span>La Capital</span></div>
        <div className="counter red"><b>{curP.hand.length}</b><span>Naipes</span></div>
        <div className="counter green"><b>{totalTroops(S, curP.id)}</b><span>Tropas</span></div>
      </div>

      {/* misión (prominente, arriba) */}
      {misDef && (
        <div style={{ background: '#160d1f', border: '1px solid rgba(255,46,136,.4)', borderLeft: '4px solid var(--pink)', borderRadius: '0 10px 10px 0', padding: 10 }}>
          <div className="mission-op"><span className="mat" style={{ fontSize: 16, color: 'var(--warn)' }}>verified_user</span>Tu misión</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, color: '#fff', margin: '4px 0', fontWeight: 800 }}>{misDef.name}</div>
          <div className="mission-desc">{misDef.desc(S)}</div>
        </div>
      )}

      {/* próximo refuerzo (TEG: 50% de países + bonus zona/CABA) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--muted)' }}>
        <span>REFUERZO PRÓXIMO</span>
        <strong style={{ color: 'var(--celeste)' }}>{info.total}<span style={{ fontSize: 9, color: 'var(--muted)' }}> 50% ({info.base}){info.zones ? ' · +' + info.zones * 4 + ' zonas' : ''}{info.cap ? ' · +10 CABA' : ''}</span></strong>
      </div>
      {S.phase === 'reinforce' && isMyTurn && (
        <div className="bastion" style={{ borderColor: 'var(--gold-ornate)', background: 'linear-gradient(90deg,#1f2410,#121826,#1f2410)' }}>
          <div className="bastion-ic"><span className="mat">payments</span></div>
          <div style={{ flex: 1 }}>
            <div className="bastion-t" style={{ fontSize: 13 }}>A COLOCAR AHORA</div>
            <div className="bastion-s" style={{ color: 'var(--celeste)', fontWeight: 800, fontSize: 20 }}>{S.pool} tropas</div>
          </div>
          <div className="mat" style={{ fontSize: 28, color: 'var(--celeste)' }}>group_add</div>
        </div>
      )}

      {/* bastión CABA */}
      <div className="bastion">
        <div className="bastion-ic"><span className="mat">apartment</span></div>
        <div>
          <div className="bastion-t">★ Bastión Supremo: CABA</div>
          <div className="bastion-s">{ownsCap ? 'Controlás la Casa Rosada y el Obelisco' : `La Capital es de ${playerName(S, S.terr.capital.owner)}`}</div>
          <div className="bastion-b">{ownsCap ? '+10 TROPAS DE REFUERZO / RONDA — DEFENDELA' : 'SI NO ES TUYA, ES TU OBJETIVO'}</div>
        </div>
      </div>

      {/* bonus de zonas: compacto */}
      {(() => {
        const full = ZKEYS.filter(k => ZONES[k].ids.every(t => S.terr[t].owner === curP.id)).length;
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--muted)' }}>
            <span>Zonas completas</span>
            <strong style={{ color: 'var(--celeste)' }}>{full} {full > 0 ? `(+${full * 3} refuerzo)` : ''}</strong>
          </div>
        );
      })()}

      {/* naipes */}
      <div>
        <div className="panel-title">
          <h3>Mazo de Naipes</h3>
          <span className="minitag" style={{ background: '#1f1704', color: 'var(--celeste)', border: '1px solid rgba(212,175,55,.6)' }}>{curP.hand.length} EN MANO</span>
        </div>
        {curP.hand.length
          ? <div className="naipes-grid">
              {curP.hand.map((c, i) => {
                const nm = emblemName(c.emblem);
                const s = suitFor(c.emblem);
                const sel = selected.includes(i);
                return (
                  <div key={i} className={'naipe' + (sel ? ' sel' : '')}
                    onClick={canTrade ? () => setSelCards(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]) : undefined}
                    title={nm}>
                    <div className={'naipe-suit ' + s.cls}><span className="mat">{s.icon}</span></div>
                    <div className="suit-name" style={{ color: s.cls === 'cañon' ? 'var(--warn)' : s.cls === 'caballeria' ? 'var(--tertiary)' : s.cls === 'comodin' ? '#d8b4fe' : 'var(--celeste)' }}>{s.name}</div>
                    <div className="e-name">{nm}</div>
                    <div className="e-meta">{nm === 'La Capital' ? 'Comodín · ★' : nm === 'Bragado' ? 'Comodín · +2' : 'Distrito · +1'}</div>
                  </div>
                );
              })}
            </div>
          : <div style={{ fontSize: 11, color: 'var(--muted)' }}>Conquistá territorios para ganar naipes (1 por turno).</div>}

        {canTrade && selCount >= 3 && (
          <div className="trade-banner" style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--celeste)', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
              <span className="mat" style={{ fontSize: 17 }}>workspace_premium</span>Canje Habilitado
            </div>
            <button className="btn-gold" style={{ width: '100%', marginTop: 8, padding: '9px 12px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 11, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => {
              if (onTrade) { onTrade(selected); setSelCards([]); return; }
              const s = clone(S);
              const p = s.players.find(x => x.id === me);
              const cards = selected.map(i => p.hand[i]);
              const v = tradeValue(s, me, cards);
              if (v > 0) {
                selected.slice().sort((a, b) => b - a).forEach(i => p.hand.splice(i, 1));
                p.trades = (p.trades || 0) + 1;
                s.pool += v;
                log(s, `» ${p.name} canjea ${cards.length} naipes por +${v}. ${pick(PHRASES.trade)}`, 'card');
                Sound.conquest();
                setS(s);
              }
              setSelCards([]);
            }}>
              <span className="mat" style={{ fontSize: 17 }}>currency_exchange</span>
              Cobrar +{tradePreview || (tradeValue(S, me, selected.map(i => curP.hand[i])))} tropas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
