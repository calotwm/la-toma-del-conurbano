import { useEffect, useRef } from 'react';
import { fmtTime } from './common.jsx';

export default function LogPanel({ S }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [S.log.length]);
  return (
    <div className="panel rightcol">
      <h3>📻 Radio Conurbano — eventos</h3>
      <div className="logbox" ref={ref}>
        {S.log.map((l, i) => (
          <div key={l.t + '-' + i} className={'logline ' + l.kind}>
            <span className="logtime">{fmtTime(l.t)}</span>{l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
