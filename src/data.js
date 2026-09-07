// ============================================================
// DATA — el Conurbano Bonaerense con COORDENADAS GEOGRÁFICAS REALES
// Proyección equirectangular de lat/lon reales de cada partido.
// El Río de la Plata corre por el NORTE/ESTE: la costa va desde
// Tigre-San Fernando-San Isidro-Vicente López (norte) bajando por
// Avellaneda-Quilmes-Berazategui (este). Nada de Quilmes en el mar.
// ============================================================

export const CX = 560, CY = 470; // La Capital (CABA) — centro de la grilla

// Grilla estilo TEG (del JSON de referencia): CABA en [0,0], Norte arriba (y+),
// Sur abajo (y-), Oeste izquierda (x-), costa al este (x+). Escala SC, offset ox/oy.
const SC = 52, OX = 560, OY = 470;
const G = (x, y) => [Math.round(OX + x * SC), Math.round(OY - y * SC)];

export const TERR = [
  { id:'capital', name:'La Capital', full:'La Capital (CABA)', x:OX, y:OY, r:52, zone:'capital', special:true,
    flavor:'La joya del conurbano: Casa Rosada, Obelisco y la 9 de Julio. El que la tiene, cobra. El que la pierde, llora.' },
  { id:'tigre',       name:'Tigre',           ...g2(2, 8),  r:24, zone:'norte', flavor:'Delta del Paraná, lanchas, Nordelta y mosquitos que no perdonan.' },
  { id:'sanfernando', name:'San Fernando',    ...g2(3, 6),  r:23, zone:'norte', flavor:'Astilleros e islas: el que domina el río domina la joda.' },
  { id:'sanisidro',   name:'San Isidro',      ...g2(2, 4),  r:23, zone:'norte', flavor:'Hipódromo, catedral y la costa más cheta del conurbano.' },
  { id:'vicentelopez',name:'Vicente López',   ...g2(1, 2),  r:22, zone:'norte', flavor:'La costa del poder: la Quinta de Olivos está acá.' },
  { id:'sanmiguel',   name:'San Miguel',      ...g2(-3, 5), r:22, zone:'norte', flavor:'Tranquilo, arbolado... hasta que llega un ejército.' },
  { id:'josecpaz',    name:'José C. Paz',     ...g2(-4, 7), r:22, zone:'norte', flavor:'Ciudad dormitorio: si dormís, perdés territorios.' },
  { id:'malvinas',    name:'Malvinas Argentinas', ...g2(-2, 7), r:21, zone:'norte', flavor:'Polo industrial y del peronismo profundo del oeste norteño.' },
  { id:'sanmartin',   name:'San Martín',      ...g2(-1, 2), r:22, zone:'oeste', flavor:'Parque industrial y peronismo de ley.' },
  { id:'tresdefebrero',name:'Tres de Febrero',...g2(-2, 1), r:21, zone:'oeste', flavor:'Caseros, Ciudad Jardín, El Palomar: gente laburante.' },
  { id:'hurlingham',  name:'Hurlingham',      ...g2(-3, 3), r:20, zone:'oeste', flavor:'Tierra de clubes de rugby: barras que te comen crudo.' },
  { id:'ituzaingo',   name:'Ituzaingó',       ...g2(-5, 2), r:20, zone:'oeste', flavor:'Residencial y prolijo: el caos se viste de traje.' },
  { id:'moreno',      name:'Moreno',          ...g2(-7, 3), r:22, zone:'oeste', flavor:'Punta de riel del Sarmiento: llegar acá ya es conquista.' },
  { id:'moron',       name:'Morón',           ...g2(-4, 1), r:22, zone:'oeste', flavor:'Catedral, plaza y base aérea: el centro neurálgico del oeste.' },
  { id:'merlo',       name:'Merlo',           ...g2(-6, -1), r:22, zone:'oeste', flavor:'Trenes, bandas de rock y quilombo garantizado.' },
  { id:'ciudadela',   name:'Ciudadela',       ...g2(-1, 1), r:20, zone:'oeste', flavor:'Fábricas y ferias: el olor a pan es de terror.' },
  { id:'ramosmejia',  name:'Ramos Mejía',     ...g2(-2, -1), r:20, zone:'oeste', flavor:'Shopping Oeste y el tren atestado: rinde en dólares.' },
  { id:'lamatanza',   name:'La Matanza',      ...g2(-3, -2), r:44, zone:'oeste', big:true,
    flavor:'El partido más picante y poblado del país. Virrey del Pino te mira feo.' },
  { id:'sanjusto',    name:'San Justo',       ...g2(-1, -2), r:20, zone:'oeste', flavor:'Cabecera de La Matanza: el palacio municipal es la joya.' },
  { id:'flores',      name:'Flores',          ...g2(0, -1), r:20, zone:'oeste', flavor:'Barrio porteño “liberado” al otro lado de la General Paz. Cuna del rock.' },
  { id:'avellaneda',  name:'Avellaneda',      ...g2(2, -2), r:22, zone:'sur', flavor:'Racing vs. Independiente y el puente Pueyrredón: la puerta del sur.' },
  { id:'lanus',       name:'Lanús',           ...g2(1, -3), r:22, zone:'sur', flavor:'Granate, obreros y Dock Sud: orgullo del sur profundo.' },
  { id:'quilmes',     name:'Quilmes',         ...g2(4, -4), r:23, zone:'sur', flavor:'Sobre la costa del Plata. La cerveza que tomaba el abuelo: botella llena, territorio sano.' },
  { id:'lomas',       name:'Lomas de Zamora', ...g2(1, -5), r:22, zone:'sur', flavor:'La Salada, reina de las ferias: guita, punga y estrategia.' },
  { id:'brown',       name:'Almirante Brown', ...g2(2, -7), r:22, zone:'sur', flavor:'Adrogué, ciudad jardín: parece paz... hasta que atacan.' },
  { id:'varela',      name:'Florencio Varela',...g2(4, -8), r:22, zone:'sur', flavor:'Kilómetro 30 y pico: donde la gamba se estira.' },
  { id:'berazategui', name:'Berazategui',     ...g2(7, -6), r:22, zone:'sur', flavor:'La ciudad del vidrio, sobre el río: todo se ve transparente (menos las alianzas).' },
  { id:'echeverria',  name:'Esteban Echeverría', ...g2(-1, -8), r:20, zone:'sur', flavor:'Monte Grande y la cuna del cuento del tío.' },
  { id:'ezeiza',      name:'Ezeiza',          ...g2(-3, -7), r:22, zone:'sur', flavor:'Aeropuerto internacional: controlás quién entra y sale.' },
];

