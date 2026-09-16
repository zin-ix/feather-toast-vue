import { ref } from 'vue'
import type {
  Toast,
  ToastConfig,
  ToastOptions,
  ToastPosition,
  ToastPromiseOptions,
  UndoToastOptions,
  StepToastController,
  ProgressToastController,
  NetworkToastOptions,
  NetworkToastController,
  ToastComponent,
} from '../types/toast'

const toasts = ref<Toast[]>([])

let counter = 0

function generateId(): string {
  return `toast-${++counter}-${Date.now()}`
}

const DEFAULT_DURATION = 5000
const DEFAULT_POSITION: ToastPosition = 'bottom-right'
const DEFAULT_MAX_STACK = 5

const globalConfig = ref<ToastConfig>({
  max: DEFAULT_MAX_STACK,
  duration: DEFAULT_DURATION,
  position: DEFAULT_POSITION,
})

function parseOptions(input: unknown): ToastOptions {
  if (typeof input === 'string') {
    return { title: input }
  }
  if (typeof input === 'object' && input !== null) {
    return input as ToastOptions
  }
  return { title: String(input ?? '') }
}

function enforceMaxStack(position: ToastPosition, maxLimit?: number): void {
  const limit = maxLimit ?? globalConfig.value.max
  if (!limit || limit <= 0) return

  const matchingToasts = toasts.value.filter((t) => t.position === position)
  const excess = matchingToasts.length - limit + 1

  if (excess > 0) {
    const toRemove = matchingToasts.slice(0, excess)
    for (const item of toRemove) {
      item.onDismiss?.()
      dismiss(item.id)
    }
  }
}

function createToast(optionsInput: string | ToastOptions): string {
  const options = parseOptions(optionsInput)
  const id = generateId()
  const variant = options.variant ?? 'default'
  const position = options.position ?? globalConfig.value.position ?? DEFAULT_POSITION
  const defaultDuration = globalConfig.value.duration ?? DEFAULT_DURATION
  const duration = options.duration ?? (variant === 'loading' ? Infinity : defaultDuration)

  enforceMaxStack(position)

  const toast: Toast = {
    id,
    title: options.title,
    description: options.description,
    variant,
    position,
    duration,
    dismissible: options.dismissible ?? true,
    action: options.action,
    progress: options.progress,
    showProgress: options.showProgress,
    onDismiss: options.onDismiss,
    onUndo: options.onUndo,
  }

  toasts.value.push(toast)

  return id
}

function dismiss(id: string): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    const target = toasts.value[index]
    target?.onDismiss?.()
    toasts.value.splice(index, 1)
  }
}

function dismissAll(): void {
  for (const t of toasts.value) {
    t.onDismiss?.()
  }
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
      dismissible: options.dismissible ?? existing.dismissible,
      progress: options.progress !== undefined ? options.progress : existing.progress,
      showProgress: options.showProgress !== undefined ? options.showProgress : existing.showProgress,
    } as Toast
  }
}

// --- Variant shortcut functions ---

function toast(options: string | ToastOptions): string {
  return createToast(options)
}

toast.config = (options: Partial<ToastConfig>): void => {
  globalConfig.value = {
    ...globalConfig.value,
    ...options,
  }
}

toast.getConfig = (): ToastConfig => ({ ...globalConfig.value })

toast.success = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'success' })
}

toast.error = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'error' })
}

toast.warning = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'warning' })
}

toast.info = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'info' })
}

toast.loading = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'loading' })
}

toast.destructive = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'destructive' })
}

toast.offline = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ duration: Infinity, dismissible: false, ...opts, variant: 'offline' })
}

toast.update = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ duration: 8000, ...opts, variant: 'update' })
}

toast.neutral = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ duration: 3000, ...opts, variant: 'neutral' })
}

toast.dismiss = dismiss
toast.dismissAll = dismissAll
toast.updateToast = update

/**
 * toast.undo: Spawns an interactive toast with countdown bar and instant undo callback
 */
toast.undo = (
  titleOrOptions: string | UndoToastOptions,
  customOptions?: Partial<UndoToastOptions>,
): string => {
  const opts: UndoToastOptions =
    typeof titleOrOptions === 'string'
      ? { title: titleOrOptions, onUndo: customOptions?.onUndo || (() => {}), ...customOptions }
      : titleOrOptions

  let isUndone = false
  const duration = opts.duration ?? 5000

  const id = createToast({
    title: opts.title,
    description: opts.description,
    position: opts.position,
    duration,
    dismissible: true,
    showProgress: true,
    action: {
      label: opts.undoLabel || 'Undo',
      onClick: async () => {
        isUndone = true
        try {
          await opts.onUndo()
        } finally {
          dismiss(id)
        }
      },
    },
    onDismiss: () => {
      if (!isUndone) {
        opts.onDismiss?.()
      }
    },
  })

  return id
}

