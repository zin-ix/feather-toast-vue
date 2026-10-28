<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, inject, h } from 'vue'
import { useFeatherToast } from 'feather-toast-vue'
import type { ToastPosition } from 'feather-toast-vue'

type FeatherToastApi = ReturnType<typeof useFeatherToast>

const toastApi = inject<FeatherToastApi>('toast')

if (!toastApi) {
  throw new Error('CreateFeatherToast plugin is not installed. Call app.use(CreateFeatherToast) in main.ts.')
}

const { toast } = toastApi

// ── Theme ──────────────────────────────────────────
const isDark = ref(true)

function toggleTheme() {
  isDark.value = !isDark.value
}

watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  toast.config({ theme: dark ? 'dark' : 'light' })
}, { immediate: true })

// ── Install copy ────────────────────────────────────
const installCopied = ref(false)
function copyInstall() {
  navigator.clipboard.writeText('npm install feather-toast-vue')
  installCopied.value = true
  setTimeout(() => { installCopied.value = false }, 2000)
}

// ── Code Snippet Copy ───────────────────────────────
const copiedSnippetId = ref<string | null>(null)
function copySnippet(code: string, id: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(code)
    copiedSnippetId.value = id
    toast.success('Code copied to clipboard!')
    setTimeout(() => {
      if (copiedSnippetId.value === id) copiedSnippetId.value = null
    }, 2000)
  }
}

const SNIPPET_UNDO = `toast.undo('File "invoice-2026.pdf" deleted', {
  description: 'Click undo within 5 seconds to revert.',
  duration: 5000,
  undoLabel: 'Undo',
  onUndo: async () => {
    await restoreFile()
    toast.success('File restored to Documents')
  },
  onDismiss: () => {
    permanentlyDeleteFromDatabase()
  },
})`

const SNIPPET_STEP = `const workflow = toast.step({
  title: 'Step 1/3: Validating schema...',
  description: 'Checking data integrity.',
})

setTimeout(() => {
  workflow.next({
    title: 'Step 2/3: Deploying database migration...',
    description: 'Applying schema patches to PostgreSQL.',
  })
}, 1800)

setTimeout(() => {
  workflow.done({
    title: 'Step 3/3: Migration complete!',
    description: 'Database updated with zero downtime.',
  })
}, 3800)`

const SNIPPET_PROGRESS = `const download = toast.progress({
  title: 'Downloading dataset...',
  description: '0% completed',
})

download.setProgress(45, { description: '45% completed (24 MB/s)' })
download.setProgress(80, { description: '80% completed' })
download.done({
  title: 'Download complete!',
  description: '1.2 GB saved to Downloads folder.',
})`

const SNIPPET_COPY = `await toast.copy('https://feather-toast.dev/v2', {
  title: 'Share link copied!',
  description: 'Copied https://feather-toast.dev/v2 to clipboard.',
})`

const SNIPPET_CUSTOM = `import { h } from 'vue'

toast.custom({
  render: () =>
    h('div', { style: 'display: flex; align-items: center; gap: 10px;' }, [
      h('div', { style: 'width:28px;height:28px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;' }, 'JD'),
      h('div', [
        h('p', { style: 'font-size:13px;font-weight:500;margin:0;' }, 'Jane Doe invited you'),
        h('p', { style: 'font-size:11px;color:var(--toast-text-muted);margin:2px 0 0;' }, 'to collaborate on Project Alpha'),
      ]),
    ]),
  duration: 5000,
})`

const SNIPPET_PROMISE = `const savePromise = fetch('/api/save', { method: 'POST' })

toast.promise(savePromise, {
  loading: {
    title: 'Creating project...',
    description: 'Setting up workspace.',
  },
  success: (data) => ({
    title: 'Project created!',
    description: 'Your workspace is ready to go.',
  }),
  error: (err: any) => ({
    title: 'Failed to create project',
    description: err?.message || 'Unknown error occurred.',
  }),
})`

const SNIPPET_CONFIG = `import { useFeatherToast } from 'feather-toast-vue'

const { toast } = useFeatherToast()

// Set global config
toast.config({
  max: 3,                // Max visible stack limit per position
  duration: 4000,        // Default timeout in ms
  position: 'bottom-right',
})

// Read active configuration
const current = toast.getConfig()`

const SNIPPET_SETUP_VUE3 = `import { createApp } from 'vue'
import App from './App.vue'
import { CreateFeatherToast } from 'feather-toast-vue'

const app = createApp(App)
app.use(CreateFeatherToast)
app.mount('#app')`

const SNIPPET_SETUP_NUXT = `import { defineNuxtPlugin } from '#app'
import { CreateFeatherToast } from 'feather-toast-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(CreateFeatherToast)
})`

const SNIPPET_QUICKSTART = `<script setup lang="ts">
import { useFeatherToast } from 'feather-toast-vue'

const { toast } = useFeatherToast()

function onSave() {
  // 1. String shorthand
  toast.success('Changes saved successfully!')

  // 2. Detailed options
  toast.error({
    title: 'Connection timeout',
    description: 'Server is temporarily unreachable. Try again.',
  })
}
<\/script>`

const SNIPPET_NETWORK = `import { onMounted, onUnmounted } from 'vue'
import { useFeatherToast } from 'feather-toast-vue'
import type { NetworkToastController } from 'feather-toast-vue'

const { toast } = useFeatherToast()

let networkMonitor: NetworkToastController | null = null

onMounted(() => {
  networkMonitor = toast.network({
    offline: {
      title: 'You are offline',
      description: 'Check your internet connection.',
    },
    online: {
      title: 'Back online',
      description: 'Your internet connection was restored.',
    },
  })
})

onUnmounted(() => {
  networkMonitor?.stop()
})`






// ── Position ────────────────────────────────────────
const selectedPosition = ref<ToastPosition>('bottom-right')

