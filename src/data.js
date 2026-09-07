// ============================================================
// DATA — el Conurbano (mapa estilizado, sin precisiones)
// ============================================================

export const CX = 640, CY = 500; // centro de La Capital

export const TERR = [
  { id:'capital', name:'La Capital', full:'La Capital (CABA)', emoji:'🏛️', x:CX, y:CY, r:112, zone:'capital', flavor:'La joya del conurbano. Acá se decide todo (o casi). Obelisco + Casa Rosada + 9 de Julio.', special:true },
  { id:'sanmiguel',   name:'San Miguel',       emoji:'🏘️', x:150,  y:120, r:45, zone:'norte',   flavor:'Tranquilo, arbolado... hasta que llega un ejército.' },
  { id:'josecpaz',    name:'José C. Paz',      emoji:'🛏️', x:330,  y:100, r:45, zone:'norte',   flavor:'Ciudad dormitorio. Si dormís, perdés territorios.' },
  { id:'sanmartin',   name:'San Martín',       emoji:'📦', x:520,  y:140, r:45, zone:'norte',   flavor:'Parque industrial y peronismo de ley.' },
  { id:'vicentelopez',name:'Vicente López',    emoji:'🛳️', x:730,  y:130, r:45, zone:'norte',   flavor:'La costa del poder. La Quinta de Olivos está acá, ojo.' },
  { id:'sanisidro',   name:'San Isidro',       emoji:'🏇', x:920,  y:130, r:45, zone:'norte',   flavor:'Hipódromo, catedral y chetos que huyen del caos.' },
  { id:'sanfernando', name:'San Fernando',     emoji:'⚓', x:1080, y:170, r:45, zone:'norte',   flavor:'Astilleros y islas. El que domina el río, domina la joda.' },
  { id:'tigre',       name:'Tigre',            emoji:'🛶', x:1200, y:300, r:45, zone:'norte',   flavor:'Delta, paseo en lancha y casas sobre el agua. Ni los mosquitos te la perdonan.' },
  { id:'moreno',      name:'Moreno',           emoji:'🚂', x:90,   y:330, r:45, zone:'oeste',   flavor:'Punta de riel del Sarmiento. Llegar acá ya es una conquista.' },
  { id:'ituzaingo',   name:'Ituzaingó',        emoji:'🏡', x:240,  y:300, r:45, zone:'oeste',   flavor:'Residencial y prolijo. Acá el caos se viste de traje.' },
  { id:'moron',       name:'Morón',            emoji:'🚁', x:380,  y:260, r:45, zone:'oeste',   flavor:'Catedral, plaza y la base aérea. El centro neurálgico del oeste.' },
  { id:'tresdefebrero',name:'Tres de Febrero', emoji:'⚙️', x:540,  y:300, r:45, zone:'oeste',   flavor:'Caseros, Ciudad Jardín, el Palomar. Gente laburante y orgullosa.' },
  { id:'ciudadela',   name:'Ciudadela',        emoji:'🏭', x:430,  y:380, r:45, zone:'oeste',   flavor:'Fábricas y ferias. El olor a pan es de terror (para tu defensa).' },
  { id:'ramosmejia',  name:'Ramos Mejía',      emoji:'🛍️', x:230,  y:460, r:45, zone:'oeste',   flavor:'Shopping Oeste y el tren atestado. Conquistar acá rinde en dólares.' },
  { id:'hurlingham',  name:'Hurlingham',       emoji:'🏉', x:130,  y:560, r:45, zone:'oeste',   flavor:'Tierra de clubes de rugby. Barras que te comen crudo.' },
  { id:'merlo',       name:'Merlo',            emoji:'🚆', x:110,  y:700, r:45, zone:'oeste',   flavor:'Trenes, bandas de rock y quilombo garantizado.' },
  { id:'lamatanza',   name:'La Matanza',       emoji:'🛣️', x:480,  y:700, r:64, zone:'matanza', flavor:'El partido más picante del país. Virrey del Pino te mira feo.', big:true },
  { id:'sanjusto',    name:'San Justo',        emoji:'🏢', x:330,  y:620, r:45, zone:'matanza', flavor:'Cabecera de La Matanza. El palacio municipal es la joya.' },
  { id:'flores',      name:'Flores',           emoji:'🎸', x:430,  y:560, r:45, zone:'matanza', flavor:'Barrio porteño “liberado” del otro lado de la General Paz. Cuna del rock.' },
  { id:'ezeiza',      name:'Ezeiza',           emoji:'✈️', x:240,  y:820, r:45, zone:'sur',     flavor:'Aeropuerto internacional. El que controla Ezeiza controla quién entra y sale.' },
  { id:'lomas',       name:'Lomas de Zamora',  emoji:'🛒', x:560,  y:850, r:45, zone:'sur',     flavor:'La Salada, reina de las ferias. Guita, punga y estrategia.' },
  { id:'lanus',       name:'Lanús',            emoji:'🏗️', x:800,  y:560, r:45, zone:'sur',     flavor:'Granate, obreros y Dock Sud. Orgullo del sur profundo.' },
  { id:'avellaneda',  name:'Avellaneda',       emoji:'⚽', x:820,  y:430, r:45, zone:'sur',     flavor:'Racing vs. Independiente: el clásico más picante se juega acá.' },
  { id:'quilmes',     name:'Quilmes',          emoji:'🍺', x:940,  y:620, r:45, zone:'sur',     flavor:'La cerveza que tomaba el abuelo. Botella llena, territorio sano.' },
  { id:'berazategui', name:'Berazategui',      emoji:'🪟', x:1120, y:600, r:45, zone:'sur',     flavor:'La ciudad del vidrio. Acá todo se ve transparente (menos las alianzas).' },
  { id:'varela',      name:'Florencio Varela', emoji:'🛠️', x:1000, y:780, r:45, zone:'sur',     flavor:'Kilómetro 30 y pico. El sur del sur, donde la gamba se estira.' },
  { id:'brown',       name:'Almirante Brown',  emoji:'🌳', x:760,  y:860, r:45, zone:'sur',     flavor:'Adrogué, ciudad jardín. Parece paz... hasta que atacan.' },
];

