import { useState, useEffect, useRef } from "react";

export function Typewriter({ text, speed = 12, onDone }) {
    const [o, setO] = useState(""), i = useRef(0);
    useEffect(() => {
        i.current = 0;
        setO("");
        const v = setInterval(() => {
            if (i.current < text.length) setO(text.slice(0, ++i.current));
            else { clearInterval(v); onDone?.(); }
        }, speed);
        return () => clearInterval(v);
    }, [text, speed, onDone]);

    return (
        <span>
            {o}
            <span style={{ opacity: o.length === text.length ? 0 : 1, animation: "blink 0.8s infinite" }}>█</span>
        </span>
    );
}
