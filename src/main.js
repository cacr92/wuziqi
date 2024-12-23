import { createApp } from 'vue'
import App from './App.vue'
import Components from './components'
import '@/styles.css'

const app = createApp(App)
app.use(Components)
app.mount('#app') 