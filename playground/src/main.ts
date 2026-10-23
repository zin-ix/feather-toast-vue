import { createApp } from 'vue'
import App from './App.vue'
import { CreateFeatherToast } from '@feather-vue/toast'

const app = createApp(App)
app.use(CreateFeatherToast)
app.mount('#app')
