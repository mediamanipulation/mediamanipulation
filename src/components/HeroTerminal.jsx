import { useEffect, useState } from "react";

/* Nostromo-style terminal readout. Any config line containing the token
 * "{METER}" becomes a LIVE gauge: its bar + percentage rise and fall over
 * time (random walk). Everything else scrolls as static text. */

const BAR_CELLS = 8;
const TOKEN = "{METER}";

function bar(v) {
  const filled = Math.round((v / 100) * BAR_CELLS);
  return "▓".repeat(filled) + "░".repeat(BAR_CELLS - filled);
}

export default function HeroTerminal({ terminal }) {
  const lines = terminal.lines || [];
  const meterIdx = lines
    .map((l, i) => (typeof l === "string" && l.includes(TOKEN) ? i : -1))
    .filter((i) => i >= 0);

  const [vals, setVals] = useState(() => {
    const o = {};
    meterIdx.forEach((i, k) => (o[i] = 35 + ((k * 23) % 55))); // spread starting values
    return o;
  });

  useEffect(() => {
    if (meterIdx.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setVals((prev) => {
        const next = { ...prev };
        meterIdx.forEach((i) => {
          let v = (prev[i] ?? 50) + (Math.random() - 0.5) * 14; // drift up/down
          if (v < 8) v = 8 + Math.random() * 6;                 // bounce off floor
          if (v > 99) v = 99 - Math.random() * 6;               // and ceiling
          next[i] = v;
        });
        return next;
      });
    }, 320);
    return () => clearInterval(id);
  }, [lines]); // lines is a stable ref from config

  const render = (raw, origIdx) => {
    if (typeof raw !== "string" || !raw.includes(TOKEN)) return raw;
    const v = Math.round(vals[origIdx] ?? 0);
    const pct = String(v).padStart(2, "0") + "%";
    return raw.replace(TOKEN, `${bar(v)} ${pct}`);
  };

  // duplicated for a seamless vertical scroll; both copies share meter values
  const doubled = lines.concat(lines);

  return (
    <div className="hero-screen-terminal" aria-hidden="true">
      <div className="term-head">{terminal.head}</div>
      <div className="term-body">
        <div className="term-scroll">
          {doubled.map((ln, i) => (
            <p key={i}>{render(ln, i % lines.length)}</p>
          ))}
        </div>
      </div>
      <div className="term-foot">
        {terminal.foot}
        <span className="term-cursor">▮</span>
      </div>
    </div>
  );
}
