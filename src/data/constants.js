export const UNITS = [
    { id: "delta", name: "Delta Force", abbr: "1SFOD-D", icon: "⚡", strength: 850, specialty: "Direct Action", theater: "Global", cost: 50 },
    { id: "seals", name: "SEAL Team 6", abbr: "DEVGRU", icon: "🔱", strength: 300, specialty: "Maritime Assault", theater: "Global", cost: 60 },
    { id: "rangers", name: "75th Rangers", abbr: "75RGT", icon: "🦅", strength: 3500, specialty: "Airborne Assault", theater: "Global", cost: 30 },
    { id: "sfg5", name: "5th Special Forces", abbr: "5SFG", icon: "🌐", strength: 1400, specialty: "Unconventional Warfare", theater: "Middle East", cost: 40 },
    { id: "82abn", name: "82nd Airborne", abbr: "82ABN", icon: "☁", strength: 14500, specialty: "Rapid Deployment", theater: "Europe", cost: 80 },
    { id: "1mar", name: "1st Marine Div", abbr: "1MARDIV", icon: "⚓", strength: 19000, specialty: "Amphibious Assault", theater: "Pacific", cost: 120 },
    { id: "7thfleet", name: "7th Fleet", abbr: "7FLT", icon: "⛵", strength: 60000, specialty: "Naval Strike", theater: "Pacific", cost: 250 },
    { id: "b52", name: "B-52 Stratofortress", abbr: "B52-H", icon: "✈", strength: 76, specialty: "Strategic Bombing", theater: "Global", cost: 150 },
];

export const HOT_ZONES = [
    { id: "hz1", name: "Korean Peninsula", lat: 38, lon: 127, threat: "HIGH", color: "#e84b4b", description: "DPRK missile activity surging. 3 ICBMs on launchpads.", troops: 28000, missionCount: 0 },
    { id: "hz2", name: "Taiwan Strait", lat: 24, lon: 120, threat: "HIGH", color: "#e84b4b", description: "PLA conducting live-fire exercises. USS Reagan repositioned.", troops: 12000, missionCount: 0 },
    { id: "hz3", name: "Black Sea", lat: 45, lon: 33, threat: "MEDIUM", color: "#e8b84b", description: "Russian naval buildup. 3 Kilo-class submarines tracked.", troops: 8000, missionCount: 0 },
    { id: "hz4", name: "Persian Gulf", lat: 26, lon: 54, threat: "MEDIUM", color: "#e8b84b", description: "Iranian fast boats harassing commercial shipping.", troops: 5500, missionCount: 0 },
    { id: "hz5", name: "Sahel Region", lat: 14, lon: 5, threat: "LOW", color: "#4be870", description: "Wagner Group mercenary activity in Mali and Niger.", troops: 1200, missionCount: 0 },
    { id: "hz6", name: "Venezuela", lat: 8, lon: -66, threat: "LOW", color: "#4be870", description: "Maduro regime destabilization. CIA assets active.", troops: 0, missionCount: 0 },
];

