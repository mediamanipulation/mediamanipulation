import { useEffect, useState } from "react";
import FeedbackScene from "../three/FeedbackScene.jsx";
import Marquee from "./Marquee.jsx";
import HeroTerminal from "./HeroTerminal.jsx";

function renderCard(it, extraClass = "", revealProps = {}) {
  // it.href makes the whole card a link, opened in a new tab
  const Tag = it.href ? "a" : "article";
  const linkProps = it.href
    ? { href: it.href, target: "_blank", rel: "noopener" }
    : {};
  // it.video replaces the card's rendered content with a film clip of it —
  // the clip already carries the title/description/tag baked in.
  if (it.video) {
    return (
      <Tag
        className={`card card--video${extraClass}`}
        key={it.t}
        aria-label={it.t}
        {...revealProps}
        {...linkProps}
      >
        <video src={it.video} autoPlay muted loop playsInline preload="auto" />
      </Tag>
    );
  }
  return (
    <Tag className={`card${extraClass}`} key={it.t} {...revealProps} {...linkProps}>
      <div>
        <div className="card-k">{it.k}</div>
        <h3 className="card-t">{it.t}</h3>
        <p className="card-d">{it.d}</p>
      </div>
      {it.tag && <span className="card-tag">{it.tag}</span>}
    </Tag>
  );
}

const HOLD_MS = 5500;

/* One projection at a time, looping: the cards stack on a single "screen"
   and the reel advances on a timer. Hover pauses the projector. Cards keep
   their own CSS transforms (keystone), so no GSAP/.reveal here. */
function ProjectorStage({ section }) {
  const n = section.items.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), HOLD_MS);
    return () => clearInterval(t);
  }, [paused, reduced, n]);

  return (
    <div
      className="projector-stage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="stage-hud" aria-hidden="true">
        <span>
          REEL {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
      </div>
      <div className={`cards cards--${section.variant} stage-stack`}>
        {section.items.map((it, i) =>
          renderCard(it, i === idx ? " is-live" : "")
        )}
      </div>
    </div>
  );
}

/* Maps a config `section` object to markup based on section.type.
 * To add a new section type: add a case here + an entry in site.config.js.
 * Unknown types render null (safe to leave placeholders in config). */
export default function SectionRenderer({ section }) {
  switch (section.type) {
    case "hero":
      return (
        <section className="hero hero--split" id={section.id}>
          {/* shifting ambient lights behind everything */}
          <div className="hero-ambient" aria-hidden="true" />
          {/* broadcast-monitor chrome */}
          <span className="hero-crop tl" aria-hidden="true" />
          <span className="hero-crop tr" aria-hidden="true" />
          <span className="hero-crop bl" aria-hidden="true" />
          <span className="hero-crop br" aria-hidden="true" />
          {section.hud?.sideLabel && (
            <div className="hero-side" aria-hidden="true">{section.hud.sideLabel}</div>
          )}
          <div className="hero-grid wrap">
            <div className="hero-col hero-col--text">
              {section.eyebrow && <div className="eyebrow reveal">{section.eyebrow}</div>}
              <h1 className="display hero-title glitch reveal" data-text={section.title} data-delay="0.1">
                {section.title}
              </h1>
              {section.sub && <p className="hero-sub reveal" data-delay="0.2">{section.sub}</p>}
              <div className="hero-foot reveal" data-delay="0.3">
                {section.cta && (
                  <a className="btn hero-cta" href={section.cta.href}>{section.cta.label} →</a>
                )}
                {section.hud && (
                  <div className="hero-hud" aria-hidden="true">
                    {section.hud.status && <span className="hud-rec">● {section.hud.status}</span>}
                    {section.hud.meta && section.hud.meta.map((m, i) => (
                      <span className="hud-item" key={i}>{m}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* a designed, framed static monitor */}
            <div className="hero-col hero-col--screen reveal" data-delay="0.15">
              <div className="hero-screen">
                <div className="hero-screen-inner">
                  <FeedbackScene />
                  {section.screen?.terminal && (
                    <HeroTerminal terminal={section.screen.terminal} />
                  )}
                  {section.screen?.labels && (
                    <div className="hero-screen-hud" aria-hidden="true">
                      {section.screen.labels.map((l, i) => (
                        <span className={`shud shud--${l.pos}`} key={i}>{l.text}</span>
                      ))}
                    </div>
                  )}
                  <span className="hero-screen-track" aria-hidden="true" />
                  <span className="hero-screen-sweep" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case "about":
      return (
        <section className="section" id={section.id}>
          <div className="wrap about-grid">
            <div className="about-head">
              <div className="eyebrow reveal">{section.eyebrow}</div>
              <h2 className="display section-title reveal" data-delay="0.05">{section.title}</h2>
            </div>
            <div className="about-body">
              {section.lead && (
                <p className="about-lead reveal" data-delay="0.1">{section.lead}</p>
              )}
              {section.body && section.body.map((p, i) => (
                <p className="about-p reveal" key={i} data-delay={String(0.15 + i * 0.05)}>{p}</p>
              ))}
              {section.disciplines && (
                <ul className="about-disc reveal" data-delay="0.3">
                  {section.disciplines.map((d) => <li key={d}>{d}</li>)}
                </ul>
              )}
            </div>
          </div>
        </section>
      );

    case "cards":
      return (
        <section className="section" id={section.id}>
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow reveal">{section.eyebrow}</div>
              <h2 className="display section-title reveal" data-delay="0.05">{section.title}</h2>
            </div>
            {section.items && section.items.length > 0 ? (
              section.variant ? (
                <ProjectorStage section={section} />
              ) : (
                <div className="cards">
                  {section.items.map((it, i) =>
                    renderCard(it, " reveal", { "data-delay": String(i * 0.06) })
                  )}
                </div>
              )
            ) : (
              <p className="cards-empty reveal">{section.empty || "Work landing soon."}</p>
            )}
          </div>
        </section>
      );

    case "steps":
      return (
        <section className="section" id={section.id}>
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow reveal">{section.eyebrow}</div>
              <h2 className="display section-title reveal" data-delay="0.05">{section.title}</h2>
            </div>
            <div className="steps">
              {section.steps.map((s, i) => (
                <div className="step reveal" key={s.n} data-delay={String(i * 0.06)}>
                  <div className="step-n">{s.n}</div>
                  <h3 className="step-t">{s.t}</h3>
                  <p className="step-d">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "marquee":
      return (
        <div id={section.id}><Marquee text={section.text} /></div>
      );

    case "contact":
      return (
        <section className="section" id={section.id}>
          <div className="wrap contact-inner">
            <div className="eyebrow reveal">{section.eyebrow}</div>
            <h2 className="display contact-title reveal" data-delay="0.05">{section.title}</h2>
            {section.sub && <p className="contact-sub reveal" data-delay="0.1">{section.sub}</p>}
            {section.cta && (
              <a className="btn reveal" data-delay="0.15" href={section.cta.href}>{section.cta.label}</a>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}
