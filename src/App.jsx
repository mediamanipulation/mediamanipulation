import { useRef } from "react";
import config from "./site.config.js";
import Header from "./components/Header.jsx";
import SectionRenderer from "./components/SectionRenderer.jsx";
import { useReveal } from "./hooks/useReveal.js";

export default function App() {
  const scope = useRef(null);
  useReveal(scope);

  return (
    <div className="scanlines" ref={scope}>
      <Header />
      <main>
        {config.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} />
        ))}
      </main>
      <footer className="footer wrap">
        <span className="footer-note">{config.footer.note}</span>
        <div className="footer-links">
          {config.footer.links.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
