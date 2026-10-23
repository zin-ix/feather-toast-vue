// Styles are injected by the plugin; dist/feather-toast-vue.css is emitted
// separately by vite.config.lib.ts for `injectStyles: false` setups.
export { CreateFeatherToast } from './plugins/toast'
export type { FeatherToastPluginOptions } from './plugins/toast'
export { useFeatherToast, useToast } from './composables/useToast'
export { default as ToastContainer } from './components/ToastContainer.vue'
export {
  getToasts,
  findToast,
  expectToast,
  expectNoToasts,
  clickToastAction,
  resetToasts,
} from './testing'
export type { ToastMatcher, ToastSnapshot } from './testing'
export type {
  Toast,
  ToastOptions,
  ToastAction,
  ToastVariant,
  ToastPosition,
  ToastPromiseOptions,
  ToastConfig,
  UndoToastOptions,
  StepToastController,
  ProgressToastController,
  NetworkToastOptions,
  NetworkToastController,
  ToastComponent,
  ToastTheme,
  ConfirmToastOptions,
  RetryToastOptions,
} from './types/toast'
