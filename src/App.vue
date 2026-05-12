<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import type { ToastPosition } from '@/types/toast'

const { toast } = useToast()

// Copy install command
const installCopied = ref(false)
function copyInstall() {
  navigator.clipboard.writeText('npm install feather-toast-vue')
  installCopied.value = true
  setTimeout(() => { installCopied.value = false }, 2000)
}

const selectedPosition = ref<ToastPosition>('bottom-right')

const positions: { label: string; value: ToastPosition }[] = [
  { label: 'Top Right', value: 'top-right' },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Bottom Right', value: 'bottom-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
]

function fireDefault() {
  toast({
    title: 'Event Created',
    description: 'Your event has been successfully scheduled.',
    position: selectedPosition.value,
  })
}

function fireSuccess() {
  toast.success({
    title: 'Changes saved',
    description: 'Your profile has been updated successfully.',
    position: selectedPosition.value,
  })
}

function fireError() {
  toast.error({
    title: 'Something went wrong',
    description: 'There was an error processing your request. Please try again.',
    position: selectedPosition.value,
  })
}

function fireWarning() {
  toast.warning({
    title: 'Disk space low',
    description: 'You have less than 10% storage remaining.',
    position: selectedPosition.value,
  })
}

function fireInfo() {
  toast.info({
    title: 'New update available',
    description: 'Version 2.4.0 is ready to install.',
    position: selectedPosition.value,
  })
}

function fireLoading() {
  toast.loading({
    title: 'Uploading files...',
    description: 'Please wait while your files are being uploaded.',
    position: selectedPosition.value,
  })
}

function firePromise() {
  const fakeApiCall = new Promise<{ name: string }>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve({ name: 'Project Alpha' })
      } else {
        reject(new Error('Network timeout'))
      }
    }, 2500)
  })

  toast
    .promise(fakeApiCall, {
      loading: {
        title: 'Creating project...',
        description: 'Setting up your workspace.',
        position: selectedPosition.value,
      },
      success: (data) => ({
        title: `"${data.name}" created`,
        description: 'Your project is ready to go.',
        position: selectedPosition.value,
      }),
      error: (err) => ({
        title: 'Failed to create project',
        description: err instanceof Error ? err.message : 'Unknown error occurred.',
        position: selectedPosition.value,
      }),
    })
    .catch(() => {
      /* handled by toast */
    })
}

function fireWithAction() {
  toast({
    title: 'Message archived',
    description: 'The conversation has been moved to archive.',
    position: selectedPosition.value,
    action: {
      label: 'Undo',
      onClick: () => {
        toast.success({
          title: 'Restored',
          description: 'Message moved back to inbox.',
          position: selectedPosition.value,
        })
      },
    },
  })
}
</script>

<template>
  <div class="demo">

    <!-- Top nav -->
    <nav class="demo-nav">
      <div class="demo-nav__left">
        <span class="demo-nav__logo">🪶 feather-toast-vue</span>
        <span class="demo-nav__version">v1.0.4</span>
      </div>
      <a
        href="https://github.com/zin-ix/feather-toast-vue"
        target="_blank"
        rel="noopener noreferrer"
        class="demo-nav__github"
        aria-label="View on GitHub"
        title="View on GitHub"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        GitHub
      </a>
    </nav>

    <!-- Header -->
    <header class="demo-header">
      <div class="demo-header__badge">Vue 3 Plugin</div>
      <h1 class="demo-header__title">feather-toast</h1>
      <p class="demo-header__subtitle">
        A lightweight, smooth toast notification plugin with minimalist design and spring-based animations.
      </p>
      <div class="demo-header__stats">
        <span class="demo-stat">~6KB gzipped</span>
        <span class="demo-stat__sep">·</span>
        <span class="demo-stat">Zero deps</span>
        <span class="demo-stat__sep">·</span>
        <span class="demo-stat">TypeScript</span>
      </div>
    </header>

    <!-- Install -->
    <section class="demo-section">
      <label class="demo-label">Install</label>
      <div class="demo-code-block">
        <span class="demo-code-prompt">$</span>
        <code>npm install feather-toast-vue</code>
        <button class="demo-code-copy" @click="copyInstall" :class="{ copied: installCopied }" title="Copy">
          <svg v-if="!installCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </section>

    <!-- Usage -->
    <section class="demo-section">
      <label class="demo-label">Quick Start</label>
      <div class="demo-usage-card">

        <!-- Step 1 -->
        <div class="demo-usage-step">
          <span class="demo-usage-step__num">1</span>
          <div class="demo-usage-step__body">
            <p class="demo-usage-step__title">Register the plugin in <code class="demo-inline-code">main.ts</code></p>
            <pre class="demo-code-pre"><code><span class="c-purple">import</span> <span class="c-white">{ createApp }</span> <span class="c-purple">from</span> <span class="c-green">'vue'</span>
<span class="c-purple">import</span> <span class="c-white">App</span> <span class="c-purple">from</span> <span class="c-green">'./App.vue'</span>
<span class="c-purple">import</span> <span class="c-white">{ ToastPlugin }</span> <span class="c-purple">from</span> <span class="c-green">'feather-toast-vue'</span>

