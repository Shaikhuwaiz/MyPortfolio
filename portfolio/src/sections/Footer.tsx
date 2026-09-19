import { PROFILE } from '../content'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="destination footer-dest" data-dest="footer" aria-labelledby="footer-title">
      <span className="sector-tag reveal">ARRIVED · VOYAGE COMPLETE</span>
      <div className="dest-inner">
        <div className="footer-inner">
          <h2 id="footer-title" className="reveal">
            Journey complete.
          </h2>
          <p className="sub reveal">
            Thanks for travelling. Reach out whenever you need a backend built,
            tuned, or simply reviewed.
          </p>
          <div className="footer-links reveal">
            <a href={PROFILE.github} target="_blank" rel="noreferrer">
              GitHub · {PROFILE.github.replace('https://', '')}
            </a>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </div>
          <div className="footer-meta reveal">
            <p className="signoff">{PROFILE.name.toUpperCase()} — {PROFILE.role.toUpperCase()}</p>
            <p className="copyright">© {year} {PROFILE.name}. Built with TypeScript · React · GSAP · Canvas.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}