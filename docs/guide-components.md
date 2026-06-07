# Průvodce komponentami – Řízený režim
# Robo Filler / Article Search

Tento dokument je strukturován tak, aby AI mohla načíst pouze relevantní sekci.
Každá sekce je ohraničena komentáři `<!-- section:ID -->` a `<!-- /section:ID -->`.

## Obsah
- [jistic] Jistič (MCB + Motorový jistič MPCB)
- [stykac] Stykač (Silový + Pomocný)
- [pojistka] Pojistka (NH + Válcová + Skleněná)
- [napajeci-zdroj] Napájecí zdroj (PSU)
- [svorky] Svorky (Terminal Blocks)
- [frekv-menic] Frekvenční měnič (VFD)
- [soft-starter] Soft Starter
- [transformator] Transformátor
- [rele] Relé
- [din-lista] DIN lišta
- [rittal] Rittal – díly skříní
- [hlavni-vypinac] Hlavní vypínač / Odpojovač
- [tlacitko] Tlačítko / Signálka
- [pruchcdka] Průchodka (Cable Gland)
- [zaslepka] Záslepka

---

<!-- section:jistic -->
## [jistic] Jistič (MCB / Motorový jistič MPCB)

### Přehled
Zahrnuje dva podtypy:
- **MCB (Miniature Circuit Breaker)** – nadproudový jistič pro ochranu vedení a spotřebičů
- **MPCB (Motor Protection Circuit Breaker)** – motorový jistič, chrání motor před přetížením a zkratem; má nastavitelný proud a bývá vybaven tepelnou spouští přímo integrovanou; používá se místo kombinace tepelného relé + jistič

### Otázky průvodce
1. **Typ** – MCB (nadproudový) nebo MPCB (motorový)?
2. **Výrobce** – volitelné
3. **Amperáž** – jmenovitý proud In v A (jen MCB), např. 6, 10, 16, 20, 25, 32, 40, 50, 63
4. **Rozsah nastavení** – min–max v A (jen MPCB), např. 1-1,6 / 4-6,3 / 9-14 / 18-25
5. **Počet pólů** – 1P, 2P, 3P, 4P
6. **Charakteristika** – B, C, D, K (jen MCB)

### Generování výrazů – MCB
- `{char}{amp} {P}P` → `C16 3P`
- `{char}{amp}A {P}P` → `C16A 3P`
- `{amp}A {char} {P}P` → `16A C 3P`
- `{amp} {char} {P}P` → `16 C 3P`
- `{char}{amp}` → `C16` (bez pólů)
- `{amp}A {P}P` → `16A 3P`
- Pokud výrobce znám: `{výrobce} {char}{amp}`, typová označení viz níže

### Generování výrazů – MPCB
- `{min}-{max}A` → `4-6,3A`
- `{min}-{max} {P}P` → `4-6,3 3P`
- `MS {rozsah}` (ABB označení)
- `3RV {rozsah}` (Siemens)
- `PKZM {rozsah}` (Eaton/Moeller)
- `GV2 {rozsah}` (Schneider)
- Pokud výrobce znám: přidat prefix

---

### Výrobci a typová označení – MCB

#### ABB
Řady: **S200**, **S800**, **SH200**, **S900**

| Řada | Póly | Rozsah [A] | Příklad typového označení |
|------|------|------------|--------------------------|
| S200 | 1P | 0,5–63 | S201-C16 (1P, C, 16A) |
| S200 | 2P | 0,5–63 | S202-C16 |
| S200 | 3P | 0,5–63 | S203-C16 |
| S200 | 4P | 0,5–63 | S204-C16 |
| S800 | 3P | 80–125 | S803B-C100 |
| SH200 | 1P | 6–63 | SH201-C16 (levnější řada) |
| SH200 | 3P | 6–63 | SH203-C16 |

Schéma: `S{pol}{pol_num}-{char}{amp}` nebo `SH{pol}{pol_num}-{char}{amp}`
Příklady: `S201-B6`, `S201-C10`, `S201-C16`, `S203-C32`, `S204-C63`, `S803B-C125`

#### Siemens
Řady: **5SL**, **5SY**, **5SP**, **5SM**

| Řada | Popis | Příklad |
|------|-------|---------|
| 5SL4 | 1P, moderní | 5SL4116-7 (1P, B16A) |
| 5SL6 | 3P, průmyslová | 5SL6316-7 (3P, C16A) |
| 5SY4 | 1P, starší | 5SY4116-7 |
| 5SY6 | 3P, starší | 5SY6316-7 |
| 5SP3 | 1P, RCBO | 5SP3416-2 |

Kódování: `5SL{pol}` kde pol: 4=1P, 6=3P, číslo před char: 1=1P, 2=2P, 3=3P, 4=4P
Char v kódu: za číslem pólů (B, C, D)
Přípona `-7` = standardní vypínací charakteristika

#### Schneider Electric
Řady: **iC60N**, **iC60H**, **iC60L** (Acti 9), **C120** (vyšší proud), **Multi9**

| Řada | Popis | Příklad |
|------|-------|---------|
| A9F74xxx | iC60N, 1P | A9F74116 (1P, C16A) |
| A9F74xxx | iC60N, 3P | A9F74316 (3P, C16A) |
| A9F77xxx | iC60H (vyšší zkrat) | A9F77316 |
| A9F75xxx | iC60L (nízký proud) | |

Schéma kódu: `A9F7{char_kód}{pol}{amp_2digit}` kde char: B=4, C=4 (záleží na řadě), nutno ověřit
Alternativní vyhledávání: `iC60N C16`, `Acti 9 C16`, `A9F74316`

#### OEZ (český výrobce)
Řady: **LTE**, **LSE**, **BK**, **OLT**

| Řada | Popis | Příklad |
|------|-------|---------|
| LTE-3 | Průmyslový jistič 3P | LTE-3-C16 (3P, C16A) |
| LTE-1 | 1P verze | LTE-1-C16 |
| LSE | Domovní provedení | LSE-16C |
| BK | Starší řada | BK 3×16C |

OEZ je hojně zastoupený v databázi Ústí. Typická označení: `LTE-3-C16`, `LTE-3-C25`, `LTE-3-D16`

#### Hager
Řady: **MCA**, **MCN**, **MCS**, **HTS**, **HNG**

| Řada | Popis | Příklad |
|------|-------|---------|
| MCN | 1P, C char | MCN116C (1P, C16A) |
| MCN | 3P, C char | MCN316C (3P, C16A) |
| MCA | 1P, B char | MCA116A |

Schéma: `MC{řada}{pol_num}{amp_2digit}{char}`

#### Eaton (Moeller)
Řady: **xPole (PXL, PKN)**, **FAZ**, **NZM**

| Řada | Popis | Příklad |
|------|-------|---------|
| PXL | xPole, standardní | PXL-B16/3 (3P, B16A) |
| PKN | xPole, kompaktní | PKN6-10/3/C |
| FAZ | průmyslový | FAZ-C16/3 |
| NZM | výkonový (>100A) | NZM1-A100 |

Schéma PXL: `PXL-{char}{amp}/{pol}` např. `PXL-C16/3`

#### Legrand
Řady: **DX³**, **TX³**, **RX³**

| Řada | Příklad |
|------|---------|
| DX³ | DX3-C16 (3P) |
| TX³ | TX3-C16 |

---

### Výrobci a typová označení – MPCB (Motorový jistič)

#### ABB
Řady: **MS116**, **MS132**, **MS165**, **MS451**, **MS495**

| Model | Rozsah [A] | Příklad |
|-------|------------|---------|
| MS116-0.4 | 0,25–0,4 | MS116-0.4 |
| MS116-1.0 | 0,63–1,0 | MS116-1.0 |
| MS116-1.6 | 1,0–1,6 | MS116-1.6 |
| MS116-2.5 | 1,6–2,5 | MS116-2.5 |
| MS116-4.0 | 2,5–4,0 | MS116-4.0 |
| MS116-6.3 | 4,0–6,3 | MS116-6.3 |
| MS116-10 | 6,3–10 | MS116-10 |
| MS116-16 | 10–16 | MS116-16 |
| MS132-20 | 16–20 | MS132-20 |
| MS132-25 | 20–25 | MS132-25 |
| MS132-32 | 25–32 | MS132-32 |
| MS165-54 | 48–54 | MS165-54 |
| MS165-65 | 57–65 | MS165-65 |

Vyhledávání: `MS116`, `MS132`, `MS116-6.3`, `ABB MS116`

