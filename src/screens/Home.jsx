import { Copyright } from '../components/common.jsx';

export default function Home({ onNew, onContinue, hasSave }) {
  return (
    <div className="home">
      <div style={{ fontSize: 60 }}>🏛️</div>
      <h1 className="logo">LA TOMA DEL<br/>CONURBANO<small>un TEG bien argento</small></h1>
      <p className="tag">Conquistá La Matanza, robate La Capital, cortá rutas y hacete el dueño del Gran Buenos Aires. Modismos garantizados: acá el que no corre, vuela.</p>
      <div className="cityline">🛣️ 🏭 🍺 ⚽ 🏇 ✈️</div>
      <div className="btns">
        <button className="btn-big" onClick={onNew}>🎮 EMPEZAR PARTIDA</button>
        {hasSave && <button className="btn-ghost" onClick={onContinue}>💾 Continuar partida</button>}
      </div>
      <div className="hint">Sonido: activalo con un clic (nada de archivos, todo sintetizado). Para 2 a 6 jugadores, humanos y bots.</div>
      <Copyright/>
    </div>
  );
}
