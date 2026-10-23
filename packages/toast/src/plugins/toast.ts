import { createVNode, render, type App } from 'vue'
import ToastContainer from '../components/ToastContainer.vue'
import { useFeatherToast, restoreFlashes } from '../composables/useToast'
import toastStyles from '../assets/toast.css?inline'

const TOAST_ROOT_ID = 'feather-toast-root'
const TOAST_STYLE_ID = 'feather-toast-style'

export interface FeatherToastPluginOptions {
  /**
   * Inject the stylesheet automatically (default true). Set false when you
   * import 'feather-toast-vue/style.css' yourself, e.g. under a strict CSP.
   */
  injectStyles?: boolean
}

export const CreateFeatherToast = {
  install(app: App, options: FeatherToastPluginOptions = {}) {
    const toastApi = useFeatherToast()
    app.provide('toast', toastApi)

    if (typeof document === 'undefined') {
      return
    }

    if (options.injectStyles !== false && !document.getElementById(TOAST_STYLE_ID)) {
      const styleTag = document.createElement('style')
      styleTag.id = TOAST_STYLE_ID
      styleTag.textContent = toastStyles
      document.head.appendChild(styleTag)
    }

    let mountPoint = document.getElementById(TOAST_ROOT_ID)

    if (!mountPoint) {
      mountPoint = document.createElement('div')
      mountPoint.id = TOAST_ROOT_ID
      document.body.appendChild(mountPoint)
    }

    restoreFlashes()

    const containerVNode = createVNode(ToastContainer)
    containerVNode.appContext = app._context
    render(containerVNode, mountPoint)

    const originalUnmount = app.unmount
    app.unmount = (...args: Parameters<typeof app.unmount>) => {
      render(null, mountPoint)
      if (mountPoint?.parentNode) {
        mountPoint.parentNode.removeChild(mountPoint)
      }
      originalUnmount(...args)
    }
  },
}

export { useFeatherToast } from '../composables/useToast'
