# MEDIA MANIPULATION

Config-driven React + Vite + GSAP + Three.js site. **Everything** is controlled
from one file: `src/site.config.js`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the build
```

## Change anything — `src/site.config.js`

| Want to change...        | Edit in config                          |
|--------------------------|-----------------------------------------|
| Any text / copy          | `brand`, `sections[].*`, `footer`       |
| Colors                   | `theme.colors` (auto-pushed to CSS vars)|
| Fonts / type scale       | `theme.type`                            |
| Nav links + CTA          | `nav`                                   |
| Add/remove/reorder blocks| `sections[]` array                      |
| Hero shader look         | `three.feedback` (all live-tunable)     |
| Motion speed / easing    | `theme.motion`                          |
| 3D quality / off         | `three.quality` = auto/high/low/off     |

### Section types
`hero`, `cards`, `steps`, `marquee`, `contact`. Add a new one by adding a
`case` in `src/components/SectionRenderer.jsx` and an entry in `sections[]`.
Unknown types render nothing, so config placeholders are safe.

## The signature
The hero is a **live video-feedback shader** (ping-pong render targets) doing
chroma-split + scanline decay, mouse-reactive. Tune it entirely from
`three.feedback` — no shader edits needed for normal changes.

## Accessibility / perf
- `prefers-reduced-motion` respected (reveals off, shader throttled).
- Shader pauses when hero is offscreen; DPR clamped by `three.quality`.
- Keyboard focus + semantic sections retained.

## Moving to Claude Code
This is already a standard Vite project — open the folder in Claude Code and go.
The config-first architecture keeps content/style edits out of component logic.
