import GameBoard from './GameBoard.vue'
import GameHeader from './GameHeader.vue'
import PlayerCard from './PlayerCard.vue'
import GameControls from './GameControls.vue'

export default {
  install(app) {
    app.component('GameBoard', GameBoard)
    app.component('GameHeader', GameHeader)
    app.component('PlayerCard', PlayerCard)
    app.component('GameControls', GameControls)
  }
} 