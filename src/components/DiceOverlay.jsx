import { playerColor, playerName, tName, battleResult } from '../engine.js';

// Layout de puntos (pips) 1-6 en una grilla 3x3 (índices 0-8)
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// aclara (percent>0) u oscurece (percent<0) un color hex, para armar el degradé "vidrioso" del dado
function shade(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + percent), g = clamp(((num >> 8) & 0xff) + percent), b = clamp((num & 0xff) + percent);
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function dieStyle(color) {
  return {
    background: `linear-gradient(135deg, ${shade(color, 75)}, ${color} 50%, ${shade(color, -70)})`,
    borderColor: shade(color, 90),
    boxShadow: `0 8px 18px ${color}66`,
  };
}

function DieFace({ value, color, state }) {
  const cells = PIPS[value] || [];
  return (
    <div className={`combat-die ${state}`} style={dieStyle(color)}>
      <div className="combat-die-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={cells.includes(i) ? 'pip on' : 'pip'}/>
        ))}
      </div>
      {state === 'win' && <span className="combat-die-badge win">+1</span>}
      {state === 'lose' && <span className="combat-die-badge lose">×</span>}
    </div>
  );
}

// Empareja dados atacante/defensor como en battleResult (mayor vs mayor) para marcar
// cuál posición ORIGINAL ganó o perdió, sin alterar el orden visual en que se tiraron.
function pairStates(a, d) {
  const aIdx = a.map((_, i) => i).sort((x, y) => a[y] - a[x]);
  const dIdx = d.map((_, i) => i).sort((x, y) => d[y] - d[x]);
  const aState = Array(a.length).fill('idle');
  const dState = Array(d.length).fill('idle');
  const n = Math.min(aIdx.length, dIdx.length);
  for (let i = 0; i < n; i++) {
    const ai = aIdx[i], di = dIdx[i];
    if (a[ai] > d[di]) { aState[ai] = 'win'; dState[di] = 'lose'; }
    else if (a[ai] < d[di]) { aState[ai] = 'lose'; dState[di] = 'win'; }
    else { aState[ai] = 'tie'; dState[di] = 'tie'; } // empate: no pierde nadie (ver battleResult)
  }
  return { aState, dState };
}

export default function DiceOverlay({ S, dice, battle, armed, onRoll }) {
  if (!dice && !armed) return null;

  const atkName = battle ? playerName(S, battle.atkId) : 'Atacante';
  const defName = battle ? playerName(S, battle.defId) : 'Defensor';
  const atkColor = battle ? playerColor(S, battle.atkId) : '#ff6b6b';
  const defColor = battle ? playerColor(S, battle.defId) : '#e8b33a';
  const targetName = battle ? tName(battle.t) : '';
  const isCapital = (battle && battle.t === 'capital') || (armed && armed.isCapital);

  // estado "armado": los dados están listos pero todavía no se tiraron — espera el toque del humano
  if (armed && !dice) {
    return (
      <div className={'combat-overlay armed' + (isCapital ? ' capital' : '')}>
        <div className="combat-card">
          <div className="combat-vs-line">
            <span className="combat-side atk" style={{ color: atkColor }}>{atkName}</span>
            <span className="combat-vs-word">{isCapital ? 'asalta' : 'ataca a'}</span>
            <span className="combat-side def" style={{ color: defColor }}>{defName}</span>
          </div>
          {targetName && <div className="combat-target">{isCapital ? '★ LA CAPITAL' : targetName} · ¡TE DEFENDÉS!</div>}

          <div className="combat-row">
            <div className="combat-dice-group">
              <div className="combat-group-label atk">ATACANTE</div>
              <div className="combat-dice">
                {Array.from({ length: armed.aN }, (_, i) => <div key={i} className="combat-die closed" style={dieStyle(atkColor)}/>)}
              </div>
            </div>
            <div className="combat-swords">⚔</div>
            <div className="combat-dice-group">
              <div className="combat-group-label def">DEFENSOR (VOS)</div>
              <div className="combat-dice">
                {Array.from({ length: armed.dN }, (_, i) => <div key={i} className="combat-die closed" style={dieStyle(defColor)}/>)}
              </div>
            </div>
          </div>

          <button className="combat-roll-btn" onClick={onRoll}>
            <span className="mat">casino</span>¡TIRAR LOS DADOS!
          </button>
        </div>
      </div>
    );
  }

  if (!dice) return null;

  let aState = dice.a.map(() => 'rolling');
  let dState = dice.d.map(() => 'rolling');
  let tally = null;
  if (!dice.rolling) {
    const paired = pairStates(dice.a, dice.d);
    aState = paired.aState; dState = paired.dState;
    const res = battleResult(dice.a, dice.d);
    tally = { al: res.al, dl: res.dl };
  }

  return (
    <div className={'combat-overlay' + (dice.rolling ? ' rolling' : ' settled') + (isCapital ? ' capital' : '')}>
      <div className="combat-card">
        <div className="combat-vs-line">
          <span className="combat-side atk" style={{ color: atkColor }}>{atkName}</span>
          <span className="combat-vs-word">{isCapital ? 'asalta' : 'ataca a'}</span>
          <span className="combat-side def" style={{ color: defColor }}>{defName}</span>
        </div>
        {targetName && <div className="combat-target">{isCapital ? '★ LA CAPITAL' : targetName}</div>}

        <div className="combat-row">
          <div className="combat-dice-group">
            <div className="combat-group-label atk">ATACANTE</div>
            <div className="combat-dice">
              {dice.a.map((v, i) => <DieFace key={i} value={v} color={atkColor} state={aState[i]}/>)}
            </div>
          </div>
          <div className="combat-swords">⚔</div>
          <div className="combat-dice-group">
            <div className="combat-group-label def">DEFENSOR</div>
            <div className="combat-dice">
              {dice.d.map((v, i) => <DieFace key={i} value={v} color={defColor} state={dState[i]}/>)}
            </div>
          </div>
        </div>

        {tally && (
          <div className="combat-tally">
            {tally.al > 0 && <span className="combat-loss atk">{atkName} pierde {tally.al}</span>}
            {tally.dl > 0 && <span className="combat-loss def">{defName} pierde {tally.dl}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
