import { ref, isRef, toValue, type Ref } from 'vue'
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
  ConfirmToastOptions,
  RetryToastOptions,
} from '../types/toast'

// Typed as raw Toast so refs/getters can be stored; reactive() unwraps refs on
// read, and the component reads every reactive field through toValue().
const toasts = ref([]) as Ref<Toast[]>

let counter = 0

function generateId(): string {
  return `toast-${++counter}-${Date.now()}`
}

const DEFAULT_DURATION = 5000
const DEFAULT_POSITION: ToastPosition = 'bottom-right'
const DEFAULT_MAX_STACK = 5

const defaultConfig = (): ToastConfig => ({
  max: DEFAULT_MAX_STACK,
  duration: DEFAULT_DURATION,
  position: DEFAULT_POSITION,
})

const globalConfig = ref<ToastConfig>(defaultConfig())

function errorMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return 'Something went wrong'
}

function parseOptions(input: unknown): ToastOptions {
  // Strings, refs and getters are all title shorthands: toast(computed(...))
  if (typeof input === 'string' || isRef(input) || typeof input === 'function') {
    return { title: input as ToastOptions['title'] }
  }
  // Lets catch blocks pass errors straight through: toast.error(err)
  if (
    input instanceof Error ||
    (typeof input === 'object' && input !== null && 'message' in input && !('title' in input) && !('description' in input))
  ) {
    return { title: errorMessage(input) }
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
      dismiss(item.id)
    }
  }
}

function isPlain(t: ToastOptions | Toast): boolean {
  return !t.action && !t.cancel && !t.component && t.progress === undefined && !t.onDismiss
}

function createToast(optionsInput: string | ToastOptions): string {
  const options = parseOptions(optionsInput)

  // Same id → update in place (no duplicate stacking, no re-entry animation)
  if (options.id && toasts.value.some((t) => t.id === options.id)) {
    update(options.id, options)
    return options.id
  }

  const id = options.id ?? generateId()
  const variant = options.variant ?? 'default'
  const position = options.position ?? globalConfig.value.position ?? DEFAULT_POSITION

  // Identical plain toast already visible → bump its ×N badge (restarts its timer)
  if (globalConfig.value.group !== false && !options.id && variant !== 'loading' && isPlain(options)) {
    const twin = toasts.value.find(
      (t) =>
        t.position === position &&
        t.variant === variant &&
        toValue(t.title) === toValue(options.title) &&
        toValue(t.description) === toValue(options.description) &&
        isPlain(t),
    )
    if (twin) {
      twin.count = (twin.count ?? 1) + 1
      return twin.id
    }
  }
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
    cancel: options.cancel,
    progress: options.progress,
    showProgress: options.showProgress,
    component: options.component,
    onDismiss: options.onDismiss,
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
    pendingFlashes.delete(id)
  }
}

function dismissAll(): void {
  for (const t of toasts.value) {
    t.onDismiss?.()
  }
  toasts.value.splice(0, toasts.value.length)
  pendingFlashes.clear()
}

// --- Flash: toasts that survive a full page load (login redirects, OAuth, form posts) ---

const FLASH_KEY = 'feather-toast:flash'
const pendingFlashes = new Map<string, ToastOptions>()
let flashListening = false

/** Plain, JSON-safe snapshot: refs resolved, callbacks/components dropped. */
function serializable(o: ToastOptions): ToastOptions {
  return {
    title: toValue(o.title),
    description: toValue(o.description),
    variant: o.variant,
    position: o.position,
    duration: Number.isFinite(o.duration) ? o.duration : undefined,
  }
}

// Fires on reload / full navigation. Flashes still on screen move to
// sessionStorage and reappear on the next page; SPA navigation never fires
// this, so the toast simply stays visible.
function persistFlashes() {
  const live = [...pendingFlashes.values()]
  pendingFlashes.clear()
  if (!live.length) return
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify(live))
  } catch {
    // storage blocked (private mode, sandboxed iframe): flash is best-effort
  }
}

/** Shows flashes saved by the previous page. Called once by the plugin. */
export function restoreFlashes(): void {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY)
    if (!raw) return
    sessionStorage.removeItem(FLASH_KEY)
    for (const options of JSON.parse(raw) as ToastOptions[]) createToast(options)
  } catch {
    // unreadable storage or malformed payload — nothing to restore
  }
}

function flash(options: string | ToastOptions): string {
  const opts = parseOptions(options)
  const id = createToast(opts)
  if (typeof window === 'undefined') return id
  pendingFlashes.set(id, serializable(opts))
  if (!flashListening) {
    flashListening = true
    window.addEventListener('pagehide', persistFlashes)
  }
  return id
}