const positions: { label: string; value: ToastPosition }[] = [
  { label: 'Top Right',     value: 'top-right' },
  { label: 'Top Left',      value: 'top-left' },
  { label: 'Top Center',    value: 'top-center' },
  { label: 'Bottom Right',  value: 'bottom-right' },
  { label: 'Bottom Left',   value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
]

// ── Sidebar nav ─────────────────────────────────────
const navItems = [
  { id: 'overview',   label: '00  Overview' },
  { id: 'install',    label: '01  Installation' },
  { id: 'quickstart', label: '02  Quick Start' },
  { id: 'position',   label: '03  Position & Stack Limit' },
  { id: 'variants',   label: '04  Variants' },
  { id: 'features',   label: '05  Feature Guides' },
  { id: 'network',    label: '06  Network Monitor' },
  { id: 'api',        label: '07  API Reference' },
  { id: 'changelog',  label: '08  Changelog' },
]

const activeSection = ref('overview')

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onScroll() {
  for (const item of [...navItems].reverse()) {
    const el = document.getElementById(item.id)
    if (el && el.getBoundingClientRect().top <= 120) {
      activeSection.value = item.id
      return
    }
  }
  activeSection.value = 'overview'
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// ── Stack limit ─────────────────────────────────────
const stackLimits = [
  { label: 'Max 1', value: 1 },
  { label: 'Max 3', value: 3 },
  { label: 'Max 5 (default)', value: 5 },
  { label: 'Unlimited', value: 0 },
]
const selectedMaxStack = ref(5)

watch(selectedMaxStack, (val) => {
  toast.config({ max: val })
}, { immediate: true })

// ── API reference data ──────────────────────────────
interface ApiRow {
  prop: string
  type: string
  default: string
  description: string
}

const apiRows: ApiRow[] = [
  { prop: 'title',       type: 'string',                                          default: '—',              description: 'Primary text shown in the toast.' },
  { prop: 'description', type: 'string',                                          default: 'undefined',      description: 'Secondary line below the title.' },
  { prop: 'position',    type: 'ToastPosition',                                   default: '"bottom-right"', description: 'One of six corner / edge positions.' },
  { prop: 'duration',    type: 'number',                                          default: '5000',           description: 'Auto-dismiss delay in milliseconds.' },
  { prop: 'dismissible', type: 'boolean',                                         default: 'true',           description: 'Whether users can manually close the toast.' },
  { prop: 'variant',     type: '"default" | "success" | "error" | "warning" | "info" | "loading" | "offline" | "update"', default: '"default"', description: 'Controls the icon and accent color.' },
  { prop: 'showProgress',type: 'boolean',                                         default: 'false',          description: 'Renders an animated countdown progress bar at bottom of card.' },
  { prop: 'progress',    type: 'number (0-100)',                                  default: 'undefined',      description: 'Explicit progress percentage bar.' },
  { prop: 'action',      type: '{ label: string; onClick: () => void }',          default: 'undefined',      description: 'Renders an inline action button on the toast.' },
]

const configApiRows: ApiRow[] = [
  { prop: 'max',      type: 'number',        default: '5',              description: 'Max visible toasts per position before oldest is smoothly dismissed.' },
  { prop: 'duration', type: 'number',        default: '5000',           description: 'Default duration for standard toasts in ms.' },
  { prop: 'position', type: 'ToastPosition', default: '"bottom-right"', description: 'Default spawn position.' },
]

const undoApiRows: ApiRow[] = [
  { prop: 'title',       type: 'string',            default: '—',      description: 'Primary text shown in the toast.' },
  { prop: 'description', type: 'string',            default: 'undefined', description: 'Secondary explanation line.' },
  { prop: 'duration',    type: 'number',            default: '5000',   description: 'Countdown timer in ms.' },
  { prop: 'undoLabel',   type: 'string',            default: '"Undo"', description: 'Custom text for the revert action button.' },
  { prop: 'onUndo',      type: '() => void | Promise<void>', default: '—', description: 'Callback executed immediately when user clicks Undo.' },
  { prop: 'onDismiss',   type: '() => void',        default: 'undefined', description: 'Callback executed if duration completes without undo.' },
]

const controllerApiRows: ApiRow[] = [
  { prop: 'setProgress(val, opts?)', type: '(n: number, opts?: Partial<ToastOptions>) => void', default: '—', description: 'Updates progress percentage (0-100) and toast text.' },
  { prop: 'next(opts)',               type: '(opts: Partial<ToastOptions>) => void',             default: '—', description: 'Advances to next workflow step in-place.' },
  { prop: 'done(opts?)',              type: '(opts?: Partial<ToastOptions>) => void',            default: '—', description: 'Completes operation and turns variant to success.' },
  { prop: 'fail(opts?)',              type: '(opts?: Partial<ToastOptions>) => void',            default: '—', description: 'Marks operation as failed and turns variant to error.' },
]

const promiseApiRows: ApiRow[] = [
  { prop: 'loading', type: 'ToastOptions',                                   default: '—', description: 'Toast config shown while the promise is pending.' },
  { prop: 'success', type: 'ToastOptions | ((data: T) => ToastOptions)',     default: '—', description: 'Config or factory for the resolved state.' },
  { prop: 'error',   type: 'ToastOptions | ((err: unknown) => ToastOptions)', default: '—', description: 'Config or factory for the rejected state.' },
]

// ── Changelog ───────────────────────────────────────
const changelog = [
  {
    version: 'v3.0.0',
    date: '2026-10-23',
    tag: 'latest',
    changes: [
      'Sonner-style collapsed stack: hover (desktop) or tap (mobile) to expand, timers pause while expanded',
      'GPU-only motion (transform / opacity), velocity-aware swipe, full-width safe-area layout on mobile',
      'Identical toasts merge into one with a ×N badge instead of stacking',
      'New toast.retry(): failed async work shows an error with a Retry button that re-runs it in place',
      'New toast.confirm(): awaitable inline confirmation, plus a secondary cancel button on any toast',
      'toast.error(err) accepts thrown errors directly; id option updates an existing toast in place',
      'Reactive toasts: title / description / progress accept refs, computed or getters',
      'New toast.flash(): toasts that survive reloads and full-page redirects',
      'Testing helpers: getToasts, expectToast, expectNoToasts, clickToastAction, resetToasts',
      'SSR-safe: ToastContainer renders nothing on the server',
      'Fix: toast.custom() now actually renders the passed component',
      'Config: richColors, theme (light / dark / system), expand, visibleToasts, group',
      'CSS shipped once (auto-injected); opt out with app.use(CreateFeatherToast, { injectStyles: false })',
      'Breaking: removed destructive (use error) and neutral (use default) variants',
    ],
  },
  {
    version: 'v2.1.0',
    date: '2026-09-16',
    tag: null,
    changes: [
      'Shadcn / Sonner style smooth in & out transitions with micro-scale & spring physics',
      'Stack limit support: configurable max visible toasts (toast.config({ max: 3 })) with smooth queue eviction',
      'New toast.undo() function: built-in animated countdown progress bar and instant undo callback',
      'New toast.step() controller: seamless multi-step progress workflow with in-place transitions',
      'String shorthand support across all variants: toast.success("Saved!")',
      'Smooth animated countdown line with auto-pause on hover / swipe',
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-09-15',
    tag: null,
    changes: [
      'Ultra-minimalist UI redesign — slimmer card, thinner borders, barely-there shadows',
      'Butter-smooth spring transitions with blur effect on enter/exit',
      '4 new unique variants: destructive, offline, update, neutral',
      'Offline variant: persistent like loading — no auto-dismiss',
      'Update variant: 8s duration for longer read time',
      'Neutral variant: 3s duration for passive notifications',
      'Close button always subtly visible (40% opacity)',
      'Reduced bundle target: ~4KB gzipped',
    ],
  },
  {
    version: 'v1.0.10',
    date: '2026-05-13',
    tag: null,
    changes: [
      'Align docs with plugin API: default duration is 5000ms',
      'Document dismissible in ToastOptions',
      'Use plugin-provided toast instance in demo app',
    ],
  },
  {
    version: 'v1.0.3',
    date: '2025-05-01',
    tag: null,
    changes: [
      'Add onDismiss and onAutoClose callbacks',
      'Fix timer not resuming after programmatic pause',
      'Reduce bundle by 0.4 KB — tree-shake unused icons',
    ],
  },
  {
    version: 'v1.0.2',
    date: '2025-03-18',
    tag: null,
    changes: [
      'Add toast.loading() variant',
      'Fix z-index conflict with Headless UI dialogs',
    ],
  },
  {
    version: 'v1.0.1',
    date: '2025-02-07',
    tag: null,
    changes: [
      'Add toast.promise() with success / error factory callbacks',
      'Add action button slot with onClick handler',
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-01-15',
    tag: 'initial',
    changes: [
      'Initial release: default, success, error, warning, info variants',
      'Spring-based enter / exit animations',
      'Swipe-to-dismiss with velocity detection',
      'Hover-to-pause auto-dismiss timer',
      'Full TypeScript support',
    ],
  },
]

// ── Toast triggers ──────────────────────────────────
function fireDefault() {
  toast({ title: 'Event Created', description: 'Your event has been successfully scheduled.', position: selectedPosition.value })
}
function fireSuccess() {
  toast.success({ title: 'Changes saved', description: 'Your profile has been updated successfully.', position: selectedPosition.value })
}
function fireError() {
  toast.error({ title: 'Something went wrong', description: 'There was an error processing your request. Please try again.', position: selectedPosition.value })
}
function fireWarning() {
  toast.warning({ title: 'Disk space low', description: 'You have less than 10% storage remaining.', position: selectedPosition.value })
}
function fireInfo() {
  toast.info({ title: 'New update available', description: 'Version 2.4.0 is ready to install.', position: selectedPosition.value })
}
function fireLoading() {
  toast.loading({ title: 'Uploading files...', description: 'Please wait while your files are being uploaded.', position: selectedPosition.value })
}
let flakyCalls = 0
function fireRetry() {
  flakyCalls = 0
  const flakyFetch = () =>
    new Promise<{ rows: number }>((resolve, reject) =>
      // Fails the first attempt so the Retry button shows up
      setTimeout(() => (++flakyCalls < 2 ? reject(new Error('Request timed out')) : resolve({ rows: 128 })), 1200),
    )
  toast.retry(flakyFetch, {
    loading: 'Syncing contacts...',
    success: (data) => `Synced ${data.rows} contacts`,
    position: selectedPosition.value,
  }).catch(() => {})
}
function fireCaughtError() {
  try {
    JSON.parse('{ invalid json')
  } catch (err) {
    toast.error(err)
  }
}
function fireReactive() {
  const pct = ref(0)
  const id = toast.loading({
    title: computed(() => (pct.value < 100 ? `Uploading… ${pct.value}%` : 'Upload complete')),
    progress: pct,
    position: selectedPosition.value,
  })
  const timer = setInterval(() => {
    pct.value = Math.min(100, pct.value + 7)
    if (pct.value === 100) {
      clearInterval(timer)
      toast.updateToast(id, { variant: 'success', duration: 3000 })
    }
  }, 150)
}
function fireFlash() {
  toast.flash.success({ title: 'Saved before reload', description: 'This toast survived a full page reload.' })
  setTimeout(() => window.location.reload(), 400)
}
function fireGrouped() {
  toast.warning({ title: 'Rate limit reached', position: selectedPosition.value })
}
function fireOffline() {
  const id = toast.offline({ title: 'You\'re offline', description: 'Check your network connection.', position: selectedPosition.value })
  // Auto-dismiss after 6s for demo purposes
  setTimeout(() => toast.dismiss(id), 6000)
}
function fireUpdate() {
  toast.update({
    title: 'Update available',
    description: 'Version 2.4.0 is ready to install.',
    position: selectedPosition.value,
    action: { label: 'Update', onClick: () => toast.success({ title: 'Updated!', position: selectedPosition.value }) },
  })
}
async function fireConfirm() {
  const ok = await toast.confirm({
    title: 'Delete 3 files?',
    description: 'This cannot be undone.',
    confirmLabel: 'Delete',
    position: selectedPosition.value,
  })
  if (ok) toast.success({ title: 'Files deleted', position: selectedPosition.value })
  else toast({ title: 'Kept your files', position: selectedPosition.value })
}
let saveCount = 0
function fireDedupe() {
  saveCount++
  toast.success({
    id: 'autosave',
    title: saveCount === 1 ? 'Draft saved' : `Draft saved ×${saveCount}`,
    description: 'Click again — it updates in place instead of stacking.',
    position: selectedPosition.value,
  })
}
const richColors = ref(false)
const expandStack = ref(false)
watch([richColors, expandStack], ([rich, expand]) => toast.config({ richColors: rich, expand }))
function fireBurst() {
  const p = selectedPosition.value
  toast.success({ title: 'Upload complete', description: 'report-q3.pdf', position: p })
  setTimeout(() => toast.info({ title: 'Synced to cloud', position: p }), 150)
  setTimeout(() => toast.warning({ title: 'Storage 90% full', description: 'Consider cleaning up old files.', position: p }), 300)
  setTimeout(() => toast.error({ title: 'Thumbnail failed', position: p }), 450)
}
function firePromise() {
  const fakeApiCall = new Promise<{ name: string }>((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.3 ? resolve({ name: 'Project Alpha' }) : reject(new Error('Network timeout'))
    }, 2500)
  })
  toast.promise(fakeApiCall, {
    loading: { title: 'Creating project...', description: 'Setting up your workspace.', position: selectedPosition.value },
    success: (data) => ({ title: `"${data.name}" created`, description: 'Your project is ready to go.', position: selectedPosition.value }),
    error: (err) => ({ title: 'Failed to create project', description: err instanceof Error ? err.message : 'Unknown error.', position: selectedPosition.value }),
  }).catch(() => {})
}
function fireWithAction() {
  toast({
    title: 'Message archived',
    description: 'The conversation has been moved to archive.',
    position: selectedPosition.value,
    action: {
      label: 'Undo',
      onClick: () => {
        toast.success({ title: 'Restored', description: 'Message moved back to inbox.', position: selectedPosition.value })
      },
    },
  })
}
function fireUndo() {
  toast.undo('File "invoice-2026.pdf" deleted', {
    description: 'Click undo within 5s or file will be removed permanently.',
    position: selectedPosition.value,
    duration: 5000,
    onUndo: () => {
      toast.success({ title: 'Restored', description: 'File "invoice-2026.pdf" restored to Documents.', position: selectedPosition.value })
    },
  })
}
function fireStep() {
  const step = toast.step({
    title: 'Step 1/3: Validating schema...',
    description: 'Checking schema constraints & integrity.',
    position: selectedPosition.value,
  })

  setTimeout(() => {
    step.next({
      title: 'Step 2/3: Deploying database migration...',
      description: 'Applying table schema patches to PostgreSQL.',
    })
  }, 1800)

  setTimeout(() => {
    step.done({
      title: 'Step 3/3: Migration complete!',
      description: 'Database updated successfully with zero downtime.',
    })
  }, 3800)
}
function fireProgress() {
  const p = toast.progress({
    title: 'Downloading dataset...',
    description: '0% completed',
    position: selectedPosition.value,
  })

  let current = 0
  const interval = setInterval(() => {
    current += 25
    if (current < 100) {
      p.setProgress(current, { description: `${current}% completed` })
    } else {
      clearInterval(interval)
      p.done({ title: 'Download complete!', description: '1.2 GB saved to Downloads.' })
    }
  }, 600)
}
function fireCopy() {
  toast.copy('https://feather-toast.dev/v2', {
    title: 'Share link copied!',
    description: 'Copied https://feather-toast.dev/v2 to clipboard.',
    position: selectedPosition.value,
  })
}
function fireCustom() {
  toast.custom({
    render: () =>
      h('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
        h('div', {
          style: 'width:28px;height:28px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;',
        }, 'JD'),
        h('div', [
          h('p', { style: 'font-size:13px;font-weight:500;margin:0;color:var(--toast-text);' }, 'Jane Doe invited you'),
          h('p', { style: 'font-size:11px;color:var(--toast-text-muted);margin:2px 0 0;' }, 'to collaborate on Project Alpha'),
        ]),
      ]),
    position: selectedPosition.value,
    duration: 5000,
  })
}
function fireNetwork() {
  // Simulate going offline then online to demonstrate the feature
  const controller = toast.network({
    offline: {
      title: 'Network Monitor Active',
      description: 'Your connection is being monitored. Disconnect Wi-Fi to test.',
      position: selectedPosition.value,
    },
    online: {
      title: 'Connection Restored',
      description: 'Network monitor detected you are back online.',
      position: selectedPosition.value,
    },
  })
  // Stop monitoring after 30s for demo purposes
  setTimeout(() => controller.stop(), 30000)
  toast.info({
    title: 'Network Monitor Started',
    description: 'Disconnect your internet to see the offline toast appear automatically.',
    position: selectedPosition.value,
    duration: 6000,
  })
}
</script>

<template>
  <div class="page">

    <!-- ── Full-width Top Nav ── -->
    <nav class="topnav">
      <div class="topnav__inner">

        <div class="topnav__left">
          <span class="topnav__feather" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
              <line x1="16" y1="8" x2="2" y2="22"/>
              <line x1="17.5" y1="15" x2="9" y2="15"/>
            </svg>
          </span>
          <span class="topnav__name">feather-toast-vue</span>
          <span class="topnav__ver">v2.1.0</span>
        </div>

        <div class="topnav__right">
          <span class="topnav__tag">Vue 3 · TypeScript · Zero deps</span>

          <!-- Theme toggle -->
          <button
            class="theme-toggle"
            @click="toggleTheme"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Sun: shown in dark mode -->
            <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="4"/>
              <path stroke-linecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <!-- Moon: shown in light mode -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </button>

          <a
            href="https://github.com/zin-ix/feather-toast-vue"
            target="_blank"
            rel="noopener noreferrer"
            class="topnav__github"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>

      </div>
    </nav>

    <!-- ── Layout: Sidebar + Main ── -->
    <div class="layout">

      <!-- Sidebar -->
      <aside class="sidebar">
        <p class="sidebar__heading">On this page</p>
        <nav class="sidebar__nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            :class="['sidebar__link', { 'sidebar__link--active': activeSection === item.id }]"
            @click="scrollTo(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
        <div class="sidebar__meta">
          <span>~4.5KB gzipped</span>
          <span class="sidebar__dot">·</span>
          <span>MIT</span>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">

        <!-- 00 Overview -->
        <section id="overview" class="section section--hero">
          <h1 class="hero__title">feather<span class="hero__accent">-toast</span>-vue</h1>
          <p class="hero__sub">
            Lightweight toast notifications with spring-based animations,
            promise support, swipe-to-dismiss, and a minimal footprint.
          </p>
          <div class="hero__chips">
            <span class="chip chip--green">~4.5KB gzipped</span>
            <span class="chip chip--dim">Zero dependencies</span>
            <span class="chip chip--dim">TypeScript</span>
            <span class="chip chip--dim">Vue 3</span>
          </div>
        </section>

        <!-- 01 Installation & Setup -->
        <section id="install" class="section">
          <div class="section__head">
            <span class="section__num">01</span>
            <h2 class="section__title">Installation & Setup</h2>
          </div>
          <p class="section__desc">Install feather-toast-vue using your preferred package manager:</p>

          <div class="code-block">
            <span class="code-block__prompt">$</span>
            <code class="code-block__text">npm install feather-toast-vue</code>
            <button
              class="code-block__copy"
              :class="{ 'code-block__copy--done': installCopied }"
              @click="copyInstall"
              :title="installCopied ? 'Copied!' : 'Copy'"
            >
              <svg v-if="!installCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
          <div class="alt-installs">
            <span class="alt-install">yarn add feather-toast-vue</span>
            <span class="alt-install">pnpm add feather-toast-vue</span>
          </div>

          <!-- Framework Setup Guides -->
          <div class="setup-guides" style="margin-top: 24px;">
            <div class="doc-card">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">Standard Vue 3 Setup (Vite / Webpack)</div>
                  <div class="doc-card__subtitle">Register the global plugin in your app entry file.</div>
                </div>
                <span class="doc-badge">main.ts</span>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ createApp }</span> <span class="t-kw">from</span> <span class="t-str">'vue'</span>
