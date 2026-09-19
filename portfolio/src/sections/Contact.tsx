import { useState } from 'react'
import type { FormEvent } from 'react'
import { PROFILE } from '../content'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    const subject = `Portfolio message from ${name.trim() || 'a visitor'}`
    const body = `Name: ${name}\nEmail: ${email}\n\n${message.trim()}`
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section className="destination" data-dest="contact" aria-labelledby="contact-title">
      <span className="sector-tag reveal">04 · CONTACT</span>
      <div className="dest-inner">
        <div className="contact-wrap">
          <h2 id="contact-title" className="section-title reveal">
            Contact <span className="accent">signal</span>
          </h2>
          <form className="form reveal" onSubmit={submit}>
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a transmission…"
                required
              />
            </div>
            <button type="submit" className="btn">
              Transmit
            </button>
          </form>
          <div className="contact-links reveal">
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            <a href={PROFILE.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}