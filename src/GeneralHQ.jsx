import { useState, useEffect } from "react";
import {
  UNITS, HOT_ZONES, GLOBAL_EVENTS,
  SUBORDINATE_GENERALS, MEDAL_LIST, NEWS_FEED
} from "./data/constants";
import {
  defconLabel, defconColor, approvalLabel,
  approvalColor, prestigeLabel, useTick
} from "./utils/helpers";
import { NewsTicker } from "./components/NewsTicker";
import { SituationMap } from "./components/SituationMap";
import { NuclearLaunch } from "./components/NuclearLaunch";
import { Typewriter as TW } from "./components/Typewriter";
import { Corners } from "./components/Corners";

/* ═══════════════════════════ PERSISTENT STORAGE ═══════════════════════════ */
const SAVE_KEY = "specops-general-v1";

async function loadSave() {
  try {
    if (window.storage && window.storage.get) {
      const r = await window.storage.get(SAVE_KEY);
      return r ? JSON.parse(r.value) : null;
    }
    const local = localStorage.getItem(SAVE_KEY);
    return local ? JSON.parse(local) : null;
  } catch { return null; }
}

async function writeSave(data) {
  try {
    const json = JSON.stringify(data);
    if (window.storage && window.storage.set) {
      await window.storage.set(SAVE_KEY, json);
    } else {
      localStorage.setItem(SAVE_KEY, json);
    }
  } catch { }
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


export default function GeneralHQ() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("situation");
  const [general, setGeneral] = useState({
    name: "GENERAL", unit: "delta", xp: 20000, missions: 12, perfectMissions: 5,
    defcon: 4, approval: 72, prestige: 68, budget: 886, forcesDeployed: 142000,
    alliedNations: 18, activeTheatres: 4, medalsAwarded: 0,
    hotZones: HOT_ZONES, deployments: [], eventLog: [],
    awardedTo: {}, coupStatus: "none", presidentialMeetings: 0,
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [showNuclear, setShowNuclear] = useState(false);
  const [showAward, setShowAward] = useState(null);
  const [showDeploy, setShowDeploy] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [eventResult, setEventResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const [newsTicker, setNewsTicker] = useState(NEWS_FEED);
  const [coupPhase, setCoupPhase] = useState(0);
  const [pressMsg, setPressMsg] = useState("");
  const [pressResult, setPressResult] = useState(null);
  const [presidentialMeet, setPresidentialMeet] = useState(null);
  const tick = useTick(1000);

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

  useEffect(() => {
    if (!loaded || activeEvent) return;
    if (tick % 45 === 0 && tick > 0) {
      const available = GLOBAL_EVENTS.filter(e => !general.eventLog.includes(e.id));
      if (available.length > 0) {
        const evt = available[Math.floor(Math.random() * available.length)];
        setActiveEvent(evt);
      }
    }
  }, [tick, loaded, activeEvent]);

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

  function deployUnit(unit, zone) {
    const newDep = { unitId: unit.id, unitName: unit.name, zoneName: zone.name, lat: zone.lat, lon: zone.lon, color: zone.color, deployed: new Date().toLocaleDateString() };
    updateGeneral({
      deployments: [...(general.deployments || []), newDep],
      forcesDeployed: (general.forcesDeployed || 140000) + unit.strength,
      activeTheatres: Math.min(8, (general.activeTheatres || 4) + 1),
      prestige: Math.min(100, (general.prestige || 60) + 3),
    });
    setShowDeploy(null);
    setSelectedZone(null);
    notify(`${unit.name} deployed to ${zone.name}`, unit.id === "delta" ? "#e8b84b" : "#4caf50");
  }

  function awardMedal(gen2, medal) {
    const key = gen2.id;
    const existing = general.awardedTo || {};
    const genAwards = existing[key] || [];
    if (genAwards.includes(medal.id)) { notify("Already awarded", "#e84b4b"); return; }
    updateGeneral({
      awardedTo: { ...existing, [key]: [...genAwards, medal.id] },
      medalsAwarded: (general.medalsAwarded || 0) + 1,
      approval: Math.min(100, (general.approval || 70) + 2),
      prestige: Math.min(100, (general.prestige || 60) + 2),
    });
    notify(`${medal.name} awarded to ${gen2.name}`, medal.color);
  }

  function changeDefcon(d) {
    updateGeneral({ defcon: Math.max(1, Math.min(5, d)) });
    notify(`DEFCON changed to ${d}`, defconColor(d));
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

  const ap = general.approval || 70;
  const def = general.defcon || 4;
  const pres = general.prestige || 60;

  return (
    <>
      <style>{CSS}</style>
      <div className="root crt-lines">
        <div className="scanline-sweep" />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: `${(i * 7.3) % 100}%`, color: "#ffd70022", fontSize: 10 + i % 8, animation: `starDrop ${5 + i % 6}s linear ${i * 0.7}s infinite` }}>★</div>
          ))}
        </div>

        {notification && (
          <div style={{ position: "fixed", top: 60, right: 16, zIndex: 4000, background: "#050d05", border: `1px solid ${notification.color}`, padding: "10px 18px", fontSize: 10, color: notification.color, letterSpacing: 2, animation: "fadeUp 0.3s", boxShadow: `0 0 12px ${notification.color}44` }}>
            {notification.msg}
          </div>
        )}

        {showNuclear && <NuclearLaunch defcon={def} onClose={() => setShowNuclear(false)} onLaunch={() => { updateGeneral({ defcon: 1, approval: Math.max(0, ap - 60), prestige: Math.min(100, pres + 10) }); }} />}

        {activeEvent && !eventResult && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
            <div className="panel-gold" style={{ maxWidth: 620, width: "95%", padding: 28, border: `2px solid ${activeEvent.type === "NUCLEAR" ? "#e84b4b" : activeEvent.type === "COUP" ? "#9b59b6" : "#3a3000"}`, animation: "fadeUp 0.4s" }}>
              <Corners color={activeEvent.type === "NUCLEAR" ? "#e84b4b" : "#ffd700"} />
              <div className="glow-gold" style={{ fontFamily: "Oswald,sans-serif", fontSize: 16, letterSpacing: 4, marginBottom: 16 }}>{activeEvent.title}</div>
              <div style={{ background: "#050a05", border: "1px solid #1a2a1a", padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#8aaa7a", lineHeight: 2 }}>
                  <TW text={activeEvent.body} speed={14} />
                </div>
              </div>
              {activeEvent.options.map((opt, i) => (
                <div key={i} className="choice-card" style={{ marginBottom: 8, borderColor: "#2a2a00" }} onClick={() => handleEventChoice(activeEvent, opt)}>
                  <div style={{ fontSize: 10, color: "#c8b870", letterSpacing: 2 }}>{opt.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {eventResult && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="panel" style={{ maxWidth: 560, width: "95%", padding: 28, border: "1px solid #2a4a2a" }}>
              <Corners />
              <div style={{ fontSize: 12, color: "#8aaa7a", lineHeight: 2, marginBottom: 20 }}><TW text={eventResult.outcome} speed={16} /></div>
              <button className="btn" onClick={() => setEventResult(null)}>► CONTINUE</button>
            </div>
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="panel-gold" style={{ padding: "0", borderBottom: "1px solid #3a3000", borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 18, letterSpacing: 6 }} className="glow-gold">GEN. {general.name}</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: approvalColor(ap), fontFamily: "Oswald,sans-serif" }}>{ap}%</div>
                  <div style={{ fontSize: 7, color: approvalColor(ap) }}>{approvalLabel(ap)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: defconColor(def), fontFamily: "Oswald,sans-serif" }}>{def}</div>
                  <div style={{ fontSize: 7, color: defconColor(def) }}>{defconLabel(def)}</div>
                </div>
                <button className="btn btn-red" onClick={() => setShowNuclear(true)}>☢ NUCLEAR</button>
              </div>
            </div>
          </div>

          <NewsTicker items={newsTicker} />

          <div style={{ background: "#050a05", borderBottom: "1px solid #1a2a1a", padding: "0 16px", display: "flex", gap: 0, overflowX: "auto" }}>
            {[{ id: "situation", label: "🌍 SITUATION" }, { id: "awards", label: "🏅 AWARDS" }].map(t => (
              <button key={t.id} className={`tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
            {tab === "situation" && (
              <div style={{ animation: "fadeUp 0.3s" }}>
                <SituationMap zones={general.hotZones} deployments={general.deployments} onZoneClick={(z) => setSelectedZone(z)} />
                {selectedZone && (
                  <div className="panel" style={{ marginTop: 16, padding: 16 }}>
                    <div style={{ fontSize: 12, color: "#c8ffc8" }}>{selectedZone.name}</div>
                    <div style={{ fontSize: 10, color: "#e84b4b" }}>{selectedZone.threat} THREAT</div>
                    <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                      <button className="btn" onClick={() => setShowDeploy(true)}>DEPLOY FORCES</button>
                      <button className="btn" onClick={() => setSelectedZone(null)}>CLOSE</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "awards" && (
              <div style={{ animation: "fadeUp 0.3s", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {SUBORDINATE_GENERALS.map(g => (
                  <div key={g.id} className="panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: "#ffd700" }}>{g.name}</div>
                    <div style={{ fontSize: 9, color: "#3a5a3a" }}>{g.unit}</div>
                    <button className="btn btn-gold" style={{ marginTop: 10 }} onClick={() => setShowAward(g)}>AWARD MEDAL</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showAward && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="panel-gold" style={{ maxWidth: 600, width: "95%", padding: 28 }}>
              <Corners />
              <div style={{ fontSize: 12, color: "#ffd700", marginBottom: 20 }}>AWARD MEDAL TO {showAward.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {MEDAL_LIST.map(m => (
                  <div key={m.id} className="choice-card" onClick={() => awardMedal(showAward, m)} style={{ borderColor: m.color }}>
                    <div style={{ fontSize: 10, color: m.color }}>{m.icon} {m.name}</div>
                  </div>
                ))}
              </div>
              <button className="btn" onClick={() => setShowAward(null)}>CLOSE</button>
            </div>
          </div>
        )}

        {showDeploy && selectedZone && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="panel" style={{ maxWidth: 600, width: "95%", padding: 28 }}>
              <Corners />
              <div style={{ fontSize: 12, color: "#c8ffc8", marginBottom: 20 }}>DEPLOY TO {selectedZone.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {UNITS.map(u => (
                  <div key={u.id} className="choice-card" onClick={() => deployUnit(u, selectedZone)}>
                    <div style={{ fontSize: 10, color: "#c8ffc8" }}>{u.icon} {u.name}</div>
                  </div>
                ))}
              </div>
              <button className="btn" onClick={() => setShowDeploy(false)}>CANCEL</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