export const TIDS = TERR.map(t => t.id);

export const ZONES = {
  norte:   { label:'Zona Norte', color:'var(--norte)',   ids:['sanmiguel','josecpaz','sanmartin','vicentelopez','sanisidro','sanfernando','tigre'] },
  oeste:   { label:'Zona Oeste', color:'var(--oeste)',   ids:['moreno','ituzaingo','moron','tresdefebrero','ciudadela','ramosmejia','hurlingham','merlo'] },
  matanza: { label:'La Matanza y alrededores', color:'var(--matanza)', ids:['lamatanza','sanjusto','flores'] },
  sur:     { label:'Zona Sur', color:'var(--sur)',       ids:['ezeiza','lomas','lanus','avellaneda','quilmes','berazategui','varela','brown'] },
};
export const ZKEYS = ['norte','oeste','matanza','sur'];

export const ADJ_PAIRS = [
  ['capital','tresdefebrero'],['capital','ciudadela'],['capital','flores'],['capital','vicentelopez'],
  ['capital','lanus'],['capital','avellaneda'],['capital','sanisidro'],
  ['sanmiguel','josecpaz'],['sanmiguel','sanmartin'],['sanmiguel','moreno'],
  ['josecpaz','sanmartin'],['josecpaz','moreno'],['sanmartin','vicentelopez'],['sanmartin','tresdefebrero'],
  ['vicentelopez','sanisidro'],['sanisidro','sanfernando'],['sanfernando','tigre'],
  ['moreno','ituzaingo'],['moreno','merlo'],['ituzaingo','moron'],['ituzaingo','hurlingham'],['ituzaingo','merlo'],
  ['moron','tresdefebrero'],['moron','ciudadela'],['moron','ramosmejia'],['moron','hurlingham'],
  ['tresdefebrero','ciudadela'],['ciudadela','flores'],['ramosmejia','lamatanza'],['ramosmejia','sanjusto'],
  ['merlo','lamatanza'],['lamatanza','sanjusto'],['lamatanza','flores'],['lamatanza','ezeiza'],
  ['sanjusto','flores'],['ezeiza','lomas'],['lomas','lanus'],['lomas','brown'],['lanus','avellaneda'],
  ['lanus','quilmes'],['quilmes','berazategui'],['berazategui','varela'],['varela','brown'],
];

export const ADJ = {};
TIDS.forEach(id => ADJ[id] = []);
ADJ_PAIRS.forEach(p => { ADJ[p[0]].push(p[1]); ADJ[p[1]].push(p[0]); });

export const CAP_EMOJI = '🏛️';
export const PLAYER_COLORS = ['#ff4444','#2ec4ff','#b4ff39','#ffb020','#c77dff','#ff5da2'];
export const BOT_NAMES = ['Ringo','Cacho','La Tota','Bocha','El Pity','Chiche','Tute','Turco','Pela','Colo','Firu','El Ruso'];
export const REP_TITLES = [
  [0,'Punga'], [4,'Chorro de barrio'], [8,'Aguantador'], [12,'Manejador'], [16,'Titular del Conurbano'], [21,'Dueño absoluto'],
];
export const MISSION_KEYS = ['matanza','capital','doble','el10'];

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
