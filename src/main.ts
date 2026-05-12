import { createApp } from 'vue'
import App from './App.vue'
import { CreateFeatherToast } from './index'

const app = createApp(App)
app.use(CreateFeatherToast)
app.mount('#app')
