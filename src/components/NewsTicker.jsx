import React from "react";

export function NewsTicker({ items }) {
    return (
        <div style={{ background: "#0a0a00", borderTop: "1px solid #3a3000", borderBottom: "1px solid #3a3000", padding: "6px 0", overflow: "hidden", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ background: "#e84b4b", color: "#fff", fontSize: 8, letterSpacing: 3, padding: "2px 10px", flexShrink: 0, marginRight: 12, fontFamily: "monospace" }}>LIVE</div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ whiteSpace: "nowrap", animation: "ticker 60s linear infinite", fontSize: 9, color: "#a08000", letterSpacing: 1 }}>
                        {items.join("   ◆   ")}   ◆   {items.join("   ◆   ")}
                    </div>
                </div>
            </div>
        </div>
    );
}
