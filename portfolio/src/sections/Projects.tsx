import { FEATURED_PROJECT, OTHER_PROJECTS } from '../content'

export function Projects() {
  return (
    <section className="destination" data-dest="projects" aria-labelledby="projects-title">
      <span className="sector-tag reveal">03 · PROJECTS</span>
      <div className="dest-inner">
        <h2 id="projects-title" className="section-title reveal">
          Systems built
        </h2>

        <div className="featured reveal">
          <div className="featured-text">
            <p className="featured-eyebrow">FEATURED SYSTEM</p>
            <h3 className="featured-name">{FEATURED_PROJECT.name}</h3>
            <p className="featured-tag">{FEATURED_PROJECT.tag}</p>
            <div className="focus-row">
              {FEATURED_PROJECT.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="featured-visual" aria-hidden="true">
            <RouteMap />
          </div>
        </div>

        <div className="other-grid">
          {OTHER_PROJECTS.map((p) => (
            <div className="project-item" key={p.title}>
              <p className="project-id">SYS</p>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RouteMap() {
  return (
    <svg
      className="routemap"
      viewBox="0 0 460 240"
      fill="none"
      role="presentation"
    >
      <g stroke="rgba(148,178,235,0.12)" strokeWidth="1">
        <line x1="0" y1="46" x2="460" y2="46" />
        <line x1="0" y1="120" x2="460" y2="120" />
        <line x1="0" y1="194" x2="460" y2="194" />
        <line x1="92" y1="0" x2="92" y2="240" />
        <line x1="230" y1="0" x2="230" y2="240" />
        <line x1="368" y1="0" x2="368" y2="240" />
      </g>
      <path
        d="M40 172 C 120 172, 150 84, 236 96 S 360 150, 424 62"
        stroke="url(#routeGrad)"
        strokeWidth="1.6"
        strokeDasharray="7 5"
        vectorEffect="non-scaling-stroke"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="12"
          to="0"
          dur="1.1s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M40 172 C 120 172, 150 84, 236 96 S 360 150, 424 62"
        stroke="rgba(183,137,255,0.35)"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <g className="routegrid-node">
        <circle cx="40" cy="172" r="5" fill="#8fd4ff" />
        <circle cx="236" cy="96" r="5" fill="#8fd4ff" />
        <circle cx="424" cy="62" r="5" fill="#b789ff" />
      </g>
      <defs>
        <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5aa8ff" />
          <stop offset="1" stopColor="#b789ff" />
        </linearGradient>
      </defs>
    </svg>
  )
}