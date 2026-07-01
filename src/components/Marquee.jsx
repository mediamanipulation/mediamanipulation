import { useEffect, useRef } from "react";
import gsap from "gsap";
import config from "../site.config.js";

export default function Marquee({ text }) {
  const trackRef = useRef(null);
  useEffect(() => {
    if (!config.theme.motion.enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = trackRef.current;
    const tween = gsap.to(el, {
      xPercent: -50,
      repeat: -1,
      duration: 18,
      ease: "none",
    });
    return () => tween.kill();
  }, []);
  const doubled = text.repeat(2);
  return (
    <div className="marquee">
      <div className="marquee-track" ref={trackRef}>{doubled}</div>
    </div>
  );
}
