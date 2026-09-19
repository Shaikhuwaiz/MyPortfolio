import { ABOUT_LINES, FOCUS_AREAS } from '../content'

export function About() {
  return (
    <section className="destination" data-dest="about" aria-labelledby="about-title">
      <span className="sector-tag reveal">02 · ABOUT</span>
      <div className="dest-inner">
        <div className="split">
          <h2 id="about-title" className="section-title reveal">
            Developer
            <br />
            background
          </h2>
          <div className="about-copy reveal">
            <p className="lead">{ABOUT_LINES[0]}</p>
            <p>{ABOUT_LINES[1]}</p>
            <div className="focus-row">
              {FOCUS_AREAS.map((f) => (
                <span className="chip" key={f}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}