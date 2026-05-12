export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'

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

export interface Toast {
  id: string
  title?: string
  description?: string
  variant: ToastVariant
  position: ToastPosition
  duration: number
  dismissible: boolean
  action?: ToastAction
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  position?: ToastPosition
  duration?: number
  dismissible?: boolean
  action?: ToastAction
}

export interface ToastPromiseOptions<T> {
  loading: ToastOptions
  success: ToastOptions | ((data: T) => ToastOptions)
  error: ToastOptions | ((err: unknown) => ToastOptions)
}
