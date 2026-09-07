export const HOST = 'URQUISOFT';

export const fmtTime = t => {
  const d = new Date(t);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export function Copyright() {
  return <div className="footer">© 2026 {HOST} — “La Toma del Conurbano”. Todos los derechos reservados.</div>;
}