#### Siemens
Řady: **3RV1**, **3RV2**

| Série | Rozsah | Příklad |
|-------|--------|---------|
| 3RV1011 | 0,11–1,6A | 3RV1011-0AA10 (0,11–0,16A) |
| 3RV1011 | 1,8–2,5A | 3RV1011-1BA10 |
| 3RV1021 | 7–10A | 3RV1021-1JA10 |
| 3RV1021 | 9–12,5A | 3RV1021-1KA10 |
| 3RV1031 | 14–20A | 3RV1031-4BA10 |
| 3RV1041 | 28–40A | 3RV1041-4MA10 |

Přípona `-10` = bez aux kontaktu, `-15` = se závorkou, typ varianty
Vyhledávání: `3RV1021`, `3RV2021`, `3RV 6,3A`, `Siemens 3RV`

#### Eaton / Moeller
Řady: **PKZM0**, **PKZM4**, **PKE**, **XTOB**

| Model | Rozsah [A] |
|-------|------------|
| PKZM0-0,16 | 0,1–0,16 |
| PKZM0-0,4 | 0,25–0,4 |
| PKZM0-1 | 0,63–1,0 |
| PKZM0-1,6 | 1,0–1,6 |
| PKZM0-2,5 | 1,6–2,5 |
| PKZM0-4 | 2,5–4,0 |
| PKZM0-6,3 | 4,0–6,3 |
| PKZM0-10 | 6,3–10 |
| PKZM0-16 | 10–16 |
| PKZM4-25 | 17–25 |
| PKZM4-32 | 22–32 |

Vyhledávání: `PKZM0`, `PKZM0-6,3`, `Eaton PKZM`

#### Schneider Electric
Řady: **GV2ME**, **GV2P**, **GV3ME**, **GV3P**

| Model | Rozsah [A] |
|-------|------------|
| GV2ME03 | 0,25–0,4 |
| GV2ME05 | 0,63–1,0 |
| GV2ME08 | 1,6–2,5 |
| GV2ME10 | 2,5–4,0 |
| GV2ME14 | 6–10 |
| GV2ME16 | 9–14 |
| GV2ME22 | 16–22 |
| GV3ME32 | 25–32 |
| GV3ME40 | 30–40 |

Vyhledávání: `GV2ME16`, `GV2`, `Schneider GV2`, `TeSys GV`

<!-- /section:jistic -->

---

<!-- section:stykac -->
## [stykac] Stykač (Silový + Pomocný stykač)

### Přehled
Zahrnuje dva podtypy:
- **Silový stykač** – spíná hlavní obvod motoru nebo zátěže, proud 9–1600A
- **Pomocný stykač** – pouze pomocné kontakty (NO/NC), malý proud, používá se pro signalizaci, blokování, řídící obvody

### Otázky průvodce – silový stykač
1. Typ: Silový stykač
2. Výrobce (volitelné)
3. Proud Ie (AC3) v ampérech
4. Napětí cívky (24VDC, 230VAC, 24VAC, 110VAC, 48VDC)
5. Počet hlavních pólů (3P, 4P)

### Otázky průvodce – pomocný stykač
1. Typ: Pomocný stykač
2. Výrobce (volitelné)
3. Konfigurace kontaktů (2NO, 4NO, 2NO+2NC, 4NO+4NC)
4. Napětí cívky

### Generování výrazů – silový stykač
- `stykač {amp}A`
- `{amp}A {napětí cívky}`
- `LC1-D{amp_kód}` (Schneider – LC1D09, LC1D12...)
- `LC1D{kód}` (bez mezery)
- `3RT2{kód}` (Siemens)
- `A{amp}` (ABB – A9, A12, A16...)
- `DILM{amp}` (Eaton – DILM7, DILM9...)

### Generování výrazů – pomocný stykač
- `pomocný stykač {kontakty}`
- `{kontakty} {napětí}`
- `3RH2 {kontakty}` (Siemens)
- `CAD {kontakty}` (Schneider)
- `CA{kontakty}` (ABB)
- `DIL{kontakty}` (Eaton)

---

### Výrobci a typová označení – Silový stykač

#### Siemens (SIRIUS)
Řady: **3RT2**, **3RT1** (starší)

| Model | Ie/AC3 | Příkon motoru 400V |
|-------|--------|-------------------|
| 3RT2015 | 7A | 3kW |
| 3RT2016 | 9A | 4kW |
| 3RT2017 | 12A | 5,5kW |
| 3RT2023 | 9A | 4kW (alt.) |
| 3RT2024 | 12A | 5,5kW |
| 3RT2025 | 17A | 7,5kW |
| 3RT2026 | 25A | 11kW |
| 3RT2035 | 40A | 18,5kW |
| 3RT2036 | 50A | 22kW |
| 3RT2044 | 65A | 30kW |
| 3RT2045 | 80A | 37kW |
| 3RT2046 | 95A | 45kW |

Přípona: `-1BB42` = cívka 24VDC, `-1AB00` = cívka 24VAC 50Hz, `-1AP00` = 230VAC
Plný příklad: `3RT2016-1BB42` (9A, 24VDC cívka)
Vyhledávání: `3RT2016`, `3RT20`, `Siemens stykač 9A`

Řada 3RH2 (pomocný stykač):
- `3RH2122` (4NO kontakty)
- `3RH2131` (3NO+1NC)
- `3RH2140` (4NO)
- `3RH2211` (2NO+2NC)

#### Schneider Electric (TeSys D, TeSys F)
Řady: **LC1-D** (TeSys D, do ~95A), **LC1-F** (TeSys F, vyšší proud)

| Model | Ie/AC3 | Výkon 400V |
|-------|--------|-----------|
| LC1D09 | 9A | 4kW |
| LC1D12 | 12A | 5,5kW |
| LC1D18 | 18A | 7,5kW |
| LC1D25 | 25A | 11kW |
| LC1D32 | 32A | 15kW |
| LC1D38 | 38A | 18,5kW |
| LC1D40 | 40A | 18,5kW |
| LC1D50 | 50A | 22kW |
| LC1D65 | 65A | 30kW |
| LC1D80 | 80A | 37kW |
| LC1D95 | 95A | 45kW |

Kód cívky (přípona): B7=24VAC, C7=36VAC, D7=42VAC, E7=48VAC, F7=110VAC, M7=220VAC, P7=230VAC, Q7=380VAC, BD=24VDC, LD=200VDC
Plný příklad: `LC1D09B7` (9A, 24VAC), `LC1D12BD` (12A, 24VDC)
Vyhledávání: `LC1D09`, `LC1D12`, `TeSys D`, `Schneider stykač`

Pomocné stykače: `CAD32`, `CAD50`, `CA2DN`

#### ABB (A-kontaktory)
Řady: **A**, **AF**, **AX**

| Model | Ie/AC3 |
|-------|--------|
| A9 | 9A (nové: AF09) |
| A12 | 12A |
| A16 | 16A |
| A26 | 26A |
| A30 | 30A |
| A40 | 40A |
| A50 | 50A |
| A63 | 63A |
| A75 | 75A |
| A95 | 95A |
| AF09 | 9A (elektronická cívka, univerzální 24–60V AC/DC) |
| AF16 | 16A |
| AF26 | 26A |
| AF38 | 38A |
| AF65 | 65A |

Přípona: `-30-10` = 3P, 1NO aux; `-30-10-70` = s elektr. cívkou; kód cívky: `230` = 220-240VAC, `024` = 24VDC
Plný příklad: `A9-30-10` + spec. cívky blok, `AF09-30-10-13` (AF, 24–60V)
Vyhledávání: `A9-30`, `A16-30`, `AF09`, `ABB stykač`

Pomocné stykače: `CA4-10`, `CA4-22`, `CAL4-11`

#### Eaton / Moeller (DILM série)
Řady: **DILM**, **DILER**, **DILR** (relé)

| Model | Ie/AC3 |
|-------|--------|
| DILM7 | 7A |
| DILM9 | 9A |
| DILM12 | 12A |
| DILM17 | 17A |
| DILM25 | 25A |
| DILM32 | 32A |
| DILM38 | 38A |
| DILM40 | 40A |
| DILM50 | 50A |
| DILM65 | 65A |
| DILM72 | 72A |

Přípona: `-01` = 1NC aux, `-10` = 1NO aux, `-11` = 1NO+1NC, napětí v označení cívky
Plný příklad: `DILM9-01(24VDC)`, `DILM12-10(230VAC)`
Vyhledávání: `DILM9`, `DILM12`, `Eaton stykač`, `Moeller DILM`

