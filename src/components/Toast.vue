<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Toast } from '../types/toast'

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  close: [id: string]
}>()

// ─── Dismiss Timer ─────────────────────────────────────────────────────────
let remainingMs = props.toast.duration
let startedAt = 0
let dismissTimer: ReturnType<typeof setTimeout> | null = null
const isPaused = ref(false)

function startTimer(ms: number) {
  if (ms === Infinity || ms <= 0 || props.toast.variant === 'loading' || props.toast.variant === 'offline') return
  clearTimer()
  startedAt = Date.now()
  remainingMs = ms
  isPaused.value = false
  dismissTimer = setTimeout(() => emit('close', props.toast.id), ms)
}

function clearTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function pauseTimer() {
  if (!dismissTimer) return
  clearTimer()
  isPaused.value = true
  remainingMs = Math.max(500, remainingMs - (Date.now() - startedAt))
}

function resumeTimer() {
  if (props.toast.variant === 'loading' || props.toast.variant === 'offline') return
  isPaused.value = false
  startTimer(remainingMs)
}

// Restart timer when promise resolves: loading → success/error
watch(
  () => props.toast.variant,
  (next) => {
    if (next !== 'loading' && next !== 'offline') {
      remainingMs = props.toast.duration
      startTimer(props.toast.duration)
    }
  },
)

onMounted(() => startTimer(props.toast.duration))

// ─── Progress Bar ──────────────────────────────────────────────────────────
const progressStyle = computed(() => {
  if (props.toast.progress !== undefined) {
    return {
      width: `${Math.min(100, Math.max(0, props.toast.progress))}%`,
      transition: 'width 0.2s linear',
    }
  }

  if (props.toast.showProgress && props.toast.duration !== Infinity && props.toast.duration > 0) {
    return {
      animationDuration: `${props.toast.duration}ms`,
      animationPlayState: isPaused.value ? 'paused' : 'running',
    }
  }

  return {}
})

// ─── Swipe Physics ─────────────────────────────────────────────────────────
let isPointerDown = false
let startX = 0
let startY = 0
let horizontalSwipe = false

const cardStyle = ref<Record<string, string | number>>({})

function onPointerDown(e: PointerEvent) {
  if (!props.toast.dismissible) return
  isPointerDown = true
  startX = e.clientX
  startY = e.clientY
  horizontalSwipe = false
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isPointerDown || !props.toast.dismissible) return

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (!horizontalSwipe) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    if (Math.abs(dx) >= Math.abs(dy)) {
      horizontalSwipe = true
    } else {
      isPointerDown = false
      return
    }
  }

  pauseTimer()
  cardStyle.value = {
    transform: `translateX(${dx}px) scale(${1 - Math.abs(dx) / 1200})`,
    opacity: Math.max(0, 1 - Math.abs(dx) / 280),
    filter: `blur(${Math.min(Math.abs(dx) / 120, 3)}px)`,
    transition: 'none',
  }
}

let swipeCommitTimer: ReturnType<typeof setTimeout> | null = null
let snapBackTimer: ReturnType<typeof setTimeout> | null = null

function clearSwipeTimers() {
  if (swipeCommitTimer) {
    clearTimeout(swipeCommitTimer)
    swipeCommitTimer = null
  }
  if (snapBackTimer) {
    clearTimeout(snapBackTimer)
    snapBackTimer = null
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isPointerDown) return
  const wasSwiping = horizontalSwipe

  isPointerDown = false
  horizontalSwipe = false

  if (!wasSwiping) return

  const dx = e.clientX - startX

  clearSwipeTimers()

  if (Math.abs(dx) > 100) {
    // Commit dismiss — smooth fade-out with blur
    cardStyle.value = {
      transform: `translateX(${dx > 0 ? 360 : -360}px) scale(0.94)`,
      opacity: 0,
      filter: 'blur(3px)',
      transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.24s cubic-bezier(0.16,1,0.3,1), filter 0.24s cubic-bezier(0.16,1,0.3,1)',
    }
    swipeCommitTimer = setTimeout(() => emit('close', props.toast.id), 260)
  } else {
    // Snap back — buttery spring
    cardStyle.value = {
      transform: 'translateX(0) scale(1)',
      opacity: 1,
      filter: 'blur(0)',
      transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.25s cubic-bezier(0.16,1,0.3,1), filter 0.25s cubic-bezier(0.16,1,0.3,1)',
    }
    snapBackTimer = setTimeout(() => {
      cardStyle.value = {}
      resumeTimer()
    }, 400)
  }
}