<span class="c-purple">const</span> <span class="c-white">app =</span> <span class="c-blue">createApp</span><span class="c-white">(App)</span>
<span class="c-white">app</span><span class="c-muted">.</span><span class="c-blue">use</span><span class="c-white">(ToastPlugin)</span>
<span class="c-white">app</span><span class="c-muted">.</span><span class="c-blue">mount</span><span class="c-white">(</span><span class="c-green">'#app'</span><span class="c-white">)</span></code></pre>
          </div>
        </div>

        <!-- Step 2 -->
        <!-- <div class="demo-usage-step">
          <span class="demo-usage-step__num">2</span>
          <div class="demo-usage-step__body">
            <p class="demo-usage-step__title">No container wiring needed</p>
            <pre class="demo-code-pre"><code><span class="c-muted">// ToastContainer is mounted automatically by the plugin</span>
<span class="c-muted">// No changes needed in App.vue</span></code></pre>
            <p class="demo-usage-note">✦ `app.use(ToastPlugin)` now injects and mounts the container for you.</p>
          </div>
        </div> -->

        <!-- Step 2 -->
        <div class="demo-usage-step">
          <span class="demo-usage-step__num">2</span>
          <div class="demo-usage-step__body">
            <p class="demo-usage-step__title">Call <code class="demo-inline-code">useToast()</code> in any component</p>
            <pre class="demo-code-pre"><code><span class="c-purple">import</span> <span class="c-white">{ useToast }</span> <span class="c-purple">from</span> <span class="c-green">'feather-toast-vue'</span>

<span class="c-purple">const</span> <span class="c-white">{ toast } =</span> <span class="c-blue">useToast</span><span class="c-white">()</span>

<span class="c-white">toast</span><span class="c-muted">.</span><span class="c-blue">success</span><span class="c-white">({ title:</span> <span class="c-green">'Changes saved'</span><span class="c-white">, description:</span> <span class="c-green">'All good!'</span> <span class="c-white">})</span>
<span class="c-white">toast</span><span class="c-muted">.</span><span class="c-blue">error</span><span class="c-white">({ title:</span> <span class="c-green">'Something went wrong'</span> <span class="c-white">})</span>
<span class="c-white">toast</span><span class="c-muted">.</span><span class="c-blue">promise</span><span class="c-white">(fetch(</span><span class="c-green">'/api/save'</span><span class="c-white">), {</span>
  <span class="c-white">loading:</span> <span class="c-white">{ title:</span> <span class="c-green">'Saving...'</span> <span class="c-white">},</span>
  <span class="c-white">success:</span> <span class="c-white">{ title:</span> <span class="c-green">'Saved!'</span> <span class="c-white">},</span>
  <span class="c-white">error:</span>   <span class="c-white">{ title:</span> <span class="c-green">'Failed'</span> <span class="c-white">},</span>
<span class="c-white">})</span></code></pre>
          </div>
        </div>

      </div>
    </section>


    <!-- Position Picker -->
    <section class="demo-section">
      <label class="demo-label">Position</label>
      <div class="demo-position-grid">
        <button
          v-for="pos in positions"
          :key="pos.value"
          :class="['demo-position-btn', { 'demo-position-btn--active': selectedPosition === pos.value }]"
          @click="selectedPosition = pos.value"
        >
          {{ pos.label }}
        </button>
      </div>
    </section>

    <!-- Variant Buttons -->
    <section class="demo-section">
      <label class="demo-label">Variants</label>
      <div class="demo-btn-grid">
        <button class="demo-btn" @click="fireDefault">
          <span class="demo-btn__dot demo-btn__dot--default"></span>
          Default
        </button>
        <button class="demo-btn" @click="fireSuccess">
          <span class="demo-btn__dot demo-btn__dot--success"></span>
          Success
        </button>
        <button class="demo-btn" @click="fireError">
          <span class="demo-btn__dot demo-btn__dot--error"></span>
          Error
        </button>
        <button class="demo-btn" @click="fireWarning">
          <span class="demo-btn__dot demo-btn__dot--warning"></span>
          Warning
        </button>
        <button class="demo-btn" @click="fireInfo">
          <span class="demo-btn__dot demo-btn__dot--info"></span>
          Info
        </button>
        <button class="demo-btn" @click="fireLoading">
          <span class="demo-btn__dot demo-btn__dot--loading"></span>
          Loading
        </button>
      </div>
    </section>

    <!-- Special Features -->
    <section class="demo-section">
      <label class="demo-label">Features</label>
      <div class="demo-btn-grid demo-btn-grid--two">
        <button class="demo-btn" @click="firePromise">
          <svg class="demo-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Promise
        </button>
        <button class="demo-btn" @click="fireWithAction">
          <svg class="demo-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          With Action
        </button>
      </div>
    </section>

    <!-- Hints -->
    <footer class="demo-footer">
      <p>Swipe horizontally on any toast to dismiss it.</p>
      <p>Hover a toast to pause the auto-dismiss timer.</p>
    </footer>
  </div>