function g2(x, y) { const [px, py] = G(x, y); return { x: px, y: py }; }

export const TIDS = TERR.map(t => t.id);

export const ZONES = {
  capital: { label:'Capital Federal', color:'#eab308', ids:['capital'] },
  norte:   { label:'Zona Norte', color:'#ec4899', ids:['tigre','sanfernando','sanisidro','vicentelopez','sanmiguel','josecpaz','malvinas'] },
  oeste:   { label:'Zona Oeste', color:'#f97316', ids:['sanmartin','tresdefebrero','hurlingham','ituzaingo','moreno','moron','merlo','ciudadela','ramosmejia','lamatanza','sanjusto','flores'] },
  sur:     { label:'Zona Sur', color:'#22c55e', ids:['avellaneda','lanus','quilmes','lomas','brown','varela','berazategui','echeverria','ezeiza'] },
};
export const ZKEYS = ['capital','norte','oeste','sur'];

// Adyacencias geográficamente reales (partidos limítrofes)
export const ADJ_PAIRS = [
  // CABA con la primera corona
  ['capital','vicentelopez'],['capital','sanmartin'],['capital','tresdefebrero'],['capital','ciudadela'],
  ['capital','flores'],['capital','avellaneda'],['capital','lanus'],
  // Norte
  ['tigre','sanfernando'],['tigre','sanisidro'],['sanfernando','sanisidro'],['sanisidro','vicentelopez'],
  ['vicentelopez','sanmartin'],['sanmartin','tresdefebrero'],['sanmartin','sanmiguel'],['sanmiguel','josecpaz'],
  ['sanmiguel','josecpaz'],['sanmiguel','hurlingham'],['sanmiguel','moreno'],['josecpaz','moreno'],
  ['malvinas','sanmiguel'],['malvinas','josecpaz'],['malvinas','moreno'],['malvinas','hurlingham'],
  // Oeste
  ['moreno','merlo'],['moreno','josecpaz'],['moreno','malvinas'],['merlo','ituzaingo'],['merlo','lamatanza'],
  ['ituzaingo','merlo'],['ituzaingo','moron'],['ituzaingo','hurlingham'],
  ['moron','hurlingham'],['moron','ituzaingo'],['moron','tresdefebrero'],['moron','lamatanza'],
  ['hurlingham','sanmiguel'],['hurlingham','malvinas'],['hurlingham','ituzaingo'],['hurlingham','moron'],['hurlingham','tresdefebrero'],
  ['tresdefebrero','sanmartin'],['tresdefebrero','hurlingham'],['tresdefebrero','moron'],['tresdefebrero','ciudadela'],
  ['ciudadela','tresdefebrero'],['ciudadela','flores'],['ciudadela','ramosmejia'],
  ['ramosmejia','ciudadela'],['ramosmejia','moron'],['ramosmejia','sanjusto'],['ramosmejia','lamatanza'],
  // Matanza
  ['lamatanza','moreno'],['lamatanza','merlo'],['lamatanza','moron'],['lamatanza','ramosmejia'],
  ['lamatanza','sanjusto'],['lamatanza','flores'],['lamatanza','ezeiza'],['lamatanza','echeverria'],
  ['sanjusto','lamatanza'],['sanjusto','ramosmejia'],['sanjusto','flores'],
  ['flores','capital'],['flores','ciudadela'],['flores','sanjusto'],['flores','avellaneda'],
  // Sur
  ['avellaneda','capital'],['avellaneda','flores'],['avellaneda','lanus'],['avellaneda','quilmes'],
  ['lanus','capital'],['lanus','avellaneda'],['lanus','lomas'],['lanus','quilmes'],
  ['lomas','lanus'],['lomas','sanjusto'],['lomas','lamatanza'],['lomas','echeverria'],['lomas','brown'],
  ['echeverria','lamatanza'],['echeverria','lomas'],['echeverria','ezeiza'],['echeverria','brown'],
  ['brown','lomas'],['brown','echeverria'],['brown','varela'],['brown','quilmes'],
  ['ezeiza','lamatanza'],['ezeiza','echeverria'],['ezeiza','brown'],
  ['quilmes','avellaneda'],['quilmes','lanus'],['quilmes','brown'],['quilmes','berazategui'],
  ['berazategui','quilmes'],['berazategui','varela'],
  ['varela','berazategui'],['varela','brown'],
];

