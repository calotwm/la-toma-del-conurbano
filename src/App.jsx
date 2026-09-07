import { useState } from 'react';
import { createGame, loadGame } from './engine.js';
import Home from './screens/Home.jsx';
import Setup from './screens/Setup.jsx';
import Deal from './screens/Deal.jsx';
import Game from './screens/Game.jsx';
import EndScreen from './screens/EndScreen.jsx';

export default function App() {
  const [S, setS] = useState({
    screen: 'home', gid: 'h0', missionsOn: true,
    players: [], order: [], terr: {}, deck: [], deckPos: 0, stat: {},
    round: 1, tidx: 0, phase: 'reinforce', pool: 0, turnFlags: {}, log: [],
  });
  const [hasSave] = useState(() => !!loadGame());

  if (S.screen === 'home') {
    return (
      <Home
        hasSave={hasSave}
        onNew={() => setS({ ...S, screen: 'setup' })}
        onContinue={() => { const g = loadGame(); if (g) setS(g); }}
      />
    );
  }

  if (S.screen === 'setup') {
    return (
      <Setup
        initial={S.meta ? S.meta.players : null}
        onBack={() => setS({ ...S, screen: 'home' })}
        onStart={(metas, missions) => setS(createGame({ players: metas, missionsOn: missions !== false }))}
      />
    );
  }

  if (S.screen === 'deal') {
    return (
      <Deal
        S={S}
        setS={setS}
      />
    );
  }

  if (S.screen === 'end') {
    return (
      <EndScreen
        S={S}
        onAgain={() => { if (S.meta) setS(createGame(S.meta)); }}
        onHome={() => setS({ ...S, screen: 'home' })}
      />
    );
  }

  return <Game S={S} setS={setS}/>;
}
