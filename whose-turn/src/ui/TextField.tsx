import { useId, type InputHTMLAttributes } from 'react'
import { SectionLabel } from './SectionLabel'
import styles from './TextField.module.css'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  /** Visible label. The auth screen renders "EMAIL" above the input (181:198). */
  label: string
  /** Hide the label visually but keep it for assistive tech. */
  hideLabel?: boolean
  /** Helper or error copy rendered under the field. */
  message?: string
  invalid?: boolean
}

export function TextField({
  label,
  hideLabel = false,
  message,
  invalid = false,
  className,
  ...rest
}: TextFieldProps) {
  const id = useId()
  const messageId = message ? `${id}-message` : undefined

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <SectionLabel as="label" htmlFor={id} visuallyHidden={hideLabel}>
        {label}
      </SectionLabel>
      <input
        id={id}
        className={[styles.input, invalid ? styles.error : null]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={invalid || undefined}
        aria-describedby={messageId}
        {...rest}
      />
      {message ? (
        <p
          id={messageId}
          className={[styles.message, invalid ? styles.messageError : null]
            .filter(Boolean)
            .join(' ')}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
