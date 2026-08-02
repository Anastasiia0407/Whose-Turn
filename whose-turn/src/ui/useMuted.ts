import { useSyncExternalStore } from 'react'
import { isMuted, onMutedChange, setMuted } from '../audio/player'

/**
 * Read and set the mute preference.
 *
 * The state lives in the audio helper, which is also the only thing that
 * touches localStorage — components never read the key themselves. This is
 * just a subscription so the icon re-renders when the value changes.
 */
export function useMuted(): [boolean, (value: boolean) => void] {
  const muted = useSyncExternalStore(onMutedChange, isMuted, () => false)
  return [muted, setMuted]
}
