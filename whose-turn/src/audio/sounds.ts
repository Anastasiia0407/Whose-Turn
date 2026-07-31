/**
 * The only place an audio URL appears. Nothing else references one directly.
 *
 * The three draw clips are 1.71s each. That is shorter than the wheel spin,
 * effectively equal to the dice tumble, and either side of the coin flip
 * depending on how many half-flips the parity calls for — so the player
 * decides loop-vs-fade from the animation duration it is handed, rather than
 * per-sound.
 *
 * `applause` (2.25s) is not tied to an animation at all. It starts before the
 * result screen exists and outlives the screen that started it, so it plays on
 * its own channel — see `player.ts`.
 */
export const SOUNDS = {
  wheel:
    'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518750/wheel_hncqqk.mp3',
  dice: 'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518750/dice_khcqkq.mp3',
  coin: 'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518751/coin_gcmu9k.mp3',
  applause:
    'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785519782/Cheerful_crowd_appla__1-1785519761479_grwala.mp3',
} as const

export type SoundName = keyof typeof SOUNDS
