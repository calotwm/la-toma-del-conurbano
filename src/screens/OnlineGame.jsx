import { useEffect, useRef, useState } from 'react';
import { PHRASES, ADJ, TIDS, pick } from '../data.js';
import { rollDice, ownersCount, totalTroops, tName, playerName, MISSION_DEFS } from '../engine.js';
import { Sound } from '../sound.js';
import { getSocket, disconnectSocket, syncChat, sendChat, syncGlobalChat, sendGlobalChat } from '../net.js';
import MapView from '../components/MapView.jsx';
import PlayerPanel from '../components/PlayerPanel.jsx';
import ActionBar from '../components/ActionBar.jsx';
import LogPanel from '../components/LogPanel.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import DiceOverlay from '../components/DiceOverlay.jsx';
import { Copyright } from '../components/common.jsx';

const wait = ms => new Promise(r => setTimeout(r, ms));

// Pantalla de juego para el modo ONLINE: misma UI que el modo local/bots (reutiliza
// los mismos componentes), pero acá el server es la única autoridad — las acciones
// se mandan por socket y el estado que se ve es el que el server confirma. Los dados
// se animan localmente (cosmético, "girando") y siempre terminan en el resultado real
// que ya calculó el server, para que todos en la sala vean lo mismo.
export default function OnlineGame({ initial, youAre, code, onExit }) {
  const [S, setS] = useState(initial);
  const [selCards, setSelCards] = useState([]);
  const [sel, setSel] = useState(null);
  const [dn, setDn] = useState(null);
  const [amt, setAmt] = useState(1);
  const [battle, setBattle] = useState(null);
  const [dice, setDice] = useState(null);
  const [banner, setBanner] = useState(null);
  const [flash, setFlash] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(null);
  const [chat, setChat] = useState([]);
  const [globalChat, setGlobalChat] = useState([]);
  const [chatTab, setChatTab] = useState('match');
  const [myZone, setMyZone] = useState('capital');
  const [soundOn, setSoundOn] = useState(true);
  const [connLost, setConnLost] = useState(false);

  const animatingRef = useRef(false);
  const pendingStateRef = useRef(null);
  const battleTokenRef = useRef(0); // evita que una animación vieja pise a una nueva si se solapan (pestaña en segundo plano, timers atrasados, etc.)
  const bannerT = useRef(null), flashT = useRef(null);
  useEffect(() => () => { clearTimeout(bannerT.current); clearTimeout(flashT.current); }, []);

  const showBanner = (txt, small, short) => {
    setBanner({ txt, small: !!small });
    clearTimeout(bannerT.current);
    bannerT.current = setTimeout(() => setBanner(null), short ? 1400 : (small ? 1900 : 3400));
  };
  const flashOn = () => { setFlash(true); clearTimeout(flashT.current); flashT.current = setTimeout(() => setFlash(false), 1400); };

  useEffect(() => {
    const s = getSocket();
    const onState = (newState) => {
      if (animatingRef.current) pendingStateRef.current = newState;
      else setS(newState);
    };
    const onBattle = (payload) => { runBattleAnimation(payload); };
    const onDisconnect = () => setConnLost(true);
    const onConnect = () => setConnLost(false);
    // el chat se escucha acá (siempre montado mientras dura la partida) y no en el panel del
    // chat en sí, que solo existe cuando el jugador tiene esa pestaña abierta — si no, se
    // pierden los mensajes que llegan mientras está mirando la Bitácora u otra pantalla.
    const onChatHistory = ({ chat: h } = {}) => { if (Array.isArray(h)) setChat(h); };
    const onChatNew = ({ message } = {}) => {
      if (!message) return;
      setChat(prev => [...prev, message]);
    };
    // chat general: mismo mecanismo, pero sin filtrar por sala — llega de cualquiera
    // conectado al server, esté jugando esta partida o esperando/jugando otra
    const onGlobalHistory = ({ chat: h } = {}) => { if (Array.isArray(h)) setGlobalChat(h); };
    const onGlobalNew = ({ message } = {}) => {
      if (!message) return;
      setGlobalChat(prev => [...prev, message]);
    };
    s.on('game:state', onState);
    s.on('game:battle', onBattle);
    s.on('disconnect', onDisconnect);
    s.on('connect', onConnect);
    s.on('chat:history', onChatHistory);
    s.on('chat:new', onChatNew);
    s.on('chat:globalHistory', onGlobalHistory);
    s.on('chat:globalNew', onGlobalNew);
    syncChat(code); // trae el historial por si nos perdimos algo (reconexión)
    syncGlobalChat();
    return () => {
      s.off('game:state', onState); s.off('game:battle', onBattle);
      s.off('disconnect', onDisconnect); s.off('connect', onConnect);
      s.off('chat:history', onChatHistory); s.off('chat:new', onChatNew);
      s.off('chat:globalHistory', onGlobalHistory); s.off('chat:globalNew', onGlobalNew);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runBattleAnimation(payload) {
    const { pid, o, t, aN, dN, aRoll, dRoll, al, dl, conquered, capital, capitalConquered, prevOwner } = payload;
    // token propio: si mientras esta animación espera llega OTRA (p.ej. la pestaña estuvo en
    // segundo plano y el navegador atrasó los timers, o el server mandó dos batallas seguidas),
    // esta corrida vieja se da cuenta al despertar y se aborta en vez de pisar el battle/dice
    // de la nueva — así nunca queda "ATACANTE ataca a DEFENSOR" colgado con datos de otra pelea.
    const myToken = ++battleTokenRef.current;
    const isCurrent = () => battleTokenRef.current === myToken;

    animatingRef.current = true;
    setBattle({ o, t, atkId: pid, defId: prevOwner });
    setDice({ a: Array(aN).fill('?'), d: Array(dN).fill('?'), aN, dN, rolling: true });
    if (capital) Sound.alarm(); else Sound.dice();
    const frames = Math.round(1200 / 80);
    for (let i = 0; i < frames; i++) {
      if (!isCurrent()) return;
      setDice({ a: rollDice(aN), d: rollDice(dN), aN, dN, rolling: true });
      Sound.diceTick();
      await wait(80);
    }
    if (!isCurrent()) return;
    setDice({ a: aRoll, d: dRoll, aN, dN, rolling: false });

    const iAttacked = pid === youAre;
    const iDefended = prevOwner === youAre;
    if (conquered) {
      if (capitalConquered) {
        flashOn(); Sound.epic();
        if (iAttacked) showBanner(prevOwner == null ? pick(PHRASES.capitalWin) : pick(PHRASES.capitalLose), false);
        else if (iDefended) showBanner('¡TE ROBARON LA CAPITAL! ' + pick(PHRASES.capitalLose), false);
      } else {
        Sound.conquest();
        if (iAttacked) showBanner(`${tName(t)} ES TUYO. ${pick(PHRASES.territoryWin)}`, false, true);
      }
    } else {
      if (capital) {
        Sound.defendCapital();
        if (iDefended) showBanner(pick(PHRASES.capDefense), false);
      } else {
        Sound.lose();
        if (iAttacked) showBanner(pick(PHRASES.battleLose), false, true);
      }
    }

    await wait(1900);
    if (!isCurrent()) return;
    setDice(null); setBattle(null);
    animatingRef.current = false;
    if (pendingStateRef.current) { setS(pendingStateRef.current); pendingStateRef.current = null; }
  }

  const curP = S.players.find(p => p.id === S.order[S.tidx]);
  const isMyTurn = !!curP && curP.id === youAre;
  const me = isMyTurn ? youAre : null;
  const humanTurn = isMyTurn && !animatingRef.current;
  const originT = sel && sel.o ? S.terr[sel.o] : null;
  const maxD = originT ? Math.min(3, originT.troops - 1) : 1;
  const isCapT = !!(sel && sel.t === 'capital');

  useEffect(() => { setSel(null); setDn(null); setSelCards([]); }, [S.tidx, S.phase]);

  useEffect(() => {
    if (S.winner) {
      const w = S.players.find(p => p.id === S.winner);
      const mk = w && S.winReason && S.winReason.startsWith('mission') ? MISSION_DEFS[w.mission] : null;
      Sound.mission();
      showBanner(mk ? `¡${w.name} CUMPLIÓ SU MISIÓN: ${mk.name}!` : `¡${w.name} DOMINÓ TODO EL CONURBANO!`, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S.winner]);

  function onTerr(id) {
    if (!isMyTurn || animatingRef.current) return;
    if (S.phase === 'reinforce') {
      if (S.terr[id].owner !== me || S.pool <= 0) return;
      getSocket().emit('game:reinforcePlace', { code, terrId: id });
      return;
    }
    if (S.phase === 'attack') {
      const o = sel ? sel.o : null;
      if (!o) { if (S.terr[id].owner === me && S.terr[id].troops >= 2) { setSel({ o: id }); setDn(null); } return; }
      if (id === o) return;
      if (S.terr[id].owner === me) { setSel({ o: id }); setDn(null); return; }
      if (!ADJ[o] || !ADJ[o].includes(id)) return;
      const ot = S.terr[o].troops;
      if (id === 'capital' && ot < 3) return;
      const maxDd = Math.min(3, ot - 1);
      const defDn = id === 'capital' ? Math.max(2, Math.min(3, maxDd)) : maxDd;
      setSel({ o, t: id }); setDn(defDn); setAmt(1);
      return;
    }
    if (S.phase === 'fortify') {
      const o = sel ? sel.o : null;
      if (!o) { if (S.terr[id].owner === me && S.terr[id].troops >= 2) setSel({ o: id }); return; }
      if (id === o) return;
      if (S.terr[id].owner !== me || !ADJ[o] || !ADJ[o].includes(id)) return;
      setSel({ o, t: id }); setAmt(1);
      return;
    }
  }

  const leaveGame = () => {
    getSocket().emit('room:leave', { code });
    disconnectSocket();
    onExit();
  };

  return (
    <div className="game-shell">
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
                <span className="tag-edicion">Online · Sala {code}</span>
              </div>
              <p className="logo-sub">{connLost ? 'Se cortó la conexión, reconectando...' : 'Partida online — todos ven lo mismo en vivo'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="turn-crest">
              <span className="turn-dot"></span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'var(--celeste)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>RONDA {S.round}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: '#c4d0e5' }}>Turno de <b style={{ color: curP ? curP.color : '#fff' }}>{curP ? curP.name : '—'}</b>{curP && curP.id === youAre ? ' (vos)' : curP && !curP.human ? ' · bot' : ''}</div>
              </div>
            </div>
            <div className="hdr-util">
              <button className={soundOn ? 'on' : ''} title="Sonido" onClick={() => { const n = !soundOn; setSoundOn(n); Sound.toggle(); }}><span className="mat">{soundOn ? 'volume_up' : 'volume_off'}</span></button>
              <button title="Salir de la sala" onClick={leaveGame}><span className="mat">exit_to_app</span></button>
            </div>
          </div>
        </div>
      </header>

      <main className="game">
        {curP && (
          <div className="mobile-dash">
            <div className="chip"><b>{ownersCount(S, youAre)}</b><span>Municipios</span></div>
            <div className="chip">
              <b style={{ color: S.terr.capital.owner === youAre ? 'var(--gold-light)' : undefined }}>{S.terr.capital.owner === youAre ? 'SÍ' : 'NO'}</b><span>La Capital</span>
            </div>
            <div className="chip"><b>{(S.players.find(p => p.id === youAre)?.hand || []).length}</b><span>Naipes</span></div>
            <div className="chip"><b>{totalTroops(S, youAre)}</b><span>Tropas</span></div>
          </div>
        )}

        <div className={'drawer-backdrop' + (mobileDrawer ? ' show' : '')} onClick={() => setMobileDrawer(null)}/>

        <div className="game-fit">
          <div className={'col panel-you' + (mobileDrawer === 'you' ? ' show' : '')}>
            <button className="drawer-close" onClick={() => setMobileDrawer(null)}><span className="mat">expand_more</span></button>
            <PlayerPanel S={S} setS={setS} curP={S.players.find(p => p.id === youAre)} me={me} selCards={selCards} setSelCards={setSelCards}
              onTrade={(indices) => getSocket().emit('game:tradeCards', { code, indices })}/>
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
                      <span className="rival-name">{p.name}{pid === youAre ? ' (vos)' : ''}</span>
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
                  <span className="scale">· {TIDS.length} distritos</span>
                </div>
              </div>
              <div className="map-viewport">
                <MapView S={S} sel={sel} battle={battle} onTerr={onTerr}/>
              </div>
            </div>
          </div>

          <div className="col col-right panel-actions">
            <ActionBar
              S={S} sel={sel} setSel={setSel} me={me} humanTurn={humanTurn}
              dn={dn} setDn={setDn} amt={amt} setAmt={setAmt} maxD={maxD} isCapT={isCapT}
              onAttack={() => { if (sel && sel.t && sel.o && dn != null) getSocket().emit('game:attack', { code, o: sel.o, t: sel.t, diceN: dn }); }}
              onFortify={() => { if (sel && sel.t && sel.o) { getSocket().emit('game:fortify', { code, o: sel.o, t: sel.t, amt }); setSel(null); } }}
              onToFortify={() => { if (S.phase === 'attack') { getSocket().emit('game:toFortify', { code }); setSel(null); } }}
              onEndTurn={() => { getSocket().emit('game:endTurn', { code }); setSel(null); }}
              onAutoPlace={() => getSocket().emit('game:reinforceAuto', { code })}
              onSkipReinforce={() => getSocket().emit('game:reinforceSkip', { code })}
            />
          </div>

          <div className={'panel-log' + (mobileDrawer === 'log' ? ' show' : '')}>
            <button className="drawer-close" onClick={() => setMobileDrawer(null)}><span className="mat">expand_more</span></button>
            <div className="log-section">
              <LogPanel S={S}/>
            </div>
            <div className="chat-section">
              <div className="chat-section-tabs">
                <button className={chatTab === 'match' ? 'on' : ''} onClick={() => setChatTab('match')}><span className="mat">groups</span>Partida</button>
                <button className={chatTab === 'global' ? 'on' : ''} onClick={() => setChatTab('global')}><span className="mat">public</span>General</button>
              </div>
              {chatTab === 'match'
                ? <ChatPanel chat={chat} myId={getSocket().id} myZone={myZone} setMyZone={setMyZone} onSend={(text) => sendChat(code, myZone, text)}/>
                : <ChatPanel chat={globalChat} myId={getSocket().id} myZone={myZone} setMyZone={setMyZone} onSend={(text) => sendGlobalChat(text)}/>}
            </div>
          </div>
        </div>

        <div className="mobile-tabs">
          <button className={'tab' + (mobileDrawer === 'you' ? ' on' : '')} onClick={() => setMobileDrawer(d => d === 'you' ? null : 'you')}><span className="mat">flag</span>Objetivo</button>
          <button className={'tab' + (mobileDrawer === 'log' ? ' on' : '')} onClick={() => setMobileDrawer(d => d === 'log' ? null : 'log')}><span className="mat">campaign</span>Bitácora</button>
        </div>

        <Copyright/>
      </main>

      <div className={'banner' + (banner ? ' show' : '') + (banner && banner.small ? ' small' : '')}>{banner ? banner.txt : ''}</div>
      <div className={'flash' + (flash ? ' on' : '')}/>
      <DiceOverlay S={S} dice={dice} battle={battle} armed={null} onRoll={() => {}}/>

      {S.winner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(4,7,13,.86)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 20 }}>
          <h1 className="logo embossed" style={{ fontSize: 32 }}>{S.players.find(p => p.id === S.winner)?.name} SE QUEDÓ CON TODO</h1>
          <button className="btn-gold btn-big" onClick={leaveGame}><span className="mat" style={{ fontSize: 20, verticalAlign: -4 }}>exit_to_app</span> VOLVER AL INICIO</button>
        </div>
      )}
    </div>
  );
}
