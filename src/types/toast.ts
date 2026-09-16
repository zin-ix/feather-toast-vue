import type { Component, VNode } from 'vue'

export type ToastComponent = Component | VNode | (() => VNode | string)

export type ToastVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'destructive'
  | 'offline'
  | 'update'
  | 'neutral'

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

export interface ToastConfig {
  max?: number
  duration?: number
  position?: ToastPosition
}

export interface Toast {
  id: string
  title?: string
  description?: string
  variant: ToastVariant
  position: ToastPosition
  duration: number
  dismissible: boolean
  action?: ToastAction
  progress?: number
  showProgress?: boolean
  component?: ToastComponent
  onDismiss?: () => void
  onUndo?: () => void | Promise<void>
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  position?: ToastPosition
  duration?: number
  dismissible?: boolean
  action?: ToastAction
  progress?: number
  showProgress?: boolean
  component?: ToastComponent
  onDismiss?: () => void
  onUndo?: () => void | Promise<void>
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
