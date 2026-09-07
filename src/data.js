// ============================================================
// DATA — el Conurbano Bonaerense con COORDENADAS GEOGRÁFICAS REALES
// Proyección equirectangular de lat/lon reales de cada partido.
// El Río de la Plata corre por el NORTE/ESTE: la costa va desde
// Tigre-San Fernando-San Isidro-Vicente López (norte) bajando por
// Avellaneda-Quilmes-Berazategui (este). Nada de Quilmes en el mar.
// ============================================================

export const CX = 560, CY = 380; // La Capital (CABA)

// Coordenadas normalizadas a grilla 1000x800 (geografía real del AMBA):
// Norte arriba, Oeste izquierda, Sur abajo, CABA centro, río al este.
export const TERR = [
  { id:'capital', name:'La Capital', full:'La Capital (CABA)', x:560, y:380, r:18, zone:'capital', special:true,
    flavor:'La joya del conurbano: Casa Rosada, Obelisco y la 9 de Julio. El que la tiene, cobra. El que la pierde, llora.' },
  // ZONA NORTE
  { id:'tigre',       name:'Tigre',           x:420, y:110, r:18, zone:'norte', flavor:'Delta del Paraná, lanchas, Nordelta y mosquitos que no perdonan.' },
  { id:'sanfernando', name:'San Fernando',    x:470, y:150, r:18, zone:'norte', flavor:'Astilleros e islas: el que domina el río domina la joda.' },
  { id:'sanisidro',   name:'San Isidro',      x:510, y:190, r:18, zone:'norte', flavor:'Hipódromo, catedral y la costa más cheta del conurbano.' },
  { id:'vicentelopez',name:'Vicente López',   x:550, y:240, r:18, zone:'norte', flavor:'La costa del poder: la Quinta de Olivos está acá.' },
  { id:'sanmartin',   name:'San Martín',      x:470, y:280, r:18, zone:'norte', flavor:'Parque industrial y peronismo de ley.' },
  { id:'sanmiguel',   name:'San Miguel',      x:300, y:220, r:18, zone:'norte', flavor:'Tranquilo, arbolado... hasta que llega un ejército.' },
  { id:'josecpaz',    name:'José C. Paz',     x:240, y:200, r:18, zone:'norte', flavor:'Ciudad dormitorio: si dormís, perdés territorios.' },
  { id:'malvinas',    name:'Malvinas Argentinas', x:320, y:160, r:18, zone:'norte', flavor:'Polo industrial y del peronismo profundo del oeste norteño.' },
  // ZONA OESTE
  { id:'moreno',      name:'Moreno',          x:130, y:380, r:18, zone:'oeste', flavor:'Punta de riel del Sarmiento: llegar acá ya es conquista.' },
  { id:'merlo',       name:'Merlo',           x:180, y:470, r:18, zone:'oeste', flavor:'Trenes, bandas de rock y quilombo garantizado.' },
  { id:'ituzaingo',   name:'Ituzaingó',       x:230, y:390, r:18, zone:'oeste', flavor:'Residencial y prolijo: el caos se viste de traje.' },
  { id:'hurlingham',  name:'Hurlingham',      x:310, y:330, r:18, zone:'oeste', flavor:'Tierra de clubes de rugby: barras que te comen crudo.' },
  { id:'moron',       name:'Morón',           x:280, y:430, r:18, zone:'oeste', flavor:'Catedral, plaza y base aérea: el centro neurálgico del oeste.' },
  { id:'tresdefebrero',name:'Tres de Febrero',x:410, y:330, r:18, zone:'oeste', flavor:'Caseros, Ciudad Jardín, El Palomar: gente laburante.' },
  { id:'ciudadela',   name:'Ciudadela',       x:460, y:360, r:18, zone:'oeste', flavor:'Fábricas y ferias: el olor a pan es de terror.' },
  { id:'ramosmejia',  name:'Ramos Mejía',     x:380, y:420, r:18, zone:'oeste', flavor:'Shopping Oeste y el tren atestado: rinde en dólares.' },
  { id:'flores',      name:'Flores',          x:500, y:410, r:18, zone:'oeste', flavor:'Barrio porteño “liberado” al otro lado de la General Paz. Cuna del rock.' },
  { id:'sanjusto',    name:'San Justo',       x:390, y:480, r:18, zone:'oeste', flavor:'Cabecera de La Matanza: el palacio municipal es la joya.' },
  { id:'lamatanza',   name:'La Matanza',      x:260, y:560, r:30, zone:'oeste', big:true,
    flavor:'El partido más picante y poblado del país. Virrey del Pino te mira feo.' },
  // ZONA SUR
  { id:'avellaneda',  name:'Avellaneda',      x:610, y:460, r:18, zone:'sur', flavor:'Racing vs. Independiente y el puente Pueyrredón: la puerta del sur.' },
  { id:'lanus',       name:'Lanús',           x:570, y:520, r:18, zone:'sur', flavor:'Granate, obreros y Dock Sud: orgullo del sur profundo.' },
  { id:'quilmes',     name:'Quilmes',         x:690, y:540, r:18, zone:'sur', flavor:'Sobre la costa del Plata. La cerveza que tomaba el abuelo: botella llena, territorio sano.' },
  { id:'lomas',       name:'Lomas de Zamora', x:530, y:580, r:18, zone:'sur', flavor:'La Salada, reina de las ferias: guita, punga y estrategia.' },
  { id:'echeverria',  name:'Esteban Echeverría', x:450, y:680, r:18, zone:'sur', flavor:'Monte Grande y la cuna del cuento del tío.' },
  { id:'ezeiza',      name:'Ezeiza',          x:350, y:710, r:18, zone:'sur', flavor:'Aeropuerto internacional: controlás quién entra y sale.' },
  { id:'brown',       name:'Almirante Brown', x:560, y:660, r:18, zone:'sur', flavor:'Adrogué, ciudad jardín: parece paz... hasta que atacan.' },
  { id:'varela',      name:'Florencio Varela',x:650, y:670, r:18, zone:'sur', flavor:'Kilómetro 30 y pico: donde la gamba se estira.' },
  { id:'berazategui', name:'Berazategui',     x:760, y:610, r:18, zone:'sur', flavor:'La ciudad del vidrio, sobre el río: todo se ve transparente (menos las alianzas).' },
];

