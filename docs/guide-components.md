# Průvodce komponentami – Řízený režim

Tento dokument popisuje, jaké otázky se kladou pro každou komponentu a jak se na základě odpovědí generují vyhledávací výrazy.

> **Poznámka:** Dokument slouží jako základ pro vývoj. Vyhledávací vzory vycházejí z reálných typových označení v databázi a budou průběžně upřesňovány.

---

## Jistič (MCB – Miniature Circuit Breaker)

### Otázky
1. Máš vybraného výrobce? *(nepovinné – ABB, Siemens, Schneider, Eaton, Hager, OEZ, Legrand)*
2. Jakou amperáž hledáš? *(hodnota v A, např. 16, 25, 32, 63)*
3. Kolik pólů? *(1P, 2P, 3P, 4P – nebo slovně: jednofázový/třífázový)*
4. Jakou charakteristiku? *(B, C, D, K)*

### Generované výrazy
- `{char}{amp} {pól}P` → např. `C16 3P`
- `{char}{amp}A {pól}P` → `C16A 3P`
- `{amp}A {char} {pól}P` → `16A C 3P`
- `{amp} {char} {pól}P` → `16 C 3P`
- `{amp}A {pól}P`
- `{char}{amp}` (bez pólů)
- Pokud výrobce znám: `{výrobce} {char}{amp}` nebo typová označení výrobce

### Typová označení výrobců
| Výrobce | Vzor | Příklad |
|---------|------|---------|
| ABB | `SH20x-C{amp}` | `SH203-C16` |
| Siemens | `5SL{pól}{char}{amp}` | `5SL6316-7` |
| Schneider | `iC60N {char}{amp}A` | `iC60N C16A` |
| OEZ | `LTE-{char}{amp}` | `LTE-C16` |
| Hager | `MCN{amp}{char}` | `MCN116C` |

### Znalosti výrobců
- OEZ: český výrobce, hodně v databázi Ústí
- ABB, Siemens, Schneider: nejběžnější v průmyslu
- Eaton (Moeller): série xPole, PKZ

---

## Motorový jistič (MPCB – Motor Protection Circuit Breaker)

### Otázky
1. Máš vybraného výrobce? *(nepovinné – ABB, Siemens, Eaton, Schneider)*
2. Jaký je jmenovitý proud motoru (In)? *(rozsah nastavení, např. 4-6,3A nebo konkrétní hodnota)*
3. Kolik pólů? *(obvykle 3P)*

### Generované výrazy
- `{min}-{max}A` → `4-6,3A`
- `{min}-{max} 3P`
- `MS {min}-{max}` (ABB řada MS)
- `3RV{min}` (Siemens)
- `PKZM{min}` (Eaton/Moeller)
- `GV2 {min}` (Schneider)

### Znalosti výrobců
- ABB: MS116, MS132, MS165 (dle rozsahu proudu)
- Siemens: 3RV1 série
- Eaton/Moeller: PKZM0, PKZM4
- Schneider: GV2ME, GV3ME

---

## Stykač (Contactor)

### Otázky
1. Máš vybraného výrobce? *(nepovinné – Siemens, Schneider, ABB, Eaton)*
2. Jaký proud (Ie/AC3)? *(v A, např. 9, 12, 18, 25, 32, 40)*
3. Napájecí napětí cívky? *(např. 24VDC, 230VAC, 24VAC)*
4. Počet hlavních pólů? *(obvykle 3 nebo 4)*

### Generované výrazy
- `stykač {amp}A`
- `{amp}A {napětí cívky}`
- `LC1-D{amp}` (Schneider – typ LC1)
- `3RT{amp}` (Siemens – typ 3RT)
- `A{amp}` (ABB)
- `DIL{amp}` (Eaton/Moeller)

### Znalosti výrobců
- Siemens: 3RT2 série (9A=3RT2015, 12A=3RT2016, 18A=3RT2017...)
- Schneider: LC1-D série
- ABB: A9, A12, A16, A26, A30...
- Eaton: DILM serie (DILM7, DILM9, DILM12...)

---

## Tepelné relé (Overload Relay)

### Otázky
1. Máš vybraného výrobce? *(nepovinné)*
2. Jaký nastavitelný rozsah proudu? *(min–max v A)*
3. K jakému stykači se páruje? *(volitelné, pro výběr řady)*

### Generované výrazy
- `{min}-{max}A tepelné relé`
- `LR2-D{max}` (Schneider)
- `3RU{amp}` (Siemens)
- `TA{amp}` (ABB)
- `ZB{amp}` (Eaton/Moeller)

