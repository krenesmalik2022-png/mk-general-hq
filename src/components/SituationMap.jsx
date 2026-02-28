import React, { useState } from "react";

export function SituationMap({ zones, deployments, onZoneClick }) {
    const [hovered, setHovered] = useState(null);
    // Convert lat/lon to SVG x/y (rough mercator)
    const toXY = (lat, lon) => ({ x: ((lon + 180) / 360) * 800, y: ((90 - lat) / 180) * 400 });
    return (
        <div style={{ position: "relative", border: "1px solid #2a2a00", background: "#020a02", overflow: "hidden" }}>
            <svg viewBox="0 0 800 400" style={{ width: "100%", display: "block" }}>
                <rect width="800" height="400" fill="#020a02" />
                {/* Grid */}
                {Array.from({ length: 9 }).map((_, i) => <line key={"h" + i} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#0d1a0d" strokeWidth="0.5" />)}
                {Array.from({ length: 17 }).map((_, i) => <line key={"v" + i} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#0d1a0d" strokeWidth="0.5" />)}
                {/* Equator */}
                <line x1="0" y1="200" x2="800" y2="200" stroke="#1a3a1a" strokeWidth="1" strokeDasharray="4,4" />
                {/* Continents - simplified */}
                <path d="M60,80 L200,70 L240,100 L260,160 L220,210 L160,230 L100,210 L70,170 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M140,240 L230,230 L255,280 L245,360 L200,385 L165,370 L145,320 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M350,50 L460,42 L490,75 L470,110 L420,120 L370,100 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M370,125 L460,115 L480,160 L470,260 L435,300 L395,290 L365,255 L355,190 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M460,38 L660,32 L700,70 L680,130 L610,165 L540,160 L480,120 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M450,125 L530,112 L555,155 L525,175 L465,165 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M620,88 L700,80 L720,120 L690,145 L630,135 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
                <path d="M575,270 L670,258 L710,300 L700,340 L655,355 L600,340 Z" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />

                {/* Deployment lines */}
                {deployments.map((dep, i) => {
                    const to = toXY(dep.lat, dep.lon);
                    return <line key={i} x1={400} y1={200} x2={to.x} y2={to.y} stroke={dep.color || "#4caf5044"} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />;
                })}

                {/* Hot zones */}
                {zones.map(z => {
                    const { x, y } = toXY(z.lat, z.lon);
                    const isH = hovered === z.id;
                    return (
                        <g key={z.id} onClick={() => onZoneClick(z)} onMouseEnter={() => setHovered(z.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                            <circle cx={x} cy={y} r="14" fill="none" stroke={z.color} strokeWidth="1" opacity="0.3">
                                <animate attributeName="r" values="10;20;10" dur="2.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={x} cy={y} r={isH ? 9 : 7} fill={z.color + "33"} stroke={z.color} strokeWidth={isH ? 2 : 1} style={{ transition: "all 0.2s" }} />
                            <text x={x} y={y + 4} textAnchor="middle" fontSize="7" fill={z.color} fontFamily="monospace">⚠</text>
                            <text x={x} y={y + 22} textAnchor="middle" fontSize="7.5" fill={isH ? "#c8ffc8" : z.color + "cc"} fontFamily="monospace">{z.name}</text>
                            {isH && (
                                <g>
                                    <rect x={x - 70} y={y + 26} width="140" height="28" fill="#050d05" stroke={z.color} strokeWidth="1" rx="1" />
                                    <text x={x} y={y + 38} textAnchor="middle" fontSize="7" fill="#c8c870" fontFamily="monospace">{z.threat} THREAT</text>
                                    <text x={x} y={y + 50} textAnchor="middle" fontSize="6.5" fill="#7a8a7a" fontFamily="monospace">{z.troops.toLocaleString()} troops</text>
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
