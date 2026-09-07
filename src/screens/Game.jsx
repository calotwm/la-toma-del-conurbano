import { useEffect, useRef, useState } from 'react';
import { PHRASES, ADJ, TIDS, pick } from '../data.js';
import {
  advanceTurn, aiPlacementPlan, aiPickAttack, aiFortifyPlan, canAttack,
  rollDice, battleResult, applyConquest, clone, log, saveGame,
  ownersCount, tName, playerName, MISSION_DEFS,
} from '../engine.js';
import { Sound } from '../sound.js';
import MapView from '../components/MapView.jsx';
import PlayerPanel from '../components/PlayerPanel.jsx';
import ActionBar from '../components/ActionBar.jsx';
import LogPanel from '../components/LogPanel.jsx';
import { Copyright } from '../components/common.jsx';

const LEVEL_LABELS = { chorro: 'Chorro (fácil)', defensa: 'Defensa (medio)', capo: 'Capo (difícil)' };
const wait = ms => new Promise(r => setTimeout(r, ms));

export default function Game({ S, setS }) {
  const [banner, setBanner] = useState(null);
  const [flash, setFlash] = useState(false);
  const [sel, setSel] = useState(null);       // {o,t}
  const [selCards, setSelCards] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [amt, setAmt] = useState(1);
  const [dn, setDn] = useState(null);

  const Sref = useRef(S); Sref.current = S;
  const flashT = useRef(null), bannerT = useRef(null);
  useEffect(() => () => { clearTimeout(flashT.current); clearTimeout(bannerT.current); }, []);

  const showBanner = (txt, small) => {
    setBanner({ txt, small: !!small });
    clearTimeout(bannerT.current);
    bannerT.current = setTimeout(() => setBanner(null), small ? 1900 : 3400);
  };
  const flashOn = () => { setFlash(true); clearTimeout(flashT.current); flashT.current = setTimeout(() => setFlash(false), 1400); };

  const curP = S.players && S.players.length ? S.players.find(p => p.id === S.order[S.tidx]) : null;
  const me = curP && curP.human ? curP.id : null;

  // autosave
  useEffect(() => { if (S.screen === 'game') saveGame(S); }, [S]);

  // fin de partida -> pantalla end
  useEffect(() => {
    if (S.winner && S.screen === 'game') {
      const id = setTimeout(() => { setS(prev => (prev.winner ? { ...prev, screen: 'end' } : prev)); }, 1500);
      return () => clearTimeout(id);
    }
  }, [S.winner, S.screen]);

  // runner de bots
  const botId = (S.screen === 'game' && !S.winner && curP && !curP.human) ? curP.id : null;
  useEffect(() => {
    if (!botId) return;
    const ctl = { c: false };
    (async () => {
      await wait(700);
      while (!ctl.c) {
        const s = Sref.current;
        const sCur = s.players.find(p => p.id === s.order[s.tidx]);
        if (s.winner || !sCur || sCur.id !== botId || sCur.human) break;
        if (s.phase === 'reinforce') {
          if (s.pool > 0) {
            const plan = aiPlacementPlan(s, botId);
            const s2 = clone(s);
            plan.forEach(id => { s2.terr[id].troops++; s2.pool--; });
            setS(s2); await wait(650);
          } else {
            const s2 = clone(Sref.current); s2.phase = 'attack';
            log(s2, `${playerName(s2, botId)} pasa a la fase de ataque.`, 'sys');
            setS(s2); await wait(350);
          }
          continue;
        }
        if (s.phase === 'attack') {
          const m = aiPickAttack(s, botId);
          if (!m) {
            const s2 = clone(Sref.current); s2.phase = 'fortify';
            setS(s2); await wait(350);
            continue;
          }
          await botBattle(botId, m.o, m.t, ctl);
          continue;
        }
        if (s.phase === 'fortify') {
          const f = aiFortifyPlan(Sref.current, botId);
          if (f) {
            const s2 = clone(Sref.current);
            const mv = Math.min(f.move, s2.terr[f.o].troops - 1);
            if (mv > 0) {
              s2.terr[f.o].troops -= mv;
              s2.terr[f.t].troops += mv;
              log(s2, `🎯 ${playerName(s2, botId)} reagrupa ${mv} tropa(s) de ${tName(f.o)} a ${tName(f.t)}.`, 'sys');
            }
            setS(s2); await wait(550);
          } else {
            await wait(300);
          }
          const s3 = clone(Sref.current);
          advanceTurn(s3);
          setS(s3);
          break;
        }
      }
    })();
    return () => { ctl.c = true; };
  }, [botId, S.gid]);

  async function botBattle(pid, o, t, ctl) {
    const s0 = Sref.current; if (ctl && ctl.c) return;
    const tt = s0.terr[t].troops, ot = s0.terr[o].troops;
    const aN = (t === 'capital') ? Math.min(3, Math.max(2, ot - 1)) : Math.min(3, ot - 1);
    if (aN < 1) return;
    if (t === 'capital' && (ot < 3 || aN < 2)) return;
    if (!canAttack(s0, pid, o, t, aN)) return;
    const dN = Math.min(2, tt);
    const aRoll = rollDice(aN), dRoll = rollDice(dN);
    setS({ ...Sref.current, busy: true, dice: { a: aRoll, d: dRoll, aN, dN } });
    if (t === 'capital') Sound.alarm(); else Sound.dice();
    if (ctl && ctl.c) return;
    await wait(1000);
    if (ctl && ctl.c) return;
    commitBattle(pid, o, t, aN, aRoll, dRoll);
  }

  async function humanBattle(o, t, aN) {
    const s0 = Sref.current;
    const ot = s0.terr[o].troops;
    let a = Math.min(aN, ot - 1);
    if (t === 'capital') { if (ot < 3) return; a = Math.min(3, a); a = Math.max(2, a); }
    if (a < 1) return;
    const dN = Math.min(2, s0.terr[t].troops);
    const aRoll = rollDice(a), dRoll = rollDice(dN);
    setS({ ...s0, busy: true, dice: { a: aRoll, d: dRoll, aN: a, dN } });
    if (t === 'capital') Sound.alarm(); else Sound.dice();
    await wait(1000);
    commitBattle(me, o, t, a, aRoll, dRoll);
  }

  function commitBattle(pid, o, t, aN, aRoll, dRoll) {
    const s = clone(Sref.current);
    const prevOwner = s.terr[t].owner;
    const res = battleResult(aRoll, dRoll);
    const { al, dl } = res;
    s.terr[o].troops -= al;
    s.terr[t].troops -= dl;
    const conquered = s.terr[t].troops <= 0;
    const isCap = (t === 'capital');
    s.busy = false; s.dice = null;

    if (conquered) {
      const capC = applyConquest(s, pid, o, t, aN, al, dl);
      s.stat[pid].bw++;
      s.lastBattle = { o, t, conquered: true, capital: capC, aRoll, dRoll, al, dl };
      if (capC) {
        flashOn(); Sound.epic();
        showBanner(prevOwner == null ? '👑 ¡MANDE! ¡LA TOMASTE, BOLUDO!' : `🏛️ ¡${playerName(s, prevOwner)} se quedó sin la joya!`, false);
      } else {
        Sound.conquest();
      }
    } else {
      s.stat[pid].bl++;
      s.lastBattle = { o, t, conquered: false, capital: isCap, aRoll, dRoll, al, dl };
      if (isCap) {
        Sound.defendCapital();
        log(s, `🛡️ ${pick(PHRASES.capDefense)} — La Capital aguanta el ataque de ${playerName(s, pid)}.`, 'capital');
      } else {
        Sound.lose();
        log(s, `💥 ${playerName(s, pid)} pierde ${al} en ${tName(o)} contra ${tName(t)}. ${pick(PHRASES.battleLose)}`, 'lose');
      }
    }

    if (s.winner) {
      const w = s.players.find(p => p.id === s.winner);
      const mk = w && s.winReason.startsWith('mission') ? MISSION_DEFS[w.mission] : null;
      Sound.mission();
      showBanner(mk ? `🏆 ¡${w.name} CUMPLIÓ SU MISIÓN: ${mk.name}!` : `🏆 ¡${w.name} DOMINÓ TODO EL CONURBANO!`, false);
      setS(s);
      return;
    }
    setS(s);
  }

  function onTerr(id) {
    const s = Sref.current;
    if (s.busy || !me) return;

    if (s.phase === 'reinforce') {
      if (s.terr[id].owner !== me || s.pool <= 0) return;
      const s2 = clone(s);
      s2.terr[id].troops++; s2.pool--;
      if (s2.pool <= 0) { s2.phase = 'attack'; log(s2, '⚔️ Refuerzos listos. ¡A atacar!', 'sys'); }
      setS(s2);
      return;
    }

    if (s.phase === 'attack') {
      const o = sel ? sel.o : null;
      if (!o) {
        if (s.terr[id].owner === me && s.terr[id].troops >= 2) { setSel({ o: id }); setDn(null); }
        return;
      }
      if (id === o) return;
      if (s.terr[id].owner === me) { setSel({ o: id }); setDn(null); return; }
      if (!ADJ_O(o, id)) return;
      const ot = s.terr[o].troops;
      if (id === 'capital' && ot < 3) return;
      const maxD = Math.min(3, ot - 1);
      const defDn = id === 'capital' ? Math.max(2, Math.min(3, maxD)) : maxD;
      setSel({ o, t: id }); setDn(defDn); setAmt(1);
      return;
    }

    if (s.phase === 'fortify') {
      const o = sel ? sel.o : null;
      if (!o) {
        if (s.terr[id].owner === me && s.terr[id].troops >= 2) { setSel({ o: id }); }
        return;
      }
      if (id === o) return;
      if (s.terr[id].owner !== me || !ADJ_O(o, id)) return;
      setSel({ o, t: id }); setAmt(1);
      return;
    }
  }

  function endHumanTurn() {
    const s = clone(Sref.current);
    if (s.busy) return;
    const nxt = advanceTurn(s);
    setS(s); setSel(null); setSelCards([]); setDn(null);
    const p = s.players.find(x => x.id === nxt);
    if (p && p.human) showBanner(`TU TURNO, ${p.name.toUpperCase()} — ¡hacelo bien!`, true);
  }

  const humanTurn = me != null && !S.busy;
  const originT = sel && sel.o ? S.terr[sel.o] : null;
  const maxD = originT ? Math.min(3, originT.troops - 1) : 1;
  const isCapT = !!(sel && sel.t === 'capital');

  return (
    <div style={{ padding: 10 }}>
      <div className="hdr">
        <div className="turnchip">RONDA {S.round}</div>
        <div className="chip">
          Turno de <b style={{ color: curP ? curP.color : '#fff' }}>{curP ? curP.name : '—'}</b>{' '}
          {curP && curP.human ? '(vos)' : curP && !curP.human ? `🤖 ${LEVEL_LABELS[curP.level]}` : ''}
        </div>
        <div className="capchip" style={{ background: '#1c1706', border: '1px solid #8a7a3a', color: 'var(--gold)' }}>
          🏛️ La Capital: <b>{playerName(S, S.terr.capital.owner)}</b> ({S.terr.capital.troops})
        </div>
        <div className="spacer"/>
        <button className="iconbtn" onClick={() => { const n = !soundOn; setSoundOn(n); Sound.toggle(); }}>{soundOn ? '🔊 Sonido' : '🔇 Mudo'}</button>
        <button className="iconbtn" onClick={() => { const n = Sound.toggleMusic(); setMusicOn(n); }}>{musicOn ? '🎵 Música on' : '🎵 Música off'}</button>
        <button className="iconbtn" onClick={() => { saveGame(S); showBanner('💾 Partida guardada', true); }}>💾 Guardar</button>
        <button className="iconbtn" onClick={() => { saveGame(S); setS(prev => ({ ...prev, screen: 'home' })); }}>🚪 Menú</button>
      </div>

      <div className="steps">
        <div className={'step ' + (S.phase !== 'reinforce' ? 'done' : 'now')}>1 · REFUERZO</div>
        <div className={'step ' + (S.phase === 'fortify' ? 'done' : (S.phase !== 'attack' ? '' : 'now'))}>2 · ATAQUE</div>
        <div className={'step ' + (S.phase === 'fortify' ? 'now' : (S.turnFlags && S.turnFlags.moved ? 'done' : ''))}>3 · REAGRUPO</div>
      </div>

      <div className="grid">
        <div className="leftcol" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PlayerPanel S={S} setS={setS} curP={curP} me={me} selCards={selCards} setSelCards={setSelCards}/>
          <div className="panel">
            <h3>👥 Elenco estable</h3>
            {S.order.map(pid => {
              const p = S.players.find(x => x.id === pid);
              const alive = ownersCount(S, pid) > 0;
              const isCur = pid === S.order[S.tidx];
              return (
                <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12, opacity: alive ? 1 : 0.35 }}>
                  <span className="dot" style={{ background: p.color }}/>{' '}
                  <span style={{ fontWeight: 800 }}>{p.name}</span>{p.human ? ' 🧑' : ' 🤖'}
                  <span style={{ marginLeft: 'auto', color: 'var(--dim)' }}>{ownersCount(S, pid)} terr.{isCur ? ' · TURNO' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="board">
            <MapView S={S} sel={sel} onTerr={onTerr}/>
          </div>
          <ActionBar
            S={S} sel={sel} setSel={setSel} me={me} humanTurn={humanTurn}
            dn={dn} setDn={setDn} amt={amt} setAmt={setAmt} maxD={maxD} isCapT={isCapT}
            onAttack={() => { if (sel && sel.t && sel.o && dn != null) humanBattle(sel.o, sel.t, dn); }}
            onFortify={() => {
              if (sel && sel.t && sel.o) {
                const s = clone(Sref.current);
                const mv = Math.min(amt, s.terr[sel.o].troops - 1);
                if (mv > 0) {
                  s.terr[sel.o].troops -= mv; s.terr[sel.t].troops += mv;
                  s.turnFlags.moved = true;
                  log(s, `🎯 ${playerName(s, me)} reagrupa ${mv} tropa(s): ${tName(sel.o)} → ${tName(sel.t)}`, 'sys');
                }
                setS(s); setSel(null);
              }
            }}
            onToFortify={() => { if (S.phase === 'attack') { const s = clone(Sref.current); s.phase = 'fortify'; setS(s); setSel(null); } }}
            onEndTurn={endHumanTurn}
            onAutoPlace={() => {
              const s = clone(Sref.current);
              if (S.phase !== 'reinforce') return;
              const own = ownersCount(s, me) ? TIDS_OWNED(s, me) : [];
              let g = 0;
              while (s.pool > 0 && own.length && g++ < 500) {
                const t = own[Math.floor(Math.random() * own.length)];
                if (!t) break;
                s.terr[t].troops++; s.pool--;
              }
              if (s.pool <= 0) { s.phase = 'attack'; log(s, '⚔️ Reparto automático listo. ¡A atacar!', 'sys'); }
              setS(s);
            }}
          />
        </div>

        <LogPanel S={S}/>
      </div>

      <div className="hint">Consejo: la General Paz es la línea de la muerte. Dueño de La Capital cobra +10 por ronda… y se la quieren afanar todos.</div>
      <Copyright/>

      <div className={'banner' + (banner ? ' show' : '') + (banner && banner.small ? ' small' : '')}>{banner ? banner.txt : ''}</div>
      <div className={'flash' + (flash ? ' on' : '')}/>
    </div>
  );
}

// helpers locales (evita repetir imports en cada handler)
function ADJ_O(a, b) { return ADJ[a] && ADJ[a].includes(b); }
function TIDS_OWNED(s, p) { return TIDS.filter(t => s.terr[t].owner === p); }
