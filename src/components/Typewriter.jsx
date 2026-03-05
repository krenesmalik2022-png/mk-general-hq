import { useState, useEffect, useRef } from "react";

export function Typewriter({ text, speed = 12, onDone }) {
    const [o, setO] = useState(""), i = useRef(0);
    useEffect(() => {
        let isCancelled = false;
        i.current = 0;

        // Reset o asynchronously
        setTimeout(() => {
            if (!isCancelled) setO("");
        }, 0);

        const v = setInterval(() => {
            if (i.current < text.length) {
                if (!isCancelled) setO(text.slice(0, ++i.current));
            } else {
                clearInterval(v);
                if (!isCancelled) onDone?.();
            }
        }, speed);

        return () => {
            isCancelled = true;
            clearInterval(v);
        };
    }, [text, speed, onDone]);

    return (
        <span>
            {o}
            <span style={{ opacity: o.length === text.length ? 0 : 1, animation: "blink 0.8s infinite" }}>█</span>
        </span>
    );
}