Pomocné stykače: `DILER-22`, `DILER-40`, `DILR`

<!-- /section:stykac -->

---

<!-- section:pojistka -->
## [pojistka] Pojistka (NH / Válcová / Skleněná)

### Přehled
Zahrnuje tři podtypy:
- **NH pojistka** (Nožová pojistka, HRC fuse) – velké výkony, průmyslová, velikosti NH00/0/1/2/3
- **Válcová pojistka** (Cylindrical fuse) – střední výkony, rozměry 10×38, 14×51, 22×58
- **Skleněná pojistka** (Glass fuse) – malé výkony, řídicí obvody, 5×20mm, 6,3×32mm

### Otázky průvodce
1. Typ pojistky: NH / Válcová / Skleněná
2. Velikost NH (NH00, NH0, NH1, NH2, NH3) – jen NH
3. Rozměr válcové (10×38, 14×51, 22×58) – jen válcová
4. Rozměr skleněné (5×20, 6,3×32) – jen skleněná
5. Jmenovitý proud [A]
6. Typ (gG, aM, gPV) – volitelné
7. Výrobce – volitelné

### Generování výrazů – NH
- `NH{vel} {amp}A` → `NH0 100A`
- `{amp}A NH{vel}` → `100A NH0`
- `{amp}A gG NH{vel}`
- `3NA{kód}` (Siemens)
- `LV{kód}` (ABB)
- `PNS{kód}` (OEZ)

### Generování výrazů – Válcová
- `{amp}A {rozměr}` → `16A 10x38`
- `{rozměr} {amp}A`
- `{amp}A {typ} {rozměr}`
- `{amp}gG` (bez rozměru)

### Generování výrazů – Skleněná
- `{amp}A {rozměr}` → `2A 5x20`
- `{rozměr} {amp}A`
- `{amp}A skleněná`

---

### Výrobci a typová označení – NH pojistky

#### Siemens
Řada **3NA**

| Velikost | Proud [A] | Typ. označení |
|----------|-----------|---------------|
| NH00 | 6–100A | 3NA3820 (6A), 3NA3824 (63A), 3NA3830 (100A) |
| NH00 | 125A | 3NA3832 |
| NH00 | 160A | 3NA3836 |
| NH0 | 100A | 3NA3830 |
| NH0 | 160A | 3NA3836 |
| NH0 | 200A | 3NA3840 |
| NH1 | 200A | 3NA5250 |
| NH1 | 250A | 3NA5252 |
| NH1 | 315A | 3NA5260 |
| NH2 | 400A | 3NA6220 |
| NH2 | 500A | 3NA6230 |
| NH3 | 630A | 3NA7830 |

gG = všeobecný; aM = motorový (vyšší proud zkratu tolerance)
Vyhledávání: `3NA3`, `3NA5`, `Siemens NH`, `NH00 100A`

#### ABB (Lindner/ABB)
Řada **LV**: `LV480316` (NH0, 160A, gG)
Vyhledávání: `LV480`, `ABB NH`

#### OEZ (český výrobce)
Řada **PNS**: `PNS00gG63` (NH00, 63A, gG)
Řada **PNA**: motorové pojistky aM
Vyhledávání: `PNS`, `OEZ NH`, `PNS00gG`

#### ETI
Řada **NH**: `NH00 gG 63A`, `NH0 gG 160A`
Vyhledávání: `ETI NH`, `NH00 ETI`

#### Eaton (Bussmann)
Vyhledávání: `Eaton NH`, `Bussmann NH`

---

### Výrobci a typová označení – Válcová pojistka

Standardní rozměry:
- **10×38mm** – nejběžnější, do 32A, 500V
- **14×51mm** – střední výkon, do 50A
- **22×58mm** – větší výkon, do 100A
- **8×31mm** (miniaturní, PC monty)

Typy:
- **gG** – všeobecné vedení (nejčastější)
- **aM** – motorový start (krátká zpožděná ochrana)
- **gPV** – fotovoltaika, ss napájení
- **gR** – polovodiče

#### OEZ
Řada **FSK**: `FSK-10-10-V-gG` (10A, 10×38, gG)
Vyhledávání: `FSK`, `OEZ 10x38`

#### Siemens
Řada **5SE**: `5SE2310` (10×38, 10A, gG)
Vyhledávání: `5SE`, `Siemens 10x38`

#### Schneider
Řada **DF2**: `DF2BA010` (10×38, 1A, gG)
Vyhledávání: `DF2`, `Schneider 10x38`

---

### Výrobci a typová označení – Skleněná pojistka

Standardní rozměry:
- **5×20mm** – miniaturní, do 6,3A, 250V
- **6,3×32mm** – do 32A, 250V

Typy: T (pomalá), F (rychlá), M (střední)

Vyhledávání: `5x20`, `6,3x32`, `skleněná pojistka`, `glass fuse`, `T{amp}A 5x20`

<!-- /section:pojistka -->

---

<!-- section:napajeci-zdroj -->
## [napajeci-zdroj] Napájecí zdroj (PSU – Power Supply Unit)

### Přehled
Spínaný napájecí zdroj pro montáž na DIN lištu nebo do rozváděče. Mění AC vstup na regulované DC napájení řídicích obvodů. Nejčastější výstupní napětí: **24VDC**. Výběr se řídí výstupním výkonem (W) nebo proudem (A) a vstupním napájecím napětím.

### Otázky průvodce
1. Výstupní napětí (24VDC / 12VDC / 5VDC / 48VDC)
2. Výstupní proud nebo výkon (A nebo W)
3. Výrobce (volitelné)

### Generování výrazů
- `{volt}VDC {amp}A`
- `{volt}V {watt}W`
- `{volt}VDC {watt}W`
- `QUINT {volt}V/{amp}A` (Phoenix Contact)
- `QUINT4 {volt}V {amp}A`
- `TRIO {volt}V {amp}A`
- `{volt}VDC PSU`
- `6EP {amp}` (Siemens LOGO!Power)

---

### Výrobci a typová označení

#### Phoenix Contact
Nejrozšířenější na trhu, velmi zastoupený v databázi.

**Řada QUINT4** (prémiová, diagnostika, výkonná)
| Výstup | Příklad |
|--------|---------|
| 24VDC / 5A | QUINT4-PS/1AC/24DC/5 |
| 24VDC / 10A | QUINT4-PS/1AC/24DC/10 |
| 24VDC / 20A | QUINT4-PS/1AC/24DC/20 |
| 24VDC / 40A | QUINT4-PS/1AC/24DC/40 |
| 48VDC / 5A | QUINT4-PS/1AC/48DC/5 |

**Řada TRIO** (průmyslová, střed)
| Výstup | Příklad |
|--------|---------|
| 24VDC / 5A | TRIO-PS/1AC/24DC/5 |
| 24VDC / 10A | TRIO-PS/1AC/24DC/10 |

**Řada STEP** (ekonomická)
| Výstup | Příklad |
|--------|---------|
| 24VDC / 1,75A | STEP-PS/1AC/24DC/1.75 |
| 24VDC / 3,5A | STEP-PS/1AC/24DC/3.5 |

**Starší řada QUINT** (bez čísla 4): `QUINT-PS/1AC/24DC/10`

Vyhledávání: `QUINT4`, `QUINT-PS`, `TRIO-PS`, `STEP-PS`, `Phoenix Contact 24VDC`

#### Wago
**Řada 787 / 2787**
| Výstup | Příklad |
|--------|---------|
| 24VDC / 1A | 787-602 |
| 24VDC / 5A | 787-1605 |
| 24VDC / 10A | 787-1611 |
| 24VDC / 20A | 787-1615 |
| 24VDC / 40A | 2787-2340 |

Vyhledávání: `787-16`, `2787`, `Wago PSU`, `Wago 24VDC`

#### Puls (německý výrobce, vysoká kvalita)
**Řady QS, CP, CS, ML**
| Výstup | Příklad |
|--------|---------|
| 24VDC / 5A | QS5.241 |
| 24VDC / 10A | QS10.241 |
| 24VDC / 20A | QS20.241 |
| 24VDC / 5A | CP5.241 |
| 24VDC / 10A | CP10.241 |

Vyhledávání: `QS10`, `CP10`, `Puls 24VDC`, `PULS QS`

