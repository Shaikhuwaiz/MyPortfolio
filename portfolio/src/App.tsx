import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Galaxy } from './components/Galaxy'
import type { GalaxyHandle } from './components/Galaxy'
import { PillNav } from './components/PillNav'
import { Home } from './sections/Home'
import { About } from './sections/About'
import { Projects } from './sections/Projects'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { SpaceGap } from './sections/SpaceGap'
import type { DestKey } from './content'
import { NAV_DESTS } from './content'

interface Station {
  key: string
  el: HTMLElement
  depth: number
  centerP: number
  isGap: boolean
}

const GALAXY_FOCAL: [number, number] = [0.5, 0.5]
const GALAXY_ROTATION: [number, number] = [1, 0]

const STAGE_DEPTH = 1600
const CAM_FOV = 900
const FADE_NEAR = 0.03
const FADE_FAR = 0.15
const FADE_PASS = 0
const FADE_GONE = 0.05
const MAX_SCALE = 1.5
const GALAXY_FLOW = 0.9
const GAP_MAX_ALPHA = 0.55
const GAP_SCALE_MUL = 0.8
const GAP_WEIGHT = 0.35
const CAM_SPRING_STIFF = 42
const CAM_SPRING_DAMP = 13
const INPUT_EASE_STIFF = 81
const INPUT_EASE_DAMP = 18
const NAV_INPUT_STIFF = 60
const NAV_INPUT_DAMP = 15.5

