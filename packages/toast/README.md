# @feather-vue/toast

Lightweight, accessible toast notifications for Vue 3 with spring-based animations, promise support, swipe-to-dismiss, and a minimal footprint.

---

## Table of Contents

1. [Installation](#installation)
2. [Setup](#setup)
3. [Quick Start](#quick-start)
4. [Variants](#variants)
5. [Positioning](#positioning)
6. [Stack Limit](#stack-limit)
7. [Global Configuration](#global-configuration)
8. [toast.undo](#toastundo)
9. [toast.step](#toapststep)
10. [toast.progress](#toastprogress)
11. [toast.copy](#toastcopy)
12. [toast.promise](#toastpromise)
13. [toast.custom](#toastcustom)
14. [toast.network](#toastnetwork)
15. [TypeScript API Reference](#typescript-api-reference)
16. [CSS Theming](#css-custom-properties-theming)

---

## Installation

```bash
npm install @feather-vue/toast
# or
yarn add @feather-vue/toast
# or
pnpm add @feather-vue/toast
```

---

## Setup

### Vue 3 (Vite / Webpack)

Register the plugin once in your application entry file.

**`src/main.ts`**
```ts
import { createApp } from 'vue'
import App from './App.vue'
import { CreateFeatherToast } from '@feather-vue/toast'

const app = createApp(App)
app.use(CreateFeatherToast)
app.mount('#app')
```

The plugin automatically mounts `<ToastContainer />`, injects its stylesheet, and provides the `toast` instance via `provide/inject`. No CSS import needed.

Need to load the CSS yourself (strict CSP, SSR critical CSS)? Turn injection off and import the file:

```ts
import '@feather-vue/toast/style.css'
app.use(CreateFeatherToast, { injectStyles: false })
```

---

### Nuxt 3

Create a client-only plugin file. Toast relies on browser APIs and must run exclusively on the client.

**`plugins/toast.client.ts`**
```ts
import { defineNuxtPlugin } from '#app'
import { CreateFeatherToast } from '@feather-vue/toast'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(CreateFeatherToast)
})
```

> The `.client.ts` suffix ensures Nuxt only loads this plugin in the browser, never on the server.

---

## Quick Start

Call `useFeatherToast()` inside any Vue component's `<script setup>` to access the `toast` object.

```vue
<script setup lang="ts">
import { useFeatherToast } from '@feather-vue/toast'

const { toast } = useFeatherToast()

function save() {
  toast.success('Changes saved successfully!')
}
</script>

<template>
  <button @click="save">Save</button>
</template>
```

---

## Variants

```ts
const { toast } = useFeatherToast()

toast('New notification')              // default
toast.success('Profile updated!')
toast.error('Request failed.')
toast.warning('Storage running low.')
toast.info('Version 2.4 available.')
toast.loading('Uploading files...')

// Pass anything thrown straight in  the message is extracted
try { await save() } catch (err) { toast.error(err) }

// Full options object
toast.success({
  title: 'Payment successful',
  description: 'Your invoice has been paid.',
  duration: 6000,
  position: 'top-right',
})
```

| Variant       | Duration    | Dismissible | Notes                              |
|---------------|-------------|-------------|------------------------------------|
| `default`     | 5 000 ms    | Yes         | Neutral notification               |
| `success`     | 5 000 ms    | Yes         | Positive confirmation              |
| `error`       | 5 000 ms    | Yes         | Failure or exception               |
| `warning`     | 5 000 ms    | Yes         | Caution / low-priority issue       |
| `info`        | 5 000 ms    | Yes         | Informational message              |
| `loading`     | Persistent  | No          | Spinner; use with `toast.promise`  |
| `offline`     | Persistent  | No          | Network connectivity lost          |
| `update`      | 8 000 ms    | Yes         | App or version update available    |

---

## Positioning

```ts
toast.success({
  title: 'Saved',
  position: 'top-right',
  // 'top-right' | 'top-left' | 'top-center'
  // 'bottom-right' | 'bottom-left' | 'bottom-center'
})
```

---

## Stack Limit

When the number of visible toasts at a given position exceeds the configured maximum, the oldest toast is smoothly dismissed.

```ts
toast.config({ max: 3 })   // Allow at most 3 simultaneous toasts
toast.config({ max: 0 })   // Unlimited
```

---

## Global Configuration

Configure defaults once — typically in your root component.

```ts
import { useFeatherToast } from '@feather-vue/toast'

const { toast } = useFeatherToast()

toast.config({
  max: 3,                    // Max visible toasts per position (0 = unlimited)
  duration: 4000,            // Default auto-dismiss timeout in milliseconds
  position: 'bottom-right',  // Default spawn position
  visibleToasts: 3,          // Toasts shown in the collapsed stack
  expand: false,             // true = always expanded instead of the Sonner-style stack
  richColors: false,         // Tinted backgrounds for success/error/warning/info/update
  theme: 'light',            // 'light' | 'dark' | 'system'
})

const config = toast.getConfig()
// => { max: 3, duration: 4000, position: 'bottom-right' }
```

---

## Stacking & Gestures

Toasts stack like shadcn/Sonner: newer toasts sit in front and older ones peek out behind.

- **Desktop:** hover the stack to expand it. All timers pause while it is expanded.
- **Touch:** tap the stack to expand it, and tap outside to collapse it.
- **Swipe** left or right to dismiss. A quick flick also works.
- Timers also pause while the browser tab is hidden.
- All motion is `transform`/`opacity` only, and `prefers-reduced-motion` falls back to a plain fade.

### Deduplicate with `id`

Passing an `id` that is already on screen updates that toast in place instead of stacking a duplicate:

```ts
toast.success({ id: 'autosave', title: 'Draft saved' })
```

---

## Reactive toasts

`title`, `description` and `progress` accept a `ref`, a `computed` or a getter. The toast updates when the value changes, with no update calls needed:

```ts
const pct = ref(0)
toast.loading({
  title: computed(() => `Uploading& ${pct.value}%`),
  progress: pct,
})
```

---

## toast.flash

Works like `toast()`, but survives a full page load. If the page reloads or navigates away while the toast is visible, it shows again on the next page. Use it after login redirects, OAuth round-trips and classic form posts. On SPA navigation it just stays on screen.

```ts
toast.flash.success('Signed in')   // also .error / .warning / .info, or toast.flash({ ... })
window.location.href = '/dashboard'
```

Only the title, description, variant, position and duration are carried over (as plain JSON in `sessionStorage`). Buttons and custom components are not.

---

## Testing

The store can be read without rendering anything, so tests don't need a DOM or `<ToastContainer />`. The helpers work with Vitest, Jest or any runner that catches thrown errors.

```ts
import { expectToast, expectNoToasts, getToasts, clickToastAction, resetToasts } from '@feather-vue/toast'

beforeEach(() => resetToasts())          // toasts, config and pending flashes

it('confirms before deleting', async () => {
  const done = store.deleteFiles()       // calls toast.confirm(...)
  await clickToastAction({ title: /Delete/ })          // or (matcher, 'cancel')
  await done
  expectToast({ variant: 'success', title: 'Files deleted' })
})
```

A failing `expectToast` lists every active toast, so you can see what showed up instead. `getToasts()` returns plain snapshots (refs resolved) that are safe for `toEqual`.

---

## Duplicate grouping

Firing the same plain toast (same variant, title, description and position) while it's still visible doesn't stack a copy. The visible toast gets a **×N** badge and its timer restarts. That keeps error storms and repeated clicks readable. Turn it off with `toast.config({ group: false })`.

---

## toast.retry

Runs an async task behind a loading toast. If it throws, the toast becomes an error with a **Retry** button that re-runs the task in the same toast. The returned promise resolves with the task's result, or rejects when the user dismisses the error or `maxRetries` runs out.

```ts
const users = await toast.retry(() => api.get('/users'), {
  loading: 'Loading users...',
  success: (res) => `Loaded ${res.data.length} users`,
  // error: (err) => ({ title: 'Could not load users', description: String(err) }),  // default: the error's message
  maxRetries: 3,
})
```

---

## toast.confirm

Inline confirmation that resolves to `true` or `false`. Cancel, close, swipe and timeout all resolve `false`.

```ts
const ok = await toast.confirm('Delete 3 files?', {
  description: 'This cannot be undone.',
  confirmLabel: 'Delete',   // default "Confirm"
  cancelLabel: 'Keep',      // default "Cancel"
  duration: 10000,          // optional auto-cancel, shows a countdown bar
})
if (ok) await deleteFiles()
```

Any toast can also take a secondary `cancel: { label, onClick }` button next to `action`.

---

## toast.undo

Renders a toast with a live countdown bar and an **Undo** action button. Use this for destructive operations where the user needs a grace period to revert.

```ts
const { toast } = useFeatherToast()

function deleteFile(fileId: string) {
  toast.undo('File "invoice-2026.pdf" deleted', {
    description: 'Click Undo within 5 seconds to restore the file.',
    duration: 5000,
    undoLabel: 'Undo Delete',
    onUndo: async () => {
      await restoreFile(fileId)
      toast.success('File restored to Documents.')
    },
    onDismiss: () => {
      // Called only if countdown expired without clicking Undo
      permanentlyDelete(fileId)
    },
  })
}
```

### UndoToastOptions

| Property      | Type                          | Default  | Description                                        |
|---------------|-------------------------------|----------|----------------------------------------------------|
| `title`       | `string`                      | —        | Primary text of the toast.                         |
| `description` | `string`                      | —        | Secondary explanation line.                        |
| `duration`    | `number`                      | `5000`   | Countdown timer in milliseconds.                   |
| `undoLabel`   | `string`                      | `'Undo'` | Label for the revert button.                       |
| `onUndo`      | `() => void \| Promise<void>` | —        | Called when the user clicks Undo.                  |
| `onDismiss`   | `() => void`                  | —        | Called if the countdown expires without undo.      |
| `position`    | `ToastPosition`               | Global   | Overrides the global default position.             |

---

## toast.step

Renders a single persistent loading toast and transitions it through sequential steps in-place — no flicker, no new cards. Ideal for multi-stage operations (deployments, imports, migrations).

```ts
const { toast } = useFeatherToast()

async function runMigration() {
  const workflow = toast.step({
    title: 'Step 1/3: Validating schema...',
    description: 'Checking data integrity.',
  })

  await validateSchema()
  workflow.next({
    title: 'Step 2/3: Deploying database migration...',
    description: 'Applying schema patches to PostgreSQL.',
  })

  try {
    await deployMigration()
    workflow.done({
      title: 'Step 3/3: Migration complete!',
      description: 'Database updated with zero downtime.',
    })
  } catch (err) {
    workflow.fail({
      title: 'Migration failed',
      description: err.message,
    })
  }
}
```

### StepToastController

| Method | Signature                               | Description                                     |
|--------|-----------------------------------------|-------------------------------------------------|
| `next` | `(opts: Partial<ToastOptions>) => void` | Updates the toast in-place; keeps loading state.|
| `done` | `(opts?: Partial<ToastOptions>) => void`| Switches the toast to success variant.          |
| `fail` | `(opts?: Partial<ToastOptions>) => void`| Switches the toast to error variant.            |

---

## toast.progress

Spawns a loading toast with an explicit progress bar you control programmatically. Use for uploads, downloads, or any task with measurable progress.

```ts
const { toast } = useFeatherToast()

async function uploadFile(file: File) {
  const progressToast = toast.progress({
    title: 'Uploading file...',
    description: '0% completed',
  })

  xhr.addEventListener('progress', (e) => {
    const pct = Math.round((e.loaded / e.total) * 100)
    progressToast.setProgress(pct, { description: `${pct}% completed` })
  })

  await uploadPromise

  progressToast.done({
    title: 'Upload complete!',
    description: `${file.name} saved to storage.`,
  })
}
```

### ProgressToastController

| Method        | Signature                                             | Description                                   |
|---------------|-------------------------------------------------------|-----------------------------------------------|
| `setProgress` | `(pct: number, opts?: Partial<ToastOptions>) => void` | Updates the bar (0–100) and toast text.       |
| `done`        | `(opts?: Partial<ToastOptions>) => void`              | Completes the task; switches to success.      |
| `fail`        | `(opts?: Partial<ToastOptions>) => void`              | Marks the task failed; switches to error.     |

---

## toast.copy

Copies text to the system clipboard and automatically shows a confirmation toast.

```ts
const { toast } = useFeatherToast()

async function copyLink() {
  await toast.copy('https://your-app.dev/share/xyz', {
    title: 'Link copied!',
    description: 'Share link has been copied to your clipboard.',
  })
}
```

On success: shows a `success` toast.  
On failure: shows an `error` toast with the browser error message.

---

## toast.promise

Tracks an existing promise and automatically transitions loading ? success / error.

```ts
const { toast } = useFeatherToast()

async function createProject(data: ProjectPayload) {
  const request = fetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  await toast.promise(request, {
    loading: {
      title: 'Creating project...',
      description: 'Setting up your workspace.',
    },
    success: () => ({
      title: 'Project created!',
      description: 'Your workspace is ready.',
    }),
    error: (err) => ({
      title: 'Failed to create project',
      description: err instanceof Error ? err.message : 'An unknown error occurred.',
    }),
  })
}
```

> `toast.promise` re-throws the rejection after showing the error toast. Wrap calls in `try/catch` or `.catch()` to handle the error downstream.

### ToastPromiseOptions

| Property  | Type                                              | Description                                    |
|-----------|---------------------------------------------------|------------------------------------------------|
| `loading` | `ToastOptions`                                    | Shown while the promise is pending.            |
| `success` | `ToastOptions \| ((data: T) => ToastOptions)`     | Shown on fulfillment.                          |
| `error`   | `ToastOptions \| ((err: unknown) => ToastOptions)`| Shown on rejection.                            |

---

## toast.custom

Render any Vue component, render function, or `h()` VNode directly inside a toast.

```ts
import { h } from 'vue'
import { useFeatherToast } from '@feather-vue/toast'

const { toast } = useFeatherToast()

function showInvite(user: { name: string; initials: string }) {
  toast.custom({
    render: () =>
      h('div', { style: 'display:flex;align-items:center;gap:12px;' }, [
        h('div', {
          style: 'width:32px;height:32px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;',
        }, user.initials),
        h('div', [
          h('p', { style: 'font-size:13px;font-weight:500;margin:0;' }, `${user.name} invited you`),
          h('p', { style: 'font-size:11px;opacity:0.65;margin:3px 0 0;' }, 'to collaborate on Project Alpha'),
        ]),
      ]),
    duration: 6000,
  })
}
```

You can also pass a single-file component directly:

```ts
import InviteCard from '@/components/InviteCard.vue'

toast.custom({
  render: () => h(InviteCard, { user }),
  duration: 6000,
})
```

---

## toast.network

`toast.network()` automatically monitors the browser's `online` and `offline` events. It:

- Shows a **persistent, non-dismissible offline toast** the instant the device loses internet.
- Dismisses it and shows a **success toast** when the connection is restored.
- Detects if the device is **already offline at registration time** and shows the toast immediately.

Returns a `NetworkToastController` with a `stop()` method to clean up listeners.

### Recommended: App-Level Registration

Register once in your root `App.vue` to monitor connectivity for the entire application.

```vue
<!-- App.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useFeatherToast } from '@feather-vue/toast'
import type { NetworkToastController } from '@feather-vue/toast'

const { toast } = useFeatherToast()
let networkMonitor: NetworkToastController | null = null

onMounted(() => {
  networkMonitor = toast.network()
})

onUnmounted(() => {
  networkMonitor?.stop()
})
</script>
```

### Custom Messages

```ts
const monitor = toast.network({
  offline: {
    title: 'No internet connection',
    description: 'Please check your Wi-Fi or mobile data.',
    position: 'top-center',
  },
  online: {
    title: 'Connection restored',
    description: 'You are back online.',
    position: 'top-center',
  },
})

// Stop monitoring when no longer needed
monitor.stop()
```

### NetworkToastOptions

| Option    | Type                    | Default  | Description                                          |
|-----------|-------------------------|----------|------------------------------------------------------|
| `offline` | `Partial<ToastOptions>` | Built-in | Toast shown when internet connection is lost.        |
| `online`  | `Partial<ToastOptions>` | Built-in | Toast shown when internet connection is restored.    |

### NetworkToastController

| Method | Signature    | Description                                                     |
|--------|--------------|-----------------------------------------------------------------|
| `stop` | `() => void` | Removes event listeners and dismisses the offline toast if present. |

---

## TypeScript API Reference

All types are exported directly from the package:

```ts
import type {
  Toast,
  ToastOptions,
  ToastAction,
  ToastVariant,
  ToastPosition,
  ToastConfig,
  ToastPromiseOptions,
  UndoToastOptions,
  StepToastController,
  ProgressToastController,
  NetworkToastOptions,
  NetworkToastController,
  ToastComponent,
} from '@feather-vue/toast'
```

### ToastOptions

| Property      | Type                                    | Default          | Description                                    |
|---------------|-----------------------------------------|------------------|------------------------------------------------|
| `title`       | `string`                                | —                | Primary text of the toast.                     |
| `description` | `string`                                | `undefined`      | Secondary line below the title.                |
| `variant`     | `ToastVariant`                          | `'default'`      | Controls the icon and accent color.            |
| `position`    | `ToastPosition`                         | `'bottom-right'` | One of six supported positions.                |
| `duration`    | `number`                                | `5000`           | Auto-dismiss delay in milliseconds.            |
| `dismissible` | `boolean`                               | `true`           | Whether the user can close the toast manually. |
| `progress`    | `number` (0–100)                        | `undefined`      | Explicit progress bar percentage.              |
| `showProgress`| `boolean`                               | `false`          | Renders an animated countdown bar.             |
| `action`      | `{ label: string; onClick: () => void }`| `undefined`      | Inline action button.                          |
| `onDismiss`   | `() => void`                            | `undefined`      | Called when the toast is dismissed.            |

### ToastConfig

| Property   | Type            | Default          | Description                                      |
|------------|-----------------|------------------|--------------------------------------------------|
| `max`      | `number`        | `5`              | Max visible toasts per position (0 = unlimited). |
| `duration` | `number`        | `5000`           | Default auto-dismiss timeout in milliseconds.    |
| `position` | `ToastPosition` | `'bottom-right'` | Default spawn position.                          |

---

## CSS Custom Properties (Theming)

```css
:root {
  --toast-bg: #18181b;
  --toast-border: rgba(255, 255, 255, 0.08);
  --toast-text: #fafafa;
  --toast-text-muted: #a1a1aa;
  --toast-success: #22c55e;
  --toast-error: #ef4444;
  --toast-warning: #f59e0b;
  --toast-info: #3b82f6;
  --toast-radius: 8px;
  --toast-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  --toast-z-index: 9999;
}
```

---

## License

MIT (c) zin-ix