export const GLOBAL_EVENTS = [
    { id: "e1", type: "CRISIS", urgency: "CRITICAL", title: "DPRK ICBM LAUNCH DETECTED", body: "North Korean Hwasong-17 ICBM launched from Pyongyang. Trajectory analysis: 14 minutes to impact window. NORAD tracking. SecDef on line.", options: [{ label: "SCRAMBLE INTERCEPTORS", effect: { approval: +8, defcon: -1, prestige: +10, budget: -40 }, outcome: "Patriots and THAAD engage. Intercept confirmed at 80,000 feet. Crisis contained. POTUS commends your response." }, { label: "ISSUE DIPLOMATIC WARNING", effect: { approval: -5, defcon: 0, prestige: -5, budget: 0 }, outcome: "Warning issued. Missile splashes in Sea of Japan. Allies furious at perceived weakness. POTUS calls — not happy." }, { label: "AUTHORIZE COUNTER-STRIKE", effect: { approval: -20, defcon: -2, prestige: +5, budget: -100 }, outcome: "Counter-strike authorized. B-1B launches. DPRK scrambles. Near-war situation. POTUS overrides and cancels. You take the blame." }] },
    { id: "e2", type: "POLITICS", urgency: "HIGH", title: "SENATOR DEMANDS YOUR RESIGNATION", body: "Senate Armed Services Committee Chairman claims you exceeded authority in last operation. Live press conference calling for your removal. POTUS watching.", options: [{ label: "HOLD PRESS CONFERENCE", effect: { approval: +5, defcon: 0, prestige: +8, budget: -5 }, outcome: "Commanding performance. You lay out the facts with authority. Senator backs down. POTUS texts: 'Well handled, General.'" }, { label: "CONSULT JAG — SAY NOTHING", effect: { approval: -3, defcon: 0, prestige: 0, budget: 0 }, outcome: "Your silence reads as guilt. Media runs with it for 48 hours. POTUS is displeased but loyal — for now." }, { label: "FIRE BACK PUBLICLY", effect: { approval: -10, defcon: 0, prestige: -10, budget: -10 }, outcome: "The exchange goes viral. Congress is furious. POTUS summons you to the Oval. You've made his life harder." }] },
    { id: "e3", type: "MILITARY", urgency: "HIGH", title: "RUSSIAN SU-57 INTERCEPTS NATO RECON", body: "Russian Sukhoi Su-57 flew within 20 feet of a NATO RC-135 over the Baltic. Pilot is safe. Moscow claims it was a 'routine intercept.' NATO SecGen calling for your assessment.", options: [{ label: "DEPLOY F-22 COMBAT AIR PATROL", effect: { approval: +10, defcon: -1, prestige: +8, budget: -25 }, outcome: "F-22s establish presence. Russia backs off. NATO allies impressed by your rapid response. Prestige up." }, { label: "DIPLOMATIC CHANNEL TO MOSCOW", effect: { approval: +3, defcon: 0, prestige: +3, budget: 0 }, outcome: "Back-channel communication reduces tension. Moscow issues quiet apology. Situation defused professionally." }, { label: "RECOMMEND ARTICLE 5 CONSULTATION", effect: { approval: -5, defcon: -1, prestige: -5, budget: -5 }, outcome: "Allies see this as overreaction. POTUS is annoyed you escalated too fast. Defcon drops." }] },
    { id: "e4", type: "COUP", urgency: "CRITICAL", title: "COUP ATTEMPT DETECTED — SOUTH KOREA", body: "Rogue elements of ROK Army 3rd Corps have surrounded the Blue House in Seoul. President Moon has called you directly. US Forces Korea on high alert. CIA on the line.", options: [{ label: "SUPPORT LEGAL GOVERNMENT — DEPLOY USFK", effect: { approval: +15, defcon: 0, prestige: +15, budget: -80 }, outcome: "US Forces Korea moves within 2 hours. Coup collapses. ROK President owes you his life. Alliance cemented. Historic moment." }, { label: "STAND BY — ASSESS SITUATION", effect: { approval: -8, defcon: 0, prestige: -8, budget: 0 }, outcome: "You hesitate. Coup partially succeeds. Seoul in chaos for 72 hours. POTUS is disappointed. Alliance damaged." }, { label: "COVERT SUPPORT TO COUP LEADERS", effect: { approval: -30, defcon: 0, prestige: -20, budget: +50 }, outcome: "CIA learns you aided the coup. POTUS is furious. Congressional inquiry begins. Your career is in danger." }] },
    { id: "e5", type: "NUCLEAR", urgency: "CRITICAL", title: "EARLY WARNING: POSSIBLE ICBM INBOUND", body: "NORAD reports possible ICBM track originating from Russian Arctic. 8-minute window. 23% confidence — could be false alarm. Nuclear protocols activated. SecDef and POTUS on the line.", options: [{ label: "RECOMMEND LAUNCH AUTHORIZATION", effect: { approval: -40, defcon: -3, prestige: -30, budget: -200 }, outcome: "False alarm confirmed 4 minutes later. You nearly started WWIII. POTUS is furious. Senate hearing begins. Career destroyed." }, { label: "DEMAND SECOND-SOURCE CONFIRMATION", effect: { approval: +20, defcon: 0, prestige: +25, budget: 0 }, outcome: "Second source confirms false alarm — satellite anomaly. Your calm prevented nuclear war. POTUS calls it your finest hour." }, { label: "EVACUATE KEY PERSONNEL — HOLD RESPONSE", effect: { approval: +8, defcon: -1, prestige: +10, budget: -15 }, outcome: "Prudent response. False alarm confirmed. POTUS respects the measured call. You demonstrate genuine leadership." }] },
    { id: "e6", type: "POLITICS", urgency: "MEDIUM", title: "POTUS ORDERS WITHDRAWAL — YOU DISAGREE", body: "The President has ordered complete withdrawal from a forward operating base you believe is strategically critical. If you comply, you lose the position. If you push back, you risk your career.", options: [{ label: "COMPLY WITH ORDERS — SALUTE & EXECUTE", effect: { approval: +5, defcon: 0, prestige: -5, budget: +30 }, outcome: "You comply professionally. The base is abandoned. 6 months later, the threat materializes — but POTUS notes your loyalty." }, { label: "FORMALLY OBJECT — REQUEST REVIEW", effect: { approval: +10, defcon: 0, prestige: +8, budget: 0 }, outcome: "Your written objection enters the record. POTUS respects the process and orders an NSC review. The withdrawal is modified." }, { label: "DELAY & SLOW-ROLL THE ORDER", effect: { approval: -20, defcon: 0, prestige: -15, budget: -10 }, outcome: "POTUS discovers you're slow-rolling his direct order. You receive a call from the Chief of Staff. This is a firing offense." }] },
    { id: "e7", type: "MILITARY", urgency: "HIGH", title: "CHINESE CARRIER ENTERS DISPUTED WATERS", body: "PLA Navy Shandong carrier group has entered the disputed South China Sea exclusion zone. Philippines is requesting US protection. You have 40 minutes before they reach critical proximity.", options: [{ label: "SAIL USS RONALD REAGAN THROUGH THE ZONE", effect: { approval: +12, defcon: -1, prestige: +12, budget: -45 }, outcome: "Freedom of navigation operation executed. PLA backs off 30nm. Philippines cheers. China protests diplomatically. Perfect response." }, { label: "CONSULT ALLIES FIRST", effect: { approval: +5, defcon: 0, prestige: +3, budget: 0 }, outcome: "Multi-party consultation takes 3 hours. Chinese carrier holds position. Situation stabilizes but allies note the delay." }, { label: "AUTHORIZE WARNING SHOTS ACROSS THE BOW", effect: { approval: -15, defcon: -2, prestige: -5, budget: -10 }, outcome: "Warning shots trigger immediate escalation. PLA scrambles J-35s. Near-combat situation. POTUS forces de-escalation." }] },
    { id: "e8", type: "COUP", urgency: "HIGH", title: "YOUR OFFICERS APPROACH YOU ABOUT A COUP", body: "Three senior generals meet you privately. They claim POTUS is 'unfit' and ask you to sign a letter removing him under the 25th Amendment — but the real plan goes further. They want you to lead a military takeover.", options: [{ label: "REFUSE — REPORT TO SecDef IMMEDIATELY", effect: { approval: +25, defcon: 0, prestige: +30, budget: +100 }, outcome: "You report the conspiracy within the hour. All three generals are relieved of command and face court martial. POTUS calls you personally: 'You're the only general I trust.' Historic." }, { label: "LISTEN BUT DON'T COMMIT", effect: { approval: -10, defcon: 0, prestige: -10, budget: 0 }, outcome: "Your hesitation is noted. SecDef learns you attended the meeting. You're placed under informal review. Dangerous position." }, { label: "JOIN THE CONSPIRACY", effect: { approval: -100, defcon: 0, prestige: -50, budget: -500 }, outcome: "The conspiracy is compromised within 24 hours. You are arrested by the FBI. Court martialed. Dishonorably discharged. Career destroyed. History judges you harshly." }] },
];

