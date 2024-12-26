import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/theme.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 开发环境下的提示
if (import.meta.env.DEV) {
  console.log('游戏启动成功！')
} 