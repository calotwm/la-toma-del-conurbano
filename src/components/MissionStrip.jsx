import { MISSION_DEFS } from '../engine.js';

// Versión compacta de "tu misión" + "tropas para colocar ahora", pensada para mostrarse
// siempre a la vista en mobile (debajo de la bandeja de acciones), sin tener que abrir
// el cajón "Objetivo" para verla.
export default function MissionStrip({ S, curP, humanTurn }) {
  if (!curP) return null;
  const misDef = S.missionsOn && curP.mission ? (MISSION_DEFS[curP.mission] || null) : null;
  const showPool = S.phase === 'reinforce' && humanTurn;

  if (!misDef && !showPool) return null;

  return (
    <div className="mission-strip">
      {misDef && (
        <div className="mission-strip-mission">
          <div className="mission-op"><span className="mat" style={{ fontSize: 15, color: 'var(--warn)' }}>verified_user</span>Tu misión</div>
          <div className="mission-strip-name">{misDef.name}</div>
          <div className="mission-desc">{misDef.desc(S)}</div>
        </div>
      )}
      {showPool && (
        <div className="bastion" style={{ borderColor: 'var(--gold)', background: 'linear-gradient(90deg,#1f2410,#121826,#1f2410)' }}>
          <div className="bastion-ic"><span className="mat">payments</span></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="bastion-t" style={{ fontSize: 12 }}>A COLOCAR AHORA</div>
            <div className="bastion-s" style={{ color: 'var(--celeste)', fontWeight: 800, fontSize: 18 }}>{S.pool} tropas</div>
          </div>
        </div>
      )}
    </div>
  );
}
