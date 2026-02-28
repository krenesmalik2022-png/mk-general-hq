import React from "react";

export function Corners({ color = "#ffd700" }) {
    const s = (pos) => {
        const m = {
            tl: { top: 0, left: 0, borderWidth: "2px 0 0 2px" },
            tr: { top: 0, right: 0, borderWidth: "2px 2px 0 0" },
            bl: { bottom: 0, left: 0, borderWidth: "0 0 2px 2px" },
            br: { bottom: 0, right: 0, borderWidth: "0 2px 2px 0" }
        };
        return {
            position: "absolute",
            width: 12,
            height: 12,
            borderStyle: "solid",
            borderColor: color,
            ...m[pos]
        };
    };
    return (
        <>
            {["tl", "tr", "bl", "br"].map(p => <div key={p} style={s(p)} />)}
        </>
    );
}
