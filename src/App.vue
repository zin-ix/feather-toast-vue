<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject } from 'vue'
import { useFeatherToast } from '@/composables/useToast'
import type { ToastPosition } from '@/types/toast'

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
}, { immediate: true })

// ── Install copy ────────────────────────────────────
const installCopied = ref(false)
function copyInstall() {
  navigator.clipboard.writeText('npm install feather-toast-vue')
  installCopied.value = true
  setTimeout(() => { installCopied.value = false }, 2000)
}

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
  { id: 'install',    label: '01  Install' },
  { id: 'quickstart', label: '02  Quick Start' },
  { id: 'position',   label: '03  Position' },
  { id: 'variants',   label: '04  Variants' },
  { id: 'features',   label: '05  Features' },
  { id: 'api',        label: '06  API Reference' },
  { id: 'changelog',  label: '07  Changelog' },
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
  { prop: 'variant',     type: '"default" | "success" | "error" | "warning" | "info" | "loading"', default: '"default"', description: 'Controls the icon and accent color.' },
  { prop: 'action',      type: '{ label: string; onClick: () => void }',          default: 'undefined',      description: 'Renders an inline action button on the toast.' },
]

const promiseApiRows: ApiRow[] = [
  { prop: 'loading', type: 'ToastOptions',                                   default: '—', description: 'Toast config shown while the promise is pending.' },
  { prop: 'success', type: 'ToastOptions | ((data: T) => ToastOptions)',     default: '—', description: 'Config or factory for the resolved state.' },
  { prop: 'error',   type: 'ToastOptions | ((err: unknown) => ToastOptions)', default: '—', description: 'Config or factory for the rejected state.' },
]

// ── Changelog ───────────────────────────────────────
const changelog = [
  {
    version: 'v1.0.10',
    date: '2026-05-13',
    tag: 'latest',
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
</script>

<template>
  <div class="page">

    <!-- ── Full-width Top Nav ── -->
    <nav class="topnav">
      <div class="topnav__inner">

        <div class="topnav__left">
          <span class="topnav__feather">🪶</span>
          <span class="topnav__name">feather-toast-vue</span>
          <span class="topnav__ver">v1.0.10</span>
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
          <span>~6KB gzipped</span>
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
            <span class="chip chip--green">~6KB gzipped</span>
            <span class="chip chip--dim">Zero dependencies</span>
            <span class="chip chip--dim">TypeScript</span>
            <span class="chip chip--dim">Vue 3</span>
          </div>
        </section>

        <!-- 01 Install -->
        <section id="install" class="section">
          <div class="section__head">
            <span class="section__num">01</span>
            <h2 class="section__title">Install</h2>
          </div>
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
        </section>

        <!-- 02 Quick Start -->
        <section id="quickstart" class="section">
          <div class="section__head">
            <span class="section__num">02</span>
            <h2 class="section__title">Quick Start</h2>
          </div>

          <div class="step">
            <div class="step__label">Register in <code class="ic">main.ts</code></div>
            <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ createApp }</span> <span class="t-kw">from</span> <span class="t-str">'vue'</span>
<span class="t-kw">import</span> <span class="t-w">App</span> <span class="t-kw">from</span> <span class="t-str">'./App.vue'</span>
<span class="t-kw">import</span> <span class="t-w">{ CreateFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">app</span> <span class="t-op">=</span> <span class="t-fn">createApp</span><span class="t-w">(App)</span>
<span class="t-w">app</span><span class="t-op">.</span><span class="t-fn">use</span><span class="t-w">(CreateFeatherToast)</span>
<span class="t-w">app</span><span class="t-op">.</span><span class="t-fn">mount</span><span class="t-w">(</span><span class="t-str">'#app'</span><span class="t-w">)</span></code></pre>
          </div>

          <div class="step">
            <div class="step__label">Use in any component</div>
            <pre class="pre"><code><span class="t-kw">import</span> <span class="t-w">{ useFeatherToast }</span> <span class="t-kw">from</span> <span class="t-str">'feather-toast-vue'</span>

<span class="t-kw">const</span> <span class="t-w">{ toast }</span> <span class="t-op">=</span> <span class="t-fn">useFeatherToast</span><span class="t-w">()</span>

<span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">success</span><span class="t-w">({ title:</span> <span class="t-str">'Saved'</span><span class="t-w">, description:</span> <span class="t-str">'All changes applied.'</span> <span class="t-w">})</span>
<span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">error</span><span class="t-w">({ title:</span> <span class="t-str">'Something went wrong'</span> <span class="t-w">})</span>
<span class="t-w">toast</span><span class="t-op">.</span><span class="t-fn">promise</span><span class="t-w">(fetch(</span><span class="t-str">'/api/save'</span><span class="t-w">), {</span>
  <span class="t-w">loading:</span> <span class="t-w">{ title:</span> <span class="t-str">'Saving...'</span> <span class="t-w">},</span>
  <span class="t-w">success:</span> <span class="t-w">{ title:</span> <span class="t-str">'Saved!'</span> <span class="t-w">},</span>
  <span class="t-w">error:</span>   <span class="t-w">{ title:</span> <span class="t-str">'Failed'</span> <span class="t-w">},</span>
<span class="t-w">})</span></code></pre>
          </div>
        </section>

        <!-- 03 Position -->
        <section id="position" class="section">
          <div class="section__head">
            <span class="section__num">03</span>
            <h2 class="section__title">Position</h2>
          </div>
          <p class="section__desc">Select a spawn corner before firing any toast below.</p>
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
        </section>

        <!-- 04 Variants -->
        <section id="variants" class="section">
          <div class="section__head">
            <span class="section__num">04</span>
            <h2 class="section__title">Variants</h2>
          </div>
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
          </div>
        </section>

        <!-- 05 Features -->
        <section id="features" class="section">
          <div class="section__head">
            <span class="section__num">05</span>
            <h2 class="section__title">Features</h2>
          </div>
          <div class="feat-grid">
            <button class="fbtn" @click="firePromise">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="fbtn__icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <div class="fbtn__title">Promise</div>
                <div class="fbtn__desc">Auto-transitions loading → success / error</div>
              </div>
            </button>
            <button class="fbtn" @click="fireWithAction">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="fbtn__icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <div class="fbtn__title">With Action</div>
                <div class="fbtn__desc">Inline undo / CTA button on toast</div>
              </div>
            </button>
          </div>
        </section>

        <!-- 06 API Reference -->
        <section id="api" class="section">
          <div class="section__head">
            <span class="section__num">06</span>
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
.variant-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }

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

/* ── Footer ── */
.demo-footer { padding-top: 32px; border-top: 1px solid var(--border); }
.demo-footer p { font-size: 10px; color: var(--muted); letter-spacing: 0.04em; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
</style>