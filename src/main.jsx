import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import config from "./site.config.js";
import "./styles/globals.css";

/* Push the config theme into CSS custom properties so CSS and JS share one
   source of truth. Called once at boot; call again if you hot-swap themes. */
export function applyTheme(theme) {
  const r = document.documentElement.style;
  const c = theme.colors;
  r.setProperty("--color-bg", c.bg);
  r.setProperty("--color-bg-alt", c.bgAlt);
  r.setProperty("--color-fg", c.fg);
  r.setProperty("--color-muted", c.muted);
  r.setProperty("--color-accent", c.accent);
  r.setProperty("--color-accent2", c.accent2);
  r.setProperty("--color-accent3", c.accent3);
  r.setProperty("--color-line", c.line);

  r.setProperty("--type-display", theme.type.display);
  r.setProperty("--type-body", theme.type.body);
  r.setProperty("--type-mono", theme.type.mono);
  const s = theme.type.scale;
  r.setProperty("--fs-xs", s.xs);
  r.setProperty("--fs-sm", s.sm);
  r.setProperty("--fs-base", s.base);
  r.setProperty("--fs-lg", s.lg);
  r.setProperty("--fs-xl", s.xl);
  r.setProperty("--fs-hero", s.hero);

  r.setProperty("--radius", theme.radius);
  r.setProperty("--max-width", theme.maxWidth);
}

applyTheme(config.theme);
document.title = config.brand.meta.title;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
