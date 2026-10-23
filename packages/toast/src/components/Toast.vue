<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, toValue } from 'vue'
import type { Toast } from '../types/toast'

const props = defineProps<{
  toast: Toast
  index: number
  /** Stacked distance (px) from the viewport edge when expanded */
  offset: number
  /** Measured content height; undefined until the first measurement */
  height?: number
  frontHeight: number
  visible: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  close: [id: string]
  height: [id: string, height: number]
}>()

const SWIPE_THRESHOLD = 80
const SWIPE_VELOCITY = 0.4 // px/ms — a quick flick dismisses even when short

// Stroke paths on a 16×16 grid; static constants, safe for v-html
const ICONS: Partial<Record<Toast['variant'], string>> = {
  success: '<circle cx="8" cy="8" r="7"/><path d="M5 8l2 2 4-4"/>',
  error: '<circle cx="8" cy="8" r="7"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5"/>',
  warning: '<path d="M8 2L14.5 13.5H1.5L8 2z"/><path d="M8 7v2.5M8 11.5v.01"/>',
  info: '<circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5v.01"/>',
  offline: '<path d="M2.5 5.5C4 4 5.8 3 8 3c1 0 1.9.2 2.7.5M4.5 8c.8-.7 1.9-1.2 3.2-1.2M8 12v.01M3 3l10 10"/>',
  update: '<circle cx="8" cy="8" r="7"/><path d="M8 11V5.5M5.5 7.5L8 5l2.5 2.5"/>',
}

const isFront = computed(() => props.index === 0)

// Fields may be refs or getters (toast.loading({ title: computed(...) }))
const title = computed(() => toValue(props.toast.title))
const description = computed(() => toValue(props.toast.description))
const progress = computed(() => toValue(props.toast.progress))
const isPersistent = computed(() => props.toast.variant === 'loading' || props.toast.variant === 'offline')

// ─── Mount (enter) ─────────────────────────────────────────────────────────
// Rendered once in the off-screen state, then flipped on the next frame so the
// browser has a start value to transition from.
const mounted = ref(false)
let rafId = 0

// ─── Dismiss Timer ─────────────────────────────────────────────────────────
let remainingMs = props.toast.duration
let startedAt = 0
let dismissTimer: ReturnType<typeof setTimeout> | null = null
const isPaused = ref(false)

function clearTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function startTimer(ms: number) {
  clearTimer()
  if (ms === Infinity || ms <= 0 || isPersistent.value) return
  remainingMs = ms
  if (props.paused || swiping.value) {
    isPaused.value = true
    return
  }
  isPaused.value = false
  startedAt = Date.now()
  dismissTimer = setTimeout(() => emit('close', props.toast.id), ms)
}

function pauseTimer() {
  isPaused.value = true
  if (!dismissTimer) return
  clearTimer()
  remainingMs = Math.max(500, remainingMs - (Date.now() - startedAt))
}

function resumeTimer() {
  if (props.paused || swiping.value) return
  startTimer(remainingMs)
}

watch(() => props.paused, (p) => (p ? pauseTimer() : resumeTimer()))

// Restart when a loading/step/promise toast settles, its duration changes,
// or a grouped duplicate bumps the count
watch(
  () => [props.toast.variant, props.toast.duration, props.toast.count] as const,
  () => startTimer(props.toast.duration),
)

// ─── Height measurement ────────────────────────────────────────────────────
const contentEl = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function reportHeight() {
  if (contentEl.value) emit('height', props.toast.id, contentEl.value.offsetHeight)
}

onMounted(() => {
  reportHeight()
  if (typeof ResizeObserver !== 'undefined' && contentEl.value) {
    resizeObserver = new ResizeObserver(reportHeight)
    resizeObserver.observe(contentEl.value)
  }
  rafId = requestAnimationFrame(() => {
    rafId = requestAnimationFrame(() => (mounted.value = true))
  })
  startTimer(props.toast.duration)
})

// ─── Progress Bar ──────────────────────────────────────────────────────────
const progressStyle = computed(() => {
  if (progress.value !== undefined) {
    return { transform: `scaleX(${Math.min(100, Math.max(0, progress.value)) / 100})` }
  }
  if (props.toast.showProgress && props.toast.duration !== Infinity && props.toast.duration > 0) {
    return {
      animationDuration: `${props.toast.duration}ms`,
      animationPlayState: isPaused.value ? 'paused' : 'running',
    }
  }
  return {}
})

