// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { HouseholdContext, type HouseholdContextValue } from '../state/householdContext'
import { LoginScreen } from '../screens/LoginScreen'
import { OnboardingMembersScreen } from '../screens/OnboardingMembersScreen'
import { OnboardingChoreScreen } from '../screens/OnboardingChoreScreen'
import { NewChoreSheet } from '../features/NewChoreSheet'
import { MembersSheet } from '../features/MembersSheet'
import type { Member } from '../data'

/**
 * Typing must never move focus.
 *
 * This exists because of a bug that a value-only assertion would have passed:
 * the full string arrived every time, the input was never unmounted, and its
 * DOM node never changed — but `BottomSheet`'s focus-trap effect depended on
 * the identity of its `onClose` callback, so every parent re-render tore the
 * trap down and set it up again, and the setup moved focus to the sheet's
 * first focusable. Every keystroke re-rendered the parent, so every keystroke
 * stole focus.
 *
 * So each case asserts BOTH the value and `document.activeElement`.
 */

// jsdom has no ResizeObserver, which useBlockInsets attaches. It never fires
// here — layout is inert in jsdom — so a no-op stub is enough to let the
// framed sheet mount.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub

const noop = () => {}
const asyncNoop = async () => {}

const household: HouseholdContextValue = {
  status: 'ready',
  household: null,
  householdId: 'h1',
  email: 'someone@example.com',
  error: null,
  busy: false,
  draft: { members: [], chores: [] },
  setDraftMembers: noop,
  setDraftChores: noop,
  signIn: asyncNoop,
  completeOnboarding: async () => true,
  signOut: asyncNoop,
  clearError: noop,
}

const members: Member[] = [
  { id: 'm1', household_id: 'h1', name: 'Ana', color: '#d85a38', sort_order: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 'm2', household_id: 'h1', name: 'Maks', color: '#e8a838', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
]

let container: HTMLDivElement | null = null
let root: Root | null = null

function mount(ui: React.ReactNode) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root!.render(
      <MemoryRouter>
        <HouseholdContext.Provider value={household}>{ui}</HouseholdContext.Provider>
      </MemoryRouter>,
    )
  })
  return container
}

afterEach(() => {
  act(() => root?.unmount())
  container?.remove()
  container = null
  root = null
})

/**
 * Type character by character the way a keyboard does — one input event each,
 * each triggering its own render. Typing the whole string in one event would
 * produce exactly one render and hide a per-keystroke bug.
 */
function type(input: HTMLInputElement, text: string) {
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )!.set!
  for (const char of text) {
    act(() => {
      setValue.call(input, input.value + char)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }
}

function typeAndAssertFocus(input: HTMLInputElement, text: string) {
  input.focus()
  expect(document.activeElement).toBe(input)
  type(input, text)
  expect(input.value).toBe(text)
  // The assertion the original bug would have failed.
  expect(document.activeElement).toBe(input)
}

describe('typing never moves focus', () => {
  it('login email field', () => {
    const el = mount(<LoginScreen />)
    typeAndAssertFocus(el.querySelector('input')!, 'someone@example.com')
  })

  it('onboarding member fields', () => {
    const el = mount(<OnboardingMembersScreen />)
    const inputs = el.querySelectorAll('input')
    typeAndAssertFocus(inputs[0] as HTMLInputElement, 'Anastasiia')
    typeAndAssertFocus(inputs[1] as HTMLInputElement, 'Maks')
  })

  it('onboarding chore field', () => {
    const el = mount(<OnboardingChoreScreen />)
    typeAndAssertFocus(el.querySelector('input')!, 'Wash the dishes')
  })

  it('new-chore sheet field', () => {
    const el = mount(
      <NewChoreSheet
        open
        onClose={noop}
        onAdd={async () => true}
        busy={false}
        error={null}
        onClearError={noop}
      />,
    )
    typeAndAssertFocus(el.querySelector('input')!, 'Mop the floor')
  })

  it('members sheet field', () => {
    const el = mount(
      <MembersSheet
        open
        onClose={noop}
        members={members}
        onAdd={async () => true}
        onRemove={async () => true}
        busy={false}
        error={null}
        onClearError={noop}
      />,
    )
    typeAndAssertFocus(el.querySelector('input')!, 'Zoe')
  })
})

describe('sheet focus trap', () => {
  it('moves focus into the sheet exactly once when it opens', () => {
    // The trap SHOULD claim focus on open — that behaviour must survive the
    // fix that stops it re-running. Counting calls distinguishes the two.
    const calls: string[] = []
    const original = window.HTMLElement.prototype.focus
    window.HTMLElement.prototype.focus = function (this: HTMLElement, ...args) {
      calls.push(this.tagName)
      return original.apply(this, args)
    }
    try {
      const el = mount(
        <NewChoreSheet
          open
          onClose={noop}
          onAdd={async () => true}
          busy={false}
          error={null}
          onClearError={noop}
        />,
      )
      expect(calls.length).toBe(1)
      const sheet = el.querySelector('[role="dialog"]')!
      expect(sheet.contains(document.activeElement)).toBe(true)

      // Typing must not add further focus moves.
      const before = calls.length
      const input = el.querySelector('input')!
      input.focus()
      type(input, 'abc')
      expect(calls.length - before).toBe(1) // only our own input.focus()
    } finally {
      window.HTMLElement.prototype.focus = original
    }
  })
})