export const TIDS = TERR.map(t => t.id);

export const ZONES = {
  capital: { label:'Capital Federal', color:'#facc15', stroke:'#eab308', bgPath:'M 540,340 L 610,360 L 590,440 L 520,410 Z', ids:['capital'] },
  norte:   { label:'Zona Norte', color:'#ec4899', stroke:'#db2777', bgPath:'M 200,160 L 430,70 L 590,220 L 520,320 L 370,300 Z', ids:['tigre','sanfernando','sanisidro','vicentelopez','sanmartin','sanmiguel','josecpaz','malvinas'] },
  oeste:   { label:'Zona Oeste', color:'#f97316', stroke:'#ea580c', bgPath:'M 90,350 L 380,280 L 520,390 L 420,530 L 220,620 Z', ids:['moreno','merlo','ituzaingo','hurlingham','moron','tresdefebrero','ciudadela','ramosmejia','flores','sanjusto','lamatanza'] },
  sur:     { label:'Zona Sur', color:'#22c55e', stroke:'#16a34a', bgPath:'M 540,440 L 730,500 L 810,610 L 610,740 L 310,750 Z', ids:['avellaneda','lanus','quilmes','lomas','echeverria','ezeiza','brown','varela','berazategui'] },
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
export const MISSION_KEYS = ['capital','oeste','sur','eliminar','norte','suroeste','contorno','el10','triple'];

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