export const SUBORDINATE_GENERALS = [
    { id: "sg1", name: "Gen. Marcus Webb", rank: "LTG", unit: "XVIII Airborne Corps", distinction: "Mogadishu veteran. 3 combat tours.", medals: ["DSM", "BSM", "PH"] },
    { id: "sg2", name: "Adm. Diana Torres", rank: "VADM", unit: "7th Fleet", distinction: "Led Pacific response to Taiwan crisis.", medals: ["LOM", "BSM"] },
    { id: "sg3", name: "Gen. James Okafor", rank: "MG", unit: "1st Special Forces CMD", distinction: "Green Beret. 18 years SF operations.", medals: ["CAB", "SSM"] },
    { id: "sg4", name: "Gen. Rachel Kim", rank: "BG", unit: "Space Force Operations", distinction: "Youngest BG in 40 years. MIT engineer.", medals: ["DSM"] },
    { id: "sg5", name: "Col. Dmitri Volkov", rank: "COL", unit: "Delta Force", distinction: "Born in USSR. Defected 1991. CIA asset.", medals: ["CAB", "BSM", "PH"] },
];

export const MEDAL_LIST = [
    { id: "moh", name: "Medal of Honor", color: "#ffd700", icon: "🏅", desc: "Nation's highest military honor" },
    { id: "dsm", name: "Defense Superior Service", color: "#e8b84b", icon: "★", desc: "Exceptional meritorious service" },
    { id: "ssm", name: "Silver Star", color: "#d0d0d0", icon: "✦", desc: "Gallantry in action" },
    { id: "bsm", name: "Bronze Star", color: "#cd7f32", icon: "✦", desc: "Heroic achievement" },
    { id: "lom", name: "Legion of Merit", color: "#4b9ae8", icon: "✸", desc: "Meritorious conduct" },
    { id: "ph", name: "Purple Heart", color: "#9b59b6", icon: "♥", desc: "Wounded in action" },
    { id: "cab", name: "Combat Action Badge", color: "#8fc68f", icon: "⚔", desc: "Direct combat engagement" },
    { id: "dfc", name: "Dist. Flying Cross", color: "#4bcde8", icon: "✈", desc: "Heroism in aerial flight" },
];

export const NEWS_FEED = [
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
