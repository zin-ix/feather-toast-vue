import { createApp } from 'vue'
import App from './App.vue'
import { CreateFeatherToast } from 'feather-toast-vue'

const app = createApp(App)
app.use(CreateFeatherToast)
app.mount('#app')
