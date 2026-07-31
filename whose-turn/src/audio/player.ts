import { SOUNDS, type SoundName } from './sounds'

/**
 * The single owner of audio playback. Screens call `preload`, `play`, `stop`,
 * `startApplause` and `stopApplause`; nothing else constructs an Audio object.
 *
 * There are TWO channels, because the applause has a different lifetime to
 * everything else:
 *
 *  - The DRAW channel (`play` / `stop`) holds one sound at a time, scoped to
 *    the draw screen. Starting a new one stops the old one, and leaving the
 *    screen stops it outright.
 *  - The APPLAUSE channel (`startApplause` / `stopApplause`) starts BEFORE the
 *    result screen exists and must survive the unmount of the draw screen that
 *    started it. React runs the outgoing screen's cleanup before the incoming
 *    screen's effect, so a single-slot player would have the draw screen's
 *    `stop()` kill the applause a frame before the result screen could claim
 *    it. Hence the separate slot: `stop()` never touches applause.
 *
 * The two therefore overlap across the transition, for APPLAUSE_LEAD_IN_MS.
 * That is the one deliberate exception to "only one sound at a time", and the
 * draw sound is faded across exactly that window so they hand over rather than
 * compete.
 *
 * Also baked in here:
 *  - A draw sound never outlives its animation and never cuts off abruptly: if
 *    the clip is shorter than the animation it loops, and either way it fades
 *    as the animation settles.
 *  - Audio is decorative. Every failure path — 404, decode error, autoplay
 *    rejection, applause that has not buffered in time — is swallowed so the
 *    draw proceeds exactly as it would in silence. Nothing here ever delays a
 *    reveal to wait for a sound.
 *  - prefers-reduced-motion: reduce skips sound entirely, because that path
 *    already skips the animation the sound accompanies.
 */

const VOLUME = 0.5
const FADE_MS = 200
const FADE_STEP_MS = 20

/**
 * How long before the result screen appears the applause starts, carrying the
 * user across the cut instead of beginning at it. Tune the feel here — it is
 * the only definition, and it doubles as the window over which the draw sound
 * fades out underneath it.
 */
export const APPLAUSE_LEAD_IN_MS = 800

/** readyState HAVE_CURRENT_DATA — there is decoded audio to start on now. */
const HAVE_CURRENT_DATA = 2

const cache = new Map<SoundName, HTMLAudioElement>()

/** Draw channel. */
let current: HTMLAudioElement | null = null
let drawFade: ReturnType<typeof setInterval> | null = null
let drawEnd: ReturnType<typeof setTimeout> | null = null
let handoffTimer: ReturnType<typeof setTimeout> | null = null

/** Applause channel. */
let applause: HTMLAudioElement | null = null
let applauseFade: ReturnType<typeof setInterval> | null = null

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Never let an audio failure surface to the user. One debug line, no more. */
function swallow(what: string, error: unknown): void {
  console.debug(`[audio] ${what} skipped:`, error)
}

function element(name: SoundName): HTMLAudioElement | null {
  const existing = cache.get(name)
  if (existing) return existing
  try {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = SOUNDS[name]
    audio.volume = VOLUME
    // A failed fetch must not throw later; note it and carry on silently.
    audio.addEventListener('error', () => swallow(`${name} load`, audio.error))
    // Elements are cached and replayed, and a clip that reached its end sits
    // parked at its final position. Rewind on `ended` rather than at the next
    // start, because seeking is ASYNCHRONOUS: a `currentTime = 0` immediately
    // followed by `play()` races the seek, and the clip ends instantly instead
    // of playing. Only the applause can end on its own — the draw sounds are
    // always paused first, and `stopDrawSound` rewinds them there.
    audio.addEventListener('ended', () => {
      try {
        audio.currentTime = 0
      } catch (error) {
        swallow(`${name} rewind`, error)
      }
      if (applause === audio) applause = null
    })
    cache.set(name, audio)
    return audio
  } catch (error) {
    swallow(`${name} create`, error)
    return null
  }
}