/**
 * toast.step: Multi-step workflow toast controller for smooth in-place stage transitions
 */
toast.step = (initialOptions: string | ToastOptions): StepToastController => {
  const opts = parseOptions(initialOptions)
  const id = createToast({
    variant: 'loading',
    duration: Infinity,
    ...opts,
  })

  return {
    id,
    next: (stepOpts: Partial<ToastOptions>) => {
      update(id, {
        variant: 'loading',
        duration: Infinity,
        ...stepOpts,
      })
    },
    done: (doneOpts?: Partial<ToastOptions>) => {
      update(id, {
        variant: 'success',
        duration: DEFAULT_DURATION,
        ...doneOpts,
      })
    },
    fail: (failOpts?: Partial<ToastOptions>) => {
      update(id, {
        variant: 'error',
        duration: DEFAULT_DURATION,
        ...failOpts,
      })
    },
  }
}

/**
 * toast.custom: Renders any custom Vue component or VNode in a toast
 */
toast.custom = (component: ToastComponent, options?: ToastOptions): string => {
  return createToast({
    ...options,
    component,
  })
}

/**
 * toast.progress: Spawns a progress bar controller for downloads/uploads/tasks
 */
toast.progress = (initialOptions: string | ToastOptions): ProgressToastController => {
  const opts = parseOptions(initialOptions)
  const id = createToast({
    variant: 'loading',
    duration: Infinity,
    progress: opts.progress ?? 0,
    ...opts,
  })

  return {
    id,
    setProgress: (percentage: number, updateOpts?: Partial<ToastOptions>) => {
      update(id, {
        progress: Math.min(100, Math.max(0, percentage)),
        ...updateOpts,
      })
    },
    done: (doneOpts?: Partial<ToastOptions>) => {
      update(id, {
        variant: 'success',
        duration: DEFAULT_DURATION,
        progress: 100,
        ...doneOpts,
      })
    },
    fail: (failOpts?: Partial<ToastOptions>) => {
      update(id, {
        variant: 'error',
        duration: DEFAULT_DURATION,
        ...failOpts,
      })
    },
  }
}

/**
 * toast.copy: One-line copy to clipboard with instant feedback toast
 */
toast.copy = async (
  text: string,
  options?: string | ToastOptions,
): Promise<string> => {
  const opts = parseOptions(options || { title: 'Copied to clipboard' })
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text)
    } else {
      throw new Error('Clipboard API unavailable')
    }
    return createToast({
      title: opts.title || 'Copied to clipboard',
      description: opts.description || text,
      variant: 'success',
      duration: 3000,
      ...opts,
    })
  } catch (err) {
    return createToast({
      title: 'Failed to copy',
      description: err instanceof Error ? err.message : 'Clipboard access denied',
      variant: 'error',
      duration: 4000,
    })
  }
}

/**
 * toast.network: Registers browser online/offline listeners and automatically
 * shows a persistent offline toast when the device loses internet, then
 * replaces it with a success toast when connectivity is restored.
 *
 * Returns a controller with a `stop()` method to unregister listeners.
 */
toast.network = (options?: NetworkToastOptions): NetworkToastController => {
  let offlineId: string | null = null

  function handleOffline() {
    if (offlineId) return // already showing
    offlineId = createToast({
      title: options?.offline?.title ?? 'You are offline',
      description: options?.offline?.description ?? 'Check your internet connection.',
      variant: 'offline',
      duration: Infinity,
      dismissible: false,
      ...options?.offline,
    })
  }

  function handleOnline() {
    if (offlineId) {
      dismiss(offlineId)
      offlineId = null
    }
    if (options?.online !== null) {
      createToast({
        title: options?.online?.title ?? 'Back online',
        description: options?.online?.description ?? 'Your internet connection was restored.',
        variant: 'success',
        duration: 4000,
        ...options?.online,
      })
    }
  }

  // Show immediately if already offline when registered
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    handleOffline()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
  }

  return {
    stop: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener('online', handleOnline)
      }
      if (offlineId) {
        dismiss(offlineId)
        offlineId = null
      }
    },
  }
}

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

export function useFeatherToast() {
  return {
    toast,
    toasts,
    dismiss,
    dismissAll,
  }
}

// Backwards compatibility alias
export const useToast = useFeatherToast
