import React, { useState, useEffect } from "react";
import { defconLabel } from "../utils/helpers";

export function NuclearLaunch({ defcon, onClose, onLaunch }) {
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
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
                    <div style={{ fontSize: 11, color: "#e84b4b", letterSpacing: 4 }}>☢ NUCLEAR COMMAND CENTER</div>
                    {countdown === null && <button className="btn btn-red" onClick={onClose} style={{ fontSize: 9 }}>✕ ABORT SEQUENCE</button>}
                </div>
                <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e84b4b,transparent)", marginBottom: 20 }} />
                <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
                    {steps.map((s, i) => <div key={s} style={{ fontSize: 7, padding: "3px 8px", border: `1px solid ${i <= step ? "#e84b4b" : "#2a1a1a"}`, color: i <= step ? "#e84b4b" : "#2a1a1a", background: i === step ? "#1a0000" : "transparent" }}>{s}</div>)}
                </div>
                {step === 0 && (
                    <div style={{ animation: "fadeUp 0.4s" }}>
                        <div style={{ fontSize: 10, color: "#7a4a4a", lineHeight: 2, marginBottom: 20 }}>
                            You are initiating the nuclear launch sequence.<br />
                            This action requires two-man authentication, target selection,<br />
                            and physical key insertion. <span style={{ color: "#e84b4b" }}>There is no undo.</span>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-red" style={{ flex: 1, padding: 12, fontSize: 11 }} onClick={() => setStep(1)}>PROCEED TO AUTHENTICATION</button>
                            <button className="btn" style={{ padding: 12 }} onClick={() => setAborted(true)}>ABORT</button>
                        </div>
                    </div>
                )}
                {step === 1 && (
                    <div style={{ animation: "fadeUp 0.4s" }}>
                        <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 16, letterSpacing: 2 }}>ENTER AUTHENTICATION CODES</div>
                        <div style={{ marginBottom: 12 }}>
                            <input style={{ width: "100%", background: "#0a0000", border: "1px solid #3a1a1a", color: "#e84b4b", fontFamily: "monospace", fontSize: 12, letterSpacing: 4, padding: "8px 12px" }} placeholder="ZULU-7-KILO" value={auth1} onChange={e => setAuth1(e.target.value.toUpperCase())} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <input style={{ width: "100%", background: "#0a0000", border: "1px solid #3a1a1a", color: "#e84b4b", fontFamily: "monospace", fontSize: 12, letterSpacing: 4, padding: "8px 12px" }} placeholder="ECHO-FOXTROT-9" value={auth2} onChange={e => setAuth2(e.target.value.toUpperCase())} />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-red" style={{ flex: 1, padding: 10 }} onClick={() => { if (auth1 === correctAuth1 && auth2 === correctAuth2) setStep(2); else alert("INVALID AUTH CODES"); }}>AUTHENTICATE</button>
                            <button className="btn" onClick={() => setAborted(true)}>ABORT</button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div style={{ animation: "fadeUp 0.4s" }}>
                        <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 16, letterSpacing: 2 }}>SELECT TARGET</div>
                        {validTargets.map(t => (
                            <div key={t} className="choice-card" style={{ marginBottom: 8, borderColor: targetCode === t ? "#e84b4b" : "#2a1a1a", background: targetCode === t ? "#1a0000" : "rgba(8,0,0,0.9)" }} onClick={() => setTargetCode(t)}>
                                <div style={{ fontSize: 11, color: targetCode === t ? "#e84b4b" : "#7a4a4a", letterSpacing: 2 }}>{t}</div>
                            </div>
                        ))}
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button className="btn btn-red" style={{ flex: 1, padding: 10 }} onClick={() => targetCode && setStep(3)}>CONFIRM TARGET</button>
                            <button className="btn" onClick={() => setAborted(true)}>ABORT</button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div style={{ animation: "fadeUp 0.4s" }}>
                        <div style={{ fontSize: 10, color: "#e84b4b", marginBottom: 16, letterSpacing: 2 }}>FINAL CONFIRMATION</div>
                        <div style={{ marginBottom: 16 }}>
                            <div onClick={() => setLaunchKey(k => !k)} style={{ width: 60, height: 30, background: launchKey ? "#3a0000" : "#0a0000", border: `2px solid ${launchKey ? "#e84b4b" : "#3a1a1a"}`, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                                <div style={{ width: 20, height: 20, background: launchKey ? "#e84b4b" : "#2a1a1a", borderRadius: "50%", transition: "all 0.3s" }} />
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
                {step === 4 && (
                    <div style={{ textAlign: "center", animation: "fadeUp 0.4s" }}>
                        <div style={{ fontSize: 80, color: "#e84b4b", textShadow: "0 0 40px #e84b4b", fontFamily: "Oswald,sans-serif", letterSpacing: 8, marginBottom: 16 }}>{countdown}</div>
                        <button className="btn btn-red" style={{ fontSize: 12, padding: "12px 32px" }} onClick={() => { setCountdown(null); setAborted(true); }}>
                            ⚠ EMERGENCY ABORT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
