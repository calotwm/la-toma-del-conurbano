// ============================================================
// DATA — el Conurbano Bonaerense en mapa geográfico estilizado
// (Río de la Plata al este, CABA como bastión central)
// ============================================================

export const CX = 545, CY = 322; // centro de La Capital

export const TERR = [
  { id:'capital', name:'La Capital', full:'La Capital (CABA)', x:CX, y:CY, r:60, zone:'capital', special:true,
    flavor:'La joya del conurbano: Casa Rosada, Obelisco y la 9 de Julio. El que la tiene, cobra. El que la pierde, llora.' },
  { id:'sanmiguel',   name:'San Miguel',      x:200, y:152, r:24, zone:'norte', flavor:'Tranquilo, arbolado... hasta que llega un ejército.' },
  { id:'josecpaz',    name:'José C. Paz',     x:296, y:96,  r:24, zone:'norte', flavor:'Ciudad dormitorio: si dormís, perdés territorios.' },
  { id:'sanmartin',   name:'San Martín',      x:415, y:238, r:24, zone:'norte', flavor:'Parque industrial y peronismo de ley.' },
  { id:'vicentelopez',name:'Vicente López',   x:452, y:168, r:24, zone:'norte', flavor:'La costa del poder: la Quinta de Olivos está acá.' },
  { id:'sanisidro',   name:'San Isidro',      x:515, y:128, r:24, zone:'norte', flavor:'Hipódromo, catedral y chetos que huyen del caos.' },
  { id:'sanfernando', name:'San Fernando',    x:600, y:96,  r:24, zone:'norte', flavor:'Astilleros e islas: el que domina el río domina la joda.' },
  { id:'tigre',       name:'Tigre',           x:672, y:58,  r:25, zone:'norte', flavor:'Delta, paseo en lancha y casas sobre el agua.' },
  { id:'moreno',      name:'Moreno',          x:118, y:296, r:24, zone:'oeste', flavor:'Punta de riel del Sarmiento: llegar acá ya es conquista.' },
  { id:'ituzaingo',   name:'Ituzaingó',       x:232, y:318, r:24, zone:'oeste', flavor:'Residencial y prolijo: el caos se viste de traje.' },
  { id:'moron',       name:'Morón',           x:326, y:298, r:24, zone:'oeste', flavor:'Catedral, plaza y base aérea: el centro neurálgico del oeste.' },
  { id:'tresdefebrero',name:'Tres de Febrero',x:426, y:272, r:24, zone:'oeste', flavor:'Caseros, Ciudad Jardín, El Palomar: gente laburante.' },
  { id:'ciudadela',   name:'Ciudadela',       x:452, y:322, r:24, zone:'oeste', flavor:'Fábricas y ferias: el olor a pan es de terror.' },
  { id:'ramosmejia',  name:'Ramos Mejía',     x:296, y:388, r:24, zone:'oeste', flavor:'Shopping Oeste y el tren atestado: rinde en dólares.' },
  { id:'hurlingham',  name:'Hurlingham',      x:204, y:478, r:24, zone:'oeste', flavor:'Tierra de clubes de rugby: barras que te comen crudo.' },
  { id:'merlo',       name:'Merlo',           x:148, y:420, r:24, zone:'oeste', flavor:'Trenes, bandas de rock y quilombo garantizado.' },
  { id:'lamatanza',   name:'La Matanza',      x:298, y:548, r:58, zone:'matanza', big:true,
    flavor:'El partido más picante del país. Virrey del Pino te mira feo.' },
  { id:'sanjusto',    name:'San Justo',       x:378, y:512, r:24, zone:'matanza', flavor:'Cabecera de La Matanza: el palacio municipal es la joya.' },
  { id:'flores',      name:'Flores',          x:470, y:386, r:24, zone:'matanza', flavor:'Barrio porteño “liberado” al otro lado de la General Paz. Cuna del rock.' },
  { id:'ezeiza',      name:'Ezeiza',          x:188, y:678, r:24, zone:'sur', flavor:'Aeropuerto internacional: controlás quién entra y sale.' },
  { id:'lomas',       name:'Lomas de Zamora', x:498, y:584, r:24, zone:'sur', flavor:'La Salada, reina de las ferias: guita, punga y estrategia.' },
  { id:'lanus',       name:'Lanús',           x:598, y:490, r:24, zone:'sur', flavor:'Granate, obreros y Dock Sud: orgullo del sur profundo.' },
  { id:'avellaneda',  name:'Avellaneda',      x:598, y:404, r:24, zone:'sur', flavor:'Racing vs. Independiente: el clásico más picante se juega acá.' },
  { id:'quilmes',     name:'Quilmes',         x:700, y:500, r:24, zone:'sur', flavor:'La cerveza que tomaba el abuelo: botella llena, territorio sano.' },
  { id:'berazategui', name:'Berazategui',     x:752, y:586, r:24, zone:'sur', flavor:'La ciudad del vidrio: todo se ve transparente (menos las alianzas).' },
  { id:'varela',      name:'Florencio Varela',x:622, y:690, r:24, zone:'sur', flavor:'Kilómetro 30 y pico: donde la gamba se estira.' },
  { id:'brown',       name:'Almirante Brown', x:468, y:700, r:24, zone:'sur', flavor:'Adrogué, ciudad jardín: parece paz... hasta que atacan.' },
];

export const TIDS = TERR.map(t => t.id);

export const ZONES = {
  norte:   { label:'Zona Norte', color:'#7bd0ff',   ids:['sanmiguel','josecpaz','sanmartin','vicentelopez','sanisidro','sanfernando','tigre'] },
  oeste:   { label:'Zona Oeste', color:'#f9c03d',   ids:['moreno','ituzaingo','moron','tresdefebrero','ciudadela','ramosmejia','hurlingham','merlo'] },
  matanza: { label:'La Matanza y alrededores', color:'#ff6b6b', ids:['lamatanza','sanjusto','flores'] },
  sur:     { label:'Zona Sur', color:'#c77dff',     ids:['ezeiza','lomas','lanus','avellaneda','quilmes','berazategui','varela','brown'] },
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

export const PLAYER_COLORS = ['#ff4d4d','#0284c7','#22c55e','#eab308','#a855f7','#f97316'];
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
