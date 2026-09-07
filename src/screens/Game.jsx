import { useCallback, useEffect, useRef, useState } from 'react';
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

const LEVEL_LABELS = { chorro: 'Chorro (fácil)', defensa: 'Tibio (medio)', capo: 'Capo (difícil)' };
const wait = ms => new Promise(r => setTimeout(r, ms));

const TICKER = [
  ['[ALERTA TÁCTICA]', 'var(--warn)'], ['Movilización masiva en Puente Pueyrredón', null],
  ['[CABA]', 'var(--tertiary)'], ['Cacerolazo estruendoso en Recoleta por suba de peajes', null],
  ['[COMBATE]', 'var(--celeste)'], ['¡La Matanza profunda en pie de guerra! 11 divisiones sobre la Ruta 3', null],
  ['[ZONA NORTE]', 'var(--tertiary)'], ['San Isidro blinda el cruce de Panamericana', null],
  ['[SUR]', 'var(--warn)'], ['Furia en Quilmes Centro: se rompió el acuerdo del polo cervecero', null],
  ['[CLIMA]', 'var(--celeste)'], ['Niebla espesa en el Delta del Tigre, lanchas en alerta', null],
];

export default function Game({ S, setS }) {
  const [banner, setBanner] = useState(null);
  const [flash, setFlash] = useState(false);
  const [sel, setSel] = useState(null);       // {o,t}
  const [selCards, setSelCards] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [amt, setAmt] = useState(1);
  const [dn, setDn] = useState(null);
  const [battle, setBattle] = useState(null);   // {o, t, atkId, defId} — ataque visible en el mapa
  const [mobileTab, setMobileTab] = useState('actions'); // pestaña móvil: actions|you|log (el mapa siempre visible arriba)

  const Sref = useRef(S); Sref.current = S;
  const flashT = useRef(null), bannerT = useRef(null);
  useEffect(() => () => { clearTimeout(flashT.current); clearTimeout(bannerT.current); }, []);

  const showBanner = (txt, small, short) => {
    setBanner({ txt, small: !!small });
    clearTimeout(bannerT.current);
    const dur = short ? 1400 : (small ? 1900 : 3400);
    bannerT.current = setTimeout(() => setBanner(null), dur);
  };
  const flashOn = () => { setFlash(true); clearTimeout(flashT.current); flashT.current = setTimeout(() => setFlash(false), 1400); };

  const curP = S.players && S.players.length ? S.players.find(p => p.id === S.order[S.tidx]) : null;
  const me = curP && curP.human ? curP.id : null;

  // autosave
  useEffect(() => { if (S.screen === 'game') saveGame(S); }, [S]);

  // watchdog: si busy queda atrapado en true sin dados en curso, resetealo (evita que te "congele" y no te deje atacar)
  useEffect(() => {
    if (S.busy && !S.dice) {
      const t = setTimeout(() => setS(prev => (prev.busy && !prev.dice ? { ...prev, busy: false } : prev)), 1500);
      return () => clearTimeout(t);
    }
  }, [S.busy, S.dice]);

  // fin de partida -> pantalla end
  useEffect(() => {
    if (S.winner && S.screen === 'game') {
      const id = setTimeout(() => { setS(prev => (prev.winner ? { ...prev, screen: 'end' } : prev)); }, 1500);
      return () => clearTimeout(id);
    }
  }, [S.winner, S.screen]);

  // limpiar el overlay de batalla al cambiar de turno o fase (evita overlay viejo)
  useEffect(() => { setBattle(null); }, [S.tidx, S.phase]);

  // runner de bots
  const botId = (S.screen === 'game' && !S.winner && curP && !curP.human) ? curP.id : null;
  useEffect(() => {
    if (!botId) return;
    const ctl = { c: false };
    (async () => {
      await wait(700);
      let atkCount = 0;
      while (!ctl.c) {
        const s = Sref.current;
        const sCur = s.players.find(p => p.id === s.order[s.tidx]);
        if (s.winner || !sCur || sCur.id !== botId || sCur.human) break;
        if (s.phase === 'reinforce') {
          if (s.pool > 0) {
            const plan = aiPlacementPlan(s, botId);
            const s2 = clone(s);
            plan.forEach(id => { s2.terr[id].troops++; s2.pool--; });
            setS(s2); await wait(500);
          } else {
            const s2 = clone(Sref.current); s2.phase = 'attack';
            setS(s2); await wait(300);
          }
          continue;
        }
        if (s.phase === 'attack') {
          if (atkCount >= 8) { // límite de ataques por turno para no trabarse visualmente
            const s2 = clone(Sref.current); s2.phase = 'fortify';
            setS(s2); await wait(300);
            continue;
          }
          const m = aiPickAttack(s, botId);
          if (!m) {
            const s2 = clone(Sref.current); s2.phase = 'fortify';
            setS(s2); await wait(300);
            continue;
          }
          atkCount++;
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
              log(s2, `» ${playerName(s2, botId)} reagrupa ${mv} tropa(s) de ${tName(f.o)} a ${tName(f.t)}.`, 'sys');
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

  // Animación de dados: muestra los dados "rodando" (valores aleatorios cambiantes)
  // durante ~1.2s y luego fija el resultado. Devuelve el resultado fijo.
  async function animateDice(aN, dN, onCap, ctl, o, t, atkId) {
    const dur = 1200;
    const aRoll = rollDice(aN), dRoll = rollDice(dN);
    // muestra el ataque en el mapa (origen ataca a destino)
    const defId = Sref.current.terr[t].owner;
    setBattle({ o, t, atkId, defId });
    setS({ ...Sref.current, busy: true, dice: { a: Array(aN).fill('?'), d: Array(dN).fill('?'), aN, dN, rolling: true } });
    if (onCap) Sound.alarm(); else Sound.dice();
    for (let i = 0; i < dur / 80; i++) {
      if (ctl && ctl.c) return null;
      const tempA = rollDice(aN), tempD = rollDice(dN);
      setS({ ...Sref.current, busy: true, dice: { a: tempA, d: tempD, aN, dN, rolling: true } });
      await wait(80);
    }
    if (ctl && ctl.c) return null;
    setS({ ...Sref.current, busy: true, dice: { a: aRoll, d: dRoll, aN, dN, rolling: false } });
    await wait(500);
    if (ctl && ctl.c) return null;
    return { aRoll, dRoll };
  }

  async function botBattle(pid, o, t, ctl) {
    const s0 = Sref.current; if (ctl && ctl.c) return;
    const tt = s0.terr[t].troops, ot = s0.terr[o].troops;
    const aN = (t === 'capital') ? Math.min(3, Math.max(2, ot - 1)) : Math.min(3, ot - 1);
    if (aN < 1) return;
    if (t === 'capital' && (ot < 3 || aN < 2)) return;
    if (!canAttack(s0, pid, o, t, aN)) return;
    const dN = Math.min(3, tt);
    const res = await animateDice(aN, dN, t === 'capital', ctl, o, t, pid);
    if (!res) return;
    commitBattle(pid, o, t, aN, res.aRoll, res.dRoll);
  }

  async function humanBattle(o, t, aN) {
    const s0 = Sref.current;
    const ot = s0.terr[o].troops;
    let a = Math.min(aN, ot - 1);
    if (t === 'capital') { if (ot < 3) return; a = Math.min(3, a); a = Math.max(2, a); }
    if (a < 1) return;
    const dN = Math.min(3, s0.terr[t].troops);
    const res = await animateDice(a, dN, t === 'capital', null, o, t, me);
    if (!res) return;
    commitBattle(me, o, t, a, res.aRoll, res.dRoll);
  }

  function commitBattle(pid, o, t, aN, aRoll, dRoll) {
    setBattle(null);
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
        showBanner(prevOwner == null ? pick(PHRASES.capitalWin) : pick(PHRASES.capitalLose) + ' — ' + playerName(s, prevOwner), false);
      } else {
        Sound.conquest();
        // Cartel de conquista SOLO para el humano (1 a la vez); el bot solo al log
        if (s.players.find(p => p.id === pid).human) {
          showBanner(`${tName(t)} ES TUYO. ${pick(PHRASES.territoryWin)}`, false, true);
        }
      }
    } else {
      s.stat[pid].bl++;
      s.lastBattle = { o, t, conquered: false, capital: isCap, aRoll, dRoll, al, dl };
      if (isCap) {
        Sound.defendCapital();
        if (s.players.find(p => p.id === pid).human) showBanner(pick(PHRASES.capDefense), false);
        log(s, `» ${pick(PHRASES.capDefense)} — La Capital aguanta el ataque de ${playerName(s, pid)}.`, 'capital');
      } else {
        Sound.lose();
        // Cartel de derrota SOLO para el humano
        if (s.players.find(p => p.id === pid).human) showBanner(pick(PHRASES.battleLose), false, true);
        log(s, `» ${playerName(s, pid)} pierde ${al} en ${tName(o)} contra ${tName(t)}. ${pick(PHRASES.battleLose)}`, 'lose');
      }
    }

    if (s.winner) {
      const w = s.players.find(p => p.id === s.winner);
      const mk = w && s.winReason.startsWith('mission') ? MISSION_DEFS[w.mission] : null;
      Sound.mission();
      showBanner(mk ? `¡${w.name} CUMPLIÓ SU MISIÓN: ${mk.name}!` : `¡${w.name} DOMINÓ TODO EL CONURBANO!`, false);
      setS(s);
      return;
    }
    setS(s);
  }

  function onTerr(id) {
    const s = Sref.current;
    if (!me) return;
    // el refuerzo nunca se bloquea por busy (evita que se "trabe" sumando tropas)
    if (s.busy && s.phase !== 'reinforce') return;

    if (s.phase === 'reinforce') {
      if (s.terr[id].owner !== me || s.pool <= 0) return;
      const s2 = clone(s);
      s2.busy = false; // asegura que no quede bloqueado por una batalla previa
      s2.terr[id].troops++; s2.pool--;
      if (s2.pool <= 0) { s2.phase = 'attack'; log(s2, '» Refuerzos listos. ¡A atacar!', 'sys'); }
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
    <div className="game-shell">
      {/* ======= HEADER FILETEADO ======= */}
      <header className="hdr">
        <div className="gold-bar"/>
        <div className="hdr-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="medallion">
              <div className="medallion-in">
                <span className="mat">wb_sunny</span>
                <div className="cinta" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="logo-title embossed">LA TOMA DEL CONURBANO</h1>
                <span className="tag-edicion">Edición Beligerante</span>
              </div>
              <p className="logo-sub">Tácticas y Estrategias del Gran Buenos Aires · 1ra Sección Táctica Electoral</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="turn-crest">
              <span className="turn-dot"></span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--celeste)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>RONDA {S.round}</div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: 11, color: '#c4d0e5' }}>Turno de <b style={{ color: curP ? curP.color : '#fff' }}>{curP ? curP.name : '—'}</b>{curP && curP.human ? ' (vos)' : curP && !curP.human ? ` · ${LEVEL_LABELS[curP.level]}` : ''}</div>
              </div>
            </div>

            <div className="hdr-util">
              <button className={soundOn ? 'on' : ''} title="Sonido" onClick={() => { const n = !soundOn; setSoundOn(n); Sound.toggle(); }}><span className="mat">{soundOn ? 'volume_up' : 'volume_off'}</span></button>
              <button className={musicOn ? 'on' : ''} title="Música" onClick={() => { const n = Sound.toggleMusic(); setMusicOn(n); }}><span className="mat">music_note</span></button>
              <button title="Guardar" onClick={() => { saveGame(S); showBanner('Partida guardada', true); }}><span className="mat">save</span></button>
              <button title="Menú" onClick={() => { saveGame(S); setS(prev => ({ ...prev, screen: 'home' })); }}><span className="mat">exit_to_app</span></button>
            </div>
          </div>
        </div>

        {/* Ticker de radio */}
        <div className="ticker-bar">
          <div className="ticker-label"><span className="live"></span><span className="mat" style={{ fontSize: 14, color: 'var(--warn)' }}>campaign</span>RADIO TÁCTICA</div>
          <div className="ticker-scroll">
            <div className="ticker-track">
              {TICKER.map(([t, c], i) => <span key={i} style={{ color: c || 'var(--gold-ornate)', fontWeight: c ? 800 : 400, marginRight: 8 }}>{t}</span>)}
            </div>
          </div>
        </div>
      </header>

      <main className="game">
        {/* Layout 3 columnas: jugador | mapa | acciones+log */}
        <div className="game-fit">
          <div className={'col panel-you' + (mobileTab === 'you' ? ' show' : '')}>
            <PlayerPanel S={S} setS={setS} curP={curP} me={me} selCards={selCards} setSelCards={setSelCards}/>
            <div className="frame panel" style={{ flex: 1, minHeight: 0 }}>
              <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
              <span className="corner corner-bl"></span><span className="corner corner-br"></span>
              <div className="panel-title"><h3>Elenco de facciones</h3></div>
              {S.order.map(pid => {
                const p = S.players.find(x => x.id === pid);
                const alive = ownersCount(S, pid) > 0;
                const isCur = pid === S.order[S.tidx];
                return (
                  <div key={pid} className="rival" style={{ opacity: alive ? 1 : 0.35 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="dot" style={{ background: p.color, color: p.color }}></span>
                      <span className="rival-name">{p.name}</span>
                      {p.human ? <span className="mat" style={{ fontSize: 14, color: 'var(--muted)' }}>person</span> : <span className="mat" style={{ fontSize: 14, color: 'var(--muted)' }}>smart_toy</span>}
                    </div>
                    <span className="rival-troops" style={{ color: p.color }}>{ownersCount(S, pid)} <span style={{ fontSize: 9, color: 'var(--muted)' }}>terr{isCur ? ' · TURNO' : ''}</span></span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col map-wrap">
            <div className="frame map-frame map-fit">
              <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
              <span className="corner corner-bl"></span><span className="corner corner-br"></span>
              <div className="map-ribbon">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mat" style={{ fontSize: 18, color: 'var(--celeste)' }}>radar</span>
                  <h3>Cartografía Estratégica AMBA</h3>
                  <span className="scale">· 29 distritos</span>
                </div>
                <div className="map-tools">
                  <button onClick={() => showBanner('CABA: la joya del conurbano, +10 de refuerzo', true)}><span className="mat" style={{ fontSize: 17 }}>filter_center_focus</span></button>
                </div>
              </div>
              <div className="map-viewport">
                <MapView S={S} sel={sel} battle={battle} onTerr={onTerr}/>
              </div>
            </div>
          </div>

          <div className={'col col-right panel-actions' + (mobileTab === 'actions' ? ' show' : '')}>
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
                    log(s, `» ${playerName(s, me)} reagrupa ${mv} tropa(s): ${tName(sel.o)} → ${tName(sel.t)}`, 'sys');
                  }
                  setS(s); setSel(null);
                }
              }}
              onToFortify={() => { if (S.phase === 'attack') { const s = clone(Sref.current); s.phase = 'fortify'; setS(s); setSel(null); } }}
onEndTurn={endHumanTurn}
            onAutoPlace={() => {
                const s = clone(Sref.current);
                if (S.phase !== 'reinforce') return;
                s.busy = false;
                const own = ownersCount(s, me) ? TIDS_OWNED(s, me) : [];
                let g = 0;
                while (s.pool > 0 && own.length && g++ < 500) {
                  const t = own[Math.floor(Math.random() * own.length)];
                  if (!t) break;
                  s.terr[t].troops++; s.pool--;
                }
                if (s.pool <= 0) { s.phase = 'attack'; log(s, '» Reparto automático listo. ¡A atacar!', 'sys'); }
                setS(s);
              }}
            onSkipReinforce={() => {
                // reparte el pool restante y pasa a atacar
                const s = clone(Sref.current);
                if (S.phase !== 'reinforce') return;
                s.busy = false;
                const own = ownersCount(s, me) ? TIDS_OWNED(s, me) : [];
                let g = 0;
                while (s.pool > 0 && own.length && g++ < 500) {
                  const t = own[Math.floor(Math.random() * own.length)];
                  if (!t) break;
                  s.terr[t].troops++; s.pool--;
                }
                s.phase = 'attack';
                setS(s); setSel(null); setDn(null);
                log(s, '» ¡A atacar!', 'sys');
              }}
          />
          </div>

          <div className={'panel-log' + (mobileTab === 'log' ? ' show' : '')}>
            <LogPanel S={S}/>
          </div>
        </div>

        {/* Barra de pestañas móvil */}
        <div className="mobile-tabs">
          <button className={'tab' + (mobileTab === 'actions' ? ' on' : '')} onClick={() => setMobileTab('actions')}><span className="mat">swords</span>Acciones</button>
          <button className={'tab' + (mobileTab === 'you' ? ' on' : '')} onClick={() => setMobileTab('you')}><span className="mat">person</span>Vos</button>
          <button className={'tab' + (mobileTab === 'log' ? ' on' : '')} onClick={() => setMobileTab('log')}><span className="mat">campaign</span>Log</button>
        </div>

        <Copyright/>
      </main>

      <div className={'banner' + (banner ? ' show' : '') + (banner && banner.small ? ' small' : '')}>{banner ? banner.txt : ''}</div>
      <div className={'flash' + (flash ? ' on' : '')}/>
    </div>
  );
}

// helpers locales (evita repetir imports en cada handler)
function ADJ_O(a, b) { return ADJ[a] && ADJ[a].includes(b); }
function TIDS_OWNED(s, p) { return TIDS.filter(t => s.terr[t].owner === p); }
