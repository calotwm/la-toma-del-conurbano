import { useState } from 'react';
import { TERR } from '../data.js';
import { ownersCount, MISSION_DEFS, rollDice } from '../engine.js';
import { Copyright } from '../components/common.jsx';
import { Sound } from '../sound.js';

// Sorteo inicial (tipo TEG): 1) tiro de dados para definir quién arranca (el más alto),
// 2) muestra qué territorios te tocaron a vos y TU misión secreta (la del bot queda oculta).
export default function Deal({ S, setS }) {
  const human = S.players.find(p => p.human);
  const [rolls, setRolls] = useState({});          // playerId -> valor final del dado
  const [rolling, setRolling] = useState(false);
  const [rollingPlayer, setRollingPlayer] = useState(null); // quién está rodando (animación)

  const rolledAll = S.players.every(p => rolls[p.id] != null);

  // ordenar por dado más alto (desempate: orden original de S.order)
  const sortedByDice = rolledAll
    ? [...S.order].sort((a, b) => (rolls[b] - rolls[a]) || (S.order.indexOf(a) - S.order.indexOf(b)))
    : [];

  const rollOne = (pid) => {
    if (rolling || rolls[pid] != null) return;
    setRolling(true); setRollingPlayer(pid);
    Sound.dice();
    // el dado gira (sin fijar número) y recién al final muestra el valor
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i >= 7) {
        clearInterval(iv);
        setRolls(prev => ({ ...prev, [pid]: rollDice(1)[0] }));
        setRolling(false); setRollingPlayer(null);
      }
    }, 90);
  };

  const tirarHumano = () => { if (human) rollOne(human.id); };

  // los bots tiran automáticamente, uno por vez
  const botStillToRoll = S.players.filter(p => !p.human && rolls[p.id] == null && !rolling);
  if (botStillToRoll.length && !rolling && !rolledAll) {
    setTimeout(() => rollOne(botStillToRoll[0].id), 300);
  }

  const empezar = () => {
    // reordenar por dado y pasar al juego
    setS(prev => ({ ...prev, order: sortedByDice, screen: 'game', tidx: 0 }));
  };

  const mine = human ? Object.keys(S.terr).filter(t => S.terr[t].owner === human.id && t !== 'capital') : [];
  const myMis = human && human.mission ? MISSION_DEFS[human.mission] : null;

  return (
    <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 30 }}>
      <div className="medallion" style={{ width: 54, height: 54 }}>
        <div className="medallion-in"><span className="mat" style={{ fontSize: 28 }}>style</span></div>
      </div>
      <h1 className="logo embossed" style={{ fontSize: 26 }}>SORTEO INICIAL</h1>
      <p className="tagline" style={{ maxWidth: 560, fontSize: 13 }}>
        {Object.keys(S.terr).length} territorios repartidos. Primero, cada uno tira un dado:
        el número más alto arranca la partida.
      </p>

      {/* TIRO DE DADOS PARA ARRANCAR */}
      <div className="frame panel" style={{ width: 460, maxWidth: '94vw', padding: 14 }}>
        <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
        <span className="corner corner-bl"></span><span className="corner corner-br"></span>
        <div className="panel-title"><h3>¿Quién arranca?</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {S.players.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: '#0d1017', border: '1px solid var(--line)', borderRadius: 8 }}>
              <span className="dot" style={{ background: p.color, width: 14, height: 14, borderRadius: '50%', boxShadow: '0 0 6px ' + p.color }}/>
              <b style={{ color: p.color, fontSize: 13 }}>{p.name}</b>
              {p.human ? <span className="minitag" style={{ color: 'var(--celeste)' }}>VOS</span> : <span className="minitag" style={{ color: 'var(--muted)' }}>bot</span>}
              <div style={{ flex: 1 }}></div>
              {rollingPlayer === p.id
                ? <span className="deal-die" style={{ fontWeight: 900, fontSize: 24 }}>?</span>
                : rolls[p.id] != null
                  ? <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 26, color: 'var(--celeste)' }}>{rolls[p.id]}</span>
                  : p.human
                    ? <button className="btn-gold" style={{ padding: '8px 14px', borderRadius: 8, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }} onClick={tirarHumano} disabled={rolling}>
                        <span className="mat" style={{ fontSize: 18 }}>casino</span>TIRAR
                      </button>
                    : <span style={{ color: 'var(--muted)', fontFamily: "'Space Mono', monospace", fontSize: 12 }}>{rolling ? 'tirando...' : '...'}</span>}
            </div>
          ))}
        </div>
        {rolledAll && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(234,179,8,.12)', border: '1px solid var(--celeste)', borderRadius: 8 }}>
            <b style={{ color: 'var(--celeste)' }}>Arranca {S.players.find(p => p.id === sortedByDice[0])?.name}</b>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}> con {rolls[sortedByDice[0]]} 🎲</span>
          </div>
        )}
      </div>

      {/* TU carta inicial */}
      {human && (
        <div className="frame panel" style={{ width: 460, maxWidth: '94vw', padding: 14, marginTop: 6 }}>
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

      <button className="btn-gold btn-big" style={{ marginTop: 16 }} disabled={!rolledAll} onClick={empezar}>
        <span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>play_arrow</span> EMPEZAR LA TOMA
      </button>
      <Copyright/>
    </div>
  );
}