/**
 * Ramp a clip down to silence over `ms`, then hand off to `onDone`. Returns
 * the interval so the caller can cancel a fade that is no longer wanted.
 */
function fadeOut(
  audio: HTMLAudioElement,
  ms: number,
  onDone: () => void,
): ReturnType<typeof setInterval> {
  const steps = Math.max(1, Math.round(ms / FADE_STEP_MS))
  const delta = audio.volume / steps
  return setInterval(() => {
    const next = audio.volume - delta
    if (next <= 0.01) {
      onDone()
      return
    }
    try {
      audio.volume = next
    } catch (error) {
      swallow('fade', error)
      onDone()
    }
  }, FADE_STEP_MS)
}

/**
 * Warm a clip so it is ready the instant it is needed rather than arriving
 * late over the network. Safe to call repeatedly.
 */
export function preload(name: SoundName): void {
  if (reducedMotion()) return
  const audio = element(name)
  try {
    audio?.load()
  } catch (error) {
    swallow(`${name} preload`, error)
  }
}

/**
 * Silence the draw channel only. Deliberately does NOT touch the applause —
 * see the channel note above.
 */
function stopDrawSound(): void {
  if (drawFade !== null) {
    clearInterval(drawFade)
    drawFade = null
  }
  if (drawEnd !== null) {
    clearTimeout(drawEnd)
    drawEnd = null
  }
  if (!current) return
  try {
    current.pause()
    current.currentTime = 0
    current.volume = VOLUME
    current.loop = false
  } catch (error) {
    swallow('stop', error)
  }
  current = null
}

/**
 * Stop the draw sound and abandon any applause that has not started yet.
 *
 * Called on draw-screen unmount, which happens both when the reveal arrives
 * and when the user leaves early. In the first case the handoff has already
 * fired and the applause is mid-flight — untouched here, which is exactly what
 * lets it cross the cut. In the second the handoff is still pending and is
 * cancelled, so no applause plays for a draw nobody saw finish.
 */
export function stop(): void {
  if (handoffTimer !== null) {
    clearTimeout(handoffTimer)
    handoffTimer = null
  }
  stopDrawSound()
}

/**
 * Start the applause, or leave it alone if it is already carrying across the
 * transition. The result screen calls this on mount, which is normally a
 * no-op: by then the lead-in has been playing for APPLAUSE_LEAD_IN_MS. It only
 * genuinely starts the sound on the fallback path, where the clip was not
 * buffered in time for the lead-in.
 */
export function startApplause(): void {
  if (reducedMotion()) return

  if (applause && !applause.paused) {
    // Already running. Cancel any fade a teardown may have begun (React
    // StrictMode remounts effects in development) and restore full volume,
    // rather than restarting and re-triggering the opening of the clip.
    if (applauseFade !== null) {
      clearInterval(applauseFade)
      applauseFade = null
      try {
        applause.volume = VOLUME
      } catch (error) {
        swallow('applause resume', error)
      }
    }
    return
  }

  const audio = element('applause')
  if (!audio) return

  try {
    // Normally already at zero (rewound on `ended`, or on `stopApplause`), so
    // this is a no-op. Guarded anyway: seeking here is a last resort, since
    // the seek would not have settled by the time `play()` runs.
    if (audio.currentTime !== 0) audio.currentTime = 0
    audio.volume = VOLUME
    // One continuous sound of its natural length — never looped.
    audio.loop = false
    applause = audio
    const started = audio.play()
    if (started && typeof started.catch === 'function') {
      started.catch((error) => swallow('applause play', error))
    }
  } catch (error) {
    swallow('applause play', error)
    applause = null
  }
}

/**
 * Fade the applause out and stop it, whether or not it had finished. Called
 * when the user leaves the result screen.
 */