</template>



<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #09090b;
  color: #fafafa;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.demo {
  max-width: 540px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

/* ── Nav ── */
.demo-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #18181b;
  margin-bottom: 48px;
  position: sticky;
  top: 0;
  background: #09090b;
  z-index: 10;
}

.demo-nav__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-nav__logo {
  font-size: 14px;
  font-weight: 600;
  color: #fafafa;
  letter-spacing: -0.01em;
}

.demo-nav__version {
  font-size: 11px;
  font-weight: 500;
  color: #52525b;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 999px;
  padding: 2px 8px;
}

.demo-nav__github {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #a1a1aa;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #27272a;
  border-radius: 8px;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.demo-nav__github:hover {
  color: #fafafa;
  border-color: #3f3f46;
  background: #18181b;
}

.demo-nav__github svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Header ── */
.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header__badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #a1a1aa;
  border: 1px solid #27272a;
  border-radius: 999px;
  margin-bottom: 16px;
}

.demo-header__title {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fafafa;
  margin-bottom: 12px;
}

.demo-header__subtitle {
  font-size: 15px;
  line-height: 1.6;
  color: #71717a;
  max-width: 380px;
  margin: 0 auto 16px;
}

.demo-header__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.demo-stat {
  font-size: 12px;
  font-weight: 500;
  color: #52525b;
}

.demo-stat__sep {
  font-size: 12px;
  color: #3f3f46;
}

/* ── Sections ── */
.demo-section {
  margin-bottom: 28px;
}

.demo-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #52525b;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ── Install block ── */
.demo-code-block {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0e0e11;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: 'Menlo', 'Monaco', 'Cascadia Code', monospace;
}

.demo-code-prompt {
  color: #3f3f46;
  font-size: 13px;
  user-select: none;
}

.demo-code-block code {
  flex: 1;
  font-size: 13px;
  color: #e4e4e7;
}

.demo-code-copy {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #52525b;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.demo-code-copy:hover {
  background: #18181b;
  color: #a1a1aa;
}

.demo-code-copy.copied {
  color: #16a34a;
}

.demo-code-copy svg {
  width: 14px;
  height: 14px;
}

/* ── Usage card ── */
.demo-usage-card {
  background: #0e0e11;
  border: 1px solid #27272a;
  border-radius: 10px;
  overflow: hidden;
}

.demo-usage-step {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid #18181b;
}

.demo-usage-step:last-child {
  border-bottom: none;
}

.demo-usage-step__num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #52525b;
  border: 1px solid #27272a;
  border-radius: 50%;
  margin-top: 1px;
}

.demo-usage-step__body {
  flex: 1;
  min-width: 0;
}

.demo-usage-step__title {
  font-size: 12px;
  font-weight: 500;
  color: #71717a;
  margin-bottom: 8px;
}

.demo-inline-code {
  font-family: 'Menlo', 'Monaco', 'Cascadia Code', monospace;
  font-size: 11px;
  font-style: normal;
  color: #a1a1aa;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 4px;
  padding: 1px 5px;
}

.demo-usage-note {
  font-size: 11px;
  color: #52525b;
  margin-top: 8px;
}

.demo-code-pre {
  font-family: 'Menlo', 'Monaco', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre;
  overflow-x: auto;
}

/* Syntax colors */
.c-purple { color: #c084fc; }
.c-blue   { color: #60a5fa; }
.c-green  { color: #86efac; }
.c-white  { color: #f4f4f5; }
.c-muted  { color: #71717a; }

/* ── Position Grid ── */
.demo-position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.demo-position-btn {
  padding: 9px 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: #71717a;
  background: #0e0e11;
  border: 1px solid #27272a;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.demo-position-btn:hover {
  color: #fafafa;
  background: #18181b;
  border-color: #3f3f46;
}

.demo-position-btn--active {
  color: #fafafa;
  background: #18181b;
  border-color: #52525b;
  box-shadow: 0 0 0 1px #52525b;
}

/* ── Button Grid ── */
.demo-btn-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.demo-btn-grid--two {
  grid-template-columns: repeat(2, 1fr);
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #fafafa;
  background: #0e0e11;
  border: 1px solid #27272a;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.demo-btn:hover {
  background: #18181b;
  border-color: #3f3f46;
}

.demo-btn:active {
  transform: scale(0.97);
}

.demo-btn__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.demo-btn__dot--default { background: #52525b; }
.demo-btn__dot--success { background: #16a34a; }
.demo-btn__dot--error   { background: #dc2626; }
.demo-btn__dot--warning { background: #d97706; }
.demo-btn__dot--info    { background: #2563eb; }
.demo-btn__dot--loading { background: #71717a; }

.demo-btn__icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* ── Footer ── */
.demo-footer {
  text-align: center;
  padding-top: 24px;
  margin-top: 4px;
  border-top: 1px solid #18181b;
}

.demo-footer p {
  font-size: 12px;
  color: #3f3f46;
  line-height: 1.9;
}
</style>
