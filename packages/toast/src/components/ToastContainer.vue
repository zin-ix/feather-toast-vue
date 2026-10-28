<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '../composables/useToast'
import Toast from './Toast.vue'
import type { Toast as ToastItem, ToastPosition } from '../types/toast'

const { toasts, config, dismiss } = useToast()

const isMounted = ref(false)
const docHidden = ref(false)

const positions: ToastPosition[] = [
  'top-right',
  'top-left',
  'top-center',
  'bottom-right',
  'bottom-left',
  'bottom-center',
]

const heights = reactive<Record<string, number>>({})
const hovered = reactive<Partial<Record<ToastPosition, boolean>>>({})
const touchOpen = reactive<Partial<Record<ToastPosition, boolean>>>({})

/** Newest first: index 0 is the front of the stack. */
const stacks = computed(() => {
  const map = {} as Record<ToastPosition, ToastItem[]>
  for (const p of positions) map[p] = []
  for (const t of toasts.value) map[t.position]?.unshift(t)
  return map
})

// Drop measurements of toasts that no longer exist
watch(
  () => toasts.value.map((t) => t.id),
  (ids) => {
    for (const id of Object.keys(heights)) if (!ids.includes(id)) delete heights[id]
  },
)

function isExpanded(position: ToastPosition) {
  return !!(config.value.expand || hovered[position] || touchOpen[position])
}

/** Summed height of the toasts in front; CSS adds the --toast-gap spacing. */
function offsetOf(list: ToastItem[], index: number) {
  let sum = 0
  for (let i = 0; i < index; i++) sum += heights[list[i]!.id] ?? 0
  return sum
}

function onHeight(id: string, h: number) {
  heights[id] = h
}

function onPointerEnter(position: ToastPosition, e: PointerEvent) {
  if (e.pointerType === 'mouse') hovered[position] = true
}

function onPointerLeave(position: ToastPosition, e: PointerEvent) {
  if (e.pointerType === 'mouse') hovered[position] = false
}

// Touch: tap a stack to expand it, tap anywhere else to collapse it
function onViewportPointerDown(position: ToastPosition, e: PointerEvent) {
  if (e.pointerType !== 'mouse') touchOpen[position] = true
}

function onDocPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse') return
  if ((e.target as HTMLElement | null)?.closest?.('.toast-viewport')) return
  for (const p of positions) touchOpen[p] = false
}

function onVisibility() {
  docHidden.value = document.visibilityState === 'hidden'
}

watch(
  () => toasts.value.length,
  (n) => {
    if (n === 0) for (const p of positions) touchOpen[p] = hovered[p] = false
  },
)

onMounted(() => {
  isMounted.value = true
  document.addEventListener('pointerdown', onDocPointerDown)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <!-- Client-only: never server-render the shared toast list into another user's HTML -->
  <Teleport v-if="isMounted" to="body">
    <section aria-label="Notifications" class="toast-region">
      <TransitionGroup
        v-for="position in positions"
        :key="position"
        tag="ol"
        name="toast"
        :class="['toast-viewport', `toast-viewport--${position}`]"
        :data-y="position.startsWith('top') ? 'top' : 'bottom'"
        :data-expanded="isExpanded(position) || undefined"
        :data-theme="config.theme ?? 'light'"
        :data-rich="config.richColors || undefined"
        @pointerenter="onPointerEnter(position, $event)"
        @pointerleave="onPointerLeave(position, $event)"
        @pointerdown="onViewportPointerDown(position, $event)"
      >
        <Toast
          v-for="(t, i) in stacks[position]"
          :key="t.id"
          :toast="t"
          :index="i"
          :offset="offsetOf(stacks[position], i)"
          :front-height="heights[stacks[position][0]?.id ?? ''] ?? 0"
          :height="heights[t.id]"
          :visible="i < (config.visibleToasts ?? 3)"
          :paused="docHidden || !!hovered[position] || !!touchOpen[position]"
          @close="dismiss"
          @height="onHeight"
        />
      </TransitionGroup>
    </section>
  </Teleport>
</template>