export function stopApplause(fadeMs: number = FADE_MS): void {
  if (applauseFade !== null) {
    clearInterval(applauseFade)
    applauseFade = null
  }

  const audio = applause
  if (!audio) return

  if (audio.paused) {
    applause = null
    return
  }

  applauseFade = fadeOut(audio, fadeMs, () => {
    if (applauseFade !== null) {
      clearInterval(applauseFade)
      applauseFade = null
    }
    try {
      audio.pause()
      audio.currentTime = 0
      audio.volume = VOLUME
    } catch (error) {
      swallow('applause stop', error)
    }
    if (applause === audio) applause = null
  })
}

/**
 * The reveal is APPLAUSE_LEAD_IN_MS away: bring the applause up and take the
 * draw sound down underneath it.
 */
function handOffToApplause(): void {
  handoffTimer = null

  const clip = element('applause')
  // Not buffered yet. Starting now would stutter or land late, so skip the
  // lead-in entirely — the result screen's own `startApplause` will fire it at
  // the reveal. One debug line, and the reveal is not delayed either way.
  if (!clip || clip.readyState < HAVE_CURRENT_DATA) {
    swallow(
      'applause lead-in',
      'clip not buffered in time; starting at the reveal with no lead-in',
    )
    return
  }

  startApplause()

  // Take ownership of the draw sound's ending: replace whatever fade it had
  // scheduled with one spanning exactly the overlap, so it is gone by the cut.
  const outgoing = current
  if (!outgoing) return
  if (drawEnd !== null) {
    clearTimeout(drawEnd)
    drawEnd = null
  }
  if (drawFade !== null) {
    clearInterval(drawFade)
    drawFade = null
  }
  drawFade = fadeOut(outgoing, APPLAUSE_LEAD_IN_MS, stopDrawSound)
}

type PlayOptions = {
  /**
   * How long the accompanying animation runs. The clip loops if it is shorter
   * than this, and fades out over the final FADE_MS either way.
   */
  durationMs?: number
  /**
   * How long from now until the result screen appears. Schedules the applause
   * to start APPLAUSE_LEAD_IN_MS before that moment. Omit for a draw that does
   * not lead to a reveal.
   */
  revealInMs?: number
}

/**
 * Play a draw clip, stopping anything already on the draw channel.
 * Returns immediately; playback failures are swallowed.
 */
export function play(name: SoundName, options: PlayOptions = {}): void {
  if (reducedMotion()) return

  stop()

  const audio = element(name)
  if (!audio) return

  const { durationMs, revealInMs } = options

  try {
    audio.currentTime = 0
    audio.volume = VOLUME
    // readyState 0 means metadata has not arrived; duration is NaN, so treat
    // the clip as short and let it loop rather than risk silence mid-animation.
    const clipMs = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0
    audio.loop = durationMs !== undefined && clipMs > 0 && clipMs < durationMs

    current = audio

    // play() rejects when the browser blocks autoplay. Every call here is
    // behind a button press, but the guard stays regardless.
    const started = audio.play()
    if (started && typeof started.catch === 'function') {
      started.catch((error) => swallow(`${name} play`, error))
    }

    if (durationMs !== undefined) {
      const fadeAt = Math.max(0, durationMs - FADE_MS)
      drawEnd = setTimeout(() => {
        drawEnd = null
        if (current === audio) drawFade = fadeOut(audio, FADE_MS, stopDrawSound)
      }, fadeAt)
    }
  } catch (error) {
    swallow(`${name} play`, error)
    current = null
  }

  // Scheduled after the draw sound is going, and independent of it: the
  // handoff must still happen even when the draw clip has already finished by
  // then (the dice tumble ends well before its reveal).
  if (revealInMs !== undefined) {
    handoffTimer = setTimeout(
      handOffToApplause,
      Math.max(0, revealInMs - APPLAUSE_LEAD_IN_MS),
    )
  }
}

/** True when sound is suppressed, so callers can skip preloading too. */
export function soundDisabled(): boolean {
  return reducedMotion()
}
