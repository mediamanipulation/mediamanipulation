/* ============================================================================
 * site.config.js  —  THE SINGLE SOURCE OF TRUTH
 * ----------------------------------------------------------------------------
 * Change anything here and the whole site reacts. No component hard-codes copy,
 * color, or timing. If you find yourself editing a component to change content
 * or style, that's a bug — lift it into this file instead.
 *
 * Structure:
 *   brand      — name, tagline, meta
 *   theme      — colors, type, radii, motion globals (also pushed to CSS vars)
 *   three      — 3D / shader scene parameters
 *   nav        — header links
 *   sections   — ORDERED array; each entry renders a section by `type`
 *   footer     — footer copy + links
 * ========================================================================== */

export const config = {
  brand: {
    name: "MEDIAMANIPULATION",
    // shown in hero, corrupted by the shader:
    heroTitle: "MEDIAMANIPULATION",
    tagline: "One maker. Art, code, and design — bent on purpose.",
    domain: "mediamanipulation.com",
    meta: {
      title: "MEDIAMANIPULATION — art, code & design",
      description: "A multidisciplinary maker working across generative art, creative code, and design. Signal, distorted on purpose.",
    },
  },

  /* ---- THEME -------------------------------------------------------------
   * Every value below is also injected as a CSS custom property at runtime
   * (see applyTheme in main.jsx), so you can reference them in CSS as
   * var(--color-bg), var(--color-accent), etc.
   */
  theme: {
    colors: {
      bg: "#05060a",          // scanline black
      bgAlt: "#0b0e18",       // panel
      fg: "#e8ecf4",          // phosphor white
      muted: "#7d8598",
      accent: "#ff2d6b",      // chroma red-magenta
      accent2: "#12f7d6",     // phosphor cyan
      accent3: "#f5d90a",     // broadcast yellow
      line: "#1c2233",
    },
    type: {
      display: `"Space Grotesk", "Arial Narrow", sans-serif`,
      body: `"Inter", system-ui, sans-serif`,
      mono: `"JetBrains Mono", "Courier New", monospace`,
      // fluid scale (clamp) — [min rem, preferred vw, max rem]
      scale: {
        xs: "clamp(0.72rem, 0.68rem + 0.2vw, 0.8rem)",
        sm: "clamp(0.85rem, 0.8rem + 0.25vw, 0.95rem)",
        base: "clamp(1rem, 0.95rem + 0.3vw, 1.1rem)",
        lg: "clamp(1.3rem, 1.1rem + 1vw, 1.9rem)",
        xl: "clamp(2rem, 1.4rem + 3vw, 3.6rem)",
        hero: "clamp(3rem, 1rem + 12vw, 11rem)",
      },
    },
    radius: "2px",
    maxWidth: "1240px",
    // global motion knobs — respected everywhere, and by prefers-reduced-motion
    motion: {
      enabled: true,
      ease: "power3.out",
      duration: 0.9,
      stagger: 0.08,
      scrollSmoothing: false, // set true if you add Lenis/ScrollSmoother later
    },
  },

  /* ---- 3D SCENE ----------------------------------------------------------
   * Feedback-shader hero. All tunable without touching the shader code.
   */
  three: {
    enabled: true,
    quality: "auto",          // "auto" | "high" | "low" | "off"
    feedback: {
      amount: 0.94,           // how much of last frame persists (0–1)
      displacement: 0.018,    // chroma/scanline warp strength
      rgbSplit: 0.006,        // RGB channel separation
      scanlineDensity: 780,
      noise: 0.12,
      pulseSpeed: 0.6,
    },
    colorTint: ["#ff2d6b", "#12f7d6"], // shader duotone
    mouseReactive: true,
    pauseWhenOffscreen: true,
    // Ghost faces surfacing from the static. Drop a face image in /public and
    // point `image` at it (e.g. "/ghost.png") for a realistic reveal. If the
    // file is missing, a procedural screaming face is used as a fallback.
    ghost: {
      image: "/ghost.jpg",
      period: 5,          // seconds between apparitions (lower = more often)
      scale: [0.8, 2.6],  // [min, max] size — small distant faces ↔ huge close ones
      intensity: 1.35,    // how strongly the face reads through the static
    },
  },

  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "Work", href: "#work" },
      { label: "Process", href: "#method" },
      { label: "Contact", href: "#contact" },
    ],
    cta: { label: "Start a transmission", href: "#contact" },
  },

  /* ---- SECTIONS ----------------------------------------------------------
   * Reorder / add / remove freely. `type` maps to a renderer in
   * components/SectionRenderer.jsx. Unknown types render nothing (safe).
   */
  sections: [
    {
      id: "hero",
      type: "hero",
      eyebrow: "MEDIAMANIPULATION",
      title: "MEDIAMANIPULATION",
      sub: "Multidisciplinary maker — a hive of one — transmitting across generative art, creative code, and design. We take clean signal, run it through the machine, and let it decay into something that reads on purpose.",
      cta: { label: "See the work", href: "#work" },
      // broadcast-monitor HUD chrome — all optional, all editable here:
      hud: {
        sideLabel: "CH.04 // SIGNAL LOCKED",           // rotated label up the left edge
        status: "REC",                                  // blinking ● status
        meta: ["FMT / RGB-SPLIT", "SIG ▓▓▓▓░", "TC 00:04:12:07"], // mono readouts
      },
      // on-screen VHS / broadcast overlays inside the monitor panel.
      // pos: tl | tr | bl | br (corner anchors); text is free-form.
      screen: {
        labels: [
          { pos: "tl", text: "MU-TH-UR 6000" },
          { pos: "tr", text: "CH.04  SPgoqwe78087" },
          { pos: "bl", text: "TRK ▐▐▐▐▐▐" },
          { pos: "br", text: "REC ● 00:04:12:07" },
        ],
        // Alien / Nostromo-style green terminal readout (scrolls)
        terminal: {
          head: "MEDIAMANIPULATION OS · INTERFACE 2037",
          // Any line with the token {METER} becomes a LIVE gauge whose bar +
          // percent rise and fall over time. Everything else is static text.
          lines: [
            "> SYS.CHECK ............ OK",
            "> SIGNAL LOCK .......... CH.04",
            "> DECODE MATRIX {METER}",
            "> ANALYZE FEED ......... RUN",
            "> WARNING: ANOMALY DETECTED",
            "> TRACE: UNKNOWN FACE ... ???",
            "> SIGNAL GAIN {METER}",
            "> ... REACQUIRING SIGNAL ...",
            "> BUFFER LOAD {METER}",
            "> STAND BY",
          ],
          foot: "PRIORITY ONE — DO NOT OVERRIDE",
        },
      },
    },
    {
      id: "about",
      type: "about",
      eyebrow: "00 / ABOUT",
      title: "The person behind the noise",
      lead: "I'm an artist who codes — and a coder who designs. MEDIAMANIPULATION is where those overlap: real-time visuals, interactive builds, and identity work that all share the same DNA of controlled distortion.",
      body: [
        "M-shaped by trade — deep in a few disciplines instead of spread thin across many. Art gives the work its feel, code makes it move, and design keeps it legible. Most projects live in the seams between all three.",
        "Whether it's a gallery installation, a reactive web experience, or a brand system that never sits still, the goal is the same: make the medium itself part of the message.",
      ],
      disciplines: [
        "Art Analog : Digital",
        "Creative coding · Multi-Agenetic Systems  · System optimization",
        "Sass experiences",
        "Simulational identity adaptation",
        "Video / motion / datamosh",
      ],
    },
    {
      id: "work",
      type: "cards",
      eyebrow: "01 / WORK",
      title: "Selected transmissions",
      // Add projects here and the grid fills automatically. Shape of each item:
      //   { k: "ART|CODE|DEV|DESIGN|MOTION", t: "Title", d: "One line.", tag: "Label" }
      // Empty array → the `empty` message below renders instead of a broken grid.
      empty: "New transmissions incoming — work landing here soon.",
      items: [],
    },
    {
      id: "method",
      type: "steps",
      eyebrow: "02 / PROCESS",
      title: "How the work gets made",
      steps: [
        { n: "01", t: "Capture", d: "Start from a clean source — footage, type, a live feed, a data stream." },
        { n: "02", t: "Corrupt", d: "Introduce controlled failure: feedback, displacement, decay, code that misbehaves on purpose." },
        { n: "03", t: "Compose", d: "Sculpt the noise into something that reads as intentional and designed." },
        { n: "04", t: "Ship", d: "Deliver it — installation, film, brand system, or a reactive web build." },
      ],
    },
    {
      id: "signal",
      type: "marquee",
      text: "ART · CODE · DESIGN · MULTI AGENTIC SYSTEMS · MOTION · IDENTITY · FEEDBACK · ",
    },
    {
      id: "contact",
      type: "contact",
      eyebrow: "03 / CONTACT",
      title: "Start a transmission",
      sub: "Commission, collaboration, or just a good idea to break — let's talk.",
      email: "manipulation2000@hotmail.com",
      cta: { label: "manipulation2000@hotmail.com", href: "mailto:manipulation2000@hotmail.com" },
    },
  ],

  footer: {
    note: "© " + new Date().getFullYear() + " MEDIAMANIPULATION. All signal reserved.",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Email", href: "mailto:manipulation2000@hotmail.com" },
    ],
  },
};

export default config;