#### Siemens (LOGO!Power, SITOP)
**LOGO!Power** (pro menší systémy)
| Výstup | Art. číslo | Příklad |
|--------|-----------|---------|
| 24VDC / 2,5A | 6EP1331-1SH03 | |
| 24VDC / 5A | 6EP1332-1SH53 | |
| 24VDC / 10A | 6EP1334-1SH01 | |
| 24VDC / 20A | 6EP1336-1SH03 | |

**SITOP** (průmyslová řada)
- SITOP PSU100S 24V/10A: `6EP1334-2BA20`
- SITOP PSU200M: vyšší výkony

Vyhledávání: `6EP13`, `LOGO Power`, `SITOP`, `Siemens PSU`

#### Mean Well
**DIN lišta řady: SDR, NDR, RSP, NES**
| Výstup | Příklad |
|--------|---------|
| 24VDC / 5A | SDR-120-24 |
| 24VDC / 10A | SDR-240-24 |
| 24VDC / 5A | NDR-120-24 |

Vyhledávání: `SDR-120`, `NDR-120`, `Mean Well 24V`, `SDR 24V`

#### Murr Elektronik
**Řady MCS, Mico**
- MCS 24V/10A: `85073`
- Mico Pro: inteligentní rozbočení

Vyhledávání: `MCS 24VDC`, `Murr 24V`, `Murr MCS`

<!-- /section:napajeci-zdroj -->

---

<!-- section:svorky -->
## [svorky] Svorky (Terminal Blocks)

### Přehled
Svorkovnice na DIN lištu pro připojení vodičů. Základní typy:
- **Průchodná** (feed-through) – nejběžnější, připojí se dva vodiče (vstup/výstup)
- **PE ochranná** – žlutozelená, pro ochranný vodič
- **Pojistková** – obsahuje pojistkový element nebo LED indikátor
- **Odpojovací / měřicí** – možnost odpojit obvod bez vyšroubování

Systémy připojení:
- **Šroubové** (screw) – klasika, spolehlivé, pomalejší montáž
- **Pružinové svorky** (spring-clamp / push-in) – rychlejší montáž, vibrace-odolné

### Otázky průvodce
1. Typ svorky (průchodná, PE, pojistková, odpojovací)
2. Průřez připojení [mm²]
3. Systém/výrobce (Phoenix Contact, Wago, ABB...)
4. Barva – volitelné (šedá=standard, modrá=N, žl.zelená=PE)

### Generování výrazů
- `svorka {mm}mm2`
- `svorka {mm}`
- `UT {mm}` (Phoenix Contact šroub)
- `ST {mm}` (Phoenix Contact pružina)
- `PT {mm}` (Phoenix Contact push-in)
- `281-{mm*100}` (Wago šroub) – např. `281-125` pro 1,25mm²
- `2081-{mm*100}` (Wago push-in)
- `{mm}² průchodná`

---

### Výrobci a typová označení

#### Phoenix Contact (Clipline Complete)
Největší portfolio, nejrozšířenější v průmyslu.

**Šroubové svorky – UT série**
| Typ | Průřez | Příklad |
|-----|--------|---------|
| UT 1,5 | 0,08–1,5mm² | UT 1,5-TWIN (2 vodiče) |
| UT 2,5 | 0,08–2,5mm² | UT 2,5 |
| UT 4 | 0,2–4mm² | UT 4 |
| UT 6 | 0,2–6mm² | UT 6 |
| UT 10 | 0,5–10mm² | UT 10 |
| UT 16 | 1–16mm² | UT 16 |
| UT 35 | 6–35mm² | UT 35 |

**Šroubové PE svorky – USLKG série**
| Typ | Průřez | Příklad |
|-----|--------|---------|
| USLKG 2,5 | do 2,5mm² | USLKG 2,5 |
| USLKG 5 | do 5mm² | USLKG 5 |
| USLKG 10 | do 10mm² | USLKG 10 |

**Pružinové svorky – ST série (PUSH IN)**
| Typ | Průřez |
|-----|--------|
| ST 1,5 | do 1,5mm² |
| ST 2,5 | do 2,5mm² |
| ST 4 | do 4mm² |

**Push-in svorky – PT serie**
| Typ | Průřez |
|-----|--------|
| PT 1,5 | do 1,5mm² |
| PT 2,5 | do 2,5mm² |
| PT 4 | do 4mm² |
| PT 10 | do 10mm² |

**Speciální**
- `UK 5 N` – neutrální svorka se dvěma připojovacími body
- `FBS` – spojovací můstek (bridge) pro propojení svorek
- `END-W` – koncová deska
- `CLIPFIX 35` – nosná patka na lištu

Vyhledávání: `UT 2,5`, `ST 2,5`, `USLKG`, `Phoenix Contact svorka`, `Clipline`

#### Wago
Dva hlavní systémy: šroubové 281/282/283, pružinové 2081/2082

**Šroubové 2-vodičové – 281 série**
| Model | Průřez | Příklad |
|-------|--------|---------|
| 281-101 | 0,08–1,5mm² | 281-101 |
| 281-111 | do 1,5mm² | 281-111 (s vypínačem) |
| 281-120 | do 2,5mm² | 281-120 |
| 281-125 | do 2,5mm² | 281-125 (PE) |

**Šroubové 3-vodičové – 282 série** (vstup+výstup+PE v jedné)

**Push-in 3-vodičové – 2081 série**
| Model | Průřez |
|-------|--------|
| 2081-1201 | do 2,5mm² |
| 2081-3201 | do 2,5mm² (PE) |

**Kompaktní push-in – 2604/2773 série**
- 2773 = páčkové (lever) svorky, pro tuhé i lankové

**Wago 221 série** – universální propojovací svorky (ne DIN lišta)

Vyhledávání: `281-120`, `2081`, `Wago 2,5mm`, `Wago 281`, `Wago svorka`

#### ABB (SAK / SNK / Marathon)
Řady: **SAK**, **SNK**, **SAKD** (odpojovací)
| Typ | Průřez | Příklad |
|-----|--------|---------|
| SAK 2,5 | do 2,5mm² | SAK 2,5 |
| SAK 4 | do 4mm² | SAK 4 |
| SAK 10 | do 10mm² | SAK 10 |
| SNK 4 | průchodná | SNK 4 (AL pro hliník) |

Vyhledávání: `SAK 2,5`, `SAK 4`, `ABB svorka`

#### Weidmüller
Řady: **W**, **ZDU**, **ACT**, **ZQV**
| Typ | Průřez | Příklad |
|-----|--------|---------|
| W 2,5 | do 2,5mm² | W 2.5/S WT |
| ZDU 2,5 | do 2,5mm² | ZDU 2,5 |
| ZQV 2,5 | push-in | ZQV 2,5 |

Vyhledávání: `Weidmüller`, `ZDU 2,5`, `WDU`

<!-- /section:svorky -->

---

<!-- section:frekv-menic -->
## [frekv-menic] Frekvenční měnič (VFD – Variable Frequency Drive)

### Přehled
Frekvenční měnič (FM, inverter, drive) řídí otáčky AC motorů změnou frekvence a napětí. Výběr závisí na výkonu motoru (kW), napájecím napětí a aplikaci.

Aplikace:
- **Všeobecné** – pumpy, ventilátory, dopravníky
- **HVAC** – klimatizace, větrání
- **Pohony s vysokými nároky** – CNC, zdvihací zařízení

### Otázky průvodce
1. Výkon motoru [kW]
2. Napájení (1×230VAC / 3×400VAC)
3. Výrobce (volitelné)

### Generování výrazů
- `{kw}kW`
- `{kw}kW {napájení}V`
- `ACS {kw}kW` (ABB)
- `G120 {kw}kW` (Siemens)
- `Altivar {kw}kW` (Schneider)
- `FC302 {kw}kW` (Danfoss)
- `i550 {kw}kW` (Lenze)
- `MOVITRAC {kw}kW` (SEW)

---

### Výrobci, řady a typová označení

#### ABB
Nejrozšířenější, špičková spolehlivost.

| Řada | Popis | Rozsah kW | Napájení |
|------|-------|-----------|---------|
| ACS310 | Základní, 1-fáz. vstup | 0,37–7,5 | 1×230V |
| ACS355 | Univerzální | 0,37–22 | 1×230 / 3×400V |
| ACS580 | Moderní, IoT | 0,75–250 | 3×400V |
| ACS550 | Starší standard | 0,75–132 | 3×400V |
| ACS800 | High performance | 0,55–5600 | 3×400V |
| ACS880 | Premium, DriveComposer | 0,55–5600 | 3×400V |
| ACH550 | HVAC verze | 0,75–355 | 3×400V |

