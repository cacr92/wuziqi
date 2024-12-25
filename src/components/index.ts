import type { App } from 'vue'
import GameBoard from './board/GameBoard.vue'
import GameTimer from './game/GameTimer.vue'
import GameControls from './game/GameControls.vue'

export default {
  install(app: App) {
    app.component('GameBoard', GameBoard)
    app.component('GameTimer', GameTimer)
    app.component('GameControls', GameControls)
  }
} 