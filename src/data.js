// ============================================================
// DATA — el Conurbano Bonaerense con COORDENADAS GEOGRÁFICAS REALES
// Proyección equirectangular de lat/lon reales de cada partido.
// El Río de la Plata corre por el NORTE/ESTE: la costa va desde
// Tigre-San Fernando-San Isidro-Vicente López (norte) bajando por
// Avellaneda-Quilmes-Berazategui (este). Nada de Quilmes en el mar.
// ============================================================

export const CX = 602, CY = 281; // La Capital (CABA)

export const TERR = [
  { id:'capital', name:'La Capital', full:'La Capital (CABA)', x:602, y:281, r:52, zone:'capital', special:true,
    flavor:'La joya del conurbano: Casa Rosada, Obelisco y la 9 de Julio. El que la tiene, cobra. El que la pierde, llora.' },
  { id:'tigre',       name:'Tigre',           x:325, y:23,  r:26, lp:'b', zone:'norte', flavor:'Delta del Paraná, lanchas, Nordelta y mosquitos que no perdonan.' },
  { id:'sanfernando', name:'San Fernando',    x:371, y:46,  r:23, lp:'r', zone:'norte', flavor:'Astilleros e islas: el que domina el río domina la joda.' },
  { id:'sanisidro',   name:'San Isidro',      x:439, y:92,  r:24, lp:'b', zone:'norte', flavor:'Hipódromo, catedral y la costa más cheta del conurbano.' },
  { id:'vicentelopez',name:'Vicente López',   x:462, y:184, r:21, lp:'r', zone:'norte', flavor:'La costa del poder: la Quinta de Olivos está acá.' },
  { id:'sanmartin',   name:'San Martín',      x:394, y:253, r:22, lp:'t', zone:'norte', flavor:'Parque industrial y peronismo de ley.' },
  { id:'sanmiguel',   name:'San Miguel',      x:142, y:184, r:23, lp:'b', zone:'norte', flavor:'Tranquilo, arbolado... hasta que llega un ejército.' },
  { id:'josecpaz',    name:'José C. Paz',     x:73,  y:184, r:23, lp:'b', zone:'norte', flavor:'Ciudad dormitorio: si dormís, perdés territorios.' },
  { id:'malvinas',    name:'Malvinas Argentinas', x:228, y:120, r:21, lp:'r', zone:'norte', flavor:'Polo industrial y del peronismo profundo del oeste norteño.' },
  { id:'moreno',      name:'Moreno',          x:50,  y:345, r:22, lp:'b', zone:'oeste', flavor:'Punta de riel del Sarmiento: llegar acá ya es conquista.' },
  { id:'merlo',       name:'Merlo',           x:142, y:345, r:22, lp:'b', zone:'oeste', flavor:'Trenes, bandas de rock y quilombo garantizado.' },
  { id:'ituzaingo',   name:'Ituzaingó',       x:211, y:369, r:20, lp:'l', zone:'oeste', flavor:'Residencial y prolijo: el caos se viste de traje.' },
  { id:'moron',       name:'Morón',           x:279, y:345, r:22, lp:'b', zone:'oeste', flavor:'Catedral, plaza y base aérea: el centro neurálgico del oeste.' },
  { id:'tresdefebrero',name:'Tres de Febrero',x:348, y:276, r:21, lp:'r', zone:'oeste', flavor:'Caseros, Ciudad Jardín, El Palomar: gente laburante.' },
  { id:'hurlingham',  name:'Hurlingham',      x:256, y:253, r:20, lp:'t', zone:'oeste', flavor:'Tierra de clubes de rugby: barras que te comen crudo.' },
  { id:'ciudadela',   name:'Ciudadela',       x:371, y:322, r:20, lp:'l', zone:'oeste', flavor:'Fábricas y ferias: el olor a pan es de terror.' },
  { id:'ramosmejia',  name:'Ramos Mejía',     x:348, y:375, r:20, lp:'r', zone:'oeste', flavor:'Shopping Oeste y el tren atestado: rinde en dólares.' },
  { id:'flores',      name:'Flores',          x:485, y:322, r:20, lp:'r', zone:'matanza', flavor:'Barrio porteño “liberado” al otro lado de la General Paz. Cuna del rock.' },
  { id:'sanjusto',    name:'San Justo',       x:371, y:430, r:20, lp:'l', zone:'matanza', flavor:'Cabecera de La Matanza: el palacio municipal es la joya.' },
  { id:'lamatanza',   name:'La Matanza',      x:256, y:505, r:56, zone:'matanza', big:true,
    flavor:'El partido más picante y poblado del país. Virrey del Pino te mira feo.' },
  { id:'avellaneda',  name:'Avellaneda',      x:645, y:369, r:22, lp:'r', zone:'sur', flavor:'Racing vs. Independiente y el puente Pueyrredón: la puerta del sur.' },
  { id:'lanus',       name:'Lanús',           x:577, y:415, r:22, lp:'b', zone:'sur', flavor:'Granate, obreros y Dock Sud: orgullo del sur profundo.' },
  { id:'lomas',       name:'Lomas de Zamora', x:577, y:507, r:22, lp:'r', zone:'sur', flavor:'La Salada, reina de las ferias: guita, punga y estrategia.' },
  { id:'brown',       name:'Almirante Brown', x:577, y:553, r:22, lp:'l', zone:'sur', flavor:'Adrogué, ciudad jardín: parece paz... hasta que atacan.' },
  { id:'ezeiza',      name:'Ezeiza',          x:416, y:622, r:22, lp:'b', zone:'sur', flavor:'Aeropuerto internacional: controlás quién entra y sale.' },
  { id:'echeverria',  name:'Esteban Echeverría', x:477, y:576, r:20, lp:'r', zone:'sur', flavor:'Monte Grande y la cuna del cuento del tío.' },
  { id:'quilmes',     name:'Quilmes',         x:760, y:438, r:24, lp:'b', zone:'sur', flavor:'Sobre la costa del Plata. La cerveza que tomaba el abuelo: botella llena, territorio sano.' },
  { id:'berazategui', name:'Berazategui',     x:833, y:508, r:23, lp:'b', zone:'sur', flavor:'La ciudad del vidrio, sobre el río: todo se ve transparente (menos las alianzas).' },
  { id:'varela',      name:'Florencio Varela',x:737, y:576, r:23, lp:'b', zone:'sur', flavor:'Kilómetro 30 y pico: donde la gamba se estira.' },
];

export const TIDS = TERR.map(t => t.id);

export const ZONES = {
  norte:   { label:'Zona Norte', color:'#7bd0ff',   ids:['tigre','sanfernando','sanisidro','vicentelopez','sanmartin','sanmiguel','josecpaz','malvinas'] },
  oeste:   { label:'Zona Oeste', color:'#f9c03d',   ids:['moreno','merlo','ituzaingo','moron','tresdefebrero','hurlingham','ciudadela','ramosmejia'] },
  matanza: { label:'La Matanza y alrededores', color:'#ff6b6b', ids:['lamatanza','sanjusto','flores'] },
  sur:     { label:'Zona Sur', color:'#c77dff',     ids:['avellaneda','lanus','lomas','brown','ezeiza','echeverria','quilmes','berazategui','varela'] },
};
export const ZKEYS = ['norte','oeste','matanza','sur'];

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