Typové označení ACS355: `ACS355-03E-04A1-4` (3-fázový vstup, 4,1A, 400V → 1,5kW)
Vyhledávání: `ACS355`, `ACS580`, `ACS550`, `ABB VFD`, `ABB drive`

#### Siemens (SINAMICS)
| Řada | Popis | Rozsah kW |
|------|-------|-----------|
| MICROMASTER 420 | Základní, 1-fáz | 0,12–11 |
| MICROMASTER 440 | Pokročilý | 0,12–250 |
| SINAMICS G110 | Kompaktní, základní | 0,12–3 |
| SINAMICS G120 | Modulární, průmyslový standard | 0,37–250 |
| SINAMICS G120C | Kompaktní verze G120 | 0,37–18,5 |
| SINAMICS G120X | Pumpy/ventilátory | 0,75–630 |
| SINAMICS G130 | Skříňový, výkonný | 75–800 |
| SINAMICS S120 | Servo+vektor | – |

G120 má modulární strukturu: Control Unit (CU) + Power Module (PM)
- PM240-2: standardní, brzdný odpor ext.
- PM340: 1-fázový vstup
Vyhledávání: `SINAMICS G120`, `G120C`, `6SL3`, `Siemens VFD`

#### Schneider Electric (Altivar)
| Řada | Popis | Rozsah kW |
|------|-------|-----------|
| Altivar 12 | Základní, 1-fáz | 0,18–4 |
| Altivar 212 | HVAC | 0,75–75 |
| Altivar 320 | Kompaktní, univerzální | 0,18–15 |
| Altivar 340 | Výkonný | 0,75–75 |
| Altivar 630 | Průmyslový | 0,75–500 |
| Altivar 930 | High-end | 0,75–800 |
| ATV312 | Starší, rozšířený | 0,18–15 |
| ATV303 | Starší základní | 0,18–7,5 |

Typové označení: `ATV320U07N4C` (0,75kW, 400V, kompaktní)
Vyhledávání: `Altivar 320`, `ATV320`, `ATV312`, `Schneider drive`

#### Danfoss (VLT)
| Řada | Popis | Rozsah kW |
|------|-------|-----------|
| FC51 (MICRO) | Základní | 0,18–22 |
| FC101 (HVAC) | Ventilátory, pumpy | 0,25–90 |
| FC102 (AQUA) | Vodní aplikace | 0,25–315 |
| FC301 (AutomDrive) | Průmyslový | 1,1–90 |
| FC302 (AutomDriveAdv) | Pokročilý | 0,25–1400 |

Vyhledávání: `FC302`, `VLT`, `Danfoss VLT`, `FC101`

#### Lenze
| Řada | Popis |
|------|-------|
| SMVector | Kompaktní, základní |
| i510 | Moderní základní |
| i550 | Modulární průmyslový |
| 8400 | Starší průmyslová řada |

Vyhledávání: `Lenze i550`, `SMVector`, `Lenze VFD`

#### SEW-Eurodrive
| Řada | Popis |
|------|-------|
| MOVITRAC B | Kompaktní VFD |
| MOVIMOT | VFD integrovaný v motoru |
| MOVIDRIVE B | Pokročilý |

Vyhledávání: `MOVITRAC`, `SEW VFD`

<!-- /section:frekv-menic -->

---

<!-- section:soft-starter -->
## [soft-starter] Soft Starter (Softstartér)

### Přehled
Softstartér zajišťuje plynulý rozběh a zastavení AC motorů omezením náběhového proudu. Vhodný pro pumpy, kompresory, dopravníky – tam kde tvrdý rozběh způsobuje mechanické rázy nebo přetěžuje síť.

### Otázky průvodce
1. Jmenovitý proud motoru nebo výkon [A nebo kW]
2. Napájecí napětí (3×400VAC)
3. Výrobce (volitelné)

### Generování výrazů
- `softstartér {amp}A`
- `soft starter {amp}A`
- `{kw}kW softstartér`
- `PSR{kód}` (ABB)
- `PSE{kód}` (ABB)
- `3RW{kód}` (Siemens)
- `ATS{kód}` (Schneider)
- `DS7-{kód}` (Eaton)

---

### Výrobci a typová označení

#### ABB
| Řada | Popis | Proud |
|------|-------|-------|
| PSR | Základní (bez bypassu) | 3–105A |
| PSE | Se zabudovaným bypass relé | 18–105A |
| PSTB | S momentovým řízením | 30–2350A |
| PST | Pokročilý | 30–1250A |
| PSDH | High feature | – |

| Model | Proud |
|-------|-------|
| PSR3-600-11 | 3A |
| PSR6-600-11 | 6A |
| PSR9-600-11 | 9A |
| PSR12-600-11 | 12A |
| PSR16-600-11 | 16A |
| PSR25-600-11 | 25A |
| PSR37-600-11 | 37A |
| PSR60-600-11 | 60A |
| PSE18-600-70 | 18A (s bypass) |
| PSE30-600-70 | 30A |
| PSE45-600-70 | 45A |
| PSTB30-600-70 | 30A (moment) |
| PSTB72-600-70 | 72A |

Vyhledávání: `PSR`, `PSE`, `PSTB`, `ABB softstartér`, `PSR16`

#### Siemens (SIRIUS)
| Řada | Proud | Příklad |
|------|-------|---------|
| 3RW30 | 3,5–45A | 3RW3013-1BB04 |
| 3RW40 | 7–432A | 3RW4036-1BB14 |
| 3RW44 | pokročilý | 3RW4447-6BC34 |
| 3RW55 | S-bus | – |

Typové označení 3RW40: `3RW40{proud_kód}-{verze}`
- 3RW4013 = 12A, 3RW4017 = 17A, 3RW4023 = 25A, 3RW4026 = 38A, 3RW4027 = 45A

Vyhledávání: `3RW40`, `3RW30`, `SIRIUS softstartér`, `3RW4036`

#### Schneider Electric (Altistart)
| Řada | Proud | Příklad |
|------|-------|---------|
| ATS01 | 6–72A | ATS01N106QN (6A) |
| ATS22 | 17–870A | ATS22D17Q (17A) |
| ATS48 | 17–1200A | ATS48D17YS342 |

Vyhledávání: `ATS22`, `Altistart`, `ATS01`, `Schneider softstartér`

#### Eaton (DS7)
| Model | Proud |
|-------|-------|
| DS7-342SX007N0-N | 7A |
| DS7-342SX016N0-N | 16A |
| DS7-342SX040N0-N | 40A |

Vyhledávání: `DS7`, `Eaton softstartér`

<!-- /section:soft-starter -->

---

<!-- section:transformator -->
## [transformator] Transformátor

### Přehled
Zahrnuje:
- **Řídicí transformátor** – napájení řídicích obvodů, výstup 24/115/230VAC
- **Bezpečnostní transformátor** – SELV/PELV, oddělené vinutí, max. 50VAC
- **Silový transformátor** – přizpůsobení napájení, větší výkony

### Otázky průvodce
1. Výkon [VA nebo kVA]
2. Vstupní napětí
3. Výstupní napětí
4. Výrobce (volitelné)

### Generování výrazů
- `transformátor {VA}VA`
- `trafo {VA}VA`
- `{VA}VA {Uin}/{Uout}V`
- `{Uin}/{Uout}VAC`
- `{kVA}kVA`
- `4AM{kód}` (Siemens)

---

### Výrobci a typová označení

#### Block (německý výrobce, standard v průmyslu)
| Řada | Popis | Příklad |
|------|-------|---------|
| VB | Bezpečnostní, SELV | VB 40/2x12 |
| VC | Řídicí, oddělující | VC 250/230/24 |
| VCT | Řídicí s více výstupy | VCT 160/230/24/12 |
| VC-TP | Toroidní | |

Vyhledávání: `Block VC`, `Block VB`, `Block transformátor`

#### Siemens
| Označení | Výkon | Příklad |
|----------|-------|---------|
| 4AM6142 | 630VA | 4AM6142-8ED40-0EA0 |
| 4AM4842 | 400VA | 4AM4842-8ED40-0EA0 |

Vyhledávání: `4AM`, `Siemens transformátor`, `4AM6`