onBeforeUnmount(() => {
  clearTimer()
  clearSwipeTimers()
})

function handleClose() {
  emit('close', props.toast.id)
}

async function handleAction() {
  try {
    await props.toast.action?.onClick()
  } catch (err) {
    console.error('[feather-toast-vue] Action handler error:', err)
  }
}
</script>

<template>
  <div
    :class="['toast-card', `toast-card--${toast.variant}`]"
    :style="cardStyle"
    role="alert"
    aria-live="polite"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @mouseenter="pauseTimer"
    @mouseleave="resumeTimer"
  >
    <!-- Loading spinner -->
    <div v-if="toast.variant === 'loading'" class="toast-spinner" aria-hidden="true" />

    <!-- Success icon -->
    <svg
      v-else-if="toast.variant === 'success'"
      class="toast-icon toast-icon--success"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- Error icon -->
    <svg
      v-else-if="toast.variant === 'error'"
      class="toast-icon toast-icon--error"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Warning icon -->
    <svg
      v-else-if="toast.variant === 'warning'"
      class="toast-icon toast-icon--warning"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M8 7v2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>

    <!-- Info icon -->
    <svg
      v-else-if="toast.variant === 'info'"
      class="toast-icon toast-icon--info"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 7v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>

    <!-- Destructive icon — circle with diagonal slash -->
    <svg
      v-else-if="toast.variant === 'destructive'"
      class="toast-icon toast-icon--destructive"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M4.5 11.5l7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Offline icon — wifi off -->
    <svg
      v-else-if="toast.variant === 'offline'"
      class="toast-icon toast-icon--offline"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 5.5C4 4 5.8 3 8 3c1 0 1.9.2 2.7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M4.5 8c.8-.7 1.9-1.2 3.2-1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <path d="M3 3l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Update icon — arrow up in circle -->
    <svg
      v-else-if="toast.variant === 'update'"
      class="toast-icon toast-icon--update"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 11V5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M5.5 7.5L8 5l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- Neutral icon — circle with center dot -->
    <svg
      v-else-if="toast.variant === 'neutral'"
      class="toast-icon toast-icon--neutral"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>

    <!-- Body -->
    <div class="toast-body">
      <component
        v-if="toast.component"
        :is="toast.component"
        :toast="toast"
        :close="handleClose"
      />
      <template v-else>
        <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
        <p v-if="toast.description" class="toast-description">{{ toast.description }}</p>
      </template>
    </div>

    <!-- Action button -->
    <button v-if="toast.action" class="toast-action-btn" @pointerdown.stop @click.stop="handleAction">
      {{ toast.action.label }}
    </button>

    <!-- Close button -->
    <button
      v-if="toast.dismissible"
      class="toast-close"
      aria-label="Dismiss"
      @pointerdown.stop
      @click.stop="handleClose"
    >
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <!-- Progress / Countdown indicator -->
    <div
      v-if="toast.showProgress || toast.progress !== undefined"
      class="toast-progress-track"
      aria-hidden="true"
    >
      <div
        :class="['toast-progress-fill', { 'toast-progress-fill--countdown': toast.showProgress && toast.progress === undefined }]"
        :style="progressStyle"
      />
    </div>
  </div>
</template>