import { createVNode, render, type App } from 'vue'
import ToastContainer from '../components/ToastContainer.vue'
import { useToast } from '../composables/useToast'

const TOAST_ROOT_ID = 'feather-toast-root'

export const ToastPlugin = {
  install(app: App) {
    const toastApi = useToast()
    app.provide('toast', toastApi)

    if (typeof document === 'undefined') {
      return
    }

    let mountPoint = document.getElementById(TOAST_ROOT_ID)

    if (!mountPoint) {
      mountPoint = document.createElement('div')
      mountPoint.id = TOAST_ROOT_ID
      document.body.appendChild(mountPoint)
    }

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

export { useToast } from '../composables/useToast'