#### Murr Elektronik
Řada MT: `MT 400/230/24` (400VA, 230→24VAC)
Vyhledávání: `Murr trafo`, `MT 400`

#### ABB
Řídicí transformátory pro průmysl
Vyhledávání: `ABB transformátor`

<!-- /section:transformator -->

---

<!-- section:rele -->
## [rele] Relé (Pomocné relé)

### Přehled
Elektromagnetické relé pro pomocné obvody. Slouží pro:
- Galvanické oddělení obvodů
- Výkonové zesílení signálu
- Logické funkce (časové, signalizační)

Typy:
- **Klasické patice relé** – vyjímatelné, snadná výměna (Finder 40, 55)
- **Přímé zapojení (PCB/DIN)** – přimontované na desku nebo lištu (Phoenix Contact PLC-RSC)
- **Časová relé** – s nastavitelným zpožděním

### Otázky průvodce
1. Napájecí napětí cívky (24VDC, 230VAC, 24VAC, 12VDC, 48VDC...)
2. Konfigurace kontaktů (1CO, 2CO, 4CO – přepínací; nebo NO/NC)
3. Provedení (patice, DIN lišta, PCB)
4. Výrobce (volitelné)

### Generování výrazů
- `relé {volt}V`
- `{volt}VDC relé`
- `{volt}VAC relé`
- `{volt}V {nx}CO`
- `40.{kont}{kont} {volt}` (Finder)
- `PLC-RSC {volt}DC` (Phoenix Contact)
- `PLC-RSP {volt}DC`
- `88.{kont} {volt}` (Finder patice)
- `RXM {volt}` (Schneider)

---

### Výrobci a typová označení

#### Finder
Největší evropský výrobce relé. Rozsáhlé portfolio.

**Řada 40** – základní průmyslová (patice/DIN, 1CO/2CO)
| Model | Kontakty | Typ cívky | Příklad |
|-------|----------|-----------|---------|
| 40.31 | 1CO (1A) | – | 40.31.9.024.0000 (24VDC) |
| 40.31 | 1CO | – | 40.31.8.230.0000 (230VAC) |
| 40.52 | 2CO | – | 40.52.9.024.0000 (24VDC) |
| 40.61 | 3CO | – | 40.61.9.024.0000 |

Patice pro řadu 40: **90.03** (1CO), **90.05** (2CO)

**Řada 55** – výkonnější (3CO/4CO, 10A)
| Model | Kontakty | Příklad |
|-------|----------|---------|
| 55.33 | 3CO | 55.33.9.024.0000 |
| 55.34 | 4CO | 55.34.9.024.0000 |
| 55.33 | 3CO | 55.33.8.230.0000 (230VAC) |

Patice: **95.03.3** (pro 55 série)

**Řada 62** – miniaturní, PCB
**Řada 60** – průmyslová 4CO

Kódování Finder: `{série}.{kontakty}.{napájecí}` kde napájecí: 9=DC, 8=AC

Vyhledávání: `Finder 40.31`, `40.52`, `55.34`, `Finder relé`, `40.31.9.024`

#### Phoenix Contact (PLC-RSC / PLC-RSP)
**PLC-RSC** – standardní DIN lišta
| Model | Kont. | Napájení | Příklad |
|-------|-------|---------|---------|
| PLC-RSC-24DC/21 | 1CO | 24VDC | PLC-RSC-24DC/21 |
| PLC-RSC-24DC/21-21 | 2CO | 24VDC | |
| PLC-RSC-230AC/21 | 1CO | 230VAC | |

**PLC-RSP** – s indikační LED
Vyhledávání: `PLC-RSC`, `Phoenix Contact relé`, `PLC-RSP 24DC`

#### Wago (788 / 857 série)
| Model | Popis |
|-------|-------|
| 788-xx | DIN lišta relé |
| 857-xx | Relé s funkcemi |

Vyhledávání: `Wago 788`, `Wago relé`

#### Schneider Electric (Zelio Relay – RXM)
| Model | Kontakty | Příklad |
|-------|----------|---------|
| RXZE2M114 | 4CO | patice |
| RXM4AB2B7 | 4CO | 24VAC |
| RXM4AB2BD | 4CO | 24VDC |
| RXM2LB2B7 | 2CO | 24VAC |

Vyhledávání: `RXM`, `Zelio`, `Schneider relé`, `RXZE`

#### TE Connectivity / Schrack
Řady: **RT**, **PB** (patice relé)
Vyhledávání: `RT314F24`, `Schrack relé`

#### Omron
Řady: **G2R**, **G2E**, **MY**
Vyhledávání: `Omron G2R`, `G2R-2`

#### Takto hledat časová relé
Pokud jde o **časové relé**, přidat do výrazu: `časové`, `timer`, `on-delay`, `off-delay`, nebo název funkce.
Výrobci časových relé: Finder (86 série), Phoenix Contact, Siemens (3RP).

<!-- /section:rele -->

---

<!-- section:din-lista -->
## [din-lista] DIN lišta

### Přehled
Normalizovaná montážní lišta pro instalaci elektrických komponent do rozváděče.

Typy:
- **TS 35 / NS 35** – nejběžnější, 35mm šířka, hloubka 7,5mm nebo 15mm
- **TS 15 / NS 15** – 15mm šířka, pro menší komponenty
- **G-profil** – starší, méně používaný
- **Nerezová** – pro agresivní prostředí, potravinářský průmysl

Provedení:
- **Perforovaná** – se sloty pro větší ventilaci a úsporu materiálu
- **Hladká** (plná) – větší pevnost
- **Ocelová pozinkovaná** – standardní
- **Nerezová (316L)** – hygienické prostředí

Délky: standardně **1m**, **2m**, nebo přes metr (řezání na místě)

### Otázky průvodce
1. Typ (35mm standard / 15mm / nerezová)
2. Délka (1m / 2m / jiná)
3. Výrobce (volitelné)

### Generování výrazů
- `DIN lišta 35mm`
- `TS35`
- `NS 35`
- `TS 35/7,5 {délka}m`
- `NS 35/7,5`
- `lišta DIN 1m`
- `montážní lišta 35mm`

---

### Výrobci a typová označení

#### Phoenix Contact
| Model | Popis |
|-------|-------|
| NS 35/7,5 | TS35, hloubka 7,5mm, ocel, 1m |
| NS 35/15 | TS35, hloubka 15mm, 1m |
| NS 32 | 32mm, speciální |
| NS 35/7,5 SLNP | Nerezová |

Vyhledávání: `NS 35`, `Phoenix Contact lišta`, `NS 35/7`

#### Wago
| Model | Popis |
|-------|-------|
| 210-112 | TS35, 1m, ocel |
| 210-113 | TS35, 2m |

Vyhledávání: `Wago 210-112`, `Wago DIN lišta`

#### Schneider Electric
| Model | Popis |
|-------|-------|
| AM1DP200H | TS35, 2m, perforovaná |
| AM1DP100H | 1m |

Vyhledávání: `AM1DP`, `Schneider DIN lišta`

#### Rittal
DIN lišty pro skříně Rittal, montáž do montážní desky.
Vyhledávání: `Rittal DIN lišta`, `Rittal NS35`

#### Generické / neutrální
Hledání: `TS35`, `NS35`, `35mm lišta`, `DIN rail 1m`

<!-- /section:din-lista -->

---

<!-- section:rittal -->
## [rittal] Rittal – Díly rozváděčových skříní

### Přehled
Rittal je přední výrobce rozváděčových skříní a příslušenství. Komponenty jsou zpravidla označeny čtyřmístným číslem série + katalogovým číslem.

Hlavní série skříní:
- **AE** – malé kompaktní skříně (polykarbonát/kov)
- **CS** – kompaktní ocelové skříně
- **VX25** – modulární průmyslové skříně (nástupce TS8)
- **TS8** – starší průmyslová série, stále velmi rozšířená
- **KX** – kabelové skříně, menší

Nejdůležitější kategorie náhradních dílů:

#### Montážní desky (Mounting plates)
Pro montáž komponent uvnitř skříně.
- Ocelová montážní deska pro AE: `AE 2500.600` (pro AE 1038.500)
- TS8 montážní deska: `TS 8609.500`
- Příklad hledání: `montážní deska AE`, `Rittal deska 600×500`

#### Ventilátor + filtr (Fan and filter)
SK série klimatizace a ventilace.
| Model | Popis |
|-------|-------|
| SK 3237.100 | Ventilátor 24VDC, 60m³/h |
| SK 3237.200 | Ventilátor 230VAC |
| SK 3150.100 | Ventilátor 230V, 55m³/h |
| SK 3324.100 | Filtrační podložka |
| SK 3329.100 | Střešní ventilátor 230V |

