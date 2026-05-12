import { ref } from 'vue'
import type { Toast, ToastOptions, ToastPosition, ToastPromiseOptions } from '../types/toast'

const toasts = ref<Toast[]>([])

let counter = 0

function generateId(): string {
  return `toast-${++counter}-${Date.now()}`
}

const DEFAULT_DURATION = 5000
const DEFAULT_POSITION: ToastPosition = 'bottom-right'

function createToast(options: ToastOptions): string {
  const id = generateId()
  const variant = options.variant ?? 'default'
  const duration = options.duration ?? (variant === 'loading' ? Infinity : DEFAULT_DURATION)

  const toast: Toast = {
    id,
    title: options.title,
    description: options.description,
    variant,
    position: options.position ?? DEFAULT_POSITION,
    duration,
    dismissible: options.dismissible ?? true,
    action: options.action,
  }

  toasts.value.push(toast)

  return id
}

function dismiss(id: string): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function dismissAll(): void {
  toasts.value.splice(0, toasts.value.length)
}

function update(id: string, options: Partial<ToastOptions>): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    const existing = toasts.value[index]
    if (!existing) return
    toasts.value[index] = {
      ...existing,
      ...options,
      variant: options.variant ?? existing.variant,
      position: options.position ?? existing.position,
      duration: options.duration ?? existing.duration,
      dismissible: options.dismissible ?? true,
    } as Toast
  }
}

// --- Variant shortcut functions ---

function toast(options: ToastOptions): string {
  return createToast(options)
}

toast.success = (options: ToastOptions): string => {
  return createToast({ ...options, variant: 'success' })
}

toast.error = (options: ToastOptions): string => {
  return createToast({ ...options, variant: 'error' })
}

toast.warning = (options: ToastOptions): string => {
  return createToast({ ...options, variant: 'warning' })
}

toast.info = (options: ToastOptions): string => {
  return createToast({ ...options, variant: 'info' })
}

toast.loading = (options: ToastOptions): string => {
  return createToast({ ...options, variant: 'loading' })
}

toast.dismiss = dismiss
toast.dismissAll = dismissAll

toast.promise = async function <T>(
  promise: Promise<T>,
  options: ToastPromiseOptions<T>,
): Promise<T> {
  const id = createToast({ ...options.loading, variant: 'loading' })

  try {
    const data = await promise

    const successOpts =
      typeof options.success === 'function' ? options.success(data) : options.success

    update(id, {
      ...successOpts,
      variant: 'success',
      dismissible: true,
      duration: successOpts.duration ?? DEFAULT_DURATION,
    })

    return data
  } catch (err) {
    const errorOpts = typeof options.error === 'function' ? options.error(err) : options.error

    update(id, {
      ...errorOpts,
      variant: 'error',
      dismissible: true,
      duration: errorOpts.duration ?? DEFAULT_DURATION,
    })

    throw err
  }
}

export function useToast() {
  return {
    toast,
    toasts,
    dismiss,
    dismissAll,
  }
}
