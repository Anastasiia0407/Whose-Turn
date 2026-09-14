import { useMemo } from 'react'
import {
  formatColor,
  rawValue,
  resolveColor,
  resolveLength,
  type TokenName,
} from '../tokens/resolve'
import { useTokenVersion } from '../tokens/useTokenLayer'
import styles from './ResolvedValue.module.css'

type ResolvedValueProps = {
  name: TokenName
}

/**
 * What a token actually resolves to in the running app, printed.
 *
 * Used wherever a documentation table would otherwise quote a value. A quoted
 * value is a copy, and a copy goes stale silently; this goes stale loudly,
 * because a token that is not in the layer says so in the cell where its value
 * should be.
 */
export function ResolvedValue({ name }: ResolvedValueProps) {
  const version = useTokenVersion()

  const reading = useMemo(() => {
    void version
    const declared = rawValue(name)
    if (!declared) return { kind: 'absent' as const }

    const colour = resolveColor(name)
    if (colour) return { kind: 'value' as const, text: formatColor(colour) }

    const px = resolveLength(name)
    if (px !== null) return { kind: 'value' as const, text: `${px}px` }

    return { kind: 'value' as const, text: declared }
  }, [name, version])

  if (reading.kind === 'absent') {
    return <span className={styles.absent}>Not in the token layer</span>
  }

  return <span className={styles.value}>{reading.text}</span>
}