<span class="t-kw">import</span> <span class="t-w">App</span> <span class="t-kw">from</span> <span class="t-str">'./App.vue'</span>
<span class="t-kw">import</span> <span class="t-w">{ CreateFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">app</span> <span class="t-op">=</span> <span class="t-fn">createApp</span><span class="t-w">(App)</span>
<span class="t-w">app</span><span class="t-op">.</span><span class="t-fn">use</span><span class="t-w">(CreateFeatherToast)</span>
<span class="t-w">app</span><span class="t-op">.</span><span class="t-fn">mount</span><span class="t-w">(</span><span class="t-str">'#app'</span><span class="t-w">)</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_SETUP_VUE3, 'setup-vue3')"
                >
                  {{ copiedSnippetId === 'setup-vue3' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <div class="doc-card" style="margin-top: 16px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">Nuxt 3 Client Plugin</div>
                  <div class="doc-card__subtitle">Mount safely on the client side in Nuxt 3.</div>
                </div>
                <span class="doc-badge">plugins/toast.client.ts</span>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ defineNuxtPlugin }</span> <span class="t-kw">from</span> <span class="t-str">'#app'</span>
<span class="t-kw">import</span> <span class="t-w">{ CreateFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">export default</span> <span class="t-fn">defineNuxtPlugin</span><span class="t-w">((nuxtApp) => {</span>
  <span class="t-w">nuxtApp.vueApp</span><span class="t-op">.</span><span class="t-fn">use</span><span class="t-w">(CreateFeatherToast)</span>
<span class="t-w">})</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_SETUP_NUXT, 'setup-nuxt')"
                >
                  {{ copiedSnippetId === 'setup-nuxt' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 02 Quick Start -->
        <section id="quickstart" class="section">
          <div class="section__head">
            <span class="section__num">02</span>
            <h2 class="section__title">Quick Start</h2>
          </div>
          <p class="section__desc">Import and fire toasts from any Vue component or composable:</p>

          <div class="doc-card">
            <div class="doc-card__header">
              <div>
                <div class="doc-card__title">Component Usage</div>
                <div class="doc-card__subtitle">Use string shorthand or pass a full options object.</div>
              </div>
              <button class="test-btn" @click="fireSuccess">Test in Browser</button>
            </div>
            <div class="doc-card__code">
              <pre class="pre"><code><span class="t-kw">&lt;script setup lang="ts"&gt;</span>
<span class="t-kw">import</span> <span class="t-w">{ useFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">{ toast }</span> <span class="t-op">=</span> <span class="t-fn">useFeatherToast</span><span class="t-w">()</span>

<span class="t-kw">function</span> <span class="t-fn">onSave</span><span class="t-w">() {</span>
  <span class="t-comment">// 1. String shorthand</span>
  <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">success</span><span class="t-w">(</span><span class="t-str">'Changes saved successfully!'</span><span class="t-w">)</span>

  <span class="t-comment">// 2. Detailed options with title and description</span>
  <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">error</span><span class="t-w">({</span>
    <span class="t-w">title:</span> <span class="t-str">'Connection timeout'</span><span class="t-w">,</span>
    <span class="t-w">description:</span> <span class="t-str">'Server is temporarily unreachable. Try again.'</span><span class="t-w">,</span>
  <span class="t-w">})</span>
<span class="t-w">}</span>
<span class="t-kw">&lt;/script&gt;</span></code></pre>
              <button
                class="code-copy-btn"
                @click="copySnippet(SNIPPET_QUICKSTART, 'quick-code')"
              >
                {{ copiedSnippetId === 'quick-code' ? 'Copied!' : 'Copy Code' }}
              </button>
            </div>
          </div>
        </section>

        <!-- 03 Position & Stack Limit -->
        <section id="position" class="section">
          <div class="section__head">
            <span class="section__num">03</span>
            <h2 class="section__title">Position & Stack Limit</h2>
          </div>
          <p class="section__desc">Select an anchor position for the demo toasts below:</p>
          <div class="pos-grid">
            <button
              v-for="pos in positions"
              :key="pos.value"
              :class="['pos-btn', { 'pos-btn--active': selectedPosition === pos.value }]"
              @click="selectedPosition = pos.value"
            >
              {{ pos.label }}
            </button>
          </div>

          <p class="section__desc" style="margin-top: 24px; margin-bottom: 8px">
            Max visible stack limit (auto-evicts oldest toasts smoothly):
          </p>
          <div class="pos-grid">
            <button
              v-for="lim in stackLimits"
              :key="lim.value"
              :class="['pos-btn', { 'pos-btn--active': selectedMaxStack === lim.value }]"
              @click="selectedMaxStack = lim.value"
            >
              {{ lim.label }}
            </button>
          </div>
        </section>

        <!-- 04 Variants Playground -->
        <section id="variants" class="section">
          <div class="section__head">
            <span class="section__num">04</span>
            <h2 class="section__title">Variants Playground</h2>
          </div>
          <p class="section__desc">Click any variant to preview its icon, accent styling, and animations:</p>
          <div class="variant-grid">
            <button class="vbtn" @click="fireDefault">
              <span class="vbtn__dot" style="background:var(--muted)"></span>
              <span class="vbtn__label">Default</span>
            </button>
            <button class="vbtn" @click="fireSuccess">
              <span class="vbtn__dot" style="background:#16a34a"></span>
              <span class="vbtn__label">Success</span>
            </button>
            <button class="vbtn" @click="fireError">
              <span class="vbtn__dot" style="background:#dc2626"></span>
              <span class="vbtn__label">Error</span>
            </button>
            <button class="vbtn" @click="fireWarning">
              <span class="vbtn__dot" style="background:#d97706"></span>
              <span class="vbtn__label">Warning</span>
            </button>
            <button class="vbtn" @click="fireInfo">
              <span class="vbtn__dot" style="background:#2563eb"></span>
              <span class="vbtn__label">Info</span>
            </button>
            <button class="vbtn" @click="fireLoading">
              <span class="vbtn__dot vbtn__dot--spin"></span>
              <span class="vbtn__label">Loading</span>
            </button>
            <button class="vbtn" @click="fireRetry">
              <span class="vbtn__dot" style="background:#dc2626"></span>
              <span class="vbtn__label">Retry</span>
            </button>
            <button class="vbtn" @click="fireOffline">
              <span class="vbtn__dot" style="background:#6b7280"></span>
              <span class="vbtn__label">Offline</span>
            </button>
            <button class="vbtn" @click="fireUpdate">
              <span class="vbtn__dot" style="background:#8b5cf6"></span>
              <span class="vbtn__label">Update</span>
            </button>
            <button class="vbtn" @click="fireCaughtError">
              <span class="vbtn__dot" style="background:#dc2626"></span>
              <span class="vbtn__label">toast.error(err)</span>
            </button>
            <button class="vbtn" @click="fireGrouped">
              <span class="vbtn__dot" style="background:#d97706"></span>
              <span class="vbtn__label">Group (click ×3)</span>
            </button>
            <button class="vbtn" @click="fireReactive">
              <span class="vbtn__dot" style="background:#2563eb"></span>
              <span class="vbtn__label">Reactive (ref)</span>
            </button>
            <button class="vbtn" @click="fireFlash">
              <span class="vbtn__dot" style="background:#16a34a"></span>
              <span class="vbtn__label">Flash + reload</span>
            </button>
            <button class="vbtn" @click="fireConfirm">
              <span class="vbtn__dot" style="background:#d97706"></span>
              <span class="vbtn__label">Confirm</span>
            </button>
            <button class="vbtn" @click="fireDedupe">
              <span class="vbtn__dot" style="background:var(--muted)"></span>
              <span class="vbtn__label">Dedupe (same id)</span>
            </button>
          </div>
          <p class="section__desc">Stack behaviour:</p>
          <div class="variant-grid">
            <button class="vbtn" @click="richColors = !richColors">
              <span class="vbtn__dot" :style="{ background: richColors ? '#16a34a' : 'var(--muted)' }"></span>
              <span class="vbtn__label">Rich colors: {{ richColors ? 'on' : 'off' }}</span>
            </button>
            <button class="vbtn" @click="expandStack = !expandStack">
              <span class="vbtn__dot" :style="{ background: expandStack ? '#16a34a' : 'var(--muted)' }"></span>
              <span class="vbtn__label">Always expanded: {{ expandStack ? 'on' : 'off' }}</span>
            </button>
            <button class="vbtn" @click="fireBurst">
              <span class="vbtn__dot" style="background:#2563eb"></span>
              <span class="vbtn__label">Fire 4 at once</span>
            </button>
          </div>
        </section>

        <!-- 05 Feature Guides & Code Recipes -->
        <section id="features" class="section">
          <div class="section__head">
            <span class="section__num">05</span>
            <h2 class="section__title">Feature Guides & Code Recipes</h2>
          </div>
          <p class="section__desc">
            Explore and copy production-ready workflows built specifically for Vue developers.
          </p>

          <div class="features-list">

            <!-- Feature 1: toast.undo() -->
            <div class="doc-card">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">1. Interactive Undo Pattern (<code>toast.undo</code>)</div>
                  <div class="doc-card__subtitle">Renders a live animated countdown bar with an instant Undo revert button.</div>
                </div>
                <button class="test-btn" @click="fireUndo">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">undo</span><span class="t-w">(</span><span class="t-str">'File "invoice-2026.pdf" deleted'</span><span class="t-w">, {</span>
  <span class="t-w">description:</span> <span class="t-str">'Click undo within 5 seconds to revert.'</span><span class="t-w">,</span>
  <span class="t-w">duration:</span> <span class="t-num">5000</span><span class="t-w">,</span>
  <span class="t-w">undoLabel:</span> <span class="t-str">'Undo'</span><span class="t-w">,</span>
  <span class="t-w">onUndo:</span> <span class="t-kw">async</span> <span class="t-w">() =&gt; {</span>
    <span class="t-kw">await</span> <span class="t-fn">restoreFile</span><span class="t-w">()</span>
    <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">success</span><span class="t-w">(</span><span class="t-str">'File restored to Documents'</span><span class="t-w">)</span>
  <span class="t-w">},</span>
  <span class="t-w">onDismiss:</span> <span class="t-w">() =&gt; {</span>
    <span class="t-comment">// Called if user did not undo before countdown ended</span>
    <span class="t-fn">permanentlyDeleteFromDatabase</span><span class="t-w">()</span>
  <span class="t-w">},</span>
<span class="t-w">})</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_UNDO, 'feat-undo')"
                >
                  {{ copiedSnippetId === 'feat-undo' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Feature 2: toast.step() -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">2. Multi-Step Workflows (<code>toast.step</code>)</div>
                  <div class="doc-card__subtitle">Transition a single toast card through sequential stages in-place with zero flicker.</div>
                </div>
                <button class="test-btn" @click="fireStep">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">const</span> <span class="t-w">workflow</span> <span class="t-op">=</span> <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">step</span><span class="t-w">({</span>
  <span class="t-w">title:</span> <span class="t-str">'Step 1/3: Validating schema...'</span><span class="t-w">,</span>
  <span class="t-w">description:</span> <span class="t-str">'Checking data integrity.'</span><span class="t-w">,</span>
<span class="t-w">})</span>

<span class="t-comment">// Advance smoothly to step 2</span>
<span class="t-fn">setTimeout</span><span class="t-w">(() =&gt; {</span>
  <span class="t-w">workflow</span><span class="t-op">.</span><span class="t-fn">next</span><span class="t-w">({</span>
    <span class="t-w">title:</span> <span class="t-str">'Step 2/3: Deploying database migration...'</span><span class="t-w">,</span>
    <span class="t-w">description:</span> <span class="t-str">'Applying schema patches to PostgreSQL.'</span><span class="t-w">,</span>
  <span class="t-w">})</span>
<span class="t-w">},</span> <span class="t-num">1800</span><span class="t-w">)</span>

<span class="t-comment">// Complete the workflow</span>
<span class="t-fn">setTimeout</span><span class="t-w">(() =&gt; {</span>
  <span class="t-w">workflow</span><span class="t-op">.</span><span class="t-fn">done</span><span class="t-w">({</span>
    <span class="t-w">title:</span> <span class="t-str">'Step 3/3: Migration complete!'</span><span class="t-w">,</span>
    <span class="t-w">description:</span> <span class="t-str">'Database updated with zero downtime.'</span><span class="t-w">,</span>
  <span class="t-w">})</span>
<span class="t-w">},</span> <span class="t-num">3800</span><span class="t-w">)</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_STEP, 'feat-step')"
                >
                  {{ copiedSnippetId === 'feat-step' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Feature 3: toast.progress() -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">3. Dynamic Real-Time Progress Bar (<code>toast.progress</code>)</div>
                  <div class="doc-card__subtitle">Update progress bar percentage dynamically for uploads, downloads, or background jobs.</div>
                </div>
                <button class="test-btn" @click="fireProgress">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">const</span> <span class="t-w">download</span> <span class="t-op">=</span> <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">progress</span><span class="t-w">({</span>
  <span class="t-w">title:</span> <span class="t-str">'Downloading dataset...'</span><span class="t-w">,</span>
  <span class="t-w">description:</span> <span class="t-str">'0% completed'</span><span class="t-w">,</span>
<span class="t-w">})</span>

<span class="t-comment">// Update percentage smoothly (0 to 100)</span>
<span class="t-w">download</span><span class="t-op">.</span><span class="t-fn">setProgress</span><span class="t-w">(</span><span class="t-num">45</span><span class="t-w">, {</span> <span class="t-w">description:</span> <span class="t-str">'45% completed (24 MB/s)'</span> <span class="t-w">})</span>
<span class="t-w">download</span><span class="t-op">.</span><span class="t-fn">setProgress</span><span class="t-w">(</span><span class="t-num">80</span><span class="t-w">, {</span> <span class="t-w">description:</span> <span class="t-str">'80% completed'</span> <span class="t-w">})</span>

<span class="t-comment">// Mark as finished</span>
<span class="t-w">download</span><span class="t-op">.</span><span class="t-fn">done</span><span class="t-w">(</span><span class="t-str">'Download complete!'</span><span class="t-w">, {</span>
  <span class="t-w">description:</span> <span class="t-str">'1.2 GB saved to Downloads folder.'</span><span class="t-w">,</span>
<span class="t-w">})</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_PROGRESS, 'feat-prog')"
                >
                  {{ copiedSnippetId === 'feat-prog' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Feature 4: toast.copy() -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">4. One-Line Clipboard Copy (<code>toast.copy</code>)</div>
                  <div class="doc-card__subtitle">Copy text to system clipboard with built-in instant feedback toast.</div>
                </div>
                <button class="test-btn" @click="fireCopy">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-comment">// Copies to clipboard and displays feedback toast automatically</span>
<span class="t-kw">await</span> <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">copy</span><span class="t-w">(</span><span class="t-str">'https://feather-toast.dev/v2'</span><span class="t-w">, {</span>
  <span class="t-w">title:</span> <span class="t-str">'Share link copied!'</span><span class="t-w">,</span>
  <span class="t-w">description:</span> <span class="t-str">'Copied https://feather-toast.dev/v2 to clipboard.'</span><span class="t-w">,</span>
<span class="t-w">})</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_COPY, 'feat-copy')"
                >
                  {{ copiedSnippetId === 'feat-copy' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Feature 5: toast.custom() -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">5. Custom Vue VNodes & Components (<code>toast.custom</code>)</div>
                  <div class="doc-card__subtitle">Render custom user cards, avatars, interactive inputs, or JSX inside the toast.</div>
                </div>
                <button class="test-btn" @click="fireCustom">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ h }</span> <span class="t-kw">from</span> <span class="t-str">'vue'</span>

<span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">custom</span><span class="t-w">({</span>
  <span class="t-w">render:</span> <span class="t-w">() =&gt;</span>
    <span class="t-fn">h</span><span class="t-w">(</span><span class="t-str">'div'</span><span class="t-w">, {</span> <span class="t-w">style:</span> <span class="t-str">'display: flex; align-items: center; gap: 10px;'</span> <span class="t-w">}, [</span>
      <span class="t-fn">h</span><span class="t-w">(</span><span class="t-str">'div'</span><span class="t-w">, {</span> <span class="t-w">style:</span> <span class="t-str">'width:28px;height:28px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;'</span> <span class="t-w">},</span> <span class="t-str">'JD'</span><span class="t-w">),</span>
      <span class="t-fn">h</span><span class="t-w">(</span><span class="t-str">'div'</span><span class="t-w">, [</span>
        <span class="t-fn">h</span><span class="t-w">(</span><span class="t-str">'p'</span><span class="t-w">, {</span> <span class="t-w">style:</span> <span class="t-str">'font-size:13px;font-weight:500;margin:0;'</span> <span class="t-w">},</span> <span class="t-str">'Jane Doe invited you'</span><span class="t-w">),</span>
        <span class="t-fn">h</span><span class="t-w">(</span><span class="t-str">'p'</span><span class="t-w">, {</span> <span class="t-w">style:</span> <span class="t-str">'font-size:11px;color:var(--toast-text-muted);margin:2px 0 0;'</span> <span class="t-w">},</span> <span class="t-str">'to collaborate on Project Alpha'</span><span class="t-w">),</span>
      <span class="t-w">]),</span>
    <span class="t-w">]),</span>
  <span class="t-w">duration:</span> <span class="t-num">5000</span><span class="t-w">,</span>
<span class="t-w">})</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_CUSTOM, 'feat-custom')"
                >
                  {{ copiedSnippetId === 'feat-custom' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Feature 6: toast.promise() -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">6. Promise Tracking (<code>toast.promise</code>)</div>
                  <div class="doc-card__subtitle">Automatically manages pending loading state and resolves to success or error.</div>
                </div>
                <button class="test-btn" @click="firePromise">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">const</span> <span class="t-w">savePromise</span> <span class="t-op">=</span> <span class="t-fn">fetch</span><span class="t-w">(</span><span class="t-str">'/api/save'</span><span class="t-w">, {</span> <span class="t-w">method:</span> <span class="t-str">'POST'</span> <span class="t-w">})</span>

<span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">promise</span><span class="t-w">(savePromise, {</span>
  <span class="t-w">loading: {</span>
    <span class="t-w">title:</span> <span class="t-str">'Creating project...'</span><span class="t-w">,</span>
    <span class="t-w">description:</span> <span class="t-str">'Setting up workspace.'</span><span class="t-w">,</span>
  <span class="t-w">},</span>
  <span class="t-w">success: (data) =&gt; ({</span>
    <span class="t-w">title:</span> <span class="t-str">'Project created!'</span><span class="t-w">,</span>
    <span class="t-w">description:</span> <span class="t-str">'Your workspace is ready to go.'</span><span class="t-w">,</span>
  <span class="t-w">}),</span>
  <span class="t-w">error: (err) =&gt; ({</span>
    <span class="t-w">title:</span> <span class="t-str">'Failed to create project'</span><span class="t-w">,</span>
    <span class="t-w">description:</span> <span class="t-w">err.message,</span>
  <span class="t-w">}),</span>
<span class="t-w">})</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_PROMISE, 'feat-prom')"
                >
                  {{ copiedSnippetId === 'feat-prom' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Feature 7: Global Configuration -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">7. Global Configuration (<code>toast.config</code>)</div>
                  <div class="doc-card__subtitle">Set stack limits, default durations, and positions across your entire app.</div>
                </div>
                <span class="doc-badge">Global</span>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ useFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">{ toast }</span> <span class="t-op">=</span> <span class="t-fn">useFeatherToast</span><span class="t-w">()</span>

<span class="t-comment">// Set global config</span>
<span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">config</span><span class="t-w">({</span>
  <span class="t-w">max:</span> <span class="t-num">3</span><span class="t-w">,</span>                <span class="t-comment">// Max visible stack limit per position</span>
  <span class="t-w">duration:</span> <span class="t-num">4000</span><span class="t-w">,</span>        <span class="t-comment">// Default timeout in ms</span>
  <span class="t-w">position:</span> <span class="t-str">'bottom-right'</span><span class="t-w">,</span>
<span class="t-w">})</span>