// ─── Swipe ─────────────────────────────────────────────────────────────────
const swipeX = ref(0)
const swiping = ref(false)
const swipedOut = ref(false)
let pointerId: number | null = null
let startX = 0
let startY = 0
let startTime = 0
let locked: 'x' | 'y' | null = null

function onPointerDown(e: PointerEvent) {
  if (!props.toast.dismissible || e.button !== 0) return
  if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return
  pointerId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  startTime = performance.now()
  locked = null
}

function onPointerMove(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (!locked) {
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
    locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (locked === 'y') {
      pointerId = null // let the page scroll
      return
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    swiping.value = true
    pauseTimer()
  }
  swipeX.value = dx
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  pointerId = null
  if (!swiping.value) return

  const dx = swipeX.value
  const velocity = Math.abs(dx) / Math.max(1, performance.now() - startTime)
  swiping.value = false

  if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
    swipedOut.value = true
    swipeX.value = Math.sign(dx || 1) * (Math.abs(dx) + 240)
    emit('close', props.toast.id)
  } else {
    swipeX.value = 0
    resumeTimer()
  }
}

onBeforeUnmount(() => {
  clearTimer()
  cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
})

// ─── Buttons ───────────────────────────────────────────────────────────────
function handleClose() {
  emit('close', props.toast.id)
}

async function runHandler(handler?: () => void | Promise<void>) {
  try {
    await handler?.()
  } catch (err) {
    console.error('[feather-toast-vue] Action handler error:', err)
  }
}

const cardStyle = computed(() => ({
  '--index': props.index,
  '--offset': `${props.offset}px`,
  '--h': props.height === undefined ? undefined : `${props.height}px`,
  '--front-h': `${props.frontHeight}px`,
  '--swipe-x': `${swipeX.value}px`,
  '--swipe-amount': Math.min(1, Math.abs(swipeX.value) / 260),
}))
</script>

<template>
  <li
    :class="['toast-card', `toast-card--${toast.variant}`]"
    :style="cardStyle"
    :data-mounted="mounted || undefined"
    :data-front="isFront || undefined"
    :data-visible="visible || undefined"
    :data-swiping="swiping || undefined"
    :data-swiped="swipedOut || undefined"
    :role="toast.variant === 'error' ? 'alert' : 'status'"
    :aria-hidden="!visible || undefined"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown.esc="toast.dismissible && handleClose()"
  >
    <div ref="contentEl" class="toast-content">
      <div v-if="toast.variant === 'loading'" class="toast-spinner" aria-hidden="true" />
      <svg
        v-else-if="ICONS[toast.variant]"
        :class="['toast-icon', `toast-icon--${toast.variant}`]"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        v-html="ICONS[toast.variant]"
      />

      <div class="toast-body">
        <component
          v-if="toast.component"
          :is="toast.component"
          :toast="toast"
          :close="handleClose"
        />
        <template v-else>
          <p v-if="title" class="toast-title">
            {{ title }}<span v-if="(toast.count ?? 1) > 1" :key="toast.count" class="toast-count">×{{ toast.count }}</span>
          </p>
          <p v-if="description" class="toast-description">{{ description }}</p>
        </template>
      </div>

      <div v-if="toast.action || toast.cancel" class="toast-actions">
        <button
          v-if="toast.cancel"
          class="toast-action-btn toast-action-btn--cancel"
          @click.stop="runHandler(toast.cancel.onClick)"
        >
          {{ toast.cancel.label }}
        </button>
        <button v-if="toast.action" class="toast-action-btn" @click.stop="runHandler(toast.action.onClick)">
          {{ toast.action.label }}
        </button>
      </div>

      <button
        v-if="toast.dismissible"
        class="toast-close"
        aria-label="Dismiss"
        @click.stop="handleClose"
      >
        <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div
      v-if="toast.showProgress || progress !== undefined"
      class="toast-progress-track"
      aria-hidden="true"
    >
      <div
        :class="['toast-progress-fill', { 'toast-progress-fill--countdown': toast.showProgress && progress === undefined }]"
        :style="progressStyle"
      />
    </div>
  </li>
</template>
