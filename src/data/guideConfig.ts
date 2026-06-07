export interface GuideQuestion {
  id: string;
  question: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  /** Pokud je definováno, otázka se zobrazí jen když podmínka vrátí true */
  condition?: (answers: Record<string, string>) => boolean;
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
  return input.toUpperCase().replace(/[^0-9]/gi, '') + 'P' || input.toUpperCase();
}

function normalizeAmp(input: string): string {
  return input.replace(/[^0-9,.]/g, '').trim();
}

function dedup(arr: string[]): string[] {
  return [...new Set(arr.map(s => s.trim()).filter(Boolean))];
}

function isMCB(a: Record<string, string>): boolean {
  return (a.subtype || '').toLowerCase().includes('mcb') ||
    (a.subtype || '').toLowerCase().includes('nadproud') ||
    (a.subtype || '').toLowerCase().includes('standardní');
}

function isMPCB(a: Record<string, string>): boolean {
  return (a.subtype || '').toLowerCase().includes('mpcb') ||
    (a.subtype || '').toLowerCase().includes('motorový') ||
    (a.subtype || '').toLowerCase().includes('motor');
}

function isSilovy(a: Record<string, string>): boolean {
  return !isAux(a);
}

function isAux(a: Record<string, string>): boolean {
  return (a.subtype || '').toLowerCase().includes('pomocný') ||
    (a.subtype || '').toLowerCase().includes('auxiliary') ||
    (a.subtype || '').toLowerCase().includes('aux');
}

// ── JISTIČ (MCB + MPCB) ───────────────────────────────────────────────────────