<span class="t-comment">// Read active configuration</span>
<span class="t-kw">const</span> <span class="t-w">current</span> <span class="t-op">=</span> <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">getConfig</span><span class="t-w">()</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(SNIPPET_CONFIG, 'feat-conf')"
                >
                  {{ copiedSnippetId === 'feat-conf' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

          </div>
        </section>

        <!-- 06 Network Monitor (toast.network) -->
        <section id="network" class="section">
          <div class="section__head">
            <span class="section__num">06</span>
            <h2 class="section__title">Network Monitor</h2>
          </div>
          <p class="section__desc">
            <code>toast.network()</code> automatically listens to the browser's online and offline events.
            It shows a persistent offline toast the moment your user loses internet connectivity,
            then replaces it with a success toast when the connection is restored.
            No third-party dependency is required — it uses the native <code>window.navigator.onLine</code>
            and browser event listeners directly.
          </p>

          <div class="features-list">
            <!-- How it works -->
            <div class="doc-card">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">How It Works</div>
                  <div class="doc-card__subtitle">
                    Register once per Vue component or App-level composable. Returns a <code>stop()</code> handle
                    to clean up listeners when the component is destroyed.
                  </div>
                </div>
                <button class="test-btn" @click="fireNetwork">Test in Browser</button>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ onMounted, onUnmounted }</span> <span class="t-kw">from</span> <span class="t-str">'vue'</span>
<span class="t-kw">import</span> <span class="t-w">{ useFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>
<span class="t-kw">import type</span> <span class="t-w">{ NetworkToastController }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">{ toast }</span> <span class="t-op">=</span> <span class="t-fn">useFeatherToast</span><span class="t-w">()</span>

<span class="t-kw">let</span> <span class="t-w">networkMonitor</span><span class="t-op">:</span> <span class="t-w">NetworkToastController | null</span> <span class="t-op">=</span> <span class="t-w">null</span>

<span class="t-fn">onMounted</span><span class="t-w">(() => {</span>
  <span class="t-w">networkMonitor</span> <span class="t-op">=</span> <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">network</span><span class="t-w">({</span>
    <span class="t-w">offline: {</span>
      <span class="t-w">title:</span> <span class="t-str">'You are offline'</span><span class="t-w">,</span>
      <span class="t-w">description:</span> <span class="t-str">'Check your internet connection.'</span><span class="t-w">,</span>
    <span class="t-w">},</span>
    <span class="t-w">online: {</span>
      <span class="t-w">title:</span> <span class="t-str">'Back online'</span><span class="t-w">,</span>
      <span class="t-w">description:</span> <span class="t-str">'Your internet connection was restored.'</span><span class="t-w">,</span>
    <span class="t-w">},</span>
  <span class="t-w">})</span>
<span class="t-w">})</span>

