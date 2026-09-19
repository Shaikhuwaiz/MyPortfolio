export function Home() {
  return (
    <section className="destination" data-dest="home" aria-labelledby="home-title">
      <span className="sector-tag reveal">STATION</span>
      <div className="dest-inner">
        <div className="hero">
          <h1 id="home-title" className="reveal">
            Building robust backends
            <br />
            with <span className="accent">Python</span> at the core.
          </h1>
          <p className="sub reveal">
            Scalable APIs, clean system architecture, and reliable infrastructure
            designed to stay simple and maintainable.
          </p>
          <div className="chips reveal">
            {['Python', 'Django', 'PostgreSQL', 'REST APIs'].map((c) => (
              <span className="chip" key={c}>
                {c}
              </span>
            ))}
          </div>
          <p className="cue reveal">
            <span className="cuemarker" aria-hidden="true" />
            SCROLL TO BEGIN VOYAGE
          </p>
        </div>
      </div>
    </section>
  )
}