const JISTIC: ComponentGuide = {
  id: 'jistic',
  name: 'Jistič',
  keywords: ['jistič', 'jistic', 'mcb', 'mpcb', 'motorový jistič', 'motorovy jistic',
    'circuit breaker', 'jistice', 'motor protection'],
  description: 'Nadproudový jistič (MCB) nebo Motorový jistič (MPCB)',
  questions: [
    {
      id: 'subtype',
      question: 'Jaký typ jističe hledáš?',
      options: ['Nadproudový – MCB', 'Motorový – MPCB'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Schneider, OEZ, Hager, Eaton... nebo "ne"',
      optional: true,
    },
    {
      id: 'amperage',
      question: 'Jakou amperáž? (jmenovitý proud In)',
      placeholder: 'např. 6, 10, 16, 25, 32, 40, 63',
      condition: isMCB,
    },
    {
      id: 'current_range',
      question: 'Jaký nastavitelný rozsah proudu (min–max)?',
      placeholder: 'např. 4-6,3 nebo 1-1,6 nebo 9-14',
      condition: isMPCB,
    },
    {
      id: 'poles',
      question: 'Kolik pólů?',
      options: ['1P', '2P', '3P', '4P'],
    },
    {
      id: 'char',
      question: 'Jakou charakteristiku?',
      options: ['B', 'C', 'D', 'K'],
      condition: isMCB,
    },
  ],
  generateQueries: (answers) => {
    const queries: string[] = [];

    if (isMCB(answers)) {
      const amp = normalizeAmp(answers.amperage || '');
      const poles = normalizePoles(answers.poles || '');
      const char = (answers.char || '').toUpperCase().trim();
      const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';

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

      // Výrobcovská typová označení
      if (mfr) {
        const mLow = mfr.toLowerCase();
        if (mLow.includes('abb') && amp && char) {
          queries.push(`S2${poles.replace('P', '')}${poles.length > 1 ? '0' : ''}-${char}${amp}`);
          queries.push(`SH2${poles.replace('P', '')}${poles.length > 1 ? '0' : ''}-${char}${amp}`);
        }
        if ((mLow.includes('siemens') || mLow.includes('sie')) && amp && char) {
          queries.push(`5SL${poles.replace('P', '') === '1' ? '4' : '6'}${poles.replace('P', '')}${char}${amp}`);
        }
        if ((mLow.includes('oez') || mLow.includes('oéz')) && amp && char) {
          queries.push(`LTE-${poles.replace('P', '')}-${char}${amp}`);
          queries.push(`LTE-${char}${amp}`);
        }
        if (mLow.includes('schneider') && amp && char) {
          queries.push(`iC60N ${char}${amp}A`);
          queries.push(`iC60 ${char}${amp}`);
        }
        if ((mLow.includes('eaton') || mLow.includes('moeller')) && amp && char) {
          queries.push(`PXL-${char}${amp}/${poles.replace('P', '')}`);
          queries.push(`FAZ-${char}${amp}/${poles.replace('P', '')}`);
        }
        if (mLow.includes('hager') && amp && char) {
          queries.push(`MCN${poles.replace('P', '')}${amp.padStart(2, '0')}${char}`);
        }
      }

    } else if (isMPCB(answers)) {
      const range = (answers.current_range || '').trim();
      const poles = normalizePoles(answers.poles || '3P');
      const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';

      if (range) {
        queries.push(range);
        queries.push(`${range}A`);
        queries.push(`${range} ${poles}`);
        queries.push(`MS ${range}`);
        queries.push(`MS116-${range.split('-')[1] || range}`);
        queries.push(`MS132-${range.split('-')[1] || range}`);
        queries.push(`3RV ${range}`);
        queries.push(`3RV1 ${range}`);
        queries.push(`PKZM ${range}`);
        queries.push(`PKZM0-${range.split('-')[1] || range}`);
        queries.push(`GV2 ${range}`);
        queries.push(`GV2ME`);
      }
      if (mfr && range) queries.push(`${mfr} ${range}`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Schneider', 'OEZ', 'Eaton', 'Hager', 'Legrand'],
};

// ── STYKAČ (silový + pomocný) ────────────────────────────────────────────────

const STYKAC: ComponentGuide = {
  id: 'stykac',
  name: 'Stykač',
  keywords: ['stykač', 'stykac', 'contactor', 'schütz', 'pomocný stykač', 'pomocny stykac',
    'auxiliary contactor', 'lc1', '3rt', 'dilm'],
  description: 'Silový stykač nebo Pomocný stykač',
  questions: [
    {
      id: 'subtype',
      question: 'Jaký typ stykače hledáš?',
      options: ['Silový stykač', 'Pomocný stykač'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Siemens, Schneider, ABB, Eaton... nebo "ne"',
      optional: true,
    },
    {
      id: 'amperage',
      question: 'Proud Ie (AC3) v ampérech?',
      placeholder: 'např. 9, 12, 18, 25, 32, 40, 65',
      condition: isSilovy,
    },
    {
      id: 'contacts',
      question: 'Konfigurace kontaktů?',
      placeholder: '2NO, 4NO, 2NO+2NC, 4NO+4NC',
      options: ['2NO', '4NO', '2NO+2NC', '4NO+4NC', '1NO', '1NC'],
      condition: isAux,
    },
    {
      id: 'coil_voltage',
      question: 'Napájecí napětí cívky?',
      placeholder: '24VDC, 230VAC, 24VAC, 110VAC',
      options: ['24VDC', '230VAC', '24VAC', '48VDC', '110VAC'],
    },
    {
      id: 'poles',
      question: 'Počet hlavních pólů?',
      options: ['3P', '4P'],
      condition: isSilovy,
    },
  ],
  generateQueries: (answers) => {
    const queries: string[] = [];
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const coil = (answers.coil_voltage || '').trim();

    if (isSilovy(answers)) {
      const amp = normalizeAmp(answers.amperage || '');

      if (amp) {
        queries.push(`stykač ${amp}A`);
        queries.push(`${amp}A stykač`);
        if (coil) queries.push(`${amp}A ${coil}`);
        queries.push(`LC1D${amp}`);
        queries.push(`LC1-D${amp}`);
        queries.push(`3RT2 ${amp}A`);
        queries.push(`A${amp}`);
        queries.push(`DILM${amp}`);
      }
      if (mfr && amp) queries.push(`${mfr} stykač ${amp}A`);

      // Specifická typová označení dle výrobce a proudu
      if (amp) {
        const ampN = parseInt(amp);
        if (!isNaN(ampN)) {
          // Siemens 3RT2 mapování
          const sie: Record<number, string> = {
            7: '3RT2015', 9: '3RT2016', 12: '3RT2017', 17: '3RT2025',
            25: '3RT2026', 40: '3RT2035', 50: '3RT2036', 65: '3RT2044',
            80: '3RT2045', 95: '3RT2046',
          };
          if (sie[ampN]) queries.push(sie[ampN]);
          // Schneider LC1D mapování
          const sch: Record<number, string> = {
            9: 'LC1D09', 12: 'LC1D12', 18: 'LC1D18', 25: 'LC1D25',
            32: 'LC1D32', 40: 'LC1D40', 50: 'LC1D50', 65: 'LC1D65',
            80: 'LC1D80', 95: 'LC1D95',
          };
          if (sch[ampN]) queries.push(sch[ampN]);
        }
      }

    } else {
      // Pomocný stykač
      const contacts = (answers.contacts || '').trim();
      if (contacts) {
        queries.push(`pomocný stykač ${contacts}`);
        queries.push(`${contacts} pomocný stykač`);
        if (coil) queries.push(`${contacts} ${coil}`);
        queries.push(`3RH2 ${contacts}`);
        queries.push(`CAD ${contacts}`);
        queries.push(`DILER-${contacts.replace('+', '').replace('NO', '').replace('NC', '')}`);
        queries.push(`DILER`);
        queries.push(`3RH`);
        queries.push(`CA4`);
      }
    }

    return dedup(queries);
  },
  knownManufacturers: ['Siemens', 'Schneider', 'ABB', 'Eaton'],
};

// ── POJISTKA (NH + Válcová + Skleněná) ───────────────────────────────────────

const POJISTKA: ComponentGuide = {
  id: 'pojistka',
  name: 'Pojistka',
  keywords: ['pojistka', 'fuse', 'nh', 'nh00', 'nh0', 'nh1', 'nh2', 'válcová', 'valcova',
    'skleněná', 'sklenena', 'cylindrical fuse', '10x38', 'gG', 'aM'],
  description: 'NH pojistka / Válcová pojistka / Skleněná pojistka',
  questions: [
    {
      id: 'subtype',
      question: 'Jaký typ pojistky?',
      options: ['NH (nožová)', 'Válcová', 'Skleněná'],
    },
    {
      id: 'nh_size',
      question: 'Velikost NH pojistky?',
      options: ['NH00', 'NH0', 'NH1', 'NH2', 'NH3'],
      condition: (a) => (a.subtype || '').toLowerCase().includes('nh'),
    },
    {
      id: 'cyl_size',
      question: 'Rozměr válcové pojistky (průměr × délka)?',
      options: ['10×38', '14×51', '22×58', '8×31'],
      condition: (a) => (a.subtype || '').toLowerCase().includes('válcov') ||
                        (a.subtype || '').toLowerCase().includes('valcov'),
    },
    {
      id: 'glass_size',
      question: 'Rozměr skleněné pojistky?',
      options: ['5×20', '6,3×32'],
      condition: (a) => (a.subtype || '').toLowerCase().includes('sklen'),
    },
    {
      id: 'amperage',
      question: 'Jmenovitý proud?',
      placeholder: 'např. 6, 16, 32, 63, 100, 160, 200',
    },
    {
      id: 'fuse_type',
      question: 'Typ pojistky?',
      options: ['gG (všeobecný)', 'aM (motorový)', 'gPV (fotovoltaika)'],
      optional: true,
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Siemens, OEZ, ETI, Eaton... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const amp = normalizeAmp(answers.amperage || '');
    const fType = (answers.fuse_type || '').split(' ')[0].trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];
    const sub = (answers.subtype || '').toLowerCase();

    if (sub.includes('nh')) {
      const size = (answers.nh_size || '').toUpperCase().replace('NH', '');
      if (size && amp) {
        queries.push(`NH${size} ${amp}A`);
        queries.push(`${amp}A NH${size}`);
        if (fType) queries.push(`${amp}A ${fType} NH${size}`);
        queries.push(`3NA ${amp}A`);
        queries.push(`LV${amp}`);
        queries.push(`PNS${size.toLowerCase()}${fType}${amp}`);
      }
      if (mfr && amp) queries.push(`${mfr} NH ${amp}A`);

    } else if (sub.includes('válcov') || sub.includes('valcov')) {
      const size = (answers.cyl_size || '').replace('×', 'x').trim();
      if (amp && size) {
        queries.push(`${amp}A ${size}`);
        queries.push(`${size} ${amp}A`);
        if (fType) queries.push(`${amp}A ${fType} ${size}`);
      }
      if (amp) {
        if (fType) queries.push(`${amp}A ${fType}`);
        queries.push(`${amp}gG`);
      }

    } else if (sub.includes('sklen')) {
      const size = (answers.glass_size || '').replace('×', 'x').trim();
      if (amp && size) {
        queries.push(`${amp}A ${size}`);
        queries.push(`${size} ${amp}A`);
        queries.push(`T${amp}A ${size}`);
        queries.push(`F${amp}A ${size}`);
      }
      if (amp) queries.push(`${amp}A skleněná`);
    }

    if (mfr) queries.push(`${mfr} pojistka ${amp}A`);
    if (amp) queries.push(`pojistka ${amp}A`);

    return dedup(queries);
  },
  knownManufacturers: ['Siemens', 'OEZ', 'ETI', 'Eaton', 'ABB', 'Legrand'],
};

// ── NAPÁJECÍ ZDROJ ────────────────────────────────────────────────────────────

const NAPAJECI_ZDROJ: ComponentGuide = {
  id: 'napajeci-zdroj',
  name: 'Napájecí zdroj',
  keywords: ['napájecí zdroj', 'napajeci zdroj', 'psu', 'power supply', 'zdroj napájení',
    'quint', 'trio', 'sitop', 'logo power', '24vdc'],
  description: 'Spínaný napájecí zdroj (PSU) na DIN lištu',
  questions: [
    {
      id: 'output_voltage',
      question: 'Výstupní napětí?',
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
      placeholder: 'Phoenix Contact, Wago, Puls, Siemens, Mean Well... nebo "ne"',
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
      queries.push(`QUINT ${volt}V/${current}`);
      queries.push(`QUINT4-PS/1AC/${volt}DC/${current.replace('A', '')}`);
      queries.push(`TRIO-PS/1AC/${volt}DC/${current.replace('A', '')}`);
      queries.push(`STEP-PS/1AC/${volt}DC/${current.replace('A', '')}`);
    }
    if (volt) {
      queries.push(`${volt}VDC zdroj`);
      queries.push(`PSU ${volt}V`);
      queries.push(`6EP ${volt}V`);
      queries.push(`SDR ${volt}V`);
      queries.push(`QS ${volt}V`);
    }
    if (mfr && volt) queries.push(`${mfr} ${volt}V`);

    return dedup(queries);
  },
  knownManufacturers: ['Phoenix Contact', 'Wago', 'Puls', 'Siemens', 'Mean Well', 'Murr Elektronik', 'ABB'],
};

// ── SVORKY ────────────────────────────────────────────────────────────────────

const SVORKY: ComponentGuide = {
  id: 'svorky',
  name: 'Svorky',
  keywords: ['svorka', 'svorky', 'terminal block', 'svorkovnice', 'clipline', 'wago 281',
    'wago 2081', 'ut 2,5', 'ut 4', 'st 2,5', 'pt 2,5'],
  description: 'Průchodné, PE nebo speciální svorkovnice na DIN lištu',
  questions: [
    {
      id: 'type',
      question: 'Typ svorky?',
      options: ['Průchodná', 'PE ochranná', 'Pojistková', 'Odpojovací'],
    },
    {
      id: 'section',
      question: 'Průřez připojení (mm²)?',
      placeholder: 'např. 1,5; 2,5; 4; 6; 10',
      options: ['1,5', '2,5', '4', '6', '10', '16'],
    },
    {
      id: 'vyrobce',
      question: 'Systém nebo výrobce?',
      placeholder: 'Phoenix Contact, Wago, ABB, Weidmüller... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const s = (answers.section || '').trim();
    const type = (answers.type || '').toLowerCase();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (s) {
      queries.push(`svorka ${s}mm2`);
      queries.push(`svorka ${s}`);
      queries.push(`UT ${s}`);
      queries.push(`ST ${s}`);
      queries.push(`PT ${s}`);
      queries.push(`${s}mm²`);
      queries.push(`SAK ${s}`);
      queries.push(`ZDU ${s}`);
    }

    if (type.includes('pe') || type.includes('ochrann')) {
      if (s) {
        queries.push(`USLKG ${s}`);
        queries.push(`PE svorka ${s}`);
        queries.push(`UT-PE ${s}`);
        queries.push(`SAK PE ${s}`);
      }
    }

    if (mfr) {
      const mLow = mfr.toLowerCase();
      if (s) {
        if (mLow.includes('phoenix') || mLow.includes('clipline')) {
          queries.push(`UT ${s}`);
          queries.push(`ST ${s}`);
          queries.push(`PT ${s}`);
        }
        if (mLow.includes('wago')) {
          const sNum = s.replace(',', '');
          queries.push(`281-${sNum}`);
          queries.push(`2081-${sNum}`);
          queries.push(`Wago ${s}`);
        }
        if (mLow.includes('abb')) queries.push(`SAK ${s}`);
        if (mLow.includes('weidm')) queries.push(`ZDU ${s}`);
      }
    }

    return dedup(queries);
  },
  knownManufacturers: ['Phoenix Contact', 'Wago', 'ABB', 'Weidmüller', 'Entrelec'],
};

// ── FREKVENČNÍ MĚNIČ ────────────────────────────────────────────────────────

const FREKV_MENIC: ComponentGuide = {
  id: 'frekv-menic',
  name: 'Frekvenční měnič',
  keywords: ['frekvenční měnič', 'frekvencni menic', 'vfd', 'frekvenčák', 'inverter',
    'acs355', 'acs580', 'g120', 'altivar', 'micromaster', 'fc302', 'movitrac'],
  description: 'Frekvenční měnič (VFD) pro řízení otáček AC motoru',
  questions: [
    {
      id: 'power',
      question: 'Výkon motoru [kW]?',
      placeholder: 'např. 0,37 / 0,75 / 1,5 / 2,2 / 4 / 7,5 / 11 / 15 / 22',
    },
    {
      id: 'supply',
      question: 'Napájení?',
      options: ['3×400VAC', '1×230VAC'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Schneider, Danfoss, Lenze... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const kw = (answers.power || '').trim().replace(',', '.');
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (kw) {
      queries.push(`${kw}kW`);
      queries.push(`${kw.replace('.', ',')}kW`);
      queries.push(`frekvenční měnič ${kw}kW`);
      queries.push(`ACS ${kw}kW`);
      queries.push(`ACS355 ${kw}kW`);
      queries.push(`ACS580 ${kw}kW`);
      queries.push(`G120 ${kw}kW`);
      queries.push(`SINAMICS ${kw}kW`);
      queries.push(`Altivar ${kw}kW`);
      queries.push(`ATV ${kw}kW`);
      queries.push(`FC302 ${kw}kW`);
      queries.push(`VLT ${kw}kW`);
      queries.push(`MOVITRAC ${kw}kW`);
    }
    if (mfr && kw) {
      queries.push(`${mfr} ${kw}kW`);
      queries.push(`${mfr} VFD ${kw}kW`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Schneider', 'Danfoss', 'Lenze', 'SEW-Eurodrive'],
};

// ── SOFT STARTER ─────────────────────────────────────────────────────────────

const SOFT_STARTER: ComponentGuide = {
  id: 'soft-starter',
  name: 'Soft Starter',
  keywords: ['soft starter', 'softstartér', 'softstarter', 'psr', 'pse', '3rw', 'ats22',
    'ds7', 'plynulý rozběh'],
  description: 'Softstartér pro plynulý rozběh motorů',
  questions: [
    {
      id: 'current',
      question: 'Jmenovitý proud motoru nebo výkon?',
      placeholder: 'např. 12A, 25A nebo 5,5kW, 11kW',
    },
    {
      id: 'supply',
      question: 'Napájecí napětí?',
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
      queries.push(`softstartér ${current}`);
      queries.push(`soft starter ${current}`);
      queries.push(`PSR ${current}`);
      queries.push(`PSE ${current}`);
      queries.push(`PSTB ${current}`);
      queries.push(`3RW ${current}`);
      queries.push(`3RW40 ${current}`);
      queries.push(`ATS22 ${current}`);
      queries.push(`Altistart ${current}`);
      queries.push(`DS7 ${current}`);
    }
    if (mfr && current) queries.push(`${mfr} softstartér ${current}`);

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Schneider', 'Eaton'],
};

// ── TRANSFORMÁTOR ────────────────────────────────────────────────────────────

const TRANSFORMATOR: ComponentGuide = {
  id: 'transformator',
  name: 'Transformátor',
  keywords: ['transformátor', 'transformator', 'trafo', 'transformer', '4am', 'block vc'],
  description: 'Řídicí nebo bezpečnostní transformátor',
  questions: [
    {
      id: 'power',
      question: 'Výkon transformátoru [VA nebo kVA]?',
      placeholder: 'např. 63VA, 160VA, 250VA, 630VA, 1kVA',
    },
    {
      id: 'voltage_in',
      question: 'Vstupní napětí?',
      options: ['230VAC', '400VAC', '230/400VAC'],
    },
    {
      id: 'voltage_out',
      question: 'Výstupní napětí?',
      options: ['24VAC', '115VAC', '230VAC', '48VAC'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Block, Siemens, Murr, ABB... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const power = (answers.power || '').trim();
    const uin = (answers.voltage_in || '').replace('VAC', '').replace('V', '').trim();
    const uout = (answers.voltage_out || '').replace('VAC', '').replace('V', '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (power) {
      queries.push(`transformátor ${power}`);
      queries.push(`trafo ${power}`);
      queries.push(power);
    }
    if (uin && uout) {
      queries.push(`${uin}/${uout}V`);
      queries.push(`${uin}VAC/${uout}VAC`);
      queries.push(`${uin}/${uout}`);
      if (power) {
        queries.push(`${power} ${uin}/${uout}`);
        queries.push(`${power} ${uout}VAC`);
      }
    }
    if (mfr && power) queries.push(`${mfr} ${power}`);
    if (uout) queries.push(`${uout}VAC transformátor`);

    return dedup(queries);
  },
  knownManufacturers: ['Block', 'Siemens', 'Murr Elektronik', 'ABB', 'Schneider'],
};

// ── RELÉ ─────────────────────────────────────────────────────────────────────

const RELE: ComponentGuide = {
  id: 'rele',
  name: 'Relé',
  keywords: ['relé', 'rele', 'relay', 'pomocné relé', 'pomocne rele', 'finder', 'plc-rsc',
    'rxm', 'g2r', '40.31', '55.34'],
  description: 'Pomocné elektromagnetické relé',
  questions: [
    {
      id: 'coil_voltage',
      question: 'Napájecí napětí cívky?',
      options: ['24VDC', '230VAC', '24VAC', '12VDC', '48VDC', '115VAC'],
    },
    {
      id: 'contacts',
      question: 'Konfigurace kontaktů?',
      placeholder: '1CO, 2CO, 4CO (CO = přepínací); nebo NO/NC',
      options: ['1CO', '2CO', '4CO', '2NO+2NC'],
    },
    {
      id: 'form',
      question: 'Provedení?',
      options: ['Patice (vyjímatelné)', 'DIN lišta (přímé)', 'PCB'],
      optional: true,
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Finder, Phoenix Contact, Schneider, Wago... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const coil = (answers.coil_voltage || '').trim();
    const contacts = (answers.contacts || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const voltNum = coil.replace(/[^0-9]/g, '');
    const isDC = coil.toUpperCase().includes('DC');
    const queries: string[] = [];

    if (coil) {
      queries.push(`relé ${coil}`);
      queries.push(`${coil} relé`);
    }
    if (coil && contacts) {
      queries.push(`${coil} ${contacts}`);
      queries.push(`${contacts} ${coil}`);
    }

    // Finder kódy: 40.31 (1CO), 40.52 (2CO), 55.33 (3CO), 55.34 (4CO)
    if (voltNum) {
      if (contacts.includes('1CO')) queries.push(`40.31.${isDC ? '9' : '8'}.${voltNum.padStart(3, '0')}`);
      if (contacts.includes('2CO')) queries.push(`40.52.${isDC ? '9' : '8'}.${voltNum.padStart(3, '0')}`);
      if (contacts.includes('4CO')) queries.push(`55.34.${isDC ? '9' : '8'}.${voltNum.padStart(3, '0')}`);
      queries.push(`40.31`);
      queries.push(`40.52`);
      queries.push(`55.34`);
    }

    // Phoenix Contact PLC-RSC
    if (coil) {
      queries.push(`PLC-RSC-${coil.replace(' ', '')}`);
      queries.push(`PLC-RSC ${coil}`);
    }

    // Schneider RXM
    if (contacts.includes('4CO') || contacts.includes('4NO')) {
      queries.push(`RXM4AB`);
      if (coil.includes('24') && isDC) queries.push(`RXM4AB2BD`);
      if (coil.includes('230')) queries.push(`RXM4AB2P7`);
    }
    if (contacts.includes('2CO')) {
      queries.push(`RXM2LB`);
    }

    if (mfr && coil) queries.push(`${mfr} relé ${coil}`);

    return dedup(queries);
  },
  knownManufacturers: ['Finder', 'Phoenix Contact', 'Schneider', 'Wago', 'TE Connectivity', 'Omron'],
};

// ── DIN LIŠTA ─────────────────────────────────────────────────────────────────

const DIN_LISTA: ComponentGuide = {
  id: 'din-lista',
  name: 'DIN lišta',
  keywords: ['din lišta', 'din lista', 'ts35', 'ns35', 'ns 35', 'montážní lišta',
    'top hat rail', 'omega rail', 'din rail'],
  description: 'Normalizovaná montážní lišta TS35/NS35 do rozváděče',
  questions: [
    {
      id: 'type',
      question: 'Typ lišty?',
      options: ['35mm standard (TS35/NS35)', '15mm (NS15)', 'Nerezová', 'Perforovaná'],
    },
    {
      id: 'length',
      question: 'Délka?',
      options: ['1m', '2m', 'jiná délka'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Phoenix Contact, Wago, Schneider... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const type = (answers.type || '').toLowerCase();
    const length = (answers.length || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    queries.push('DIN lišta 35mm');
    queries.push('TS35');
    queries.push('NS 35');
    queries.push('NS 35/7,5');

    if (type.includes('15')) {
      queries.push('NS 15');
      queries.push('TS15');
      queries.push('DIN lišta 15mm');
    }
    if (type.includes('nerez')) {
      queries.push('NS 35 nerez');
      queries.push('stainless DIN rail');
    }
    if (type.includes('perforov')) {
      queries.push('NS 35 perforovaná');
    }

    if (length) {
      queries.push(`NS 35/7,5 ${length}`);
      queries.push(`TS35 ${length}`);
      queries.push(`DIN lišta ${length}`);
    }
    if (mfr) queries.push(`${mfr} NS35`);

    return dedup(queries);
  },
  knownManufacturers: ['Phoenix Contact', 'Wago', 'Schneider', 'Rittal', 'ABB'],
};

// ── RITTAL ────────────────────────────────────────────────────────────────────

const RITTAL: ComponentGuide = {
  id: 'rittal',
  name: 'Rittal',
  keywords: ['rittal', 'sk 32', 'sk 33', 'sz 24', 'ts8', 'vx25', 'ae skříň',
    'rittal ventilátor', 'rittal termostat', 'rittal deska'],
  description: 'Díly a příslušenství rozváděčových skříní Rittal',
  questions: [
    {
      id: 'part_type',
      question: 'Jaký typ dílu Rittal hledáš?',
      options: ['Montážní deska', 'Ventilátor / Filtr', 'Termostat / Hygrostat',
        'Sokl / Podstavec', 'Zámek / Závěs', 'Průchodka / Záslepka', 'Jiný díl'],
    },
    {
      id: 'series',
      question: 'Série skříně Rittal?',
      options: ['AE', 'TS8', 'VX25', 'CS', 'KX'],
      optional: true,
    },
    {
      id: 'dimensions',
      question: 'Rozměry nebo katalogové číslo?',
      placeholder: 'např. 600×500 nebo SK 3237.100',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const part = (answers.part_type || '').toLowerCase();
    const series = (answers.series || '').toUpperCase().trim();
    const dims = (answers.dimensions || '').trim();
    const queries: string[] = [];

    queries.push(`Rittal ${answers.part_type || ''}`);
    if (dims) queries.push(dims);

    if (part.includes('montážní') || part.includes('deska')) {
      queries.push('montážní deska');
      if (series) {
        queries.push(`${series} montážní deska`);
        queries.push(`${series} 2500`);
      }
    }
    if (part.includes('ventilátor') || part.includes('filtr')) {
      queries.push('SK 3237');
      queries.push('SK 3150');
      queries.push('Rittal ventilátor');
      queries.push('SK 3324');
    }
    if (part.includes('termostat')) {
      queries.push('SK 3110');
      queries.push('Rittal termostat');
      queries.push('SK 3115');
    }
    if (part.includes('sokl')) {
      queries.push('Rittal sokl');
      if (series === 'TS8') queries.push('TS 8601');
      if (series === 'VX25') queries.push('VX 8640');
    }
    if (part.includes('zámek') || part.includes('závěs')) {
      queries.push('SZ 4315');
      queries.push('SZ 4600');
      queries.push('Rittal zámek');
    }
    if (part.includes('průchod') || part.includes('záslepka')) {
      queries.push('SZ 2465');
      queries.push('SZ 2451');
      queries.push('SZ 2481');
      queries.push('Rittal průchodka');
    }

    if (series) queries.push(`Rittal ${series}`);

    return dedup(queries);
  },
  knownManufacturers: ['Rittal'],
};

// ── HLAVNÍ VYPÍNAČ ────────────────────────────────────────────────────────────

const HLAVNI_VYPINAC: ComponentGuide = {
  id: 'hlavni-vypinac',
  name: 'Hlavní vypínač',
  keywords: ['hlavní vypínač', 'hlavni vypinac', 'odpojovač', 'isolator', 'disconnector',
    'ot16', 'ot63', 'ot100', 'rotační vypínač', '3ld', 'p1-25', 'vario vce'],
  description: 'Rotační odpojovač / Hlavní vypínač',
  questions: [
    {
      id: 'subtype',
      question: 'Typ vypínače?',
      options: ['Rotační odpojovač', 'Pojistkový odpojovač (s pojistkami)'],
    },
    {
      id: 'amperage',
      question: 'Jmenovitý proud [A]?',
      placeholder: 'např. 16, 25, 40, 63, 100, 160, 250',
    },
    {
      id: 'poles',
      question: 'Počet pólů?',
      options: ['3P', '4P'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'ABB, Siemens, Eaton, Schneider... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const amp = normalizeAmp(answers.amperage || '');
    const poles = answers.poles?.replace('P', '') || '3';
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (amp) {
      queries.push(`hlavní vypínač ${amp}A`);
      queries.push(`odpojovač ${amp}A`);
      queries.push(`OT${amp}F${poles}`);
      queries.push(`OT${amp}F3`);
      queries.push(`3LD ${amp}A`);
      queries.push(`P${parseInt(poles) < 3 ? '1' : '3'}-${amp}`);
      queries.push(`VCF ${amp}A`);
    }
    if (mfr && amp) queries.push(`${mfr} odpojovač ${amp}A`);

    return dedup(queries);
  },
  knownManufacturers: ['ABB', 'Siemens', 'Eaton', 'Schneider'],
};

// ── TLAČÍTKO ─────────────────────────────────────────────────────────────────

const TLACITKO: ComponentGuide = {
  id: 'tlacitko',
  name: 'Tlačítko',
  keywords: ['tlačítko', 'tlacitko', 'push button', 'signálka', 'signalka', 'přepínač',
    'prepinac', 'm22', 'xb4', '3sb3', 'nouzový stop', 'hřib'],
  description: 'Tlačítko, přepínač nebo signálka pro rozváděčový panel (22mm)',
  questions: [
    {
      id: 'subtype',
      question: 'Typ ovládacího prvku?',
      options: ['Tlačítko (momentový)', 'Přepínač (udržovací)', 'Signálka (LED)', 'Nouzový stop (hřib)'],
    },
    {
      id: 'color',
      question: 'Barva?',
      options: ['Zelená', 'Červená', 'Žlutá', 'Modrá', 'Bílá / Šedá'],
    },
    {
      id: 'contacts',
      question: 'Kontakty?',
      options: ['1NO', '1NC', '1NO+1NC', '2NO'],
      condition: (a) => !(a.subtype || '').toLowerCase().includes('signálka'),
    },
    {
      id: 'diameter',
      question: 'Průměr montážního otvoru?',
      options: ['22mm', '16mm'],
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Eaton, Schneider, Siemens, ABB... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const sub = (answers.subtype || '').toLowerCase();
    const color = (answers.color || '').toLowerCase().trim();
    const contacts = (answers.contacts || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    // Barevné kódy
    const colorMap: Record<string, string> = {
      'zelená': 'G', 'červená': 'R', 'žlutá': 'Y', 'modrá': 'B', 'bílá': 'W', 'šedá': 'W',
    };
    const colorCode = colorMap[color] || '';

    if (sub.includes('nouzový') || sub.includes('hrib') || sub.includes('hřib')) {
      queries.push('nouzový stop');
      queries.push('emergency stop');
      queries.push('M22-DP-R');
      queries.push('XB4BS8444');
      queries.push('3SB3400-0E');
      queries.push('hřibové tlačítko');
    } else if (sub.includes('signálka')) {
      queries.push(`signálka ${color}`);
      queries.push(`LED ${color}`);
      if (colorCode) {
        queries.push(`M22-L-${colorCode}`);
        queries.push(`XB4BVM${colorCode === 'G' ? '3' : colorCode === 'R' ? '4' : '5'}`);
        queries.push(`3SB3001-6AA${colorCode === 'G' ? '3' : colorCode === 'R' ? '5' : '0'}`);
      }
    } else {
      queries.push(`tlačítko ${color}`);
      if (colorCode) {
        queries.push(`M22-D-${colorCode}`);
        if (contacts.includes('NO')) queries.push(`M22-D-${colorCode} M22-K10`);
        if (contacts.includes('NC')) queries.push(`M22-D-${colorCode} M22-K01`);
        // Schneider
        const xb4Map: Record<string, string> = { 'G': '31', 'R': '42', 'Y': '53', 'W': '21' };
        if (xb4Map[colorCode]) queries.push(`XB4BA${xb4Map[colorCode]}`);
        // Siemens
        queries.push(`3SB3000-0${colorCode === 'G' ? 'A' : colorCode === 'R' ? 'E' : 'D'}A11`);
      }
    }

    if (mfr) {
      const mLow = mfr.toLowerCase();
      if (mLow.includes('eaton') || mLow.includes('moeller')) {
        if (colorCode) queries.push(`M22-D-${colorCode}`);
        queries.push('M22');
      }
      if (mLow.includes('schneider')) {
        queries.push('XB4');
        queries.push('Harmony');
      }
      if (mLow.includes('siemens')) {
        queries.push('3SB3');
        queries.push('SIRIUS ACT');
      }
    }

    return dedup(queries);
  },
  knownManufacturers: ['Eaton', 'Schneider', 'Siemens', 'ABB'],
};

// ── PRŮCHODKA ─────────────────────────────────────────────────────────────────

const PRUCHCDKA: ComponentGuide = {
  id: 'pruchcdka',
  name: 'Průchodka',
  keywords: ['průchodka', 'pruchcdka', 'cable gland', 'kabelová průchodka', 'vývodka',
    'skindicht', 'pg11', 'pg13', 'pg16', 'm20', 'm25'],
  description: 'Kabelová průchodka (cable gland) pro otvory v rozváděči',
  questions: [
    {
      id: 'thread_type',
      question: 'Typ závitu?',
      options: ['PG (Panzergewinde)', 'Metrický M', 'NPT (americký)'],
    },
    {
      id: 'pg_size',
      question: 'Velikost PG?',
      options: ['PG7', 'PG9', 'PG11', 'PG13,5', 'PG16', 'PG21', 'PG29', 'PG36'],
      condition: (a) => (a.thread_type || '').toLowerCase().includes('pg'),
    },
    {
      id: 'm_size',
      question: 'Velikost (M)?',
      options: ['M12', 'M16', 'M20', 'M25', 'M32', 'M40', 'M50'],
      condition: (a) => (a.thread_type || '').toLowerCase().includes('metrick') ||
                        (a.thread_type || '').toLowerCase() === 'm',
    },
    {
      id: 'material',
      question: 'Materiál?',
      options: ['Plast (PA)', 'Mosaz', 'Nerez'],
      optional: true,
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Lapp, Rittal, Phoenix Contact... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const threadType = (answers.thread_type || '').toLowerCase();
    const pgSize = (answers.pg_size || '').trim();
    const mSize = (answers.m_size || '').trim();
    const material = (answers.material || '').toLowerCase();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (threadType.includes('pg') && pgSize) {
      const pg = pgSize.replace('PG', '').replace(',', '.').trim();
      queries.push(`průchodka PG${pg}`);
      queries.push(`PG${pg} průchodka`);
      queries.push(`PG${pg}`);
      queries.push(`SKINDICHT CE-PG${pg}`);
      queries.push(`SKINDICHT PG${pg}`);
      // Rittal SZ kódy pro PG
      const rittalMap: Record<string, string> = {
        '9': 'SZ 2451', '11': 'SZ 2451', '13.5': 'SZ 2465', '16': 'SZ 2455', '21': 'SZ 2470',
      };
      if (rittalMap[pg]) queries.push(rittalMap[pg]);
    }

    if ((threadType.includes('metrick') || threadType === 'm') && mSize) {
      const m = mSize.replace('M', '').trim();
      queries.push(`průchodka M${m}`);
      queries.push(`M${m} průchodka`);
      queries.push(`M${m}`);
      queries.push(`SKINDICHT CE-M${m}`);
      queries.push(`M${m}×1,5`);
    }

    if (material.includes('nerez')) {
      queries.push('průchodka nerez');
      queries.push('stainless cable gland');
    }
    if (mfr) {
      queries.push(`${mfr} průchodka`);
      if (pgSize) queries.push(`${mfr} ${pgSize}`);
      if (mSize) queries.push(`${mfr} ${mSize}`);
    }

    return dedup(queries);
  },
  knownManufacturers: ['Lapp', 'Rittal', 'Phoenix Contact', 'Roxtec', 'ABB'],
};

// ── ZÁSLEPKA ──────────────────────────────────────────────────────────────────

const ZASLEPKA: ComponentGuide = {
  id: 'zaslepka',
  name: 'Záslepka',
  keywords: ['záslepka', 'zaslepka', 'blanking plug', 'blindstop', 'ucpávka',
    'zaslepení', 'skintop bs', 'sz 2481', 'sz 2486'],
  description: 'Záslepka pro nevyužité otvory v rozváděčové skříni nebo panelu',
  questions: [
    {
      id: 'hole_type',
      question: 'Pro jaký typ otvoru?',
      options: ['PG závit', 'Metrický M závit', 'Panelový výřez (22mm ovl. panel)'],
    },
    {
      id: 'pg_size',
      question: 'Velikost PG?',
      options: ['PG7', 'PG9', 'PG11', 'PG13,5', 'PG16', 'PG21', 'PG29'],
      condition: (a) => (a.hole_type || '').toLowerCase().includes('pg'),
    },
    {
      id: 'm_size',
      question: 'Velikost M?',
      options: ['M12', 'M16', 'M20', 'M25', 'M32', 'M40'],
      condition: (a) => (a.hole_type || '').toLowerCase().includes('metrick') ||
                        (a.hole_type || '').toLowerCase().includes(' m '),
    },
    {
      id: 'vyrobce',
      question: 'Máš vybraného výrobce?',
      placeholder: 'Rittal, Lapp, Phoenix... nebo "ne"',
      optional: true,
    },
  ],
  generateQueries: (answers) => {
    const holeType = (answers.hole_type || '').toLowerCase();
    const pgSize = (answers.pg_size || '').trim();
    const mSize = (answers.m_size || '').trim();
    const mfr = !isNo(answers.vyrobce || '') ? (answers.vyrobce || '').trim() : '';
    const queries: string[] = [];

    if (holeType.includes('pg') && pgSize) {
      const pg = pgSize.replace('PG', '').replace(',', '.').trim();
      queries.push(`záslepka PG${pg}`);
      queries.push(`PG${pg} záslepka`);
      queries.push(`zaslepení PG${pg}`);
      queries.push(`SKINTOP BS-PG${pg}`);
      const rittalMap: Record<string, string> = {
        '11': 'SZ 2481', '13.5': 'SZ 2482', '16': 'SZ 2483', '21': 'SZ 2484',
      };
      if (rittalMap[pg]) queries.push(rittalMap[pg]);
    }

    if (holeType.includes('metrick') && mSize) {
      const m = mSize.replace('M', '').trim();
      queries.push(`záslepka M${m}`);
      queries.push(`M${m} záslepka`);
      queries.push(`SKINTOP BS-M${m}`);
      const rittalMap: Record<string, string> = { '20': 'SZ 2486', '25': 'SZ 2488' };
      if (rittalMap[m]) queries.push(rittalMap[m]);
    }

    if (holeType.includes('panel') || holeType.includes('22mm')) {
      queries.push('22mm záslepka');
      queries.push('M22-BLK');
      queries.push('XB5AV01');
      queries.push('panel záslepka 22mm');
    }

    if (mfr) queries.push(`${mfr} záslepka`);
    queries.push('záslepka');
    queries.push('ucpávka');

    return dedup(queries);
  },
  knownManufacturers: ['Rittal', 'Lapp', 'Phoenix Contact', 'Eaton', 'Schneider'],
};

// ── Registry ──────────────────────────────────────────────────────────────────

export const COMPONENT_GUIDES: ComponentGuide[] = [
  JISTIC,
  STYKAC,
  POJISTKA,
  NAPAJECI_ZDROJ,
  SVORKY,
  FREKV_MENIC,
  SOFT_STARTER,
  TRANSFORMATOR,
  RELE,
  DIN_LISTA,
  RITTAL,
  HLAVNI_VYPINAC,
  TLACITKO,
  PRUCHCDKA,
  ZASLEPKA,
];

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function findNextActiveIndex(
  questions: GuideQuestion[],
  answers: Record<string, string>,
  fromIndex: number
): number | null {
  for (let i = fromIndex; i < questions.length; i++) {
    if (!questions[i].condition || questions[i].condition!(answers)) return i;
  }
  return null;
}

export function findComponentGuide(input: string): ComponentGuide | null {
  const normalized = removeDiacritics(input.toLowerCase().trim());
  for (const guide of COMPONENT_GUIDES) {
    for (const keyword of guide.keywords) {
      const nk = removeDiacritics(keyword.toLowerCase());
      if (normalized.includes(nk) || nk.includes(normalized)) {
        return guide;
      }
    }
  }
  return null;
}
