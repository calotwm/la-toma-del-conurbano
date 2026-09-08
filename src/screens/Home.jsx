import { Copyright } from '../components/common.jsx';

export default function Home({ onNew, onContinue, onOnline, hasSave }) {
  return (
    <div className="screen">
      <div className="medallion" style={{ width: 72, height: 72 }}>
        <div className="medallion-in"><span className="mat" style={{ fontSize: 40 }}>wb_sunny</span></div>
      </div>
      <h1 className="logo embossed">LA TOMA DEL<br/>CONURBANO</h1>
      <p className="tagline">Un TEG bien argento. Conquistá La Matanza, robate La Capital, cortá rutas y hacete dueño del Gran Buenos Aires. Acá el que no corre, vuela.</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-gold btn-big" onClick={onNew}><span className="mat" style={{ fontSize: 22, verticalAlign: -4 }}>sports_esports</span> JUGAR EN ESTE DISPOSITIVO</button>
        <button className="btn-ghost btn-big" onClick={onOnline}><span className="mat" style={{ fontSize: 22, verticalAlign: -4 }}>public</span> JUGAR ONLINE CON AMIGOS</button>
        {hasSave && <button className="btn-ghost btn-big" onClick={onContinue}><span className="mat" style={{ fontSize: 22, verticalAlign: -4 }}>save</span> Continuar partida</button>}
      </div>
      <div className="hint">Sonido: activalo con un clic (nada de archivos, todo sintetizado). "En este dispositivo" es contra bots o pasando el celu/PC entre amigos (2 a 6 jugadores). "Online" es cada uno desde su casa, con un código de sala.</div>
      <Copyright/>
    </div>
  );
}
