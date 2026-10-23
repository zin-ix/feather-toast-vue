// Test helpers — framework-agnostic (Vitest, Jest, anything that catches throws).
// They read the toast store directly, so no ToastContainer or DOM is needed.
import { toValue } from 'vue'
import { useFeatherToast, resetToastState } from './composables/useToast'
import type { Toast, ToastPosition, ToastVariant } from './types/toast'

export interface ToastMatcher {
  /** Exact string, or a RegExp for partial matches */
  title?: string | RegExp
  description?: string | RegExp
  variant?: ToastVariant
  position?: ToastPosition
}

/** Plain view of a toast with refs/getters resolved, safe for toEqual() */
export interface ToastSnapshot {
  id: string
  title?: string
  description?: string
  variant: ToastVariant
  position: ToastPosition
  count: number
  action?: string
  cancel?: string
}

function snapshot(t: Toast): ToastSnapshot {
  return {
    id: t.id,
    title: toValue(t.title),
    description: toValue(t.description),
    variant: t.variant,
    position: t.position,
    count: t.count ?? 1,
    action: t.action?.label,
    cancel: t.cancel?.label,
  }
}

function matchText(actual: string | undefined, expected: string | RegExp | undefined): boolean {
  if (expected === undefined) return true
  if (actual === undefined) return false
  return typeof expected === 'string' ? actual === expected : expected.test(actual)
}

function matches(t: ToastSnapshot, m: ToastMatcher): boolean {
  return (
    matchText(t.title, m.title) &&
    matchText(t.description, m.description) &&
    (m.variant === undefined || t.variant === m.variant) &&
    (m.position === undefined || t.position === m.position)
  )
}

function describe(list: ToastSnapshot[]): string {
  if (!list.length) return '  (no toasts)'
  return list.map((t) => `  - [${t.variant}] ${JSON.stringify(t.title)}${t.description ? ` — ${JSON.stringify(t.description)}` : ''}`).join('\n')
}

function rawToasts(): Toast[] {
  return useFeatherToast().toasts.value
}

/** Every active toast, oldest first. */
export function getToasts(): ToastSnapshot[] {
  return rawToasts().map(snapshot)
}

export function findToast(matcher: ToastMatcher): ToastSnapshot | undefined {
  return getToasts().find((t) => matches(t, matcher))
}

/** Returns the matching toast or throws an error listing what is on screen. */
export function expectToast(matcher: ToastMatcher): ToastSnapshot {
  const found = findToast(matcher)
  if (found) return found
  throw new Error(`Expected a toast matching ${String(JSON.stringify(matcher, (_k, v) => (v instanceof RegExp ? String(v) : v)))}\nActive toasts:\n${describe(getToasts())}`)
}

export function expectNoToasts(): void {
  const list = getToasts()
  if (list.length) throw new Error(`Expected no toasts, found ${list.length}:\n${describe(list)}`)
}

/**
 * Clicks a toast's action (or cancel) button without rendering anything:
 *   await clickToastAction({ title: 'File deleted' })            // "Undo"
 *   await clickToastAction({ title: /Delete/ }, 'cancel')         // confirm → false
 */
export async function clickToastAction(matcher: ToastMatcher, button: 'action' | 'cancel' = 'action'): Promise<void> {
  const { id } = expectToast(matcher)
  const handler = rawToasts().find((t) => t.id === id)?.[button]
  if (!handler) throw new Error(`Toast ${JSON.stringify(id)} has no ${button} button`)
  await handler.onClick()
}

/** Clears toasts, config and pending flashes. Call in beforeEach/afterEach. */
export const resetToasts = resetToastState