function App() {
  const galaxyRef = useRef<GalaxyHandle>(null)
  const journeyRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<DestKey>('home')
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const goToRef = useRef<(key: DestKey) => void>(() => {})
  const navigationLockRef = useRef(false)
  const navigationTargetRef = useRef<DestKey | null>(null)
  const navigationLockUntilRef = useRef(0)
  const atJourneyEndRef = useRef(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const journey = journeyRef.current
    const track = trackRef.current
    if (!journey || !track) return

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      respectReducedMotion: true,
      autoRaf: false,
    })
    lenis.on('scroll', ScrollTrigger.update)

    const rafLenis = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(rafLenis)
    gsap.ticker.lagSmoothing(0)

    let stations: Station[] = []
    let dests: Station[] = []
    let journeyWeight = 1
    let contactP = 1
    const recompute = () => {
      const els = Array.from(track.children) as HTMLElement[]
      const count = Math.max(2, els.length)
      const weights: number[] = els.map((el) => (el.dataset.gap !== undefined ? GAP_WEIGHT : 1))
      journeyWeight = weights.slice(0, -1).reduce((a, b) => a + b, 1)
      let acc = 0
      stations = els.map((el, i) => {
        const s: Station = {
          key: el.dataset.dest ?? '',
          el,
          depth: i * STAGE_DEPTH,
          centerP: count > 1 ? acc / journeyWeight : 0,
          isGap: el.dataset.gap !== undefined,
        }
        acc += weights[i]
        return s
      })
      dests = stations.filter((s) => !s.isGap)
      contactP = dests.find((d) => d.key === 'contact')?.centerP ?? 1
      for (const s of stations) {
        s.el.style.opacity = '0'
        s.el.style.visibility = 'hidden'
      }
    }

    const travel = () => Math.max(1, journeyWeight * window.innerHeight)

    recompute()

    const st = ScrollTrigger.create({
      trigger: journey,
      start: 'top top',
      end: () => `+=${travel()}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: recompute,
    })

    let lastKey = ''
    let lastTs = performance.now()
    let smoothP = 0
    let smoothVel = 0
    let previousP = 0
    let smoothInputVel = 0
    let inputVelDeriv = 0

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
    const smooth01 = (a: number, b: number, x: number) => {
      const t = clamp01((x - a) / (b - a))
      return t * t * (3 - 2 * t)
    }
    const stationAlpha = (rel: number, isGap: boolean) => {
      let out: number
      if (rel > FADE_FAR) out = 0
      else if (rel > FADE_NEAR) out = 1 - smooth01(FADE_NEAR, FADE_FAR, rel)
      else if (rel > -FADE_PASS) out = 1
      else if (rel > -FADE_GONE) out = smooth01(-FADE_GONE, -FADE_PASS, rel)
      else out = 0
      if (isGap) out *= GAP_MAX_ALPHA
      return out
    }
    const stationScale = (rel: number, isGap: boolean) => {
      const d = CAM_FOV + Math.abs(rel) * STAGE_DEPTH
      const s = (CAM_FOV / d) * (isGap ? GAP_SCALE_MUL : 1)
      return Math.min(MAX_SCALE, Math.max(0.1, s))
    }

    const tick = () => {
      const now = performance.now()
      const dt = Math.max(0.001, Math.min(0.1, (now - lastTs) / 1000))
      lastTs = now

      const p = st.progress

      const navActive = navigationLockRef.current
      if (navActive) {
        smoothP = p
        smoothVel = 0
      } else {
        const springAccel = (p - smoothP) * CAM_SPRING_STIFF - smoothVel * CAM_SPRING_DAMP
        smoothVel += springAccel * dt
        smoothP = Math.max(0, Math.min(1, smoothP + smoothVel * dt))
      }

      const scrollDelta = p - previousP
      const rawVelocity = navActive
        ? 0
        : Math.max(-1, Math.min(1, (scrollDelta / Math.max(dt, 0.001)) * 0.5))
      previousP = p

      const velStiff = navActive ? NAV_INPUT_STIFF : INPUT_EASE_STIFF
      const velDamp = navActive ? NAV_INPUT_DAMP : INPUT_EASE_DAMP
      const easeInAccel = (rawVelocity - smoothInputVel) * velStiff
      inputVelDeriv += easeInAccel * dt
      inputVelDeriv *= Math.exp(-velDamp * dt)
      smoothInputVel = Math.max(-1, Math.min(1, smoothInputVel + inputVelDeriv * dt))

  const camZ = smoothP * stations.length
  galaxyRef.current?.setScrollDepth(camZ * GALAXY_FLOW)
  galaxyRef.current?.setScrollVelocity(0, smoothInputVel)

      let key = lastKey
      let best = Infinity
      for (const d of dests) {
        const dist = Math.abs(p - d.centerP)
        if (dist < best) {
          best = dist
          key = d.key
        }
      }
      if (key !== lastKey) {
        lastKey = key
        for (const d of dests) {
          d.el.classList.toggle('is-active', d.key === key)
        }
        const navIndex = NAV_DESTS.findIndex((n) => n.key === key)
        if (navIndex >= 0) setActive(key as DestKey)
      }
      if (
        navigationLockRef.current &&
        navigationTargetRef.current === key &&
        now >= navigationLockUntilRef.current &&
        !lenis.isScrolling
      ) {
        navigationLockRef.current = false
        navigationTargetRef.current = null
        galaxyRef.current?.setRepulsionSuppressed(false)
      }

      for (const s of stations) {
        const rel = s.centerP - smoothP
        const alpha = stationAlpha(rel, s.isGap)
        const scale = stationScale(rel, s.isGap)
        s.el.style.opacity = alpha.toFixed(3)
        s.el.style.transform = `translate3d(0, 0, 0) scale(${scale.toFixed(4)})`
        s.el.style.zIndex = String(Math.round(scale * 10000))
        s.el.style.visibility = alpha > 0.02 ? 'visible' : 'hidden'
        s.el.style.pointerEvents = alpha > 0.45 ? 'auto' : 'none'
        s.el.classList.toggle('is-on-screen', alpha > 0.02)
      }

      const contactY = st.start + contactP * (st.end - st.start)
      atJourneyEndRef.current = p >= contactP - 0.005
      if (atJourneyEndRef.current && !navActive && lenis.scroll > contactY + 0.5) {
        lenis.scrollTo(contactY, { immediate: true })
      }
    }
    gsap.ticker.add(tick)

    const DEST_PITCH = 0.25
    let lastTouchY = 0
    let touchStartY = 0
    let lastSnapKey: DestKey = 'home'
    let burstSign = 0
    let snapExtremeDown = -Infinity
    let snapExtremeUp = Infinity
    let snapTimer: number | undefined

    const resetBurst = () => {
      if (snapTimer) window.clearTimeout(snapTimer)
      snapTimer = undefined
      burstSign = 0
      snapExtremeDown = -Infinity
      snapExtremeUp = Infinity
    }

    const nearestIndex = (pP: number) => {
      let best = 0
      let bestDist = Infinity
      dests.forEach((d, i) => {
        const dist = Math.abs(d.centerP - pP)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      return best
    }

    const scheduleCommit = (delay: number) => {
      if (snapTimer) window.clearTimeout(snapTimer)
      snapTimer = window.setTimeout(() => {
        snapTimer = undefined
        if (navigationLockRef.current) {
          scheduleCommit(120)
          return
        }
        const sign = burstSign
        const extreme = sign > 0 ? snapExtremeDown : snapExtremeUp
        resetBurst()
        if (sign === 0) return
        const ai = dests.findIndex((d) => d.key === lastSnapKey)
        if (ai < 0) return
        const anchor = dests[ai].centerP
        const hops = Math.round((extreme - anchor) / DEST_PITCH)
        const contactIdx = dests.findIndex((d) => d.key === 'contact')
        const ti =
          hops !== 0
            ? Math.max(0, Math.min(contactIdx, ai + hops))
            : nearestIndex(anchor + sign * DEST_PITCH * 0.1)
        const target = dests[ti]
        if (target.key !== lastSnapKey) {
          goToRef.current?.(target.key as DestKey)
        }
      }, delay)
    }

    const onWheel = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
      if (atJourneyEndRef.current && dir > 0) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (dir !== 0) {
        const span = Math.max(0.0001, st.end - st.start)
        const pp = (lenis.scroll - st.start) / span
        if (dir > 0) snapExtremeDown = Math.max(snapExtremeDown, pp)
        else snapExtremeUp = Math.min(snapExtremeUp, pp)
        burstSign = dir
        scheduleCommit(550)
      }
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? touchStartY
      lastTouchY = touchStartY
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (
        atJourneyEndRef.current &&
        typeof y === 'number' &&
        lastTouchY > 0 &&
        y < lastTouchY
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (typeof y === 'number' && touchStartY > 0) {
        const dy = y - touchStartY
        const dir = dy < -4 ? 1 : dy > 4 ? -1 : 0
        if (dir !== 0) {
          const span = Math.max(0.0001, st.end - st.start)
          const pp = (lenis.scroll - st.start) / span
          if (dir > 0) snapExtremeDown = Math.max(snapExtremeDown, pp)
          else snapExtremeUp = Math.min(snapExtremeUp, pp)
          burstSign = dir
          scheduleCommit(450)
        }
      }
      lastTouchY = y ?? lastTouchY
    }
    const onTouchEnd = () => {
      touchStartY = 0
    }
    const onKey = (e: KeyboardEvent) => {
      const down = ['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key)
      const up = ['ArrowUp', 'PageUp', 'Home'].includes(e.key)
      if (!down && !up) return
      e.preventDefault()
      e.stopPropagation()
      if (down && atJourneyEndRef.current) return
      const span = Math.max(0.0001, st.end - st.start)
      const pp = (lenis.scroll - st.start) / span
      if (down) snapExtremeDown = Math.max(snapExtremeDown, pp)
      else snapExtremeUp = Math.min(snapExtremeUp, pp)
      burstSign = down ? 1 : -1
      scheduleCommit(120)
    }
    document.addEventListener('wheel', onWheel, { passive: false })
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('keydown', onKey)

    goToRef.current = (key: DestKey) => {
      lastSnapKey = key
      const target = dests.find((d) => d.key === key)
      if (!target) return
      const y = st.start + target.centerP * (st.end - st.start)
      lenis.scrollTo(y, {
        duration: 1.5,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      })
    }

    return () => {
      gsap.ticker.remove(rafLenis)
      gsap.ticker.remove(tick)
      document.removeEventListener('wheel', onWheel)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('keydown', onKey)
      resetBurst()
      st.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
      lenis.destroy()
    }
  }, [])

  const onNavigate = useCallback((key: DestKey) => {
    navigationLockRef.current = true
    navigationTargetRef.current = key
    navigationLockUntilRef.current = performance.now() + 500
    galaxyRef.current?.setRepulsionSuppressed(false)
    goToRef.current(key)
  }, [])

  const onRepulsionSuppressed = useCallback((suppressed: boolean) => {
    if (!suppressed && navigationLockRef.current) return
    galaxyRef.current?.setRepulsionSuppressed(suppressed)
  }, [])

  return (
    <>
      <div className="galaxy-layer" aria-hidden="true">
        <Galaxy
          ref={galaxyRef}
          focal={GALAXY_FOCAL}
          rotation={GALAXY_ROTATION}
          starSpeed={0.8}
          density={1.4}
          hueShift={205}
          speed={0.7}
          mouseInteraction={false}
          glowIntensity={0.7}
          saturation={0.85}
          mouseRepulsion={false}
          repulsionStrength={4}
          twinkleIntensity={0.7}
          rotationSpeed={0.06}
          transparent
          disableAnimation={reducedMotion}
        />
      </div>
      <PillNav
        active={active}
        onNavigate={onNavigate}
        onRepulsionSuppressed={onRepulsionSuppressed}
      />
      <main ref={journeyRef} id="journey" aria-label="Portfolio journey">
        <div ref={trackRef} id="track">
          <Home />
          <SpaceGap />
          <About />
          <SpaceGap />
          <Projects />
          <SpaceGap />
          <Contact />
          <SpaceGap />
          <Footer />
        </div>
      </main>
    </>
  )
}

export default App