---

## Pomocné relé (Relay)

### Otázky
1. Napájecí napětí cívky? *(24VDC, 24VAC, 230VAC...)*
2. Kontaktní konfigurace? *(1CO, 2CO, 4CO – kolik přepínacích kontaktů)*
3. Provedení? *(patice/přímé zapojení, DIL/Round pin)*
4. Máš vybraného výrobce? *(nepovinné – Finder, Phoenix Contact, Wago, TE Connectivity)*

### Generované výrazy
- `relé {napětí}`
- `{napětí}VDC {nx}CO`
- `{napětí}VAC {nx}CO`
- `40.31 {napětí}` (Finder řada 40)
- `PLC-RSC- {napětí}DC` (Phoenix Contact)

### Znalosti výrobců
- Finder: série 40, 41, 55, 60
- Phoenix Contact: PLC-RSC, PLC-RSP série
- Wago: 788 série
- TE Connectivity: typ RT/PB

---

## Chránič (RCD / RCCB)

### Otázky
1. Jmenovitý proud? *(25A, 40A, 63A...)*
2. Reziduální proud (vybavovací)? *(10mA, 30mA, 100mA, 300mA)*
3. Počet pólů? *(2P, 4P)*
4. Typ? *(AC – střídavý, A – pulzní, B – všechny proudy)*
5. Máš vybraného výrobce? *(nepovinné)*

### Generované výrazy
- `{amp}A {diff}mA {pól}P`
- `{amp}/{diff} {typ}`
- `F{amp}/{diff}` (Hager)
- `DFS{amp}{diff}` (Hager)
- `iID {amp}A {diff}mA` (Schneider)
- `F202A-{amp}/{diff}` (ABB)

---

## Pojistka NH (NH Fuse)

### Otázky
1. Velikost NH pojistky? *(NH00, NH0, NH1, NH2, NH3)*
2. Jmenovitý proud? *(v A, např. 100, 160, 200, 250)*
3. Typ? *(gG – všeobecný, aM – motorový)*
4. Máš vybraného výrobce? *(nepovinné – Siemens, Eaton, ABB, OEZ)*

### Generované výrazy
- `NH{vel} {amp}A`
- `{amp}A NH{vel}`
- `{amp}A gG NH{vel}`
- `LV{amp}` (ABB)
- `3NA{amp}` (Siemens)

---

## Pojistka válcová (Cylindrical Fuse)

### Otázky
1. Velikost? *(10x38, 14x51, 22x58)*
2. Jmenovitý proud? *(v A)*
3. Typ? *(gG, aM, gPV...)*
4. Jmenovité napětí? *(250V, 500V, 690V)*

### Generované výrazy
- `{amp}A {vel}`
- `{amp}A gG {vel}`
- `{vel} {amp}A`

---

## Napájecí zdroj (Power Supply / PSU)

### Otázky
1. Výstupní napětí? *(5V, 12V, 24VDC, 48VDC...)*
2. Výstupní proud nebo výkon? *(v A nebo W)*
3. Vstupní napětí? *(obvykle 85-264VAC nebo 230VAC)*
4. Provedení? *(DIN lišta, deska, open-frame)*
5. Máš vybraného výrobce? *(nepovinné – Phoenix Contact, Wago, Murr, Mean Well, Puls)*

### Generované výrazy
- `{volt}VDC {amp}A`
- `{volt}V {watt}W`
- `PSU {volt}V {amp}A`
- `QUINT {volt}V/{amp}A` (Phoenix Contact)
- `PROS{watt}.24` (Phoenix Contact)
- `Puls {volt}V`

### Znalosti výrobců
- Phoenix Contact: QUINT, TRIO, STEP série
- Wago: pro série
- Puls: QS, CP, CS série (německý výrobce, kvalitní)
- Mean Well: SD, NES, SE série
- Murr: MCS série

---

## Kabel (Cable / Wire)

### Otázky
1. Typ kabelu? *(CYKY, CYKFY, CHKE, NHXMH, YSLY, LiYCY...)*
2. Počet žil? *(2, 3, 4, 5...)*
3. Průřez žil? *(0,5; 0,75; 1; 1,5; 2,5; 4; 6; 10; 16... mm²)*
4. Délka? *(m, nebo "role" / "metr")*

### Generované výrazy
- `{typ} {n}x{prierez}`
- `{typ} {n}x{prierez}mm2`
- `{typ}-{n}x{prierez}`
- Bez délky (jen typ a průřez)