const variantFlash = (variant: 'success' | 'error' | 'warning' | 'info') =>
  (options: string | ToastOptions): string => flash({ ...parseOptions(options), variant })

/** Clears all toasts, config, and pending flashes. Used by the testing helpers. */
export function resetToastState(): void {
  toasts.value.splice(0, toasts.value.length)
  pendingFlashes.clear()
  globalConfig.value = defaultConfig()
  counter = 0
}

function update(id: string, options: Partial<ToastOptions>): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    const existing = toasts.value[index]
    if (!existing) return
    toasts.value[index] = {
      ...existing,
      ...options,
      id: existing.id,
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

/** Accepts options, a string, or anything thrown: `catch (err) { toast.error(err) }` */
function errorToast(options: string | ToastOptions): string
function errorToast(err: unknown): string
function errorToast(options: unknown): string {
  const opts = parseOptions(options)
  return createToast({ ...opts, variant: 'error' })
}
toast.error = errorToast

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

toast.offline = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ duration: Infinity, dismissible: false, ...opts, variant: 'offline' })
}

toast.update = (options: string | ToastOptions): string => {
  const opts = parseOptions(options)
  return createToast({ duration: 8000, ...opts, variant: 'update' })
}

toast.dismiss = dismiss
toast.dismissAll = dismissAll

/**
 * toast.flash: Like toast(), but if the page reloads or navigates away while
 * it is visible, it is shown again on the next page.
 *   toast.flash.success('Signed in'); window.location.href = '/dashboard'
 */
toast.flash = Object.assign(flash, {
  success: variantFlash('success'),
  error: variantFlash('error'),
  warning: variantFlash('warning'),
  info: variantFlash('info'),
})
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

/**
 * toast.confirm: Inline confirmation toast. Resolves true on confirm,
 * false on cancel, dismiss, swipe, or timeout.
 */
toast.confirm = (
  titleOrOptions: string | ConfirmToastOptions,
  customOptions?: Partial<ConfirmToastOptions>,
): Promise<boolean> => {
  const opts: ConfirmToastOptions =
    typeof titleOrOptions === 'string' ? { title: titleOrOptions, ...customOptions } : titleOrOptions

  return new Promise<boolean>((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
      dismiss(id)
    }

    const id = createToast({
      title: opts.title ?? 'Are you sure?',
      description: opts.description,
      variant: opts.variant ?? 'warning',
      position: opts.position,
      duration: opts.duration ?? Infinity,
      showProgress: opts.duration !== undefined && opts.duration !== Infinity,
      action: { label: opts.confirmLabel ?? 'Confirm', onClick: () => settle(true) },
      cancel: { label: opts.cancelLabel ?? 'Cancel', onClick: () => settle(false) },
      onDismiss: () => settle(false),
    })
  })
}

/**
 * toast.retry: Runs an async task with a loading toast. On failure the toast
 * turns into an error with a Retry button that re-runs the task in place.
 * Resolves with the task's result; rejects if the user dismisses the error
 * or retries run out.
 */
toast.retry = <T>(task: () => Promise<T>, options: RetryToastOptions<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const resolveInput = <A>(input: unknown, arg: A): ToastOptions =>
      parseOptions(typeof input === 'function' ? input(arg) : input)
    const loading = { ...parseOptions(options.loading), position: options.position }
    const id = createToast({ ...loading, variant: 'loading', duration: Infinity, dismissible: false })
    let failures = 0

    const run = async () => {
      update(id, {
        ...loading,
        variant: 'loading',
        duration: Infinity,
        dismissible: false,
        action: undefined,
        onDismiss: undefined,
      })
      try {
        const data = await task()
        const success = resolveInput(options.success, data)
        update(id, { ...success, variant: 'success', dismissible: true, duration: success.duration ?? DEFAULT_DURATION })
        resolve(data)
      } catch (err) {
        failures++
        const failed = options.error ? resolveInput(options.error, err) : { title: errorMessage(err) }
        const canRetry = failures <= (options.maxRetries ?? Infinity)
        update(id, {
          description: undefined,
          ...failed,
          variant: 'error',
          dismissible: true,
          duration: canRetry ? Infinity : (failed.duration ?? DEFAULT_DURATION),
          action: canRetry ? { label: options.retryLabel ?? 'Retry', onClick: run } : undefined,
          onDismiss: () => reject(err),
        })
        if (!canRetry) reject(err)
      }
    }

    run()
  })

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
    config: globalConfig,
    dismiss,
    dismissAll,
  }
}

// Backwards compatibility alias
export const useToast = useFeatherToast
