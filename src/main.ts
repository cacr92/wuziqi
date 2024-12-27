import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入全局样式
import './styles/variables.css'  // CSS 变量
import './styles/theme.css'      // 主题样式
import './styles/global.css'     // 全局基础样式
import './styles/main.css'       // 主要样式
import './styles/game.css'       // 游戏相关样式

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app') 