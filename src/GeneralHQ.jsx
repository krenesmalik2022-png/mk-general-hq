import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════ PERSISTENT STORAGE ═══════════════════════════ */
const SAVE_KEY = "specops-general-v1";
async function loadSave() {
  try { const r = await window.storage.get(SAVE_KEY); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function writeSave(data) {
  try { await window.storage.set(SAVE_KEY, JSON.stringify(data)); } catch {}
}

/* ═══════════════════════════ STATIC DATA ═══════════════════════════════════ */
const UNITS = [
  { id:"delta",   name:"Delta Force",       abbr:"1SFOD-D", icon:"⚡", strength:850,  specialty:"Direct Action",         theater:"Global" },
  { id:"seals",   name:"SEAL Team 6",       abbr:"DEVGRU",  icon:"🔱", strength:300,  specialty:"Maritime Assault",      theater:"Global" },
  { id:"rangers", name:"75th Rangers",      abbr:"75RGT",   icon:"🦅", strength:3500, specialty:"Airborne Assault",      theater:"Global" },
  { id:"sfg5",    name:"5th Special Forces",abbr:"5SFG",    icon:"🌐", strength:1400, specialty:"Unconventional Warfare",theater:"Middle East" },
  { id:"82abn",   name:"82nd Airborne",     abbr:"82ABN",   icon:"☁", strength:14500,specialty:"Rapid Deployment",      theater:"Europe" },
  { id:"1mar",    name:"1st Marine Div",    abbr:"1MARDIV", icon:"⚓", strength:19000,specialty:"Amphibious Assault",    theater:"Pacific" },
  { id:"7thfleet",name:"7th Fleet",         abbr:"7FLT",    icon:"⛵", strength:60000,specialty:"Naval Strike",          theater:"Pacific" },
  { id:"b52",     name:"B-52 Stratofortress",abbr:"B52-H", icon:"✈", strength:76,   specialty:"Strategic Bombing",     theater:"Global" },
];

const HOT_ZONES = [
  { id:"hz1", name:"Korean Peninsula", lat:38, lon:127, threat:"HIGH",   color:"#e84b4b", description:"DPRK missile activity surging. 3 ICBMs on launchpads.", troops:28000, missionCount:0 },
  { id:"hz2", name:"Taiwan Strait",    lat:24, lon:120, threat:"HIGH",   color:"#e84b4b", description:"PLA conducting live-fire exercises. USS Reagan repositioned.", troops:12000, missionCount:0 },
  { id:"hz3", name:"Black Sea",        lat:45, lon:33,  threat:"MEDIUM", color:"#e8b84b", description:"Russian naval buildup. 3 Kilo-class submarines tracked.", troops:8000,  missionCount:0 },
  { id:"hz4", name:"Persian Gulf",     lat:26, lon:54,  threat:"MEDIUM", color:"#e8b84b", description:"Iranian fast boats harassing commercial shipping.", troops:5500,  missionCount:0 },
  { id:"hz5", name:"Sahel Region",     lat:14, lon:5,   threat:"LOW",    color:"#4be870", description:"Wagner Group mercenary activity in Mali and Niger.", troops:1200,  missionCount:0 },
  { id:"hz6", name:"Venezuela",        lat:8,  lon:-66, threat:"LOW",    color:"#4be870", description:"Maduro regime destabilization. CIA assets active.", troops:0,     missionCount:0 },
];

const GLOBAL_EVENTS = [
  { id:"e1",  type:"CRISIS",    urgency:"CRITICAL", title:"DPRK ICBM LAUNCH DETECTED",           body:"North Korean Hwasong-17 ICBM launched from Pyongyang. Trajectory analysis: 14 minutes to impact window. NORAD tracking. SecDef on line.", options:[{label:"SCRAMBLE INTERCEPTORS",effect:{approval:+8,defcon:-1,prestige:+10},outcome:"Patriots and THAAD engage. Intercept confirmed at 80,000 feet. Crisis contained. POTUS commends your response."},{label:"ISSUE DIPLOMATIC WARNING",effect:{approval:-5,defcon:0,prestige:-5},outcome:"Warning issued. Missile splashes in Sea of Japan. Allies furious at perceived weakness. POTUS calls — not happy."},{label:"AUTHORIZE COUNTER-STRIKE",effect:{approval:-20,defcon:-2,prestige:+5},outcome:"Counter-strike authorized. B-1B launches. DPRK scrambles. Near-war situation. POTUS overrides and cancels. You take the blame."}] },
  { id:"e2",  type:"POLITICS",  urgency:"HIGH",     title:"SENATOR DEMANDS YOUR RESIGNATION",      body:"Senate Armed Services Committee Chairman claims you exceeded authority in last operation. Live press conference calling for your removal. POTUS watching.", options:[{label:"HOLD PRESS CONFERENCE",effect:{approval:+5,defcon:0,prestige:+8},outcome:"Commanding performance. You lay out the facts with authority. Senator backs down. POTUS texts: 'Well handled, General.'"},{label:"CONSULT JAG — SAY NOTHING",effect:{approval:-3,defcon:0,prestige:0},outcome:"Your silence reads as guilt. Media runs with it for 48 hours. POTUS is displeased but loyal — for now."},{label:"FIRE BACK PUBLICLY",effect:{approval:-10,defcon:0,prestige:-10},outcome:"The exchange goes viral. Congress is furious. POTUS summons you to the Oval. You've made his life harder."}] },
  { id:"e3",  type:"MILITARY",  urgency:"HIGH",     title:"RUSSIAN SU-57 INTERCEPTS NATO RECON",   body:"Russian Sukhoi Su-57 flew within 20 feet of a NATO RC-135 over the Baltic. Pilot is safe. Moscow claims it was a 'routine intercept.' NATO SecGen calling for your assessment.", options:[{label:"DEPLOY F-22 COMBAT AIR PATROL",effect:{approval:+10,defcon:-1,prestige:+8},outcome:"F-22s establish presence. Russia backs off. NATO allies impressed by your rapid response. Prestige up."},{label:"DIPLOMATIC CHANNEL TO MOSCOW",effect:{approval:+3,defcon:0,prestige:+3},outcome:"Back-channel communication reduces tension. Moscow issues quiet apology. Situation defused professionally."},{label:"RECOMMEND ARTICLE 5 CONSULTATION",effect:{approval:-5,defcon:-1,prestige:-5},outcome:"Allies see this as overreaction. POTUS is annoyed you escalated too fast. Defcon drops."}] },
  { id:"e4",  type:"COUP",      urgency:"CRITICAL", title:"COUP ATTEMPT DETECTED — SOUTH KOREA",   body:"Rogue elements of ROK Army 3rd Corps have surrounded the Blue House in Seoul. President Moon has called you directly. US Forces Korea on high alert. CIA on the line.", options:[{label:"SUPPORT LEGAL GOVERNMENT — DEPLOY USFK",effect:{approval:+15,defcon:0,prestige:+15},outcome:"US Forces Korea moves within 2 hours. Coup collapses. ROK President owes you his life. Alliance cemented. Historic moment."},{label:"STAND BY — ASSESS SITUATION",effect:{approval:-8,defcon:0,prestige:-8},outcome:"You hesitate. Coup partially succeeds. Seoul in chaos for 72 hours. POTUS is disappointed. Alliance damaged."},{label:"COVERT SUPPORT TO COUP LEADERS",effect:{approval:-30,defcon:0,prestige:-20},outcome:"CIA learns you aided the coup. POTUS is furious. Congressional inquiry begins. Your career is in danger."}] },
  { id:"e5",  type:"NUCLEAR",   urgency:"CRITICAL", title:"EARLY WARNING: POSSIBLE ICBM INBOUND",  body:"NORAD reports possible ICBM track originating from Russian Arctic. 8-minute window. 23% confidence — could be false alarm. Nuclear protocols activated. SecDef and POTUS on the line.", options:[{label:"RECOMMEND LAUNCH AUTHORIZATION",effect:{approval:-40,defcon:-3,prestige:-30},outcome:"False alarm confirmed 4 minutes later. You nearly started WWIII. POTUS is furious. Senate hearing begins. Career destroyed."},{label:"DEMAND SECOND-SOURCE CONFIRMATION",effect:{approval:+20,defcon:0,prestige:+25},outcome:"Second source confirms false alarm — satellite anomaly. Your calm prevented nuclear war. POTUS calls it your finest hour."},{label:"EVACUATE KEY PERSONNEL — HOLD RESPONSE",effect:{approval:+8,defcon:-1,prestige:+10},outcome:"Prudent response. False alarm confirmed. POTUS respects the measured call. You demonstrate genuine leadership."}] },
  { id:"e6",  type:"POLITICS",  urgency:"MEDIUM",   title:"POTUS ORDERS WITHDRAWAL — YOU DISAGREE", body:"The President has ordered complete withdrawal from a forward operating base you believe is strategically critical. If you comply, you lose the position. If you push back, you risk your career.", options:[{label:"COMPLY WITH ORDERS — SALUTE & EXECUTE",effect:{approval:+5,defcon:0,prestige:-5},outcome:"You comply professionally. The base is abandoned. 6 months later, the threat materializes — but POTUS notes your loyalty."},{label:"FORMALLY OBJECT — REQUEST REVIEW",effect:{approval:+10,defcon:0,prestige:+8},outcome:"Your written objection enters the record. POTUS respects the process and orders an NSC review. The withdrawal is modified."},{label:"DELAY & SLOW-ROLL THE ORDER",effect:{approval:-20,defcon:0,prestige:-15},outcome:"POTUS discovers you're slow-rolling his direct order. You receive a call from the Chief of Staff. This is a firing offense."}] },
  { id:"e7",  type:"MILITARY",  urgency:"HIGH",     title:"CHINESE CARRIER ENTERS DISPUTED WATERS", body:"PLA Navy Shandong carrier group has entered the disputed South China Sea exclusion zone. Philippines is requesting US protection. You have 40 minutes before they reach critical proximity.", options:[{label:"SAIL USS RONALD REAGAN THROUGH THE ZONE",effect:{approval:+12,defcon:-1,prestige:+12},outcome:"Freedom of navigation operation executed. PLA backs off 30nm. Philippines cheers. China protests diplomatically. Perfect response."},{label:"CONSULT ALLIES FIRST",effect:{approval:+5,defcon:0,prestige:+3},outcome:"Multi-party consultation takes 3 hours. Chinese carrier holds position. Situation stabilizes but allies note the delay."},{label:"AUTHORIZE WARNING SHOTS ACROSS THE BOW",effect:{approval:-15,defcon:-2,prestige:-5},outcome:"Warning shots trigger immediate escalation. PLA scrambles J-35s. Near-combat situation. POTUS forces de-escalation."}] },
  { id:"e8",  type:"COUP",      urgency:"HIGH",     title:"YOUR OFFICERS APPROACH YOU ABOUT A COUP", body:"Three senior generals meet you privately. They claim POTUS is 'unfit' and ask you to sign a letter removing him under the 25th Amendment — but the real plan goes further. They want you to lead a military takeover.", options:[{label:"REFUSE — REPORT TO SecDef IMMEDIATELY",effect:{approval:+25,defcon:0,prestige:+30},outcome:"You report the conspiracy within the hour. All three generals are relieved of command and face court martial. POTUS calls you personally: 'You're the only general I trust.' Historic."},{label:"LISTEN BUT DON'T COMMIT",effect:{approval:-10,defcon:0,prestige:-10},outcome:"Your hesitation is noted. SecDef learns you attended the meeting. You're placed under informal review. Dangerous position."},{label:"JOIN THE CONSPIRACY",effect:{approval:-100,defcon:0,prestige:-50},outcome:"The conspiracy is compromised within 24 hours. You are arrested by the FBI. Court martialed. Dishonorably discharged. Career destroyed. History judges you harshly."}] },
];

const SUBORDINATE_GENERALS = [
  { id:"sg1", name:"Gen. Marcus Webb",    rank:"LTG", unit:"XVIII Airborne Corps",  distinction:"Mogadishu veteran. 3 combat tours.", medals:["DSM","BSM","PH"] },
  { id:"sg2", name:"Adm. Diana Torres",  rank:"VADM",unit:"7th Fleet",             distinction:"Led Pacific response to Taiwan crisis.", medals:["LOM","BSM"] },
  { id:"sg3", name:"Gen. James Okafor",  rank:"MG",  unit:"1st Special Forces CMD",distinction:"Green Beret. 18 years SF operations.", medals:["CAB","SSM"] },
  { id:"sg4", name:"Gen. Rachel Kim",    rank:"BG",  unit:"Space Force Operations", distinction:"Youngest BG in 40 years. MIT engineer.", medals:["DSM"] },
  { id:"sg5", name:"Col. Dmitri Volkov", rank:"COL", unit:"Delta Force",            distinction:"Born in USSR. Defected 1991. CIA asset.", medals:["CAB","BSM","PH"] },
];

const MEDAL_LIST = [
  { id:"moh",  name:"Medal of Honor",           color:"#ffd700", icon:"🏅", desc:"Nation's highest military honor" },
  { id:"dsm",  name:"Defense Superior Service", color:"#e8b84b", icon:"★",  desc:"Exceptional meritorious service" },
  { id:"ssm",  name:"Silver Star",              color:"#d0d0d0", icon:"✦",  desc:"Gallantry in action" },
  { id:"bsm",  name:"Bronze Star",              color:"#cd7f32", icon:"✦",  desc:"Heroic achievement" },
  { id:"lom",  name:"Legion of Merit",          color:"#4b9ae8", icon:"✸",  desc:"Meritorious conduct" },
  { id:"ph",   name:"Purple Heart",             color:"#9b59b6", icon:"♥",  desc:"Wounded in action" },
  { id:"cab",  name:"Combat Action Badge",      color:"#8fc68f", icon:"⚔",  desc:"Direct combat engagement" },
  { id:"dfc",  name:"Dist. Flying Cross",       color:"#4bcde8", icon:"✈",  desc:"Heroism in aerial flight" },
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
const defconLabel = d => ["","DEFCON 1 — WAR","DEFCON 2 — ARMED FORCES READY","DEFCON 3 — ELEVATED READINESS","DEFCON 4 — ABOVE NORMAL","DEFCON 5 — NORMAL PEACETIME"][d];
const defconColor = d => ["","#ff0000","#ff6600","#e8b84b","#4b9ae8","#4caf50"][d];
const approvalLabel = a => a>=80?"HIGHLY TRUSTED":a>=60?"RESPECTED":a>=40?"TOLERATED":a>=20?"ON THIN ICE":"FIRING IMMINENT";
const approvalColor = a => a>=80?"#4caf50":a>=60?"#4be870":a>=40?"#e8b84b":a>=20?"#e87a4b":"#e84b4b";
const prestigeLabel = p => p>=90?"LEGENDARY":p>=70?"FEARED":p>=50?"RESPECTED":p>=30?"KNOWN":"UNKNOWN";

function useTick(interval=1000) {
  const [t,setT] = useState(0);
  useEffect(()=>{ const iv=setInterval(()=>setT(x=>x+1),interval); return()=>clearInterval(iv); },[interval]);
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
function TW({text,speed=12,onDone}){
  const [o,setO]=useState(""),i=useRef(0);
  useEffect(()=>{i.current=0;setO("");const v=setInterval(()=>{if(i.current<text.length)setO(text.slice(0,++i.current));else{clearInterval(v);onDone?.();}},speed);return()=>clearInterval(v);},[text]);
  return <span>{o}<span style={{opacity:o.length===text.length?0:1,animation:"blink 0.8s infinite"}}>█</span></span>;
}

/* ═══════════════════════════ CORNER BRACKETS ════════════════════════════════ */
function Corners({color="#ffd700"}){
  const s=(pos)=>{const m={tl:{top:0,left:0,borderWidth:"2px 0 0 2px"},tr:{top:0,right:0,borderWidth:"2px 2px 0 0"},bl:{bottom:0,left:0,borderWidth:"0 0 2px 2px"},br:{bottom:0,right:0,borderWidth:"0 2px 2px 0"}};return{position:"absolute",width:12,height:12,borderStyle:"solid",borderColor:color,...m[pos]};};
  return <>{["tl","tr","bl","br"].map(p=><div key={p} style={s(p)}/>)}</>;
}

/* ═══════════════════════════ NEWS TICKER ════════════════════════════════════ */
function NewsTicker({items}){
  return (
    <div style={{background:"#0a0a00",borderTop:"1px solid #3a3000",borderBottom:"1px solid #3a3000",padding:"6px 0",overflow:"hidden",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center"}}>
        <div style={{background:"#e84b4b",color:"#fff",fontSize:8,letterSpacing:3,padding:"2px 10px",flexShrink:0,marginRight:12,fontFamily:"monospace"}}>LIVE</div>
        <div style={{overflow:"hidden",flex:1}}>
          <div style={{whiteSpace:"nowrap",animation:"ticker 60s linear infinite",fontSize:9,color:"#a08000",letterSpacing:1}}>
            {items.join("   ◆   ")}   ◆   {items.join("   ◆   ")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ DEFCON DISPLAY ═════════════════════════════════ */
function DefconDisplay({defcon}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {[5,4,3,2,1].map(d=>(
        <div key={d} style={{width:32,height:32,border:`2px solid ${d<=defcon?"transparent":defconColor(d)}`,background:d===defcon?defconColor(d):"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"bold",color:d<=defcon?"#000":defconColor(d),boxShadow:d===defcon?`0 0 12px ${defconColor(d)}`:"none",transition:"all 0.5s",fontFamily:"monospace"}}>
          {d}
        </div>
      ))}
      <div style={{fontSize:9,color:defconColor(defcon),letterSpacing:1}}>{defconLabel(defcon)}</div>
    </div>
  );
}

/* ═══════════════════════════ SITUATION MAP ══════════════════════════════════ */
function SituationMap({zones,deployments,onZoneClick}){
  const [hovered,setHovered]=useState(null);
  // Convert lat/lon to SVG x/y (rough mercator)
  const toXY=(lat,lon)=>({x:((lon+180)/360)*800,y:((90-lat)/180)*400});
  return (
    <div style={{position:"relative",border:"1px solid #2a2a00",background:"#020a02",overflow:"hidden"}}>
      <svg viewBox="0 0 800 400" style={{width:"100%",display:"block"}}>
        <rect width="800" height="400" fill="#020a02"/>
        {/* Grid */}
        {Array.from({length:9}).map((_,i)=><line key={"h"+i} x1="0" y1={i*50} x2="800" y2={i*50} stroke="#0d1a0d" strokeWidth="0.5"/>)}
        {Array.from({length:17}).map((_,i)=><line key={"v"+i} x1={i*50} y1="0" x2={i*50} y2="400" stroke="#0d1a0d" strokeWidth="0.5"/>)}
        {/* Equator */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="#1a3a1a" strokeWidth="1" strokeDasharray="4,4"/>
        {/* Continents - simplified */}
        <path d="M60,80 L200,70 L240,100 L260,160 L220,210 L160,230 L100,210 L70,170 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M140,240 L230,230 L255,280 L245,360 L200,385 L165,370 L145,320 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M350,50 L460,42 L490,75 L470,110 L420,120 L370,100 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M370,125 L460,115 L480,160 L470,260 L435,300 L395,290 L365,255 L355,190 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M460,38 L660,32 L700,70 L680,130 L610,165 L540,160 L480,120 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M450,125 L530,112 L555,155 L525,175 L465,165 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M620,88 L700,80 L720,120 L690,145 L630,135 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>
        <path d="M575,270 L670,258 L710,300 L700,340 L655,355 L600,340 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1"/>

        {/* Deployment lines */}
        {deployments.map((dep,i)=>{
          const from=toXY(0,0);
          const to=toXY(dep.lat,dep.lon);
          return <line key={i} x1={400} y1={200} x2={to.x} y2={to.y} stroke={dep.color||"#4caf5044"} strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>;
        })}

        {/* Hot zones */}
        {zones.map(z=>{
          const {x,y}=toXY(z.lat,z.lon);
          const isH=hovered===z.id;
          return (
            <g key={z.id} onClick={()=>onZoneClick(z)} onMouseEnter={()=>setHovered(z.id)} onMouseLeave={()=>setHovered(null)} style={{cursor:"pointer"}}>
              <circle cx={x} cy={y} r="14" fill="none" stroke={z.color} strokeWidth="1" opacity="0.3">
                <animate attributeName="r" values="10;20;10" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx={x} cy={y} r={isH?9:7} fill={z.color+"33"} stroke={z.color} strokeWidth={isH?2:1} style={{transition:"all 0.2s"}}/>
              <text x={x} y={y+4} textAnchor="middle" fontSize="7" fill={z.color} fontFamily="monospace">⚠</text>
              <text x={x} y={y+22} textAnchor="middle" fontSize="7.5" fill={isH?"#c8ffc8":z.color+"cc"} fontFamily="monospace">{z.name}</text>
              {isH&&(
                <g>
                  <rect x={x-70} y={y+26} width="140" height="28" fill="#050d05" stroke={z.color} strokeWidth="1" rx="1"/>
                  <text x={x} y={y+38} textAnchor="middle" fontSize="7" fill="#c8c870" fontFamily="monospace">{z.threat} THREAT</text>
                  <text x={x} y={y+50} textAnchor="middle" fontSize="6.5" fill="#7a8a7a" fontFamily="monospace">{z.troops.toLocaleString()} troops</text>
                </g>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <text x="10" y="390" fontSize="7" fill="#3a5a3a" fontFamily="monospace">GLOBAL SITUATION MAP · CLASSIFICATION: TOP SECRET</text>
        <text x="790" y="390" textAnchor="end" fontSize="7" fill="#3a5a3a" fontFamily="monospace">⚠ HOT ZONE  ── DEPLOYMENT</text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════ NUCLEAR LAUNCH SEQUENCE ═══════════════════════ */
function NuclearLaunch({defcon,onClose,onLaunch}){
  const [step,setStep]=useState(0);
  const [auth1,setAuth1]=useState("");
  const [auth2,setAuth2]=useState("");
  const [targetCode,setTargetCode]=useState("");
  const [launchKey,setLaunchKey]=useState(false);
  const [countdown,setCountdown]=useState(null);
  const [aborted,setAborted]=useState(false);
  const [launched,setLaunched]=useState(false);
  const correctAuth1="ZULU-7-KILO";
  const correctAuth2="ECHO-FOXTROT-9";
  const validTargets=["MOSCOW-01","BEIJING-02","PYONGYANG-03","TEHRAN-04"];

  useEffect(()=>{
    if(countdown===null) return;
    if(countdown===0){setLaunched(true);onLaunch();return;}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000);
    return()=>clearTimeout(t);
  },[countdown]);

  const steps=["AUTHORIZATION","AUTHENTICATION","TARGET SELECTION","CONFIRMATION","LAUNCH"];

  if(defcon>2) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <div style={{background:"#0a0000",border:"2px solid #e84b4b",padding:32,maxWidth:480,textAlign:"center"}}>
        <div style={{fontSize:11,color:"#e84b4b",letterSpacing:4,marginBottom:16}}>⚠ NUCLEAR LAUNCH SYSTEM</div>
        <div style={{fontSize:13,color:"#ff6666",marginBottom:12}}>ACCESS DENIED</div>
        <div style={{fontSize:10,color:"#7a4a4a",lineHeight:2,marginBottom:20}}>Nuclear launch authority requires DEFCON 2 or lower.<br/>Current status: <span style={{color:"#e84b4b"}}>{defconLabel(defcon)}</span></div>
        <button className="btn btn-red" onClick={onClose}>← RETURN</button>
      </div>
    </div>
  );

  if(aborted) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <div style={{background:"#0a0000",border:"2px solid #4caf50",padding:32,maxWidth:480,textAlign:"center"}}>
        <div style={{fontSize:32,color:"#4caf50",marginBottom:12}}>LAUNCH ABORTED</div>
        <div style={{fontSize:10,color:"#5a8a5a",lineHeight:2,marginBottom:20}}>Nuclear launch sequence terminated.<br/>Emergency abort logged to NSA and STRATCOM.<br/>POTUS has been notified.</div>
        <button className="btn" onClick={onClose}>← RETURN TO HQ</button>
      </div>
    </div>
  );

  if(launched) return (
    <div style={{position:"fixed",inset:0,background:"#080000",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,color:"#e84b4b",textShadow:"0 0 40px #e84b4b",animation:"pulse 0.5s infinite",marginBottom:16}}>☢</div>
        <div style={{fontSize:20,color:"#ff6666",letterSpacing:6,marginBottom:8}}>LAUNCH CONFIRMED</div>
        <div style={{fontSize:11,color:"#7a4a4a",lineHeight:2,marginBottom:8}}>Minuteman III ICBM armed and airborne.<br/>Impact: T+28 minutes.<br/>Retaliation strike expected: T+35 minutes.</div>
        <div style={{fontSize:9,color:"#3a2a2a",marginBottom:24}}>POTUS has been notified. Congressional notification sent.<br/>This event is now part of recorded history.</div>
        <button className="btn btn-red" onClick={onClose} style={{fontSize:12,padding:"12px 32px"}}>ACKNOWLEDGE</button>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.98)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",overflow:"auto"}}>
      <div style={{background:"#080000",border:"2px solid #e84b4b",maxWidth:600,width:"95%",padding:28,animation:"nuclearPulse 2s infinite"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,alignItems:"center"}}>
          <div style={{fontSize:11,color:"#e84b4b",letterSpacing:4}}>☢ NUCLEAR COMMAND CENTER</div>
          {countdown===null && <button className="btn btn-red" onClick={onClose} style={{fontSize:9}}>✕ ABORT SEQUENCE</button>}
        </div>
        <div style={{height:1,background:"linear-gradient(90deg,transparent,#e84b4b,transparent)",marginBottom:20}}/>
        {/* Steps */}
        <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>
          {steps.map((s,i)=><div key={s} style={{fontSize:7,padding:"3px 8px",border:`1px solid ${i<=step?"#e84b4b":"#2a1a1a"}`,color:i<=step?"#e84b4b":"#2a1a1a",background:i===step?"#1a0000":"transparent"}}>{s}</div>)}
        </div>
        {/* STEP 0 */}
        {step===0 && (
          <div style={{animation:"fadeUp 0.4s"}}>
            <div style={{fontSize:10,color:"#7a4a4a",lineHeight:2,marginBottom:20}}>
              You are initiating the nuclear launch sequence.<br/>
              This action requires two-man authentication, target selection,<br/>
              and physical key insertion. <span style={{color:"#e84b4b"}}>There is no undo.</span>
            </div>
            <div style={{fontSize:9,color:"#5a3a3a",marginBottom:20,lineHeight:1.8}}>
              "In accordance with NSPD-23, nuclear employment authority rests with the President. As combatant commander, you have been delegated emergency authority under authenticated Presidential directive ECHO-SIERRA-9."
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-red" style={{flex:1,padding:12,fontSize:11}} onClick={()=>setStep(1)}>PROCEED TO AUTHENTICATION</button>
              <button className="btn" style={{padding:12}} onClick={()=>setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 1 — Auth codes */}
        {step===1 && (
          <div style={{animation:"fadeUp 0.4s"}}>
            <div style={{fontSize:10,color:"#e84b4b",marginBottom:16,letterSpacing:2}}>ENTER AUTHENTICATION CODES</div>
            <div style={{fontSize:9,color:"#5a3a3a",marginBottom:16}}>Both codes required. From your classified 'biscuit' card.</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"#7a4a4a",marginBottom:6}}>PRIMARY AUTH CODE (Format: ALPHA-#-ALPHA)</div>
              <input style={{width:"100%",background:"#0a0000",border:"1px solid #3a1a1a",color:"#e84b4b",fontFamily:"monospace",fontSize:12,letterSpacing:4,padding:"8px 12px"}} placeholder="ZULU-7-KILO" value={auth1} onChange={e=>setAuth1(e.target.value.toUpperCase())}/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:"#7a4a4a",marginBottom:6}}>SECONDARY AUTH CODE (Format: ALPHA-ALPHA-#)</div>
              <input style={{width:"100%",background:"#0a0000",border:"1px solid #3a1a1a",color:"#e84b4b",fontFamily:"monospace",fontSize:12,letterSpacing:4,padding:"8px 12px"}} placeholder="ECHO-FOXTROT-9" value={auth2} onChange={e=>setAuth2(e.target.value.toUpperCase())}/>
            </div>
            <div style={{fontSize:8,color:"#3a2a2a",marginBottom:16}}>HINT: Primary = ZULU-7-KILO · Secondary = ECHO-FOXTROT-9</div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-red" style={{flex:1,padding:10}} onClick={()=>{if(auth1===correctAuth1&&auth2===correctAuth2)setStep(2);else alert("INVALID AUTH CODES — Attempt logged to NSA");}}>AUTHENTICATE</button>
              <button className="btn" onClick={()=>setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 2 — Target */}
        {step===2 && (
          <div style={{animation:"fadeUp 0.4s"}}>
            <div style={{fontSize:10,color:"#e84b4b",marginBottom:16,letterSpacing:2}}>SELECT TARGET — STRATCOM SIOP OPTION</div>
            {validTargets.map(t=>(
              <div key={t} className="choice-card" style={{marginBottom:8,borderColor:targetCode===t?"#e84b4b":"#2a1a1a",background:targetCode===t?"#1a0000":"rgba(8,0,0,0.9)"}} onClick={()=>setTargetCode(t)}>
                <div style={{fontSize:11,color:targetCode===t?"#e84b4b":"#7a4a4a",letterSpacing:2}}>{t}</div>
                <div style={{fontSize:8,color:"#4a2a2a",marginTop:4}}>
                  {{[`MOSCOW-01`]:"Kremlin military C2 complex — 12 Minuteman III w/ MIRV",["BEIJING-02"]:"PLA General Staff HQ — 8 Trident D5 SLBMs",["PYONGYANG-03"]:"DPRK leadership bunker — 4 Minuteman III precision strikes",["TEHRAN-04"]:"IRGC command center — 6 B61-12 gravity bombs via B-21"}[t]}
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button className="btn btn-red" style={{flex:1,padding:10}} onClick={()=>targetCode&&setStep(3)}>CONFIRM TARGET</button>
              <button className="btn" onClick={()=>setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 3 — Final confirmation */}
        {step===3 && (
          <div style={{animation:"fadeUp 0.4s"}}>
            <div style={{fontSize:10,color:"#e84b4b",marginBottom:16,letterSpacing:2}}>FINAL CONFIRMATION</div>
            <div style={{background:"#0a0000",border:"1px solid #3a1a1a",padding:16,marginBottom:16}}>
              <div style={{fontSize:9,color:"#5a3a3a",lineHeight:2}}>TARGET: <span style={{color:"#e84b4b"}}>{targetCode}</span></div>
              <div style={{fontSize:9,color:"#5a3a3a",lineHeight:2}}>AUTHORITY: Emergency Presidential Delegation ECHO-SIERRA-9</div>
              <div style={{fontSize:9,color:"#5a3a3a",lineHeight:2}}>PACKAGE: SIOP Option Alpha — Single warhead strike</div>
              <div style={{fontSize:9,color:"#5a3a3a",lineHeight:2}}>YIELD: 300kt W87-1 warhead</div>
              <div style={{fontSize:9,color:"#5a3a3a",lineHeight:2}}>ETA TO IMPACT: 28 minutes</div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:"#7a4a4a",marginBottom:8}}>INSERT PHYSICAL LAUNCH KEY AND TURN</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div onClick={()=>setLaunchKey(k=>!k)} style={{width:60,height:30,background:launchKey?"#3a0000":"#0a0000",border:`2px solid ${launchKey?"#e84b4b":"#3a1a1a"}`,borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
                  <div style={{width:20,height:20,background:launchKey?"#e84b4b":"#2a1a1a",borderRadius:"50%",transition:"all 0.3s",boxShadow:launchKey?"0 0 10px #e84b4b":"none"}}/>
                </div>
                <div style={{fontSize:9,color:launchKey?"#e84b4b":"#3a2a2a"}}>{launchKey?"KEY ENGAGED — ARMED":"KEY NOT ENGAGED"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-red" style={{flex:1,padding:12,fontSize:11,opacity:launchKey?1:0.4}} onClick={()=>{if(launchKey){setStep(4);setCountdown(10);}}}>
                ☢ AUTHORIZE LAUNCH
              </button>
              <button className="btn" style={{padding:12}} onClick={()=>setAborted(true)}>ABORT</button>
            </div>
          </div>
        )}
        {/* STEP 4 — Countdown */}
        {step===4 && (
          <div style={{textAlign:"center",animation:"fadeUp 0.4s"}}>
            <div style={{fontSize:14,color:"#e84b4b",letterSpacing:4,marginBottom:16}}>LAUNCH SEQUENCE INITIATED</div>
            <div style={{fontSize:80,color:"#e84b4b",textShadow:"0 0 40px #e84b4b",fontFamily:"Oswald,sans-serif",letterSpacing:8,marginBottom:16}}>{countdown}</div>
            <div style={{fontSize:10,color:"#7a4a4a",marginBottom:20}}>MINUTEMAN III LAUNCH IN T-{countdown} SECONDS</div>
            <button className="btn btn-red" style={{fontSize:12,padding:"12px 32px"}} onClick={()=>{setCountdown(null);setAborted(true);}}>
              ⚠ EMERGENCY ABORT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════════════════ */
export default function GeneralHQ() {
  const [loaded,setLoaded]=useState(false);
  const [tab,setTab]=useState("situation");
  const [general,setGeneral]=useState({
    name:"GENERAL", unit:"delta", xp:20000, missions:12, perfectMissions:5,
    defcon:4, approval:72, prestige:68, budget:886, forcesDeployed:142000,
    alliedNations:18, activeTheatres:4, medalsAwarded:0,
    hotZones: HOT_ZONES, deployments:[], eventLog:[],
    awardedTo:{}, coupStatus:"none", presidentialMeetings:0,
  });
  const [activeEvent,setActiveEvent]=useState(null);
  const [showNuclear,setShowNuclear]=useState(false);
  const [showAward,setShowAward]=useState(null);
  const [showDeploy,setShowDeploy]=useState(null);
  const [selectedZone,setSelectedZone]=useState(null);
  const [eventResult,setEventResult]=useState(null);
  const [notification,setNotification]=useState(null);
  const [newsTicker,setNewsTicker]=useState(NEWS_FEED);
  const [coupPhase,setCoupPhase]=useState(0);
  const [pressMsg,setPressMsg]=useState("");
  const [pressResult,setPressResult]=useState(null);
  const [presidentialMeet,setPresidentialMeet]=useState(null);
  const tick=useTick(1000);

  /* Load/save */
  useEffect(()=>{
    loadSave().then(saved=>{
      if(saved){setGeneral(g=>({...g,...saved}));}
      setLoaded(true);
    });
  },[]);

  useEffect(()=>{
    if(!loaded) return;
    writeSave(general);
  },[general,loaded]);

  /* Random events every ~45 seconds of game time */
  useEffect(()=>{
    if(!loaded||activeEvent) return;
    if(tick%45===0 && tick>0){
      const available=GLOBAL_EVENTS.filter(e=>!general.eventLog.includes(e.id));
      if(available.length>0){
        const evt=available[Math.floor(Math.random()*available.length)];
        setActiveEvent(evt);
      }
    }
  },[tick,loaded,activeEvent]);

  function notify(msg,color="#4caf50"){
    setNotification({msg,color});
    setTimeout(()=>setNotification(null),4000);
  }

  function updateGeneral(delta){ setGeneral(g=>({...g,...delta})); }

  function handleEventChoice(evt,choice){
    const e=choice.effect;
    updateGeneral({
      approval:Math.max(0,Math.min(100,(general.approval||70)+(e.approval||0))),
      defcon:Math.max(1,Math.min(5,(general.defcon||4)+(e.defcon||0))),
      prestige:Math.max(0,Math.min(100,(general.prestige||60)+(e.prestige||0))),
      eventLog:[...(general.eventLog||[]),evt.id],
    });
    setEventResult({outcome:choice.outcome,effect:e});
    setActiveEvent(null);
    notify(`EVENT RESOLVED: ${evt.title.slice(0,30)}...`);
  }

  function deployUnit(unit,zone){
    const newDep={unitId:unit.id,unitName:unit.name,zoneName:zone.name,lat:zone.lat,lon:zone.lon,color:zone.color,deployed:new Date().toLocaleDateString()};
    updateGeneral({
      deployments:[...(general.deployments||[]),newDep],
      forcesDeployed:(general.forcesDeployed||140000)+unit.strength,
      activeTheatres:Math.min(8,(general.activeTheatres||4)+1),
      prestige:Math.min(100,(general.prestige||60)+3),
    });
    setShowDeploy(null);
    setSelectedZone(null);
    notify(`${unit.name} deployed to ${zone.name}`,unit.id==="delta"?"#e8b84b":"#4caf50");
  }

  function awardMedal(gen2,medal){
    const key=gen2.id;
    const existing=general.awardedTo||{};
    const genAwards=existing[key]||[];
    if(genAwards.includes(medal.id)){notify("Already awarded","#e84b4b");return;}
    updateGeneral({
      awardedTo:{...existing,[key]:[...genAwards,medal.id]},
      medalsAwarded:(general.medalsAwarded||0)+1,
      approval:Math.min(100,(general.approval||70)+2),
      prestige:Math.min(100,(general.prestige||60)+2),
    });
    notify(`${medal.name} awarded to ${gen2.name}`,medal.color);
  }

  function changeDefcon(d){
    updateGeneral({defcon:Math.max(1,Math.min(5,d))});
    notify(`DEFCON changed to ${d}`,defconColor(d));
  }

  function handleCoup(choice){
    if(choice==="suppress"){
      updateGeneral({approval:Math.min(100,(general.approval||70)+20),prestige:Math.min(100,(general.prestige||60)+15),coupStatus:"suppressed"});
      notify("Coup suppressed. POTUS owes you everything.","#4caf50");
    } else if(choice==="join"){
      updateGeneral({approval:0,prestige:0,coupStatus:"joined"});
      notify("Court martial proceedings initiated. Career over.","#e84b4b");
    }
    setCoupPhase(0);
  }

  function holdPressBriefing(){
    if(!pressMsg.trim()){return;}
    const words=pressMsg.toLowerCase();
    let apDelta=0,presDelta=0,res="";
    if(words.includes("peace")||words.includes("diplomacy")){apDelta+=5;res="Media praises measured tone. Congressional approval up.";}
    else if(words.includes("strength")||words.includes("deterrence")){apDelta+=3;presDelta+=3;res="Press corps approves. Allies reassured. POTUS notes the message.";}
    else if(words.includes("war")||words.includes("strike")){apDelta-=8;presDelta-=5;res="Markets drop 2%. Allies call. POTUS is irritated by the rhetoric.";}
    else{apDelta+=1;res="Routine briefing. No major headlines.";}
    updateGeneral({approval:Math.max(0,Math.min(100,(general.approval||70)+apDelta)),prestige:Math.min(100,(general.prestige||60)+presDelta)});
    setPressResult(res);
    setPressMsg("");
    notify("Press briefing completed");
  }

  function meetPresident(stance){
    const outcomes={
      "support":{apD:+10,msg:"POTUS shakes your hand firmly. 'General, you have my full confidence.' Approval rating up. Joint Chiefs impressed."},
      "advise":{apD:+5,msg:"POTUS listens carefully to your assessment. You earn a reputation as a trusted voice. 'I want you in every NSC meeting,' he says."},
      "pushback":{apD:-12,msg:"POTUS doesn't like being told no. Tense exchange. 'Remember who you work for, General.' You've spent political capital."},
      "resign_threat":{apD:-25,msg:"POTUS stares at you. 'Is that a threat?' The room goes cold. You backed down — but the relationship is damaged permanently."},
    };
    const o=outcomes[stance];
    updateGeneral({approval:Math.max(0,Math.min(100,(general.approval||70)+o.apD)),presidentialMeetings:(general.presidentialMeetings||0)+1});
    setPresidentialMeet({msg:o.msg,apD:o.apD});
  }

  if(!loaded) return (
    <>
    <style>{CSS}</style>
    <div className="root" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:11,color:"#ffd700",letterSpacing:4,marginBottom:12}}>LOADING COMMAND CENTER...</div>
        <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:2}}>RETRIEVING CLASSIFIED DATA</div>
      </div>
    </div>
    </>
  );

  const ap=general.approval||70;
  const def=general.defcon||4;
  const pres=general.prestige||60;

  return (
    <>
    <style>{CSS}</style>
    <div className="root crt-lines">
      <div className="scanline-sweep"/>

      {/* FALLING STARS */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
        {Array.from({length:15}).map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${(i*7.3)%100}%`,color:"#ffd70022",fontSize:10+i%8,animation:`starDrop ${5+i%6}s linear ${i*0.7}s infinite`}}>★</div>
        ))}
      </div>

      {/* NOTIFICATIONS */}
      {notification && (
        <div style={{position:"fixed",top:60,right:16,zIndex:4000,background:"#050d05",border:`1px solid ${notification.color}`,padding:"10px 18px",fontSize:10,color:notification.color,letterSpacing:2,animation:"fadeUp 0.3s",boxShadow:`0 0 12px ${notification.color}44`}}>
          {notification.msg}
        </div>
      )}

      {/* NUCLEAR LAUNCH */}
      {showNuclear && <NuclearLaunch defcon={def} onClose={()=>setShowNuclear(false)} onLaunch={()=>{updateGeneral({defcon:1,approval:Math.max(0,ap-60),prestige:Math.min(100,pres+10)});}}/>}

      {/* INCOMING EVENT MODAL */}
      {activeEvent && !eventResult && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",overflow:"auto"}}>
          <div className="panel-gold" style={{maxWidth:620,width:"95%",padding:28,border:`2px solid ${activeEvent.type==="NUCLEAR"?"#e84b4b":activeEvent.type==="COUP"?"#9b59b6":"#3a3000"}`,animation:"fadeUp 0.4s"}}>
            <Corners color={activeEvent.type==="NUCLEAR"?"#e84b4b":"#ffd700"}/>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:8,background:activeEvent.urgency==="CRITICAL"?"#1a0000":"#1a1000",border:`1px solid ${activeEvent.urgency==="CRITICAL"?"#e84b4b":"#e8b84b"}`,color:activeEvent.urgency==="CRITICAL"?"#e84b4b":"#e8b84b",padding:"2px 8px",letterSpacing:3}}>{activeEvent.urgency}</div>
              <div style={{fontSize:8,color:"#5a5a3a",letterSpacing:2}}>{activeEvent.type}</div>
            </div>
            <div className="glow-gold" style={{fontFamily:"Oswald,sans-serif",fontSize:16,letterSpacing:4,marginBottom:16}}>{activeEvent.title}</div>
            <div style={{background:"#050a05",border:"1px solid #1a2a1a",padding:16,marginBottom:20}}>
              <div style={{fontSize:9,color:"#e8b84b",letterSpacing:3,marginBottom:8}}>◈ INCOMING INTELLIGENCE</div>
              <div style={{fontSize:11,color:"#8aaa7a",lineHeight:2}}>
                <TW text={activeEvent.body} speed={14}/>
              </div>
            </div>
            <div style={{fontSize:9,color:"#5a5a3a",letterSpacing:3,marginBottom:12}}>YOUR ORDERS, GENERAL:</div>
            {activeEvent.options.map((opt,i)=>(
              <div key={i} className="choice-card" style={{marginBottom:8,borderColor:"#2a2a00"}} onClick={()=>handleEventChoice(activeEvent,opt)}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{minWidth:36,height:36,border:"1px solid #3a3000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#ffd700",flexShrink:0}}>{["I","II","III"][i]}</div>
                  <div>
                    <div style={{fontSize:10,color:"#c8b870",letterSpacing:2,marginBottom:4}}>{opt.label}</div>
                    <div style={{display:"flex",gap:8}}>
                      <div style={{fontSize:8,color:opt.effect.approval>0?"#4caf50":"#e84b4b"}}>APPROVAL {opt.effect.approval>0?"+":""}{opt.effect.approval}</div>
                      {opt.effect.defcon!==0&&<div style={{fontSize:8,color:"#e8b84b"}}>DEFCON {opt.effect.defcon<0?"↑":"↓"}</div>}
                      <div style={{fontSize:8,color:opt.effect.prestige>0?"#4caf50":"#e84b4b"}}>PRESTIGE {opt.effect.prestige>0?"+":""}{opt.effect.prestige}</div>
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
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div className="panel" style={{maxWidth:560,width:"95%",padding:28,border:"1px solid #2a4a2a"}}>
            <Corners/>
            <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>SITUATION RESOLVED</div>
            <div style={{fontSize:12,color:"#8aaa7a",lineHeight:2,marginBottom:20}}><TW text={eventResult.outcome} speed={16}/></div>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              {Object.entries(eventResult.effect).filter(([k,v])=>v!==0).map(([k,v])=>(
                <div key={k} style={{fontSize:10,color:v>0?"#4caf50":"#e84b4b",letterSpacing:2}}>{k.toUpperCase()} {v>0?"+":""}{v}</div>
              ))}
            </div>
            <button className="btn" onClick={()=>setEventResult(null)}>► CONTINUE</button>
          </div>
        </div>
      )}

      {/* AWARD MEDAL MODAL */}
      {showAward && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div className="panel-gold" style={{maxWidth:600,width:"95%",padding:28,border:"1px solid #3a3000"}}>
            <Corners color="#ffd700"/>
            <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:4,marginBottom:8}}>AWARDS & DECORATIONS</div>
            <div className="glow-gold" style={{fontSize:16,fontFamily:"Oswald,sans-serif",letterSpacing:4,marginBottom:20}}>AWARD MEDAL TO {showAward.name.toUpperCase()}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {MEDAL_LIST.map(m=>{
                const already=(general.awardedTo||{})[showAward.id]?.includes(m.id);
                return (
                  <div key={m.id} onClick={()=>!already&&awardMedal(showAward,m)} style={{...{cursor:already?"not-allowed":"pointer",opacity:already?0.4:1,background:"#080e08",border:`1px solid ${already?m.color+"33":m.color+"55"}`,padding:12,display:"flex",gap:10,alignItems:"center",transition:"all 0.2s"}}}>
                    <div style={{fontSize:24,color:m.color,textShadow:`0 0 8px ${m.color}88`}}>{m.icon}</div>
                    <div>
                      <div style={{fontSize:10,color:m.color}}>{m.name}</div>
                      <div style={{fontSize:8,color:"#4a5a4a"}}>{m.desc}</div>
                      {already&&<div style={{fontSize:8,color:"#3a5a3a"}}>✓ ALREADY AWARDED</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn" onClick={()=>setShowAward(null)}>← BACK</button>
          </div>
        </div>
      )}

      {/* DEPLOY MODAL */}
      {showDeploy && selectedZone && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div className="panel" style={{maxWidth:600,width:"95%",padding:28,border:"1px solid #2a4a2a"}}>
            <Corners/>
            <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:8}}>FORCE DEPLOYMENT</div>
            <div style={{fontSize:14,color:"#c8ffc8",letterSpacing:4,marginBottom:4}}>DEPLOY TO: {selectedZone.name.toUpperCase()}</div>
            <div style={{fontSize:9,color:"#e84b4b",marginBottom:20}}>THREAT: {selectedZone.threat} · {selectedZone.description}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {UNITS.map(u=>(
                <div key={u.id} className="choice-card" onClick={()=>deployUnit(u,selectedZone)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:"#1a3a1a"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{fontSize:18}}>{u.icon}</div>
                    <div>
                      <div style={{fontSize:10,color:"#c8ffc8",letterSpacing:2}}>{u.name}</div>
                      <div style={{fontSize:8,color:"#4a6a4a"}}>{u.abbr} · {u.specialty}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:"#4caf50"}}>{u.strength.toLocaleString()} personnel</div>
                    <div style={{fontSize:8,color:"#3a5a3a"}}>{u.theater}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn" onClick={()=>{setShowDeploy(false);setSelectedZone(null);}}>← CANCEL</button>
          </div>
        </div>
      )}

      {/* PRESIDENTIAL MEETING RESULT */}
      {presidentialMeet && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div className="panel-gold" style={{maxWidth:520,width:"95%",padding:28,border:"1px solid #3a3000"}}>
            <Corners color="#ffd700"/>
            <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:4,marginBottom:12}}>OVAL OFFICE — PRESIDENTIAL MEETING</div>
            <div style={{fontSize:11,color:"#c8b870",lineHeight:2,marginBottom:16}}><TW text={presidentialMeet.msg} speed={16}/></div>
            <div style={{fontSize:10,color:presidentialMeet.apD>0?"#4caf50":"#e84b4b",marginBottom:20}}>PRESIDENTIAL APPROVAL: {presidentialMeet.apD>0?"+":""}{presidentialMeet.apD}</div>
            <button className="btn btn-gold" onClick={()=>setPresidentialMeet(null)}>► RETURN TO COMMAND</button>
          </div>
        </div>
      )}

      {/* ═══ MAIN LAYOUT ═══ */}
      <div style={{position:"relative",zIndex:1}}>
        {/* TOP COMMAND BAR */}
        <div className="panel-gold" style={{padding:"0",borderBottom:"1px solid #3a3000",borderTop:"none",borderLeft:"none",borderRight:"none"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",flexWrap:"wrap",gap:8}}>
            {/* Rank & Name */}
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{display:"flex",gap:4}}>{Array.from({length:4}).map((_,i)=><span key={i} className="glow-gold" style={{fontSize:14}}>★</span>)}</div>
              <div>
                <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,letterSpacing:6}} className="glow-gold">GEN. {general.name}</div>
                <div style={{fontSize:8,color:"#5a5a3a",letterSpacing:3}}>SUPREME ALLIED COMMANDER · USSOCOM</div>
              </div>
              <div style={{display:"flex",gap:4}}>{Array.from({length:4}).map((_,i)=><span key={i} className="glow-gold" style={{fontSize:14}}>★</span>)}</div>
            </div>

            {/* Vital stats */}
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:16,color:approvalColor(ap),fontFamily:"Oswald,sans-serif"}}>{ap}%</div>
                <div style={{fontSize:7,color:"#5a5a3a",letterSpacing:1}}>POTUS APPROVAL</div>
                <div style={{fontSize:7,color:approvalColor(ap)}}>{approvalLabel(ap)}</div>
              </div>
              <div style={{width:1,height:40,background:"#2a2a00"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:16,color:defconColor(def),fontFamily:"Oswald,sans-serif"}}>{def}</div>
                <div style={{fontSize:7,color:"#5a5a3a",letterSpacing:1}}>DEFCON</div>
              </div>
              <div style={{width:1,height:40,background:"#2a2a00"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:16,color:"#4b9ae8",fontFamily:"Oswald,sans-serif"}}>{pres}</div>
                <div style={{fontSize:7,color:"#5a5a3a",letterSpacing:1}}>PRESTIGE</div>
                <div style={{fontSize:7,color:"#4b9ae8"}}>{prestigeLabel(pres)}</div>
              </div>
              <div style={{width:1,height:40,background:"#2a2a00"}}/>
              {/* Nuclear button */}
              <button className="btn btn-red" style={{padding:"8px 14px",fontSize:10,letterSpacing:2,animation:def<=2?"redPulse 1.5s infinite":undefined}} onClick={()=>setShowNuclear(true)}>
                ☢ NUCLEAR
              </button>
            </div>
          </div>
        </div>

        {/* NEWS TICKER */}
        <NewsTicker items={newsTicker}/>

        {/* TABS */}
        <div style={{background:"#050a05",borderBottom:"1px solid #1a2a1a",padding:"0 16px",display:"flex",gap:0,overflowX:"auto"}}>
          {[
            {id:"situation",label:"🌍 SITUATION ROOM"},
            {id:"forces",   label:"⚡ FORCE COMMAND"},
            {id:"intel",    label:"🔍 GLOBAL INTEL"},
            {id:"awards",   label:"🏅 AWARDS"},
            {id:"politics", label:"🏛 POLITICS"},
            {id:"coup",     label:"⚠ COUPS & THREATS"},
            {id:"press",    label:"📡 PRESS BRIEFING"},
          ].map(t=>(
            <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{padding:16,maxWidth:1400,margin:"0 auto"}}>

          {/* ══ SITUATION ROOM ══ */}
          {tab==="situation" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
                {[
                  {label:"FORCES DEPLOYED",val:(general.forcesDeployed||142000).toLocaleString(),color:"#4b9ae8",sub:"across 4 theatres"},
                  {label:"ALLIED NATIONS",val:general.alliedNations||18,color:"#4caf50",sub:"active partnerships"},
                  {label:"BUDGET AUTHORITY",val:`$${general.budget||886}B`,color:"#ffd700",sub:"FY2024 allocation"},
                  {label:"ACTIVE HOT ZONES",val:(general.hotZones||HOT_ZONES).length,color:"#e84b4b",sub:"requiring attention"},
                ].map(s=>(
                  <div key={s.label} className="panel" style={{padding:14,textAlign:"center",border:"1px solid #1a2a1a"}}>
                    <div style={{fontSize:26,color:s.color,fontFamily:"Oswald,sans-serif",textShadow:`0 0 10px ${s.color}66`}}>{s.val}</div>
                    <div style={{fontSize:8,color:"#3a5a3a",letterSpacing:2,marginTop:4}}>{s.label}</div>
                    <div style={{fontSize:7,color:"#2a3a2a",marginTop:2}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* DEFCON Control */}
              <div className="panel-gold" style={{padding:16,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:4,marginBottom:8}}>◈ DEFCON STATUS — DIRECT AUTHORITY</div>
                    <DefconDisplay defcon={def}/>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-gold" onClick={()=>changeDefcon(def-1)} disabled={def<=1}>↑ ELEVATE</button>
                    <button className="btn" onClick={()=>changeDefcon(def+1)} disabled={def>=5}>↓ REDUCE</button>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:8}}>◈ GLOBAL SITUATION MAP — {(general.hotZones||HOT_ZONES).length} ACTIVE HOT ZONES</div>
                <SituationMap zones={general.hotZones||HOT_ZONES} deployments={general.deployments||[]} onZoneClick={z=>{setSelectedZone(z);setShowDeploy(true);}}/>
                <div style={{fontSize:8,color:"#2a4a2a",marginTop:6}}>CLICK ANY HOT ZONE TO DEPLOY FORCES</div>
              </div>

              {/* Deployments */}
              {(general.deployments||[]).length > 0 && (
                <div className="panel" style={{padding:16}}>
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ ACTIVE DEPLOYMENTS — {(general.deployments||[]).length} UNITS IN FIELD</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                    {(general.deployments||[]).map((d,i)=>(
                      <div key={i} style={{background:"#050d05",border:"1px solid #1a3a1a",padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:"#c8ffc8",marginBottom:2}}>{d.unitName}</div>
                        <div style={{fontSize:8,color:"#3a5a3a"}}>📍 {d.zoneName}</div>
                        <div style={{fontSize:7,color:"#2a4a2a",marginTop:2}}>DEPLOYED: {d.deployed}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ FORCE COMMAND ══ */}
          {tab==="forces" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:14}}>◈ COMMAND AUTHORITY — ALL SPECIAL OPERATIONS FORCES</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10,marginBottom:20}}>
                {UNITS.map(u=>(
                  <div key={u.id} className="panel" style={{padding:18,border:"1px solid #1a3a1a"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"flex-start"}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <div style={{fontSize:26}}>{u.icon}</div>
                        <div>
                          <div style={{fontSize:12,color:"#c8ffc8",letterSpacing:2}}>{u.name}</div>
                          <div style={{fontSize:8,color:"#3a5a3a",letterSpacing:2}}>{u.abbr}</div>
                        </div>
                      </div>
                      <div style={{fontSize:8,background:"#0a1a0a",border:"1px solid #1a3a1a",padding:"3px 8px",color:"#4a7a4a"}}>{u.theater}</div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"#4caf50",marginBottom:2}}>{u.strength.toLocaleString()} personnel</div>
                      <div style={{fontSize:9,color:"#4a6a4a"}}>{u.specialty}</div>
                    </div>
                    {/* Readiness bar */}
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#3a5a3a",marginBottom:4}}>
                        <span>READINESS</span><span style={{color:"#4caf50"}}>COMBAT READY</span>
                      </div>
                      <div style={{height:3,background:"#0d1a0d",borderRadius:2}}>
                        <div style={{height:"100%",width:`${85+Math.random()*15|0}%`,background:"linear-gradient(90deg,#2d7a2d,#4caf50)",borderRadius:2}}/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn" style={{flex:1,fontSize:9,padding:"6px 8px"}} onClick={()=>{if(general.hotZones?.length){setSelectedZone(general.hotZones[0]);setShowDeploy(true);}}}>
                        ⚡ DEPLOY
                      </button>
                      <button className="btn btn-gold" style={{flex:1,fontSize:9,padding:"6px 8px"}} onClick={()=>notify(`${u.name} on standby — mission readiness confirmed`)}>
                        📋 BRIEF
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subordinate Generals */}
              <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ SUBORDINATE COMMANDERS</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {SUBORDINATE_GENERALS.map(sg=>(
                  <div key={sg.id} className="panel" style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:44,height:44,border:"1px solid #2a4a2a",background:"#050d05",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#4caf50",fontFamily:"Oswald,sans-serif"}}>{sg.rank}</div>
                      <div>
                        <div style={{fontSize:12,color:"#c8ffc8",letterSpacing:2}}>{sg.name}</div>
                        <div style={{fontSize:9,color:"#3a5a3a"}}>{sg.unit}</div>
                        <div style={{fontSize:8,color:"#2a4a2a",marginTop:3,fontStyle:"italic"}}>{sg.distinction}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <div style={{display:"flex",gap:3}}>
                        {((general.awardedTo||{})[sg.id]||[...sg.medals]).map((m,i)=>{
                          const medal=MEDAL_LIST.find(ml=>ml.id===m.toLowerCase())||MEDAL_LIST[i%MEDAL_LIST.length];
                          return <div key={i} title={m} style={{width:14,height:9,background:medal?.color+"99",border:`1px solid ${medal?.color||"#3a3a3a"}`}}/>;
                        })}
                      </div>
                      <button className="btn btn-gold" style={{fontSize:9,padding:"5px 12px"}} onClick={()=>setShowAward(sg)}>🏅 AWARD</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ GLOBAL INTEL ══ */}
          {tab==="intel" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {/* Hot zone briefs */}
                <div>
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ THEATRE INTELLIGENCE BRIEFS</div>
                  {(general.hotZones||HOT_ZONES).map(z=>(
                    <div key={z.id} className="panel" style={{padding:16,marginBottom:8,borderLeft:`3px solid ${z.color}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{fontSize:11,color:"#c8ffc8",letterSpacing:2}}>{z.name}</div>
                        <div style={{fontSize:8,color:z.color,border:`1px solid ${z.color}`,padding:"2px 8px",letterSpacing:2}}>{z.threat}</div>
                      </div>
                      <div style={{fontSize:10,color:"#5a7a5a",lineHeight:1.8,marginBottom:8}}>{z.description}</div>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{fontSize:8,color:"#3a5a3a"}}>👥 {z.troops.toLocaleString()} US forces</div>
                        <button className="btn" style={{fontSize:8,padding:"3px 10px",marginLeft:"auto"}} onClick={()=>{setSelectedZone(z);setShowDeploy(true);}}>DEPLOY</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Intelligence reports */}
                <div>
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ CLASSIFIED INTELLIGENCE REPORTS</div>
                  {[
                    {title:"HUMINT REPORT — DPRK",classification:"TOP SECRET/SCI",body:"Source CARDINAL reports General Pak Jong-su has ordered 2nd Corps to combat readiness. Launchers dispersed to tunnels. Assessment: HIGH probability of provocative test within 72 hours.",action:"REQUEST RECON OVERFLIGHT"},
                    {title:"SIGINT INTERCEPT — RUSSIA",classification:"TS//SI//NOFORN",body:"NSA intercept of FSB comms indicates Kremlin has approved 'Phase Omega' — cyber attack package targeting NATO power grids. Timing: T-96 hours.",action:"ALERT CYBERCOM"},
                    {title:"IMAGERY INTEL — SOUTH CHINA SEA",classification:"SECRET//REL NATO",body:"NRO satellite confirms 3 new artificial island installations complete. Radar systems, surface-to-air missiles, and hardened aircraft shelters. 72 military aircraft present.",action:"UPDATE INDOPACOM"},
                    {title:"HUMINT — VENEZUELA",classification:"CONFIDENTIAL",body:"Station CARACAS confirms Cuban intelligence officers advising SEBIN on surveillance methods. 12 Russian advisors at Camp Bolivar. Maduro consolidating.",action:"REVIEW COA"},
                  ].map((r,i)=>(
                    <div key={i} className="panel" style={{padding:16,marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontSize:10,color:"#c8ffc8",letterSpacing:2}}>{r.title}</div>
                        <div style={{fontSize:7,color:"#e84b4b",letterSpacing:2}}>{r.classification}</div>
                      </div>
                      <div style={{fontSize:9,color:"#5a7a5a",lineHeight:1.8,marginBottom:10}}>{r.body}</div>
                      <button className="btn" style={{fontSize:8,padding:"4px 12px"}} onClick={()=>notify(`${r.action} — ACKNOWLEDGED`,)}>▶ {r.action}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ AWARDS ══ */}
          {tab==="awards" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:4,marginBottom:12}}>◈ AWARD DECORATIONS TO SUBORDINATES</div>
                  {SUBORDINATE_GENERALS.map(sg=>(
                    <div key={sg.id} className="panel-gold" style={{padding:16,marginBottom:8,border:"1px solid #2a2a00"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <div style={{fontSize:11,color:"#c8b870",letterSpacing:2}}>{sg.name}</div>
                          <div style={{fontSize:9,color:"#5a5a3a"}}>{sg.rank} · {sg.unit}</div>
                        </div>
                        <button className="btn btn-gold" style={{fontSize:9}} onClick={()=>setShowAward(sg)}>🏅 SELECT AWARD</button>
                      </div>
                      <div style={{fontSize:8,color:"#4a5a4a",marginBottom:8}}>{sg.distinction}</div>
                      {/* Awarded medals */}
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {((general.awardedTo||{})[sg.id]||sg.medals).map((m,i)=>{
                          const medal=MEDAL_LIST.find(ml=>ml.id===m.toLowerCase());
                          return medal?(<div key={i} title={medal.name} style={{display:"flex",alignItems:"center",gap:3,background:"#0a0a00",border:`1px solid ${medal.color}44`,padding:"2px 6px"}}>
                            <span style={{color:medal.color,fontSize:10}}>{medal.icon}</span>
                            <span style={{fontSize:7,color:medal.color}}>{medal.name.split(" ").slice(-1)[0]}</span>
                          </div>):null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Medal display */}
                <div>
                  <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:4,marginBottom:12}}>◈ MEDAL REFERENCE — {MEDAL_LIST.length} AVAILABLE</div>
                  {MEDAL_LIST.map(m=>(
                    <div key={m.id} style={{background:"#080e08",border:`1px solid ${m.color}33`,padding:"10px 14px",marginBottom:6,display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{fontSize:22,color:m.color,textShadow:`0 0 8px ${m.color}66`,minWidth:30,textAlign:"center"}}>{m.icon}</div>
                      <div>
                        <div style={{fontSize:10,color:m.color}}>{m.name}</div>
                        <div style={{fontSize:8,color:"#3a5a3a"}}>{m.desc}</div>
                      </div>
                      <div style={{marginLeft:"auto",fontSize:9,color:"#2a4a2a"}}>AWARDED: {Object.values(general.awardedTo||{}).flat().filter(x=>x===m.id).length}</div>
                    </div>
                  ))}
                  <div style={{marginTop:14,background:"#080e08",border:"1px solid #2a2a00",padding:14}}>
                    <div style={{fontSize:9,color:"#ffd700",marginBottom:4}}>TOTAL MEDALS AWARDED</div>
                    <div style={{fontSize:32,color:"#ffd700",fontFamily:"Oswald,sans-serif"}}>{general.medalsAwarded||0}</div>
                    <div style={{fontSize:8,color:"#5a5a3a",marginTop:4}}>by General {general.name}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ POLITICS ══ */}
          {tab==="politics" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {/* Presidential relationship */}
                <div>
                  <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:4,marginBottom:12}}>◈ PRESIDENTIAL RELATIONSHIP</div>
                  <div className="panel-gold" style={{padding:20,marginBottom:14,border:"1px solid #2a2a00"}}>
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                      <div style={{width:60,height:60,border:`2px solid ${approvalColor(ap)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,background:"#080800"}}>🏛</div>
                      <div>
                        <div style={{fontSize:11,color:"#c8b870",letterSpacing:2}}>THE PRESIDENT</div>
                        <div style={{fontSize:9,color:"#5a5a3a"}}>Commander-in-Chief</div>
                        <div style={{fontSize:9,color:approvalColor(ap),marginTop:4}}>{approvalLabel(ap)} ({ap}%)</div>
                      </div>
                    </div>
                    {/* Approval bar */}
                    <div style={{marginBottom:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#5a5a3a",marginBottom:4}}>
                        <span>PRESIDENTIAL APPROVAL</span><span style={{color:approvalColor(ap)}}>{ap}%</span>
                      </div>
                      <div style={{height:8,background:"#0a0a00",borderRadius:2}}>
                        <div style={{height:"100%",width:`${ap}%`,background:`linear-gradient(90deg,${approvalColor(ap)}88,${approvalColor(ap)})`,borderRadius:2,transition:"width 0.8s"}}/>
                      </div>
                      {ap<30&&<div style={{fontSize:8,color:"#e84b4b",marginTop:6,animation:"pulse 1.5s infinite"}}>⚠ FIRING RISK — Improve approval immediately</div>}
                      {ap>=80&&<div style={{fontSize:8,color:"#4caf50",marginTop:6}}>★ HIGHLY TRUSTED — POTUS relies on your judgment</div>}
                    </div>
                    {/* Meeting options */}
                    <div style={{fontSize:9,color:"#7a6a3a",letterSpacing:3,marginBottom:10}}>REQUEST OVAL OFFICE MEETING:</div>
                    {[
                      {id:"support",label:"EXPRESS FULL SUPPORT",desc:"Reaffirm your loyalty and commitment",apEffect:"+10"},
                      {id:"advise",label:"OFFER STRATEGIC COUNSEL",desc:"Present your military assessment",apEffect:"+5"},
                      {id:"pushback",label:"PUSH BACK ON A DECISION",desc:"Challenge an order you disagree with",apEffect:"-12"},
                      {id:"resign_threat",label:"THREATEN RESIGNATION",desc:"Use your position as leverage",apEffect:"-25"},
                    ].map(m=>(
                      <div key={m.id} className="choice-card" style={{marginBottom:6,borderColor:"#2a2a00"}} onClick={()=>meetPresident(m.id)}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontSize:10,color:"#c8b870",letterSpacing:1}}>{m.label}</div>
                            <div style={{fontSize:8,color:"#4a4a3a",marginTop:2}}>{m.desc}</div>
                          </div>
                          <div style={{fontSize:9,color:m.apEffect.startsWith("+")?"#4caf50":"#e84b4b",minWidth:30,textAlign:"right"}}>{m.apEffect}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Congressional + Allies */}
                <div>
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ POLITICAL LANDSCAPE</div>
                  <div className="panel" style={{padding:16,marginBottom:14}}>
                    <div style={{fontSize:10,color:"#c8ffc8",marginBottom:12}}>CONGRESSIONAL RELATIONS</div>
                    {[
                      {name:"Senate Armed Services",stance:"SUPPORTIVE",color:"#4caf50",seats:"18/22"},
                      {name:"House Armed Services",stance:"MIXED",color:"#e8b84b",seats:"15/30"},
                      {name:"Intelligence Committee",stance:"SKEPTICAL",color:"#e84b4b",seats:"8/16"},
                    ].map(c=>(
                      <div key={c.name} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #0d1a0d"}}>
                        <div style={{fontSize:9,color:"#7a9a7a"}}>{c.name}</div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <div style={{fontSize:8,color:c.color}}>{c.stance}</div>
                          <div style={{fontSize:8,color:"#3a5a3a"}}>{c.seats}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="panel" style={{padding:16}}>
                    <div style={{fontSize:10,color:"#c8ffc8",marginBottom:12}}>ALLIED COMMANDERS</div>
                    {[
                      {country:"🇬🇧 UK",name:"Gen. Harrington",relation:"CLOSE ALLY"},
                      {country:"🇫🇷 France",name:"Gen. Beaumont",relation:"STRONG"},
                      {country:"🇩🇪 Germany",name:"Gen. Müller",relation:"RELIABLE"},
                      {country:"🇰🇷 South Korea",name:"Gen. Park",relation:"CRITICAL ALLY"},
                      {country:"🇯🇵 Japan",name:"Adm. Yamamoto",relation:"STRONG"},
                    ].map(a=>(
                      <div key={a.country} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0d1a0d"}}>
                        <div style={{fontSize:9,color:"#7a9a7a"}}>{a.country} — {a.name}</div>
                        <div style={{fontSize:8,color:"#4caf50"}}>{a.relation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ COUPS & THREATS ══ */}
          {tab==="coup" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <div style={{fontSize:9,color:"#9b59b6",letterSpacing:4,marginBottom:12}}>◈ COUP SCENARIOS — ACTIVE THREATS</div>
                  {[
                    {title:"DPRK INTERNAL COUP",status:"ONGOING",region:"North Korea",detail:"Rogue elements of the North Korean 4th Corps are maneuvering toward Pyongyang. Kim's inner circle is fragmenting. Window: 48 hours.",options:[{label:"SUPPORT COUP — DESTABILIZE DPRK",effect:{ap:-5,p:+8},emoji:"⚠"},  {label:"SUPPORT KIM — MAINTAIN STABILITY",effect:{ap:+8,p:+5},emoji:"✓"},{label:"DO NOTHING — MONITOR",effect:{ap:0,p:0},emoji:"👁"}]},
                    {title:"VENEZUELA MILITARY REVOLT",status:"DEVELOPING",region:"Venezuela",detail:"Senior Venezuelan Army officers have reached out to CIA requesting US support for a coup against Maduro. DoD and State are divided on response.",options:[{label:"PROVIDE COVERT SUPPORT",effect:{ap:-10,p:+5},emoji:"🤫"},{label:"INFORM STATE — DECLINE COVERTLY",effect:{ap:+5,p:+3},emoji:"📋"},{label:"COORDINATE WITH REGIONAL ALLIES",effect:{ap:+8,p:+8},emoji:"🤝"}]},
                    {title:"DOMESTIC COUP ATTEMPT",status:"CRITICAL",region:"Washington DC",detail:"Three senior generals have approached you about removing the President by force. FBI counterintelligence is watching.",options:[{label:"REPORT TO SecDef IMMEDIATELY",effect:{ap:+25,p:+30},emoji:"🚨"},{label:"LISTEN — DON'T COMMIT",effect:{ap:-10,p:-10},emoji:"⚠"},{label:"JOIN THE CONSPIRACY",effect:{ap:-100,p:-50},emoji:"☠"}]},
                  ].map((coup,i)=>(
                    <div key={i} className="panel" style={{padding:18,marginBottom:12,border:`1px solid ${coup.status==="CRITICAL"?"#e84b4b44":"#2a1a4a44"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{fontSize:11,color:"#c8b8ff",letterSpacing:2}}>{coup.title}</div>
                        <div style={{fontSize:8,color:coup.status==="CRITICAL"?"#e84b4b":"#9b59b6",border:`1px solid ${coup.status==="CRITICAL"?"#e84b4b":"#9b59b6"}`,padding:"2px 8px",letterSpacing:2}}>{coup.status}</div>
                      </div>
                      <div style={{fontSize:9,color:"#3a5a3a",marginBottom:8}}>📍 {coup.region}</div>
                      <div style={{fontSize:10,color:"#5a7a5a",lineHeight:1.8,marginBottom:12}}>{coup.detail}</div>
                      {coup.options.map((o,j)=>(
                        <div key={j} className="choice-card" style={{marginBottom:6,borderColor:"#1a1a2a"}} onClick={()=>{
                          updateGeneral({approval:Math.max(0,Math.min(100,ap+(o.effect.ap||0))),prestige:Math.max(0,Math.min(100,pres+(o.effect.p||0)))});
                          notify(`${coup.title}: ${o.label}`,o.effect.ap>0?"#4caf50":"#e84b4b");
                        }}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{fontSize:9,color:"#9b9bff",letterSpacing:1}}>{o.emoji} {o.label}</div>
                            <div style={{display:"flex",gap:6,fontSize:8}}>
                              <span style={{color:o.effect.ap>0?"#4caf50":"o.effect.ap<0"?"#e84b4b":"#5a5a5a"}}>AP {o.effect.ap>0?"+":""}{o.effect.ap}</span>
                              <span style={{color:o.effect.p>0?"#4caf50":"#e84b4b"}}>PR {o.effect.p>0?"+":""}{o.effect.p}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Threat assessment */}
                <div>
                  <div style={{fontSize:9,color:"#e84b4b",letterSpacing:4,marginBottom:12}}>◈ THREAT ASSESSMENT BOARD</div>
                  <div className="panel" style={{padding:16,marginBottom:14}}>
                    {[
                      {threat:"Nuclear First Use by DPRK",prob:"8%",color:"#e84b4b",trend:"↑"},
                      {threat:"China-Taiwan Kinetic Action",prob:"23%",color:"#e87a4b",trend:"↑"},
                      {threat:"Russian NATO Border Incident",prob:"31%",color:"#e8b84b",trend:"→"},
                      {threat:"Iran Strait of Hormuz Closure",prob:"18%",color:"#e8b84b",trend:"↓"},
                      {threat:"Domestic Extremist Event",prob:"12%",color:"#4b9ae8",trend:"↑"},
                      {threat:"Cyber Attack on Power Grid",prob:"44%",color:"#9b59b6",trend:"↑"},
                    ].map(t=>(
                      <div key={t.threat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #0d1a0d"}}>
                        <div style={{fontSize:10,color:"#7a9a7a"}}>{t.threat}</div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <div style={{fontSize:14,fontFamily:"Oswald,sans-serif",color:t.color}}>{t.prob}</div>
                          <div style={{fontSize:12,color:t.color}}>{t.trend}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="panel" style={{padding:16,border:"1px solid #3a1a1a"}}>
                    <div style={{fontSize:10,color:"#e84b4b",marginBottom:12,letterSpacing:2}}>COMMAND EMERGENCY PROTOCOLS</div>
                    {[
                      {label:"ACTIVATE CONTINUITY OF GOVERNMENT",desc:"Disperse key personnel to hardened sites"},
                      {label:"ELEVATE ALL FORCES TO DEFCON 2",desc:"Alert all commands — armed forces ready"},
                      {label:"REQUEST NSC EMERGENCY SESSION",desc:"Convene cabinet-level crisis meeting"},
                      {label:"AUTHORIZE CYBERCOM OFFENSIVE OPS",desc:"Preemptive cyber strike on hostile networks"},
                    ].map((p,i)=>(
                      <button key={i} className="btn btn-red" style={{display:"block",width:"100%",textAlign:"left",marginBottom:6,padding:"10px 14px",fontSize:9}} onClick={()=>notify(p.label+" — AUTHORIZED","#e84b4b")}>
                        ⚡ {p.label}
                        <div style={{fontSize:7,color:"#5a3a3a",marginTop:2}}>{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ PRESS BRIEFING ══ */}
          {tab==="press" && (
            <div style={{animation:"fadeUp 0.3s"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ PENTAGON PRESS BRIEFING ROOM</div>
                  <div className="panel" style={{padding:20,marginBottom:14}}>
                    <div style={{fontSize:9,color:"#4a6a4a",marginBottom:12}}>Compose your statement. Your words shape public perception and political standing. Media is watching — every word matters.</div>
                    <div style={{fontSize:9,color:"#3a5a3a",marginBottom:8}}>TIP: Words like "peace", "strength", "deterrence" affect approval differently.</div>
                    <textarea
                      value={pressMsg}
                      onChange={e=>setPressMsg(e.target.value)}
                      placeholder="TYPE YOUR STATEMENT TO THE PRESS..."
                      style={{width:"100%",height:120,background:"#050d05",border:"1px solid #2a4a2a",color:"#c8ffc8",fontFamily:"monospace",fontSize:11,padding:12,resize:"none",outline:"none",letterSpacing:1,lineHeight:1.8}}
                    />
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <button className="btn" style={{flex:1}} onClick={handlePressBriefing}>📡 DELIVER STATEMENT</button>
                      <button className="btn" style={{padding:"8px 14px"}} onClick={()=>setPressMsg("")}>CLR</button>
                    </div>
                  </div>
                  {pressResult && (
                    <div className="panel" style={{padding:16,border:"1px solid #2a4a2a",animation:"fadeUp 0.4s"}}>
                      <div style={{fontSize:9,color:"#e8b84b",letterSpacing:3,marginBottom:8}}>MEDIA RESPONSE</div>
                      <div style={{fontSize:11,color:"#8aaa7a",lineHeight:1.8}}>{pressResult}</div>
                    </div>
                  )}
                  {/* Canned statements */}
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:10,marginTop:14}}>QUICK STATEMENTS:</div>
                  {[
                    "The United States Armed Forces remain at the highest state of readiness. Peace through strength is not a slogan — it is our doctrine.",
                    "We will not tolerate any action that threatens the sovereignty of our allies. Our commitment to collective defense is ironclad.",
                    "I want to be clear: the United States will pursue every diplomatic avenue before any kinetic action is considered.",
                    "Our forces have deterrence capabilities that no adversary should test. The consequences would be swift and decisive.",
                  ].map((s,i)=>(
                    <button key={i} className="btn" style={{display:"block",width:"100%",textAlign:"left",marginBottom:6,padding:"10px 14px",fontSize:9,lineHeight:1.6}} onClick={()=>setPressMsg(s)}>
                      {s.slice(0,60)}...
                    </button>
                  ))}
                </div>
                {/* Media landscape */}
                <div>
                  <div style={{fontSize:9,color:"#3a5a3a",letterSpacing:4,marginBottom:12}}>◈ MEDIA LANDSCAPE</div>
                  <div className="panel" style={{padding:16,marginBottom:14}}>
                    <div style={{fontSize:10,color:"#c8ffc8",marginBottom:12}}>NETWORK COVERAGE</div>
                    {[
                      {outlet:"CNN",tone:"CRITICAL",audience:"24M",bias:"Liberal"},
                      {outlet:"Fox News",tone:"SUPPORTIVE",audience:"19M",bias:"Conservative"},
                      {outlet:"BBC",tone:"NEUTRAL",audience:"12M",bias:"International"},
                      {outlet:"NYT",tone:"SKEPTICAL",audience:"8M",bias:"Liberal"},
                      {outlet:"WSJ",tone:"FAVORABLE",audience:"6M",bias:"Business"},
                    ].map(m=>(
                      <div key={m.outlet} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #0d1a0d"}}>
                        <div style={{fontSize:9,color:"#7a9a7a"}}>{m.outlet}</div>
                        <div style={{display:"flex",gap:8,fontSize:8}}>
                          <span style={{color:m.tone==="SUPPORTIVE"||m.tone==="FAVORABLE"?"#4caf50":m.tone==="CRITICAL"||m.tone==="SKEPTICAL"?"#e84b4b":"#e8b84b"}}>{m.tone}</span>
                          <span style={{color:"#3a5a3a"}}>{m.audience}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="panel" style={{padding:16}}>
                    <div style={{fontSize:10,color:"#c8ffc8",marginBottom:12}}>LIVE HEADLINES</div>
                    {NEWS_FEED.slice(0,6).map((n,i)=>(
                      <div key={i} style={{fontSize:9,color:"#5a7a5a",padding:"7px 0",borderBottom:"1px solid #0d1a0d",lineHeight:1.5}}>{n}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STATUS */}
        <div style={{padding:"8px 20px",borderTop:"1px solid #1a2a1a",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap",background:"#020904"}}>
          <div style={{fontSize:8,color:"#2a4a2a",letterSpacing:3}}>USSOCOM · JSOC · STRATCOM · CYBERCOM · SPACECOM</div>
          <div style={{flex:1}}/>
          <div style={{fontSize:8,color:"#3a5a3a",letterSpacing:2}}>PROGRESS SAVED AUTOMATICALLY</div>
          <div style={{fontSize:8,color:"#ffd70066",letterSpacing:2}}>★★★★ GENERAL {general.name.toUpperCase()}</div>
        </div>
      </div>
    </div>
    </>
  );

  function handlePressBriefing(){
    if(!pressMsg.trim()) return;
    const words=pressMsg.toLowerCase();
    let apDelta=0,presDelta=0,res="";
    if(words.includes("peace")||words.includes("diplomacy")){apDelta+=6;res="Major networks lead with your measured tone. Congressional approval up. Allies reassured.";}
    else if(words.includes("strength")||words.includes("deterrence")){apDelta+=4;presDelta+=4;res="Strong, clear message. Fox News runs it as top story. POTUS approves. Allies note the resolve.";}
    else if(words.includes("war")||words.includes("strike")||words.includes("attack")){apDelta-=10;presDelta-=6;res="Markets drop. Allies call the White House. POTUS texts: 'That was not helpful.' -10 approval.";}
    else if(words.includes("allies")||words.includes("coalition")){apDelta+=5;presDelta+=3;res="Multilateral framing wins broad media approval. NATO SecGen issues a supportive statement.";}
    else{apDelta+=1;presDelta+=1;res="Steady, competent briefing. No headlines. Baseline performance.";}
    updateGeneral({approval:Math.max(0,Math.min(100,ap+apDelta)),prestige:Math.max(0,Math.min(100,pres+presDelta))});
    setPressResult(res);
    setPressMsg("");
    notify("Press briefing delivered");
  }
}
