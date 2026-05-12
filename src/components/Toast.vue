<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
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

function startTimer(ms: number) {
  if (ms === Infinity || ms <= 0 || props.toast.variant === 'loading') return
  clearTimer()
  startedAt = Date.now()
  remainingMs = ms
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
  remainingMs = Math.max(500, remainingMs - (Date.now() - startedAt))
}

function resumeTimer() {
  if (props.toast.variant === 'loading') return
  startTimer(remainingMs)
}

// Restart timer when promise resolves: loading → success/error
watch(
  () => props.toast.variant,
  (next) => {
    if (next !== 'loading') {
      remainingMs = props.toast.duration
      startTimer(props.toast.duration)
    }
  },
)

onMounted(() => startTimer(props.toast.duration))
onBeforeUnmount(() => clearTimer())

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
    transform: `translateX(${dx}px)`,
    opacity: Math.max(0, 1 - Math.abs(dx) / 240),
    transition: 'none',
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isPointerDown) return
  const wasSwiping = horizontalSwipe

  isPointerDown = false
  horizontalSwipe = false

  if (!wasSwiping) return

  const dx = e.clientX - startX

  if (Math.abs(dx) > 110) {
    // Commit dismiss
    cardStyle.value = {
      transform: `translateX(${dx > 0 ? 500 : -500}px)`,
      opacity: 0,
      transition: 'transform 0.22s ease, opacity 0.22s ease',
    }
    setTimeout(() => emit('close', props.toast.id), 220)
  } else {
    // Snap back with spring
    cardStyle.value = {
      transform: 'translateX(0)',
      opacity: 1,
      transition: 'transform 0.36s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
    }
    setTimeout(() => {
      cardStyle.value = {}
      resumeTimer()
    }, 370)
  }
}

function handleClose() {
  emit('close', props.toast.id)
}

function handleAction() {
  props.toast.action?.onClick()
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

    <!-- Body -->
    <div class="toast-body">
      <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
      <p v-if="toast.description" class="toast-description">{{ toast.description }}</p>
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
  </div>
</template>