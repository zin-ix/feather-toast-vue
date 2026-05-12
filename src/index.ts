import './assets/toast.css'

export { CreateFeatherToast } from './plugins/toast'
export { useFeatherToast, useToast } from './composables/useToast'
export { default as ToastContainer } from './components/ToastContainer.vue'
export type {
  Toast,
  ToastOptions,
  ToastAction,
  ToastVariant,
  ToastPosition,
  ToastPromiseOptions,
} from './types/toast'