<span class="t-fn">onUnmounted</span><span class="t-w">(() => {</span>
  <span class="t-w">networkMonitor?.</span><span class="t-fn">stop</span><span class="t-w">()</span>
<span class="t-w">})</span></code></pre>
                <button class="code-copy-btn" @click="copySnippet(SNIPPET_NETWORK, 'feat-net')">
                  {{ copiedSnippetId === 'feat-net' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- App-level registration -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">App-Level Registration (Recommended)</div>
                  <div class="doc-card__subtitle">
                    Register once in your root <code>App.vue</code> to monitor connectivity globally
                    across the entire application lifecycle.
                  </div>
                </div>
                <span class="doc-badge">App.vue</span>
              </div>
              <div class="doc-card__code">
                <pre class="pre"><code><span class="t-comment">// App.vue — register network monitor once for the whole app</span>
<span class="t-kw">&lt;script setup lang="ts"&gt;</span>
<span class="t-kw">import</span> <span class="t-w">{ onMounted, onUnmounted }</span> <span class="t-kw">from</span> <span class="t-str">'vue'</span>
<span class="t-kw">import</span> <span class="t-w">{ useFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">{ toast }</span> <span class="t-op">=</span> <span class="t-fn">useFeatherToast</span><span class="t-w">()</span>
<span class="t-kw">let</span> <span class="t-w">monitor</span> <span class="t-op">=</span> <span class="t-w">null</span>

<span class="t-fn">onMounted</span><span class="t-w">(() => {</span> <span class="t-w">monitor</span> <span class="t-op">=</span> <span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">network</span><span class="t-w">() })</span>
<span class="t-fn">onUnmounted</span><span class="t-w">(() => {</span> <span class="t-w">monitor?.</span><span class="t-fn">stop</span><span class="t-w">() })</span>
<span class="t-kw">&lt;/script&gt;</span></code></pre>
                <button
                  class="code-copy-btn"
                  @click="copySnippet(`// App.vue\nimport { onMounted, onUnmounted } from 'vue'\nimport { useFeatherToast } from 'feather-toast-vue'\n\nconst { toast } = useFeatherToast()\nlet monitor = null\n\nonMounted(() => { monitor = toast.network() })\nonUnmounted(() => { monitor?.stop() })`, 'feat-net-app')"
                >
                  {{ copiedSnippetId === 'feat-net-app' ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>
            </div>

            <!-- Options reference -->
            <div class="doc-card" style="margin-top: 20px;">
              <div class="doc-card__header">
                <div>
                  <div class="doc-card__title">NetworkToastOptions Reference</div>
                  <div class="doc-card__subtitle">
                    Both <code>offline</code> and <code>online</code> accept any <code>ToastOptions</code> field.
                  </div>
                </div>
              </div>
              <div class="api-table-wrap" style="border-radius:0;border:none;border-top:1px solid var(--border);">
                <table class="api-table">
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code class="api-prop">offline</code></td>
                      <td><code class="api-type">Partial&lt;ToastOptions&gt;</code></td>
                      <td class="api-default">Built-in</td>
                      <td class="api-desc">Options for the toast shown when connection is lost. Defaults to a persistent non-dismissible offline variant.</td>
                    </tr>
                    <tr>
                      <td><code class="api-prop">online</code></td>
                      <td><code class="api-type">Partial&lt;ToastOptions&gt; | null</code></td>
                      <td class="api-default">Built-in</td>
                      <td class="api-desc">Options for the toast shown when connection is restored. Set to <code>null</code> to suppress the online toast.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- 07 API Reference -->
        <section id="api" class="section">
          <div class="section__head">
            <span class="section__num">07</span>
            <h2 class="section__title">API Reference</h2>
          </div>

          <p class="api__subtitle">ToastOptions</p>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in apiRows" :key="row.prop">
                  <td><code class="api-prop">{{ row.prop }}</code></td>
                  <td><code class="api-type">{{ row.type }}</code></td>
                  <td><code class="api-default">{{ row.default }}</code></td>
                  <td class="api-desc">{{ row.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="api__subtitle" style="margin-top: 28px">ToastConfig (toast.config({ ... }))</p>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in configApiRows" :key="row.prop">
                  <td><code class="api-prop">{{ row.prop }}</code></td>
                  <td><code class="api-type">{{ row.type }}</code></td>
                  <td><code class="api-default">{{ row.default }}</code></td>
                  <td class="api-desc">{{ row.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="api__subtitle" style="margin-top: 28px">UndoToastOptions (toast.undo(title, options))</p>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in undoApiRows" :key="row.prop">
                  <td><code class="api-prop">{{ row.prop }}</code></td>
                  <td><code class="api-type">{{ row.type }}</code></td>
                  <td><code class="api-default">{{ row.default }}</code></td>
                  <td class="api-desc">{{ row.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="api__subtitle" style="margin-top: 28px">Workflow & Progress Controllers</p>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Signature</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in controllerApiRows" :key="row.prop">
                  <td><code class="api-prop">{{ row.prop }}</code></td>
                  <td><code class="api-type">{{ row.type }}</code></td>
                  <td><code class="api-default">{{ row.default }}</code></td>
                  <td class="api-desc">{{ row.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="api__subtitle" style="margin-top: 28px">ToastPromiseOptions&lt;T&gt;</p>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in promiseApiRows" :key="row.prop">
                  <td><code class="api-prop">{{ row.prop }}</code></td>
                  <td><code class="api-type">{{ row.type }}</code></td>
                  <td><code class="api-default">{{ row.default }}</code></td>
                  <td class="api-desc">{{ row.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 07 Changelog -->
        <section id="changelog" class="section">
          <div class="section__head">
            <span class="section__num">07</span>
            <h2 class="section__title">Changelog</h2>
          </div>

          <div class="changelog">
            <div
              v-for="(entry, i) in changelog"
              :key="entry.version"
              class="cl-entry"
            >
              <div class="cl-rail">
                <div class="cl-dot" :class="{ 'cl-dot--latest': entry.tag === 'latest' }"></div>
                <div v-if="i < changelog.length - 1" class="cl-line"></div>
              </div>
              <div class="cl-body">
                <div class="cl-header">
                  <span class="cl-version">{{ entry.version }}</span>
                  <span v-if="entry.tag === 'latest'" class="cl-tag cl-tag--latest">latest</span>
                  <span v-if="entry.tag === 'initial'" class="cl-tag cl-tag--initial">initial</span>
                  <span class="cl-date">{{ entry.date }}</span>
                </div>
                <ul class="cl-list">
                  <li v-for="change in entry.changes" :key="change" class="cl-item">
                    <span class="cl-bullet">—</span>
                    {{ change }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="demo-footer">
          <p>Swipe horizontally to dismiss · Hover to pause timer</p>
        </footer>

      </main>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Theme tokens ── */
:root,
[data-theme="dark"] {
  --black:   #000000;
  --surface: #0a0a0a;
  --panel:   #111111;
  --border:  #1e1e1e;
  --border2: #2a2a2a;
  --muted:   #3d3d3d;
  --dim:     #666666;
  --mid:     #888888;
  --soft:    #aaaaaa;
  --text:    #f0f0f0;
  --accent:  #e8e8e8;
  --green:   #22c55e;
  --nav-bg:  #000000;
  --nav-h:   52px;
  --side-w:  220px;
}

[data-theme="light"] {
  --black:   #ffffff;
  --surface: #f6f6f6;
  --panel:   #eeeeee;
  --border:  #e0e0e0;
  --border2: #d0d0d0;
  --muted:   #bbbbbb;
  --dim:     #999999;
  --mid:     #777777;
  --soft:    #555555;
  --text:    #111111;
  --accent:  #1a1a1a;
  --green:   #16a34a;
  --nav-bg:  #ffffff;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
  background: var(--black);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  transition: background 0.2s, color 0.2s;
}

/* ── Top Nav ── */
.topnav {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border);
  height: var(--nav-h);
  transition: background 0.2s, border-color 0.2s;
}

.topnav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 28px;
}

.topnav__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topnav__feather { font-size: 18px; }

.topnav__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.topnav__ver {
  font-size: 10px;
  font-weight: 500;
  color: var(--dim);
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 4px;
  padding: 2px 7px;
  letter-spacing: 0.02em;
}

.topnav__right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topnav__tag {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.03em;
}

/* ── Theme Toggle ── */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--dim);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.theme-toggle:hover {
  color: var(--text);
  border-color: var(--muted);
  background: var(--panel);
}

.theme-toggle svg {
  width: 14px;
  height: 14px;
}

/* ── GitHub ── */
.topnav__github {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: var(--soft);
  text-decoration: none;
  padding: 6px 14px;
  border: 1px solid var(--border2);
  border-radius: 6px;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.topnav__github:hover {
  color: var(--text);
  border-color: var(--muted);
  background: var(--panel);
}

.topnav__github svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* ── Layout ── */
.layout {
  display: flex;
  min-height: calc(100vh - var(--nav-h));
}

/* ── Sidebar ── */
.sidebar {
  position: sticky;
  top: var(--nav-h);
  width: var(--side-w);
  flex-shrink: 0;
  height: calc(100vh - var(--nav-h));
  overflow-y: auto;
  border-right: 1px solid var(--border);
  padding: 28px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s;
}

.sidebar__heading {
  font-size: 9px;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0 20px 10px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
}

.sidebar__link {
  display: block;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: 11px;
  font-weight: 400;
  color: var(--dim);
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  border-radius: 0 5px 5px 0;
  padding: 7px 12px;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.sidebar__link:hover {
  color: var(--soft);
  background: var(--panel);
}

.sidebar__link--active {
  color: var(--text);
  background: var(--panel);
  border-left-color: var(--text);
}

.sidebar__meta {
  margin-top: auto;
  padding: 20px 20px 0;
  font-size: 10px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar__dot { color: var(--border2); }

/* ── Main ── */
.main {
  flex: 1;
  min-width: 0;
  padding: 56px 60px 80px;
  max-width: 760px;
}

/* ── Sections ── */
.section {
  margin-bottom: 64px;
  scroll-margin-top: calc(var(--nav-h) + 24px);
}

.section__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.section__num {
  font-size: 10px;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.08em;
}

.section__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.section__desc {
  font-size: 12px;
  color: var(--dim);
  margin-bottom: 16px;
  line-height: 1.6;
}

/* ── Hero ── */
.section--hero {
  padding-top: 8px;
  margin-bottom: 72px;
}

.hero__title {
  font-size: 44px;
  font-weight: 300;
  color: var(--text);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 18px;
}

.hero__accent { color: var(--dim); }

.hero__sub {
  font-size: 13px;
  color: var(--mid);
  line-height: 1.8;
  max-width: 440px;
  margin-bottom: 24px;
}

.hero__chips { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  font-family: inherit;
  font-size: 10px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.05em;
  border: 1px solid var(--border2);
}

.chip--green {
  color: var(--green);
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}

.chip--dim { color: var(--muted); background: var(--panel); }

/* ── Code Block ── */
.code-block {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 13px 16px;
  margin-bottom: 10px;
  transition: background 0.2s, border-color 0.2s;
}

.code-block__prompt { font-size: 12px; color: var(--muted); user-select: none; }
.code-block__text { flex: 1; font-family: inherit; font-size: 13px; color: var(--accent); }

.code-block__copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.code-block__copy:hover { background: var(--border); color: var(--soft); }
.code-block__copy--done { color: var(--green); }
.code-block__copy svg { width: 13px; height: 13px; }

.alt-installs { display: flex; gap: 16px; }
.alt-install { font-size: 11px; color: var(--muted); }

/* ── Steps ── */
.step { margin-bottom: 20px; }

.step__label { font-size: 11px; color: var(--dim); margin-bottom: 8px; letter-spacing: 0.02em; }

.ic {
  font-family: inherit;
  font-size: 10px;
  color: var(--soft);
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 3px;
  padding: 1px 5px;
}

.pre {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 18px;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.8;
  white-space: pre;
  overflow-x: auto;
  transition: background 0.2s, border-color 0.2s;
}

/* Syntax — kept dark regardless of page theme for readability */
[data-theme="light"] .pre { background: #1a1a1a; border-color: #2a2a2a; }

.t-kw  { color: #c792ea; }
.t-str { color: #c3e88d; }
.t-fn  { color: #82aaff; }
.t-op  { color: #89ddff; }
.t-w   { color: #eeffff; }

/* ── Position Grid ── */
.pos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }

.pos-btn {
  font-family: inherit;
  font-size: 11px;
  font-weight: 400;
  color: var(--dim);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 8px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.pos-btn:hover { color: var(--soft); border-color: var(--border2); }

.pos-btn--active {
  color: var(--text);
  border-color: var(--muted);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--muted);
}

/* ── Variant Grid ── */
.variant-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }

.vbtn {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: inherit;
  font-size: 12px;
  color: var(--soft);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.vbtn:hover { background: var(--surface); border-color: var(--border2); }
.vbtn:active { transform: scale(0.97); }

.vbtn__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.vbtn__dot--spin {
  background: transparent;
  border: 1.5px solid var(--muted);
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Documentation Cards & Recipes ── */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.doc-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.doc-card:hover {
  border-color: var(--border2);
}

.doc-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.doc-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-card__title code {
  font-family: inherit;
  font-size: 11px;
  color: #82aaff;
  background: rgba(130, 170, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.doc-card__subtitle {
  font-size: 11px;
  color: var(--dim);
  line-height: 1.5;
}

.doc-badge {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(34, 197, 94, 0.12);
  color: var(--green);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.test-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.test-btn:hover {
  background: var(--surface);
  border-color: var(--muted);
}

.test-btn:active {
  transform: scale(0.97);
}

.doc-card__code {
  position: relative;
  background: var(--bg);
}

.doc-card__code .pre {
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 16px 20px;
}

.code-copy-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  font-family: inherit;
  font-size: 10px;
  color: var(--dim);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.code-copy-btn:hover {
  color: var(--text);
  background: var(--surface);
  border-color: var(--border2);
}

.t-comment { color: #5c6370; font-style: italic; }
.t-num { color: #f78c6c; }

/* ── Feature Buttons ── */
.feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.fbtn {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-family: inherit;
  color: var(--soft);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}

.fbtn:hover { background: var(--surface); border-color: var(--border2); }
.fbtn:active { transform: scale(0.98); }

.fbtn__icon { width: 18px; height: 18px; flex-shrink: 0; color: var(--mid); margin-top: 1px; }
.fbtn__title { font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
.fbtn__desc { font-size: 10px; color: var(--muted); line-height: 1.5; }

/* ── API Reference ── */
.api__subtitle {
  font-size: 11px;
  font-weight: 600;
  color: var(--soft);
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

.api-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.api-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.api-table thead tr { border-bottom: 1px solid var(--border); }

.api-table th {
  text-align: left;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 10px 14px;
  white-space: nowrap;
  background: var(--surface);
}

.api-table td {
  padding: 9px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  line-height: 1.5;
}

.api-table tbody tr:last-child td { border-bottom: none; }
.api-table tbody tr:hover td { background: var(--panel); }

.api-prop    { font-family: inherit; font-size: 11px; color: #82aaff; white-space: nowrap; }
.api-type    { font-family: inherit; font-size: 10px; color: #c792ea; line-height: 1.6; }
.api-default { font-family: inherit; font-size: 10px; color: var(--mid); white-space: nowrap; }
.api-desc    { font-size: 11px; color: var(--dim); min-width: 180px; }

/* ── Changelog ── */
.changelog { display: flex; flex-direction: column; }

.cl-entry { display: flex; gap: 16px; }

.cl-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  padding-top: 3px;
}

.cl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border2);
  border: 1px solid var(--muted);
  flex-shrink: 0;
}

.cl-dot--latest { background: var(--text); border-color: var(--text); }

.cl-line {
  flex: 1;
  width: 1px;
  background: var(--border);
  margin: 6px 0;
  min-height: 20px;
}

.cl-body { padding-bottom: 32px; flex: 1; min-width: 0; }

.cl-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.cl-version { font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }

.cl-tag {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 3px;
}

.cl-tag--latest {
  color: var(--green);
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.cl-tag--initial {
  color: var(--mid);
  background: var(--panel);
  border: 1px solid var(--border2);
}

.cl-date { font-size: 10px; color: var(--muted); margin-left: auto; }

.cl-list { display: flex; flex-direction: column; gap: 5px; list-style: none; }

.cl-item {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--dim);
  line-height: 1.6;
}

.cl-bullet { color: var(--muted); flex-shrink: 0; user-select: none; }

/* ── Step Badges ── */
.step__num-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
  background: var(--border2);
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

/* ── Section Note ── */
.section__note {
  font-size: 11px;
  color: var(--muted);
  margin-top: 12px;
  padding: 8px 12px;
  border-left: 2px solid var(--border2);
  letter-spacing: 0.02em;
}

/* ── Responsive ── */

/* Tablet: ≤ 900px — hide sidebar, full-width main */
@media (max-width: 900px) {
  .sidebar { display: none; }

  .main {
    padding: 32px 28px 60px;
    max-width: 100%;
  }

  .hero__title { font-size: 32px; }
  .hero__sub { max-width: 100%; }

  .variant-grid { grid-template-columns: repeat(3, 1fr); }
  .pos-grid { grid-template-columns: repeat(3, 1fr); }
  .feat-grid { grid-template-columns: 1fr; }

  .topnav__tag { display: none; }
}

/* Mobile: ≤ 560px — single column, smaller everything */
@media (max-width: 560px) {
  .topnav__inner { padding: 0 16px; }
  .topnav__github span { display: none; }

  .main {
    padding: 24px 16px 48px;
  }

  .hero__title { font-size: 24px; }
  .hero__chips { gap: 6px; }
  .chip { font-size: 9px; padding: 3px 8px; }

  .section { margin-bottom: 44px; }
  .section__title { font-size: 15px; }

  .variant-grid { grid-template-columns: repeat(2, 1fr); }
  .pos-grid { grid-template-columns: repeat(2, 1fr); }

  .code-block { padding: 10px 12px; }
  .code-block__text { font-size: 11px; }
  .pre { padding: 12px 14px; font-size: 11px; }

  .api-table th { padding: 8px 10px; }
  .api-table td { padding: 7px 10px; }

  .vbtn { padding: 10px 10px; font-size: 11px; }
  .fbtn { padding: 12px; }
}

/* ── Footer ── */
.demo-footer { padding-top: 32px; border-top: 1px solid var(--border); }
.demo-footer p { font-size: 10px; color: var(--muted); letter-spacing: 0.04em; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
</style>