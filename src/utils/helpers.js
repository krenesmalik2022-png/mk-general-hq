export const defconLabel = d => ["", "DEFCON 1 — WAR", "DEFCON 2 — ARMED FORCES READY", "DEFCON 3 — ELEVATED READINESS", "DEFCON 4 — ABOVE NORMAL", "DEFCON 5 — NORMAL PEACETIME"][d];
export const defconColor = d => ["", "#ff0000", "#ff6600", "#e8b84b", "#4b9ae8", "#4caf50"][d];
export const approvalLabel = a => a >= 80 ? "HIGHLY TRUSTED" : a >= 60 ? "RESPECTED" : a >= 40 ? "TOLERATED" : a >= 20 ? "ON THIN ICE" : "FIRING IMMINENT";
export const approvalColor = a => a >= 80 ? "#4caf50" : a >= 60 ? "#4be870" : a >= 40 ? "#e8b84b" : a >= 20 ? "#e87a4b" : "#e84b4b";
export const prestigeLabel = p => p >= 90 ? "LEGENDARY" : p >= 70 ? "FEARED" : p >= 50 ? "RESPECTED" : p >= 30 ? "KNOWN" : "UNKNOWN";

import { useState, useEffect } from "react";

export function useTick(interval = 1000) {
    const [t, setT] = useState(0);
    useEffect(() => { const iv = setInterval(() => setT(x => x + 1), interval); return () => clearInterval(iv); }, [interval]);
    return t;
}