### Typy kabelu
| Označení | Popis |
|----------|-------|
| CYKY | Silový kabel, pryžová izolace |
| CYKFY | Silový kabel s výztuhou |
| NHXMH | Bezhalogenový, výtah/požár |
| YSLY | Ovládací kabel |
| LiYCY | Stíněný data kabel |
| LIYY | Data kabel bez stínění |
| J-Y(St)Y | Sdělovací kabel |

---

## Svorka (Terminal Block)

### Otázky
1. Typ svorky? *(průchodná, ochranná/PE, pojistková, odpojovací, nožová)*
2. Průřez vodiče? *(0,5–1,5; 0,5–4; 0,5–10... mm²)*
3. Systém / výrobce? *(Phoenix Contact – Clipline, Wago – 281/282/283, ABB, Entrelec)*
4. Barva? *(šedá, modrá, žlutá/zelená – PE)*

### Generované výrazy
- `svorka {mm}mm2`
- `{mm}² průchodná`
- `UT {mm}` (Phoenix Contact)
- `UTTB {mm}` (Phoenix Contact)
- `281-{mm}` (Wago – šroubové)
- `2081-{mm}` (Wago – přítlačné)

---

## Frekvenční měnič (VFD / Frequency Inverter)

### Otázky
1. Výkon motoru? *(v kW, např. 0,37; 0,75; 1,5; 2,2; 4; 7,5)*
2. Napájení? *(1×230VAC, 3×400VAC)*
3. Výstupní napětí? *(obvykle 3×400VAC)*
4. Speciální funkce? *(nepovinné – bezpečnostní STO, brake chopper, EMC filtr)*
5. Máš vybraného výrobce? *(nepovinné – ABB, Siemens, Schneider, Danfoss, Lenze)*

### Generované výrazy
- `{kw}kW {volt}V`
- `frekvenční měnič {kw}kW`
- `ACS{série} {kw}kW` (ABB)
- `MICROMASTER {kw}kW` (Siemens)
- `Altivar {kw}kW` (Schneider)
- `FC{séire} {kw}kW` (Danfoss)

### Znalosti výrobců
- ABB: ACS310, ACS355, ACS550, ACS800, ACS880
- Siemens: MICROMASTER 420/440, SINAMICS G110/G120
- Schneider: Altivar 12, 212, 312, 320
- Danfoss: FC301, FC302
- Lenze: SMVector, i550

---

## Soft Starter

### Otázky
1. Výkon motoru nebo proud? *(kW nebo A)*
2. Napájení? *(3×400VAC)*
3. Typ řízení? *(přímé, bypass, vestavěný bypass)*
4. Máš vybraného výrobce? *(nepovinné – ABB, Siemens, Schneider, Eaton)*

### Generované výrazy
- `soft starter {kw}kW`
- `softstartér {amp}A`
- `PSR{amp}` (ABB)
- `3RW{amp}` (Siemens SIRIUS)
- `ATS {amp}` (Schneider)
- `DS7-{amp}` (Eaton)

---

## Transformátor (Transformer)

### Otázky
1. Typ? *(silový, bezpečnostní, řídicí, toroidní)*
2. Výkon? *(v VA nebo kVA)*
3. Vstupní napětí? *(230VAC, 400VAC)*
4. Výstupní napětí? *(24VAC, 115VAC, 230VAC...)*
5. Máš vybraného výrobce? *(nepovinné)*

### Generované výrazy
- `transformátor {VA}VA`
- `{VA}VA {Uin}/{Uout}V`
- `{kVA}kVA`
- `trafo {Uin}/{Uout}`

---

## Poznámky k vyhledávání

### Obecné zásady
- Vždy zkoušet více variant zápisu (s i bez "A", s i bez mezer)
- U ampéráže zkoušet i varianty: `16`, `16A`, `16 A`
- U pólů: `3P`, `3-pól`, `3pól`, `3pole`
- Databáze může mít různé konvence zápisu od různých dodavatelů

### Pořadí důležitosti výrazů
1. Kompletní typové označení výrobce (pokud se zná)
2. Hlavní parametry: ampéráž + póly + charakteristika
3. Zkrácené kombinace
4. Samotná ampéráž nebo charakteristika

### TODO – komponenty k doplnění
- [ ] Senzory a čidla (teplotní, pohybová, optická)
- [ ] Tlačítka a signálky
- [ ] Lišty DIN a skříně rozvaděčů
- [ ] Kabely průmyslové (PROFIBUS, PROFINET, CANopen)
- [ ] Baterie a záložní zdroje UPS
- [ ] Průchodky a kabelové vývodky
- [ ] Proudové transformátory (CT)
