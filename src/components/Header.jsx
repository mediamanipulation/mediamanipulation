import config from "../site.config.js";

export default function Header() {
  const { nav, brand } = config;
  return (
    <header className="header">
      <a href="#hero" className="logo">{brand.name}</a>
      <nav>
        {nav.links.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
        {nav.cta && (
          <a className="navcta" href={nav.cta.href}>{nav.cta.label}</a>
        )}
      </nav>
    </header>
  );
}
