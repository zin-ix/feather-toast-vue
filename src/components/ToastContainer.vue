<script setup lang="ts">
import { useToast } from '../composables/useToast'
import Toast from './Toast.vue'
import type { ToastPosition } from '../types/toast'

const { toasts, dismiss } = useToast()

const positions: ToastPosition[] = [
  'top-right',
  'top-left',
  'top-center',
  'bottom-right',
  'bottom-left',
  'bottom-center',
]

function toastsByPosition(position: ToastPosition) {
  return toasts.value.filter((t) => t.position === position)
}

function transitionName(position: ToastPosition): string {
  if (position.includes('right')) return 'toast-slide-right'
  if (position.includes('left')) return 'toast-slide-left'
  if (position.startsWith('top')) return 'toast-slide-down'
  return 'toast-slide-up'
}
</script>

<template>
  <Teleport to="body">
    <template v-for="position in positions" :key="position">
      <div
        v-if="toastsByPosition(position).length > 0"
        :class="['toast-viewport', `toast-viewport--${position}`]"
        aria-live="polite"
        aria-label="Notifications"
      >
        <!--
          tag="div" gives TransitionGroup a real DOM parent with
          position:relative (set via .toast-tg), which is required
          for leave-active's position:absolute to anchor correctly.
        -->
        <TransitionGroup :name="transitionName(position)" tag="div" class="toast-tg">
          <Toast
            v-for="t in toastsByPosition(position)"
            :key="t.id"
            :toast="t"
            @close="dismiss"
          />
        </TransitionGroup>
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
/*
  The TransitionGroup wrapper must be position:relative so that
  leave-active's position:absolute anchors within it — otherwise
  leaving toasts jump to the nearest positioned ancestor (body).
*/
.toast-tg {
  position: relative;
  display: flex;
  flex-direction: inherit;
  align-items: inherit;
  gap: inherit;
}
</style>
