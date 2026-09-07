// ============================================================
// DATA — el Conurbano Bonaerense con COORDENADAS GEOGRÁFICAS REALES
// Proyección equirectangular de lat/lon reales de cada partido.
// El Río de la Plata corre por el NORTE/ESTE: la costa va desde
// Tigre-San Fernando-San Isidro-Vicente López (norte) bajando por
// Avellaneda-Quilmes-Berazategui (este). Nada de Quilmes en el mar.
// ============================================================

export const CX = 585, CY = 470; // La Capital (CABA) — centro, junto al río

// Posiciones geográficas reales del AMBA: Norte arriba, Oeste izquierda,
// Sur abajo, CABA en el centro-este, Río de la Plata al este.
// Cada zona es una región contigua (como en el mapa real).
export const TERR = [
  { id:'capital', name:'La Capital', full:'La Capital (CABA)', x:585, y:470, r:52, zone:'capital', special:true,
    flavor:'La joya del conurbano: Casa Rosada, Obelisco y la 9 de Julio. El que la tiene, cobra. El que la pierde, llora.' },
  // ZONA NORTE (franja superior; ribereños al noreste sobre el río)
  { id:'sanmiguel',   name:'San Miguel',      x:350, y:100, r:24, zone:'norte', flavor:'Tranquilo, arbolado... hasta que llega un ejército.' },
  { id:'josecpaz',    name:'José C. Paz',     x:225, y:150, r:24, zone:'norte', flavor:'Ciudad dormitorio: si dormís, perdés territorios.' },
  { id:'malvinas',    name:'Malvinas Argentinas', x:120, y:200, r:22, zone:'norte', flavor:'Polo industrial y del peronismo profundo del oeste norteño.' },
  { id:'sanmartin',   name:'San Martín',      x:470, y:170, r:24, zone:'norte', flavor:'Parque industrial y peronismo de ley.' },
  { id:'vicentelopez',name:'Vicente López',   x:660, y:180, r:22, zone:'norte', flavor:'La costa del poder: la Quinta de Olivos está acá.' },
  { id:'sanisidro',   name:'San Isidro',      x:790, y:230, r:23, zone:'norte', flavor:'Hipódromo, catedral y la costa más cheta del conurbano.' },
  { id:'sanfernando', name:'San Fernando',    x:905, y:300, r:22, zone:'norte', flavor:'Astilleros e islas: el que domina el río domina la joda.' },
  { id:'tigre',       name:'Tigre',           x:1015, y:360, r:24, zone:'norte', flavor:'Delta del Paraná, lanchas, Nordelta y mosquitos que no perdonan.' },
  // ZONA OESTE (franja izquierda/media)
  { id:'moreno',      name:'Moreno',          x:105, y:430, r:23, zone:'oeste', flavor:'Punta de riel del Sarmiento: llegar acá ya es conquista.' },
  { id:'merlo',       name:'Merlo',           x:190, y:520, r:23, zone:'oeste', flavor:'Trenes, bandas de rock y quilombo garantizado.' },
  { id:'ituzaingo',   name:'Ituzaingó',       x:300, y:430, r:22, zone:'oeste', flavor:'Residencial y prolijo: el caos se viste de traje.' },
  { id:'hurlingham',  name:'Hurlingham',      x:405, y:380, r:22, zone:'oeste', flavor:'Tierra de clubes de rugby: barras que te comen crudo.' },
  { id:'moron',       name:'Morón',           x:270, y:600, r:23, zone:'oeste', flavor:'Catedral, plaza y base aérea: el centro neurálgico del oeste.' },
  { id:'tresdefebrero',name:'Tres de Febrero',x:460, y:320, r:22, zone:'oeste', flavor:'Caseros, Ciudad Jardín, El Palomar: gente laburante.' },
  { id:'ciudadela',   name:'Ciudadela',       x:475, y:420, r:21, zone:'oeste', flavor:'Fábricas y ferias: el olor a pan es de terror.' },
  { id:'ramosmejia',  name:'Ramos Mejía',     x:365, y:540, r:21, zone:'oeste', flavor:'Shopping Oeste y el tren atestado: rinde en dólares.' },
  { id:'flores',      name:'Flores',          x:530, y:540, r:21, zone:'oeste', flavor:'Barrio porteño “liberado” al otro lado de la General Paz. Cuna del rock.' },
  { id:'sanjusto',    name:'San Justo',       x:430, y:610, r:21, zone:'oeste', flavor:'Cabecera de La Matanza: el palacio municipal es la joya.' },
  { id:'lamatanza',   name:'La Matanza',      x:250, y:690, r:40, zone:'oeste', big:true,
    flavor:'El partido más picante y poblado del país. Virrey del Pino te mira feo.' },
  // ZONA SUR (franja inferior)
  { id:'avellaneda',  name:'Avellaneda',      x:650, y:690, r:23, zone:'sur', flavor:'Racing vs. Independiente y el puente Pueyrredón: la puerta del sur.' },
  { id:'lanus',       name:'Lanús',           x:600, y:760, r:23, zone:'sur', flavor:'Granate, obreros y Dock Sud: orgullo del sur profundo.' },
  { id:'quilmes',     name:'Quilmes',         x:820, y:740, r:24, zone:'sur', flavor:'Sobre la costa del Plata. La cerveza que tomaba el abuelo: botella llena, territorio sano.' },
  { id:'lomas',       name:'Lomas de Zamora', x:600, y:840, r:23, zone:'sur', flavor:'La Salada, reina de las ferias: guita, punga y estrategia.' },
  { id:'echeverria',  name:'Esteban Echeverría', x:480, y:880, r:21, zone:'sur', flavor:'Monte Grande y la cuna del cuento del tío.' },
  { id:'ezeiza',      name:'Ezeiza',          x:360, y:920, r:22, zone:'sur', flavor:'Aeropuerto internacional: controlás quién entra y sale.' },
  { id:'brown',       name:'Almirante Brown', x:700, y:920, r:23, zone:'sur', flavor:'Adrogué, ciudad jardín: parece paz... hasta que atacan.' },
  { id:'varela',      name:'Florencio Varela',x:830, y:910, r:22, zone:'sur', flavor:'Kilómetro 30 y pico: donde la gamba se estira.' },
  { id:'berazategui', name:'Berazategui',     x:980, y:820, r:23, zone:'sur', flavor:'La ciudad del vidrio, sobre el río: todo se ve transparente (menos las alianzas).' },
];

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
