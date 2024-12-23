import GameHeader from './GameHeader.vue'
import PlayerCard from './PlayerCard.vue'
import GameControls from './GameControls.vue'
import GameBoard from './GameBoard.vue'

export default {
    install(app) {
        app.component('GameHeader', GameHeader)
        app.component('PlayerCard', PlayerCard)
        app.component('GameControls', GameControls)
        app.component('GameBoard', GameBoard)
    }
} 