export const ADJ = {};
TIDS.forEach(id => ADJ[id] = []);
ADJ_PAIRS.forEach(p => { ADJ[p[0]].push(p[1]); ADJ[p[1]].push(p[0]); });

export const PLAYER_COLORS = ['#1d4ed8','#dc2626','#059669','#d97706','#7c3aed','#db2777'];
// El Estado (territorios neutrales) — celeste claro, distintivo de los jugadores
export const STATE_COLOR = '#75a6d9';
export const BOT_NAMES = ['Ringo','Cacho','La Tota','Bocha','El Pity','Chiche','Tute','Turco','Pela','Colo','Firu','El Ruso'];
export const REP_TITLES = [
  [0,'Vecino'], [4,'Barra brava'], [8,'Referente'], [12,'Caudillo'], [16,'Patrón del Conurbano'], [21,'Dueño absoluto'],
];
export const MISSION_KEYS = ['capital','oeste','sur','eliminar'];

// Frases argentinas
export const PHRASES = {
  capitalWin:   ['¡MANDE! ¡LA TOMASTE, BOLUDO!','¡Los genios hacen eso!','Te paraste de mano y te salió de 10','¡Mirá si no sos capo!','¡La Casa Rosada es tuya!','Se armó la podrida y la ganaste vos'],
  capitalLose:  ['¡Se te escapó la tortuga!','Estás al horno','Te hicieron el cuento del tío','Te afanaron la joya, pa','Se te cayó el mercado'],
  territoryWin: ['¡Permiso dijo el petiso!','¡El conurba is yours!','¿Hermosa mañana, verdad?','META','¡Hacelo, nene!','Te tiraste a la pileta y había agua','Se lo lleva puesto','¡Uy la madre, qué bestia!'],
  battleLose:   ['No te bancaste los trapos','Son buenas, te fuiste al mazo','Qué mala leche','Te hicieron bosta','La defensa te comió la tostada','Empate técnico: ganó el que defiende'],
  capDefense:   ['¡La Capital aguanta!','Acá no se rinde nadie','El Estado pone los gordos','¡Chau, foráneo!'],
  trade:        ['Canjeó cartas como un campeón','Negoció en la mesa chica','Hizo la gran avivada del barrio'],
  warn:         ['¡Alerta! ¡Acá el que no corre, vuela!','¡Estás al horno, te toman CABA!','Se viene la contra','Ojo que el que duerme pierde'],
};

export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
