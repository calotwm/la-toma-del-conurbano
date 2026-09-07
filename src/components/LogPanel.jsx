import { useEffect, useRef } from 'react';
import { fmtTime } from './common.jsx';

const KIND_LABEL = { win: 'VICTORIA', lose: 'RECHAZO', capital: 'LA JOYA', tv: 'RADIO', card: 'NAIPE', battle: 'ASALTO', sys: 'PARTE' };

export default function LogPanel({ S }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [S.log.length]);
  return (
    <div className="frame panel rightcol">
      <span className="corner corner-tl"></span><span className="corner corner-tr"></span>
      <span className="corner corner-bl"></span><span className="corner corner-br"></span>
      <div className="panel-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mat" style={{ fontSize: 18, color: 'var(--celeste)' }}>record_voice_over</span>
          <h3>Bitácora en Lunfardo</h3>
        </div>
        <span className="minitag" style={{ background: '#4d0707', color: 'var(--warn)', border: '1px solid rgba(255,107,107,.4)' }}>EN VIVO</span>
      </div>
      <div className="logbox">
        {S.log.map((l, i) => (
          <div key={l.t + '-' + i} className={'logline ' + l.kind}>
            <div className="t">
              <span className="where">{KIND_LABEL[l.kind] || 'PARTE'} · {fmtTime(l.t)}</span>
            </div>
            <p>{l.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
