import { createApp } from 'vue'
import App from './App.vue'
import { ToastPlugin } from './index'

const app = createApp(App)
app.use(ToastPlugin)
app.mount('#app')
