/**
 * The only place an audio URL appears. Nothing else references one directly.
 *
 * All four clips are 1.71s. That is shorter than the wheel spin, effectively
 * equal to the dice tumble, and either side of the coin flip depending on how
 * many half-flips the parity calls for — so the player decides loop-vs-fade
 * from the animation duration it is handed, rather than per-sound.
 */
export const SOUNDS = {
  wheel:
    'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518750/wheel_hncqqk.mp3',
  dice: 'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518750/dice_khcqkq.mp3',
  coin: 'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518751/coin_gcmu9k.mp3',
  winner:
    'https://res.cloudinary.com/dzj6oegmz/video/upload/v1785518751/winner_ayde2x.mp3',
} as const

export type SoundName = keyof typeof SOUNDS
