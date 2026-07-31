import { SOUNDS, type SoundName } from './sounds'

/**
 * The single owner of audio playback. Screens call `preload`, `play` and
 * `stop`; nothing else constructs an Audio object.
 *
 * Rules baked in here:
 *  - Only one sound plays at a time. Starting a new one stops the old one.
 *  - A sound never outlives its animation and never cuts off abruptly: if the
 *    clip is shorter than the animation it loops, and either way it fades over
 *    FADE_MS as the animation settles.
 *  - Audio is decorative. Every failure path — 404, decode error, autoplay
 *    rejection — is swallowed so the draw proceeds exactly as it would in
 *    silence.
 *  - prefers-reduced-motion: reduce skips sound entirely, because that path
 *    already skips the animation the sound accompanies.
 */

const VOLUME = 0.5
const FADE_MS = 200
const FADE_STEP_MS = 20

const cache = new Map<SoundName, HTMLAudioElement>()

let current: HTMLAudioElement | null = null
let fadeTimer: ReturnType<typeof setInterval> | null = null
let endTimer: ReturnType<typeof setTimeout> | null = null

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

function clearTimers(): void {
  if (fadeTimer !== null) {
    clearInterval(fadeTimer)
    fadeTimer = null
  }
  if (endTimer !== null) {
    clearTimeout(endTimer)
    endTimer = null
  }
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
    cache.set(name, audio)
    return audio
  } catch (error) {
    swallow(`${name} create`, error)
    return null
  }
}

/**
 * Warm a clip so it is ready the instant a CTA is pressed rather than
 * arriving late over the network. Safe to call repeatedly.
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

/** Stop whatever is playing and reset it, so the next play starts clean. */
export function stop(): void {
  clearTimers()
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

function fadeOutAndStop(audio: HTMLAudioElement): void {
  const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS))
  const delta = audio.volume / steps
  fadeTimer = setInterval(() => {
    const next = audio.volume - delta
    if (next <= 0.01) {
      stop()
      return
    }
    try {
      audio.volume = next
    } catch (error) {
      swallow('fade', error)
      stop()
    }
  }, FADE_STEP_MS)
}

type PlayOptions = {
  /**
   * How long the accompanying animation runs. The clip loops if it is shorter
   * than this, and fades out over the final FADE_MS either way. Omit for a
   * one-shot with no animation to match (the winner sting).
   */
  durationMs?: number
}

/**
 * Play a clip, stopping anything already playing.
 * Returns immediately; playback failures are swallowed.
 */
export function play(name: SoundName, options: PlayOptions = {}): void {
  if (reducedMotion()) return

  stop()

  const audio = element(name)
  if (!audio) return

  const { durationMs } = options

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
      endTimer = setTimeout(() => {
        endTimer = null
        if (current === audio) fadeOutAndStop(audio)
      }, fadeAt)
    }
  } catch (error) {
    swallow(`${name} play`, error)
    current = null
  }
}

/** True when sound is suppressed, so callers can skip preloading too. */
export function soundDisabled(): boolean {
  return reducedMotion()
}
