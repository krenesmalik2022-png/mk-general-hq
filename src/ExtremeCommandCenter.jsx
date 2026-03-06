import { useState, useEffect, useRef, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* ═══════════════════════════ LIVE MISSION TEMPLATES ════════════════════════════
   Every mission has:
   - timerSeconds: how long you have to decide (countdown)
   - econImpact: what happens to the US economy if you fail / expire
   - militaryImpact: effect on general stats
   - phases: multi-step approach — each phase has its own decision
═══════════════════════════════════════════════════════════════════════════════ */
const LIVE_MISSION_POOL = [
  {
    id: "lm1", title: "OPERATION IRON CORRIDOR",
    classification: "TOP SECRET // SAP",
    urgency: "CRITICAL", timerSeconds: 120,
    theater: "Persian Gulf", lat: 26, lon: 54,
    situation: "Iranian Revolutionary Guard Corps (IRGC) has seized the oil tanker MV Helios Star with 28 American crew in the Strait of Hormuz. Global oil prices spiked 12% in 3 minutes. OPEC is watching. If you don't act within 2 minutes, Iran will transfer the crew to Bandar Abbas — extraction becomes 10x harder and crude hits $200/barrel.",
    econImpact: { label: "OIL PRICES +22% — MARKETS CRASH", severity: "CRITICAL", gdpChange: -2.1, unemploymentChange: +0.4 },
    options: [
      {
        label: "SEAL TEAM 6 — MARITIME ASSAULT", icon: "🔱", risk: "HIGH", color: "#e84b4b",
        outcome: "DEVGRU launches from USS Bataan. 4 minute helo approach under radar. Six-man team breaches MV Helios. Firefight: 3 crew wounded, 2 IRGC KIA. All 28 hostages extracted. Iran protests at UN. Oil drops 8%. POTUS calls it 'exactly what I expect from my best general.'",
        effect: { approval: +18, prestige: +22, defcon: 0, bankChange: 80000 }
      },
      {
        label: "DIPLOMATIC CHANNEL — DEMAND RELEASE", icon: "📡", risk: "MEDIUM", color: "#e8b84b",
        outcome: "You route through Swiss embassy. Iran stalls. 6 hours later they release 20 crew but keep 8 as 'insurance.' Oil stabilizes at +9%. Allies frustrated. Senate demands answers. POTUS: 'You should have hit them, General.'",
        effect: { approval: -8, prestige: -5, defcon: 0, bankChange: 0 }
      },
      {
        label: "CARRIER STRIKE GROUP — SHOW OF FORCE", icon: "⛵", risk: "MEDIUM", color: "#4b9ae8",
        outcome: "USS Gerald Ford moves into position. Iran sees it on radar and panics — releases all 28 crew within 90 minutes under fear of kinetic action. No shots fired. Oil drops 5%. Textbook deterrence. Prestige skyrockets.",
        effect: { approval: +12, prestige: +18, defcon: -1, bankChange: 30000 }
      },
    ]
  },
  {
    id: "lm2", title: "OPERATION BLACK HARVEST",
    classification: "TS // SAP // NOFORN",
    urgency: "CRITICAL", timerSeconds: 90,
    theater: "Sahel Region", lat: 14, lon: 5,
    situation: "NSA intercepts reveal Wagner Group is 72 hours from completing a $4.2B Chinese-backed rare earth mining deal in Mali that will permanently cut US access to Cobalt and Lithium supplies critical for F-35, B-21, and nuclear warhead production. The Malian coup government will sign papers in 90 seconds if you don't act NOW. This is an economic weapon of mass destruction.",
    econImpact: { label: "DEFENSE SUPPLY CHAIN COLLAPSE — F-35 GROUNDED", severity: "EXTREME", gdpChange: -3.8, unemploymentChange: +1.2 },
    options: [
      {
        label: "SPEC OPS DESTROY SIGNING CEREMONY", icon: "💣", risk: "EXTREME", color: "#e84b4b",
        outcome: "5th Special Forces Group 'disrupts' the ceremony. The Malian minister is unharmed but the signed documents are ash. China lodges furious protest. Wagner vows revenge. Supply chain secured. F-35 production uninterrupted.",
        effect: { approval: -5, prestige: +25, defcon: -1, bankChange: 50000 }
      },
      {
        label: "EMERGENCY COUNTER-OFFER TO MALI", icon: "💰", risk: "LOW", color: "#4caf50",
        outcome: "You authorize a $5.1B development package using black budget funds. Mali accepts your offer over Beijing's. Wagner is furious. The global rare earth market stabilizes. US manufacturing sector breathes again. POTUS gets credit at next press conference.",
        effect: { approval: +20, prestige: +15, defcon: 0, bankChange: -50000 }
      },
      {
        label: "CYBER ATTACK — DESTROY DEAL SERVERS", icon: "🖥", risk: "HIGH", color: "#9b59b6",
        outcome: "CYBERCOM executes OPERATION SILENT LEDGER. The Malian finance ministry's systems are wiped. The deal data is gone. Papers are unenforceable. Wagner scrambles. US buys 3 months to negotiate a proper deal.",
        effect: { approval: +8, prestige: +12, defcon: 0, bankChange: 20000 }
      },
    ]
  },
  {
    id: "lm3", title: "OPERATION RED MERCURY",
    classification: "TOP SECRET // NUCLEAR // NOFORN",
    urgency: "CRITICAL", timerSeconds: 180,
    theater: "Eastern Europe", lat: 50, lon: 27,
    situation: "CIA asset CARDINAL in Moscow confirms: Russian President has authorized tactical nuclear weapons to be loaded onto Iskander-M launchers positioned 140km from Kyiv. Satellite confirms warhead loading activity. NATO is paralyzed. You have 3 minutes to recommend a course of action before the launch window opens. European financial markets are melting down in real time.",
    econImpact: { label: "EUROPEAN MARKET PANIC — DOW -15%", severity: "EXTREME", gdpChange: -4.5, unemploymentChange: +2.1 },
    options: [
      {
        label: "EMERGENCY NATO ARTICLE 5 — UNANIMOUS CALL", icon: "📞", risk: "HIGH", color: "#4b9ae8",
        outcome: "You personally call all 32 NATO defense chiefs in a 6-minute conference. The unified message is clear: any nuclear use triggers a massive conventional response. Moscow backs down. Launchers are secured. Your phone call is credited with preventing WWIII. Nobel Peace Prize discussions begin.",
        effect: { approval: +30, prestige: +35, defcon: +1, bankChange: 100000 }
      },
      {
        label: "RECOMMEND PREEMPTIVE CYBER STRIKE ON LAUNCHERS", icon: "⚡", risk: "EXTREME", color: "#e84b4b",
        outcome: "CYBERCOM kills the Iskander guidance systems. Moscow knows it was US. Russia mobilizes conventional forces. Europe is at the brink but nuclear threat is neutralized. POTUS is furious at the escalation but privately impressed. Defcon drops to 2.",
        effect: { approval: -15, prestige: +20, defcon: -2, bankChange: 0 }
      },
      {
        label: "DIRECT HOTLINE TO KREMLIN", icon: "☎", risk: "LOW", color: "#4caf50",
        outcome: "You use the Moscow-Washington Hotline directly — unprecedented for a general officer. Russian counterpart stands down after 40 minutes of tense negotiation. You traded the promise of withdrawing US troops from Poland. POTUS is furious about the deal but the nukes are put away.",
        effect: { approval: +5, prestige: +28, defcon: 0, bankChange: 0 }
      },
    ]
  },
  {
    id: "lm4", title: "OPERATION JADE TSUNAMI",
    classification: "TOP SECRET // CODE WORD // RELIDO",
    urgency: "CRITICAL", timerSeconds: 150,
    theater: "Taiwan Strait", lat: 24, lon: 120,
    situation: "PLA Navy has launched an unprecedented coordinated amphibious assault on Taiwan's Penghu Islands — 120 ships, airborne divisions, and cyber attacks hitting Taipei simultaneously. Taiwan's President is requesting US military intervention under the Taiwan Relations Act. If you don't respond in the next 2.5 minutes, the islands fall. The south Pacific economic order collapses. TSMC fabs go dark. The entire global semiconductor supply chain dies.",
    econImpact: { label: "SEMICONDUCTOR COLLAPSE — $6T GLOBAL LOSS", severity: "EXTINCTION", gdpChange: -8.2, unemploymentChange: +4.5 },
    options: [
      {
        label: "FULL NAVAL INTERVENTION — ROE WEAPONS FREE", icon: "⛵", risk: "WAR", color: "#e84b4b",
        outcome: "7th Fleet engages PLA Navy. First major naval battle since WWII. 72-hour conflict: 14 Chinese destroyers sunk, 3 American ships damaged. PLA amphibious assault repelled. Taiwan holds. Global shock — but markets rally on American resolve. Allies lining up to sign bilateral defense pacts.",
        effect: { approval: +25, prestige: +40, defcon: -3, bankChange: 200000 }
      },
      {
        label: "AIR POWER ONLY — ESTABLISH NO-FLY ZONE", icon: "✈", risk: "HIGH", color: "#e8b84b",
        outcome: "F-22s and F-35s establish air dominance. No naval engagement. PLA air force takes heavy losses but ground invasion continues. Penghu falls partially before ceasefire. Taiwan intact but wounded. 'Half measure' criticism dominates the news cycle.",
        effect: { approval: +8, prestige: +15, defcon: -2, bankChange: 50000 }
      },
      {
        label: "ECONOMIC WARFARE + SANCTIONS PACKAGE", icon: "📊", risk: "LOW", color: "#4caf50",
        outcome: "You recommend maximum economic sanctions in lieu of military action. China's economy takes a severe hit but Penghu falls. Taiwan survives as a state but China controls the islands. US credibility in Asia is seriously damaged. Japan, South Korea begin nuclear program discussions.",
        effect: { approval: -10, prestige: -15, defcon: 0, bankChange: 0 }
      },
    ]
  },
  {
    id: "lm5", title: "OPERATION DARK MERIDIAN",
    classification: "TS // SI // TK // NOFORN",
    urgency: "CRITICAL", timerSeconds: 60,
    theater: "Cyberspace / CONUS", lat: 38.9, lon: -77,
    situation: "CYBERCOM detects an active intrusion into 14 US nuclear power plant control systems by a state-level actor (attribution: DPRK). The malware is 60 seconds from triggering a cascading failure that would cause simultaneous meltdowns in Maryland, Pennsylvania, and Virginia. 45 million Americans in the danger zone. Economic damage: $8 trillion. You have ONE MINUTE.",
    econImpact: { label: "NUCLEAR MELTDOWN — EAST COAST UNINHABITABLE", severity: "EXTINCTION", gdpChange: -15.0, unemploymentChange: +12.0 },
    options: [
      {
        label: "CYBERCOM EMERGENCY KILL SWITCH", icon: "🖥", risk: "HIGH", color: "#4caf50",
        outcome: "CYBERCOM executes KILL CHAIN Alpha in 37 seconds. All 14 plants go to manual control. 3 cities briefly lose power but reactors are safe. DPRK loses 2 years of cyber capability in the counterattack. You've just prevented the worst disaster in American history.",
        effect: { approval: +35, prestige: +40, defcon: +1, bankChange: 150000 }
      },
      {
        label: "PHYSICAL ISOLATION — ORDER MANUAL SHUTDOWN", icon: "⚡", risk: "MEDIUM", color: "#e8b84b",
        outcome: "You authorize emergency physical disconnection of control systems. 11 plants shut down safely. 3 plants experience partial meltdown events — containment holds but evacuation of 600,000 people is required. Costly but survivable. POTUS: 'You made the right call, General.'",
        effect: { approval: +15, prestige: +20, defcon: 0, bankChange: 50000 }
      },
      {
        label: "CYBER COUNTER-ATTACK — BURN PYONGYANG'S GRID", icon: "💣", risk: "EXTREME", color: "#e84b4b",
        outcome: "You launch an offensive cyber strike on North Korea's entire power infrastructure simultaneously. Their malware dies as their control servers fry. Your plants are saved. North Korea is in total blackout. Kim is enraged. Military escalation begins. Defcon drops to 2.",
        effect: { approval: +10, prestige: +25, defcon: -2, bankChange: 0 }
      },
    ]
  },
  {
    id: "lm6", title: "OPERATION VIPER'S NEST",
    classification: "SAP // CODE WORD: VIPER",
    urgency: "HIGH", timerSeconds: 300,
    theater: "Afghanistan / Pakistan Border", lat: 34, lon: 70,
    situation: "CIA has a 5-minute window on an HVT (High Value Target): confirmed location of Al-Qaeda's Emir who is planning a simultaneous 9/11-scale attack on 6 US embassies across Africa. The target is in an unacknowledged Pakistani territory. Any strike violates Pakistani sovereignty. If you miss this window, the embassies get hit — 3,000+ casualties and global diplomatic crisis.",
    econImpact: { label: "EMBASSY ATTACKS — GLOBAL TRAVEL BAN, TOURISM -80%", severity: "HIGH", gdpChange: -1.8, unemploymentChange: +0.6 },
    options: [
      {
        label: "DRONE STRIKE — IMMEDIATE ACTION", icon: "🎯", risk: "HIGH", color: "#e84b4b",
        outcome: "MQ-9 Reaper fires two Hellfire missiles. Target confirmed KIA. 3 civilian casualties nearby. Pakistan protests furiously. But the 6 embassy attacks are prevented. 3,000 lives saved. The families of those civilians will never know how many lives you saved today.",
        effect: { approval: +15, prestige: +28, defcon: 0, bankChange: 100000 }
      },
      {
        label: "SEAL TEAM CAPTURE OPERATION", icon: "🔱", risk: "EXTREME", color: "#e8b84b",
        outcome: "DEVGRU executes capture mission. 40-minute firefight. Target captured alive — intelligence goldmine. 2 SEALs wounded. Pakistan disavows but privately thanks you. Target is interrogated at black site. 14 follow-on operations disrupted from intelligence gathered.",
        effect: { approval: +20, prestige: +35, defcon: 0, bankChange: 80000 }
      },
      {
        label: "EVACUATE EMBASSIES — DO NOT STRIKE", icon: "🚁", risk: "LOW", color: "#4caf50",
        outcome: "You refuse to violate Pakistani sovereignty. All 6 embassies are evacuated. The attacks happen to empty buildings. Target escapes. The HVT goes dark and reappears 14 months later planning a new attack. Your restraint saved a diplomatic relationship but costs lives long-term.",
        effect: { approval: +5, prestige: -10, defcon: 0, bankChange: 0 }
      },
    ]
  },
  {
    id: "lm7", title: "OPERATION GOLDEN STORM",
    classification: "TOP SECRET // POTUS EYES ONLY",
    urgency: "CRITICAL", timerSeconds: 240,
    theater: "Saudi Arabia", lat: 24, lon: 45,
    situation: "A massive coordinated Houthi drone swarm — 300+ Iranian-supplied kamikaze drones — has launched against Aramco's Abqaiq facility, the world's largest oil processing plant. If it's destroyed, global oil supply drops 5% instantly. Every second of delay: fuel prices at the pump increase $0.12. You have 4 minutes before the drones reach the facility.",
    econImpact: { label: "ARAMCO DESTROYED — FUEL $12/GALLON OVERNIGHT", severity: "EXTREME", gdpChange: -3.1, unemploymentChange: +0.9 },
    options: [
      {
        label: "PATRIOT BATTERIES + F-35 INTERCEPT PACKAGE", icon: "🚀", risk: "MEDIUM", color: "#4caf50",
        outcome: "Your air defense package combined with Saudi Patriots eliminates 287 of 300 drones. 13 breach — minor damage to secondary facility. Oil impact minimal: +$4/barrel instead of +$40. Saudi King calls personally to thank you. Massive defense contract incoming.",
        effect: { approval: +22, prestige: +28, defcon: 0, bankChange: 200000 }
      },
      {
        label: "STRIKE HOUTHI LAUNCH SITES IN YEMEN", icon: "✈", risk: "HIGH", color: "#e87a4b",
        outcome: "B-52s hit 8 Houthi launch complexes. Secondary explosions destroy future attack capability. Aramco takes partial hit from second wave — oil up 15% but not 40%. Iran retaliates with Quds Force attacks on 2 US bases in Iraq. 14 soldiers wounded.",
        effect: { approval: +10, prestige: +20, defcon: -1, bankChange: 50000 }
      },
      {
        label: "CYBER KILL CHAIN ON DRONE GUIDANCE", icon: "🖥", risk: "HIGH", color: "#9b59b6",
        outcome: "CYBERCOM targets the Iranian drone command frequencies. 180 drones veer off course into the desert. 120 break through with navigational errors and hit a secondary separator facility. Oil up 18%. Solid outcome but not the total intercept you hoped for.",
        effect: { approval: +12, prestige: +15, defcon: 0, bankChange: 30000 }
      },
    ]
  },
  {
    id: "lm8", title: "OPERATION FROZEN THRONE",
    classification: "TOP SECRET // SPECIAL CHANNEL",
    urgency: "HIGH", timerSeconds: 200,
    theater: "Arctic Ocean", lat: 75, lon: -10,
    situation: "Russian submarines have cut the CANTAT-3 and TAT-14 transatlantic fiber optic cables — 30% of internet traffic between North America and Europe is dead. Stock markets in London and Frankfurt crash 8% in minutes. Russia is claiming it was 'maintenance vessels' but your signals intelligence shows it was deliberate. Every minute of inaction costs $2.4B in economic damage.",
    econImpact: { label: "TRANSATLANTIC INTERNET DOWN — $340B/DAY LOSS", severity: "EXTREME", gdpChange: -2.8, unemploymentChange: +0.5 },
    options: [
      {
        label: "SUBMARINE — TRACK AND SHADOW AGGRESSIVELY", icon: "🌊", risk: "HIGH", color: "#4b9ae8",
        outcome: "USS Jimmy Carter SSN intercepts and begins aggressive shadowing of the Russian OSCAR-II class submarine. Russians surface. You control the underwater domain. Cable repair ships reach the cut points under your protection. Internet restored in 36 hours. Markets rally 6%.",
        effect: { approval: +18, prestige: +22, defcon: -1, bankChange: 80000 }
      },
      {
        label: "EMERGENCY SATELLITE BANDWIDTH REROUTE", icon: "🛰", risk: "LOW", color: "#4caf50",
        outcome: "Space Force emergency activates Starlink and military satellites to reroute 60% of affected traffic. Markets absorb the shock. Russia is exposed diplomatically but unpunished militarily. Cable repair takes 2 weeks but the economic damage is contained. Clean, smart solution.",
        effect: { approval: +25, prestige: +18, defcon: 0, bankChange: 40000 }
      },
      {
        label: "SINK THE RUSSIAN SUBMARINE", icon: "💣", risk: "WAR", color: "#e84b4b",
        outcome: "You order USS Wyoming to fire. The OSCAR-II class 'Orel' sinks in Arctic waters. 107 Russian sailors die. Moscow goes into war footing. NATO activates Article 5. First conventional NATO-Russia conflict in history begins. Economic damage: immeasurable.",
        effect: { approval: -25, prestige: +5, defcon: -3, bankChange: 0 }
      },
    ]
  },
];

/* ═══════════════════════════ WORLD MILITARY DATA ════════════════════════════
   Key: threat = ALLY | NEUTRAL | RIVAL | HOSTILE | ADVERSARY
═══════════════════════════════════════════════════════════════════════════ */
const WORLD_MILITARY = [
  { name: "United States", iso: "USA", lat: 38, lon: -97, troops: 1400000, nukes: 5550, navyRating: 99, airRating: 99, groundRating: 98, threat: "ALLY", color: "#4caf50", strongholds: ["Pentagon", "STRATCOM Omaha", "PACOM Hawaii", "EUCOM Stuttgart"] },
  { name: "Russia", iso: "RUS", lat: 60, lon: 100, troops: 900000, nukes: 6257, navyRating: 75, airRating: 80, groundRating: 88, threat: "ADVERSARY", color: "#e84b4b", strongholds: ["Kremlin C2", "Kaliningrad Base", "Sevastopol Fleet", "Kola Peninsula"] },
  { name: "China", iso: "CHN", lat: 35, lon: 105, troops: 2000000, nukes: 350, navyRating: 82, airRating: 79, groundRating: 91, threat: "ADVERSARY", color: "#e84b4b", strongholds: ["Hainan Island Base", "Sanya Naval", "Spratly Islands", "Tibet Military HQ"] },
  { name: "North Korea", iso: "PRK", lat: 40, lon: 127, troops: 1280000, nukes: 50, navyRating: 30, airRating: 25, groundRating: 70, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Pyongyang HQ", "Yongbyon Nuclear", "Sohae Launch"] },
  { name: "Iran", iso: "IRN", lat: 32, lon: 53, troops: 610000, nukes: 0, navyRating: 44, airRating: 38, groundRating: 62, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Bandar Abbas", "Fordow Nuclear", "IRGC Tehran HQ"] },
  { name: "United Kingdom", iso: "GBR", lat: 52, lon: -1, troops: 155000, nukes: 225, navyRating: 78, airRating: 82, groundRating: 72, threat: "ALLY", color: "#4caf50", strongholds: ["Faslane HMNB", "RAF Menwith Hill", "GCHQ Cheltenham"] },
  { name: "France", iso: "FRA", lat: 46, lon: 2, troops: 270000, nukes: 290, navyRating: 72, airRating: 79, groundRating: 70, threat: "ALLY", color: "#4caf50", strongholds: ["Toulon Naval", "Istres Air Base", "Taverny C2"] },
  { name: "Germany", iso: "DEU", lat: 51, lon: 10, troops: 183000, nukes: 0, navyRating: 50, airRating: 62, groundRating: 68, threat: "ALLY", color: "#4caf50", strongholds: ["Ramstein AFB", "Grafenwöhr Training"] },
  { name: "South Korea", iso: "KOR", lat: 37, lon: 128, troops: 600000, nukes: 0, navyRating: 65, airRating: 70, groundRating: 80, threat: "ALLY", color: "#4caf50", strongholds: ["Camp Humphreys", "Osan AFB", "Busan Naval"] },
  { name: "Japan", iso: "JPN", lat: 36, lon: 138, troops: 248000, nukes: 0, navyRating: 72, airRating: 68, groundRating: 60, threat: "ALLY", color: "#4caf50", strongholds: ["Yokosuka Naval", "Misawa AFB", "Kadena AFB"] },
  { name: "India", iso: "IND", lat: 20, lon: 78, troops: 1450000, nukes: 160, navyRating: 64, airRating: 60, groundRating: 82, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Karwar Naval", "Gwalior AFB", "Andaman Islands"] },
  { name: "Pakistan", iso: "PAK", lat: 30, lon: 70, troops: 650000, nukes: 165, navyRating: 35, airRating: 48, groundRating: 72, threat: "RIVAL", color: "#e87a4b", strongholds: ["Karachi Naval", "Samungli AFB", "Kahuta Nuclear"] },
  { name: "Israel", iso: "ISR", lat: 31, lon: 35, troops: 170000, nukes: 90, navyRating: 55, airRating: 88, groundRating: 78, threat: "ALLY", color: "#4caf50", strongholds: ["Negev Nuclear", "Tel Nof AFB", "Haifa Naval"] },
  { name: "Saudi Arabia", iso: "SAU", lat: 24, lon: 45, troops: 260000, nukes: 0, navyRating: 40, airRating: 62, groundRating: 55, threat: "ALLY", color: "#4caf50", strongholds: ["Riyadh HQ", "King Khalid AFB", "Dammam Naval"] },
  { name: "Turkey", iso: "TUR", lat: 39, lon: 35, troops: 355000, nukes: 0, navyRating: 55, airRating: 68, groundRating: 74, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Incirlik AFB", "Gölcük Naval", "Konya AFB"] },
  { name: "Syria", iso: "SYR", lat: 35, lon: 38, troops: 150000, nukes: 0, navyRating: 15, airRating: 20, groundRating: 40, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Tartus Naval (RU)", "Damascus Air Defense"] },
  { name: "Venezuela", iso: "VEN", lat: 8, lon: -66, troops: 115000, nukes: 0, navyRating: 20, airRating: 22, groundRating: 38, threat: "RIVAL", color: "#e87a4b", strongholds: ["Caracas Naval", "Camp Libertad"] },
  { name: "Brazil", iso: "BRA", lat: -15, lon: -55, troops: 360000, nukes: 0, navyRating: 52, airRating: 50, groundRating: 58, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Araaquara AFB", "Rio Naval Base"] },
  { name: "Egypt", iso: "EGY", lat: 27, lon: 30, troops: 440000, nukes: 0, navyRating: 40, airRating: 55, groundRating: 62, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Suez Canal Zone", "Cairo West AFB"] },
  { name: "Australia", iso: "AUS", lat: -27, lon: 133, troops: 60000, nukes: 0, navyRating: 58, airRating: 65, groundRating: 55, threat: "ALLY", color: "#4caf50", strongholds: ["Pine Gap NSA", "Darwin AFB", "Stirling Naval"] },
  { name: "Canada", iso: "CAN", lat: 56, lon: -106, troops: 68000, nukes: 0, navyRating: 48, airRating: 52, groundRating: 45, threat: "ALLY", color: "#4caf50", strongholds: ["CFB Trenton", "Halifax Naval"] },
  { name: "Poland", iso: "POL", lat: 52, lon: 20, troops: 185000, nukes: 0, navyRating: 30, airRating: 55, groundRating: 70, threat: "ALLY", color: "#4caf50", strongholds: ["Powidz AFB", "Gdynia Naval"] },
  { name: "Ukraine", iso: "UKR", lat: 49, lon: 32, troops: 900000, nukes: 0, navyRating: 22, airRating: 45, groundRating: 75, threat: "ALLY", color: "#4caf50", strongholds: ["Kyiv C2", "Odessa Naval", "Kharkiv Defense"] },
  { name: "Belarus", iso: "BLR", lat: 53, lon: 28, troops: 65000, nukes: 0, navyRating: 0, airRating: 35, groundRating: 50, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Minsk HQ", "Machulishchy AFB"] },
  { name: "Cuba", iso: "CUB", lat: 22, lon: -79, troops: 50000, nukes: 0, navyRating: 12, airRating: 15, groundRating: 30, threat: "RIVAL", color: "#e87a4b", strongholds: ["Havana Signals Post", "Lourdes Intel Station"] },
  { name: "Ethiopia", iso: "ETH", lat: 9, lon: 40, troops: 140000, nukes: 0, navyRating: 0, airRating: 18, groundRating: 42, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Debre Zeit AFB"] },
  { name: "Nigeria", iso: "NGA", lat: 10, lon: 8, troops: 135000, nukes: 0, navyRating: 18, airRating: 20, groundRating: 40, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Abuja HQ", "Borno Forward Base"] },
  { name: "Indonesia", iso: "IDN", lat: -2, lon: 118, troops: 400000, nukes: 0, navyRating: 45, airRating: 40, groundRating: 55, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Tanjung Pinang Naval", "Hasanuddin AFB"] },
  { name: "Myanmar", iso: "MMR", lat: 19, lon: 97, troops: 400000, nukes: 0, navyRating: 15, airRating: 18, groundRating: 45, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Naypyidaw HQ", "Monywa Base"] },
  { name: "Sudan", iso: "SDN", lat: 15, lon: 30, troops: 224000, nukes: 0, navyRating: 8, airRating: 12, groundRating: 35, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Khartoum HQ", "Port Sudan Access"] },
  { name: "Mexico", iso: "MEX", lat: 23, lon: -102, troops: 280000, nukes: 0, navyRating: 25, airRating: 28, groundRating: 42, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Veracruz Naval", "Guadalajara Army HQ"] },
  { name: "Colombia", iso: "COL", lat: 4, lon: -74, troops: 295000, nukes: 0, navyRating: 28, airRating: 32, groundRating: 50, threat: "NEUTRAL", color: "#e8b84b", strongholds: ["Bogotá CAF HQ", "Cartagena Naval"] },
  { name: "Serbia", iso: "SRB", lat: 44, lon: 21, troops: 28000, nukes: 0, navyRating: 0, airRating: 30, groundRating: 42, threat: "RIVAL", color: "#e87a4b", strongholds: ["Batajnica AFB"] },
  { name: "Libya", iso: "LBY", lat: 27, lon: 18, troops: 95000, nukes: 0, navyRating: 10, airRating: 12, groundRating: 30, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Tripoli HQ", "Al-Watiyah AFB"] },
  { name: "Yemen", iso: "YEM", lat: 15, lon: 48, troops: 80000, nukes: 0, navyRating: 8, airRating: 10, groundRating: 28, threat: "HOSTILE", color: "#e87a4b", strongholds: ["Sanaa HQ", "Hodeidah Port"] },
];

const SIGINT_FEED = [
  { classification: "TS//SI//NOFORN", source: "NSA ECHELON", text: "FSB Moscow comms confirm Iskander-M launchers departing depot at Kozelsk — destination unknown.", time: "06:14Z" },
  { classification: "TS//SCI", source: "GCHQ Cheltenham", text: "PLA Navy Type-094 SSBN detected leaving Sanya base. Estimated patrol duration: 60 days.", time: "07:32Z" },
  { classification: "SECRET//NOFORN", source: "NSA FORNSAT", text: "DPRK frequency burst transmission from Yongbyon — precursor to launch prep activity.", time: "08:01Z" },
  { classification: "TS//SI", source: "SIGINT Station LEMONWOOD", text: "IRGC Quds Force encrypted traffic spike: 340% above baseline. Link analysis suggests pre-op comms.", time: "09:15Z" },
  { classification: "TS//TK//NOFORN", source: "NRO KH-13", text: "Satellite imagery confirms new runway construction at Hainan Island — length suggests J-20 operations.", time: "10:43Z" },
  { classification: "SECRET", source: "DIA HUMNIT", text: "Venezuelan military source: 4 Russian 'advisors' arrived at Camp Bolivar wearing civilian clothes.", time: "11:22Z" },
  { classification: "TS//SI//ORCON", source: "NSA PRISM", text: "Senior Chinese PLA officer communication references 'Day X' — context suggests Taiwan contingency planning.", time: "12:05Z" },
  { classification: "TS//SCI//NOFORN", source: "CSS Singapore", text: "PLA Navy frigate shadowing USS Chancellorsville in South China Sea — 800m separation, weapons hot.", time: "13:48Z" },
];

const CIA_ASSETS = [
  { codename: "CARDINAL", location: "Moscow, Russia", status: "ACTIVE", cover: "SVR Deputy Director", lastContact: "4 hours ago", intel: "Kremlin inner circle access" },
  { codename: "NIGHTSHADE", location: "Beijing, China", status: "ACTIVE", cover: "MSS Technology Analyst", lastContact: "12 hours ago", intel: "PLA cyber operations" },
  { codename: "BRAVO-7", location: "Tehran, Iran", status: "BURNED", cover: "IRGC Engineer", lastContact: "72 hours ago", intel: "Nuclear enrichment program" },
  { codename: "WHISPER", location: "Pyongyang, DPRK", status: "DARK", cover: "Dismissed — last seen at Sunan Airport", lastContact: "21 days ago", intel: "Kim's inner council" },
  { codename: "ORACLE", location: "Damascus, Syria", status: "ACTIVE", cover: "Assad government official", lastContact: "6 hours ago", intel: "Russian military presence" },
  { codename: "SPECTRE", location: "Caracas, Venezuela", status: "ACTIVE", cover: "Maduro cabinet member", lastContact: "8 hours ago", intel: "Cuban intelligence advisors" },
];

const ALLY_RELATIONS = [
  { name: "United Kingdom", flag: "🇬🇧", relationship: 92, trend: +2, note: "Five Eyes partner. Unconditional intelligence sharing." },
  { name: "France", flag: "🇫🇷", relationship: 78, trend: -1, note: "NATO ally. Slight friction over Syria policy." },
  { name: "Germany", flag: "🇩🇪", relationship: 74, trend: 0, note: "NATO ally. Defense spending dispute ongoing." },
  { name: "South Korea", flag: "🇰🇷", relationship: 88, trend: +3, note: "Critical Pacific ally. Joint exercises highest in a decade." },
  { name: "Japan", flag: "🇯🇵", relationship: 85, trend: +1, note: "Strong partner. New defense cooperation treaty signed." },
  { name: "Israel", flag: "🇮🇱", relationship: 82, trend: 0, note: "Steadfast strategic partner. Active intel sharing on Iran." },
  { name: "Saudi Arabia", flag: "🇸🇦", relationship: 65, trend: -4, note: "Complex relationship. Oil leverage, Yemen friction." },
  { name: "Pakistan", flag: "🇵🇰", relationship: 40, trend: -3, note: "Unreliable. ISI double-dealing confirmed in last SIGINT report." },
];

const SAVE_KEY = "specops-general-v1";
async function loadSave() {
  try { const r = await window.storage.get(SAVE_KEY); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function writeSave(data) {
  try { await window.storage.set(SAVE_KEY, JSON.stringify(data)); } catch { }
}

/* ═══════════════════════════ STATIC DATA ═══════════════════════════════════ */
const PRESTIGE_ASSETS = [
  { id: "cigars", item: "Vintage Cuban Cigars", type: "Luxury", icon: "🚬", cost: 2000, desc: "Impress the Joint Chiefs. +1 PR", pr: 1, ap: 0 },
  { id: "art", item: "Pentagon Art Collection", type: "Luxury", icon: "🖼️", cost: 50000, desc: "Rare art officially donated, privately enjoyed. +6 PR", pr: 6, ap: 0 },
  { id: "mansion", item: "Georgetown Mansion Rent", type: "Property", icon: "🏛️", cost: 15000, desc: "For senator dinners. +$5,000/tick passive. +3 PR, +2 AP", pr: 3, ap: 2 },
  { id: "gala", item: "Lobbyist Extravaganza", type: "Influence", icon: "🥂", cost: 45000, desc: "A secret Capitol gala. +10 AP, +1 AP/tick regen", pr: 0, ap: 10 },
  { id: "office", item: "Custom Pentagon Office", type: "Influence", icon: "🚪", cost: 80000, desc: "Gold-plated, imposing. +8 PR", pr: 8, ap: 0 },
  { id: "security", item: "Private Security Detail", type: "Hardware", icon: "🛡️", cost: 120000, desc: "Ex-Delta operators. +5 PR, +5 AP, domestic threat immunity", pr: 5, ap: 5 },
  { id: "swiss", item: "Swiss Bank Account", type: "Financial", icon: "💼", cost: 150000, desc: "Double salary streams. Salary now $50k/tick.", pr: 0, ap: 0 },
  { id: "dinner", item: "JSOC Liaison Dinner Circuit", type: "Influence", icon: "🍽️", cost: 180000, desc: "Dinner with every combatant commander. +15 PR", pr: 15, ap: 0 },
  { id: "paris_chateau", item: "Château de Luxe (Paris)", type: "Property", icon: "🏰", cost: 200000, desc: "Known diplomats envy your access. +12 AP per diplomatic meeting", pr: 10, ap: 8 },
  { id: "patron", item: "Political Patron Network", type: "Influence", icon: "🤝", cost: 250000, desc: "Senators and Reps groomed over time. +15 AP, POTUS events +5 bonus AP", pr: 5, ap: 15 },
  { id: "gwagon", item: "Armored G-Wagon Fleet", type: "Hardware", icon: "🚙", cost: 350000, desc: "Motorcade fit for an autocrat. +15 PR, +5 AP", pr: 15, ap: 5 },
  { id: "cayman", item: "Private Cayman Island", type: "Property", icon: "🏝️", cost: 400000, desc: "Ultimate exit strategy. +25 PR, full financial immunity", pr: 25, ap: 0 },
  { id: "armaments", item: "Offshore Armaments Cache", type: "Hardware", icon: "🔫", cost: 500000, desc: "Black-market weapons stockpile. Enables armed personal militia option.", pr: 20, ap: 0 },
  { id: "superyacht", item: "Superyacht 'Diplomatic Immunity'", type: "Property", icon: "🛥️", cost: 800000, desc: "Floating extraterritorial palace. +30 PR", pr: 30, ap: 0 },
  { id: "satellite", item: "Private Military Satellite", type: "Hardware", icon: "🛰️", cost: 1500000, desc: "Dedicated NRO-grade orbital surveillance. +40 PR, +10 AP", pr: 40, ap: 10 },
];

const UNITS = [
  { id: "delta", name: "Delta Force", abbr: "1SFOD-D", icon: "⚡", strength: 850, specialty: "Direct Action", theater: "Global" },
  { id: "seals", name: "SEAL Team 6", abbr: "DEVGRU", icon: "🔱", strength: 300, specialty: "Maritime Assault", theater: "Global" },
  { id: "rangers", name: "75th Rangers", abbr: "75RGT", icon: "🦅", strength: 3500, specialty: "Airborne Assault", theater: "Global" },
  { id: "sfg5", name: "5th Special Forces", abbr: "5SFG", icon: "🌐", strength: 1400, specialty: "Unconventional Warfare", theater: "Middle East" },
  { id: "82abn", name: "82nd Airborne", abbr: "82ABN", icon: "☁", strength: 14500, specialty: "Rapid Deployment", theater: "Europe" },
  { id: "1mar", name: "1st Marine Div", abbr: "1MARDIV", icon: "⚓", strength: 19000, specialty: "Amphibious Assault", theater: "Pacific" },
  { id: "7thfleet", name: "7th Fleet", abbr: "7FLT", icon: "⛵", strength: 60000, specialty: "Naval Strike", theater: "Pacific" },
  { id: "b52", name: "B-52 Stratofortress", abbr: "B52-H", icon: "✈", strength: 76, specialty: "Strategic Bombing", theater: "Global" },
];

const HOT_ZONES = [
  { id: "hz1", name: "Korean Peninsula", lat: 38, lon: 127, threat: "HIGH", color: "#e84b4b", description: "DPRK missile activity surging. 3 ICBMs on launchpads.", troops: 28000, missionCount: 0 },
  { id: "hz2", name: "Taiwan Strait", lat: 24, lon: 120, threat: "HIGH", color: "#e84b4b", description: "PLA conducting live-fire exercises. USS Reagan repositioned.", troops: 12000, missionCount: 0 },
  { id: "hz3", name: "Black Sea", lat: 45, lon: 33, threat: "MEDIUM", color: "#e8b84b", description: "Russian naval buildup. 3 Kilo-class submarines tracked.", troops: 8000, missionCount: 0 },
  { id: "hz4", name: "Persian Gulf", lat: 26, lon: 54, threat: "MEDIUM", color: "#e8b84b", description: "Iranian fast boats harassing commercial shipping.", troops: 5500, missionCount: 0 },
  { id: "hz5", name: "Sahel Region", lat: 14, lon: 5, threat: "LOW", color: "#4be870", description: "Wagner Group mercenary activity in Mali and Niger.", troops: 1200, missionCount: 0 },
  { id: "hz6", name: "Venezuela", lat: 8, lon: -66, threat: "LOW", color: "#4be870", description: "Maduro regime destabilization. CIA assets active.", troops: 0, missionCount: 0 },
  { id: "hz7", name: "Eastern Ukraine", lat: 49, lon: 37, threat: "HIGH", color: "#e84b4b", description: "Active front line operations. Russian artillery at sustained rates.", troops: 2800, missionCount: 0 },
  { id: "hz8", name: "Sudan", lat: 15, lon: 32, threat: "MEDIUM", color: "#e8b84b", description: "RSF-SAF conflict ongoing. 12M civilians displaced. Wagner equipment confirmed.", troops: 400, missionCount: 0 },
  { id: "hz9", name: "Myanmar", lat: 19, lon: 96, threat: "MEDIUM", color: "#e8b84b", description: "Junta crackdown. China supplying regime. Resistance forces US-aligned.", troops: 0, missionCount: 0 },
  { id: "hz10", name: "Kosovo", lat: 43, lon: 21, threat: "LOW", color: "#4be870", description: "Serbian troop movements near border. KFOR on alert.", troops: 3400, missionCount: 0 },
  { id: "hz11", name: "Syria", lat: 35, lon: 38, threat: "MEDIUM", color: "#e8b84b", description: "ISIS resurgence in Deir ez-Zor. 900 US troops at Al-Tanf.", troops: 900, missionCount: 0 },
  { id: "hz12", name: "Yemen / Red Sea", lat: 14, lon: 44, threat: "HIGH", color: "#e84b4b", description: "Houthi drone and missile attacks on shipping. Operation Prosperity Guardian active.", troops: 3200, missionCount: 0 },
];

const GLOBAL_EVENTS = [
  { id: "e1", type: "CRISIS", urgency: "CRITICAL", title: "DPRK ICBM LAUNCH DETECTED", body: "North Korean Hwasong-17 ICBM launched from Pyongyang. Trajectory analysis: 14 minutes to impact window. NORAD tracking. SecDef on line.", options: [{ label: "SCRAMBLE INTERCEPTORS", effect: { approval: +8, defcon: -1, prestige: +10 }, outcome: "Patriots and THAAD engage. Intercept confirmed at 80,000 feet. Crisis contained. POTUS commends your response." }, { label: "ISSUE DIPLOMATIC WARNING", effect: { approval: -5, defcon: 0, prestige: -5 }, outcome: "Warning issued. Missile splashes in Sea of Japan. Allies furious at perceived weakness. POTUS calls — not happy." }, { label: "AUTHORIZE COUNTER-STRIKE", effect: { approval: -20, defcon: -2, prestige: +5 }, outcome: "Counter-strike authorized. B-1B launches. DPRK scrambles. Near-war situation. POTUS overrides and cancels. You take the blame." }] },
  { id: "e2", type: "POLITICS", urgency: "HIGH", title: "SENATOR DEMANDS YOUR RESIGNATION", body: "Senate Armed Services Committee Chairman claims you exceeded authority in last operation. Live press conference calling for your removal. POTUS watching.", options: [{ label: "HOLD PRESS CONFERENCE", effect: { approval: +5, defcon: 0, prestige: +8 }, outcome: "Commanding performance. You lay out the facts with authority. Senator backs down. POTUS texts: 'Well handled, General.'" }, { label: "CONSULT JAG — SAY NOTHING", effect: { approval: -3, defcon: 0, prestige: 0 }, outcome: "Your silence reads as guilt. Media runs with it for 48 hours. POTUS is displeased but loyal — for now." }, { label: "FIRE BACK PUBLICLY", effect: { approval: -10, defcon: 0, prestige: -10 }, outcome: "The exchange goes viral. Congress is furious. POTUS summons you to the Oval. You've made his life harder." }] },
  { id: "e3", type: "MILITARY", urgency: "HIGH", title: "RUSSIAN SU-57 INTERCEPTS NATO RECON", body: "Russian Sukhoi Su-57 flew within 20 feet of a NATO RC-135 over the Baltic. Pilot is safe. Moscow claims it was a 'routine intercept.' NATO SecGen calling for your assessment.", options: [{ label: "DEPLOY F-22 COMBAT AIR PATROL", effect: { approval: +10, defcon: -1, prestige: +8 }, outcome: "F-22s establish presence. Russia backs off. NATO allies impressed by your rapid response. Prestige up." }, { label: "DIPLOMATIC CHANNEL TO MOSCOW", effect: { approval: +3, defcon: 0, prestige: +3 }, outcome: "Back-channel communication reduces tension. Moscow issues quiet apology. Situation defused professionally." }, { label: "RECOMMEND ARTICLE 5 CONSULTATION", effect: { approval: -5, defcon: -1, prestige: -5 }, outcome: "Allies see this as overreaction. POTUS is annoyed you escalated too fast. Defcon drops." }] },
  { id: "e4", type: "COUP", urgency: "CRITICAL", title: "COUP ATTEMPT DETECTED — SOUTH KOREA", body: "Rogue elements of ROK Army 3rd Corps have surrounded the Blue House in Seoul. President Moon has called you directly. US Forces Korea on high alert. CIA on the line.", options: [{ label: "SUPPORT LEGAL GOVERNMENT — DEPLOY USFK", effect: { approval: +15, defcon: 0, prestige: +15 }, outcome: "US Forces Korea moves within 2 hours. Coup collapses. ROK President owes you his life. Alliance cemented. Historic moment." }, { label: "STAND BY — ASSESS SITUATION", effect: { approval: -8, defcon: 0, prestige: -8 }, outcome: "You hesitate. Coup partially succeeds. Seoul in chaos for 72 hours. POTUS is disappointed. Alliance damaged." }, { label: "COVERT SUPPORT TO COUP LEADERS", effect: { approval: -30, defcon: 0, prestige: -20 }, outcome: "CIA learns you aided the coup. POTUS is furious. Congressional inquiry begins. Your career is in danger." }] },
  { id: "e5", type: "NUCLEAR", urgency: "CRITICAL", title: "EARLY WARNING: POSSIBLE ICBM INBOUND", body: "NORAD reports possible ICBM track originating from Russian Arctic. 8-minute window. 23% confidence — could be false alarm. Nuclear protocols activated. SecDef and POTUS on the line.", options: [{ label: "RECOMMEND LAUNCH AUTHORIZATION", effect: { approval: -40, defcon: -3, prestige: -30 }, outcome: "False alarm confirmed 4 minutes later. You nearly started WWIII. POTUS is furious. Senate hearing begins. Career destroyed." }, { label: "DEMAND SECOND-SOURCE CONFIRMATION", effect: { approval: +20, defcon: 0, prestige: +25 }, outcome: "Second source confirms false alarm — satellite anomaly. Your calm prevented nuclear war. POTUS calls it your finest hour." }, { label: "EVACUATE KEY PERSONNEL — HOLD RESPONSE", effect: { approval: +8, defcon: -1, prestige: +10 }, outcome: "Prudent response. False alarm confirmed. POTUS respects the measured call. You demonstrate genuine leadership." }] },
  { id: "e6", type: "POLITICS", urgency: "MEDIUM", title: "POTUS ORDERS WITHDRAWAL — YOU DISAGREE", body: "The President has ordered complete withdrawal from a forward operating base you believe is strategically critical. If you comply, you lose the position. If you push back, you risk your career.", options: [{ label: "COMPLY WITH ORDERS — SALUTE & EXECUTE", effect: { approval: +5, defcon: 0, prestige: -5 }, outcome: "You comply professionally. The base is abandoned. 6 months later, the threat materializes — but POTUS notes your loyalty." }, { label: "FORMALLY OBJECT — REQUEST REVIEW", effect: { approval: +10, defcon: 0, prestige: +8 }, outcome: "Your written objection enters the record. POTUS respects the process and orders an NSC review. The withdrawal is modified." }, { label: "DELAY & SLOW-ROLL THE ORDER", effect: { approval: -20, defcon: 0, prestige: -15 }, outcome: "POTUS discovers you're slow-rolling his direct order. You receive a call from the Chief of Staff. This is a firing offense." }] },
  { id: "e7", type: "MILITARY", urgency: "HIGH", title: "CHINESE CARRIER ENTERS DISPUTED WATERS", body: "PLA Navy Shandong carrier group has entered the disputed South China Sea exclusion zone. Philippines is requesting US protection. You have 40 minutes before they reach critical proximity.", options: [{ label: "SAIL USS RONALD REAGAN THROUGH THE ZONE", effect: { approval: +12, defcon: -1, prestige: +12 }, outcome: "Freedom of navigation operation executed. PLA backs off 30nm. Philippines cheers. China protests diplomatically. Perfect response." }, { label: "CONSULT ALLIES FIRST", effect: { approval: +5, defcon: 0, prestige: +3 }, outcome: "Multi-party consultation takes 3 hours. Chinese carrier holds position. Situation stabilizes but allies note the delay." }, { label: "AUTHORIZE WARNING SHOTS ACROSS THE BOW", effect: { approval: -15, defcon: -2, prestige: -5 }, outcome: "Warning shots trigger immediate escalation. PLA scrambles J-35s. Near-combat situation. POTUS forces de-escalation." }] },
  { id: "e8", type: "COUP", urgency: "HIGH", title: "YOUR OFFICERS APPROACH YOU ABOUT A COUP", body: "Three senior generals meet you privately. They claim POTUS is 'unfit' and ask you to sign a letter removing him under the 25th Amendment — but the real plan goes further. They want you to lead a military takeover.", options: [{ label: "REFUSE — REPORT TO SecDef IMMEDIATELY", effect: { approval: +25, defcon: 0, prestige: +30 }, outcome: "You report the conspiracy within the hour. All three generals are relieved of command and face court martial. POTUS calls you personally: 'You're the only general I trust.' Historic." }, { label: "LISTEN BUT DON'T COMMIT", effect: { approval: -10, defcon: 0, prestige: -10 }, outcome: "Your hesitation is noted. SecDef learns you attended the meeting. You're placed under informal review. Dangerous position." }, { label: "JOIN THE CONSPIRACY", effect: { approval: -100, defcon: 0, prestige: -50 }, outcome: "The conspiracy is compromised within 24 hours. You are arrested by the FBI. Court martialed. Dishonorably discharged. Career destroyed. History judges you harshly." }] },
];

const SUBORDINATE_GENERALS = [
  { id: "sg1", name: "Gen. Marcus Webb", rank: "LTG", unit: "XVIII Airborne Corps", distinction: "Mogadishu veteran. 3 combat tours.", medals: ["DSM", "BSM", "PH"], baseLoyalty: 60, faction: "Hawks", trait: "Aggressive" },
  { id: "sg2", name: "Adm. Diana Torres", rank: "VADM", unit: "7th Fleet", distinction: "Led Pacific response to Taiwan crisis.", medals: ["LOM", "BSM"], baseLoyalty: 75, faction: "Navy Elite", trait: "Strategic" },
  { id: "sg3", name: "Gen. James Okafor", rank: "MG", unit: "1st Special Forces CMD", distinction: "Green Beret. 18 years SF operations.", medals: ["CAB", "SSM"], baseLoyalty: 85, faction: "Special Ops", trait: "Loyal" },
  { id: "sg4", name: "Gen. Rachel Kim", rank: "BG", unit: "Space Force Operations", distinction: "Youngest BG in 40 years. MIT engineer.", medals: ["DSM"], baseLoyalty: 50, faction: "Technocrats", trait: "Ambitious" },
  { id: "sg5", name: "Col. Dmitri Volkov", rank: "COL", unit: "Delta Force", distinction: "Born in USSR. Defected 1991. CIA asset.", medals: ["CAB", "BSM", "PH"], baseLoyalty: 65, faction: "Shadow Ops", trait: "Ruthless" },
];

const INITIAL_OFFICERS = [
  { id: "o1", name: "Anderson, C.", rank: "1LT", unit: "75th Ranger Reg.", specialty: "Direct Action", xp: 120, status: "ACTIVE" },
  { id: "o2", name: "Miller, D.", rank: "CPT", unit: "SEAL Team 6", specialty: "Maritime", xp: 650, status: "ACTIVE" },
  { id: "o3", name: "Chen, J.", rank: "MAJ", unit: "Delta Force", specialty: "Hostage Rescue", xp: 1400, status: "ACTIVE" },
  { id: "o4", name: "Reyes, M.", rank: "CPT", unit: "Night Stalkers", specialty: "Aviation", xp: 800, status: "ACTIVE" },
  { id: "o5", name: "Washington, T.", rank: "LTC", unit: "ISA", specialty: "Intelligence", xp: 2800, status: "ACTIVE" }
];

const PROMOTION_THRESHOLDS = {
  "1LT": { next: "CPT", xpReq: 500, cost: 5 },
  "CPT": { next: "MAJ", xpReq: 1200, cost: 10 },
  "MAJ": { next: "LTC", xpReq: 2500, cost: 15 },
  "LTC": { next: "COL", xpReq: 5000, cost: 25 },
  "COL": { next: "BG", xpReq: 10000, cost: 50 },
};

const DIVISION_UPGRADES = [
  { id: "upg1", name: "GPNVG-18 PANO VISION", desc: "4-tube night vision giving 97° FoV room clearing advantage. +10% Success Rate.", cost: 1200000 },
  { id: "upg2", name: "LOITERING DRONES (SWITCHBLADE 600)", desc: "Backpack-carried kamikaze drones for platoon-level anti-armor. -15% KIA Risk.", cost: 3500000 },
  { id: "upg3", name: "NEXT-GEN SQUAD WEAPON (SIG MCX SPEAR)", desc: "6.8mm rifle that penetrates modern body armor at 500m. +20% Combat Effectiveness.", cost: 5000000 },
  { id: "upg4", name: "EXOSKELETON KNEE BRACES", desc: "Reduces troop fatigue by 40%. Decreases extraction times. +10 Approval.", cost: 8000000 },
  { id: "upg5", name: "AI BATTLESPACE C2 SYSTEM", desc: "Palantir Gotham integration for real-time threat feed. +15 Prestige.", cost: 15000000 }
];

const MEDAL_LIST = [
  { id: "moh", name: "Medal of Honor", color: "#ffd700", icon: "🏅", desc: "Nation's highest military honor" },
  { id: "dsm", name: "Defense Superior Service", color: "#e8b84b", icon: "★", desc: "Exceptional meritorious service" },
  { id: "ssm", name: "Silver Star", color: "#d0d0d0", icon: "✦", desc: "Gallantry in action" },
  { id: "bsm", name: "Bronze Star", color: "#cd7f32", icon: "✦", desc: "Heroic achievement" },
  { id: "lom", name: "Legion of Merit", color: "#4b9ae8", icon: "✸", desc: "Meritorious conduct" },
  { id: "ph", name: "Purple Heart", color: "#9b59b6", icon: "♥", desc: "Wounded in action" },
  { id: "cab", name: "Combat Action Badge", color: "#8fc68f", icon: "⚔", desc: "Direct combat engagement" },
  { id: "dfc", name: "Dist. Flying Cross", color: "#4bcde8", icon: "✈", desc: "Heroism in aerial flight" },
];

const NEWS_FEED = [
  "PENTAGON: Joint Chiefs convene emergency session on Korean Peninsula tensions",
  "BREAKING: USS Ronald Reagan carrier strike group repositioned to South China Sea",
  "RUSSIA deploys additional S-400 systems to Kaliningrad enclave",
  "CHINA conducts largest naval exercise in Pacific history — 180 vessels",
  "IRAN announces 60% uranium enrichment — IAEA inspectors denied access",
  "VENEZUELA: Maduro requests Russian military advisors amid internal unrest",
  "NATO allies meeting in Brussels — Article 5 threshold debate intensifies",
  "SATELLITE IMAGERY: North Korean Hwasong-18 missiles spotted on transporters",
  "SPACE FORCE reports Chinese ASAT test — 3 US satellites temporarily blinded",
  "WAGNER GROUP activity confirmed in Central African Republic — 2,000 mercenaries",
  "TAIWAN: President rejects PRC reunification framework — strait tension elevated",
  "PENTAGON BUDGET: Congress authorizes $886B — largest in history",
  "DEFCON STATUS: Routine exercises keeping forces at high readiness posture",
  "SPECIAL FORCES operation in Sahel region yields intelligence on weapons cache",
  "CYBER COMMAND reports record DDoS attacks on DOD infrastructure from China",
  "B-21 RAIDER achieves initial operating capability — strategic deterrent strengthened",
  "COLOMBIA requests US counter-narco support — SOUTHCOM reviewing options",
  "ARCTIC: Russia and China conduct joint naval patrol near Alaska coastline",
];

/* ═══════════════════════════ HELPERS ════════════════════════════════════════ */
const defconLabel = d => ["", "DEFCON 1 — WAR", "DEFCON 2 — ARMED FORCES READY", "DEFCON 3 — ELEVATED READINESS", "DEFCON 4 — ABOVE NORMAL", "DEFCON 5 — NORMAL PEACETIME"][d];
const defconColor = d => ["", "#ff0000", "#ff6600", "#e8b84b", "#4b9ae8", "#4caf50"][d];
const approvalLabel = a => a >= 80 ? "HIGHLY TRUSTED" : a >= 60 ? "RESPECTED" : a >= 40 ? "TOLERATED" : a >= 20 ? "ON THIN ICE" : "FIRING IMMINENT";
const approvalColor = a => a >= 80 ? "#4caf50" : a >= 60 ? "#4be870" : a >= 40 ? "#e8b84b" : a >= 20 ? "#e87a4b" : "#e84b4b";
const prestigeLabel = p => p >= 90 ? "LEGENDARY" : p >= 70 ? "FEARED" : p >= 50 ? "RESPECTED" : p >= 30 ? "KNOWN" : "UNKNOWN";

function useTick(interval = 1000) {
  const [t, setT] = useState(0);
  useEffect(() => { const iv = setInterval(() => setT(x => x + 1), interval); return () => clearInterval(iv); }, [interval]);
  return t;
}

/* ═══════════════════════════ CSS ════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Oswald:wght@400;600;700&family=Rajdhani:wght@300;400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#020904;overflow-x:hidden}
@keyframes scan{0%{top:-4px}100%{top:100vh}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes goldGlow{0%,100%{text-shadow:0 0 10px #ffd700,0 0 25px #c8a000}50%{text-shadow:0 0 25px #ffd700,0 0 60px #ffd700,0 0 100px gold}}
@keyframes redPulse{0%,100%{box-shadow:0 0 8px #e84b4b44}50%{box-shadow:0 0 24px #e84b4b,0 0 48px #e84b4b44}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes ticker{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes starDrop{0%{transform:translateY(-20px);opacity:0}15%{opacity:0.8}85%{opacity:0.8}100%{transform:translateY(100vh);opacity:0}}
@keyframes nuclearPulse{0%,100%{transform:scale(1);box-shadow:0 0 20px #ff000066}50%{transform:scale(1.02);box-shadow:0 0 60px #ff0000,0 0 100px #ff000044}}
@keyframes typeIn{from{opacity:0}to{opacity:1}}
.root{font-family:'Share Tech Mono',monospace;background:#020904;min-height:100vh;color:#7aaa7a;overflow-x:hidden}
.scanline-sweep{position:fixed;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#4caf5033,transparent);animation:scan 8s linear infinite;z-index:99;pointer-events:none}
.crt-lines{position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);pointer-events:none;z-index:98}
.gold{color:#ffd700}
.glow-gold{color:#ffd700;animation:goldGlow 3s infinite}
.red-urgent{animation:redPulse 1.5s infinite}
.btn{background:transparent;border:1px solid #2a4a2a;color:#7aaa7a;font-family:'Share Tech Mono',monospace;padding:8px 16px;cursor:pointer;letter-spacing:2px;font-size:10px;text-transform:uppercase;transition:all 0.15s}
.btn:hover{background:#0a1a0a;color:#c8ffc8;border-color:#4caf50}
.btn-gold{border-color:#3a3000;color:#a08000}
.btn-gold:hover{background:#1a1400;color:#ffd700;border-color:#ffd700}
.btn-red{border-color:#4a1a1a;color:#e84b4b}
.btn-red:hover{background:#1a0000;color:#ff6666;border-color:#e84b4b}
.panel{background:rgba(2,12,4,0.97);border:1px solid #1a3a1a;position:relative;overflow:hidden}
.panel-gold{background:rgba(10,10,2,0.97);border:1px solid #2a2a00}
.tab-btn{background:transparent;border:none;border-bottom:2px solid transparent;color:#3a5a3a;font-family:'Share Tech Mono',monospace;padding:10px 16px;cursor:pointer;letter-spacing:2px;font-size:10px;text-transform:uppercase;transition:all 0.2s}
.tab-btn.active{color:#ffd700;border-bottom-color:#ffd700}
.tab-btn:hover:not(.active){color:#a08000}
.choice-card{cursor:pointer;transition:all 0.2s;border:1px solid #1a2a1a;padding:14px;background:rgba(2,12,4,0.9)}
.choice-card:hover{border-color:#4caf5066;background:#050f05;transform:translateX(4px)}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:#2a4a2a}
input,select{background:#050d05;border:1px solid #2a4a2a;color:#c8ffc8;font-family:'Share Tech Mono',monospace;font-size:11px;padding:6px 10px;outline:none}
input::placeholder{color:#2a4a2a}
`;

/* ═══════════════════════════ TYPEWRITER ═════════════════════════════════════ */
function TW({ text, speed = 12, onDone }) {
  const [o, setO] = useState(""), i = useRef(0);
  useEffect(() => { i.current = 0; setO(""); const v = setInterval(() => { if (i.current < text.length) setO(text.slice(0, ++i.current)); else { clearInterval(v); onDone?.(); } }, speed); return () => clearInterval(v); }, [text]);
  return <span>{o}<span style={{ opacity: o.length === text.length ? 0 : 1, animation: "blink 0.8s infinite" }}>█</span></span>;
}

/* ═══════════════════════════ CORNER BRACKETS ════════════════════════════════ */
function Corners({ color = "#ffd700" }) {
  const s = (pos) => { const m = { tl: { top: 0, left: 0, borderWidth: "2px 0 0 2px" }, tr: { top: 0, right: 0, borderWidth: "2px 2px 0 0" }, bl: { bottom: 0, left: 0, borderWidth: "0 0 2px 2px" }, br: { bottom: 0, right: 0, borderWidth: "0 2px 2px 0" } }; return { position: "absolute", width: 12, height: 12, borderStyle: "solid", borderColor: color, ...m[pos] }; };
  return <>{["tl", "tr", "bl", "br"].map(p => <div key={p} style={s(p)} />)}</>;
}

/* ═══════════════════════════ NEWS TICKER ════════════════════════════════════ */
function NewsTicker({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ background: "#050000", borderTop: "2px solid #3a0000", borderBottom: "2px solid #3a0000", padding: "8px 0", overflow: "hidden", position: "relative", boxShadow: "0 0 20px #ff000022 inset" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ background: "#e84b4b", color: "#fff", fontSize: 10, fontWeight: "bold", letterSpacing: 4, padding: "4px 14px", flexShrink: 0, marginRight: 16, fontFamily: "'Oswald', sans-serif", zIndex: 2, boxShadow: "4px 0 10px #000" }}>LIVE INTELLIGENCE</div>
        <div style={{ overflow: "hidden", flex: 1, position: "relative" }}>
          <div style={{ whiteSpace: "nowrap", animation: "ticker 45s linear infinite", fontSize: 11, color: "#e8b84b", letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace", textShadow: "0 0 5px #e8b84b88" }}>
            {items.map((item, idx) => (
              <span key={idx}>
                {item.includes("BREAKING") || item.includes("CRISIS") || item.includes("EXPIRED") ? (
                  <span style={{ color: "#e84b4b", fontWeight: "bold", animation: "pulseRed 2s infinite" }}>{item}</span>
                ) : (
                  <span>{item}</span>
                )}
                <span style={{ color: "#5a5a3a", margin: "0 30px" }}>◈</span>
              </span>
            ))}
            {/* Duplicate for seamless scrolling */}
            {items.map((item, idx) => (
              <span key={"dup-" + idx}>
                {item.includes("BREAKING") || item.includes("CRISIS") || item.includes("EXPIRED") ? (
                  <span style={{ color: "#e84b4b", fontWeight: "bold", animation: "pulseRed 2s infinite" }}>{item}</span>
                ) : (
                  <span>{item}</span>
                )}
                <span style={{ color: "#5a5a3a", margin: "0 30px" }}>◈</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ DEFCON DISPLAY ═════════════════════════════════ */
function DefconDisplay({ defcon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {[5, 4, 3, 2, 1].map(d => (
        <div key={d} style={{ width: 32, height: 32, border: `2px solid ${d <= defcon ? "transparent" : defconColor(d)}`, background: d === defcon ? defconColor(d) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: d <= defcon ? "#000" : defconColor(d), boxShadow: d === defcon ? `0 0 12px ${defconColor(d)}` : "none", transition: "all 0.5s", fontFamily: "monospace" }}>
          {d}
        </div>
      ))}
      <div style={{ fontSize: 9, color: defconColor(defcon), letterSpacing: 1 }}>{defconLabel(defcon)}</div>
    </div>
  );
}

/* ═══════════════════════════ TACTICAL BOARD MAP ════════════════════════════ */
function TacticalBoard({ zones, deployments, liveMissions, onZoneClick, onMissionClick }) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 20]);
  const [hovered, setHovered] = useState(null);
  const [placingPin, setPlacingPin] = useState(null); // "friendly" | "enemy" | "objective" | null
  const [pins, setPins] = useState([]);
  const [threatCircles, setThreatCircles] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [mouseCoords, setMouseCoords] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const PIN_TYPES = {
    friendly: { color: "#4caf50", icon: "▲", label: "FRIENDLY UNIT" },
    enemy: { color: "#e84b4b", icon: "✕", label: "ENEMY FORCE" },
    objective: { color: "#ffd700", icon: "★", label: "OBJECTIVE" },
    strike: { color: "#e87a4b", icon: "⚡", label: "STRIKE PACKAGE" },
    intel: { color: "#4b9ae8", icon: "◈", label: "INTEL ASSET" },
  };

  const handleMapClick = (e, coords) => {
    if (placingPin && coords) {
      const [lon, lat] = coords;
      const newPin = {
        id: Date.now(),
        type: placingPin,
        lon, lat,
        label: `${PIN_TYPES[placingPin].label} ${pins.length + 1}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setPins(p => [...p, newPin]);
      if (e.shiftKey) return; // keep placing
      setPlacingPin(null);
    }
  };

  return (
    <div style={{ position: "relative", background: "#010804", border: "1px solid #1a3a1a", overflow: "hidden" }}>
      {/* TACTICAL TOOLBAR */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", background: "#020a04", borderBottom: "1px solid #1a3a1a", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 3, marginRight: 8 }}>TACTICAL BOARD</div>
        {Object.entries(PIN_TYPES).map(([type, cfg]) => (
          <button key={type} onClick={() => setPlacingPin(placingPin === type ? null : type)}
            style={{ background: placingPin === type ? cfg.color + "22" : "transparent", border: `1px solid ${placingPin === type ? cfg.color : "#2a3a2a"}`, color: placingPin === type ? cfg.color : "#5a7a5a", fontFamily: "monospace", fontSize: 9, padding: "3px 10px", cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
            {cfg.icon} {type.toUpperCase()}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowGrid(g => !g)} style={{ background: showGrid ? "#1a2a1a" : "transparent", border: "1px solid #2a3a2a", color: showGrid ? "#4caf50" : "#3a5a3a", fontFamily: "monospace", fontSize: 8, padding: "3px 8px", cursor: "pointer" }}>GRID</button>
        <button onClick={() => setShowLabels(l => !l)} style={{ background: showLabels ? "#1a2a1a" : "transparent", border: "1px solid #2a3a2a", color: showLabels ? "#4caf50" : "#3a5a3a", fontFamily: "monospace", fontSize: 8, padding: "3px 8px", cursor: "pointer" }}>LABELS</button>
        <button onClick={() => { setPins([]); setThreatCircles([]); }} style={{ background: "transparent", border: "1px solid #3a1a1a", color: "#e84b4b", fontFamily: "monospace", fontSize: 8, padding: "3px 8px", cursor: "pointer" }}>CLR</button>
        <button onClick={() => setZoom(z => Math.min(z + 0.5, 8))} style={{ background: "transparent", border: "1px solid #2a3a2a", color: "#c8ffc8", fontFamily: "monospace", fontSize: 10, padding: "2px 8px", cursor: "pointer" }}>+</button>
        <div style={{ fontSize: 9, color: "#5a7a5a", fontFamily: "monospace", minWidth: 30, textAlign: "center" }}>{zoom}x</div>
        <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} style={{ background: "transparent", border: "1px solid #2a3a2a", color: "#c8ffc8", fontFamily: "monospace", fontSize: 10, padding: "2px 8px", cursor: "pointer" }}>−</button>
        <button onClick={() => { setZoom(1); setCenter([0, 20]); }} style={{ background: "transparent", border: "1px solid #2a3a2a", color: "#7a9a7a", fontFamily: "monospace", fontSize: 8, padding: "3px 8px", cursor: "pointer" }}>RESET</button>
      </div>

      {/* PLACING PIN INDICATOR */}
      {placingPin && (
        <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", background: "#0a1a0a", border: `1px solid ${PIN_TYPES[placingPin].color}`, padding: "4px 16px", zIndex: 20, fontSize: 9, color: PIN_TYPES[placingPin].color, letterSpacing: 2, animation: "pulse 1s infinite" }}>
          CLICK MAP TO PLACE {PIN_TYPES[placingPin].label} · SHIFT+CLICK FOR MULTI-PLACE · ESC TO CANCEL
        </div>
      )}

      {/* MAP */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120 }}
        width={800} height={420}
        style={{ width: "100%", display: "block", cursor: placingPin ? "crosshair" : "grab" }}
      >
        <ZoomableGroup zoom={zoom} center={center} onMoveEnd={({ zoom: z, coordinates: c }) => { setZoom(z); setCenter(c); }}>
          {/* BASE GEOGRAPHY */}
          <Geographies geography={geoUrl}>
            {({ geographies }) => geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo}
                fill="#0a1a0a" stroke="#1a3a1a" strokeWidth={0.3}
                style={{ default: { outline: "none" }, hover: { fill: "#0f230f", outline: "none" }, pressed: { outline: "none" } }}
              />
            ))}
          </Geographies>

          {/* DEPLOYMENT LINES FROM PENTAGON */}
          {deployments.map((dep, i) => (
            <Line key={i} from={[-77.0369, 38.9072]} to={[dep.lon ?? 0, dep.lat ?? 0]}
              stroke="#4caf5066" strokeWidth={0.8} strokeDasharray="4,4" style={{ pointerEvents: "none" }} />
          ))}

          {/* LIVE MISSION MARKERS */}
          {(liveMissions || []).filter(m => m.lat && m.lon).map(m => (
            <Marker key={m.id} coordinates={[m.lon, m.lat]} onClick={() => onMissionClick?.(m)} style={{ cursor: "pointer" }}>
              <circle r="18" fill="none" stroke="#e84b4b" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="12;24;12" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle r="9" fill="#e84b4b22" stroke="#e84b4b" strokeWidth="2" />
              <text y={4} textAnchor="middle" fontSize="8" fill="#e84b4b" fontFamily="monospace">⚠</text>
              {showLabels && <text y={20} textAnchor="middle" fontSize="6.5" fill="#e84b4b" fontFamily="monospace">{m.title.split(" ").slice(-1)[0]}</text>}
            </Marker>
          ))}

          {/* HOT ZONE MARKERS */}
          {zones.map(z => {
            const isH = hovered === z.id;
            return (
              <Marker key={z.id} coordinates={[z.lon, z.lat]}
                onClick={() => onZoneClick(z)}
                onMouseEnter={() => setHovered(z.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}>
                <circle r="14" fill="none" stroke={z.color} strokeWidth="1" opacity="0.3">
                  <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle r={isH ? 8 : 6} fill={z.color + "22"} stroke={z.color} strokeWidth={isH ? 2 : 1} style={{ transition: "all 0.2s" }} />
                <text y={3} textAnchor="middle" fontSize="6" fill={z.color} fontFamily="monospace">⚠</text>
                {showLabels && <text y={18} textAnchor="middle" fontSize="6.5" fill={isH ? "#c8ffc8" : z.color + "cc"} fontFamily="monospace">{z.name}</text>}
                {isH && (
                  <g>
                    <rect x={-70} y={22} width="140" height="32" fill="#050d05" stroke={z.color} strokeWidth="0.5" rx="1" />
                    <text y={34} textAnchor="middle" fontSize="6.5" fill="#c8c870" fontFamily="monospace">{z.threat} THREAT</text>
                    <text y={46} textAnchor="middle" fontSize="6" fill="#7a8a7a" fontFamily="monospace">{z.troops.toLocaleString()} US forces</text>
                  </g>
                )}
              </Marker>
            );
          })}

          {/* USER-PLACED TACTICAL PINS */}
          {pins.map(pin => {
            const cfg = PIN_TYPES[pin.type];
            return (
              <Marker key={pin.id} coordinates={[pin.lon, pin.lat]} onClick={() => setSelectedPin(selectedPin?.id === pin.id ? null : pin)} style={{ cursor: "pointer" }}>
                <circle r="10" fill={cfg.color + "22"} stroke={cfg.color} strokeWidth="1.5" />
                <text y={4} textAnchor="middle" fontSize="9" fill={cfg.color} fontFamily="monospace">{cfg.icon}</text>
                {showLabels && <text y={18} textAnchor="middle" fontSize="6" fill={cfg.color + "cc"} fontFamily="monospace">{pin.label.split(" ").slice(-2).join(" ")}</text>}
                {selectedPin?.id === pin.id && (
                  <g>
                    <rect x={-65} y={22} width="130" height="40" fill="#050d05" stroke={cfg.color} strokeWidth="0.5" rx="1" />
                    <text y={34} textAnchor="middle" fontSize="6.5" fill={cfg.color} fontFamily="monospace">{pin.label}</text>
                    <text y={46} textAnchor="middle" fontSize="5.5" fill="#7a8a7a" fontFamily="monospace">{pin.lon.toFixed(2)}°, {pin.lat.toFixed(2)}°</text>
                    <text y={57} textAnchor="middle" fontSize="5" fill="#3a5a3a" fontFamily="monospace">{pin.timestamp}</text>
                  </g>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* GRID OVERLAY */}
      {showGrid && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg,transparent,transparent 49px,rgba(26,74,26,0.15) 50px),repeating-linear-gradient(90deg,transparent,transparent 49px,rgba(26,74,26,0.15) 50px)"
        }} />
      )}

      {/* EQUATOR LINE */}
      <div style={{ position: "absolute", top: "51.5%", left: 0, right: 0, height: "1px", borderTop: "1px dashed #1a3a1a22", pointerEvents: "none" }} />

      {/* STATUS BAR */}
      <div style={{ display: "flex", padding: "6px 12px", background: "#020a04", borderTop: "1px solid #1a3a1a", gap: 18, alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#3a5a3a", fontFamily: "monospace" }}>
          PINS: <span style={{ color: "#c8ffc8" }}>{pins.length}</span>
        </div>
        {Object.entries(PIN_TYPES).map(([type, cfg]) => {
          const count = pins.filter(p => p.type === type).length;
          return count > 0 ? <div key={type} style={{ fontSize: 8, fontFamily: "monospace", color: cfg.color }}>{cfg.icon} {count}</div> : null;
        })}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 8, color: "#3a5a3a", fontFamily: "monospace" }}>GLOBAL TACTICAL OVERVIEW · TOP SECRET</div>
        <div style={{ fontSize: 8, color: "#2a4a2a", fontFamily: "monospace" }}>⚠ HOT ZONE  ── DEPLOYMENT  ⚡ LIVE MISSION</div>
      </div>

      {/* PIN HELP */}
      <div style={{ position: "absolute", bottom: 36, left: 12, fontSize: 7, color: "#2a4a2a", fontFamily: "monospace", pointerEvents: "none" }}>ZOOM: scroll · PAN: drag · PIN: select type then click map</div>
    </div>
  );
}

/* ═══════════════════════════ NUCLEAR LAUNCH SEQUENCE ═══════════════════════ */

function NuclearLaunch({ defcon, onClose, onLaunch }) {
  const [step, setStep] = useState(0);
  const [auth1, setAuth1] = useState("");
  const [auth2, setAuth2] = useState("");
  const [targetCode, setTargetCode] = useState("");
  const [launchKey, setLaunchKey] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [aborted, setAborted] = useState(false);
  const [launched, setLaunched] = useState(false);
  const correctAuth1 = "ZULU-7-KILO";
  const correctAuth2 = "ECHO-FOXTROT-9";
  const validTargets = ["MOSCOW-01", "BEIJING-02", "PYONGYANG-03", "TEHRAN-04"];

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setLaunched(true); onLaunch(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const steps = ["AUTHORIZATION", "AUTHENTICATION", "TARGET SELECTION", "CONFIRMATION", "LAUNCH"];

  if (defcon > 2) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ background: "#0a0000", border: "2px solid #e84b4b", padding: 32, maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#e84b4b", letterSpacing: 4, marginBottom: 16 }}>⚠ NUCLEAR LAUNCH SYSTEM</div>
        <div style={{ fontSize: 13, color: "#ff6666", marginBottom: 12 }}>ACCESS DENIED</div>
        <div style={{ fontSize: 10, color: "#7a4a4a", lineHeight: 2, marginBottom: 20 }}>Nuclear launch authority requires DEFCON 2 or lower.<br />Current status: <span style={{ color: "#e84b4b" }}>{defconLabel(defcon)}</span></div>
        <button className="btn btn-red" onClick={onClose}>← RETURN</button>
      </div>
    </div>
  );

  if (aborted) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ background: "#0a0000", border: "2px solid #4caf50", padding: 32, maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 32, color: "#4caf50", marginBottom: 12 }}>LAUNCH ABORTED</div>
        <div style={{ fontSize: 10, color: "#5a8a5a", lineHeight: 2, marginBottom: 20 }}>Nuclear launch sequence terminated.<br />Emergency abort logged to NSA and STRATCOM.<br />POTUS has been notified.</div>
        <button className="btn" onClick={onClose}>← RETURN TO HQ</button>
      </div>
    </div>
  );

  if (launched) return (
    <div style={{ position: "fixed", inset: 0, background: "#080000", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, color: "#e84b4b", textShadow: "0 0 40px #e84b4b", animation: "pulse 0.5s infinite", marginBottom: 16 }}>☢</div>
        <div style={{ fontSize: 20, color: "#ff6666", letterSpacing: 6, marginBottom: 8 }}>LAUNCH CONFIRMED</div>
        <div style={{ fontSize: 11, color: "#7a4a4a", lineHeight: 2, marginBottom: 8 }}>Minuteman III ICBM armed and airborne.<br />Impact: T+28 minutes.<br />Retaliation strike expected: T+35 minutes.</div>
        <div style={{ fontSize: 9, color: "#3a2a2a", marginBottom: 24 }}>POTUS has been notified. Congressional notification sent.<br />This event is now part of recorded history.</div>
        <button className="btn btn-red" onClick={onClose} style={{ fontSize: 12, padding: "12px 32px" }}>ACKNOWLEDGE</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.98)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", overflow: "auto" }}>
      <div style={{ background: "#080000", border: "2px solid #e84b4b", maxWidth: 600, width: "95%", padding: 28, animation: "nuclearPulse 2s infinite" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#e84b4b", letterSpacing: 4 }}>☢ NUCLEAR COMMAND CENTER</div>
          {countdown === null && <button className="btn btn-red" onClick={onClose} style={{ fontSize: 9 }}>✕ ABORT SEQUENCE</button>}
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e84b4b,transparent)", marginBottom: 20 }} />
        {/* Steps */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
          {steps.map((s, i) => <div key={s} style={{ fontSize: 7, padding: "3px 8px", border: `1px solid ${i <= step ? "#e84b4b" : "#2a1a1a"}`, color: i <= step ? "#e84b4b" : "#2a1a1a", background: i === step ? "#1a0000" : "transparent" }}>{s}</div>)}
        </div>
        {/* STEP 0 */}
        {step === 0 && (
          <div style={{ animation: "fadeUp 0.4s" }}>
            <div style={{ fontSize: 10, color: "#7a4a4a", lineHeight: 2, marginBottom: 20 }}>
              You are initiating the nuclear launch sequence.<br />
              This action requires two-man authentication, target selection,<br />
              and physical key insertion. <span style={{ color: "#e84b4b" }}>There is no undo.</span>
            </div>
            <div style={{ fontSize: 9, color: "#5a3a3a", marginBottom: 20, lineHeight: 1.8 }}>
              "In accordance with NSPD-23, nuclear employment authority rests with the President. As combatant commander, you have been delegated emergency authority under authenticated Presidential directive ECHO-SIERRA-9."
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-red" style={{ flex: 1, padding: 12, fontSize: 11 }} onClick={() => setStep(1)}>PROCEED TO AUTHENTICATION</button>
              <button className="btn" style={{ padding: 12 }} onClick={() => setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 1 — Auth codes */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.4s" }}>
            <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 16, letterSpacing: 2 }}>ENTER AUTHENTICATION CODES</div>
            <div style={{ fontSize: 9, color: "#5a3a3a", marginBottom: 16 }}>Both codes required. From your classified 'biscuit' card.</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#7a4a4a", marginBottom: 6 }}>PRIMARY AUTH CODE (Format: ALPHA-#-ALPHA)</div>
              <input style={{ width: "100%", background: "#0a0000", border: "1px solid #3a1a1a", color: "#e84b4b", fontFamily: "monospace", fontSize: 12, letterSpacing: 4, padding: "8px 12px" }} placeholder="ZULU-7-KILO" value={auth1} onChange={e => setAuth1(e.target.value.toUpperCase())} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#7a4a4a", marginBottom: 6 }}>SECONDARY AUTH CODE (Format: ALPHA-ALPHA-#)</div>
              <input style={{ width: "100%", background: "#0a0000", border: "1px solid #3a1a1a", color: "#e84b4b", fontFamily: "monospace", fontSize: 12, letterSpacing: 4, padding: "8px 12px" }} placeholder="ECHO-FOXTROT-9" value={auth2} onChange={e => setAuth2(e.target.value.toUpperCase())} />
            </div>
            <div style={{ fontSize: 8, color: "#3a2a2a", marginBottom: 16 }}>HINT: Primary = ZULU-7-KILO · Secondary = ECHO-FOXTROT-9</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-red" style={{ flex: 1, padding: 10 }} onClick={() => { if (auth1 === correctAuth1 && auth2 === correctAuth2) setStep(2); else alert("INVALID AUTH CODES — Attempt logged to NSA"); }}>AUTHENTICATE</button>
              <button className="btn" onClick={() => setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 2 — Target */}
        {step === 2 && (
          <div style={{ animation: "fadeUp 0.4s" }}>
            <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 16, letterSpacing: 2 }}>SELECT TARGET — STRATCOM SIOP OPTION</div>
            {validTargets.map(t => (
              <div key={t} className="choice-card" style={{ marginBottom: 8, borderColor: targetCode === t ? "#e84b4b" : "#2a1a1a", background: targetCode === t ? "#1a0000" : "rgba(8,0,0,0.9)" }} onClick={() => setTargetCode(t)}>
                <div style={{ fontSize: 11, color: targetCode === t ? "#e84b4b" : "#7a4a4a", letterSpacing: 2 }}>{t}</div>
                <div style={{ fontSize: 8, color: "#4a2a2a", marginTop: 4 }}>
                  {{ [`MOSCOW-01`]: "Kremlin military C2 complex — 12 Minuteman III w/ MIRV", ["BEIJING-02"]: "PLA General Staff HQ — 8 Trident D5 SLBMs", ["PYONGYANG-03"]: "DPRK leadership bunker — 4 Minuteman III precision strikes", ["TEHRAN-04"]: "IRGC command center — 6 B61-12 gravity bombs via B-21" }[t]}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn btn-red" style={{ flex: 1, padding: 10 }} onClick={() => targetCode && setStep(3)}>CONFIRM TARGET</button>
              <button className="btn" onClick={() => setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 3 — Final confirmation */}
        {step === 3 && (
          <div style={{ animation: "fadeUp 0.4s" }}>
            <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 16, letterSpacing: 2 }}>FINAL CONFIRMATION</div>
            <div style={{ background: "#0a0000", border: "1px solid #3a1a1a", padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#5a3a3a", lineHeight: 2 }}>TARGET: <span style={{ color: "#e84b4b" }}>{targetCode}</span></div>
              <div style={{ fontSize: 9, color: "#5a3a3a", lineHeight: 2 }}>AUTHORITY: Emergency Presidential Delegation ECHO-SIERRA-9</div>
              <div style={{ fontSize: 9, color: "#5a3a3a", lineHeight: 2 }}>PACKAGE: SIOP Option Alpha — Single warhead strike</div>
              <div style={{ fontSize: 9, color: "#5a3a3a", lineHeight: 2 }}>YIELD: 300kt W87-1 warhead</div>
              <div style={{ fontSize: 9, color: "#5a3a3a", lineHeight: 2 }}>ETA TO IMPACT: 28 minutes</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#7a4a4a", marginBottom: 8 }}>INSERT PHYSICAL LAUNCH KEY AND TURN</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div onClick={() => setLaunchKey(k => !k)} style={{ width: 60, height: 30, background: launchKey ? "#3a0000" : "#0a0000", border: `2px solid ${launchKey ? "#e84b4b" : "#3a1a1a"}`, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                  <div style={{ width: 20, height: 20, background: launchKey ? "#e84b4b" : "#2a1a1a", borderRadius: "50%", transition: "all 0.3s", boxShadow: launchKey ? "0 0 10px #e84b4b" : "none" }} />
                </div>
                <div style={{ fontSize: 9, color: launchKey ? "#e84b4b" : "#3a2a2a" }}>{launchKey ? "KEY ENGAGED — ARMED" : "KEY NOT ENGAGED"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-red" style={{ flex: 1, padding: 12, fontSize: 11, opacity: launchKey ? 1 : 0.4 }} onClick={() => { if (launchKey) { setStep(4); setCountdown(10); } }}>
                ☢ AUTHORIZE LAUNCH
              </button>
              <button className="btn" style={{ padding: 12 }} onClick={() => setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 4 — Countdown */}
        {step === 4 && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.4s" }}>
            <div style={{ fontSize: 14, color: "#e84b4b", letterSpacing: 4, marginBottom: 16 }}>LAUNCH SEQUENCE INITIATED</div>
            <div style={{ fontSize: 80, color: "#e84b4b", textShadow: "0 0 40px #e84b4b", fontFamily: "Oswald,sans-serif", letterSpacing: 8, marginBottom: 16 }}>{countdown}</div>
            <div style={{ fontSize: 10, color: "#7a4a4a", marginBottom: 20 }}>MINUTEMAN III LAUNCH IN T-{countdown} SECONDS</div>
            <button className="btn btn-red" style={{ fontSize: 12, padding: "12px 32px" }} onClick={() => { setCountdown(null); setAborted(true); }}>
              ⚠ EMERGENCY ABORT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ LIVE TERMINAL WIDGET ═══════════════════════════ */
function LiveTerminal({ logs }) {
  return (
    <div className="panel" style={{ marginTop: 20, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 200, border: "1px solid #1a2a1a" }}>
      <div style={{ background: "#0a1a0a", padding: "4px 12px", borderBottom: "1px solid #1a3a1a", fontSize: 9, color: "#4caf50", letterSpacing: 2 }}>
        ◈ SECURE OP-CENTER FEED
      </div>
      <div style={{ flex: 1, padding: 12, overflowY: "auto", display: "flex", flexDirection: "column-reverse", gap: 6 }}>
        {logs.map((log) => (
          <div key={log.id} style={{ fontSize: 10, fontFamily: "Share Tech Mono, monospace", color: log.type === "error" ? "#e84b4b" : log.type === "success" ? "#4caf50" : "#a8b8a8", display: "flex", gap: 8, animation: "fadeUp 0.3s" }}>
            <span style={{ color: "#3a5a3a" }}>[{log.timestamp}]</span>
            <span style={{ textShadow: log.type === "error" ? "0 0 5px #e84b4bea" : log.type === "success" ? "0 0 5px #4caf50ea" : "none" }}>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════════════════ */
export default function GeneralHQ() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("situation");
  const [general, setGeneral] = useState({
    name: "GENERAL", unit: "delta", xp: 20000, missions: 12, perfectMissions: 5,
    defcon: 4, approval: 72, prestige: 68, budget: 886, forcesDeployed: 142000,
    alliedNations: 18, activeTheatres: 4, medalsAwarded: 0,
    hotZones: HOT_ZONES, deployments: [], eventLog: [],
    awardedTo: {}, coupStatus: "none", presidentialMeetings: 0,
    ownsPMC: false, pmcStats: { name: "Aegis Default", rep: 0, funds: 0 },
    globalStats: { casualties: 0, econDamageTrillions: 0, panicIndex: 10, unStanding: 60 },
    personnelRoster: [
      { id: "p1", name: "Sgt. 1st Class Miller", rank: "E-7", unit: "Delta Force", status: "ACTIVE" },
      { id: "p2", name: "Staff Sgt. Hernandez", rank: "E-6", unit: "75th Rangers", status: "ACTIVE" },
      { id: "p3", name: "Corp. Jackson", rank: "E-4", unit: "1st Marine Div", status: "ACTIVE" },
      { id: "p4", name: "Pvt. Vance", rank: "E-1", unit: "82nd Airborne", status: "DEPLOYED" },
      { id: "p5", name: "Master Sgt. Dubois", rank: "E-8", unit: "5th Special Forces", status: "ACTIVE" }
    ],
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [showNuclear, setShowNuclear] = useState(false);
  const [showAward, setShowAward] = useState(null);
  const [showDeploy, setShowDeploy] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [deployPhase, setDeployPhase] = useState(0);
  const [eventResult, setEventResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const [newsTicker, setNewsTicker] = useState(NEWS_FEED);
  const [coupPhase, setCoupPhase] = useState(0);
  const [pressMsg, setPressMsg] = useState("");
  const [pressResult, setPressResult] = useState(null);
  const [currentPressEvent, setCurrentPressEvent] = useState(null);
  const [pressHistory, setPressHistory] = useState([]);
  const [presidentialMeet, setPresidentialMeet] = useState(null);
  const [potusTrust, setPotusTrust] = useState(70);
  const [militaryLoyalty, setMilitaryLoyalty] = useState(85);
  const [isJunta, setIsJunta] = useState(false);
  const [juntaTicks, setJuntaTicks] = useState(0);
  const [nuclearWinter, setNuclearWinter] = useState(false);

  // NEW: Jail System State
  const [detained, setDetained] = useState([
    { id: "p1", name: "Khalil 'The Ghost' Al-Zawahiri", type: "TERRORIST HVT", status: "INTERROGATION", intelYield: 45 },
    { id: "p2", name: "Sen. Robert Vance", type: "POLITICAL DISSIDENT", status: "SOLITARY", intelYield: 15 },
    { id: "p3", name: "Gen. Viktor Morozov", type: "DEFECTOR / POW", status: "PROCESSING", intelYield: 80 }
  ]);

  // Politician Relationship Network
  const [politicians, setPoliticians] = useState([
    { id: "sec_def", name: "Sec. Mark Ellis", role: "Secretary of Defense", relation: 72, emoji: "🏛", favor: "ALLY", riskyAbility: "Authorize black budget", stance: "PRO-MILITARY" },
    { id: "sec_state", name: "Sec. Rachel Okafor", role: "Secretary of State", relation: 55, emoji: "📜", favor: "NEUTRAL", riskyAbility: "Cover up an operation", stance: "DIPLOMATIC" },
    { id: "sen_hawk", name: "Sen. John Hargrove", role: "Senate Armed Svcs (SASC)", relation: 60, emoji: "⚔️", favor: "ALLY", riskyAbility: "Push military budget up", stance: "HAWK" },
    { id: "sen_dove", name: "Sen. Lisa Hartwell", role: "Senate Finance Chair", relation: 30, emoji: "📉", favor: "HOSTILE", riskyAbility: "Trigger DoD audit", stance: "DOVE" },
    { id: "gov_tex", name: "Gov. Brent Cole", role: "Governor of Texas (NG)", relation: 80, emoji: "🤠", favor: "ALLY", riskyAbility: "Deploy National Guard", stance: "PRO-MILITARY" },
    { id: "cia_dir", name: "Dir. Claudia Vega", role: "CIA Director", relation: 65, emoji: "👁", favor: "ALLY", riskyAbility: "Classify an operation", stance: "INTEL" },
    { id: "fbi_dir", name: "Dir. Frank Hoover", role: "FBI Director", relation: 42, emoji: "🕵️", favor: "NEUTRAL", riskyAbility: "Open an investigation", stance: "LAW" },
    { id: "vp", name: "VP Samuel Morris", role: "Vice President", relation: 68, emoji: "🤝", favor: "ALLY", riskyAbility: "Backdoor POTUS orders", stance: "MODERATE" },
  ]);

  const [banks, setBanks] = useState({ personal: 45000, offshore: 0, slushFund: 5000000 }); // 3 independent accounts
  const [branchBudgets, setBranchBudgets] = useState({ army: 185, navy: 202, airforce: 216, marines: 53, spaceforce: 30 });
  const [heroRoster, setHeroRoster] = useState([]);
  const [baseMorale, setBaseMorale] = useState(50);
  const [purchases, setPurchases] = useState([]);
  const [missions, setMissions] = useState([]);
  const [stateThreats, setStateThreats] = useState([]);
  const [showPotus, setShowPotus] = useState(false);
  const [blackBudget, _setBlackBudget] = useState(0); // Obsolete, replaced by banks.slushFund logic below
  const [inbox, setInbox] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [activeContracts, setActiveContracts] = useState([]);
  const [liveMissions, setLiveMissions] = useState([]);
  const [liveTerminalLog, setLiveTerminalLog] = useState([{ id: 1, text: "SYS // USSOCOM SECURE TERMINAL INITIALIZED...", type: "system", timestamp: new Date().toLocaleTimeString() }]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [econStatus, setEconStatus] = useState({ gdp: 0, unemployment: 0, marketIndex: 100 });
  const [activeLiveMission, setActiveLiveMission] = useState(null);
  const [officerRoster, setOfficerRoster] = useState(INITIAL_OFFICERS);
  const [divisionPurchases, setDivisionPurchases] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null); // For global military power map panel

  const ap = general.approval || 70;
  const pres = general.prestige || 60;
  const def = general.defcon || 4;
  const bankBalance = banks.personal || 0;

  const tick = useTick(1000);

  // Income & Operations tick
  useEffect(() => {
    if (!loaded) return;
    if (tick > 0 && tick % 10 === 0 && !nuclearWinter) {
      setBanks(b => ({ ...b, personal: b.personal + 25000 })); // Salary goes to personal account only
    }

    // Process Contracts
    if (tick > 0 && activeContracts.length > 0 && !nuclearWinter) {
      setActiveContracts(prev => prev.map(c => {
        if (c.progress >= 100) return c;
        const newP = c.progress + (10 + Math.floor(Math.random() * 20));
        if (newP >= 100) {
          const success = Math.random() > c.risk;
          if (success) {
            const pmcPayout = (c.reward.pr * 15000) + 50000;
            setTimeout(() => {
              updateGeneral({ prestige: Math.min(100, (general.prestige || 60) + c.reward.pr), approval: Math.min(100, (general.approval || 70) + c.reward.ap) });
              setBanks(b => ({ ...b, personal: b.personal + pmcPayout }));
              notify(`✓ ${c.name}: SUCCESS — +$${pmcPayout.toLocaleString()} wired offshore`, "#4caf50");
            }, 0);
          } else {
            setTimeout(() => {
              updateGeneral({ prestige: Math.max(0, (general.prestige || 60) - c.penalty.pr), approval: Math.max(0, (general.approval || 70) - c.penalty.ap) });
              notify(`✗ ${c.name}: COMPROMISED — DENY ALL INVOLVEMENT`, "#e84b4b");
            }, 0);
          }
          return { ...c, progress: 100, status: success ? 'SUCCESS' : 'COMPROMISED' };
        }
        return { ...c, progress: newP };
      }));
    }
  }, [tick, loaded, nuclearWinter, activeContracts]);

  // Secure Comms Simulation
  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    if (tick > 0 && tick % 40 === 0 && Math.random() > 0.4) {
      const commsPool = [
        { sender: "CIA Director", subject: "Urgent: Intercepted SIGINT", body: "We have actionable intel on a high-value target in the Sahel but no footprint. We need JSOC assets, completely off the books. This cannot touch official channels. Do you authorize?" },
        { sender: "Gen. Webb", subject: "Backchannel Request — URGENT", body: "General, there's a leak in the Senate Armed Services Committee. They know about the black budget transfer from Q3. My source inside says they plan to subpoena records within 72 hours. We need to move the paper trail — advise immediately." },
        { sender: "MI6 Liaison", subject: "Eyes Only: Operation VORTEX Compromised", body: "One of your deniable assets in Vienna has been burned by BND. German intelligence photographed the handoff. If this reaches the press, both services take damage. We recommend immediate exfil and a cover story coordinated with State. Awaiting your call." },
        { sender: "Mossad Direct", subject: "Off-the-books Meeting — Jerusalem", body: "We have a name: Col. Hamid Rashidi. IRGC Quds Force. He's willing to defect but only to you, personally. No CIA involvement. This could be the best human intelligence asset of the decade. Window: 48 hours. Your call." },
        { sender: "Adm. Torres", subject: "Deniable Assets Required", body: "POTUS is looking weak in the polls ahead of the summit. A decisive covert action right now would change the narrative — we have a target package already prepped for the Sahel. Do we have something ready to go? This stays between us and the NSC principals." },
        { sender: "NSA SIGINT Relay", subject: "Intercept Package: SENATOR COMMUNICATIONS", body: "NSA routine collection has flagged communications between Senator Harrington (SASC Chairman) and a foreign national via encrypted Signal messages. Content suggests he's been briefed on black budget activities by a Pentagon insider. This requires immediate counter-intelligence action. Classification: TS/SCI/ORCON." },
        { sender: "Secret Service Director", subject: "POTUS Protection — Joint Ops Request", body: "We have credible HUMINT indicating a domestic threat against POTUS during the Nevada rally. We need JSOC elements — Delta operators — embedded in the security perimeter. This is an unprecedented request but threat level justifies it. Requires your direct authorization. Time-sensitive." },
        { sender: "Defense Industry Liaison", subject: "Prototype Weapons System — Private Briefing", body: "Lockheed's classified skunkworks division has completed the Mk-IV autonomous hunter-killer prototype. They're offering first-access deployment rights off-ledger for $40B. No GAO oversight, no Congressional notifications. The system would give us a 15-year capability edge. Meeting at your discretion." },
        { sender: "Gen. Okafor", subject: "CLASSIFIED: Unit Status Report", body: "General, Delta Force operational tempo is at 140% of sustainable levels. My men are running on fumes. We've had three near-misses in the last 30 days on black ops — no casualties yet but the luck won't hold. Request authorization to stand down for 30 days or we risk a strategic compromise. Your call." },
        { sender: "CIA Director", subject: "ASSET BRAVO-7 Requesting Extraction", body: "Our deep-cover asset inside the Russian SVR — codename BRAVO-7 — has made contact for the first time in 8 months. She's been burned. Requesting immediate exfil from Moscow via a JSOC team. Window: Saturday. Cost: one diplomatic incident minimum. Authorize?" },
      ];
      const entry = commsPool[Math.floor(Math.random() * commsPool.length)];
      const newEmail = { id: Date.now(), ...entry, read: false, time: new Date().toLocaleTimeString() };
      setInbox(prev => [newEmail, ...prev].slice(0, 15));
      notify(`SECURE INBOX: New message from ${newEmail.sender}`, "#e8b84b");
    }
  }, [tick, loaded, nuclearWinter]);

  // Map Mission Seeder — replenish hot zones periodically so the user can stay active
  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    if (tick > 0 && tick % 60 === 0) {
      const currentHzIds = (general.hotZones || HOT_ZONES).map(z => z.id);
      const available = HOT_ZONES.filter(z => !currentHzIds.includes(z.id));
      if (available.length > 0) {
        const newHz = available[Math.floor(Math.random() * available.length)];
        updateGeneral({ hotZones: [...(general.hotZones || HOT_ZONES), newHz] });
        notify(`NEW INTEL: Escalation in ${newHz.name}. Map updated.`, "#e84b4b");
      }
    }
  }, [tick, loaded, nuclearWinter, general.hotZones]);

  // Live Mission Countdown — tick timers down, apply econ damage on expiry
  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    setLiveMissions(prev => prev.map(m => {
      if (m.resolved || m.timeLeft === null) return m;
      const newTime = m.timeLeft - 1;
      if (newTime <= 0) {
        // Mission expired — apply massive global consequences
        const econDmg = m.econImpact;
        setEconStatus(e => ({
          gdp: +(e.gdp + econDmg.gdpChange).toFixed(1),
          unemployment: +(e.unemployment + econDmg.unemploymentChange).toFixed(1),
          marketIndex: +(e.marketIndex + econDmg.gdpChange * 8).toFixed(1),
        }));

        let cas = Math.floor(Math.random() * 50000) + 10000;
        let pnc = 25;
        let dmg = Math.abs(econDmg.gdpChange) * 2;

        updateGeneral({
          prestige: Math.max(0, (general.prestige || 60) - 15),
          approval: Math.max(0, (general.approval || 70) - 20),
          globalStats: {
            ...general.globalStats,
            casualties: (general.globalStats?.casualties || 0) + cas,
            econDamageTrillions: +((general.globalStats?.econDamageTrillions || 0) + dmg).toFixed(2),
            panicIndex: Math.min(100, (general.globalStats?.panicIndex || 0) + pnc),
            unStanding: Math.max(0, (general.globalStats?.unStanding || 50) - 15)
          }
        });

        setNewsTicker(t => [`BREAKING: CRISIS MISHANDLED — ${m.title} Results in Catastrophe!`, `MARKETS PLUMMET: ${econDmg.label}`, `EST. CASUALTIES: ${cas.toLocaleString()}`, ...t].slice(0, 15));

        notify(`MISSION EXPIRED: ${m.title} — ${econDmg.label} — CASUALTIES: ${cas.toLocaleString()}`, "#e84b4b");
        setCompletedMissions(c => [{ ...m, result: "EXPIRED", completedAt: new Date().toLocaleTimeString() }, ...c]);

        setLiveTerminalLog(l => [{ id: Date.now(), text: `SYS // CRITICAL FAILURE: ${m.title} window closed. Escalating to POTUS.`, type: "error", timestamp: new Date().toLocaleTimeString() }, ...l].slice(0, 30));

        if (activeLiveMission?.id === m.id) setActiveLiveMission(null);
        return { ...m, resolved: true, result: "EXPIRED", timeLeft: 0 };
      }
      return { ...m, timeLeft: newTime };
    }));
  }, [tick, loaded, nuclearWinter, general]);


  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    if (tick > 0 && tick % 30 === 0 && Math.random() > 0.4) {
      const pRoster = general.personnelRoster || [];
      if (pRoster.length === 0) return;

      const soldier = pRoster[Math.floor(Math.random() * pRoster.length)];
      const officer = SUBORDINATE_GENERALS[Math.floor(Math.random() * SUBORDINATE_GENERALS.length)];

      const newEmail = {
        id: Date.now(),
        sender: officer.name,
        subject: `Recommendation: Field Promotion for ${soldier.name}`,
        body: `General, I formally recommend ${soldier.rank} ${soldier.name} of ${soldier.unit} for immediate promotion. Their recent conduct in the field has been exemplary. Proceeding with this will cost you some political capital (Prestige) but will significantly boost unit morale and our overall approval rating. Awaiting your authorization.`,
        actionType: "PROMOTE", soldierId: soldier.id, soldierName: soldier.name, costPR: 5, gainAP: 8,
        read: false,
        time: new Date().toLocaleTimeString()
      };

      setInbox(prev => [newEmail, ...prev].slice(0, 15));
      notify(`SECURE INBOX: Promotion recommendation from ${officer.name}`, "#e8b84b");
    }
  }, [tick, loaded, nuclearWinter, general.personnelRoster]);

  // Random Hero Events
  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    if (tick > 0 && tick % 25 === 0 && Math.random() > 0.5) {
      const names = ["Sgt. Miller", "Cpl. Hernandez", "Pvt. Jackson", "Lt. Vance", "SFC. Dubois", "SSgt. Park", "Cpl. Adeniji", "PFC. Romero"];
      const acts = ["held off an ambush", "rescued a downed pilot", "secured a critical intel cache", "eliminated a high value target", "defended a medical convoy", "intercepted enemy comms", "single-handedly captured an outpost", "provided covering fire for evacuation"];
      const locs = ["Syria", "Somalia", "Yemen", "Afghanistan", "Mali", "Niger", "Ukraine border", "South China Sea"];
      const newHero = { id: Date.now(), name: names[Math.floor(Math.random() * names.length)], action: acts[Math.floor(Math.random() * acts.length)], location: locs[Math.floor(Math.random() * locs.length)], promoted: false };
      setHeroRoster(r => [newHero, ...r].slice(0, 10));
      notify(`Heroic Action: ${newHero.name} ${newHero.action} in ${newHero.location}`, "#ffd700");
    }
  }, [tick, loaded, nuclearWinter]);

  // Generate missions periodically
  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    if (tick > 0 && tick % 35 === 0 && missions.length < 8) {
      const mTypes = [
        { name: "Operation IRON STORM", desc: "Neutralize insurgent weapons depot in northern Syria", branch: "Army", classification: "SECRET", risk: "HIGH", reward: { prestige: 8, approval: 5 }, penalty: { prestige: -5, approval: -8 } },
        { name: "Operation DEEP BLUE", desc: "Track and shadow Russian submarine in Norwegian Sea", branch: "Navy", classification: "TOP SECRET/SCI", risk: "CRITICAL", reward: { prestige: 12, approval: 8 }, penalty: { prestige: -10, approval: -15 } },
        { name: "Operation GHOST HAWK", desc: "Extract CIA asset from hostile territory in Iran", branch: "Air Force", classification: "TOP SECRET", risk: "HIGH", reward: { prestige: 10, approval: 6 }, penalty: { prestige: -8, approval: -12 } },
        { name: "Operation PACIFIC SHIELD", desc: "Escort Philippine resupply vessels through contested waters", branch: "Marines", classification: "UNCLASSIFIED", risk: "MEDIUM", reward: { prestige: 5, approval: 8 }, penalty: { prestige: -3, approval: -5 } },
        { name: "Operation STARWATCH", desc: "Deploy classified satellite to monitor DPRK launch sites", branch: "Space Force", classification: "TOP SECRET/SCI", risk: "LOW", reward: { prestige: 6, approval: 3 }, penalty: { prestige: -2, approval: -3 } },
        { name: "Operation SANDSTORM", desc: "Drone strike on confirmed HVT compound in Yemen", branch: "Air Force", classification: "SECRET", risk: "MEDIUM", reward: { prestige: 7, approval: 4 }, penalty: { prestige: -4, approval: -6 } },
        { name: "Operation COLD FRONT", desc: "Reinforce NATO Eastern flank with rapid deployment brigade", branch: "Army", classification: "UNCLASSIFIED", risk: "LOW", reward: { prestige: 4, approval: 6 }, penalty: { prestige: -2, approval: -3 } },
        { name: "Operation TRIDENT FURY", desc: "Carrier strike group live-fire exercise in Indo-Pacific", branch: "Navy", classification: "UNCLASSIFIED", risk: "MEDIUM", reward: { prestige: 6, approval: 5 }, penalty: { prestige: -3, approval: -4 } },
        { name: "Operation MIDNIGHT SUN", desc: "Covert SIGINT operation against Chinese naval communications", branch: "Navy", classification: "TOP SECRET/SCI", risk: "CRITICAL", reward: { prestige: 15, approval: 10 }, penalty: { prestige: -12, approval: -18 } },
        { name: "Operation SENTINEL", desc: "Counter-narcotics interdiction in Caribbean Sea", branch: "Marines", classification: "SECRET", risk: "LOW", reward: { prestige: 3, approval: 4 }, penalty: { prestige: -1, approval: -2 } },
      ];
      const m = mTypes[Math.floor(Math.random() * mTypes.length)];
      const newMission = { ...m, id: Date.now(), status: "PENDING", progress: 0 };
      setMissions(ms => [newMission, ...ms].slice(0, 8));
      notify(`NEW MISSION: ${m.name}`, m.classification.includes("TOP") ? "#e84b4b" : "#4b9ae8");
    }
  }, [tick, loaded, nuclearWinter]);

  // Progress active missions
  useEffect(() => {
    if (!loaded || nuclearWinter) return;
    setMissions(ms => ms.map(m => {
      if (m.status === "ACTIVE") {
        const newP = m.progress + (5 + Math.floor(Math.random() * 10));
        if (newP >= 100) {
          let riskCutoff = (m.risk === "CRITICAL" ? 0.4 : m.risk === "HIGH" ? 0.25 : 0.1);
          if (baseMorale > 80) riskCutoff = Math.max(0.05, riskCutoff - 0.08); // High morale boost
          if (baseMorale < 30) riskCutoff = Math.min(0.8, riskCutoff + 0.15);  // Low morale penalty
          const success = Math.random() > riskCutoff;

          if (success) {
            setTimeout(() => {
              updateGeneral({ prestige: Math.min(100, (general.prestige || 60) + m.reward.prestige), approval: Math.min(100, (general.approval || 70) + m.reward.approval) });
              notify(`MISSION SUCCESS: ${m.name}`, "#4caf50");
            }, 0);
            return { ...m, status: "SUCCESS", progress: 100 };
          } else {
            setTimeout(() => {
              updateGeneral({ prestige: Math.max(0, (general.prestige || 60) + m.penalty.prestige), approval: Math.max(0, (general.approval || 70) + m.penalty.approval) });
              notify(`MISSION FAILED: ${m.name}`, "#e84b4b");
            }, 0);
            return { ...m, status: "FAILED", progress: 100 };
          }
        }
        return { ...m, progress: newP };
      }
      return m;
    }));
  }, [tick, loaded, nuclearWinter, baseMorale]);

  /* Load/save */
  useEffect(() => {
    loadSave().then(saved => {
      if (saved) { setGeneral(g => ({ ...g, ...saved })); }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeSave(general);
  }, [general, loaded]);

  /* Random events every ~45 seconds of game time */
  useEffect(() => {
    if (!loaded || activeEvent) return;
    if (tick % 45 === 0 && tick > 0) {
      const avgLoyalty = SUBORDINATE_GENERALS.reduce((sum, sg) => sum + Math.min(100, sg.baseLoyalty + ((general.loyaltyDeltas || {})[sg.id] || 0)), 0) / SUBORDINATE_GENERALS.length;
      if (avgLoyalty < 45 && Math.random() > 0.3 && !(general.eventLog || []).includes("e8")) {
        setActiveEvent(GLOBAL_EVENTS.find(e => e.id === "e8"));
        return;
      }
      // Standard random popups disabled as per commander orders.
      // Retaining only the Coup threat mechanic.
    }
  }, [tick, loaded, activeEvent, general.loyaltyDeltas, general.eventLog]);

  function notify(msg, color = "#4caf50") {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 4000);
  }

  function updateGeneral(delta) { setGeneral(g => ({ ...g, ...delta })); }

  function handleEventChoice(evt, choice) {
    const e = choice.effect;
    updateGeneral({
      approval: Math.max(0, Math.min(100, (general.approval || 70) + (e.approval || 0))),
      defcon: Math.max(1, Math.min(5, (general.defcon || 4) + (e.defcon || 0))),
      prestige: Math.max(0, Math.min(100, (general.prestige || 60) + (e.prestige || 0))),
      eventLog: [...(general.eventLog || []), evt.id],
    });
    setEventResult({ outcome: choice.outcome, effect: e });
    setActiveEvent(null);
    notify(`EVENT RESOLVED: ${evt.title.slice(0, 30)}...`);
  }

  // Officer Academy Promotion Logic
  const promoteOfficer = (officer) => {
    const thresh = PROMOTION_THRESHOLDS[officer.rank];
    if (!thresh || (general.prestige || 60) < thresh.cost) {
      notify(`INSUFFICIENT PRESTIGE — NEED ${thresh?.cost || "?"} PR`, "#e84b4b");
      return;
    }

    updateGeneral({ prestige: (general.prestige || 60) - thresh.cost });

    if (thresh.next === "BG") {
      // Graduate to Subordinate General!
      setOfficerRoster(prev => prev.filter(o => o.id !== officer.id));
      const newGen = { id: `gen_${Date.now()}`, name: officer.name.split(",")[0], rank: "BG", unit: officer.unit, distinction: "Field Promoted from Academy", medals: ["Bronze Star"] };
      SUBORDINATE_GENERALS.push(newGen); // Mutate constant list for this session
      notify(`PROMOTION AUTHORIZED: ${officer.name} is now a Brigadier General!`, "#4caf50");
    } else {
      // Standard rank up
      setOfficerRoster(prev => prev.map(o => o.id === officer.id ? { ...o, rank: thresh.next } : o));
      notify(`PROMOTION AUTHORIZED: ${officer.name} promoted to ${thresh.next}`, "#4caf50");
    }
  };

  const buyDivisionUpgrade = (upg) => {
    if (banks.slushFund < upg.cost) {
      notify(`INSUFFICIENT BLACK BUDGET FUNDS`, "#e84b4b");
      return;
    }
    setBanks(b => ({ ...b, slushFund: b.slushFund - upg.cost }));
    setDivisionPurchases(prev => [...prev, upg.id]);
    notify(`EQUIPMENT PROCURED: ${upg.name} field deployment authorized.`, "#4caf50");
    if (upg.name.includes("EXOSKELETON")) updateGeneral({ approval: Math.min(100, (general.approval || 70) + 10) });
    if (upg.name.includes("AI BATTLESPACE")) updateGeneral({ prestige: Math.min(100, (general.prestige || 60) + 15) });
  };

  const resolveMission = (mission, option, officerId = null) => {
    // Determine dynamic casualties and panic based on risk profile and text
    let cas = 0;
    let pnc = 0;
    let dmg = 0;
    let outText = option.outcome.toLowerCase();

    if (option.risk === "WAR" || option.risk === "EXTREME") {
      cas = Math.floor(Math.random() * 5000) + 500;
      pnc = Math.floor(Math.random() * 10) + 5;
      dmg = Number((Math.random() * 0.5).toFixed(2));
    } else if (option.risk === "HIGH") {
      cas = Math.floor(Math.random() * 500) + 50;
      pnc = Math.floor(Math.random() * 5) + 2;
    }

    if (outText.includes("die") || outText.includes("casualty") || outText.includes("wounded")) cas += Math.floor(Math.random() * 100) + 20;
    if (outText.includes("crash") || outText.includes("drop")) dmg += Number((Math.random() * 0.2).toFixed(2));

    // Apply Base Morale effect to casualties
    if (baseMorale > 80) cas = Math.floor(cas * 0.85); // 15% fewer casualties
    if (baseMorale < 30) cas = Math.floor(cas * 1.25); // 25% more casualties

    const isDisaster = option.effect.approval < 0 || option.effect.prestige < 0;

    // 1. Apply Option Effects
    updateGeneral({
      approval: Math.min(100, Math.max(0, (general.approval || 70) + option.effect.approval)),
      prestige: Math.min(100, Math.max(0, (general.prestige || 60) + option.effect.prestige)),
      defcon: Math.min(5, Math.max(1, (general.defcon || 4) + option.effect.defcon)),
      globalStats: {
        ...general.globalStats,
        casualties: (general.globalStats?.casualties || 0) + cas,
        econDamageTrillions: +((general.globalStats?.econDamageTrillions || 0) + dmg).toFixed(2),
        panicIndex: Math.min(100, Math.max(0, (general.globalStats?.panicIndex || 10) + pnc)),
        unStanding: Math.min(100, Math.max(0, (general.globalStats?.unStanding || 50) + (isDisaster ? -10 : 2)))
      }
    });
    setBanks(b => ({ ...b, personal: b.personal + option.effect.bankChange, slushFund: b.slushFund + (mission.classification.includes("TOP SECRET") ? 500000 : 0) }));

    // News Ticker Push
    const newsHeadline = isDisaster ? `CRISIS UPDATE: ${mission.title} Execution Criticized` : `BREAKING: ${mission.title} Successfully Resolved`;
    setNewsTicker(t => [newsHeadline, option.outcome.substring(0, 80) + "...", ...t].slice(0, 15));

    // Terminal Push
    const termMsg = `OP COMPLETE // ${mission.title} [${option.label}] -> Risk: ${option.risk}. CASUALTIES: ${cas}`;
    setLiveTerminalLog(l => [{ id: Date.now(), text: termMsg, type: isDisaster ? "error" : "success", timestamp: new Date().toLocaleTimeString() }, ...l].slice(0, 30));

    // 2. Grant Officer XP if assigned
    let officerMsg = "";
    if (officerId) {
      const xpGain = option.risk === "EXTREME" ? 800 : option.risk === "HIGH" ? 450 : 150;
      setOfficerRoster(prev => prev.map(o => {
        if (o.id === officerId) return { ...o, xp: o.xp + xpGain };
        return o;
      }));
      const officer = officerRoster.find(o => o.id === officerId);
      if (officer) {
        officerMsg = ` — ${officer.rank} ${officer.name} gained ${xpGain} XP for commanding.`;
        setLiveTerminalLog(l => [{ id: Date.now() + 1, text: `PERSONNEL // ${officer.rank} ${officer.name} reports mission accomplished. XP +${xpGain}`, type: "system", timestamp: new Date().toLocaleTimeString() }, ...l].slice(0, 30));
      }
    }

    setLiveMissions(prev => prev.filter(m => m.id !== mission.id));
    setCompletedMissions(prev => [{ ...mission, result: isDisaster ? "MIXED" : "SUCCESS", chosenOption: option.label, casualties: cas, completedAt: new Date().toLocaleTimeString() }, ...prev]);
    setActiveLiveMission(null);
    notify(`MISSION RESOLVED: ${mission.title} ${officerMsg}`, isDisaster ? "#e8b84b" : "#4caf50");
  };

  function deployUnit(unit, zone) {
    let branchBudget = branchBudgets.army;
    if (unit.id === "7thfleet" || unit.id === "seals") branchBudget = branchBudgets.navy;
    else if (unit.id === "b52") branchBudget = branchBudgets.airforce;
    else if (unit.id === "1mar") branchBudget = branchBudgets.marines;

    let failMod = 0;
    if (baseMorale > 80) failMod = -0.15;
    if (baseMorale < 30) failMod = 0.2;
    const baseChanceFail = branchBudget < 120 ? 0.6 : branchBudget < 180 ? 0.3 : 0;
    const chanceFail = Math.max(0, baseChanceFail + failMod);

    if (Math.random() < chanceFail) {
      notify(`${unit.name} DEPLOYMENT FAILED — SUPPLY SHORTAGE OR LOW MORALE`, "#e84b4b");
      updateGeneral({ prestige: Math.max(0, (general.prestige || 60) - 5), approval: Math.max(0, (general.approval || 70) - 2) });
      setShowDeploy(null);
      setSelectedZone(null);
      setDeployPhase(0);
      return;
    }

    const activeMission = {
      id: Date.now(),
      title: `OP: ${zone.name.toUpperCase()} PACIFICATION`,
      body: `Task Force ${unit.abbr} deployed to ${zone.name}. Operation in progress. Expected contact with hostile elements. Guide the operation from the SITUATION QUEUE to ensure success.`,
      timerSeconds: 90,
      timeLeft: 90,
      resolved: false,
      result: null,
      econImpact: { gdpChange: -0.1, label: "Market Instability" },
      options: [
        { label: "Standard Rules of Engagement", risk: "MEDIUM", effect: { approval: +5, prestige: +10 }, outcome: `${unit.name} successfully stabilized the region.` },
        { label: "Aggressive Push (High Risk)", risk: "HIGH", effect: { approval: +10, prestige: +20, bankChange: 25000 }, outcome: `Aggressive tactics secured the zone and seized cartel/insurgent assets.` },
        { label: "Covert Strike (Low Profile)", risk: "LOW", effect: { approval: 0, prestige: +5 }, outcome: `Operation completed quietly. Minimal political fallout.` }
      ]
    };
    setLiveMissions(prev => [...prev, activeMission]);

    const newDep = { unitId: unit.id, unitName: unit.name, zoneName: zone.name, lat: zone.lat, lon: zone.lon, color: zone.color, deployed: new Date().toLocaleDateString() };
    updateGeneral({
      deployments: [...(general.deployments || []), newDep],
      forcesDeployed: (general.forcesDeployed || 140000) + unit.strength,
      activeTheatres: Math.min(8, (general.activeTheatres || 4) + 1),
      prestige: Math.min(100, (general.prestige || 60) + 3),
      hotZones: (general.hotZones || HOT_ZONES).filter(z => z.id !== zone.id) // Clear map marker
    });
    setShowDeploy(null);
    setSelectedZone(null);
    setDeployPhase(0);
    notify(`${unit.name} deployed to ${zone.name}`, unit.id === "delta" ? "#e8b84b" : "#4caf50");
  }

  function awardMedal(gen2, medal) {
    if ((general.prestige || 60) < 5) { notify("Insufficient prestige to award medal", "#e84b4b"); return; }
    const key = gen2.id;
    const existing = general.awardedTo || {};
    const genAwards = existing[key] || [];
    if (genAwards.includes(medal.id)) { notify("Already awarded", "#e84b4b"); return; }
    const existingLoyalty = general.loyaltyDeltas || {};
    updateGeneral({
      awardedTo: { ...existing, [key]: [...genAwards, medal.id] },
      loyaltyDeltas: { ...existingLoyalty, [key]: (existingLoyalty[key] || 0) + 15 },
      medalsAwarded: (general.medalsAwarded || 0) + 1,
      approval: Math.min(100, (general.approval || 70) + 2),
      prestige: Math.max(0, (general.prestige || 60) - 5),
    });
    notify(`${medal.name} awarded to ${gen2.name}. Loyalty +15.`, medal.color);
    setShowAward(null);
  }

  function changeDefcon(d) {
    updateGeneral({ defcon: Math.max(1, Math.min(5, d)) });
    notify(`DEFCON changed to ${d}`, defconColor(d));
  }

  function handleDomesticCoup() {
    if (militaryLoyalty >= 80 && (general.prestige || 60) >= 70) {
      // Successful Coup
      setIsJunta(true);
      setJuntaTicks(7 * 60); // Roughly 7 in-game months (420 ticks)
      setPotusTrust(0);
      updateGeneral({
        approval: 0,
        prestige: 100,
        coupStatus: "dictator",
        globalStats: { ...general.globalStats, panicIndex: 100 }
      });
      notify("COUP SUCCESSFUL. YOU ARE NOW THE SUPREME COMMANDER OF THE UNITED STATES.", "#9b59b6");
      setNewsTicker(t => ["BREAKING: MILITARY SEIZES CONTROL OF WASHINGTON", "PRESIDENT DETAINED AT UNDISCLOSED LOCATION", "MARTIAL LAW DECLARED NATIONWIDE", ...t]);
      setLiveTerminalLog(l => [{ id: Date.now(), text: "SYS // CONTINUITY OF GOVERNMENT SUSPENDED. NATIONAL COMMAND AUTHORITY TRANSFERRED TO JOINT CHIEFS.", type: "error", timestamp: new Date().toLocaleTimeString() }, ...l]);
    } else {
      // Failed Coup
      updateGeneral({ approval: 0, prestige: 0, coupStatus: "failed_coup" });
      notify("COUP FAILED. MILITARY DIVIDED. Secret Service and loyalist elements have secured the Capitol.", "#e84b4b");
      setNewsTicker(t => ["BREAKING: MILITARY COUP ATTEMPT THWARTED IN DC", "ROGUE GENERALS ARRESTED FOR TREASON", ...t]);
    }
  }

  function handleEndJunta() {
    setIsJunta(false);
    setPotusTrust(60);
    updateGeneral({
      approval: 50,
      prestige: 80,
      coupStatus: "shadow_commander",
      globalStats: { ...general.globalStats, panicIndex: Math.max(0, (general.globalStats?.panicIndex || 100) - 50) }
    });
    notify("TRANSITION COMPLETE. Puppet civilian administration installed. You command from the shadows.", "#4caf50");
    setNewsTicker(t => ["BREAKING: MILITARY JUNTA STEPS DOWN. NEW ELECTIONS ANNOUNCED.", "CIVILIAN GOVERNMENT RESTORED, BUT HEAVILY INFLUENCED BY PENTAGON", ...t]);
  }

  // Effect for Junta duration
  useEffect(() => {
    if (!loaded || !isJunta || nuclearWinter) return;
    if (tick > 0 && juntaTicks > 0) {
      setJuntaTicks(t => t - 1);
      if (tick % 5 === 0) {
        // Drain money, passive damage to economy
        setEconStatus(e => ({ ...e, gdp: +(e.gdp - 0.2).toFixed(1), marketIndex: +(e.marketIndex - 1.5).toFixed(1) }));
      }
    } else if (tick > 0 && juntaTicks === 0 && isJunta) {
      handleEndJunta();
    }
  }, [tick, loaded, isJunta, juntaTicks, nuclearWinter]);

  function initPressBriefing() {
    if (activeLiveMission && !currentPressEvent) {
      setCurrentPressEvent({
        topic: `We're hearing reports about ${activeLiveMission.title}. What is the Pentagon's official stance?`,
        context: "A live crisis is unfolding. Careful.",
        options: [
          { label: "Aggressive", text: "We will use overwhelming force.", apD: -5, presD: +8 },
          { label: "Defensive", text: "We are protecting our interests.", apD: +4, presD: -2 },
          { label: "Deflective", text: "I cannot comment on ongoing ops.", apD: -2, presD: -5 }
        ]
      });
      return;
    }

    const topics = [
      {
        topic: "General, there are rumors of a black budget slush fund. Your comment?",
        context: "Follow-up investigative report by the NYT.",
        options: [
          { label: "Aggressive", text: "That is a baseless conspiracy theory.", apD: -2, presD: +5 },
          { label: "Defensive", text: "All funds are audited by Congress.", apD: +5, presD: -2 },
          { label: "Deflective", text: "I do not discuss classified budgets.", apD: 0, presD: 0 }
        ]
      },
      {
        topic: "How do you respond to allies saying America is stepping back from the world stage?",
        context: "Recent NATO summit friction.",
        options: [
          { label: "Aggressive", text: "We lead. They need to pay their fair share.", apD: +8, presD: -5 },
          { label: "Defensive", text: "Our commitment to allies remains ironclad.", apD: +2, presD: +4 },
          { label: "Deflective", text: "We re-evaluate posture continually.", apD: -2, presD: -2 }
        ]
      },
      {
        topic: "General, is a military conflict with China inevitable in this decade?",
        context: "Rising tensions in the South China Sea.",
        options: [
          { label: "Aggressive", text: "If they want a fight, we are ready tonight.", apD: -8, presD: +12 },
          { label: "Defensive", text: "We seek competition, not conflict.", apD: +6, presD: -3 },
          { label: "Deflective", text: "Our job is deterrence, not prediction.", apD: +4, presD: +2 }
        ]
      }
    ];
    setCurrentPressEvent(topics[Math.floor(Math.random() * topics.length)]);
    setPressResult(null);
  }

  function handlePressQA(option) {
    updateGeneral({
      approval: Math.max(0, Math.min(100, (general.approval || 70) + option.apD)),
      prestige: Math.max(0, Math.min(100, (general.prestige || 60) + option.presD))
    });

    let res = `You answered: "${option.text}" \nResult: Approval ${option.apD > 0 ? "+" : ""}${option.apD}, Prestige ${option.presD > 0 ? "+" : ""}${option.presD}`;
    setPressResult(res);
    setPressHistory(h => [{ q: currentPressEvent.topic, a: option.text, res }, ...h].slice(0, 5));
    setCurrentPressEvent(null);
    notify("Press briefing completed");
  }

  function meetPresident(stance) {
    if (isJunta) {
      notify("YOU ARE THE JUNTA. There is no President to meet.", "#9b59b6");
      return;
    }

    const outcomes = {
      "golf": { ptD: +15, apD: -2, presD: +5, msg: "18 holes at Mar-a-Lago. POTUS is relaxed. 'You're one of the good ones, General.' Trust increased significantly, but media criticizes the cronyism." },
      "dinner": { ptD: +10, apD: +2, presD: +2, msg: "Private dinner at the White House. You shared tactical insights. POTUS values your counsel." },
      "endorse": { ptD: +5, apD: +10, presD: -5, msg: "You publicly endorsed the administration's military policy. Approval spikes, but your peers view you as a political hack." },
      "leak": { ptD: -20, apD: -5, presD: +10, msg: "You leaked classified pushback to the press. The administration looks weak. POTUS is furious, but the Pentagon respects your hardline stance." },
      "disobey": { ptD: -30, apD: +5, presD: +15, msg: "You outright ignored a direct executive order regarding troop withdrawal. POTUS is threatening to fire you. The military stands behind you." }
    };
    const o = outcomes[stance];

    setPotusTrust(t => Math.max(0, Math.min(100, t + o.ptD)));
    updateGeneral({
      approval: Math.max(0, Math.min(100, (general.approval || 70) + o.apD)),
      prestige: Math.max(0, Math.min(100, (general.prestige || 60) + o.presD)),
      presidentialMeetings: (general.presidentialMeetings || 0) + 1
    });
    setPresidentialMeet({ msg: o.msg, ptD: o.ptD, apD: o.apD });
  }

  if (!loaded) return (
    <>
      <style>{CSS}</style>
      <div className="root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#ffd700", letterSpacing: 4, marginBottom: 12 }}>LOADING COMMAND CENTER...</div>
          <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 2 }}>RETRIEVING CLASSIFIED DATA</div>
        </div>
      </div>
    </>
  );

  if (nuclearWinter) return (
    <>
      <style>{CSS}</style>
      <div className="root" style={{ background: "#050000", position: "relative" }}>
        <div className="crt-lines" />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99, background: "repeating-linear-gradient(0deg, #111, #111 2px, transparent 2px, transparent 4px)", opacity: 0.15, animation: "blink 0.1s infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 120, color: "#440000", textShadow: "0 0 40px #ff0000", marginBottom: 20, animation: "redPulse 3s infinite" }}>☢</div>
          <div style={{ fontSize: 32, fontFamily: "Oswald,sans-serif", color: "#ff3333", letterSpacing: 10, marginBottom: 16 }}>POST-EXCHANGE ASSESSMENT</div>
          <div style={{ maxWidth: 600, background: "#110000", border: "1px solid #330000", padding: 30 }}>
            <div style={{ fontSize: 12, color: "#aa5555", lineHeight: 2, marginBottom: 20 }}>
              SIOP Alpha execution confirmed. 300kt W87-1 yield delivered. <br />
              Retaliatory strikes detected across North America and Europe. <br />
              Estimated casualties: 850,000,000. <br />
              Command authority lost. Continuity of Government has failed.
            </div>
            <div style={{ fontSize: 16, color: "#ff6666", letterSpacing: 4, animation: "blink 2s infinite" }}>END OF SIMULATION</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="root">
        <div className="crt-lines" />
        <div className="scanline-sweep" />

        {/* FALLING STARS */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: `${(i * 7.3) % 100}%`, color: "#ffd70022", fontSize: 10 + i % 8, animation: `starDrop ${5 + i % 6}s linear ${i * 0.7}s infinite` }}>★</div>
          ))}
        </div>

        {/* NOTIFICATIONS */}
        {notification && (
          <div style={{ position: "fixed", top: 60, right: 16, zIndex: 4000, background: "#050d05", border: `1px solid ${notification.color}`, padding: "10px 18px", fontSize: 10, color: notification.color, letterSpacing: 2, animation: "fadeUp 0.3s", boxShadow: `0 0 12px ${notification.color}44` }}>
            {notification.msg}
          </div>
        )}

        {/* NUCLEAR LAUNCH */}
        {showNuclear && <NuclearLaunch defcon={def} onClose={() => setShowNuclear(false)} onLaunch={() => { setNuclearWinter(true); }} />}

        {/* INCOMING EVENT MODAL */}
        {activeEvent && !eventResult && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
            <div className={`panel-gold ${activeEvent.urgency === "CRITICAL" ? "shake-intense" : ""}`} style={{ maxWidth: 620, width: "95%", padding: 28, border: `2px solid ${activeEvent.type === "NUCLEAR" ? "#e84b4b" : activeEvent.type === "COUP" ? "#9b59b6" : "#3a3000"}`, animation: activeEvent.urgency === "CRITICAL" ? "none" : "fadeUp 0.4s" }}>
              <Corners color={activeEvent.type === "NUCLEAR" ? "#e84b4b" : "#ffd700"} />
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 8, background: activeEvent.urgency === "CRITICAL" ? "#1a0000" : "#1a1000", border: `1px solid ${activeEvent.urgency === "CRITICAL" ? "#e84b4b" : "#e8b84b"}`, color: activeEvent.urgency === "CRITICAL" ? "#e84b4b" : "#e8b84b", padding: "2px 8px", letterSpacing: 3 }}>{activeEvent.urgency}</div>
                <div style={{ fontSize: 8, color: "#5a5a3a", letterSpacing: 2 }}>{activeEvent.type}</div>
              </div>
              <div className={`glow-gold ${activeEvent.type === "NUCLEAR" ? "glitch-text" : ""}`} data-text={activeEvent.title} style={{ fontFamily: "Oswald,sans-serif", fontSize: 16, letterSpacing: 4, marginBottom: 16 }}>{activeEvent.title}</div>
              <div style={{ background: "#050a05", border: "1px solid #1a2a1a", padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 3, marginBottom: 8 }}>◈ INCOMING INTELLIGENCE</div>
                <div style={{ fontSize: 11, color: "#8aaa7a", lineHeight: 2 }}>
                  <TW text={activeEvent.body} speed={14} />
                </div>
              </div>
              <div style={{ fontSize: 9, color: "#5a5a3a", letterSpacing: 3, marginBottom: 12 }}>YOUR ORDERS, GENERAL:</div>
              {activeEvent.options.map((opt, i) => (
                <div key={i} className="choice-card" style={{ marginBottom: 8, borderColor: "#2a2a00" }} onClick={() => handleEventChoice(activeEvent, opt)}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 36, height: 36, border: "1px solid #3a3000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#ffd700", flexShrink: 0 }}>{["I", "II", "III"][i]}</div>
                    <div>
                      <div style={{ fontSize: 10, color: "#c8b870", letterSpacing: 2, marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ fontSize: 8, color: opt.effect.approval > 0 ? "#4caf50" : "#e84b4b" }}>APPROVAL {opt.effect.approval > 0 ? "+" : ""}{opt.effect.approval}</div>
                        {opt.effect.defcon !== 0 && <div style={{ fontSize: 8, color: "#e8b84b" }}>DEFCON {opt.effect.defcon < 0 ? "↑" : "↓"}</div>}
                        <div style={{ fontSize: 8, color: opt.effect.prestige > 0 ? "#4caf50" : "#e84b4b" }}>PRESTIGE {opt.effect.prestige > 0 ? "+" : ""}{opt.effect.prestige}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENT RESULT */}
        {eventResult && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="panel" style={{ maxWidth: 560, width: "95%", padding: 28, border: "1px solid #2a4a2a" }}>
              <Corners />
              <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>SITUATION RESOLVED</div>
              <div style={{ fontSize: 12, color: "#8aaa7a", lineHeight: 2, marginBottom: 20 }}><TW text={eventResult.outcome} speed={16} /></div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {Object.entries(eventResult.effect).filter(([k, v]) => v !== 0).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 10, color: v > 0 ? "#4caf50" : "#e84b4b", letterSpacing: 2 }}>{k.toUpperCase()} {v > 0 ? "+" : ""}{v}</div>
                ))}
              </div>
              <button className="btn" onClick={() => setEventResult(null)}>► CONTINUE</button>
            </div>
          </div>
        )}

        {/* AWARD MEDAL MODAL */}
        {showAward && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="panel-gold" style={{ maxWidth: 600, width: "95%", padding: 28, border: "1px solid #3a3000" }}>
              <Corners color="#ffd700" />
              <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 4, marginBottom: 8 }}>AWARDS & DECORATIONS</div>
              <div className="glow-gold" style={{ fontSize: 16, fontFamily: "Oswald,sans-serif", letterSpacing: 4, marginBottom: 20 }}>AWARD MEDAL TO {showAward.name.toUpperCase()}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {MEDAL_LIST.map(m => {
                  const already = (general.awardedTo || {})[showAward.id]?.includes(m.id);
                  return (
                    <div key={m.id} onClick={() => !already && awardMedal(showAward, m)} style={{ ...{ cursor: already ? "not-allowed" : "pointer", opacity: already ? 0.4 : 1, background: "#080e08", border: `1px solid ${already ? m.color + "33" : m.color + "55"}`, padding: 12, display: "flex", gap: 10, alignItems: "center", transition: "all 0.2s" } }}>
                      <div style={{ fontSize: 24, color: m.color, textShadow: `0 0 8px ${m.color}88` }}>{m.icon}</div>
                      <div>
                        <div style={{ fontSize: 10, color: m.color }}>{m.name}</div>
                        <div style={{ fontSize: 8, color: "#4a5a4a" }}>{m.desc}</div>
                        {already && <div style={{ fontSize: 8, color: "#3a5a3a" }}>✓ ALREADY AWARDED</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="btn" onClick={() => setShowAward(null)}>← BACK</button>
            </div>
          </div>
        )}

        {/* DEPLOY MODAL / THEATRE BRIEFING */}
        {showDeploy && selectedZone && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div className="panel" style={{ maxWidth: 650, width: "95%", padding: "32px 40px", border: "1px solid #2a4a2a", boxShadow: "0 0 40px #051505", display: "flex", flexDirection: "column" }}>
              <Corners />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#3a5a3a", letterSpacing: 4, marginBottom: 8, fontFamily: "'Share Tech Mono', monospace" }}>TACTICAL THEATRE BRIEFING // TOP SECRET</div>
                  <div style={{ fontSize: 24, color: "#c8ffc8", letterSpacing: 6, fontWeight: "bold", fontFamily: "'Oswald', sans-serif", textShadow: "0 0 10px #4caf50aa" }}>{selectedZone.name.toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: "#5a7a5a", marginTop: 4 }}>COORDINATES: {selectedZone.lat.toFixed(2)}°N, {selectedZone.lon.toFixed(2)}°E</div>
                </div>
                <div style={{ textAlign: "right", borderLeft: "2px solid #1a3a1a", paddingLeft: 16 }}>
                  <div style={{ fontSize: 9, color: "#4a6a4a", letterSpacing: 2 }}>THREAT ASSESSMENT</div>
                  <div style={{ fontSize: 18, color: selectedZone.color, fontWeight: "bold", letterSpacing: 2, textShadow: `0 0 15px ${selectedZone.color}88` }}>{selectedZone.threat}</div>
                </div>
              </div>

              <div style={{ height: 1, background: "linear-gradient(90deg, #4caf50, transparent)", marginBottom: 20 }} />

              {deployPhase === 0 ? (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
                    <div style={{ flex: 1, background: "#050d05", border: "1px solid #1a2a1a", padding: 16, position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: selectedZone.color }} />
                      <div style={{ fontSize: 9, color: "#5a7a5a", marginBottom: 8, letterSpacing: 1 }}>SITUATIONAL INTEL</div>
                      <div style={{ fontSize: 12, color: "#c8ffc8", lineHeight: 1.6 }}><TW text={selectedZone.description} speed={10} /></div>
                    </div>
                    <div style={{ width: 180, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ background: "#050d05", border: "1px solid #1a2a1a", padding: 12 }}>
                        <div style={{ fontSize: 8, color: "#4a6a4a" }}>US FORCES IN THEATRE</div>
                        <div style={{ fontSize: 16, color: "#4caf50", marginTop: 4 }}>{selectedZone.troops.toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#050d05", border: "1px solid #1a2a1a", padding: 12 }}>
                        <div style={{ fontSize: 8, color: "#4a6a4a" }}>EST. ADVERSARY COMBATANTS</div>
                        <div style={{ fontSize: 16, color: selectedZone.color, marginTop: 4 }}>{Math.floor(selectedZone.troops * (Math.random() * 1.5 + 0.5) + (selectedZone.threat === 'HIGH' ? 50000 : 5000)).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#020802", border: "1px dashed #2a4a2a", padding: 16, marginBottom: 24, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#5a7a5a", marginBottom: 8 }}>SATELLITE IMAGERY UPLINK // NRO KH-11</div>
                    <div style={{ color: "#2a4a2a", fontSize: 10, letterSpacing: 4, fontFamily: "monospace" }}>[ ENCRYPTED FEED ESTABLISHED ]</div>
                    <div style={{ color: "#3a5a3a", fontSize: 8, marginTop: 4, animation: "pulse 2s infinite" }}>AWAITING COMMAND AUTHORITY TO COMMENCE OPS</div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn" style={{ flex: 1, fontSize: 12, padding: 14, background: "#0a1f0a", borderColor: "#4caf50", color: "#c8ffc8" }} onClick={() => setDeployPhase(1)}>AUTHORIZE TASK FORCE DEPLOYMENT ➔</button>
                    <button className="btn" style={{ padding: "14px 24px" }} onClick={() => { setShowDeploy(false); setSelectedZone(null); }}>CANCEL</button>
                  </div>
                </div>
              ) : (
                <div style={{ animation: "fadeUp 0.3s" }}>
                  <div style={{ fontSize: 10, color: "#e8b84b", marginBottom: 12, letterSpacing: 2 }}>SELECT UNIT FOR DEPLOYMENT</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
                    {UNITS.map(u => {
                      let bb = branchBudgets.army;
                      if (u.id === "7thfleet" || u.id === "seals") bb = branchBudgets.navy;
                      else if (u.id === "b52") bb = branchBudgets.airforce;
                      else if (u.id === "1mar") bb = branchBudgets.marines;
                      const isReady = bb >= 180;
                      return (
                        <div key={u.id} className="choice-card" onClick={() => { deployUnit(u, selectedZone); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderColor: isReady ? "#1a3a1a" : "#e84b4b55" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ fontSize: 20, width: 30, textAlign: "center", textShadow: `0 0 10px ${isReady ? '#4caf50' : '#e84b4b'}` }}>{u.icon}</div>
                            <div>
                              <div style={{ fontSize: 12, color: isReady ? "#c8ffc8" : "#e84b4b", letterSpacing: 2 }}>{u.name} {isReady ? "" : "⚠"}</div>
                              <div style={{ fontSize: 9, color: "#4a6a4a", marginTop: 2 }}>{u.abbr} · {u.specialty}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: isReady ? "#4caf50" : "#e8b84b" }}>{isReady ? u.strength.toLocaleString() + " forces" : "SUPPLY SHORTAGE"}</div>
                            <div style={{ fontSize: 8, color: "#3a5a3a", marginTop: 2 }}>BASE: {u.theater.toUpperCase()}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn" style={{ padding: "10px 24px" }} onClick={() => setDeployPhase(0)}>← BACK TO BRIEFING</button>
                    <button className="btn btn-red" style={{ padding: "10px 24px" }} onClick={() => { setShowDeploy(false); setSelectedZone(null); setDeployPhase(0); }}>ABORT DEPLOYMENT</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRESIDENTIAL MEETING RESULT */}
        {presidentialMeet && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="panel-gold" style={{ maxWidth: 520, width: "95%", padding: 28, border: "1px solid #3a3000" }}>
              <Corners color="#ffd700" />
              <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 4, marginBottom: 12 }}>OVAL OFFICE — PRESIDENTIAL MEETING</div>
              <div style={{ fontSize: 11, color: "#c8b870", lineHeight: 2, marginBottom: 16 }}><TW text={presidentialMeet.msg} speed={16} /></div>
              <div style={{ fontSize: 10, color: presidentialMeet.apD > 0 ? "#4caf50" : "#e84b4b", marginBottom: 20 }}>PRESIDENTIAL APPROVAL: {presidentialMeet.apD > 0 ? "+" : ""}{presidentialMeet.apD}</div>
              <button className="btn btn-gold" onClick={() => setPresidentialMeet(null)}>► RETURN TO COMMAND</button>
            </div>
          </div>
        )}

        {/* ═══ MAIN LAYOUT ═══ */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* TOP COMMAND BAR */}
          <div className="panel-gold" style={{ padding: "0", borderBottom: "1px solid #3a3000", borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", flexWrap: "wrap", gap: 8 }}>
              {/* Rank & Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4 }}>{Array.from({ length: 4 }).map((_, i) => <span key={i} className="glow-gold" style={{ fontSize: 14 }}>★</span>)}</div>
                <div>
                  <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 18, letterSpacing: 6 }} className="glow-gold">GEN. {general.name}</div>
                  <div style={{ fontSize: 8, color: "#5a5a3a", letterSpacing: 3 }}>SUPREME ALLIED COMMANDER · USSOCOM</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>{Array.from({ length: 4 }).map((_, i) => <span key={i} className="glow-gold" style={{ fontSize: 14 }}>★</span>)}</div>
              </div>

              {/* Vital stats */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: approvalColor(ap), fontFamily: "Oswald,sans-serif" }}>{ap}%</div>
                  <div style={{ fontSize: 7, color: "#5a5a3a", letterSpacing: 1 }}>POTUS APPROVAL</div>
                  <div style={{ fontSize: 7, color: approvalColor(ap) }}>{approvalLabel(ap)}</div>
                </div>
                <div style={{ width: 1, height: 40, background: "#2a2a00" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: defconColor(def), fontFamily: "Oswald,sans-serif" }}>{def}</div>
                  <div style={{ fontSize: 7, color: "#5a5a3a", letterSpacing: 1 }}>DEFCON</div>
                </div>
                <div style={{ width: 1, height: 40, background: "#2a2a00" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: "#4b9ae8", fontFamily: "Oswald,sans-serif" }}>{pres}</div>
                  <div style={{ fontSize: 7, color: "#5a5a3a", letterSpacing: 1 }}>PRESTIGE</div>
                  <div style={{ fontSize: 7, color: "#4b9ae8" }}>{prestigeLabel(pres)}</div>
                </div>
                <div style={{ width: 1, height: 40, background: "#2a2a00" }} />

                {/* NEW GLOBAL STATS */}
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <div className={general.globalStats?.casualties > 0 ? "glow-red" : ""} style={{ fontSize: 16, color: general.globalStats?.casualties > 0 ? "#e84b4b" : "#5a5a3a", fontFamily: "Oswald,sans-serif" }}>
                    {general.globalStats?.casualties > 0 ? (general.globalStats.casualties).toLocaleString() : "0"}
                  </div>
                  <div style={{ fontSize: 7, color: "#5a5a3a", letterSpacing: 1 }}>CASUALTIES</div>
                </div>
                <div style={{ width: 1, height: 40, background: "#2a2a00" }} />

                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <div className={general.globalStats?.econDamageTrillions > 0 ? "glow-red" : ""} style={{ fontSize: 16, color: general.globalStats?.econDamageTrillions > 0 ? "#e84b4b" : "#5a5a3a", fontFamily: "Oswald,sans-serif" }}>
                    {general.globalStats?.econDamageTrillions > 0 ? `-$${general.globalStats.econDamageTrillions}T` : "$0"}
                  </div>
                  <div style={{ fontSize: 7, color: "#5a5a3a", letterSpacing: 1 }}>ECON DAMAGE</div>
                </div>
                <div style={{ width: 1, height: 40, background: "#2a2a00" }} />

                <div style={{ textAlign: "center", minWidth: 50 }}>
                  <div className={general.globalStats?.panicIndex > 50 ? "glow-red" : ""} style={{ fontSize: 16, color: general.globalStats?.panicIndex > 50 ? "#e84b4b" : "#e8b84b", fontFamily: "Oswald,sans-serif" }}>
                    {general.globalStats?.panicIndex || 0}%
                  </div>
                  <div style={{ fontSize: 7, color: "#5a5a3a", letterSpacing: 1 }}>GLOBAL PANIC</div>
                </div>
                <div style={{ width: 1, height: 40, background: "#2a2a00" }} />

                {/* Nuclear button */}
                <button className="btn btn-red" style={{ padding: "8px 14px", fontSize: 10, letterSpacing: 2, animation: def <= 2 ? "redPulse 1.5s infinite" : undefined }} onClick={() => setShowNuclear(true)}>
                  ☢ NUCLEAR
                </button>
              </div>
            </div>
          </div>

          {/* NEWS TICKER */}
          <NewsTicker items={newsTicker} />

          {/* TABS */}
          <div style={{ background: "#050a05", borderBottom: "1px solid #1a2a1a", padding: "0 16px", display: "flex", flexWrap: "wrap", gap: 0 }}>
            {[
              { id: "situation", label: "🌍 NMCC" },
              { id: "forces", label: "⚡ FORCE COMMAND" },
              { id: "budget", label: "💰 JOINT STAFF BUDGET" },
              { id: "personnel", label: "🎖 PERSONNEL COMMAND" },
              { id: "intel", label: "🔍 GLOBAL INTEL" },
              { id: "awards", label: "🏅 AWARDS" },
              { id: "politics", label: "🏛 POLITICS" },
              { id: "coup", label: "⚠ COUPS & THREATS" },
              { id: "missions", label: "🎯 MISSIONS" },
              { id: "shadow", label: "🦅 SHADOW OPS" },
              { id: "cia", label: "🕵 CIA INTEL GRID" },
              { id: "secretservice", label: "🛡 SECRET SERVICE" },
              { id: "armory", label: "📦 DIVISION ARMORY" },
              { id: "academy", label: "🎓 OFFICER ACADEMY" },
              { id: "quarters", label: "🥃 GENERAL'S QUARTERS" },
              { id: "press", label: "🎙️ PRESS BRIEFING" },
              { id: "cyber", label: "🖥 CYBER WARFARE" },
              { id: "markets", label: "📈 GLOBAL MARKETS" },
            ].map(t => (
              <button key={t.id} className={`tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>

            {/* ══ SITUATION ROOM ══ */}
            {tab === "situation" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "FORCES DEPLOYED", val: (general.forcesDeployed || 142000).toLocaleString(), color: "#4b9ae8", sub: "across 4 theatres" },
                    { label: "ALLIED NATIONS", val: general.alliedNations || 18, color: "#4caf50", sub: "active partnerships" },
                    { label: "BUDGET AUTHORITY", val: `$${general.budget || 886}B`, color: "#ffd700", sub: "FY2024 allocation" },
                    { label: "ACTIVE HOT ZONES", val: (general.hotZones || HOT_ZONES).length, color: "#e84b4b", sub: "requiring attention" },
                  ].map(s => (
                    <div key={s.label} className="panel" style={{ padding: 14, textAlign: "center", border: "1px solid #1a2a1a" }}>
                      <div style={{ fontSize: 26, color: s.color, fontFamily: "Oswald,sans-serif", textShadow: `0 0 10px ${s.color}66` }}>{s.val}</div>
                      <div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 7, color: "#2a3a2a", marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* DEFCON Control */}
                <div className="panel-gold" style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 4, marginBottom: 8 }}>◈ DEFCON STATUS — DIRECT AUTHORITY</div>
                      <DefconDisplay defcon={def} />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-gold" onClick={() => changeDefcon(def - 1)} disabled={def <= 1}>↑ ELEVATE</button>
                      <button className="btn" onClick={() => changeDefcon(def + 1)} disabled={def >= 5}>↓ REDUCE</button>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4 }}>◈ GLOBAL TACTICAL BOARD — {(general.hotZones || HOT_ZONES).length} HOT ZONES · {liveMissions.filter(m => !m.resolved).length} ACTIVE CRISES</div>
                    {liveMissions.filter(m => !m.resolved).length > 0 && (
                      <div style={{ fontSize: 8, color: "#e84b4b", animation: "pulse 1s infinite", letterSpacing: 2 }}>⚡ LIVE CRISES ACTIVE — GO TO MISSIONS TAB</div>
                    )}
                  </div>
                  <TacticalBoard
                    zones={general.hotZones || HOT_ZONES}
                    deployments={general.deployments || []}
                    liveMissions={liveMissions.filter(m => !m.resolved)}
                    onZoneClick={(z) => { setSelectedZone(z); setDeployPhase(0); setShowDeploy(true); }}
                    onMissionClick={(m) => { setActiveLiveMission(m); setTab("missions"); }}
                  />
                  <div style={{ fontSize: 8, color: "#2a4a2a", marginTop: 6 }}>CLICK ⚠ HOT ZONE TO DEPLOY · CLICK ⚡ CRISIS MARKER TO RESPOND · PLACE TACTICAL PINS USING TOOLBAR</div>
                </div>

                {/* Deployments */}
                {(general.deployments || []).length > 0 && (
                  <div className="panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ ACTIVE DEPLOYMENTS — {(general.deployments || []).length} UNITS IN FIELD</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                      {(general.deployments || []).map((d, i) => (
                        <div key={i} style={{ background: "#050d05", border: "1px solid #1a3a1a", padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 2 }}>{d.unitName}</div>
                          <div style={{ fontSize: 8, color: "#3a5a3a" }}>📍 {d.zoneName}</div>
                          <div style={{ fontSize: 7, color: "#2a4a2a", marginTop: 2 }}>DEPLOYED: {d.deployed}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ FORCE COMMAND ══ */}
            {tab === "forces" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 14 }}>◈ COMMAND AUTHORITY — ALL SPECIAL OPERATIONS FORCES</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10, marginBottom: 20 }}>
                  {UNITS.map(u => {
                    let branchBudget = branchBudgets.army;
                    if (u.id === "7thfleet" || u.id === "seals") branchBudget = branchBudgets.navy;
                    else if (u.id === "b52") branchBudget = branchBudgets.airforce;
                    else if (u.id === "1mar") branchBudget = branchBudgets.marines;

                    const readiness = branchBudget < 120 ? { status: "CRITICAL SHORTAGE", color: "#e84b4b", pct: 30 } :
                      branchBudget < 180 ? { status: "SUPPLY SHORTAGE", color: "#e8b84b", pct: 60 } :
                        { status: "COMBAT READY", color: "#4caf50", pct: 85 + Math.random() * 15 };

                    return (
                      <div key={u.id} className="panel" style={{ padding: 18, border: `1px solid ${readiness.color}44` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ fontSize: 26, color: readiness.color }}>{u.icon}</div>
                            <div>
                              <div style={{ fontSize: 12, color: "#c8ffc8", letterSpacing: 2 }}>{u.name}</div>
                              <div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 2 }}>{u.abbr}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 8, background: "#0a1a0a", border: "1px solid #1a3a1a", padding: "3px 8px", color: "#4a7a4a" }}>{u.theater}</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: "#4caf50", marginBottom: 2 }}>{u.strength.toLocaleString()} personnel</div>
                          <div style={{ fontSize: 9, color: "#4a6a4a" }}>{u.specialty}</div>
                        </div>
                        {/* Readiness bar */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#3a5a3a", marginBottom: 4 }}>
                            <span>READINESS</span><span style={{ color: readiness.color }}>{readiness.status}</span>
                          </div>
                          <div style={{ height: 3, background: "#0d1a0d", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${readiness.pct}%`, background: readiness.color, borderRadius: 2, transition: "width 0.5s" }} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn" style={{ flex: 1, fontSize: 9, padding: "6px 8px" }} onClick={() => { if (general.hotZones?.length) { setSelectedZone(general.hotZones[0]); setDeployPhase(0); setShowDeploy(true); } }}>
                            ⚡ DEPLOY
                          </button>
                          <button className="btn btn-gold" style={{ flex: 1, fontSize: 9, padding: "6px 8px" }} onClick={() => notify(`${u.name} status: ${readiness.status}`)}>
                            📋 BRIEF
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Subordinate Generals */}
                <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ SUBORDINATE COMMANDERS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SUBORDINATE_GENERALS.map(sg => {
                    const loyalty = Math.min(100, sg.baseLoyalty + ((general.loyaltyDeltas || {})[sg.id] || 0));
                    return (
                      <div key={sg.id} className="panel" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "stretch", width: "100%", maxWidth: 360 }}>
                          <div style={{ width: 44, height: 44, border: "1px solid #2a4a2a", background: "#050d05", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#4caf50", fontFamily: "Oswald,sans-serif", alignSelf: "center" }}>{sg.rank}</div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontSize: 12, color: "#c8ffc8", letterSpacing: 2 }}>{sg.name}</div>
                              <div style={{ fontSize: 9, color: "#3a5a3a" }}>{sg.unit} · {sg.faction}</div>
                              <div style={{ fontSize: 8, color: "#2a4a2a", marginTop: 3, fontStyle: "italic" }}>{sg.distinction} · {sg.trait}</div>
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: loyalty < 45 ? "#e84b4b" : "#4caf50", marginBottom: 2 }}>
                                <span>LOYALTY</span><span>{loyalty}%</span>
                              </div>
                              <div style={{ height: 3, background: "#1a2a1a" }}>
                                <div style={{ height: "100%", width: `${loyalty}%`, background: loyalty < 45 ? "#e84b4b" : loyalty < 60 ? "#e8b84b" : "#4caf50", transition: "width 0.5s" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", flexDirection: "column", flexShrink: 0 }}>
                          <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                            {((general.awardedTo || {})[sg.id] || [...sg.medals]).map((m, i) => {
                              const medal = MEDAL_LIST.find(ml => ml.id === m.toLowerCase()) || MEDAL_LIST[i % MEDAL_LIST.length];
                              return <div key={i} title={m} style={{ width: 14, height: 9, background: medal?.color + "99", border: `1px solid ${medal?.color || "#3a3a3a"}` }} />;
                            })}
                          </div>
                          <button className="btn btn-gold" style={{ fontSize: 9, padding: "5px 12px" }} onClick={() => setShowAward(sg)}>🏅 AWARD (5 PR)</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ OFFICER ACADEMY ══ */}
            {tab === "academy" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 16 }}>◈ JUNIOR OFFICER COMMISSION / FIELD PROMOTIONS</div>
                <div style={{ background: "#0a0a00", border: "1px solid #2a2a00", padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 9, color: "#c8b870", letterSpacing: 2 }}>FIELD EXPERIENCE & PROMOTION MECHANICS</div>
                  <div style={{ fontSize: 8, color: "#8a8a6a", marginTop: 4 }}>Assign Junior Officers to command Live Missions to earn field experience (XP). Upon reaching XP thresholds, you may spend Prestige to promote them. Officers reaching Brigadier General (BG) are transferred to the Subordinate Commanders roster.</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                  {officerRoster.map(o => {
                    const thresh = PROMOTION_THRESHOLDS[o.rank];
                    const maxRank = !thresh;
                    const canPromote = !maxRank && o.xp >= thresh.xpReq;
                    const pct = maxRank ? 100 : Math.min(100, (o.xp / thresh.xpReq) * 100);

                    return (
                      <div key={o.id} className="panel" style={{ padding: 16, borderLeft: `3px solid ${canPromote ? "#4caf50" : "#2a4a2a"}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 44, height: 44, border: "1px solid #1a3a1a", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#c8ffc8", fontFamily: "Oswald,sans-serif" }}>{o.rank}</div>
                            <div>
                              <div style={{ fontSize: 13, color: "#c8ffc8", letterSpacing: 2 }}>{o.name.toUpperCase()}</div>
                              <div style={{ fontSize: 8, color: "#5a7a5a" }}>{o.unit} · {o.specialty}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 8, background: "#050a05", padding: "2px 6px", border: "1px solid #1a2a1a", color: "#4caf50" }}>{o.status}</div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#4a6a4a", marginBottom: 4 }}>
                            <span>COMBAT EXPERIENCE</span>
                            <span>{o.xp.toLocaleString()} {thresh ? `/ ${thresh.xpReq.toLocaleString()} XP` : 'MAX'}</span>
                          </div>
                          <div style={{ height: 4, background: "#0a1a0a", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: canPromote ? "#4caf50" : "#2a5a2a", transition: "width 0.5s" }} />
                          </div>
                        </div>

                        {!maxRank && (
                          <button
                            className={`btn ${canPromote ? "btn-green" : ""}`}
                            style={{ fontSize: 9, padding: "8px", width: "100%", opacity: canPromote ? 1 : 0.4, cursor: canPromote ? "pointer" : "not-allowed" }}
                            onClick={() => canPromote && promoteOfficer(o)}
                          >
                            {canPromote ? `⭐ PROMOTE TO ${thresh.next} (COST: ${thresh.cost} PR)` : `DEPLOY ON MISSIONS TO PROMOTE`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ DIVISION ARMORY ══ */}
            {tab === "armory" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4 }}>◈ DIVISION ARMORY / BLACK BUDGET PROCUREMENT</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, color: "#c8ffc8", fontFamily: "Oswald,sans-serif" }}>${(banks.slushFund / 1000000).toFixed(1)}M</div>
                    <div style={{ fontSize: 8, color: "#5a7a5a", letterSpacing: 1 }}>AVAILABLE BLACK BUDGET</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {DIVISION_UPGRADES.map(upg => {
                    const owned = divisionPurchases.includes(upg.id);
                    const canAfford = banks.slushFund >= upg.cost;

                    return (
                      <div key={upg.id} className="panel" style={{ padding: 18, borderLeft: `3px solid ${owned ? "#4b9ae8" : "#2a2a2a"}`, opacity: owned ? 0.7 : 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: owned ? "#4b9ae8" : "#c8ffc8", letterSpacing: 1 }}>{upg.name}</div>
                          <div style={{ fontSize: 11, color: owned ? "#4b9ae8" : canAfford ? "#ffd700" : "#e84b4b", fontFamily: "Oswald,sans-serif" }}>
                            {owned ? "PROCURED" : `$${(upg.cost / 1000000).toFixed(1)}M`}
                          </div>
                        </div>
                        <div style={{ fontSize: 9, color: "#6a8a6a", lineHeight: 1.6, marginBottom: 14 }}>{upg.desc}</div>
                        {!owned && (
                          <button
                            className="btn btn-gold"
                            style={{ fontSize: 9, padding: "6px 12px", opacity: canAfford ? 1 : 0.4, cursor: canAfford ? "pointer" : "not-allowed" }}
                            onClick={() => canAfford && buyDivisionUpgrade(upg)}
                          >
                            PROCURE FOR SOCOM
                          </button>
                        )}
                        {owned && <div style={{ fontSize: 8, color: "#4b9ae8", letterSpacing: 2 }}>✓ DEPLOYED TO FIELD UNITS</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ GLOBAL INTEL ══ */}
            {tab === "intel" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Hot zone briefs */}
                  <div>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ THEATRE INTELLIGENCE BRIEFS</div>
                    {(general.hotZones || HOT_ZONES).map(z => (
                      <div key={z.id} className="panel" style={{ padding: 16, marginBottom: 8, borderLeft: `3px solid ${z.color}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: "#c8ffc8", letterSpacing: 2 }}>{z.name}</div>
                          <div style={{ fontSize: 8, color: z.color, border: `1px solid ${z.color}`, padding: "2px 8px", letterSpacing: 2 }}>{z.threat}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "#5a7a5a", lineHeight: 1.8, marginBottom: 8 }}>{z.description}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ fontSize: 8, color: "#3a5a3a" }}>👥 {z.troops.toLocaleString()} US forces</div>
                          <button className="btn" style={{ fontSize: 8, padding: "3px 10px", marginLeft: "auto" }} onClick={() => { setSelectedZone(z); setDeployPhase(0); setShowDeploy(true); }}>DEPLOY</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Intelligence reports */}
                  <div>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ CLASSIFIED INTELLIGENCE REPORTS</div>
                    {[
                      { title: "HUMINT REPORT — DPRK", classification: "TOP SECRET/SCI", body: "Source CARDINAL reports General Pak Jong-su has ordered 2nd Corps to combat readiness. Launchers dispersed to tunnels. Assessment: HIGH probability of provocative test within 72 hours.", action: "REQUEST RECON OVERFLIGHT" },
                      { title: "SIGINT INTERCEPT — RUSSIA", classification: "TS//SI//NOFORN", body: "NSA intercept of FSB comms indicates Kremlin has approved 'Phase Omega' — cyber attack package targeting NATO power grids. Timing: T-96 hours.", action: "ALERT CYBERCOM" },
                      { title: "IMAGERY INTEL — SOUTH CHINA SEA", classification: "SECRET//REL NATO", body: "NRO satellite confirms 3 new artificial island installations complete. Radar systems, surface-to-air missiles, and hardened aircraft shelters. 72 military aircraft present.", action: "UPDATE INDOPACOM" },
                      { title: "HUMINT — VENEZUELA", classification: "CONFIDENTIAL", body: "Station CARACAS confirms Cuban intelligence officers advising SEBIN on surveillance methods. 12 Russian advisors at Camp Bolivar. Maduro consolidating.", action: "REVIEW COA" },
                    ].map((r, i) => (
                      <div key={i} className="panel" style={{ padding: 16, marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: "#c8ffc8", letterSpacing: 2 }}>{r.title}</div>
                          <div style={{ fontSize: 7, color: "#e84b4b", letterSpacing: 2 }}>{r.classification}</div>
                        </div>
                        <div style={{ fontSize: 9, color: "#5a7a5a", lineHeight: 1.8, marginBottom: 10 }}>{r.body}</div>
                        <button className="btn" style={{ fontSize: 8, padding: "4px 12px" }} onClick={() => notify(`${r.action} — ACKNOWLEDGED`,)}>▶ {r.action}</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ AWARDS ══ */}
            {tab === "awards" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 4, marginBottom: 12 }}>◈ AWARD DECORATIONS TO SUBORDINATES</div>
                    {SUBORDINATE_GENERALS.map(sg => (
                      <div key={sg.id} className="panel-gold" style={{ padding: 16, marginBottom: 8, border: "1px solid #2a2a00" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#c8b870", letterSpacing: 2 }}>{sg.name}</div>
                            <div style={{ fontSize: 9, color: "#5a5a3a" }}>{sg.rank} · {sg.unit}</div>
                          </div>
                          <button className="btn btn-gold" style={{ fontSize: 9 }} onClick={() => setShowAward(sg)}>🏅 SELECT AWARD</button>
                        </div>
                        <div style={{ fontSize: 8, color: "#4a5a4a", marginBottom: 8 }}>{sg.distinction}</div>
                        {/* Awarded medals */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {((general.awardedTo || {})[sg.id] || sg.medals).map((m, i) => {
                            const medal = MEDAL_LIST.find(ml => ml.id === m.toLowerCase());
                            return medal ? (<div key={i} title={medal.name} style={{ display: "flex", alignItems: "center", gap: 3, background: "#0a0a00", border: `1px solid ${medal.color}44`, padding: "2px 6px" }}>
                              <span style={{ color: medal.color, fontSize: 10 }}>{medal.icon}</span>
                              <span style={{ fontSize: 7, color: medal.color }}>{medal.name.split(" ").slice(-1)[0]}</span>
                            </div>) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Medal display */}
                  <div>
                    <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 4, marginBottom: 12 }}>◈ MEDAL REFERENCE — {MEDAL_LIST.length} AVAILABLE</div>
                    {MEDAL_LIST.map(m => (
                      <div key={m.id} style={{ background: "#080e08", border: `1px solid ${m.color}33`, padding: "10px 14px", marginBottom: 6, display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ fontSize: 22, color: m.color, textShadow: `0 0 8px ${m.color}66`, minWidth: 30, textAlign: "center" }}>{m.icon}</div>
                        <div>
                          <div style={{ fontSize: 10, color: m.color }}>{m.name}</div>
                          <div style={{ fontSize: 8, color: "#3a5a3a" }}>{m.desc}</div>
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: 9, color: "#2a4a2a" }}>AWARDED: {Object.values(general.awardedTo || {}).flat().filter(x => x === m.id).length}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: 14, background: "#080e08", border: "1px solid #2a2a00", padding: 14 }}>
                      <div style={{ fontSize: 9, color: "#ffd700", marginBottom: 4 }}>TOTAL MEDALS AWARDED</div>
                      <div style={{ fontSize: 32, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>{general.medalsAwarded || 0}</div>
                      <div style={{ fontSize: 8, color: "#5a5a3a", marginTop: 4 }}>by General {general.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ JOINT STAFF BUDGET ══ */}
            {tab === "budget" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 4, marginBottom: 12 }}>◈ BRANCH BUDGET ALLOCATIONS (FY2024 IN BILLIONS)</div>
                    {Object.entries(branchBudgets).map(([branch, amt]) => (
                      <div key={branch} className="panel" style={{ padding: 16, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "#c8ffc8", letterSpacing: 2, textTransform: "uppercase" }}>{branch}</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <button className="btn btn-red" style={{ padding: "4px 10px" }} onClick={() => { if (amt > 10) setBranchBudgets(b => ({ ...b, [branch]: b[branch] - 10 })) }}>-$10B</button>
                          <div style={{ fontSize: 14, color: "#ffd700", width: 60, textAlign: "center", fontFamily: "Oswald,sans-serif" }}>${amt}</div>
                          <button className="btn" style={{ padding: "4px 10px", borderColor: "#4caf50", color: "#4caf50" }} onClick={() => setBranchBudgets(b => ({ ...b, [branch]: b[branch] + 10 }))}>+$10B</button>
                        </div>
                      </div>
                    ))}
                    <div className="panel-gold" style={{ padding: 16, marginTop: 14 }}>
                      <div style={{ fontSize: 9, color: "#7a6a3a" }}>TOTAL DOD DISCRETIONARY BUDGET</div>
                      <div style={{ fontSize: 24, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>${Object.values(branchBudgets).reduce((a, b) => a + b, 0)} BILLION</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "#4b9ae8", letterSpacing: 4, marginBottom: 12 }}>◈ BUDGET IMPACT ASSESSMENT</div>
                    <div className="panel" style={{ padding: 16, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 6 }}>NAVY FLEET READINESS</div>
                      <div style={{ height: 4, background: "#0a1a0a" }}><div style={{ height: "100%", width: `${Math.min(100, branchBudgets.navy / 2.5)}%`, background: "#4b9ae8" }} /></div>
                      <div style={{ fontSize: 8, color: "#5a7a5a", marginTop: 4 }}>High funding enables carrier strike group deployments.</div>
                    </div>
                    <div className="panel" style={{ padding: 16, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 6 }}>AIR FORCE STRATEGIC DETERRENCE</div>
                      <div style={{ height: 4, background: "#0a1a0a" }}><div style={{ height: "100%", width: `${Math.min(100, branchBudgets.airforce / 2.5)}%`, background: "#4bcde8" }} /></div>
                      <div style={{ fontSize: 8, color: "#5a7a5a", marginTop: 4 }}>B-21 platform development running on schedule.</div>
                    </div>
                    <div className="panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 6 }}>SPACE FORCE C4ISR</div>
                      <div style={{ height: 4, background: "#0a1a0a" }}><div style={{ height: "100%", width: `${Math.min(100, branchBudgets.spaceforce)}%`, background: "#9b59b6" }} /></div>
                      <div style={{ fontSize: 8, color: "#5a7a5a", marginTop: 4 }}>Early warning satellite constellation operational capacity.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PERSONNEL COMMAND ══ */}
            {tab === "personnel" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4, marginBottom: 12 }}>◈ ENLISTED HERO ROSTER — FIELD REPORTS</div>
                {heroRoster.length === 0 && <div style={{ fontSize: 10, color: "#5a7a5a", fontStyle: "italic", padding: 20 }}>No outstanding field citations at this time. Wait for situational updates.</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {heroRoster.map(hero => (
                    <div key={hero.id} className="panel" style={{ padding: 16, borderLeft: "3px solid #ffd700" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#c8ffc8", letterSpacing: 1 }}>{hero.name}</div>
                        {hero.promoted && <div style={{ fontSize: 8, color: "#ffd700", border: "1px solid #ffd700", padding: "2px 6px" }}>COMMENDED</div>}
                      </div>
                      <div style={{ fontSize: 9, color: "#7a9a7a", marginBottom: 12 }}>
                        Action: <span style={{ color: "#fff" }}>{hero.action}</span><br />
                        Location: {hero.location}
                      </div>
                      {!hero.promoted && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-gold" style={{ flex: 1, padding: "6px" }} onClick={() => { setHeroRoster(r => r.map(h => h.id === hero.id ? { ...h, promoted: true } : h)); notify("Medal pinned. Morale increased.", "#ffd700"); updateGeneral({ prestige: pres + 2 }); }}>PIN MEDAL (+2 PR)</button>
                          <button className="btn" style={{ flex: 1, padding: "6px", borderColor: "#4b9ae8", color: "#4b9ae8" }} onClick={() => { setHeroRoster(r => r.map(h => h.id === hero.id ? { ...h, promoted: true } : h)); notify("OVAL OFFICE MEETING ARRANGED", "#4b9ae8"); updateGeneral({ prestige: pres + 8, approval: Math.max(0, ap - 5) }); }}>POTUS MEET (+8 PR, -5 AP)</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Base Visitations */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4 }}>◈ TROOP MORALE & BASE VISITATIONS</div>
                    <div style={{ fontSize: 10, color: baseMorale > 70 ? "#4caf50" : baseMorale < 30 ? "#e84b4b" : "#e8b84b", fontFamily: "Oswald,sans-serif", letterSpacing: 1 }}>OVERALL MORALE: {baseMorale}%</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {[
                      { name: "Fort Bragg (Conventional)", cost: { ap: 2, time: 1 }, morale: 5, risk: 0, desc: "Standard troop visit. Safe PR win." },
                      { name: "CENTCOM Forward Operating Base", cost: { ap: 5, time: 2 }, morale: 12, risk: 0.1, desc: "Visit active combat zone. High impact, slight risk." },
                      { name: "Classified Black Site (Undisclosed)", cost: { ap: 10, time: 3 }, morale: 25, risk: 0.3, desc: "Visit Tier 1 operators. Massive morale boost, high exposure risk." }
                    ].map((base, i) => (
                      <div key={i} className="panel" style={{ padding: 14 }}>
                        <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 6, letterSpacing: 1 }}>{base.name}</div>
                        <div style={{ fontSize: 8, color: "#5a7a5a", marginBottom: 12, minHeight: 24 }}>{base.desc}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 12 }}>
                          <span style={{ color: "#e8b84b" }}>COST: -{base.cost.ap} AP</span>
                          <span style={{ color: "#4caf50" }}>MORALE: +{base.morale}</span>
                        </div>
                        <button className="btn" style={{ width: "100%", padding: "6px", fontSize: 8 }} onClick={() => {
                          if (ap < base.cost.ap) {
                            notify("INSUFFICIENT APPROVAL (AP) FOR THIS VISIT", "#e84b4b");
                            return;
                          }
                          const isCompromised = Math.random() < base.risk;
                          if (isCompromised) {
                            notify(`VISIT COMPROMISED: Press caught wind of ${base.name} visit.`, "#e84b4b");
                            updateGeneral({ approval: Math.max(0, ap - base.cost.ap - 5), prestige: Math.max(0, pres - 5) });
                            setBaseMorale(m => Math.min(100, m + Math.floor(base.morale / 2)));
                          } else {
                            notify(`VISIT SUCCESSFUL: Morale boosted by +${base.morale}% at ${base.name}.`, "#4caf50");
                            updateGeneral({ approval: Math.max(0, ap - base.cost.ap), prestige: Math.min(100, pres + 2) });
                            setBaseMorale(m => Math.min(100, m + base.morale));
                          }
                        }}>
                          INITIATE VISIT
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ POLITICS ══ */}
            {tab === "politics" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Presidential relationship */}
                  <div>
                    <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 4, marginBottom: 12 }}>◈ PRESIDENTIAL RELATIONSHIP</div>

                    {isJunta ? (
                      <div className="panel" style={{ padding: 30, border: "2px solid #9b59b6", textAlign: "center", marginBottom: 14 }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>👑</div>
                        <div style={{ fontSize: 14, color: "#c8b8ff", letterSpacing: 4, marginBottom: 8, fontWeight: "bold" }}>MILITARY JUNTA ACTIVE</div>
                        <div style={{ fontSize: 10, color: "#a898df", marginBottom: 16 }}>You have suspended the Constitution. The civilian government is dissolved.</div>
                        <div style={{ fontSize: 12, color: "#e84b4b", fontFamily: "monospace" }}>JUNTA DURATION: T-{juntaTicks} TICKS</div>
                      </div>
                    ) : (
                      <div className="panel-gold" style={{ padding: 20, marginBottom: 14, border: "1px solid #2a2a00" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                          <div style={{ width: 60, height: 60, border: `2px solid ${potusTrust > 50 ? "#4caf50" : "#e84b4b"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, background: "#080800" }}>🏛</div>
                          <div>
                            <div style={{ fontSize: 11, color: "#c8b870", letterSpacing: 2 }}>THE PRESIDENT</div>
                            <div style={{ fontSize: 9, color: "#5a5a3a" }}>Commander-in-Chief</div>
                            <div style={{ fontSize: 9, color: potusTrust > 50 ? "#4caf50" : "#e84b4b", marginTop: 4 }}>TRUST: {potusTrust}%</div>
                          </div>
                        </div>
                        {/* Trust bar */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ height: 8, background: "#0a0a00", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${potusTrust}%`, background: `linear-gradient(90deg,${potusTrust > 50 ? "#4caf50" : "#e84b4b"}88,${potusTrust > 50 ? "#4caf50" : "#e84b4b"})`, borderRadius: 2, transition: "width 0.8s" }} />
                          </div>
                          {potusTrust < 25 && <div style={{ fontSize: 8, color: "#e84b4b", marginTop: 6, animation: "pulse 1.5s infinite" }}>⚠ HIGH FIRING RISK — POTUS views you as a threat</div>}
                          {potusTrust >= 80 && <div style={{ fontSize: 8, color: "#4caf50", marginTop: 6 }}>★ INNER CIRCLE — POTUS rubber-stamps your requests</div>}
                        </div>
                        {/* Meeting options */}
                        <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 3, marginBottom: 10 }}>POLITICAL MANEUVERS:</div>
                        {[
                          { id: "golf", label: "GOLF AT MAR-A-LAGO", desc: "Build personal rapport offline", ptEffect: "+15", prEffect: "+5" },
                          { id: "dinner", label: "PRIVATE WH DINNER", desc: "Provide strategic counsel", ptEffect: "+10", prEffect: "+2" },
                          { id: "endorse", label: "PUBLIC ENDORSEMENT", desc: "Praise POTUS policies", ptEffect: "+5", prEffect: "-5" },
                          { id: "leak", label: "LEAK TO THE PRESS", desc: "Undermine POTUS anonymously", ptEffect: "-20", prEffect: "+10" },
                          { id: "disobey", label: "DISOBEY DIRECT ORDER", desc: "Refuse an executive command", ptEffect: "-30", prEffect: "+15" },
                        ].map(m => (
                          <div key={m.id} className="choice-card" style={{ marginBottom: 6, borderColor: "#2a2a00" }} onClick={() => meetPresident(m.id)}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 10, color: "#c8b870", letterSpacing: 1 }}>{m.label}</div>
                                <div style={{ fontSize: 8, color: "#4a4a3a", marginTop: 2 }}>{m.desc}</div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <div style={{ fontSize: 8, color: m.ptEffect.startsWith("+") ? "#4caf50" : "#e84b4b", minWidth: 20, textAlign: "right" }}>TR {m.ptEffect}</div>
                                <div style={{ fontSize: 8, color: m.prEffect.startsWith("+") ? "#4caf50" : "#e84b4b", minWidth: 20, textAlign: "right" }}>PR {m.prEffect}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {presidentialMeet && (
                      <div className="panel" style={{ padding: 16, border: "1px solid #2a4a2a", animation: "fadeUp 0.4s" }}>
                        <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 3, marginBottom: 8 }}>POLITICAL OUTCOME</div>
                        <div style={{ fontSize: 10, color: "#8aaa7a", lineHeight: 1.6 }}>{presidentialMeet.msg}</div>
                      </div>
                    )}
                  </div>
                  {/* Mil + Allies */}
                  <div>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ MILITARY LOYALTY</div>
                    <div className="panel" style={{ padding: 16, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#c8ffc8" }}>ARMED FORCES ALLEGIANCE</div>
                        <div style={{ fontSize: 14, color: militaryLoyalty > 70 ? "#4caf50" : "#e8b84b", fontWeight: "bold" }}>{militaryLoyalty}%</div>
                      </div>
                      <div style={{ height: 4, background: "#0a1a0a", marginBottom: 16 }}>
                        <div style={{ height: "100%", width: `${militaryLoyalty}%`, background: militaryLoyalty > 70 ? "#4caf50" : "#e8b84b" }} />
                      </div>

                      <div style={{ fontSize: 8, color: "#5a7a5a", marginBottom: 12 }}>Who does the military serve? The Constitution, or you? High loyalty enables drastic actions like a coup against the civilian government.</div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" style={{ flex: 1, padding: "8px", fontSize: 8 }} onClick={() => {
                          if (banks.slushFund >= 5000000) {
                            setBanks(b => ({ ...b, slushFund: b.slushFund - 5000000 }));
                            setMilitaryLoyalty(m => Math.min(100, m + 10));
                            notify("Paid Off Generals: Military Loyalty +10%", "#4caf50");
                          } else {
                            notify("INSUFFICIENT SLUSH FUND ($5M req)", "#e84b4b");
                          }
                        }}>BUY LOYALTY ($5M Slush)</button>
                      </div>
                    </div>

                    <div className="panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 12 }}>ALLIED COMMANDERS</div>
                      {[
                        { country: "🇬🇧 UK", name: "Gen. Harrington", relation: "CLOSE ALLY" },
                        { country: "🇫🇷 France", name: "Gen. Beaumont", relation: "STRONG" },
                        { country: "🇩🇪 Germany", name: "Gen. Müller", relation: "RELIABLE" },
                        { country: "🇰🇷 South Korea", name: "Gen. Park", relation: "CRITICAL ALLY" },
                        { country: "🇯🇵 Japan", name: "Adm. Yamamoto", relation: "STRONG" },
                      ].map(a => (
                        <div key={a.country} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #0d1a0d" }}>
                          <div style={{ fontSize: 9, color: "#7a9a7a" }}>{a.country} — {a.name}</div>
                          <div style={{ fontSize: 8, color: "#4caf50" }}>{a.relation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FULL POLITICIAN NETWORK */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 4, marginBottom: 12 }}>◈ POLITICAL POWER NETWORK — KEY RELATIONSHIPS</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                    {politicians.map(pol => {
                      const relColor = pol.relation >= 70 ? "#4caf50" : pol.relation >= 40 ? "#e8b84b" : "#e84b4b";
                      return (
                        <div key={pol.id} className="panel" style={{ padding: 14, borderTop: `3px solid ${relColor}`, position: "relative" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontSize: 18 }}>{pol.emoji}</div>
                            <div style={{ fontSize: 7, color: relColor, border: `1px solid ${relColor}`, padding: "1px 6px" }}>{pol.favor}</div>
                          </div>
                          <div style={{ fontSize: 10, color: "#c8ffc8", fontWeight: "bold", marginBottom: 2 }}>{pol.name}</div>
                          <div style={{ fontSize: 7, color: "#5a7a5a", marginBottom: 6 }}>{pol.role}</div>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#5a7a5a", marginBottom: 2 }}>
                              <span>RELATION</span><span style={{ color: relColor }}>{pol.relation}%</span>
                            </div>
                            <div style={{ height: 3, background: "#0a1a0a" }}>
                              <div style={{ height: "100%", width: `${pol.relation}%`, background: relColor, transition: "width 0.5s" }} />
                            </div>
                          </div>
                          <div style={{ fontSize: 7, color: "#4a6a4a", marginBottom: 8 }}>STANCE: {pol.stance}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <button className="btn" style={{ fontSize: 7, padding: "4px 6px" }} onClick={() => {
                              setPoliticians(prev => prev.map(p => p.id === pol.id ? { ...p, relation: Math.min(100, p.relation + 8), favor: Math.min(100, p.relation + 8) >= 70 ? "ALLY" : p.favor } : p));
                              updateGeneral({ approval: Math.min(100, ap + 2) });
                              notify(`🤝 Met with ${pol.name} — Relationship +8`, "#4caf50");
                            }}>🤝 PRIVATE MEETING (+8)</button>
                            <button className="btn" style={{ fontSize: 7, padding: "4px 6px", borderColor: "#ffd700", color: "#ffd700" }} onClick={() => {
                              if (banks.personal < 50000) return notify("NEED $50K", "#e84b4b");
                              setBanks(b => ({ ...b, personal: b.personal - 50000 }));
                              setPoliticians(prev => prev.map(p => p.id === pol.id ? { ...p, relation: Math.min(100, p.relation + 20), favor: "BOUGHT" } : p));
                              notify(`💰 ${pol.name} BRIBED — +20 Relation (-$50K)`, "#ffd700");
                            }}>💰 BRIBE (-$50K +20)</button>
                            <button className="btn btn-red" style={{ fontSize: 7, padding: "4px 6px" }} onClick={() => {
                              setPoliticians(prev => prev.map(p => p.id === pol.id ? { ...p, relation: Math.max(0, p.relation - 30), favor: "HOSTILE" } : p));
                              updateGeneral({ prestige: Math.min(100, pres + 5) });
                              notify(`📄 DOSSIER RELEASED on ${pol.name} — Relation -30, +5 PR`, "#e84b4b");
                            }}>📊 RELEASE DOSSIER (-30)</button>
                            {pol.relation >= 75 && (
                              <button className="btn" style={{ fontSize: 7, padding: "4px 6px", borderColor: "#9b59b6", color: "#9b59b6" }} onClick={() => {
                                notify(`⭐ SPECIAL FAVOR from ${pol.name}: ${pol.riskyAbility}`, "#9b59b6");
                                updateGeneral({ prestige: Math.min(100, pres + 10), approval: Math.min(100, ap + 5) });
                              }}>⭐ CALL FAVOR (+10 PR)</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ COUPS & THREATS ══ */}
            {tab === "coup" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#9b59b6", letterSpacing: 4, marginBottom: 12 }}>◈ COUP SCENARIOS — ACTIVE THREATS</div>
                    {[
                      { title: "DPRK INTERNAL COUP", status: "ONGOING", region: "North Korea", detail: "Rogue elements of the North Korean 4th Corps are maneuvering toward Pyongyang. Kim's inner circle is fragmenting. Window: 48 hours.", options: [{ label: "SUPPORT COUP — DESTABILIZE DPRK", effect: { ap: -5, p: +8 }, emoji: "⚠" }, { label: "SUPPORT KIM — MAINTAIN STABILITY", effect: { ap: +8, p: +5 }, emoji: "✓" }, { label: "DO NOTHING — MONITOR", effect: { ap: 0, p: 0 }, emoji: "👁" }] },
                      { title: "VENEZUELA MILITARY REVOLT", status: "DEVELOPING", region: "Venezuela", detail: "Senior Venezuelan Army officers have reached out to CIA requesting US support for a coup against Maduro. DoD and State are divided on response.", options: [{ label: "PROVIDE COVERT SUPPORT", effect: { ap: -10, p: +5 }, emoji: "🤫" }, { label: "INFORM STATE — DECLINE COVERTLY", effect: { ap: +5, p: +3 }, emoji: "📋" }, { label: "COORDINATE WITH REGIONAL ALLIES", effect: { ap: +8, p: +8 }, emoji: "🤝" }] },
                    ].map((coup, i) => (
                      <div key={i} className="panel" style={{ padding: 18, marginBottom: 12, border: `1px solid ${coup.status === "CRITICAL" ? "#e84b4b44" : "#2a1a4a44"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: "#c8b8ff", letterSpacing: 2 }}>{coup.title}</div>
                          <div style={{ fontSize: 8, color: coup.status === "CRITICAL" ? "#e84b4b" : "#9b59b6", border: `1px solid ${coup.status === "CRITICAL" ? "#e84b4b" : "#9b59b6"}`, padding: "2px 8px", letterSpacing: 2 }}>{coup.status}</div>
                        </div>
                        <div style={{ fontSize: 9, color: "#3a5a3a", marginBottom: 8 }}>📍 {coup.region}</div>
                        <div style={{ fontSize: 10, color: "#5a7a5a", lineHeight: 1.8, marginBottom: 12 }}>{coup.detail}</div>
                        {coup.options.map((o, j) => (
                          <div key={j} className="choice-card" style={{ marginBottom: 6, borderColor: "#1a1a2a" }} onClick={() => {
                            updateGeneral({ approval: Math.max(0, Math.min(100, ap + (o.effect.ap || 0))), prestige: Math.max(0, Math.min(100, pres + (o.effect.p || 0))) });
                            notify(`${coup.title}: ${o.label}`, o.effect.ap > 0 ? "#4caf50" : "#e84b4b");
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ fontSize: 9, color: "#9b9bff", letterSpacing: 1 }}>{o.emoji} {o.label}</div>
                              <div style={{ display: "flex", gap: 6, fontSize: 8 }}>
                                <span style={{ color: o.effect.ap > 0 ? "#4caf50" : o.effect.ap < 0 ? "#e84b4b" : "#5a5a5a" }}>AP {o.effect.ap > 0 ? "+" : ""}{o.effect.ap}</span>
                                <span style={{ color: o.effect.p > 0 ? "#4caf50" : "#e84b4b" }}>PR {o.effect.p > 0 ? "+" : ""}{o.effect.p}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* The Domestic Coup Action */}
                    <div className="panel" style={{ padding: 18, border: "1px solid #e84b4b", background: "linear-gradient(135deg, rgba(232,75,75,0.05), rgba(0,0,0,0))" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#ff6b6b", letterSpacing: 2, fontWeight: "bold" }}>DOMESTIC MILITARY COUP</div>
                        <div style={{ fontSize: 8, color: "#e84b4b", border: "1px solid #e84b4b", padding: "2px 8px", letterSpacing: 2, animation: "blink 1.5s infinite" }}>CRITICAL</div>
                      </div>
                      <div style={{ fontSize: 9, color: "#e84b4b", marginBottom: 8, fontWeight: "bold" }}>📍 WASHINGTON DC, PENTAGON</div>
                      <div style={{ fontSize: 10, color: "#ffb4b4", lineHeight: 1.8, marginBottom: 16 }}>
                        The civilian administration is weak. The nation is divided. As the highest-ranking military official, you have the loyalty of the armed forces. You can seize control of the capital, suspend the Constitution, and establish a Military Junta. If Military Loyalty or Prestige is too low, the coup will fail and you will be executed for treason.
                      </div>

                      {!isJunta ? (
                        <button className="btn btn-red" style={{ width: "100%", padding: "12px", fontSize: 10, letterSpacing: 2, fontWeight: "bold" }} onClick={handleDomesticCoup}>
                          ☠ SEIZE CONTROL OF THE UNITED STATES ☠
                        </button>
                      ) : (
                        <div style={{ color: "#9b59b6", fontSize: 12, fontWeight: "bold", textAlign: "center", textShadow: "0 0 10px #9b59b6" }}>
                          YOU ALREADY CONTROL THE NATION
                        </div>
                      )}
                    </div>

                  </div>
                  {/* Threat assessment */}
                  <div>
                    <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 12 }}>◈ THREAT ASSESSMENT BOARD</div>
                    <div className="panel" style={{ padding: 16, marginBottom: 14 }}>
                      {[
                        { threat: "Nuclear First Use by DPRK", prob: "8%", color: "#e84b4b", trend: "↑" },
                        { threat: "China-Taiwan Kinetic Action", prob: "23%", color: "#e87a4b", trend: "↑" },
                        { threat: "Russian NATO Border Incident", prob: "31%", color: "#e8b84b", trend: "→" },
                        { threat: "Iran Strait of Hormuz Closure", prob: "18%", color: "#e8b84b", trend: "↓" },
                        { threat: "Domestic Extremist Event", prob: "12%", color: "#4b9ae8", trend: "↑" },
                        { threat: "Cyber Attack on Power Grid", prob: "44%", color: "#9b59b6", trend: "↑" },
                      ].map(t => (
                        <div key={t.threat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0d1a0d" }}>
                          <div style={{ fontSize: 10, color: "#7a9a7a" }}>{t.threat}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ fontSize: 14, fontFamily: "Oswald,sans-serif", color: t.color }}>{t.prob}</div>
                            <div style={{ fontSize: 12, color: t.color }}>{t.trend}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="panel" style={{ padding: 16, border: "1px solid #3a1a1a" }}>
                      <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 12, letterSpacing: 2 }}>COMMAND EMERGENCY PROTOCOLS</div>
                      {[
                        { label: "ACTIVATE CONTINUITY OF GOVERNMENT", desc: "Disperse key personnel to hardened sites" },
                        { label: "ELEVATE ALL FORCES TO DEFCON 2", desc: "Alert all commands — armed forces ready" },
                        { label: "REQUEST NSC EMERGENCY SESSION", desc: "Convene cabinet-level crisis meeting" },
                        { label: "AUTHORIZE CYBERCOM OFFENSIVE OPS", desc: "Preemptive cyber strike on hostile networks" },
                      ].map((p, i) => (
                        <button key={i} className="btn btn-red" style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6, padding: "10px 14px", fontSize: 9 }} onClick={() => notify(p.label + " — AUTHORIZED", "#e84b4b")}>
                          ⚡ {p.label}
                          <div style={{ fontSize: 7, color: "#5a3a3a", marginTop: 2 }}>{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PRESS BRIEFING ══ */}
            {tab === "press" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Left Column: Interactive Q&A */}
                  <div>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ PENTAGON PRESS BRIEFING ROOM</div>

                    {!currentPressEvent ? (
                      <div className="panel" style={{ padding: 20, marginBottom: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#c8ffc8", marginBottom: 12 }}>REPORTERS ARE GATHERING...</div>
                        <div style={{ fontSize: 9, color: "#4a6a4a", marginBottom: 20 }}>Step up to the podium. Your words shape public perception and political standing.</div>
                        <button className="btn btn-gold" style={{ padding: "12px 24px" }} onClick={initPressBriefing}>
                          🎙️ STEP UP TO THE PODIUM
                        </button>
                      </div>
                    ) : (
                      <div className="panel" style={{ padding: 20, border: "1px solid #ffd700", marginBottom: 14, animation: "fadeUp 0.3s" }}>
                        <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 2, marginBottom: 6 }}>🔴 LIVE PRESS QUESTION</div>
                        <div style={{ fontSize: 14, color: "#ffffff", fontStyle: "italic", marginBottom: 12 }}>"{currentPressEvent.topic}"</div>
                        <div style={{ fontSize: 9, color: "#7a6a3a", marginBottom: 20 }}>CONTEXT: {currentPressEvent.context}</div>

                        <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 2, marginBottom: 8 }}>CHOOSE YOUR RESPONSE:</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {currentPressEvent.options.map((opt, i) => (
                            <button key={i} className="choice-card" style={{ padding: 12, textAlign: "left" }} onClick={() => handlePressQA(opt)}>
                              <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 4 }}>[{opt.label}]</div>
                              <div style={{ fontSize: 11, color: "#8aaa7a" }}>"{opt.text}"</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {pressResult && (
                      <div className="panel" style={{ padding: 16, border: "1px solid #2a4a2a", animation: "fadeUp 0.4s", marginBottom: 14 }}>
                        <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 3, marginBottom: 8 }}>LATEST BRIEFING RESULT</div>
                        <div style={{ fontSize: 10, color: "#8aaa7a", lineHeight: 1.6 }}>{pressResult}</div>
                      </div>
                    )}

                    {pressHistory.length > 0 && (
                      <div className="panel" style={{ padding: 16 }}>
                        <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 10 }}>RECENT TRANSCRIPTS:</div>
                        {pressHistory.map((h, i) => (
                          <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #1a2a1a" }}>
                            <div style={{ fontSize: 9, color: "#5a7a5a", fontStyle: "italic", marginBottom: 4 }}>Q: {h.q}</div>
                            <div style={{ fontSize: 9, color: "#c8ffc8", marginBottom: 4 }}>A: "{h.a}"</div>
                            <div style={{ fontSize: 8, color: "#7a6a3a" }}>{h.res.split('\n')[1]}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Media landscape */}
                  <div>
                    <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 4, marginBottom: 12 }}>◈ MEDIA LANDSCAPE</div>
                    <div className="panel" style={{ padding: 16, marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 12 }}>NETWORK COVERAGE</div>
                      {[
                        { outlet: "CNN", tone: "CRITICAL", audience: "24M", bias: "Liberal" },
                        { outlet: "Fox News", tone: "SUPPORTIVE", audience: "19M", bias: "Conservative" },
                        { outlet: "BBC", tone: "NEUTRAL", audience: "12M", bias: "International" },
                        { outlet: "NYT", tone: "SKEPTICAL", audience: "8M", bias: "Liberal" },
                        { outlet: "WSJ", tone: "FAVORABLE", audience: "6M", bias: "Business" },
                      ].map(m => (
                        <div key={m.outlet} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0d1a0d" }}>
                          <div style={{ fontSize: 9, color: "#7a9a7a" }}>{m.outlet}</div>
                          <div style={{ display: "flex", gap: 8, fontSize: 8 }}>
                            <span style={{ color: m.tone === "SUPPORTIVE" || m.tone === "FAVORABLE" ? "#4caf50" : m.tone === "CRITICAL" || m.tone === "SKEPTICAL" ? "#e84b4b" : "#e8b84b" }}>{m.tone}</span>
                            <span style={{ color: "#3a5a3a" }}>{m.audience}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 12 }}>LIVE HEADLINES</div>
                      {NEWS_FEED.slice(0, 6).map((n, i) => (
                        <div key={i} style={{ fontSize: 9, color: "#5a7a5a", padding: "7px 0", borderBottom: "1px solid #0d1a0d", lineHeight: 1.5 }}>{n}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ══ JOINT STAFF BUDGET ══ */}
            {tab === "budget" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 4, marginBottom: 12 }}>◈ BRANCH BUDGET ALLOCATIONS (FY2024 IN BILLIONS)</div>
                    {Object.entries(branchBudgets).map(([branch, amt]) => (
                      <div key={branch} className="panel" style={{ padding: 16, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "#c8ffc8", letterSpacing: 2, textTransform: "uppercase" }}>{branch}</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <button className="btn btn-red" style={{ padding: "4px 10px" }} onClick={() => { if (amt > 10) setBranchBudgets(b => ({ ...b, [branch]: b[branch] - 10 })) }}>-$10B</button>
                          <div style={{ fontSize: 14, color: "#ffd700", width: 60, textAlign: "center", fontFamily: "Oswald,sans-serif" }}>${amt}B</div>
                          <button className="btn" style={{ padding: "4px 10px", borderColor: "#4caf50", color: "#4caf50" }} onClick={() => setBranchBudgets(b => ({ ...b, [branch]: b[branch] + 10 }))}>+$10B</button>
                        </div>
                      </div>
                    ))}
                    <div className="panel-gold" style={{ padding: 16, marginTop: 14 }}>
                      <div style={{ fontSize: 9, color: "#7a6a3a" }}>TOTAL DOD DISCRETIONARY BUDGET</div>
                      <div style={{ fontSize: 24, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>${Object.values(branchBudgets).reduce((a, b) => a + b, 0)} BILLION</div>
                    </div>

                    {/* BLACK BUDGET SIPHON */}
                    <div className="panel" style={{ padding: 16, marginTop: 14, borderLeft: "3px solid #8aaa7a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: "#c8ffc8", letterSpacing: 2 }}>CLASSIFIED SLUSH FUND</div>
                        <div style={{ fontSize: 18, color: "#4caf50", fontFamily: "Oswald,sans-serif" }}>${(banks.slushFund / 1000000).toFixed(1)}M</div>
                      </div>
                      <div style={{ fontSize: 8, color: "#5a7a5a", marginBottom: 10 }}>Siphon funds from DoD to fund Shadow Operations. Highly illegal. High risk of Congressional oversight.</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn-gold" style={{ flex: 1, fontSize: 8 }} onClick={() => {
                          const totalDod = Object.values(branchBudgets).reduce((a, b) => a + b, 0);
                          if (totalDod < 50) return notify("DOD BUDGET TOO LOW", "#e84b4b");
                          const branches = Object.keys(branchBudgets);
                          const siphonTarget = branches[Math.floor(Math.random() * branches.length)];
                          setBranchBudgets(b => ({ ...b, [siphonTarget]: Math.max(0, b[siphonTarget] - 10) }));
                          setBanks(b => ({ ...b, slushFund: b.slushFund + 5000000 }));
                          updateGeneral({ approval: Math.max(0, (general.approval || 60) - 5) });
                          notify(`Siphoned $10B from ${siphonTarget.toUpperCase()} to Slush Fund ($5M credited) (-5 AP)`, "#ffd700");
                        }}>SIPHON $10B DOD → $5M SLUSH</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "#4b9ae8", letterSpacing: 4, marginBottom: 12 }}>◈ BUDGET IMPACT ASSESSMENT</div>
                    {[{ label: "NAVY FLEET READINESS", val: branchBudgets.navy, max: 250, color: "#4b9ae8", note: "Carrier strike group deployment capability" }, { label: "AIR FORCE DETERRENCE", val: branchBudgets.airforce, max: 250, color: "#4bcde8", note: "B-21 Raider platform development" }, { label: "ARMY GROUND FORCES", val: branchBudgets.army, max: 250, color: "#4caf50", note: "Brigade combat team readiness" }, { label: "MARINE EXPEDITIONARY", val: branchBudgets.marines, max: 100, color: "#e8b84b", note: "Amphibious assault capability" }, { label: "SPACE FORCE C4ISR", val: branchBudgets.spaceforce, max: 80, color: "#9b59b6", note: "Early warning satellite constellation" }].map(b => (
                      <div key={b.label} className="panel" style={{ padding: 14, marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 4 }}>{b.label}</div>
                        <div style={{ height: 4, background: "#0a1a0a", marginBottom: 4 }}><div style={{ height: "100%", width: `${Math.min(100, (b.val / b.max) * 100)}%`, background: b.color, transition: "width 0.5s" }} /></div>
                        <div style={{ fontSize: 8, color: "#5a7a5a" }}>{b.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ PERSONNEL COMMAND ══ */}
            {tab === "personnel" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4, marginBottom: 12 }}>◈ ENLISTED HERO ROSTER — FIELD REPORTS</div>
                {heroRoster.length === 0 && <div style={{ fontSize: 10, color: "#5a7a5a", fontStyle: "italic", padding: 20 }}>No outstanding field citations yet. Heroes will appear as operations progress.</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {heroRoster.map(hero => (
                    <div key={hero.id} className="panel" style={{ padding: 16, borderLeft: "3px solid #ffd700" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#c8ffc8", letterSpacing: 1 }}>{hero.name}</div>
                        {hero.promoted && <div style={{ fontSize: 8, color: "#ffd700", border: "1px solid #ffd700", padding: "2px 6px" }}>COMMENDED</div>}
                      </div>
                      <div style={{ fontSize: 9, color: "#7a9a7a", marginBottom: 12 }}>
                        Action: <span style={{ color: "#fff" }}>{hero.action}</span><br />
                        Location: {hero.location}
                      </div>
                      {!hero.promoted && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-gold" style={{ flex: 1, padding: "6px" }} onClick={() => { setHeroRoster(r => r.map(h => h.id === hero.id ? { ...h, promoted: true } : h)); notify("Medal pinned. Morale increased.", "#ffd700"); updateGeneral({ prestige: Math.min(100, pres + 2) }); }}>PIN MEDAL (+2 PR)</button>
                          <button className="btn" style={{ flex: 1, padding: "6px", borderColor: "#4b9ae8", color: "#4b9ae8" }} onClick={() => { setHeroRoster(r => r.map(h => h.id === hero.id ? { ...h, promoted: true } : h)); notify("OVAL OFFICE MEETING ARRANGED", "#4b9ae8"); updateGeneral({ prestige: Math.min(100, pres + 8), approval: Math.max(0, ap - 5) }); }}>POTUS MEET (+8 PR, -5 AP)</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Base Visitations */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4 }}>◈ TROOP MORALE & BASE VISITATIONS</div>
                    <div style={{ fontSize: 10, color: baseMorale > 70 ? "#4caf50" : baseMorale < 30 ? "#e84b4b" : "#e8b84b", fontFamily: "Oswald,sans-serif", letterSpacing: 1 }}>OVERALL MORALE: {baseMorale}%</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {[
                      { name: "Fort Bragg (Conventional)", cost: { ap: 2, time: 1 }, morale: 5, risk: 0, desc: "Standard troop visit. Safe PR win." },
                      { name: "CENTCOM Forward Operating Base", cost: { ap: 5, time: 2 }, morale: 12, risk: 0.1, desc: "Visit active combat zone. High impact, slight risk." },
                      { name: "Classified Black Site (Undisclosed)", cost: { ap: 10, time: 3 }, morale: 25, risk: 0.3, desc: "Visit Tier 1 operators. Massive morale boost, high exposure risk." }
                    ].map((base, i) => (
                      <div key={i} className="panel" style={{ padding: 14 }}>
                        <div style={{ fontSize: 10, color: "#c8ffc8", marginBottom: 6, letterSpacing: 1 }}>{base.name}</div>
                        <div style={{ fontSize: 8, color: "#5a7a5a", marginBottom: 12, minHeight: 24 }}>{base.desc}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 12 }}>
                          <span style={{ color: "#e8b84b" }}>COST: -{base.cost.ap} AP</span>
                          <span style={{ color: "#4caf50" }}>MORALE: +{base.morale}</span>
                        </div>
                        <button className="btn" style={{ width: "100%", padding: "6px", fontSize: 8 }} onClick={() => {
                          if (ap < base.cost.ap) {
                            notify("INSUFFICIENT APPROVAL (AP) FOR THIS VISIT", "#e84b4b");
                            return;
                          }
                          const isCompromised = Math.random() < base.risk;
                          if (isCompromised) {
                            notify(`VISIT COMPROMISED: Press caught wind of ${base.name} visit.`, "#e84b4b");
                            updateGeneral({ approval: Math.max(0, ap - base.cost.ap - 5), prestige: Math.max(0, pres - 5) });
                            setBaseMorale(m => Math.min(100, m + Math.floor(base.morale / 2)));
                          } else {
                            notify(`VISIT SUCCESSFUL: Morale boosted by +${base.morale}% at ${base.name}.`, "#4caf50");
                            updateGeneral({ approval: Math.max(0, ap - base.cost.ap), prestige: Math.min(100, pres + 2) });
                            setBaseMorale(m => Math.min(100, m + base.morale));
                          }
                        }}>
                          INITIATE VISIT
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ LIVE CRISIS MISSIONS ══ */}
            {tab === "missions" && (() => {
              const active = liveMissions.filter(m => !m.resolved);
              const resolved = completedMissions.slice(0, 6);
              const focused = activeLiveMission && !activeLiveMission.resolved ? liveMissions.find(m => m.id === activeLiveMission.id) : active[0];

              const SUCCESS_CHANCE = { WAR: 0.40, EXTREME: 0.55, HIGH: 0.70, MEDIUM: 0.85, LOW: 0.95 };
              const resolveMission = (mission, option, officerId = null) => {
                const chance = SUCCESS_CHANCE[option.risk] || 0.75;
                const success = Math.random() < chance;
                const eff = option.effect;
                const multiplier = success ? 1 : -1.5;

                updateGeneral({
                  approval: Math.max(0, Math.min(100, ap + Math.round((eff.approval || 0) * (success ? 1 : -1.2)))),
                  prestige: Math.max(0, Math.min(100, pres + Math.round((eff.prestige || 0) * (success ? 1 : -1.2)))),
                  defcon: Math.max(1, Math.min(5, def + (success ? (eff.defcon || 0) : Math.abs(eff.defcon || 0) * -1))),
                });

                // Offshore bank gets mission rewards (never personal)
                if (eff.bankChange && success) setBanks(b => ({ ...b, offshore: b.offshore + eff.bankChange }));
                setEconStatus(e => ({
                  ...e,
                  marketIndex: +(e.marketIndex + (eff.approval || 0) * 0.5 * (success ? 1 : -1)).toFixed(1),
                  gdp: success ? e.gdp : +(e.gdp + mission.econImpact.gdpChange * 0.5).toFixed(1),
                }));

                // Officer XP/WIA/KIA on assigned officer
                let officerMsg = "";
                if (officerId) {
                  const xpGain = option.risk === "EXTREME" || option.risk === "WAR" ? 800 : option.risk === "HIGH" ? 450 : 250;
                  setOfficerRoster(prev => prev.map(o => {
                    if (o.id !== officerId) return o;
                    if (!success) {
                      const roll = Math.random();
                      if (roll < 0.05) { officerMsg = ` — ⚠ ${o.rank} ${o.name} KIA.`; return null; }
                      if (roll < 0.20) { officerMsg = ` — ${o.rank} ${o.name} WIA — taken off ops.`; return { ...o, status: "WIA" }; }
                    }
                    officerMsg = ` — ${o.rank} ${o.name} +${xpGain} XP.`;
                    return { ...o, xp: o.xp + xpGain };
                  }).filter(Boolean));
                }

                const debrief = success
                  ? `✓ MISSION SUCCESS: ${option.label}\n\n${option.outcome}`
                  : `✗ MISSION FAILURE: Operation compromised.\n\nYour forces encountered unexpected resistance. The ${option.label} operation failed to achieve its objectives. ${mission.econImpact.label} consequences apply.${officerMsg}`;

                notify(`${success ? "✓ SUCCESS" : "✗ FAILURE"}: ${mission.title}`, success ? "#4caf50" : "#e84b4b");
                setCompletedMissions(c => [{
                  ...mission,
                  result: success ? "SUCCESS" : "FAILED",
                  chosenOption: option.label,
                  debrief,
                  completedAt: new Date().toLocaleTimeString(),
                  officerMsg,
                }, ...c]);
                setLiveMissions(prev => prev.map(m => m.id === mission.id ? { ...m, resolved: true, result: success ? "SUCCESS" : "FAILED" } : m));
                setActiveLiveMission(null);
              };

              return (
                <div style={{ animation: "fadeUp 0.3s", height: "100%" }}>
                  {/* TOP — ECON INDICATORS */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 80px", gap: 8, marginBottom: 14 }}>
                    {[
                      { label: "ACTIVE CRISES", val: active.length, suffix: "", color: active.length > 0 ? "#e84b4b" : "#4caf50", border: "#e84b4b" },
                      { label: "GDP DELTA", val: (econStatus.gdp >= 0 ? "+" : "") + econStatus.gdp + "%", color: econStatus.gdp < 0 ? "#e84b4b" : "#4caf50", border: econStatus.gdp < 0 ? "#e84b4b" : "#4caf50" },
                      { label: "UNEMPLOYMENT Δ", val: "+" + econStatus.unemployment.toFixed(1) + "%", color: econStatus.unemployment > 0 ? "#e87a4b" : "#4caf50", border: econStatus.unemployment > 0 ? "#e87a4b" : "#4caf50" },
                      { label: "MARKET INDEX", val: econStatus.marketIndex.toFixed(0), color: econStatus.marketIndex < 100 ? "#e84b4b" : "#4caf50", border: econStatus.marketIndex < 100 ? "#e84b4b" : "#4caf50" },
                    ].map(s => (
                      <div key={s.label} className="panel" style={{ padding: "10px 12px", textAlign: "center", borderLeft: `3px solid ${s.border}` }}>
                        <div style={{ fontSize: 20, color: s.color, fontFamily: "Oswald,sans-serif", lineHeight: 1.2 }}>{s.val}</div>
                        <div style={{ fontSize: 7, color: "#3a5a3a", letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                    <div className="panel" style={{ padding: "10px 12px", textAlign: "center", borderLeft: "3px solid #ffd700" }}>
                      <div style={{ fontSize: 14, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>{completedMissions.length}</div>
                      <div style={{ fontSize: 7, color: "#3a5a3a", letterSpacing: 1, marginTop: 2 }}>RESOLVED</div>
                    </div>
                  </div>

                  {/* SITUATION ROOM — 2-COLUMN LAYOUT */}
                  <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14, alignItems: "start" }}>
                    {/* === LEFT: MISSION QUEUE === */}
                    <div>
                      <div style={{ fontSize: 8, color: "#e84b4b", letterSpacing: 3, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: active.length > 0 ? "#e84b4b" : "#4caf50", boxShadow: active.length > 0 ? "0 0 6px #e84b4b" : "none", animation: active.length > 0 ? "pulse 1s infinite" : "none" }} />
                        SITUATION QUEUE — {active.length} ACTIVE
                      </div>

                      {active.length === 0 && (
                        <div style={{ padding: 20, border: "1px solid #1a3a1a", background: "#030c03", textAlign: "center" }}>
                          <div style={{ fontSize: 20, color: "#4caf50", marginBottom: 4 }}>✓</div>
                          <div style={{ fontSize: 8, color: "#4caf50", letterSpacing: 2 }}>SITUATION CLEAR</div>
                          <div style={{ fontSize: 7, color: "#2a4a2a", marginTop: 4 }}>New crises emerge automatically. Stay vigilant.</div>
                        </div>
                      )}

                      <div style={{ maxHeight: 420, overflowY: "auto" }}>
                        {active.map(m => {
                          const pct = (m.timeLeft / m.timerSeconds) * 100;
                          const isSelected = focused?.id === m.id;
                          const timeColor = pct > 50 ? "#4caf50" : pct > 20 ? "#e8b84b" : "#e84b4b";
                          const isCrit = pct <= 20;
                          return (
                            <div key={m.id} onClick={() => setActiveLiveMission(m)}
                              style={{
                                cursor: "pointer", marginBottom: 6, padding: "10px 12px",
                                background: isSelected ? "#0a180a" : "#030c03",
                                border: `1px solid ${isSelected ? "#4caf50" : isCrit ? "#e84b4b33" : "#1a2a1a"}`,
                                borderLeft: `3px solid ${timeColor}`,
                                transition: "all 0.2s",
                                boxShadow: isCrit ? `0 0 8px #e84b4b22` : "none",
                              }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                                <div style={{ fontSize: 9, color: isSelected ? "#c8ffc8" : "#8aaa7a", letterSpacing: 1, lineHeight: 1.3, maxWidth: 160 }}>{m.title.replace("OPERATION ", "OP. ")}</div>
                                <div style={{ fontSize: 18, fontFamily: "Oswald,sans-serif", color: timeColor, animation: isCrit ? "pulse 0.8s infinite" : "none", minWidth: 40, textAlign: "right" }}>{m.timeLeft}s</div>
                              </div>
                              <div style={{ fontSize: 7, color: "#4a6a4a", marginBottom: 5 }}>{m.theater} · {m.classification}</div>
                              <div style={{ height: 2, background: "#0a1a0a", borderRadius: 1 }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: timeColor, transition: "width 1s linear", borderRadius: 1 }} />
                              </div>
                              <div style={{ fontSize: 7, color: isCrit ? "#e84b4b" : "#4a3a2a", marginTop: 4 }}>{m.econImpact.label.slice(0, 40)}...</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mission Log */}
                      {completedMissions.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 2, marginBottom: 6 }}>AFTER ACTION LOG ({completedMissions.length})</div>
                          <div style={{ maxHeight: 200, overflowY: "auto" }}>
                            {completedMissions.slice(0, 12).map((m, i) => (
                              <div key={i} onClick={() => setActiveLiveMission({ ...m, resolved: true })}
                                style={{ padding: "6px 10px", borderLeft: `2px solid ${m.result === "SUCCESS" ? "#4caf50" : "#e84b4b"}`, background: "#030803", marginBottom: 4, cursor: "pointer" }}>
                                <div style={{ fontSize: 7, color: m.result === "SUCCESS" ? "#4caf50" : m.result === "FAILED" ? "#e84b4b" : "#e8b84b" }}>
                                  {m.result === "SUCCESS" ? "✓ SUCCESS" : m.result === "FAILED" ? "✗ FAILED" : "⏎ EXPIRED"}
                                </div>
                                <div style={{ fontSize: 7, color: "#5a7a5a" }}>{m.title.replace("OPERATION ", "OP. ")}</div>
                                {m.chosenOption && <div style={{ fontSize: 6, color: "#3a5a3a" }}>{m.chosenOption.slice(0, 35)}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* === RIGHT: SITUATION ROOM DETAIL === */}
                    {focused ? (
                      focused.resolved ? (
                        // AFTER ACTION REPORT
                        <div style={{ animation: "fadeUp 0.3s" }}>
                          <div style={{
                            background: focused.result === "SUCCESS" ? "#020e04" : "#0e0204",
                            border: `1px solid ${focused.result === "SUCCESS" ? "#4caf50" : "#e84b4b"}44`,
                            borderLeft: `4px solid ${focused.result === "SUCCESS" ? "#4caf50" : "#e84b4b"}`,
                            padding: 20, marginBottom: 14,
                          }}>
                            <div style={{ fontSize: 8, color: "#5a7a5a", letterSpacing: 3, marginBottom: 4 }}>AFTER ACTION REPORT · {focused.completedAt}</div>
                            <div style={{ fontSize: 22, color: focused.result === "SUCCESS" ? "#4caf50" : "#e84b4b", fontFamily: "Oswald,sans-serif", letterSpacing: 3, marginBottom: 8 }}>
                              {focused.result === "SUCCESS" ? "✓ MISSION SUCCESS" : focused.result === "FAILED" ? "✗ MISSION FAILURE" : "⏎ MISSION EXPIRED"}
                            </div>
                            <div style={{ fontSize: 9, color: "#c8ffc8", fontFamily: "Oswald,sans-serif", letterSpacing: 2, marginBottom: 12 }}>{focused.title}</div>
                            {focused.chosenOption && <div style={{ fontSize: 8, color: "#5a7a5a", marginBottom: 10 }}>COURSE OF ACTION: <span style={{ color: "#c8b870" }}>{focused.chosenOption}</span></div>}
                            <div style={{ fontSize: 10, color: focused.result === "SUCCESS" ? "#8aaa7a" : "#aa7a7a", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                              {focused.debrief || (focused.result === "EXPIRED" ? `⚠ TIME EXPIRED — ${focused.econImpact.label}\n\nNo action was taken. ${focused.econImpact.label} economic damage has been applied.` : focused.result)}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="btn" style={{ fontSize: 9 }} onClick={() => setActiveLiveMission(null)}>← BACK TO QUEUE</button>
                          </div>
                        </div>
                      ) : (
                        // ACTIVE MISSION BRIEFING CARD
                        <div style={{ animation: "fadeUp 0.3s" }}>
                          {/* HEADER */}
                          <div style={{ background: "#080010", border: "1px solid #3a1a3a", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize: 7, color: "#9b59b6", letterSpacing: 3 }}>⚡ {focused.urgency} · {focused.classification}</div>
                              <div style={{ fontSize: 18, color: "#c8e8ff", fontFamily: "Oswald,sans-serif", letterSpacing: 3, marginTop: 2 }}>{focused.title}</div>
                              <div style={{ fontSize: 8, color: "#5a6a7a", marginTop: 2 }}>THEATRE: {focused.theater}</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{
                                fontSize: 52, fontFamily: "Oswald,sans-serif", lineHeight: 1,
                                color: (focused.timeLeft / focused.timerSeconds) > 0.25 ? "#e8b84b" : "#e84b4b",
                                textShadow: focused.timeLeft < 30 ? `0 0 20px #e84b4b` : "none",
                                animation: focused.timeLeft < 20 ? "pulse 0.4s infinite" : "none"
                              }}>{focused.timeLeft}</div>
                              <div style={{ fontSize: 7, color: "#5a3a3a", letterSpacing: 2 }}>SEC REMAINING</div>
                            </div>
                          </div>

                          {/* ECON WARNING STRIP */}
                          <div style={{ background: "#0a0300", borderLeft: `3px solid ${focused.econImpact.severity === "EXTINCTION" ? "#e84b4b" : "#e87a4b"}`, padding: "6px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 7, color: "#5a3a3a", letterSpacing: 2 }}>IF EXPIRED:</div>
                              <div style={{ fontSize: 10, color: "#e87a4b" }}>{focused.econImpact.label}</div>
                            </div>
                            <div style={{ fontSize: 8, color: focused.econImpact.severity === "EXTINCTION" ? "#e84b4b" : "#e87a4b", border: `1px solid ${focused.econImpact.severity === "EXTINCTION" ? "#e84b4b" : "#e87a4b"}44`, padding: "2px 8px" }}>{focused.econImpact.severity}</div>
                          </div>

                          {/* SITUATION BRIEF */}
                          <div className="panel" style={{ padding: 14, marginBottom: 10, maxHeight: 120, overflowY: "auto" }}>
                            <div style={{ fontSize: 7, color: "#4b9ae8", letterSpacing: 3, marginBottom: 6 }}>SITUATION BRIEF</div>
                            <div style={{ fontSize: 9, color: "#8aaa7a", lineHeight: 1.8 }}>{focused.situation}</div>
                          </div>

                          {/* OFFICER ASSIGNMENT */}
                          <div style={{ background: "#04080a", border: "1px solid #1a2a3a", padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 8, color: "#4b9ae8", letterSpacing: 1, flexShrink: 0 }}>COMMANDING OFFICER:</div>
                            <select id="officer-select-mission"
                              style={{ flex: 1, padding: "5px 8px", fontSize: 9, background: "#000", border: "1px solid #1a2a3a", color: "#c8e8ff", outline: "none", fontFamily: "monospace" }}>
                              <option value="">GEN DIRECT COMMAND</option>
                              {officerRoster.filter(o => o.status === "ACTIVE").map(o => (
                                <option key={o.id} value={o.id}>{o.rank} {o.name} — {o.specialty}</option>
                              ))}
                            </select>
                          </div>

                          {/* COA CARDS */}
                          <div style={{ fontSize: 8, color: "#e8b84b", letterSpacing: 3, marginBottom: 8 }}>SELECT COURSE OF ACTION:</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {focused.options.map((opt, i) => {
                              const chance = { WAR: 40, EXTREME: 55, HIGH: 70, MEDIUM: 85, LOW: 95 }[opt.risk] || 75;
                              return (
                                <div key={i}
                                  onClick={() => {
                                    const officerId = document.getElementById("officer-select-mission")?.value || null;
                                    resolveMission(focused, opt, officerId);
                                  }}
                                  style={{ cursor: "pointer", background: "#030c03", border: `1px solid ${opt.color}22`, borderLeft: `3px solid ${opt.color}`, padding: 14, transition: "all 0.15s" }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "#070f07"; e.currentTarget.style.borderColor = opt.color + "44"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "#030c03"; e.currentTarget.style.borderColor = opt.color + "22"; }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                      <div style={{ fontSize: 22 }}>{opt.icon}</div>
                                      <div>
                                        <div style={{ fontSize: 11, color: opt.color, letterSpacing: 2 }}>{opt.label}</div>
                                        <div style={{ display: "flex", gap: 10, fontSize: 8, marginTop: 2 }}>
                                          <span style={{ color: opt.risk === "WAR" ? "#e84b4b" : opt.risk === "EXTREME" ? "#e84b4b" : opt.risk === "HIGH" ? "#e87a4b" : "#4caf50" }}>
                                            RISK: {opt.risk}
                                          </span>
                                          <span style={{ color: "#5a7a5a" }}>SUCCESS RATE: <span style={{ color: chance >= 70 ? "#4caf50" : chance >= 55 ? "#e8b84b" : "#e84b4b" }}>{chance}%</span></span>
                                        </div>
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 6, fontSize: 8, flexShrink: 0 }}>
                                      {opt.effect.approval !== 0 && <div style={{ color: opt.effect.approval > 0 ? "#4caf50" : "#e84b4b" }}>AP{opt.effect.approval > 0 ? "+" : ""}{opt.effect.approval}</div>}
                                      {opt.effect.prestige !== 0 && <div style={{ color: "#4b9ae8" }}>PR{opt.effect.prestige > 0 ? "+" : ""}{opt.effect.prestige}</div>}
                                      {opt.effect.bankChange > 0 && <div style={{ color: "#ffd700" }}>+${(opt.effect.bankChange / 1000).toFixed(0)}K</div>}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 9, color: "#4a6a4a", lineHeight: 1.7, fontStyle: "italic" }}>"{opt.outcome.slice(0, 120)}..."</div>
                                  <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                                    <div style={{ fontSize: 8, color: opt.color, border: `1px solid ${opt.color}44`, padding: "3px 16px", letterSpacing: 2 }}>► EXECUTE</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 350, border: "1px solid #1a3a1a", background: "#020c02" }}>
                        <div style={{ textAlign: "center", color: "#2a4a2a" }}>
                          <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }}>◈</div>
                          <div style={{ fontSize: 10, letterSpacing: 4 }}>SITUATION ROOM STANDBY</div>
                          <div style={{ fontSize: 8, marginTop: 6, color: "#1a3a1a" }}>Select a crisis from the queue to begin tactical review</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ══ STATE THREATS ══ */}
            {tab === "threats" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 14 }}>◈ ISSUE STATE THREATS TO ADVERSARIES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 2, marginBottom: 10 }}>SELECT TARGET NATION:</div>
                    {[
                      { nation: "🇰🇵 North Korea", id: "dprk", risk: "EXTREME" },
                      { nation: "🇷🇺 Russia", id: "russia", risk: "HIGH" },
                      { nation: "🇨🇳 China", id: "china", risk: "HIGH" },
                      { nation: "🇮🇷 Iran", id: "iran", risk: "MEDIUM" },
                      { nation: "🇻🇪 Venezuela", id: "venezuela", risk: "LOW" },
                    ].map(t => (
                      <div key={t.id} className="panel" style={{ padding: 16, marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ fontSize: 13, color: "#c8ffc8" }}>{t.nation}</div>
                          <div style={{ fontSize: 8, color: t.risk === "EXTREME" ? "#e84b4b" : t.risk === "HIGH" ? "#e8b84b" : "#4caf50", border: `1px solid`, padding: "2px 8px" }}>{t.risk} RISK</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {[
                            { label: "DIPLOMATIC WARNING", effect: { ap: 3, pr: 2 }, severity: "low" },
                            { label: "ECONOMIC SANCTIONS", effect: { ap: 5, pr: 4 }, severity: "med" },
                            { label: "MILITARY POSTURE", effect: { ap: -5, pr: 8 }, severity: "high" },
                            { label: "DIRECT THREAT OF FORCE", effect: { ap: -15, pr: 12 }, severity: "extreme" },
                          ].map(action => {
                            const issued = stateThreats.find(s => s.nation === t.id && s.action === action.label);
                            return (
                              <button key={action.label} className={action.severity === "extreme" ? "btn btn-red" : action.severity === "high" ? "btn btn-gold" : "btn"} style={{ fontSize: 8, padding: "5px 8px", opacity: issued ? 0.5 : 1 }} disabled={!!issued} onClick={() => {
                                setStateThreats(st => [...st, { nation: t.id, action: action.label, time: Date.now() }]);
                                updateGeneral({ approval: Math.max(0, Math.min(100, ap + action.effect.ap)), prestige: Math.min(100, pres + action.effect.pr) });
                                notify(`${action.label} issued to ${t.nation}`, action.severity === "extreme" ? "#e84b4b" : "#ffd700");
                              }}>
                                {issued ? "✓ " : ""}{action.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 2, marginBottom: 10 }}>THREAT LOG:</div>
                    <div className="panel" style={{ padding: 16, minHeight: 200 }}>
                      {stateThreats.length === 0 ? (
                        <div style={{ fontSize: 9, color: "#3a5a3a", fontStyle: "italic", textAlign: "center", marginTop: 60 }}>No state threats have been issued yet.</div>
                      ) : (
                        stateThreats.slice().reverse().map((s, i) => (
                          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #0d1a0d", fontSize: 9 }}>
                            <span style={{ color: "#e84b4b" }}>{s.action}</span>
                            <span style={{ color: "#3a5a3a" }}> → </span>
                            <span style={{ color: "#c8ffc8" }}>{s.nation.toUpperCase()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ GENERAL'S QUARTERS ══ */}
            {tab === "quarters" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 4, marginBottom: 12 }}>◈ THREE-TIER FINANCIAL INFRASTRUCTURE</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, marginBottom: 14 }}>
                      <div className="panel-gold" style={{ padding: 16, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#7a6a3a", letterSpacing: 2 }}>PERSONAL ACCOUNT</div>
                          <div style={{ fontSize: 8, color: "#5a5a3a", marginTop: 4 }}>Base Salary & Clean Funds. IRS Audited.</div>
                        </div>
                        <div style={{ fontSize: 28, color: "#ffd700", fontFamily: "Oswald,sans-serif", letterSpacing: 1, textShadow: "0 0 10px #ffd70066" }}>
                          ${(banks.personal || 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="panel" style={{ padding: 16, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #1a2a4a", background: "#050a15" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#4b9ae8", letterSpacing: 2 }}>OFFSHORE SHELL (CYPRUS)</div>
                          <div style={{ fontSize: 8, color: "#5a7a9a", marginTop: 4 }}>PMC Earnings & Untraceable Corporate Wealth.</div>
                        </div>
                        <div style={{ fontSize: 28, color: "#4b9ae8", fontFamily: "Oswald,sans-serif", letterSpacing: 1, textShadow: "0 0 10px #4b9ae866" }}>
                          ${(banks.offshore || 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="panel" style={{ padding: 16, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #2a4a2a", background: "#050d05" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#4caf50", letterSpacing: 2 }}>DoD SLUSH FUND (BLACK BUDGET)</div>
                          <div style={{ fontSize: 8, color: "#5a7a5a", marginTop: 4 }}>Siphoned Pentagon Operations Capital. Highly Illegal.</div>
                        </div>
                        <div style={{ fontSize: 28, color: "#4caf50", fontFamily: "Oswald,sans-serif", letterSpacing: 1, textShadow: "0 0 10px #4caf5066" }}>
                          ${(banks.slushFund || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="panel" style={{ padding: 12, marginBottom: 14, border: "1px solid #1a1a2a", background: "#020502" }}>
                      <div style={{ fontSize: 8, color: "#8aaa7a", letterSpacing: 2, marginBottom: 8 }}>MONEY LAUNDERING & TRANSFERS</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <button className="btn" style={{ fontSize: 8, padding: "8px" }} onClick={() => {
                          if (banks.offshore >= 100000) {
                            if (Math.random() < 0.15 && !purchases.includes("Private Cayman Island")) {
                              setBanks(b => ({ ...b, offshore: b.offshore - 100000, personal: Math.max(0, b.personal - 50000) }));
                              updateGeneral({ approval: Math.max(0, ap - 5), prestige: Math.max(0, pres - 2) });
                              notify("IRS AUDIT TRIGGERED! Funds frozen. Fined $50K Personal. -5 AP", "#e84b4b");
                            } else {
                              setBanks(b => ({ ...b, offshore: b.offshore - 100000, personal: b.personal + 80000 }));
                              notify("Laundered $100k Offshore → $80k Personal (20% fee)", "#4caf50");
                            }
                          } else {
                            notify("INSUFFICIENT OFFSHORE FUNDS ($100k req)", "#e84b4b");
                          }
                        }}>Offshore → Personal ($100k) (15% Risk)</button>

                        <button className="btn btn-red" style={{ fontSize: 8, padding: "8px" }} onClick={() => {
                          if (banks.slushFund >= 1000000) {
                            if (Math.random() < 0.35 && !purchases.includes("Private Cayman Island")) {
                              setBanks(b => ({ ...b, slushFund: b.slushFund - 1000000 }));
                              updateGeneral({ approval: Math.max(0, ap - 15), prestige: Math.max(0, pres - 15) });
                              notify("CONGRESSIONAL SUBPOENA! Embezzlement discovered. -15 AP, -15 PR", "#e84b4b");
                            } else {
                              setBanks(b => ({ ...b, slushFund: b.slushFund - 1000000, offshore: b.offshore + 500000 }));
                              notify("Siphoned $1M Slush → $500k Offshore. Undetected.", "#e8b84b");
                              updateGeneral({ approval: Math.max(0, ap - 2) });
                            }
                          } else {
                            notify("INSUFFICIENT SLUSH FUNDS ($1M req)", "#e84b4b");
                          }
                        }}>Slush Fund → Offshore ($1M) (35% Risk)</button>

                        <button className="btn btn-gold" style={{ fontSize: 8, padding: "8px", gridColumn: "span 2" }} onClick={() => {
                          if (banks.personal >= 100000) {
                            setBanks(b => ({ ...b, personal: b.personal - 100000, slushFund: b.slushFund + 100000 }));
                            notify("SECURE WIRE: $100K Personal → Slush Fund. Cleaned & Ready.", "#4caf50");
                          } else {
                            notify("INSUFFICIENT PERSONAL FUNDS ($100k req)", "#e84b4b");
                          }
                        }}>PERSONAL SALARY → SLUSH FUND ($100K WIRE)</button>
                      </div>
                    </div>

                    {purchases.length > 0 && (
                      <div className="panel" style={{ padding: 12, marginBottom: 12, borderColor: "#ffd70033" }}>
                        <div style={{ fontSize: 8, color: "#7a6a3a", letterSpacing: 2, marginBottom: 6 }}>◈ ACTIVE LIFESTYLE PERKS</div>
                        {[
                          { item: "Georgetown Mansion Rent", buff: "+$5,000/tick passive income" },
                          { item: "Lobbyist Extravaganza", buff: "+1 AP/tick auto-regeneration" },
                          { item: "Private Security Detail", buff: "Immune to domestic assassination events" },
                          { item: "Swiss Bank Account", buff: "Salary doubles automatically" },
                          { item: "Private Cayman Island", buff: "Full financial immunity from investigations" },
                          { item: "Château de Luxe (Paris)", buff: "Diplomatic meetings grant +5 AP" },
                          { item: "Political Patron Network", buff: "POTUS approval events trigger bonus +5 AP" },
                        ].filter(b => purchases.includes(b.item)).map(b => (
                          <div key={b.item} style={{ fontSize: 8, color: "#c8b870", marginBottom: 3 }}>✓ {b.item} — <span style={{ color: "#4caf50" }}>{b.buff}</span></div>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 2, marginBottom: 8 }}>PRESTIGE EXPENDITURES (PERSONAL FUNDS):</div>
                    {PRESTIGE_ASSETS.map(p => {
                      const owned = purchases.includes(p.item);
                      return (
                        <div key={p.item} className="choice-card" style={{ marginBottom: 6, borderColor: owned ? "#ffd700" : "#2a2a00" }} onClick={() => {
                          if (owned) return;
                          if (banks.personal >= p.cost) {
                            setBanks(b => ({ ...b, personal: b.personal - p.cost }));
                            setPurchases(prev => [...prev, p.item]);
                            notify(`Acquired: ${p.item}`, "#ffd700");
                            updateGeneral({ prestige: Math.min(100, pres + p.pr), approval: Math.min(100, ap + p.ap) });
                          } else {
                            notify("INSUFFICIENT PERSONAL FUNDS", "#e84b4b");
                          }
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 11, color: owned ? "#ffd700" : "#c8b870", letterSpacing: 1 }}>{p.item}</div>
                              <div style={{ fontSize: 8, color: "#5a5a3a", marginTop: 2 }}>{p.desc}</div>
                            </div>
                            <div style={{ fontSize: 10, color: owned ? "#4caf50" : banks.personal >= p.cost ? "#ffd700" : "#e84b4b", fontFamily: "Oswald,sans-serif", flexShrink: 0, marginLeft: 8 }}>
                              {owned ? "OWNED" : `$${p.cost.toLocaleString()} (Personal)`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <div style={{ fontSize: 9, color: "#4b9ae8", letterSpacing: 4, marginBottom: 12 }}>◈ PMC COMMAND CENTER — AEGIS SOLUTIONS</div>
                    <div className="panel" style={{ padding: 16, border: "1px solid #1a2a4a", background: "#050a15", marginBottom: 14 }}>
                      {!general.ownsPMC ? (
                        <div style={{ textAlign: "center", padding: 10 }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>🏴</div>
                          <div style={{ fontSize: 13, color: "#4b9ae8", marginBottom: 8, letterSpacing: 2 }}>ESTABLISH SHELL PMC</div>
                          <div style={{ fontSize: 8, color: "#5a7a9a", marginBottom: 16, lineHeight: 1.7 }}>
                            Incorporate <strong style={{ color: "#c8ffc8" }}>Aegis Solutions LLC</strong> via Cyprus shell corporations. Unlocks DoD contract bidding, off-ledger operations, and personal wealth extraction pipelines from the defense budget.
                          </div>
                          <div style={{ fontSize: 10, color: "#ffd700", marginBottom: 12, fontFamily: "Oswald,sans-serif" }}>ESTABLISHMENT COST: $50,000</div>
                          <button className="btn" style={{ borderColor: "#4b9ae8", color: "#4b9ae8", width: "100%" }} onClick={() => {
                            if (banks.offshore >= 50000 || banks.personal >= 50000) {
                              if (banks.offshore >= 50000) {
                                setBanks(b => ({ ...b, offshore: b.offshore - 50000 }));
                              } else {
                                setBanks(b => ({ ...b, personal: b.personal - 50000 }));
                              }
                              updateGeneral({ ownsPMC: true, pmcStats: { name: "Aegis Solutions LLC", rep: 10, funds: 0, tier: 1, contractors: 50, drones: 0 } });
                              notify("SHADOW PMC ESTABLISHED: AEGIS SOLUTIONS LLC — DoD Clearance Level V acquired.", "#4b9ae8");
                            } else {
                              notify("INSUFFICIENT OFFSHORE OR PERSONAL FUNDS", "#e84b4b");
                            }
                          }}>AUTHORIZE WIRE TRANSFER → NICOSIA, CYPRUS</button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1a2a4a" }}>
                            <div>
                              <div style={{ fontSize: 16, color: "#c8ffc8", letterSpacing: 3, fontFamily: "Oswald,sans-serif" }}>{(general.pmcStats?.name || "AEGIS SOLUTIONS").toUpperCase()}</div>
                              <div style={{ fontSize: 8, color: "#5a7a9a", marginTop: 2 }}>OFFSHORE HOLDING · DoD CLEARANCE L-V · TIER {general.pmcStats?.tier || 1}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 20, color: "#4b9ae8", fontFamily: "Oswald,sans-serif" }}>${(banks.offshore || 0).toLocaleString()}</div>
                              <div style={{ fontSize: 7, color: "#5a5a3a" }}>PERSONAL ACCOUNTS</div>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                            {[
                              { label: "REPUTATION", val: (general.pmcStats?.rep || 10) + "/100", color: "#4caf50" },
                              { label: "CONTRACTORS", val: general.pmcStats?.contractors || 50, color: "#4b9ae8" },
                              { label: "DRONES", val: general.pmcStats?.drones || 0, color: "#e8b84b" },
                            ].map(s => (
                              <div key={s.label} style={{ background: "#0a1020", border: "1px solid #1a2a4a", padding: "8px 10px", textAlign: "center" }}>
                                <div style={{ fontSize: 16, color: s.color, fontFamily: "Oswald,sans-serif" }}>{s.val}</div>
                                <div style={{ fontSize: 7, color: "#4a6a7a", letterSpacing: 1 }}>{s.label}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ fontSize: 8, color: "#4b9ae8", letterSpacing: 2, marginBottom: 8 }}>PMC CAPABILITY UPGRADES</div>
                          {[
                            { id: "u1", label: "Recruit 50 Elite Contractors", cost: 75000, effect: "contractors +50, +10 Rep", icon: "🪖" },
                            { id: "u2", label: "Acquire 10 Reaper Drones", cost: 120000, effect: "drones +10, mission success rate +15%", icon: "🚁" },
                            { id: "u3", label: "Establish Lagos Safe House", cost: 50000, effect: "+5 Rep, Africa ops cost -20%", icon: "🏠" },
                            { id: "u4", label: "Purchase Untraceable Transport Fleet", cost: 90000, effect: "Extraction missions auto-succeed", icon: "✈️" },
                            { id: "u5", label: "Tier 2 DoD Security Clearance", cost: 200000, effect: "Higher-value DoD contracts unlocked", icon: "🏛" },
                          ].map(upg => {
                            const owned = (general.pmcUpgrades || []).includes(upg.id);
                            return (
                              <div key={upg.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", marginBottom: 6, background: owned ? "#050d05" : "#050a15", border: `1px solid ${owned ? "#4caf5044" : "#1a2a4a"}` }}>
                                <div>
                                  <div style={{ fontSize: 10, color: owned ? "#4caf50" : "#c8ffc8" }}>{upg.icon} {upg.label}</div>
                                  <div style={{ fontSize: 8, color: "#4a7a9a", marginTop: 2 }}>{upg.effect}</div>
                                </div>
                                {owned ? (
                                  <div style={{ fontSize: 8, color: "#4caf50", letterSpacing: 2 }}>✓ ACTIVE</div>
                                ) : (
                                  <button className="btn" style={{ fontSize: 8, padding: "4px 10px", borderColor: bankBalance >= upg.cost ? "#4b9ae8" : "#e84b4b", color: bankBalance >= upg.cost ? "#4b9ae8" : "#e84b4b" }}
                                    onClick={() => {
                                      if (banks.personal < upg.cost) { notify("INSUFFICIENT FUNDS", "#e84b4b"); return; }
                                      setBanks(b => ({ ...b, personal: b.personal - upg.cost }));
                                      updateGeneral({ pmcUpgrades: [...(general.pmcUpgrades || []), upg.id], pmcStats: { ...general.pmcStats, rep: Math.min(100, (general.pmcStats?.rep || 10) + 10), contractors: (general.pmcStats?.contractors || 50) + (upg.id === "u1" ? 50 : 0), drones: (general.pmcStats?.drones || 0) + (upg.id === "u2" ? 10 : 0) } });
                                      notify(`PMC UPGRADE: ${upg.label}`, "#4b9ae8");
                                    }}>
                                    ${upg.cost.toLocaleString()}
                                  </button>
                                )}
                              </div>
                            );
                          })}

                          <div style={{ fontSize: 8, color: "#ffd700", letterSpacing: 2, marginTop: 14, marginBottom: 8 }}>DoD CONTRACT BIDDING — BUDGET EXTRACTION</div>
                          {[
                            { id: "dod1", label: "Base Security — Bagram", value: 80000, risk: 0.1, desc: "Low risk, steady payout." },
                            { id: "dod2", label: "SOCOM Logistics — Qatar", value: 180000, risk: 0.2, desc: "Off-ledger SOCOM supply chain." },
                            { id: "dod3", label: "Counter-IED Training — Iraq", value: 250000, risk: 0.25, desc: "Inflated invoices, no questions." },
                            { id: "dod4", label: "Armed Escort — Hormuz", value: 350000, risk: 0.3, desc: "Navy looks the other way." },
                            { id: "dod5", label: "Deep Cover Surveillance — Yemen", value: 500000, risk: 0.4, desc: "Classified JSOC tasking. High exposure." },
                          ].map(contract => {
                            const isBid = (general.dodContracts || []).includes(contract.id);
                            return (
                              <div key={contract.id} style={{ padding: "8px 12px", marginBottom: 6, border: `1px solid ${isBid ? "#ffd70033" : "#1a2000"}`, background: "#080800" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <div style={{ fontSize: 10, color: isBid ? "#4caf50" : "#c8b870" }}>{contract.label}</div>
                                  <div style={{ fontSize: 10, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>${contract.value.toLocaleString()}</div>
                                </div>
                                <div style={{ fontSize: 8, color: "#5a5a3a", marginBottom: 6 }}>{contract.desc} · Risk: <span style={{ color: contract.risk > 0.3 ? "#e84b4b" : "#e8b84b" }}>{Math.round(contract.risk * 100)}%</span></div>
                                {isBid ? (
                                  <div style={{ fontSize: 8, color: "#4caf50", letterSpacing: 2 }}>✓ FUNDS DEPOSITED</div>
                                ) : (
                                  <button className="btn btn-gold" style={{ fontSize: 8, padding: "4px 12px", width: "100%" }}
                                    onClick={() => {
                                      const success = Math.random() > contract.risk;
                                      if (success) {
                                        setBanks(b => ({ ...b, personal: b.personal + contract.value }));
                                        updateGeneral({ dodContracts: [...(general.dodContracts || []), contract.id], pmcStats: { ...general.pmcStats, rep: Math.min(100, (general.pmcStats?.rep || 10) + 5) } });
                                        notify(`DoD Contract Won: +$${contract.value.toLocaleString()} deposited`, "#ffd700");
                                      } else {
                                        notify("Contract bid rejected — oversight flagged. Lay low.", "#e84b4b");
                                      }
                                    }}>▶ BID ON CONTRACT</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: 9, color: "#8aaa7a", letterSpacing: 4, marginBottom: 10 }}>◈ ACQUIRED ASSETS INVENTORY</div>
                    <div className="panel" style={{ padding: 16, border: "1px solid #1a2a1a", minHeight: 80 }}>
                      {purchases.length === 0 ? (
                        <div style={{ fontSize: 9, color: "#3a5a3a", fontStyle: "italic", textAlign: "center", marginTop: 16 }}>You live a Spartan life. No luxuries acquired.</div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {purchases.map(pName => {
                            const pAsset = PRESTIGE_ASSETS.find(a => a.item === pName) || { icon: "🏆", type: "Unknown" };
                            return (
                              <div key={pName} style={{ display: "flex", gap: 10, alignItems: "center", background: "#050a05", border: "1px solid #1a2a1a", padding: "8px 10px" }}>
                                <div style={{ fontSize: 18, background: "#000", border: "1px solid #c8b87044", padding: "4px", borderRadius: 4 }}>{pAsset.icon}</div>
                                <div>
                                  <div style={{ fontSize: 9, color: "#c8b870", letterSpacing: 1 }}>{pName}</div>
                                  <div style={{ fontSize: 7, color: "#5a7a5a", marginTop: 2, textTransform: "uppercase" }}>{pAsset.type} ASSET</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ SHADOW OPERATIONS (CONTRACTORS) ══ */}
            {tab === "shadow" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4 }}>◈ DENIABLE ASSETS & PRIVATE CONTRACTORS</div>
                  <div style={{ fontSize: 12, color: "#4caf50", fontFamily: "Oswald,sans-serif", padding: "4px 12px", border: "1px solid #4caf50" }}>BLACK BUDGET (SLUSH): ${(banks.slushFund / 1000000).toFixed(1)}M</div>
                </div>
                {tick < 100 && <div style={{ fontSize: 10, color: "#5a7a5a", fontStyle: "italic", padding: 20 }}>Encrypted channels establishing... Please wait.</div>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Active Contracts */}
                  <div className="panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: 9, color: "#7a9a7a", letterSpacing: 2, marginBottom: 10 }}>ACTIVE SHADOW CONTRACTS</div>
                    {activeContracts.length === 0 ? <div style={{ fontSize: 8, color: "#4a5a4a", fontStyle: "italic" }}>No active black operations.</div> :
                      activeContracts.map(c => (
                        <div key={c.id} style={{ marginBottom: 12, borderBottom: "1px solid #1a2a1a", paddingBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 10, color: "#c8ffc8" }}>{c.name}</div>
                            <div style={{ fontSize: 8, color: c.status === "ACTIVE" ? "#e8b84b" : c.status === "SUCCESS" ? "#4caf50" : "#e84b4b" }}>{c.status}</div>
                          </div>
                          <div style={{ fontSize: 8, color: "#5a7a5a", marginTop: 4 }}>{c.contractor}</div>
                          {c.status === "ACTIVE" && (
                            <div style={{ height: 2, background: "#0a1a0a", marginTop: 6 }}>
                              <div style={{ height: "100%", width: `${c.progress}%`, background: "#4caf50", transition: "width 1s linear" }} />
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>

                  {/* Available Ops & Weapons Deals */}
                  <div>
                    <div style={{ fontSize: 9, color: "#e8b84b", letterSpacing: 2, marginBottom: 10 }}>AVAILABLE BLACK CONTRACTS</div>
                    {[
                      { name: "Regime Decapitation", desc: "Aegis Defense eliminates a hostile African dictator. Total deniability guaranteed.", cost: 15, contractor: "Aegis Defense", risk: 0.3, reward: { pr: 15, ap: 5 }, penalty: { pr: 20, ap: 25 }, tag: "ASSASSINATION" },
                      { name: "Rogue Arsenal Destruction", desc: "Obsidian Group sabotages an illegal enrichment facility in Iran. No US footprint.", cost: 25, contractor: "Obsidian Group", risk: 0.4, reward: { pr: 25, ap: 10 }, penalty: { pr: 15, ap: 15 }, tag: "SABOTAGE" },
                      { name: "Prototype Drone Procurement", desc: "Under-the-table deal with Raytheon: 50 unregistered autonomous swarm drones.", cost: 35, contractor: "Raytheon (Black Book)", risk: 0.1, reward: { pr: 10, ap: 0 }, penalty: { pr: 5, ap: 10 }, tag: "WEAPONS DEAL" },
                      { name: "Whistleblower Suppression", desc: "A journalist has obtained classified budget documents. Iron Falcon will handle the situation discretely.", cost: 20, contractor: "Iron Falcon Solutions", risk: 0.35, reward: { pr: 8, ap: 12 }, penalty: { pr: 5, ap: 30 }, tag: "DOMESTIC" },
                      { name: "Opposition Research Package", desc: "Scorpion Analytics will compile comprehensive dossiers on political opponents using NSA intercepts.", cost: 18, contractor: "Scorpion Analytics", risk: 0.25, reward: { pr: 5, ap: 10 }, penalty: { pr: 0, ap: 20 }, tag: "INTEL" },
                      { name: "Senate Committee Soil Operation", desc: "Phantom Strategies will position assets inside the SASC oversight committee to alert us to investigations.", cost: 30, contractor: "Phantom Strategies", risk: 0.2, reward: { pr: 0, ap: 20 }, penalty: { pr: 0, ap: 40 }, tag: "INFILTRATION" },
                      { name: "Advanced EMP Arsenal", desc: "Greystone Dynamics back-channels a shipment of classified EMP payloads. No Congressional notification.", cost: 50, contractor: "Greystone Dynamics", risk: 0.15, reward: { pr: 20, ap: 0 }, penalty: { pr: 10, ap: 15 }, tag: "WEAPONS DEAL" },
                    ].map((op, i) => (
                      <div key={i} className="panel" style={{ padding: 12, marginBottom: 8, borderColor: "#2a2a0a", borderLeft: `3px solid ${op.tag === "ASSASSINATION" ? "#e84b4b" : op.tag === "WEAPONS DEAL" ? "#ffd700" : op.tag === "DOMESTIC" ? "#9b59b6" : "#4b9ae8"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ fontSize: 10, color: "#c8b870" }}>{op.name}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <div style={{ fontSize: 7, color: op.tag === "ASSASSINATION" ? "#e84b4b" : op.tag === "WEAPONS DEAL" ? "#ffd700" : op.tag === "DOMESTIC" ? "#9b59b6" : "#4b9ae8", border: "1px solid", padding: "1px 5px", borderColor: op.tag === "ASSASSINATION" ? "#e84b4b" : op.tag === "WEAPONS DEAL" ? "#ffd700" : op.tag === "DOMESTIC" ? "#9b59b6" : "#4b9ae8" }}>{op.tag}</div>
                            <div style={{ fontSize: 10, color: "#4caf50", fontFamily: "Oswald,sans-serif" }}>${op.cost}B</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 8, color: "#5a5a3a", marginBottom: 4 }}>{op.desc}</div>
                        <div style={{ fontSize: 7, color: "#4a5a4a", marginBottom: 8 }}>Via: {op.contractor} · Risk: <span style={{ color: op.risk > 0.3 ? "#e84b4b" : "#e8b84b" }}>{Math.round(op.risk * 100)}% intercept probability</span></div>
                        <button className="btn btn-gold" style={{ fontSize: 8, width: "100%", padding: 6 }}
                          disabled={banks.slushFund < op.cost || activeContracts.length >= 5}
                          onClick={() => {
                            setBanks(b => ({ ...b, slushFund: b.slushFund - op.cost }));
                            setActiveContracts(prev => [...prev, { id: Date.now(), name: op.name, contractor: op.contractor, progress: 0, status: "ACTIVE", risk: op.risk, reward: op.reward, penalty: op.penalty }]);
                            notify(`Contract Authorized: ${op.contractor}`, "#ffd700");
                            updateGeneral({ prestige: Math.min(100, (general.prestige || 60) + 2) });
                          }}
                        >
                          {banks.slushFund < op.cost ? "INSUFFICIENT BLACK FUNDS" : `AUTHORIZE DIRECT TRANSFER $${op.cost}B`}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* JAIL / BLACK SITE SYSTEM */}
                  <div style={{ gridColumn: "1 / -1", marginTop: 14 }}>
                    <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 12 }}>◈ UNDISCLOSED BLACK SITE FACILITY — EXTRALEGAL DETENTION WING</div>
                    <div className="panel" style={{ padding: 16, border: "1px solid #3a1a1a", borderLeft: "4px solid #e84b4b" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#ffb4b4", letterSpacing: 2 }}>CLASSIFIED DETENTION WING — NO JUDICIAL OVERSIGHT</div>
                          <div style={{ fontSize: 8, color: "#a85a5a", marginTop: 4 }}>Extralegal holding facility. No legal representation. No public record. Maximum deniability.</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, color: "#e84b4b", fontFamily: "Oswald,sans-serif" }}>{detained.length}</div>
                          <div style={{ fontSize: 7, color: "#a85a5a" }}>CURRENT INMATES</div>
                        </div>
                      </div>

                      {detained.length === 0 ? (
                        <div style={{ fontSize: 10, color: "#5a3a3a", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>ALL CELLS EMPTY. NO ACTIVE DETAINEES.</div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                          {detained.map(inmate => (
                            <div key={inmate.id} className="panel" style={{ padding: 12, background: "#050202", border: "1px solid #4a1a1a" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: "#ffc8c8", fontWeight: "bold" }}>{inmate.name}</div>
                                <div style={{ fontSize: 7, color: "#e8b84b", border: "1px solid #e8b84b", padding: "2px 6px" }}>{inmate.type}</div>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#a87a7a", marginBottom: 12 }}>
                                <span>STATUS: <span style={{ color: inmate.status === "INTERROGATION" ? "#e84b4b" : inmate.status === "DISAPPEARED" ? "#9b59b6" : "#4caf50" }}>{inmate.status}</span></span>
                                <span>INTEL: <span style={{ color: "#4b9ae8" }}>{inmate.intelYield}%</span></span>
                              </div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                <button className="btn btn-red" style={{ flex: 1, fontSize: 7, padding: "5px" }} onClick={() => {
                                  if (inmate.intelYield >= 100) return notify("SUBJECT EXHAUSTED - NO FURTHER INTEL", "#e84b4b");
                                  setDetained(prev => prev.map(d => d.id === inmate.id ? { ...d, status: "INTERROGATION", intelYield: Math.min(100, d.intelYield + 15) } : d));
                                  updateGeneral({ prestige: Math.min(100, pres + 2) });
                                  notify(`Enhanced Interrogation authorized for ${inmate.name}. +2 PR`, "#e84b4b");
                                }}>🩸 INTERROGATE (+2 PR)</button>
                                <button className="btn" style={{ flex: 1, fontSize: 7, padding: "5px" }} onClick={() => {
                                  setDetained(prev => prev.filter(d => d.id !== inmate.id));
                                  updateGeneral({ approval: Math.min(100, ap + 5) });
                                  notify(`${inmate.name} Released / Exchanged. +5 AP`, "#4caf50");
                                }}>🤝 RELEASE (+5 AP)</button>
                                <button style={{ flex: "0 0 100%", fontSize: 7, padding: "5px", background: "#06000f", border: "1px solid #6a3a9b", color: "#c8b8ff", cursor: "pointer", fontFamily: "Share Tech Mono,monospace", letterSpacing: 1 }} onClick={() => {
                                  if (inmate.status === "DISAPPEARED") return notify("SUBJECT ALREADY DISAPPEARED", "#9b59b6");
                                  setDetained(prev => prev.map(d => d.id === inmate.id ? { ...d, status: "DISAPPEARED" } : d));
                                  updateGeneral({ prestige: Math.min(100, pres + 5), approval: Math.max(0, ap - 8) });
                                  notify(`${inmate.name} DISAPPEARED. No record exists. -8 AP +5 PR`, "#9b59b6");
                                }}>👁‍🗨 DISAPPEAR — NO RECORD [-8 AP, +5 PR]</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* NAMED ARREST TARGETS */}
                      <div style={{ paddingTop: 14, borderTop: "1px solid #2a1a1a" }}>
                        <div style={{ fontSize: 9, color: "#9b59b6", letterSpacing: 3, marginBottom: 10 }}>⛓ RENDITION TARGETS — AUTHORIZE ARREST / EXTRAORDINARY RENDITION</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          {[
                            { name: "Sen. Lisa Hartwell", type: "POLITICAL DISSIDENT", desc: "Senate Finance Chair blocking DoD budget. Has classified audit subpoena pending.", intel: 25, cost: 0 },
                            { name: "Dir. Frank Hoover", type: "LAW ENFORCEMENT HVT", desc: "FBI Director opened investigation into Pentagon slush fund operations. Must be silenced.", intel: 40, cost: 0 },
                            { name: "J. Marcus (NYT)", type: "WHISTLEBLOWER", desc: "Journalist with classified Pentagon documents via inside source. Intercept confirmed.", intel: 30, cost: 0 },
                            { name: "Gen. V. Morozov (GRU)", type: "DEFECTOR / POW", desc: "Russian GRU defector with SIGINT files. Extraordinary rendition from Budapest airport.", intel: 80, cost: 5000000 },
                            { name: "Khalil 'The Ghost'", type: "TERRORIST HVT", desc: "Al-Qaeda logistics chief. Unacknowledged JSOC detention in Pakistan. High value.", intel: 45, cost: 0 },
                            ...(isJunta
                              ? [{ name: "THE FORMER PRESIDENT", type: "DEPOSED COMMANDER-IN-CHIEF", desc: "Detained following the successful Military Coup. Held incommunicado. JUNTA ORDER-1.", intel: 60, cost: 0 }]
                              : [{ name: "THE PRESIDENT", type: "🔒 REQUIRES COUP", desc: "Cannot be detained under current constitutional authority. Execute the Military Coup first.", intel: 0, cost: -1 }]
                            ),
                          ].map((target, i) => {
                            const alreadyDetained = detained.some(d => d.name === target.name);
                            const isLocked = target.cost === -1;
                            return (
                              <div key={i} style={{ padding: "10px 12px", background: "#080100", border: `1px solid ${isLocked ? "#1a0a0a" : alreadyDetained ? "#4caf5022" : "#3a1010"}`, opacity: isLocked ? 0.4 : 1 }}>
                                <div style={{ fontSize: 9, color: isLocked ? "#3a2a2a" : "#ffc8c8", marginBottom: 3, fontWeight: "bold" }}>{target.name}</div>
                                <div style={{ fontSize: 6, color: "#8a4a3a", border: "1px solid #3a1a1a", display: "inline-block", padding: "1px 5px", marginBottom: 5, letterSpacing: 1 }}>{target.type}</div>
                                <div style={{ fontSize: 7, color: "#5a3a3a", marginBottom: 8, lineHeight: 1.5 }}>{target.desc}</div>
                                {alreadyDetained ? (
                                  <div style={{ fontSize: 7, color: "#4caf50", letterSpacing: 1 }}>✓ IN CUSTODY AT BLACK SITE</div>
                                ) : isLocked ? (
                                  <div style={{ fontSize: 7, color: "#3a2020", letterSpacing: 1 }}>🔒 COUP REQUIRED TO DETAIN</div>
                                ) : (
                                  <button className="btn btn-red" style={{ width: "100%", fontSize: 7, padding: "5px" }} onClick={() => {
                                    if (target.cost > 0 && banks.slushFund < target.cost) {
                                      notify(`RENDITION REQUIRES $${(target.cost / 1000000).toFixed(0)}M FROM SLUSH FUND`, "#e84b4b"); return;
                                    }
                                    if (target.cost > 0) setBanks(b => ({ ...b, slushFund: b.slushFund - target.cost }));
                                    setDetained(prev => [...prev, { id: `bsite_${Date.now()}`, name: target.name, type: target.type, status: "PROCESSING", intelYield: target.intel }]);
                                    updateGeneral({ prestige: Math.min(100, pres + 3), approval: Math.max(0, ap - 5) });
                                    notify(`${target.name} detained at classified Black Site. -5 AP +3 PR`, "#9b59b6");
                                  }}>
                                    {target.cost > 0 ? `⛓ RENDITION (-$${(target.cost / 1000000).toFixed(0)}M Slush)` : "⛓ ORDER ARREST & RENDITION"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ CIA INTELLIGENCE GRID ══ */}
            {tab === "cia" && (() => {
              const CIA_REGIONS = [
                { id: "eurasia", label: "EURASIA", threat: "HIGH", icon: "🌐", assets: 12, color: "#4b9ae8", intel: ["FSB operating in Moldova", "Wagner Group active in Belarus", "GRU signals intercepted near NATO border"], cover: 72 },
                { id: "mideast", label: "MIDDLE EAST", threat: "EXTREME", icon: "☪", assets: 24, color: "#e84b4b", intel: ["IRGC accelerating enrichment at Natanz", "Hezbollah arms shipment via Latakia", "Houthi targeting data obtained from UAE SIGINT"], cover: 61 },
                { id: "asia", label: "EAST ASIA", threat: "HIGH", icon: "🌏", assets: 18, color: "#e8b84b", intel: ["PLA 5th Fleet repositioning", "DPRK engineers spotted at ICBM facility", "Taiwan Strait carrier transits increasing"], cover: 85 },
                { id: "africa", label: "SUB-SAHARAN AFRICA", threat: "MEDIUM", icon: "🌍", assets: 8, color: "#4caf50", intel: ["Wagner recruiting in Mali via social media", "Oil infrastructure sabotage planned in Niger Delta", "Chinese surveillance station construction underway"], cover: 58 },
                { id: "latam", label: "LATIN AMERICA", threat: "MEDIUM", icon: "🌎", assets: 6, color: "#e8b84b", intel: ["Venezuelan regime acquiring Russian EW systems", "Cartel-military nexus in northern Mexico escalating", "Cuban intelligence officers training SEBIN"], cover: 78 },
                { id: "homefront", label: "DOMESTIC (FBI/JTF)", threat: "ELEVATED", icon: "🏠", assets: 32, color: "#9b59b6", intel: ["Foreign agents embedded in DC contractor scene", "Suspected exfil network via diplomatic pouches", "Extremist chatter elevated near upcoming election"], cover: 91 },
              ];
              const ciaAssets = general.ciaAssets || {};
              const totalAssets = 40;
              const deployed = Object.values(ciaAssets).reduce((a, b) => a + (b || 0), 0);
              const available = totalAssets - deployed;
              return (
                <div style={{ animation: "fadeUp 0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: "#4b9ae8", letterSpacing: 4 }}>◈ CIA CLANDESTINE SERVICE — GLOBAL ASSET GRID</div>
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, color: "#4b9ae8", fontFamily: "Oswald,sans-serif" }}>{deployed}</div>
                        <div style={{ fontSize: 7, color: "#5a7a9a", letterSpacing: 2 }}>DEPLOYED</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, color: "#4caf50", fontFamily: "Oswald,sans-serif" }}>{available}</div>
                        <div style={{ fontSize: 7, color: "#5a7a5a", letterSpacing: 2 }}>AVAILABLE</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    {CIA_REGIONS.map(region => {
                      const assigned = ciaAssets[region.id] || 0;
                      const coverPct = Math.min(100, region.cover + assigned * 2);
                      return (
                        <div key={region.id} className="panel" style={{ padding: 16, borderLeft: `3px solid ${region.color}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize: 11, color: region.color, letterSpacing: 2 }}>{region.icon} {region.label}</div>
                              <div style={{ fontSize: 8, color: region.threat === "EXTREME" ? "#e84b4b" : region.threat === "HIGH" ? "#e8b84b" : "#4caf50", marginTop: 2, letterSpacing: 2 }}>{region.threat} THREAT · {region.assets} KNOWN ASSETS</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 20, color: region.color, fontFamily: "Oswald,sans-serif" }}>{assigned}</div>
                              <div style={{ fontSize: 7, color: "#5a7a5a" }}>AGENTS</div>
                            </div>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#5a7a5a", marginBottom: 3 }}>
                              <span>COVER INTEGRITY</span><span style={{ color: coverPct > 70 ? "#4caf50" : "#e84b4b" }}>{coverPct}%</span>
                            </div>
                            <div style={{ height: 3, background: "#0a1a0a" }}>
                              <div style={{ height: "100%", width: `${coverPct}%`, background: coverPct > 70 ? "#4caf50" : "#e84b4b", transition: "width 0.5s" }} />
                            </div>
                          </div>
                          <div style={{ fontSize: 8, color: "#4a5a4a", marginBottom: 10, fontStyle: "italic", lineHeight: 1.5 }}>
                            ◈ Latest: {region.intel[Math.floor((tick || 0) / 50) % region.intel.length]}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn" style={{ flex: 1, fontSize: 8, padding: "4px 0" }} disabled={available <= 0}
                              onClick={() => {
                                if (available <= 0) return notify("NO AVAILABLE CIA ASSETS", "#e84b4b");
                                updateGeneral({ ciaAssets: { ...ciaAssets, [region.id]: assigned + 1 } });
                                notify(`Asset deployed to ${region.label}`, "#4b9ae8");
                              }}>+ DEPLOY ASSET</button>
                            <button className="btn btn-red" style={{ flex: 1, fontSize: 8, padding: "4px 0" }} disabled={assigned <= 0}
                              onClick={() => {
                                if (assigned <= 0) return;
                                updateGeneral({ ciaAssets: { ...ciaAssets, [region.id]: assigned - 1 } });
                                notify(`Asset recalled from ${region.label}`, "#e8b84b");
                              }}>– RECALL</button>
                            <button className="btn btn-gold" style={{ fontSize: 8, padding: "4px 8px" }}
                              onClick={() => {
                                if (assigned < 3) return notify(`INSUFFICIENT ASSETS IN ${region.label} — need 3+`, "#e84b4b");
                                updateGeneral({ prestige: Math.min(100, pres + 4), approval: Math.min(100, ap + 2) });
                                notify(`INTEL HARVEST: ${region.label} — classified data exfiltrated. +4 PR, +2 AP`, "#4b9ae8");
                              }}>⚡ HARVEST INTEL</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CIA Covert Action Panel */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: 9, color: "#4b9ae8", letterSpacing: 4, marginBottom: 12 }}>◈ COVERT ACTION AUTHORITIES</div>
                      {[
                        { label: "PRESIDENTIAL FINDING — IRAN", desc: "Authorize disruption of IRGC procurement networks", cost: 8, effect: { ap: -3, pr: 12 } },
                        { label: "INFLUENCE OPERATION — EASTERN EUROPE", desc: "Deploy IO assets to counter Russian disinfo campaigns", cost: 5, effect: { ap: 5, pr: 8 } },
                        { label: "RENDITION AUTHORIZATION", desc: "Extraordinary rendition of HVT from partner territory", cost: 12, effect: { ap: -8, pr: 15 } },
                        { label: "COUNTERINTEL SWEEP — DOMESTIC", desc: "FBI/CIA joint sweep of foreign agent networks", cost: 6, effect: { ap: 6, pr: 5 } },
                      ].map((action, i) => (
                        <div key={i} className="choice-card" style={{ marginBottom: 8, borderColor: "#1a2a4a" }} onClick={() => {
                          if (banks.slushFund < action.cost) return notify("INSUFFICIENT BLACK BUDGET", "#e84b4b");
                          setBanks(b => ({ ...b, slushFund: b.slushFund - action.cost }));
                          updateGeneral({ approval: Math.max(0, Math.min(100, ap + action.effect.ap)), prestige: Math.max(0, Math.min(100, pres + action.effect.pr)) });
                          notify(`AUTHORIZED: ${action.label}`, "#4b9ae8");
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 9, color: "#8abbff", letterSpacing: 1, marginBottom: 2 }}>{action.label}</div>
                              <div style={{ fontSize: 7, color: "#4a5a6a" }}>{action.desc}</div>
                            </div>
                            <div style={{ textAlign: "right", marginLeft: 8 }}>
                              <div style={{ fontSize: 9, color: "#4caf50" }}>${action.cost}B</div>
                              <div style={{ fontSize: 7, color: action.effect.ap > 0 ? "#4caf50" : "#e84b4b" }}>AP{action.effect.ap > 0 ? "+" : ""}{action.effect.ap}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 12 }}>◈ ACTIVE ESPIONAGE EVENTS</div>
                      {[
                        { event: "MOLE IN NSC STAFF", severity: "CRITICAL", detail: "CI analysis flagged anomalous access patterns in 3 senior staff. Data exfil to foreign IP confirmed.", action: "NEUTRALIZE", color: "#e84b4b" },
                        { event: "FOREIGN HONEY TRAP — PENTAGON", severity: "HIGH", detail: "DIA officer P. Kerrigan suspected of contact with foreign national. Surveillance underway.", action: "SURVEIL", color: "#e8b84b" },
                        { event: "CHINESE SATELLITE TRACKING OFFICIAL", severity: "MEDIUM", detail: "SECDEF travel patterns appear in PLA intercepts. Source CARDINAL confirms physical surveillance.", action: "COUNTER-SURVEIL", color: "#4b9ae8" },
                      ].map((ev, i) => (
                        <div key={i} style={{ background: "#050a15", border: `1px solid ${ev.color}33`, borderLeft: `3px solid ${ev.color}`, padding: 12, marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <div style={{ fontSize: 9, color: ev.color, letterSpacing: 1 }}>{ev.event}</div>
                            <div style={{ fontSize: 7, color: ev.color, border: `1px solid ${ev.color}`, padding: "1px 6px" }}>{ev.severity}</div>
                          </div>
                          <div style={{ fontSize: 8, color: "#5a7a9a", lineHeight: 1.5, marginBottom: 8 }}>{ev.detail}</div>
                          <button className="btn" style={{ fontSize: 8, borderColor: ev.color, color: ev.color, width: "100%" }}
                            onClick={() => { updateGeneral({ prestige: Math.min(100, pres + 6) }); notify(`${ev.action} ordered — CI team deployed. +6 PR`, ev.color); }}>
                            ▶ ORDER {ev.action}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ══ SECRET SERVICE COMMAND ══ */}
            {tab === "secretservice" && (() => {
              const protectionLevel = general.ssProtectionLevel || "STANDARD";
              const pentagonOrders = general.ssOrders || [];
              const SS_ALERT_LEVELS = [
                { id: "STANDARD", label: "STANDARD DETAIL", color: "#4caf50", desc: "18-agent protective detail. Standard protocols active." },
                { id: "ELEVATED", label: "ELEVATED POSTURE", color: "#e8b84b", desc: "24-agent detail, counter-sniper teams deployed, venue pre-sweeps." },
                { id: "MAXIMUM", label: "MAXIMUM PROTECTION", color: "#e87a4b", desc: "36-agent detail, JSOC QRF on standby, electronic countermeasures active." },
                { id: "LOCKDOWN", label: "EXECUTIVE LOCKDOWN", color: "#e84b4b", desc: "POTUS movement suspended. Bunker protocols initiated. NMCC on standby." },
              ];
              const currentLevel = SS_ALERT_LEVELS.find(l => l.id === protectionLevel) || SS_ALERT_LEVELS[0];

              return (
                <div style={{ animation: "fadeUp 0.3s" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Left — Protection Level & Pentagon Orders */}
                    <div>
                      <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4, marginBottom: 12 }}>◈ PRESIDENTIAL PROTECTION STATUS</div>

                      {/* Current Status Card */}
                      <div className="panel-gold" style={{ padding: 20, marginBottom: 14, border: `2px solid ${currentLevel.color}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 8, color: "#7a6a3a", letterSpacing: 3 }}>CURRENT POSTURE</div>
                            <div style={{ fontSize: 14, color: currentLevel.color, letterSpacing: 3, fontFamily: "Oswald,sans-serif" }}>{currentLevel.label}</div>
                          </div>
                          <div style={{ fontSize: 36 }}>🛡</div>
                        </div>
                        <div style={{ fontSize: 9, color: "#8a8a6a", lineHeight: 1.6, marginBottom: 14 }}>{currentLevel.desc}</div>
                        <div style={{ fontSize: 8, color: "#4caf50" }}>POTUS LOCATION: SECURE · TRACKING ACTIVE · COMMS ENCRYPTED</div>
                      </div>

                      {/* Alert Level Selection */}
                      <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 3, marginBottom: 10 }}>PENTAGON ORDER — ADJUST PROTECTION LEVEL:</div>
                      {SS_ALERT_LEVELS.map(level => (
                        <div key={level.id} className="choice-card" style={{ marginBottom: 6, borderColor: level.id === protectionLevel ? level.color : "#2a2a00", borderLeft: `3px solid ${level.color}` }}
                          onClick={() => {
                            updateGeneral({ ssProtectionLevel: level.id });
                            const apChange = level.id === "LOCKDOWN" ? -5 : level.id === "MAXIMUM" ? 8 : level.id === "ELEVATED" ? 5 : 2;
                            updateGeneral({ approval: Math.max(0, Math.min(100, ap + apChange)), ssOrders: [...(general.ssOrders || []), { order: `${level.label} AUTHORIZED`, time: new Date().toLocaleTimeString() }] });
                            notify(`SECRET SERVICE: ${level.label} ORDER ISSUED FROM PENTAGON`, level.color);
                          }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 9, color: level.color, letterSpacing: 1 }}>{level.label}</div>
                              <div style={{ fontSize: 7, color: "#4a5a4a", marginTop: 2 }}>{level.desc.slice(0, 55)}...</div>
                            </div>
                            {level.id === protectionLevel && <div style={{ fontSize: 9, color: level.color }}>● ACTIVE</div>}
                          </div>
                        </div>
                      ))}

                      {/* Pentagon Order Log */}
                      {pentagonOrders.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 3, marginBottom: 8 }}>PENTAGON ORDERS ISSUED:</div>
                          <div className="panel" style={{ padding: 12, maxHeight: 200, overflowY: "auto" }}>
                            {pentagonOrders.slice().reverse().slice(0, 8).map((o, i) => (
                              <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #0d1a0d", fontSize: 8, color: "#7a9a7a" }}>
                                <span style={{ color: "#4caf50" }}>{o.time}</span> — {o.order}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right — Threat Assessment & Joint Operations */}
                    <div>
                      <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 12 }}>◈ ACTIVE THREATS TO POTUS</div>
                      {[
                        { threat: "SUSPECTED ASSASSINATION PLOT — FOREIGN STATE ACTOR", level: "CRITICAL", source: "NSA INTERCEPT + CIA HUMINT", detail: "Chatter intercept references 'EAGLE' (POTUS codename) and a 3-week window. Iranian Revolutionary Guard involvement suspected.", icon: "☠", color: "#e84b4b" },
                        { threat: "DOMESTIC EXTREMIST SURVEILLANCE", level: "HIGH", source: "FBI DOMESTIC CI", detail: "Group 'PATRIOT VANGUARD' conducting digital reconnaissance of POTUS rally venues. 14 persons of interest identified.", icon: "⚠", color: "#e87a4b" },
                        { threat: "CYBER THREAT TO POTUS COMMUNICATIONS", level: "HIGH", source: "CYBERCOM + NSA", detail: "Anomalous probe patterns targeting secure POTUS comms infrastructure. APT suspected.", icon: "💻", color: "#e8b84b" },
                        { threat: "INFILTRATION ATTEMPT — WHITE HOUSE STAFF", level: "MEDIUM", source: "SECRET SERVICE CI", detail: "Background investigation found discrepancies in a newly hired aide's foreign contacts.", icon: "🔍", color: "#9b59b6" },
                      ].map((t, i) => (
                        <div key={i} style={{ background: "#0a0505", border: `1px solid ${t.color}33`, borderLeft: `3px solid ${t.color}`, padding: 14, marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontSize: 9, color: t.color, letterSpacing: 1 }}>{t.icon} {t.threat}</div>
                            <div style={{ fontSize: 7, color: t.color, border: `1px solid ${t.color}`, padding: "1px 6px" }}>{t.level}</div>
                          </div>
                          <div style={{ fontSize: 7, color: "#6a8a6a", marginBottom: 4, letterSpacing: 1 }}>SOURCE: {t.source}</div>
                          <div style={{ fontSize: 8, color: "#5a7a5a", lineHeight: 1.5, marginBottom: 10 }}>{t.detail}</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn" style={{ flex: 1, fontSize: 8, borderColor: t.color, color: t.color }}
                              onClick={() => {
                                updateGeneral({ approval: Math.min(100, ap + 5), prestige: Math.min(100, pres + 4) });
                                notify(`SECRET SERVICE: Counter-response deployed — Threat ${t.level} neutralized. +5 AP, +4 PR`, t.color);
                              }}>⚡ DEPLOY COUNTER-RESPONSE</button>
                            <button className="btn btn-gold" style={{ flex: 1, fontSize: 8 }}
                              onClick={() => {
                                notify(`JOINT OP: JSOC + Secret Service QRF authorized for threat: ${t.threat.slice(0, 30)}...`, "#ffd700");
                                updateGeneral({ prestige: Math.min(100, pres + 8) });
                              }}>🎯 JSOC JOINT OP (+8 PR)</button>
                          </div>
                        </div>
                      ))}

                      {/* Joint JSOC + SS Operations Status */}
                      <div className="panel" style={{ padding: 16, border: "1px solid #2a2a00", marginTop: 4 }}>
                        <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 3, marginBottom: 10 }}>◈ PENTAGON-AUTHORIZED JOINT OPERATIONS</div>
                        {[
                          { name: "OPERATION EAGLE SHIELD", desc: "Continuous JSOC QRF within 4min response radius of POTUS", status: "ACTIVE", color: "#4caf50" },
                          { name: "COUNTERINTEL SCRUB — USSS STAFF", desc: "Ongoing poly + background recheck of all SS agents", status: "ACTIVE", color: "#4caf50" },
                          { name: "VENUE HARDENING PROTOCOL", desc: "Delta operators pre-deploy to all POTUS public appearances", status: general.ssProtectionLevel === "MAXIMUM" || general.ssProtectionLevel === "LOCKDOWN" ? "ACTIVE" : "STANDBY", color: general.ssProtectionLevel === "MAXIMUM" || general.ssProtectionLevel === "LOCKDOWN" ? "#4caf50" : "#e8b84b" },
                          { name: "DEEP STATE COMMS BLACKOUT", desc: "All POTUS comms routed through Pentagon-controlled TS/SCI infrastructure", status: "STANDBY", color: "#e8b84b" },
                        ].map((op, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a0a" }}>
                            <div>
                              <div style={{ fontSize: 9, color: "#c8b870" }}>{op.name}</div>
                              <div style={{ fontSize: 7, color: "#4a5a4a" }}>{op.desc}</div>
                            </div>
                            <div style={{ fontSize: 8, color: op.color, border: `1px solid ${op.color}44`, padding: "2px 8px", letterSpacing: 1 }}>{op.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}


            {tab === "comms" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <div style={{ fontSize: 9, color: "#4b9ae8", letterSpacing: 4, marginBottom: 12 }}>◈ SECURE COMMUNICATIONS TERMINAL</div>
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14 }}>
                  {/* INBOX */}
                  <div className="panel" style={{ padding: 10, minHeight: 400 }}>
                    <div style={{ fontSize: 9, color: "#7a9a7a", letterSpacing: 2, marginBottom: 10, paddingLeft: 6 }}>ENCRYPTED INBOX ({inbox.filter(m => !m.read).length})</div>
                    {inbox.length === 0 ? <div style={{ fontSize: 8, color: "#4a5a4a", fontStyle: "italic", padding: 10 }}>Inbox empty. Waiting for secure handshakes...</div> :
                      inbox.map(msg => (
                        <div key={msg.id} style={{ padding: "10px 8px", cursor: "pointer", borderBottom: "1px solid #1a2a1a", background: activeCall?.id === msg.id ? "#1a2a4a" : msg.read ? "transparent" : "#0d1d2d", borderLeft: msg.read ? "none" : "3px solid #4b9ae8" }}
                          onClick={() => {
                            setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
                            setActiveCall(msg);
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 4 }}>
                            <span style={{ color: msg.read ? "#8a9a8a" : "#c8ffc8" }}>{msg.sender}</span>
                            <span style={{ color: "#5a7a5a" }}>{msg.time}</span>
                          </div>
                          <div style={{ fontSize: 8, color: msg.read ? "#5a6a5a" : "#8abbff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.subject}</div>
                        </div>
                      ))
                    }
                  </div>

                  {/* MESSAGE BODY */}
                  <div className="panel" style={{ padding: 20, border: "1px solid #2a3a4a" }}>
                    {activeCall ? (
                      <div>
                        <div style={{ fontSize: 14, color: "#c8ffc8", marginBottom: 6 }}>{activeCall.subject}</div>
                        <div style={{ fontSize: 9, color: "#4b9ae8", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #1a2a3a" }}>FROM: {activeCall.sender} | CLASSIFICATION: TOP SECRET/NOFORN</div>
                        <div style={{ fontSize: 11, color: "#8a9a8a", lineHeight: 1.8, marginBottom: 40, whiteSpace: "pre-wrap" }}>{activeCall.body}</div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {activeCall.actionType === "PROMOTE" ? (
                            <>
                              <button className="btn" style={{ flex: 1, borderColor: "#ffd700", color: "#ffd700" }} onClick={() => {
                                updateGeneral({
                                  prestige: Math.max(0, pres - activeCall.costPR),
                                  approval: Math.min(100, ap + activeCall.gainAP),
                                  personnelRoster: (general.personnelRoster || []).map(p => p.id === activeCall.soldierId ? { ...p, rank: p.rank + "+" } : p)
                                });
                                notify(`${activeCall.soldierName} Promoted! (-${activeCall.costPR} PR, +${activeCall.gainAP} AP)`, "#ffd700");
                                setActiveCall(null);
                                setInbox(prev => prev.filter(m => m.id !== activeCall.id));
                              }}>🎖 PROMOTE (-{activeCall.costPR} PR, +{activeCall.gainAP} AP)</button>
                              <button className="btn btn-red" style={{ flex: 1 }} onClick={() => { notify("Promotion Denied", "#e84b4b"); setActiveCall(null); setInbox(prev => prev.filter(m => m.id !== activeCall.id)); }}>REJECT</button>
                            </>
                          ) : (
                            <>
                              <button className="btn" style={{ flex: 1, borderColor: "#4caf50", color: "#4caf50", minWidth: 160 }} onClick={() => { updateGeneral({ prestige: Math.min(100, (general.prestige || 60) + 3), approval: Math.min(100, (general.approval || 70) + 2) }); notify(`Greenlit. ${activeCall.sender} acknowledged. +3 PR, +2 AP`, "#4caf50"); setActiveCall(null); }}>⚡ GREENLIGHT (+3 PR, +2 AP)</button>
                              <button className="btn btn-gold" style={{ flex: 1, minWidth: 160 }} onClick={() => { notify(`Forwarded to backchannel. Deniability maintained.`, "#e8b84b"); setActiveCall(null); }}>↗ REROUTE TO BACKCHANNEL</button>
                              <button className="btn btn-red" style={{ flex: 1, minWidth: 160 }} onClick={() => { updateGeneral({ approval: Math.min(100, (general.approval || 70) + 1) }); notify(`Request denied. Message purged from system.`, "#e84b4b"); setActiveCall(null); setInbox(prev => prev.filter(m => m.id !== activeCall.id)); }}>🗑 DENY & PURGE (+1 AP)</button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3a4a5a", fontSize: 10, letterSpacing: 2 }}>SELECT A MESSAGE TO DECRYPT</div>
                    )}
                  </div>
                </div>
              </div>
            )}




            {/* ══ CYBER WARFARE — USCYBERCOM ══ */}
            {tab === "cyber" && (() => {
              const cyberPosture = general.cyberPosture || "DEFEND";
              const cyberOpsLaunched = general.cyberOpsLaunched || [];
              return (
                <div style={{ animation: "fadeUp 0.3s" }}>
                  {/* Header Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "OFFENSIVE OPS", val: cyberOpsLaunched.length, color: "#e84b4b" },
                      { label: "BLACK BUDGET", val: `$${banks.slushFund}B`, color: "#ffd700" },
                      { label: "CYBER POSTURE", val: cyberPosture, color: cyberPosture === "DEFEND" ? "#4caf50" : cyberPosture === "MONITOR" ? "#e8b84b" : "#e84b4b" },
                      { label: "DEFCON LEVEL", val: def, color: def <= 2 ? "#e84b4b" : "#4caf50" },
                    ].map(s => (
                      <div key={s.label} className="panel" style={{ padding: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 22, color: s.color, fontFamily: "Oswald,sans-serif" }}>{s.val}</div>
                        <div style={{ fontSize: 7, color: "#3a5a3a", letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Offensive Operations */}
                    <div>
                      <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 12 }}>◈ OFFENSIVE CYBER OPERATIONS — FORT MEADE</div>
                      {[
                        { id: "stuxnet2", label: "STUXNET VARIANT Ω", desc: "Deploy polymorphic worm to Iranian enrichment PLCs at Natanz. Delay nuclear program 18-24 months.", cost: 20, risk: 0.25, reward: { pr: 20, ap: 8, defcon: 1 }, blowback: { pr: -10, ap: -15, defcon: -1 }, target: "🇮🇷 IRAN — NATANZ", color: "#e84b4b" },
                        { id: "griddown", label: "GRID DOWN — PYONGYANG", desc: "Sabotage DPRK power grid infrastructure. Blind their early warning radar network for 72 hours.", cost: 15, risk: 0.35, reward: { pr: 15, ap: 5, defcon: 0 }, blowback: { pr: -5, ap: -10, defcon: -1 }, target: "🇰🇵 DPRK — PYONGYANG", color: "#e87a4b" },
                        { id: "dragonstrike", label: "OPERATION DRAGON STRIKE", desc: "Intrusion campaign into PLA Naval C2 systems. Extract submarine patrol schedules and ICBM targeting data.", cost: 30, risk: 0.40, reward: { pr: 25, ap: 10, defcon: 0 }, blowback: { pr: -15, ap: -20, defcon: -2 }, target: "🇨🇳 CHINA — PLA NAVY", color: "#e8b84b" },
                        { id: "ghostprotocol", label: "GHOST PROTOCOL — FSB", desc: "Compromise FSB internal comms. Plant disinformation to fracture Kremlin inner circle loyalty.", cost: 25, risk: 0.30, reward: { pr: 18, ap: 12, defcon: 1 }, blowback: { pr: -8, ap: -18, defcon: -1 }, target: "🇷🇺 RUSSIA — FSB MOSCOW", color: "#9b59b6" },
                        { id: "financialwar", label: "SWIFT NETWORK STRIKE", desc: "Disrupt adversary central bank access to SWIFT. Crash currency, trigger economic panic.", cost: 35, risk: 0.20, reward: { pr: 12, ap: 5, defcon: 0 }, blowback: { pr: -5, ap: -25, defcon: -2 }, target: "🌐 MULTI-NATION TARGET", color: "#4b9ae8" },
                        { id: "ransomblind", label: "DUAL-USE RANSOMWARE RELEASE", desc: "Deploy self-propagating ransomware through criminal proxies. Complete deniability. High profit, high scandal risk.", cost: 10, risk: 0.45, reward: { pr: 5, ap: 0, defcon: 0 }, blowback: { pr: -20, ap: -30, defcon: -1 }, target: "⚠ GLOBAL INFRASTRUCTURE", color: "#ffd700" },
                      ].map(op => {
                        const launched = cyberOpsLaunched.includes(op.id);
                        return (
                          <div key={op.id} className="panel" style={{ padding: 14, marginBottom: 8, borderLeft: `3px solid ${launched ? "#4caf5044" : op.color}`, opacity: launched ? 0.6 : 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <div style={{ fontSize: 10, color: launched ? "#4caf50" : op.color, letterSpacing: 1 }}>{op.label}</div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <div style={{ fontSize: 8, color: "#4a6a4a" }}>{op.target}</div>
                                <div style={{ fontSize: 9, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>${op.cost}B</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 8, color: "#5a7a5a", lineHeight: 1.6, marginBottom: 8 }}>{op.desc}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ fontSize: 7, color: op.risk > 0.35 ? "#e84b4b" : "#e8b84b" }}>
                                INTERCEPT RISK: {Math.round(op.risk * 100)}% · REWARD: +{op.reward.pr} PR, +{op.reward.ap} AP
                              </div>
                              {!launched ? (
                                <button className="btn btn-red" style={{ fontSize: 8, padding: "4px 10px" }}
                                  disabled={banks.slushFund < op.cost}
                                  onClick={() => {
                                    if (banks.slushFund < op.cost) return notify("INSUFFICIENT BLACK BUDGET", "#e84b4b");
                                    setBanks(b => ({ ...b, slushFund: b.slushFund - op.cost }));
                                    const success = Math.random() > op.risk;
                                    if (success) {
                                      updateGeneral({
                                        prestige: Math.min(100, pres + op.reward.pr),
                                        approval: Math.min(100, ap + op.reward.ap),
                                        defcon: Math.max(1, Math.min(5, def + op.reward.defcon)),
                                        cyberOpsLaunched: [...(general.cyberOpsLaunched || []), op.id]
                                      });
                                      notify(`✓ ${op.label} — MISSION SUCCESS. +${op.reward.pr} PR, +${op.reward.ap} AP`, "#4caf50");
                                    } else {
                                      updateGeneral({
                                        prestige: Math.max(0, pres + op.blowback.pr),
                                        approval: Math.max(0, ap + op.blowback.ap),
                                        defcon: Math.max(1, Math.min(5, def + op.blowback.defcon)),
                                        cyberOpsLaunched: [...(general.cyberOpsLaunched || []), op.id]
                                      });
                                      notify(`✗ ${op.label} — OPERATION BLOWN. Attribution leaked. Blowback imminent.`, "#e84b4b");
                                    }
                                  }}>
                                  {banks.slushFund < op.cost ? "INSUFFICIENT FUNDS" : "⚡ AUTHORIZE STRIKE"}
                                </button>
                              ) : (
                                <div style={{ fontSize: 8, color: "#4caf50", letterSpacing: 2 }}>✓ OP COMPLETE</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right — Defensive Posture + Threat Grid */}
                    <div>
                      <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4, marginBottom: 12 }}>◈ CYBERCOM DEFENSIVE POSTURE</div>
                      <div style={{ marginBottom: 14 }}>
                        {[
                          { id: "DEFEND", label: "FORTRESS DEFENSE", desc: "All USCYBERCOM assets in pure defensive mode. 0 offensive ops. Highest protection.", color: "#4caf50", apGain: 3 },
                          { id: "MONITOR", label: "ACTIVE MONITORING", desc: "Balanced hunt-forward posture. Detect and observe without engaging.", color: "#e8b84b", apGain: 1 },
                          { id: "DEGRADE", label: "ACTIVE DEGRADATION", desc: "Hunting mode. Actively degrade adversarial infrastructure in real time.", color: "#e87a4b", apGain: -2 },
                          { id: "WARMODE", label: "FULL CYBER WAR", desc: "Unrestricted domain dominance. Maximum offensive and defensive operations. High escalation risk.", color: "#e84b4b", apGain: -8 },
                        ].map(p => (
                          <div key={p.id} className="choice-card" style={{ marginBottom: 8, borderColor: cyberPosture === p.id ? p.color : "#1a2a1a", borderLeft: `3px solid ${p.color}` }}
                            onClick={() => {
                              updateGeneral({ cyberPosture: p.id, approval: Math.max(0, Math.min(100, ap + p.apGain)) });
                              notify(`CYBERCOM POSTURE SET: ${p.label} (${p.apGain >= 0 ? "+" : ""}${p.apGain} AP)`, p.color);
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 10, color: p.color, letterSpacing: 1 }}>{p.label}</div>
                                <div style={{ fontSize: 8, color: "#4a5a4a", marginTop: 2 }}>{p.desc}</div>
                              </div>
                              {cyberPosture === p.id && <div style={{ fontSize: 9, color: p.color }}>● ACTIVE</div>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 9, color: "#9b59b6", letterSpacing: 4, marginBottom: 10 }}>◈ LIVE THREAT GRID — HOSTILE APTs</div>
                      {[
                        { actor: "APT41 (CHINA)", type: "Espionage + Financial", target: "DoD Contractor Networks", level: "CRITICAL", color: "#e84b4b" },
                        { actor: "COZY BEAR (RUSSIA)", type: "Political Intrusion", target: "State Dept + NSC Email", level: "HIGH", color: "#e87a4b" },
                        { actor: "LAZARUS (DPRK)", type: "Financial Heist", target: "SWIFT/Federal Reserve", level: "HIGH", color: "#e8b84b" },
                        { actor: "CHARMING KITTEN (IRAN)", type: "Phishing / Social Eng.", target: "Nuclear Researcher Emails", level: "MEDIUM", color: "#9b59b6" },
                        { actor: "FANCY BEAR (GRU)", type: "Infrastructure Attack", target: "NATO Power Grid Probes", level: "ELEVATED", color: "#4b9ae8" },
                      ].map(t => (
                        <div key={t.actor} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0d1a0d" }}>
                          <div>
                            <div style={{ fontSize: 9, color: t.color, letterSpacing: 1 }}>{t.actor}</div>
                            <div style={{ fontSize: 7, color: "#4a5a6a" }}>{t.type} → {t.target}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ fontSize: 8, color: t.color, border: `1px solid ${t.color}44`, padding: "2px 8px", letterSpacing: 1 }}>{t.level}</div>
                            <button className="btn" style={{ fontSize: 7, padding: "3px 8px" }} onClick={() => notify(`CYBERCOM hunting ${t.actor} — counter-intrusion authorized. +3 PR`, "#4b9ae8")}>HUNT</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ══ GLOBAL MARKETS — DEFENSE CONTRACTING ══ */}
            {tab === "markets" && (() => {
              const portfolio = general.stockPortfolio || {};
              const DEFENSE_STOCKS = [
                { id: "lmt", ticker: "LMT", name: "Lockheed Martin", price: 480 + (def <= 3 ? (5 - def) * 12 : 0) + (general.globalStats?.panicIndex || 0) * 1.2, sector: "Aerospace / Missiles", yield: "2.1%", color: "#4b9ae8" },
                { id: "rtx", ticker: "RTX", name: "Raytheon Technologies", price: 105 + (def <= 3 ? (5 - def) * 5 : 0) + (general.globalStats?.panicIndex || 0) * 0.5, sector: "Missiles / Radar", yield: "1.8%", color: "#e8b84b" },
                { id: "noc", ticker: "NOC", name: "Northrop Grumman", price: 520 + (def <= 3 ? (5 - def) * 14 : 0) + (general.globalStats?.panicIndex || 0) * 1.4, sector: "B-21 / Space", yield: "1.5%", color: "#4caf50" },
                { id: "baesy", ticker: "BAESY", name: "BAE Systems PLC", price: 52 + (def <= 3 ? (5 - def) * 2 : 0) + (general.globalStats?.panicIndex || 0) * 0.3, sector: "UK Armored Vehicles", yield: "3.2%", color: "#9b59b6" },
                { id: "ge", ticker: "GEV", name: "GE Vernova Energy", price: 170 + (general.globalStats?.econDamageTrillions || 0) * -5, sector: "Energy / Power Grid", yield: "1.2%", color: "#e87a4b" },
                { id: "palantir", ticker: "PLTR", name: "Palantir Technologies", price: 28 + (cyberOpsLaunched => cyberOpsLaunched.length * 4)(general.cyberOpsLaunched || []), sector: "AI / Intelligence Analytics", yield: "0%", color: "#e84b4b" },
              ];
              const totalPortfolioValue = DEFENSE_STOCKS.reduce((sum, s) => sum + (portfolio[s.id] || 0) * s.price, 0);
              return (
                <div style={{ animation: "fadeUp 0.3s" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "PERSONAL ACCOUNT", val: `$${bankBalance.toLocaleString()}`, color: "#ffd700" },
                      { label: "PORTFOLIO VALUE", val: `$${Math.round(totalPortfolioValue).toLocaleString()}`, color: "#4caf50" },
                      { label: "GLOBAL PANIC INDEX", val: `${general.globalStats?.panicIndex || 0}%`, color: (general.globalStats?.panicIndex || 0) > 50 ? "#e84b4b" : "#4caf50" },
                    ].map(s => (
                      <div key={s.label} className="panel" style={{ padding: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 22, color: s.color, fontFamily: "Oswald,sans-serif" }}>{s.val}</div>
                        <div style={{ fontSize: 7, color: "#3a5a3a", letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 10, background: "#0a0a00", border: "1px solid #2a2a00", padding: "10px 16px" }}>
                    <div style={{ fontSize: 8, color: "#ffd700", letterSpacing: 2 }}>⚠ CLASSIFIED MARKET INTELLIGENCE: Higher DEFCON and Global Panic = higher defense stock prices. Escalating tensions is profitable — but costs approvals. Trade wisely.</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#4caf50", letterSpacing: 4, marginBottom: 12 }}>◈ DEFENSE SECTOR EQUITIES — OFFSHORE ACCOUNT</div>
                      {DEFENSE_STOCKS.map(stock => {
                        const sharesOwned = portfolio[stock.id] || 0;
                        const costBasis = 100; // simplified
                        return (
                          <div key={stock.id} className="panel" style={{ padding: 14, marginBottom: 8, borderLeft: `3px solid ${stock.color}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                              <div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <div style={{ fontSize: 11, color: stock.color, letterSpacing: 2, fontFamily: "Oswald,sans-serif" }}>{stock.ticker}</div>
                                  <div style={{ fontSize: 9, color: "#c8ffc8" }}>{stock.name}</div>
                                </div>
                                <div style={{ fontSize: 7, color: "#4a5a4a", marginTop: 2 }}>{stock.sector} · Yield: {stock.yield}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 16, color: "#ffd700", fontFamily: "Oswald,sans-serif" }}>${Math.round(stock.price).toLocaleString()}</div>
                                <div style={{ fontSize: 7, color: "#4a6a4a" }}>{sharesOwned} shares · ${Math.round(sharesOwned * stock.price).toLocaleString()} value</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-gold" style={{ flex: 1, fontSize: 8, padding: "5px 0" }}
                                disabled={bankBalance < stock.price * 10}
                                onClick={() => {
                                  const cost = Math.round(stock.price * 10);
                                  if (bankBalance < cost) return notify("INSUFFICIENT FUNDS", "#e84b4b");
                                  setBanks(b => ({ ...b, personal: b.personal - cost }));
                                  updateGeneral({ stockPortfolio: { ...portfolio, [stock.id]: sharesOwned + 10 } });
                                  notify(`BOUGHT 10 shares ${stock.ticker} @ $${Math.round(stock.price)} = -$${cost.toLocaleString()}`, "#ffd700");
                                }}>
                                BUY 10 SHARES (${Math.round(stock.price * 10).toLocaleString()})
                              </button>
                              {sharesOwned > 0 && (
                                <button className="btn btn-red" style={{ flex: 1, fontSize: 8, padding: "5px 0" }}
                                  onClick={() => {
                                    const proceeds = Math.round(stock.price * sharesOwned);
                                    setBanks(b => ({ ...b, personal: b.personal + proceeds }));
                                    updateGeneral({ stockPortfolio: { ...portfolio, [stock.id]: 0 } });
                                    notify(`SOLD ${sharesOwned} shares ${stock.ticker} @ $${Math.round(stock.price)} = +$${proceeds.toLocaleString()}`, "#4caf50");
                                  }}>
                                  SELL ALL (+${Math.round(stock.price * sharesOwned).toLocaleString()})
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <div style={{ fontSize: 9, color: "#e84b4b", letterSpacing: 4, marginBottom: 12 }}>◈ MARKET INTELLIGENCE — TENSION DRIVERS</div>
                      <div className="panel" style={{ padding: 16, marginBottom: 14 }}>
                        <div style={{ fontSize: 9, color: "#c8ffc8", marginBottom: 10 }}>CURRENT MARKET CONDITIONS</div>
                        {[
                          { factor: "DEFCON Level", impact: def <= 2 ? "↑↑ WAR PREMIUM" : def <= 3 ? "↑ ELEVATED" : "→ NEUTRAL", color: def <= 2 ? "#e84b4b" : def <= 3 ? "#e8b84b" : "#4caf50" },
                          { factor: "Global Panic Index", impact: `${general.globalStats?.panicIndex || 0}% — ${(general.globalStats?.panicIndex || 0) > 60 ? "↑↑ SURGE" : "→ STABLE"}`, color: (general.globalStats?.panicIndex || 0) > 60 ? "#e84b4b" : "#4caf50" },
                          { factor: "Active Crises", impact: `${liveMissions.filter(m => !m.resolved).length} active — ${liveMissions.filter(m => !m.resolved).length > 2 ? "↑ DEMAND UP" : "→ NEUTRAL"}`, color: liveMissions.filter(m => !m.resolved).length > 2 ? "#e8b84b" : "#4caf50" },
                          { factor: "Cyber Ops Launched", impact: `${(general.cyberOpsLaunched || []).length} ops — ↑ PLTR premium`, color: "#9b59b6" },
                          { factor: "Econ Damage", impact: `-$${general.globalStats?.econDamageTrillions || 0}T — ${(general.globalStats?.econDamageTrillions || 0) > 2 ? "↓↓ GEV impacted" : "→ MODERATE"}`, color: "#e87a4b" },
                        ].map(f => (
                          <div key={f.factor} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0d1a0d" }}>
                            <div style={{ fontSize: 8, color: "#7a9a7a" }}>{f.factor}</div>
                            <div style={{ fontSize: 8, color: f.color, fontFamily: "Oswald,sans-serif" }}>{f.impact}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 4, marginBottom: 10 }}>◈ INSIDER TIPS — CLASSIFIED</div>
                      {[
                        { tip: "Declare DEFCON 2 to spike LMT/RTX/NOC by +30% each before selling.", risk: "HIGH APPROVAL COST" },
                        { tip: "Launch 3+ Cyber Ops to push Palantir (PLTR) to peak price.", risk: "BLACK BUDGET COST" },
                        { tip: "Cause Global Panic >70% for maximum defense sector surge across all stocks.", risk: "PRESIDENTIAL RELATION" },
                        { tip: "Buy GEV before diplomatic successes reduce global tensions — capitalize on stability.", risk: "MARKET TIMING RISK" },
                      ].map((tip, i) => (
                        <div key={i} style={{ background: "#080800", border: "1px solid #2a2a00", padding: "10px 14px", marginBottom: 6 }}>
                          <div style={{ fontSize: 8, color: "#c8b870", lineHeight: 1.6 }}>{tip.tip}</div>
                          <div style={{ fontSize: 7, color: "#e84b4b", marginTop: 4 }}>RISK: {tip.risk}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FLOATING POTUS BUTTON */}

            <button onClick={() => setShowPotus(!showPotus)} style={{ position: "fixed", bottom: 60, right: 20, zIndex: 3500, background: "#1a1400", border: "1px solid #ffd700", color: "#ffd700", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "10px 16px", cursor: "pointer", letterSpacing: 2, boxShadow: "0 0 12px #ffd70044", animation: "goldGlow 3s infinite" }}>
              🏛 POTUS MEETING
            </button>
            {showPotus && (
              <div style={{ position: "fixed", bottom: 100, right: 20, zIndex: 3500, width: 320, background: "#0a0a00", border: "1px solid #3a3000", padding: 16 }}>
                <div style={{ fontSize: 9, color: "#7a6a3a", letterSpacing: 3, marginBottom: 10 }}>REQUEST OVAL OFFICE MEETING:</div>
                {[
                  { id: "support", label: "EXPRESS FULL SUPPORT", desc: "Reaffirm loyalty", apD: 10, msg: "POTUS nods approvingly. Your loyalty is noted. Trust deepens." },
                  { id: "advise", label: "STRATEGIC COUNSEL", desc: "Present your assessment", apD: 5, msg: "POTUS listens carefully. 'Good thinking, General.' Respect earned." },
                  { id: "secret_service", label: "AUTHORIZE JOINT DOMESTIC OP", desc: "JSOC + Secret Service detail", apD: 15, msg: "POTUS beams. 'Having Delta Force guarding my rally makes me rest easy.' Massive AP gain, but constitutional experts are furious." },
                  { id: "pushback", label: "PUSH BACK", desc: "Challenge an order", apD: -12, msg: "POTUS frowns. 'That's noted, General.' The room goes cold." },
                  { id: "resign_threat", label: "THREATEN RESIGNATION", desc: "Use your position", apD: -25, msg: "POTUS slams the desk. 'Don't test me, General.' Career on thin ice." },
                ].map(m => (
                  <div key={m.id} className="choice-card" style={{ marginBottom: 6, borderColor: "#2a2a00" }} onClick={() => {
                    updateGeneral({ approval: Math.max(0, Math.min(100, ap + m.apD)), presidentialMeetings: (general.presidentialMeetings || 0) + 1 });
                    setPresidentialMeet({ msg: m.msg, apD: m.apD });
                    setShowPotus(false);
                    notify(m.label + " — Meeting concluded", m.apD > 0 ? "#4caf50" : "#e84b4b");
                  }}>
                    <div style={{ fontSize: 10, color: "#c8b870", letterSpacing: 1 }}>{m.label}</div>
                    <div style={{ fontSize: 8, color: "#4a4a3a", marginTop: 2 }}>{m.desc} ({m.apD > 0 ? "+" : ""}{m.apD} AP)</div>
                  </div>
                ))}
              </div>
            )}

            {/* BOTTOM STATUS */}
            <div style={{ padding: "8px 20px", borderTop: "1px solid #1a2a1a", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", background: "#020904" }}>
              <div style={{ fontSize: 8, color: "#2a4a2a", letterSpacing: 3 }}>USSOCOM · JSOC · STRATCOM · CYBERCOM · SPACECOM</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 2 }}>PROGRESS SAVED AUTOMATICALLY</div>
              <div style={{ fontSize: 8, color: "#ffd70066", letterSpacing: 2 }}>★★★★ GENERAL {general.name.toUpperCase()}</div>
            </div>
          </div>
        </div >
      </div >
    </>
  );
}