Vyhledávání: `SK 3237`, `Rittal ventilátor`, `SK 3150`

#### Termostat / Hygrostat
| Model | Popis |
|-------|-------|
| SK 3110.000 | Termostat 0–60°C, NC |
| SK 3114.000 | Termostat (NO) |
| SK 3115.000 | Hygrostat |

Vyhledávání: `SK 3110`, `Rittal termostat`

#### Sokl (Plinth/Base)
Sokl přidává výšku pod skříní, umožňuje průchod kabelů.
- TS8 sokl: `TS 8601.000` (TS8 200×600×800)
- VX25 sokl: `VX 8640.040`
Vyhledávání: `Rittal sokl`, `TS 8601`, `VX 8640`

#### Zámky a závěsy (Locks and hinges)
| Typ | Popis |
|-----|-------|
| SZ 4315.000 | Knoflík trojhranný |
| SZ 4316.000 | Knoflík s klíčem |
| SZ 4600.000 | Závěs pro AE |
| SZ 4601.000 | Závěs pro TS8 |

Vyhledávání: `SZ 4315`, `Rittal závěs`, `Rittal zámek`

#### Průchodky a záslepky Rittal
(viz sekce průchodky a záslepky)

### Otázky průvodce
1. Typ dílu (montážní deska, ventilátor, termostat, sokl, zámek, závěs)
2. Série skříně (AE, CS, VX25, TS8, KX)
3. Rozměry nebo katalogové číslo (volitelné)

### Generování výrazů
- `Rittal {typ}`
- `{série} {typ}`
- `{katalogové číslo}`
- `SK {číslo}` (pro klimatizaci)
- `SZ {číslo}` (pro příslušenství)

<!-- /section:rittal -->

---

<!-- section:hlavni-vypinac -->
## [hlavni-vypinac] Hlavní vypínač / Odpojovač / Motorový odpojovač

### Přehled
Zahrnuje:
- **Hlavní vypínač (odpojovač)** – bezpečné odpojení od sítě (OT, 3KD série), rotační ovládání
- **Motorový odpojovač** – kombinace pojistkového odpojovače a základny (MINISAVE)
- **Odpínač** – bez přerušení zátěže (jen viditelné oddělení)

### Otázky průvodce
1. Typ (Rotační odpojovač / Pojistkový odpojovač)
2. Jmenovitý proud [A]
3. Počet pólů (3P nebo 4P)
4. Výrobce (volitelné)

### Generování výrazů
- `hlavní vypínač {amp}A`
- `odpojovač {amp}A {P}P`
- `OT{amp}F3` (ABB, 3-pól)
- `OT{amp}F4` (ABB, 4-pól)
- `3LD{kód}` (Siemens)
- `P{amp}/E` (Eaton)
- `VCF{kód}` (Schneider)

---

### Výrobci a typová označení

#### ABB (OT / OS serie)
**OT série** – rotační odpojovač, 3 nebo 4 póly, do 1600A

| Model | Proud |
|-------|-------|
| OT16F3 | 16A, 3P |
| OT25F3 | 25A, 3P |
| OT40F3 | 40A, 3P |
| OT63F3 | 63A, 3P |
| OT80F3 | 80A, 3P |
| OT100F3 | 100A, 3P |
| OT160F3 | 160A, 3P |
| OT200F4 | 200A, 4P |
| OT250F4 | 250A, 4P |

Kód: `OT{proud}F{póly}` kde F=standard, E=extended
Vyhledávání: `OT63F3`, `ABB odpojovač`, `OT 63A`, `OT100`

#### Siemens
**3LD série** – bezpečnostní odpojovač

| Model | Proud |
|-------|-------|
| 3LD2003-0TK13 | 25A, 3P |
| 3LD2004-0TK13 | 25A, 4P |
| 3LD2203-0TK13 | 63A, 3P |
| 3KD3230-0NE10-0 | 32A modulární |

Vyhledávání: `3LD`, `3KD`, `Siemens odpojovač`

#### Eaton / Moeller
**P série** – rotační odpojovač

| Model | Proud |
|-------|-------|
| P1-25/E/SVB | 25A, 3P |
| P1-32/E/SVB | 32A |
| P3-63/E/SVB | 63A |
| P3-100/E/SVB | 100A |

Vyhledávání: `P1-25`, `Eaton odpojovač`, `Moeller P3`

#### Schneider Electric
**VARIO** série
| Model | Proud |
|-------|-------|
| VCF0 | do 12A |
| VCF1 | do 25A |
| VCF2 | do 40A |
| VCF3 | do 63A |

Vyhledávání: `VCF`, `VARIO`, `Schneider odpojovač`

<!-- /section:hlavni-vypinac -->

---

<!-- section:tlacitko -->
## [tlacitko] Tlačítko / Signálka / Přepínač

### Přehled
Ovládací prvky pro panely rozváděčů.

Zahrnuje:
- **Tlačítko** (momentový kontakt, NO nebo NC)
- **Přepínač** (udržovací poloha, 2 nebo 3 polohy)
- **Signálka** (LED/žárovka indikátor)
- **Nouzový stop** (hřibový tlačítko, zástavná funkce)
- **Klíčový přepínač**

Standardní průměr montážního otvoru: **22mm** (průmysl), **16mm** (menší panel)

Barvy (standardizovano IEC 60073):
- **Zelená** – start, zapnout
- **Červená** – stop, vypnout, nouzový stop
- **Žlutá/Oranžová** – varování, reset
- **Modrá** – specifická funkce
- **Bílá/Šedá** – obecná funkce

### Otázky průvodce
1. Typ (tlačítko / přepínač / signálka / nouzový stop)
2. Barva
3. Kontakty (1NO, 1NC, 2NO)
4. Průměr (22mm / 16mm)
5. Výrobce (volitelné)

### Generování výrazů
- `tlačítko {barva}`
- `{barva} tlačítko 22mm`
- `signálka {barva}`
- `M22-D-{barva_kod}` (Eaton)
- `XB4BA{kód}` (Schneider)
- `3SB3{kód}` (Siemens)

---

### Výrobci a typová označení

#### Eaton / Moeller (RMQ-Titan / M22 série)
Modulární systém: ovladač (actuator) + kontaktní element (contact block) se kombinují.

**Ovladače M22 série**
| Model | Popis |
|-------|-------|
| M22-D-G | Tlačítko plochý, zelená |
| M22-D-R | Tlačítko plochý, červená |
| M22-D-Y | Tlačítko plochý, žlutá |
| M22-D-W | Tlačítko plochý, bílá |
| M22-DH-G | Tlačítko vysoký, zelená |
| M22-PV | Přepínač 2-polohový |
| M22-WRK3P | Klíčový přepínač 3-pol. |
| M22-DP-R | Nouzový stop hřib, červená |

**Kontaktní bloky**
| Model | Kontakty |
|-------|----------|
| M22-K10 | 1NO |
| M22-K01 | 1NC |
| M22-K11 | 1NO+1NC |

**Signálky M22**
| Model | Barva | Napětí |
|-------|-------|--------|
| M22-L-G | Zelená LED | 24V |
| M22-L-R | Červená LED | 24V |
| M22-L-Y | Žlutá LED | 24V |

Vyhledávání: `M22-D-G`, `M22-K10`, `M22-L-G`, `Eaton M22`, `RMQ`

#### Schneider Electric (Harmony – XB4, XB5, XB7)
Přímá stavba: ovládač + kontakt v jednom dílu (nejčastěji), nebo modulární.

**XB4 série** – kovové (chromové), 22mm
| Model | Popis |
|-------|-------|
| XB4BA31 | 1NO, zelená |
| XB4BA42 | 1NC, červená |
| XB4BA21 | 1NO, bílá |
| XB4BJ33 | přepínač 3-polohy |
| XB4BS8444 | nouzový stop hřib |
| XB4BVM4 | signálka LED zelená |

**XB5 série** – plastové, 22mm
| Model | Popis |
|-------|-------|
| XB5AA31 | 1NO, zelená |
| XB5AA42 | 1NC, červená |

Vyhledávání: `XB4BA31`, `XB4`, `Harmony`, `Schneider tlačítko 22mm`

#### Siemens (SIRIUS 3SB3)
Modulární systém, 22mm.

