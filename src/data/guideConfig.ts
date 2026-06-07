export interface GuideQuestion {
  id: string;
  question: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
}

export interface ComponentGuide {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  questions: GuideQuestion[];
  generateQueries: (answers: Record<string, string>) => string[];
  knownManufacturers: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isNo(input: string): boolean {
  return ['ne', 'n', 'není', 'neznám', 'nevím', 'no', 'neni', 'nevim', 'neznam', '-', ''].includes(
    input.toLowerCase().trim()
  );
}

function normalizePoles(input: string): string {
  const l = input.toLowerCase().trim();
  if (l.startsWith('1') || l.includes('1p') || l.includes('jednof')) return '1P';
  if (l.startsWith('2') || l.includes('2p')) return '2P';
  if (l.startsWith('3') || l.includes('3p') || l.includes('třífaz') || l.includes('trifaz')) return '3P';
  if (l.startsWith('4') || l.includes('4p')) return '4P';
  return input.toUpperCase().replace(/[^0-9P]/gi, 'P').slice(0, 2) || input.toUpperCase();
}

function normalizeAmp(input: string): string {
  return input.replace(/[^0-9,.]/g, '').trim();
}

function dedup(arr: string[]): string[] {
  return [...new Set(arr.map(s => s.trim()).filter(Boolean))];
}

// ── Component Guides ──────────────────────────────────────────────────────────

const JISTIC: ComponentGuide = {
  id: 'jistic',
  name: 'Jistič',
  keywords: ['jistič', 'jistic', 'mcb', 'circuit breaker', 'jistice'],
  description: 'Nadproudový jistič (MCB)',
  questions: [
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Schneider, OEZ... nebo "ne"',
      optional: true,
    },
    {
      id: 'amperage',
      question: 'Jakou amperáž hledáš?',
      placeholder: 'např. 16, 25, 32, 63',
    },
    {
      id: 'poles',
      question: 'Kolik pólů?',
      placeholder: '1P, 2P, 3P, 4P',
      options: ['1P', '2P', '3P', '4P'],
    },
    {
      id: 'char',
      question: 'Jakou charakteristiku?',
      placeholder: 'B, C, D, K',
      options: ['B', 'C', 'D', 'K'],
    },
  ],
  generateQueries: (answers) => {
    const amp = normalizeAmp(answers.amperage || '');
    const poles = normalizePoles(answers.poles || '');
    const char = (answers.char || '').toUpperCase().trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (amp && char && poles) {
      queries.push(`${char}${amp} ${poles}`);
      queries.push(`${char}${amp}A ${poles}`);
      queries.push(`${amp}A ${char} ${poles}`);
      queries.push(`${amp} ${char} ${poles}`);
    }
    if (amp && poles) queries.push(`${amp}A ${poles}`);
    if (amp && char) {
      queries.push(`${char}${amp}`);
      queries.push(`${amp}A ${char}`);
    }
    if (mfr && amp && char) queries.push(`${mfr} ${char}${amp}`);
    if (amp) queries.push(`${amp}A`);

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Schneider', 'Eaton', 'Hager', 'OEZ', 'Legrand', 'Moeller'],
};

const MOTOROVY_JISTIC: ComponentGuide = {
  id: 'motorovy-jistic',
  name: 'Motorový jistič',
  keywords: ['motorový jistič', 'motorovy jistic', 'mpcb', 'motor protection', 'pkzm', 'ms116', 'ms132', '3rv'],
  description: 'Motorový ochranný spouštěč (MPCB)',
  questions: [
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Eaton, Schneider... nebo "ne"',
      optional: true,
    },
    {
      id: 'current_range',
      question: 'Jaký nastavitelný rozsah proudu? (min–max)',
      placeholder: 'např. 4-6,3 nebo jen maximální proud 6,3',
    },
    {
      id: 'poles',
      question: 'Počet pólů?',
      placeholder: '3P (obvykle)',
      options: ['3P', '4P'],
    },
  ],
  generateQueries: (answers) => {
    const range = (answers.current_range || '').trim();
    const poles = normalizePoles(answers.poles || '3P');
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (range) {
      queries.push(range);
      queries.push(`${range}A`);
      queries.push(`${range} ${poles}`);
      queries.push(`MS ${range}`);
      queries.push(`3RV ${range}`);
      queries.push(`PKZM ${range}`);
      queries.push(`GV2 ${range}`);
    }
    if (mfr && range) queries.push(`${mfr} ${range}`);

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Eaton', 'Schneider'],
};

const STYKAC: ComponentGuide = {
  id: 'stykac',
  name: 'Stykač',
  keywords: ['stykač', 'stykac', 'contactor', 'schütz'],
  description: 'Elektromagnetický stykač',
  questions: [
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Siemens, Schneider, ABB, Eaton... nebo "ne"',
      optional: true,
    },
    {
      id: 'amperage',
      question: 'Jaký proud (Ie/AC3) v ampérech?',
      placeholder: 'např. 9, 12, 18, 25, 40',
    },
    {
      id: 'coil_voltage',
      question: 'Napájecí napětí cívky?',
      placeholder: '24VDC, 230VAC, 24VAC',
      options: ['24VDC', '230VAC', '24VAC', '48VDC', '110VAC'],
    },
    {
      id: 'poles',
      question: 'Počet pólů?',
      placeholder: '3P nebo 4P',
      options: ['3P', '4P'],
    },
  ],
  generateQueries: (answers) => {
    const amp = normalizeAmp(answers.amperage || '');
    const coil = (answers.coil_voltage || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (amp) {
      queries.push(`stykač ${amp}A`);
      queries.push(`${amp}A stykač`);
    }
    if (amp && coil) {
      queries.push(`${amp}A ${coil}`);
      queries.push(`LC1 ${amp}A`);
      queries.push(`3RT ${amp}A`);
      queries.push(`A${amp}`);
      queries.push(`DILM${amp}`);
    }
    if (mfr && amp) queries.push(`${mfr} ${amp}A`);
    if (amp) {
      queries.push(`LC1-D${amp}`);
      queries.push(`3RT2${amp}`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Siemens', 'Schneider', 'ABB', 'Eaton', 'Moeller'],
};

const RELE: ComponentGuide = {
  id: 'rele',
  name: 'Pomocné relé',
  keywords: ['relé', 'rele', 'relay', 'pomocné relé', 'pomocne rele'],
  description: 'Elektromagnetické pomocné relé',
  questions: [
    {
      id: 'coil_voltage',
      question: 'Napájecí napětí cívky?',
      placeholder: '24VDC, 24VAC, 230VAC',
      options: ['24VDC', '230VAC', '24VAC', '48VDC', '12VDC', '115VAC'],
    },
    {
      id: 'contacts',
      question: 'Kontaktní konfigurace?',
      placeholder: '1CO, 2CO, 4CO (CO = přepínací kontakt)',
      options: ['1CO', '2CO', '4CO', '2NO', '2NC'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Finder, Phoenix Contact, Wago... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const coil = (answers.coil_voltage || '').trim();
    const contacts = (answers.contacts || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const voltNum = coil.replace(/[^0-9]/g, '');
    const queries: string[] = [];

    if (coil) {
      queries.push(`relé ${coil}`);
      queries.push(`${coil} relé`);
    }
    if (coil && contacts) {
      queries.push(`${coil} ${contacts}`);
      queries.push(`${contacts} ${coil}`);
    }
    if (voltNum) {
      queries.push(`40.31 ${voltNum}`);
      queries.push(`PLC-RSC ${voltNum}`);
    }
    if (mfr && coil) queries.push(`${mfr} ${coil}`);

    return dedup(queries);
  },
  knownManufacturers: ['Finder', 'Phoenix Contact', 'Wago', 'TE Connectivity', 'Omron'],
};

const CHRANICR: ComponentGuide = {
  id: 'chranicr',
  name: 'Chránič (RCD)',
  keywords: ['chránič', 'chranicr', 'rcd', 'rccb', 'proudový chránič', 'proudovy chranicr', 'fi'],
  description: 'Proudový chránič (RCD/RCCB)',
  questions: [
    {
      id: 'amperage',
      question: 'Jmenovitý proud?',
      placeholder: '25A, 40A, 63A',
      options: ['25A', '40A', '63A', '100A'],
    },
    {
      id: 'diff_current',
      question: 'Vybavovací reziduální proud (IΔn)?',
      placeholder: '10mA, 30mA, 100mA, 300mA',
      options: ['10mA', '30mA', '100mA', '300mA'],
    },
    {
      id: 'poles',
      question: 'Počet pólů?',
      placeholder: '2P nebo 4P',
      options: ['2P', '4P'],
    },
    {
      id: 'type',
      question: 'Typ chrániče?',
      placeholder: 'AC (střídavý), A (pulzní), B (všeobecný)',
      options: ['AC', 'A', 'B', 'F'],
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const amp = normalizeAmp(answers.amperage || '');
    const diff = (answers.diff_current || '').replace(/[^0-9]/g, '');
    const poles = normalizePoles(answers.poles || '');
    const type = (answers.type || '').trim();
    const queries: string[] = [];

    if (amp && diff) {
      queries.push(`${amp}A ${diff}mA`);
      queries.push(`${amp}A/${diff}mA`);
      if (poles) queries.push(`${amp}A ${diff}mA ${poles}`);
      if (type) queries.push(`${amp}A ${diff}mA ${type}`);
      queries.push(`F${amp}/${diff}`);
      queries.push(`iID ${amp}A ${diff}mA`);
      queries.push(`F2${poles?.replace('P', '')}${amp}-${diff}`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Schneider', 'Hager', 'Siemens', 'Legrand'],
};

const POJISTKA_NH: ComponentGuide = {
  id: 'pojistka-nh',
  name: 'Pojistka NH',
  keywords: ['pojistka nh', 'nh pojistka', 'nh fuse', 'nh00', 'nh0', 'nh1', 'nh2', 'nh3'],
  description: 'Nožová pojistka NH',
  questions: [
    {
      id: 'nh_size',
      question: 'Velikost NH pojistky?',
      placeholder: 'NH00, NH0, NH1, NH2, NH3',
      options: ['NH00', 'NH0', 'NH1', 'NH2', 'NH3'],
    },
    {
      id: 'amperage',
      question: 'Jmenovitý proud?',
      placeholder: 'např. 100, 160, 200, 250, 400',
    },
    {
      id: 'type',
      question: 'Typ pojistky?',
      placeholder: 'gG (všeobecný), aM (motorový)',
      options: ['gG', 'aM', 'gPV'],
    },
  ],
  generateQueries: (answers) => {
    const size = (answers.nh_size || '').toUpperCase().replace('NH', '');
    const amp = normalizeAmp(answers.amperage || '');
    const type = (answers.type || '').trim();
    const queries: string[] = [];

    if (size && amp) {
      queries.push(`NH${size} ${amp}A`);
      queries.push(`${amp}A NH${size}`);
      if (type) queries.push(`${amp}A ${type} NH${size}`);
      queries.push(`LV${amp}` );
      queries.push(`3NA${amp}`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Siemens', 'Eaton', 'ABB', 'OEZ', 'ETI'],
};

const POJISTKA_VALCOVA: ComponentGuide = {
  id: 'pojistka-valcova',
  name: 'Pojistka válcová',
  keywords: ['pojistka válcová', 'pojistka valcova', 'cylindrical fuse', 'válcová', 'valcova', '10x38', '14x51', '22x58'],
  description: 'Válcová tavná pojistka',
  questions: [
    {
      id: 'size',
      question: 'Velikost pojistky (průměr×délka)?',
      placeholder: '10x38, 14x51, 22x58',
      options: ['10x38', '14x51', '22x58', '8x32'],
    },
    {
      id: 'amperage',
      question: 'Jmenovitý proud?',
      placeholder: 'např. 2, 4, 6, 10, 16, 25',
    },
    {
      id: 'type',
      question: 'Typ pojistky?',
      placeholder: 'gG (všeobecný), aM (motorový)',
      options: ['gG', 'aM'],
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const size = (answers.size || '').trim();
    const amp = normalizeAmp(answers.amperage || '');
    const type = (answers.type || '').trim();
    const queries: string[] = [];

    if (amp && size) {
      queries.push(`${amp}A ${size}`);
      queries.push(`${size} ${amp}A`);
      if (type) queries.push(`${amp}A ${type} ${size}`);
    }
    if (amp) {
      if (type) queries.push(`${amp}A ${type}`);
      queries.push(`${amp}A`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Siemens', 'Eaton', 'OEZ', 'ETI', 'Legrand'],
};

const NAPAJECI_ZDROJ: ComponentGuide = {
  id: 'napajeci-zdroj',
  name: 'Napájecí zdroj',
  keywords: ['napájecí zdroj', 'napajeci zdroj', 'psu', 'power supply', 'zdroj', 'napájení'],
  description: 'Spínaný napájecí zdroj (PSU)',
  questions: [
    {
      id: 'output_voltage',
      question: 'Výstupní napětí?',
      placeholder: '24VDC, 12VDC, 5VDC, 48VDC',
      options: ['24VDC', '12VDC', '5VDC', '48VDC'],
    },
    {
      id: 'output_current',
      question: 'Výstupní proud nebo výkon?',
      placeholder: 'např. 5A, 10A, 20A nebo 120W, 240W',
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Phoenix Contact, Wago, Puls, Mean Well... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const volt = (answers.output_voltage || '').replace('VDC', '').replace('V', '').trim();
    const current = (answers.output_current || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (volt && current) {
      queries.push(`${volt}VDC ${current}`);
      queries.push(`${volt}V ${current}`);
      queries.push(`PSU ${volt}V ${current}`);
      queries.push(`QUINT ${volt}V/${current}`);
      queries.push(`TRIO ${volt}V ${current}`);
    }
    if (volt) {
      queries.push(`${volt}VDC zdroj`);
      queries.push(`napájecí zdroj ${volt}V`);
    }
    if (mfr && volt) queries.push(`${mfr} ${volt}V`);

    return dedup(queries);
  },
  knownManufacturers: ['Phoenix Contact', 'Wago', 'Puls', 'Mean Well', 'Murr Elektronik', 'Siemens', 'ABB'],
};

const KABEL: ComponentGuide = {
  id: 'kabel',
  name: 'Kabel',
  keywords: ['kabel', 'vodič', 'cable', 'wire', 'cyky', 'nhxmh', 'ysly', 'liycy', 'cykfy'],
  description: 'Elektrický kabel nebo vodič',
  questions: [
    {
      id: 'cable_type',
      question: 'Typ kabelu?',
      placeholder: 'CYKY, NHXMH, YSLY, LiYCY, CYKFY...',
      options: ['CYKY', 'NHXMH', 'YSLY', 'LiYCY', 'CYKFY', 'CHKE'],
    },
    {
      id: 'conductors',
      question: 'Počet žil?',
      placeholder: '2, 3, 4, 5',
      options: ['2', '3', '4', '5'],
    },
    {
      id: 'section',
      question: 'Průřez žil (mm²)?',
      placeholder: '1,5; 2,5; 4; 6; 10; 16',
      options: ['1,5', '2,5', '4', '6', '10', '16'],
    },
  ],
  generateQueries: (answers) => {
    const type = (answers.cable_type || '').toUpperCase().trim();
    const n = (answers.conductors || '').trim();
    const s = (answers.section || '').trim();
    const queries: string[] = [];

    if (type && n && s) {
      queries.push(`${type} ${n}x${s}`);
      queries.push(`${type} ${n}x${s}mm2`);
      queries.push(`${type}-${n}x${s}`);
      queries.push(`${type}${n}x${s}`);
    }
    if (type && n) queries.push(`${type} ${n}`);
    if (n && s) {
      queries.push(`${n}x${s}`);
      queries.push(`${n}x${s}mm2`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Draka', 'Lapp', 'Helukabel', 'Belden', 'Igus'],
};

const SVORKA: ComponentGuide = {
  id: 'svorka',
  name: 'Svorka',
  keywords: ['svorka', 'terminal block', 'svorkovnice', 'clipline', 'wago 281', 'wago 2081'],
  description: 'Řadová svorkovnice na DIN lištu',
  questions: [
    {
      id: 'type',
      question: 'Typ svorky?',
      placeholder: 'průchodná, PE/ochranná, pojistková, odpojovací',
      options: ['průchodná', 'PE ochranná', 'pojistková', 'odpojovací'],
    },
    {
      id: 'section',
      question: 'Průřez připojení (mm²)?',
      placeholder: 'např. 1,5; 2,5; 4; 6; 10',
      options: ['1,5', '2,5', '4', '6', '10'],
    },
    {
      id: 'vyrobce',
      question: 'Systém / výrobce?',
      placeholder: 'Phoenix Contact (Clipline), Wago (281/2081), ABB... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const type = (answers.type || '').toLowerCase().trim();
    const s = (answers.section || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (s) {
      queries.push(`svorka ${s}mm2`);
      queries.push(`svorka ${s}`);
      queries.push(`UT ${s}`);
      queries.push(`281-${s}`);
      queries.push(`2081-${s}`);
      queries.push(`${s}mm²`);
    }
    if (type.includes('pe') || type.includes('ochrann')) {
      if (s) queries.push(`PE svorka ${s}`);
      queries.push(`UT-PE ${s}`);
    }
    if (mfr) {
      if (s) queries.push(`${mfr} ${s}`);
      queries.push(mfr);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Phoenix Contact', 'Wago', 'ABB', 'Entrelec', 'Weidmüller'],
};

const FREKV_MENIC: ComponentGuide = {
  id: 'frekv-menic',
  name: 'Frekvenční měnič',
  keywords: ['frekvenční měnič', 'frekvencni menic', 'vfd', 'frekvenčák', 'inverter', 'acs', 'altivar', 'micromaster', 'g120'],
  description: 'Frekvenční měnič (VFD) pro řízení otáček',
  questions: [
    {
      id: 'power',
      question: 'Výkon motoru (kW)?',
      placeholder: 'např. 0,37; 0,75; 1,5; 2,2; 4; 7,5; 11; 15',
    },
    {
      id: 'supply',
      question: 'Napájení?',
      placeholder: '1×230VAC nebo 3×400VAC',
      options: ['1×230VAC', '3×400VAC'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Schneider, Danfoss, Lenze... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const kw = (answers.power || '').trim();
    const supply = (answers.supply || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (kw) {
      queries.push(`${kw}kW`);
      queries.push(`frekvenční měnič ${kw}kW`);
      queries.push(`měnič ${kw}kW`);
      queries.push(`ACS ${kw}kW`);
      queries.push(`Altivar ${kw}kW`);
      queries.push(`MICROMASTER ${kw}kW`);
      queries.push(`G120 ${kw}kW`);
      queries.push(`FC302 ${kw}kW`);
      if (supply) queries.push(`${kw}kW ${supply}`);
    }
    if (mfr && kw) queries.push(`${mfr} ${kw}kW`);

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Schneider', 'Danfoss', 'Lenze', 'SEW-Eurodrive'],
};

const SOFT_STARTER: ComponentGuide = {
  id: 'soft-starter',
  name: 'Soft Starter',
  keywords: ['soft starter', 'softstartér', 'softstarter', 'psr', '3rw', 'ats'],
  description: 'Softstartér pro plynulý rozběh motoru',
  questions: [
    {
      id: 'current',
      question: 'Jmenovitý proud motoru nebo výkon?',
      placeholder: 'např. 12A, 25A nebo 5,5kW, 11kW',
    },
    {
      id: 'supply',
      question: 'Napájecí napětí?',
      placeholder: '3×400VAC (obvyklé)',
      options: ['3×400VAC', '3×230VAC'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Schneider, Eaton... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const current = (answers.current || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (current) {
      queries.push(`soft starter ${current}`);
      queries.push(`softstartér ${current}`);
      queries.push(`PSR ${current}`);
      queries.push(`3RW ${current}`);
      queries.push(`ATS ${current}`);
      queries.push(`DS7 ${current}`);
    }
    if (mfr && current) queries.push(`${mfr} soft starter ${current}`);

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Schneider', 'Eaton'],
};

const TRANSFORMATOR: ComponentGuide = {
  id: 'transformator',
  name: 'Transformátor',
  keywords: ['transformátor', 'transformator', 'trafo', 'transformer'],
  description: 'Řídicí nebo silový transformátor',
  questions: [
    {
      id: 'power',
      question: 'Výkon transformátoru (VA nebo kVA)?',
      placeholder: 'např. 63VA, 160VA, 250VA, 0,4kVA',
    },
    {
      id: 'voltage_in',
      question: 'Vstupní napětí?',
      placeholder: '230VAC, 400VAC',
      options: ['230VAC', '400VAC', '230/400VAC'],
    },
    {
      id: 'voltage_out',
      question: 'Výstupní napětí?',
      placeholder: '24VAC, 115VAC, 230VAC',
      options: ['24VAC', '115VAC', '230VAC', '48VAC'],
    },
  ],
  generateQueries: (answers) => {
    const power = (answers.power || '').trim();
    const uin = (answers.voltage_in || '').replace('VAC', '').trim();
    const uout = (answers.voltage_out || '').replace('VAC', '').trim();
    const queries: string[] = [];

    if (power) {
      queries.push(`transformátor ${power}`);
      queries.push(`trafo ${power}`);
      queries.push(`${power}`);
    }
    if (uin && uout) {
      queries.push(`${uin}/${uout}V`);
      queries.push(`${uin}VAC/${uout}VAC`);
      if (power) queries.push(`${power} ${uin}/${uout}`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Block', 'Murr', 'Phoenix Contact', 'Siemens', 'ABB'],
};

// ── Registry ──────────────────────────────────────────────────────────────────

export const COMPONENT_GUIDES: ComponentGuide[] = [
  JISTIC,
  MOTOROVY_JISTIC,
  STYKAC,
  RELE,
  CHRANICR,
  POJISTKA_NH,
  POJISTKA_VALCOVA,
  NAPAJECI_ZDROJ,
  KABEL,
  SVORKA,
  FREKV_MENIC,
  SOFT_STARTER,
  TRANSFORMATOR,
];

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function findComponentGuide(input: string): ComponentGuide | null {
  const normalized = removeDiacritics(input.toLowerCase().trim());
  for (const guide of COMPONENT_GUIDES) {
    for (const keyword of guide.keywords) {
      const normalizedKeyword = removeDiacritics(keyword.toLowerCase());
      if (normalized.includes(normalizedKeyword) || normalizedKeyword.includes(normalized)) {
        return guide;
      }
    }
  }
  return null;
}
