import { useEffect, useRef } from "react";
import * as THREE from "three";
import config from "../site.config.js";

/* Feedback / datamosh hero background.
 * Ping-pongs two render targets: each frame samples the previous frame,
 * warps it (chroma-split + scanline displacement), and fades it — producing
 * a live "video feedback" decay. All numbers come from config.three.feedback.
 * Fully self-cleaning; pauses when offscreen or reduced-motion.
 */
export default function FeedbackScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const cfg = config.three;
    if (!cfg.enabled || cfg.quality === "off") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mount = mountRef.current;
    if (!mount) return;

    const dpr = cfg.quality === "low" ? 1 : Math.min(window.devicePixelRatio, cfg.quality === "high" ? 2 : 1.5);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(dpr);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const c1 = new THREE.Color(cfg.colorTint[0]);
    const c2 = new THREE.Color(cfg.colorTint[1]);
    const f = cfg.feedback;

    const uniforms = {
      uPrev: { value: null },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAmount: { value: f.amount },
      uDisp: { value: f.displacement },
      uRgb: { value: f.rgbSplit },
      uScan: { value: f.scanlineDensity },
      uNoise: { value: f.noise },
      uPulse: { value: f.pulseSpeed },
      uC1: { value: new THREE.Vector3(c1.r, c1.g, c1.b) },
      uC2: { value: new THREE.Vector3(c2.r, c2.g, c2.b) },
      uGhost: { value: null },
      uHasGhost: { value: 0 },
      uGhostPeriod: { value: (cfg.ghost && cfg.ghost.period) || 8 },
      uGhostScale: {
        value: new THREE.Vector2(
          (cfg.ghost && cfg.ghost.scale && cfg.ghost.scale[0]) || 1.4,
          (cfg.ghost && cfg.ghost.scale && cfg.ghost.scale[1]) || 2.2
        ),
      },
      uGhostGain: { value: (cfg.ghost && cfg.ghost.intensity) || 1.0 },
    };

    // optionally load a face image to surface through the static
    if (cfg.ghost && cfg.ghost.image) {
      new THREE.TextureLoader().load(
        cfg.ghost.image,
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          uniforms.uGhost.value = tex;
          uniforms.uHasGhost.value = 1;
        },
        undefined,
        () => {} // missing/failed → keep procedural fallback
      );
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uPrev;
        uniform float uTime, uAmount, uDisp, uRgb, uScan, uNoise, uPulse;
        uniform vec2 uRes, uMouse;
        uniform vec3 uC1, uC2;
        uniform sampler2D uGhost;
        uniform float uHasGhost, uGhostPeriod, uGhostGain;
        uniform vec2 uGhostScale;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

        // soft elliptical blob: ~1 inside, fades to 0 at the edge
        float blob(vec2 p, vec2 c, vec2 r){
          return 1.0 - smoothstep(0.75, 1.0, length((p - c) / r));
        }

        // one layer of a procedural starfield: round, size-varied, twinkling
        // stars, one per cell at a random sub-position (most cells empty).
        float starLayer(vec2 p, float cells, float thresh){
          vec2 g = p * cells;
          vec2 id = floor(g);
          float tb = floor(uTime * 40.0);             // ~40 relocations / second
          float r = hash(id + tb);                    // presence flickers each bucket
          if (r < thresh) return 0.0;
          vec2 off = vec2(hash(id + tb + 3.1), hash(id + tb + 7.7)) - 0.5; // full-cell random pos
          float d = length(fract(g) - 0.5 - off);
          float size = mix(0.10, 0.34, hash(id + tb + 1.3));
          float s = smoothstep(size, 0.0, d);
          return s * mix(0.5, 1.0, hash(id + tb + 9.0));
        }

        void main(){
          vec2 uv = vUv;
          float t = uTime;
          float tf = floor(t * 20.0);                     // flicker seed

          // --- layered starfield (aspect-corrected so stars stay round) ---
          float aspect = uRes.x / max(uRes.y, 1.0);
          vec2 p = vec2(uv.x * aspect, uv.y);
          float sf = starLayer(p, 22.0, 0.55)              // near: bigger
                   + starLayer(p + 5.0, 48.0, 0.60) * 0.8  // mid
                   + starLayer(p + 11.0, 95.0, 0.62) * 0.65 // far
                   + starLayer(p + 19.0, 150.0, 0.52) * 0.6  // deep dust
                   + starLayer(p + 27.0, 240.0, 0.42) * 0.55 // fine snow
                   + starLayer(p + 33.0, 340.0, 0.38) * 0.5; // ultra-fine snow
          // occasional single-frame flare keeps the "static" pulse
          float pop = step(0.9985, hash(floor(uv * uRes.xy / 2.0) + tf));
          sf = max(sf, pop);

          vec3 col = vec3(sf) * vec3(0.92, 0.96, 1.0);     // faint blue-white

          // --- ghost faces surfacing from the snow ---
          float cyc = t / uGhostPeriod;                     // a face every ~period s
          float idx = floor(cyc);
          float ph  = fract(cyc);
          float env = smoothstep(0.0, 0.20, ph) * smoothstep(1.0, 0.5, ph);
          if (env > 0.001) {
            // random placement / scale per apparition
            vec2 fc = vec2(0.28 + 0.44 * hash(vec2(idx, 1.0)),
                           0.30 + 0.44 * hash(vec2(idx, 2.0)));
            // drift across the panel over the course of the apparition...
            vec2 dir = vec2(hash(vec2(idx, 5.0)) - 0.5, hash(vec2(idx, 6.0)) - 0.5);
            fc += dir * ph * 0.7;
            // ...plus a slow floating wobble so it never sits still
            fc += 0.05 * vec2(sin(t * 1.3 + idx), cos(t * 1.1 + idx * 1.7));
            float s = uGhostScale.x + (uGhostScale.y - uGhostScale.x) * hash(vec2(idx, 3.0));
            // ghostly wobble so it never looks rigid
            vec2 wuv = uv + 0.010 * vec2(sin(uv.y * 20.0 + t * 2.0),
                                         cos(uv.x * 18.0 + t * 1.7));

            // IMAGE face (used when a texture was supplied) — mapped into a box
            vec2 hs = vec2(0.17, 0.24) * s;
            vec2 guv = (wuv - fc) / (2.0 * hs) + 0.5;
            float gflip = step(0.5, hash(vec2(idx, 4.0)));    // 50% upright / 50% inverted
            float gy = mix(1.0 - guv.y, guv.y, gflip);
            vec3 gtex = texture2D(uGhost, vec2(guv.x, gy)).rgb;
            float glum = max(max(gtex.r, gtex.g), gtex.b);
            float inBox = step(0.0, guv.x) * step(guv.x, 1.0)
                        * step(0.0, guv.y) * step(guv.y, 1.0);
            float soft = inBox * smoothstep(1.0, 0.55, length((guv - 0.5) * 2.0));
            float iFace = glum * soft * env * uHasGhost;
            vec3 gcol = mix(vec3(glum), mix(uC1, uC2, guv.y), 0.45); // duotone rim
            col = mix(col, gcol, clamp(iFace * uGhostGain, 0.0, 1.0) * 0.95);

            // PROCEDURAL screaming face (fallback when no texture is present)
            float head  = blob(wuv, fc, vec2(0.15, 0.21) * s);
            float eyeL  = blob(wuv, fc + vec2(-0.06, 0.055) * s, vec2(0.030, 0.022) * s);
            float eyeR  = blob(wuv, fc + vec2( 0.06, 0.055) * s, vec2(0.030, 0.022) * s);
            float browL = blob(wuv, fc + vec2(-0.06, 0.105) * s, vec2(0.050, 0.020) * s);
            float browR = blob(wuv, fc + vec2( 0.06, 0.105) * s, vec2(0.050, 0.020) * s);
            float mouth = blob(wuv, fc + vec2(0.0, -0.10) * s, vec2(0.050, 0.060) * s);
            float feat  = max(max(eyeL, eyeR), max(mouth, max(browL, browR) * 0.7));
            float pFace = clamp(head - feat * 1.2, 0.0, 1.0) * env * (1.0 - uHasGhost);
            col = mix(col, col * 0.16, feat * env * 0.9 * (1.0 - uHasGhost)); // hollows
            col += pFace * 0.30;                            // luminous silhouette
            col = mix(col, mix(col, uC2, 0.5), pFace * 0.55);
          }

          // CRT scanline darkening + soft edge falloff
          float scan = 0.88 + 0.12 * sin(uv.y * uScan);
          col *= scan;
          float vig = smoothstep(1.3, 0.4, length(uv - 0.5));

          gl_FragColor = vec4(col * vig, 0.97);
        }
      `,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    function resize() {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * dpr, h * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouse(e) {
      if (!cfg.mouseReactive) return;
      const rect = mount.getBoundingClientRect();
      uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      );
    }
    window.addEventListener("pointermove", onMouse);

    // pause when offscreen
    let visible = true;
    let obs;
    if (cfg.pauseWhenOffscreen && "IntersectionObserver" in window) {
      obs = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.01 });
      obs.observe(mount);
    }

    const clock = new THREE.Clock();
    let raf;
    const frameStep = reduced ? 4 : 1;
    let frame = 0;
    let contextLost = false;

    function loop() {
      raf = requestAnimationFrame(loop);
      frame++;
      if (!visible || contextLost) return;
      if (reduced && frame % frameStep !== 0) return;

      // pure per-frame noise → renders straight to screen (no feedback targets,
      // so it can never decay to black and uses far less GPU/memory)
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }
    loop();

    // recover from WebGL context loss (common on iOS/Safari when the tab is
    // backgrounded, idle, or memory-pressured) instead of staying blank forever
    const canvas = renderer.domElement;
    function onContextLost(e) { e.preventDefault(); contextLost = true; }
    function onContextRestored() { contextLost = false; clock.start(); }
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMouse);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      obs && obs.disconnect();
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="hero-canvas" ref={mountRef} aria-hidden="true" />;
}