**Ovladače 3SB3**
| Model | Popis |
|-------|-------|
| 3SB3000-0AA11 | 1NO start, zelená |
| 3SB3000-0EA01 | 1NC stop, červená |
| 3SB3001-0AA11 | Osvětlené, zelená |
| 3SB3400-0A | Nouzový stop hřib |

**Kontaktní bloky**
| Model | Kontakty |
|-------|----------|
| 3SB3400-0E | 1NO+1NC |

Vyhledávání: `3SB3`, `SIRIUS tlačítko`, `3SB3000`

#### ABB (CP série)
| Model | Popis |
|-------|-------|
| CP1-10G-10 | 1NO, zelená |
| CP1-10R-01 | 1NC, červená |

Vyhledávání: `ABB CP`, `CP1-10G`

<!-- /section:tlacitko -->

---

<!-- section:pruchcdka -->
## [pruchcdka] Průchodka (Cable Gland)

### Přehled
Průchodka (kabelová vývodka) utěsňuje a fixuje kabel v otvoru skříně nebo kabelového kanálu. Zajišťuje krytí IP, EMC stínění a tah-odpor kabelu.

Typy závitů:
- **PG** (Panzergewinde) – starší metrický, stále velmi rozšířený (PG7, PG9, PG11, PG13.5, PG16, PG21, PG29, PG36, PG42, PG48)
- **Metrický M** – moderní standard (M12, M16, M20, M25, M32, M40, M50, M63)
- **NPT** – americký standard (řídce)

Materiály:
- **Plast (PA/nylon)** – nejběžnější, ekonomický
- **Mosaz** – odolnost, EMC
- **Nerez 316L** – potravinářství, agresivní prostředí
- **S metrickým závitem + těsnicím prvkem** – různé průměry kabelu

### Otázky průvodce
1. Typ závitu (PG / Metrický M / NPT)
2. Velikost PG (PG7, PG9, PG11, PG13.5, PG16, PG21, PG29) – jen PG
3. Velikost M (M12, M16, M20, M25, M32, M40) – jen M
4. Materiál (volitelné – PA, mosaz, nerez)
5. Výrobce (volitelné)

### Generování výrazů – PG
- `průchodka PG{vel}`
- `PG{vel} průchodka`
- `PG{vel}`
- `Skindicht PG{vel}` (Lapp)
- `SZ {kat_číslo}` (Rittal)

### Generování výrazů – Metrický M
- `průchodka M{vel}`
- `M{vel} průchodka`
- `M{vel}×1,5` (závit)

---

### Výrobci a typová označení

#### Lapp (SKINDICHT)
Nejrozšířenější výrobce průchodek v průmyslu.

| Řada | Popis |
|------|-------|
| SKINDICHT CE | Základní plastová |
| SKINDICHT SVENT | Odvzdušňovací |
| SKINDICHT SM | Pro stíněné kabely |
| SKINDICHT CEM | Mosazná, EMC |

| Označení | Závit | Pro průměr kabelu |
|----------|-------|-------------------|
| SKINDICHT CE-M16 | M16×1,5 | 4–10mm |
| SKINDICHT CE-M20 | M20×1,5 | 6–12mm |
| SKINDICHT CE-M25 | M25×1,5 | 13–18mm |
| SKINDICHT CE-PG9 | PG9 | 4–8mm |
| SKINDICHT CE-PG11 | PG11 | 5–10mm |
| SKINDICHT CE-PG13.5 | PG13,5 | 6–12mm |
| SKINDICHT CE-PG16 | PG16 | 10–14mm |
| SKINDICHT CE-PG21 | PG21 | 13–18mm |

Vyhledávání: `SKINDICHT`, `Lapp průchodka`, `SKINDICHT CE-M20`

#### Rittal
Průchodky pro skříně AE, TS8, VX25.

| Model | Závit | Popis |
|-------|-------|-------|
| SZ 2451.000 | PG11 | Plast |
| SZ 2453.000 | PG13,5 | Plast |
| SZ 2455.000 | PG16 | Plast |
| SZ 2465.000 | PG13,5 | Plast (nejčastější) |
| SZ 2470.000 | M20 | Plast |
| SZ 2476.000 | M25 | Plast |

Vyhledávání: `SZ 2451`, `SZ 2465`, `Rittal průchodka`, `Rittal SZ`

#### Phoenix Contact
Pro průchodky skříní, EMC
| Model | Závit |
|-------|-------|
| SK-GMK-M20 | M20 |
| SK-GMK-M25 | M25 |

Vyhledávání: `SK-GMK`, `Phoenix průchodka`

#### Roxtec
Modulární kabelové tranzity pro větší průchody více kabely.
Vyhledávání: `Roxtec`

<!-- /section:pruchcdka -->

---

<!-- section:zaslepka -->
## [zaslepka] Záslepka (Blanking Plug / Blanking Plate)

### Přehled
Záslepka uzavírá nevyužité otvory v rozváděčové skříni nebo kabelovém kanálu. Zajišťuje stupeň krytí IP a estetiku.

Typy:
- **Závitová záslepka** – šroubovací do PG nebo M závitu
- **Panelová záslepka** – zasune/zacvakne do panelového výřezu (standardní výřezy 22mm, 30mm)
- **Skříňová** – ucpávka pro Rittal/skříně (různé tvary)

### Otázky průvodce
1. Pro jaký otvor (PG závit / Metrický M závit / Panelový výřez)
2. Velikost (PG7, PG9, PG11... nebo M12, M16, M20... nebo průměr mm)
3. Materiál (plast / kov) – volitelné
4. Výrobce (volitelné)

### Generování výrazů – PG závit
- `záslepka PG{vel}`
- `PG{vel} záslepka`
- `zaslepení PG{vel}`
- `Blindstop PG{vel}` (Lapp)

### Generování výrazů – Metrický M
- `záslepka M{vel}`
- `M{vel} záslepka`

### Generování výrazů – Panelový výřez
- `záslepka {průměr}mm`
- `panel záslepka {průměr}`
- `zaslepovací krytka {průměr}`

---

### Výrobci a typová označení

#### Lapp
| Model | Závit |
|-------|-------|
| SKINTOP BS-M20 | M20 záslepka |
| SKINTOP BS-PG11 | PG11 záslepka |
| SKINTOP BS-PG13.5 | PG13,5 |

Vyhledávání: `SKINTOP BS`, `Lapp záslepka`

#### Rittal
| Model | Popis |
|-------|-------|
| SZ 2481.000 | PG11 záslepka |
| SZ 2482.000 | PG13,5 |
| SZ 2483.000 | PG16 |
| SZ 2486.000 | M20 |
| SZ 2488.000 | M25 |

Vyhledávání: `SZ 2481`, `Rittal záslepka`, `Rittal SZ záslepka`

#### Phoenix Contact
Vyhledávání: `BS-M`, `Phoenix záslepka`

#### Panelové záslepky (pro ovládací prvky 22mm)
Pro zaslepení nevyužitých 22mm otvorů ovládacích panelů:
- Schneider: `XB5 AV` série
- Eaton: `M22-BLK`
- Siemens: `3SB3400-0A`

Vyhledávání: `22mm záslepka`, `M22-BLK`, `XB5AV`

<!-- /section:zaslepka -->

---

## Poznámky k vyhledávání

### Obecné zásady
- Zkoušet více variant zápisu: s/bez "A", s/bez mezery, s/bez "mm²"
- Databáze může mít různé konvence od různých dodavatelů
- Kombinované vyhledávání (wildcard + fuzzy) pokrývá většinu variant

### Pořadí důležitosti výrazů
1. Kompletní typové označení výrobce (pokud je znám)
2. Hlavní parametry kombinovaně (např. C16 3P)
3. Zkrácené kombinace parametrů
4. Jen amperáž nebo jen typová série

### Databáze Ústí vs. Effretikon
- **Ústí**: Dominují české a středoevropské výrobky – OEZ, ABB, Siemens, Phoenix Contact
- **Effretikon**: Může mít jiné zastoupení výrobců; prohledat obě při pochybnostech

### TODO – komponenty k doplnění
- [ ] Proudové transformátory (CT)
- [ ] Senzory a čidla (teplotní, pohybová, optická)
- [ ] Baterie a záložní zdroje (UPS)
- [ ] Průmyslové konektory (Harting, Weidmüller, Phoenix)
- [ ] PROFIBUS / PROFINET / IO-Link prvky
- [ ] Energetické měřiče
