import { useEffect } from "react";
import gsap from "gsap";
import config from "../site.config.js";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Attaches a scroll-triggered reveal to every element matching `.reveal`
   inside the given ref. Timing pulled from config.theme.motion. */
export function useReveal(scopeRef) {
  useEffect(() => {
    if (!config.theme.motion.enabled || prefersReduced) return;
    const scope = scopeRef?.current || document;
    const els = scope.querySelectorAll(".reveal");
    const m = config.theme.motion;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const delay = Number(el.dataset.delay || 0);
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: m.duration, ease: m.ease, delay }
          );
          io.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scopeRef]);
}
