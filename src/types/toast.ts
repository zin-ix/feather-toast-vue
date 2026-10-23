import type { Component, MaybeRefOrGetter, VNode } from 'vue'

export type ToastComponent = Component | VNode | (() => VNode | string)

export type ToastVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'offline'
  | 'update'

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface ToastAction {
  label: string
  onClick: () => void
}

export type ToastTheme = 'light' | 'dark' | 'system'

export interface ToastConfig {
  max?: number
  duration?: number
  position?: ToastPosition
  /** Toasts visible in the collapsed stack (default 3). */
  visibleToasts?: number
  /** Always show the stack expanded instead of collapsed (default false). */
  expand?: boolean
  /** Tinted backgrounds for status variants (default false). */
  richColors?: boolean
  theme?: ToastTheme
  /** Merge identical toasts into one with a ×N badge (default true). */
  group?: boolean
}

export interface Toast {
  id: string
  cancel?: ToastAction
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  variant: ToastVariant
  position: ToastPosition
  duration: number
  dismissible: boolean
  action?: ToastAction
  progress?: MaybeRefOrGetter<number | undefined>
  showProgress?: boolean
  component?: ToastComponent
  onDismiss?: () => void
  /** Times an identical toast was fired while this one was visible */
  count?: number
}

export interface ToastOptions {
  /** Reusing an existing id updates that toast instead of stacking a duplicate. */
  id?: string
  title?: MaybeRefOrGetter<string | undefined>
  cancel?: ToastAction
  description?: MaybeRefOrGetter<string | undefined>
  variant?: ToastVariant
  position?: ToastPosition
  duration?: number
  dismissible?: boolean
  action?: ToastAction
  progress?: MaybeRefOrGetter<number | undefined>
  showProgress?: boolean
  component?: ToastComponent
  onDismiss?: () => void
}

export interface ConfirmToastOptions {
  title?: string
  description?: string
  position?: ToastPosition
  variant?: ToastVariant
  confirmLabel?: string
  cancelLabel?: string
  /** Resolves to false after this many ms (default: waits forever). */
  duration?: number
}

type ToastInput<A> = ToastOptions | string | ((arg: A) => ToastOptions | string)

export interface RetryToastOptions<T> {
  loading: ToastOptions | string
  success: ToastInput<T>
  /** Defaults to the thrown error's message */
  error?: ToastInput<unknown>
  retryLabel?: string
  /** Retries offered before giving up (default: unlimited) */
  maxRetries?: number
  position?: ToastPosition
}

export interface ToastPromiseOptions<T> {
  loading: ToastOptions
  success: ToastOptions | ((data: T) => ToastOptions)
  error: ToastOptions | ((err: unknown) => ToastOptions)
}

export interface UndoToastOptions {
  title?: string
  description?: string
  duration?: number
  position?: ToastPosition
  undoLabel?: string
  onUndo: () => void | Promise<void>
  onDismiss?: () => void
}

export interface StepToastController {
  id: string
  next: (options: Partial<ToastOptions>) => void
  done: (options?: Partial<ToastOptions>) => void
  fail: (options?: Partial<ToastOptions>) => void
}

export interface ProgressToastController {
  id: string
  setProgress: (percentage: number, options?: Partial<ToastOptions>) => void
  done: (options?: Partial<ToastOptions>) => void
  fail: (options?: Partial<ToastOptions>) => void
}

export interface NetworkToastOptions {
  /** Toast to show when device goes offline. Defaults are applied if omitted. */
  offline?: Partial<ToastOptions>
  /** Toast to show when device comes back online. Defaults are applied if omitted. */
  online?: Partial<ToastOptions>
}

export interface NetworkToastController {
  /** Call this to unregister the online/offline listeners and clean up. */
  stop: () => void
}
