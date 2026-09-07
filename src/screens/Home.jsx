import { Copyright } from '../components/common.jsx';

export default function Home({ onNew, onContinue, hasSave }) {
  return (
    <div className="screen">
      <div className="medallion" style={{ width: 72, height: 72 }}>
        <div className="medallion-in"><span className="mat" style={{ fontSize: 40 }}>wb_sunny</span></div>
      </div>
      <h1 className="logo embossed">LA TOMA DEL<br/>CONURBANO</h1>
      <p className="tagline">Un TEG bien argento. Conquistá La Matanza, robate La Capital, cortá rutas y hacete dueño del Gran Buenos Aires. Acá el que no corre, vuela.</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-gold btn-big" onClick={onNew}><span className="mat" style={{ fontSize: 22, verticalAlign: -4 }}>sports_esports</span> EMPEZAR PARTIDA</button>
        {hasSave && <button className="btn-ghost btn-big" onClick={onContinue}><span className="mat" style={{ fontSize: 22, verticalAlign: -4 }}>save</span> Continuar partida</button>}
      </div>
      <div className="hint">Sonido: activalo con un clic (nada de archivos, todo sintetizado). Para 2 a 6 jugadores, humanos y bots.</div>
      <Copyright/>
    </div>
  );
}
