import { useState } from "react";
import config from "../site.config.js";

export default function Header() {
  const { nav, brand } = config;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={`header${open ? " is-open" : ""}`}>
      <a href="#hero" className="logo" onClick={close}>{brand.name}</a>

      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      <nav className={open ? "is-open" : ""}>
        {nav.links.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
        ))}
        {nav.cta && (
          <a className="navcta" href={nav.cta.href} onClick={close}>{nav.cta.label}</a>
        )}
      </nav>
    </header>
  );
}
