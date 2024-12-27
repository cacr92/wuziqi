<template>
  <div class="game-layout">
    <header class="game-header">
      <div class="game-info">
        <h1>{{ props.gameMode === 'pve' ? '人机对战' : '在线对战' }}</h1>
        <div class="game-status">
          <span 
            class="status-text"
            :class="{ 
              'thinking': props.isThinking,
              'your-turn': currentPlayer === props.playerColor && !gameOver
            }"
          >
            {{ statusText }}
          </span>
          <GameTimer
            v-if="!gameOver"
            :current-player="currentPlayer"
            :game-started="!gameOver"
            @time-up="handleTimeUp"
          />
        </div>
      </div>
    </header>

    <main class="game-main">
      <div class="board-section">
        <GameBoard
          :board="board"
          :current-player="currentPlayer"
          :game-mode="props.gameMode"
          :game-over="gameOver"
          :winner="winner"
          :can-move="canMove"
          :can-undo="canUndo"
          :last-move="lastMove"
          @move="handleMove"
        />
      </div>

      <aside class="game-sidebar">
        <div class="players-info">
          <PlayerCard
            name="黑方"
            piece-color="black"
            :is-active="currentPlayer === 'black'"
            :is-ai="props.gameMode === 'pve' && currentPlayer === 'black'"
            :stats="{ wins: 0, losses: 0 }"
          />
          <div class="vs-badge">VS</div>
          <PlayerCard
            name="白方"
            piece-color="white"
            :is-active="currentPlayer === 'white'"
            :is-ai="props.gameMode === 'pve' && currentPlayer === 'white'"
            :stats="{ wins: 0, losses: 0 }"
          />
        </div>

        <div class="controls-container">
          <GameControls
            :can-undo="canUndo"
            :game-over="gameOver"
            @undo="undoMove"
            @restart="restartGame"
            @surrender="surrender"
            @back="$router.push('/')"
          />
        </div>
      </aside>
    </main>

    <GameModal v-if="showResult" title="游戏结束" @close="showResult = false">
      <div class="result-content">
        <i class="fas fa-trophy result-icon"></i>
        <h2>{{ winner === 'black' ? '黑方胜利！' : '白方胜利！' }}</h2>
        <div class="result-actions">
          <button class="primary-btn" @click="restartGame">
            再来一局
          </button>
          <button class="secondary-btn" @click="$router.push('/')">
            返回菜单
          </button>
        </div>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../stores/game'
import type { Board, PlayerColor } from '../../types'
import GameBoard from '../game/GameBoard.vue'
import GameControls from '../game/GameControls.vue'
import GameTimer from '../game/GameTimer.vue'
import GameModal from '../game/GameModal.vue'
import PlayerCard from '../game/PlayerCard.vue'
import { AI } from '../../utils/ai.ts'
import { checkWin, getEmptyBoard } from '../../utils/gameLogic'
import { playSound } from '@/utils/audio'

const props = defineProps<{
  gameMode: 'pve' | 'online'
  playerColor?: PlayerColor
  isThinking?: boolean
}>()

const router = useRouter()
const gameStore = useGameStore()

// 游戏状态
const board = ref<Board>(getEmptyBoard())
const currentPlayer = ref<PlayerColor>('black')
const gameOver = ref(false)
const winner = ref<PlayerColor | null>(null)
const lastMove = ref<{ row: number; col: number } | null>(null)
const moveHistory = ref<{ row: number; col: number; player: PlayerColor }[]>([])
const showResult = ref(false)

// AI实例
const ai = new AI()

// 计算属性
const canMove = computed(() => {
  if (gameOver.value) return false
  if (props.isThinking) return false
  
  if (props.gameMode === 'pve') {
    return currentPlayer.value === 'black'
  }
  
  if (props.gameMode === 'online') {
    return currentPlayer.value === props.playerColor
  }
  
  return true
})

const canUndo = computed(() => {
  return moveHistory.value.length > 0 && !gameOver.value
})

// 添加状态显示
const statusText = computed(() => {
  if (gameOver.value) {
    return winner.value === props.playerColor ? '你赢了！' : '你输了！'
  }
  
  if (props.isThinking) {
    return '等待对手...'
  }
  
  if (props.gameMode === 'online') {
    return currentPlayer.value === props.playerColor ? '轮到你了' : '对手思考中'
  }
  
  return currentPlayer.value === 'black' ? '黑方回合' : '白方回合'
})

// 方法
const handleMove = async (row: number, col: number) => {
  if (!canMove.value || board.value[row][col]) return
  
  makeMove(row, col)
  
  if (props.gameMode === 'pve' && !gameOver.value) {
    await aiMove()
  }
}

const makeMove = (row: number, col: number) => {
  if (!canMove.value || board.value[row][col]) return
  
  board.value[row][col] = currentPlayer.value
  lastMove.value = { row, col }
  moveHistory.value.push({ row, col, player: currentPlayer.value })
  
  playSound('place')
  
  if (checkWin(board.value, row, col, currentPlayer.value)) {
    gameOver.value = true
    winner.value = currentPlayer.value
    showResult.value = true
    playSound('win')
    return
  }
  
  currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'
}

const aiMove = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const move = await ai.getMove(board.value)
  if (move) {
    makeMove(move.row, move.col)
  }
}

const undoMove = () => {
  if (!canUndo.value) return
  
  const lastTwo = moveHistory.value.splice(-2)
  lastTwo.forEach(move => {
    board.value[move.row][move.col] = null
  })
  
  lastMove.value = moveHistory.value[moveHistory.value.length - 1] || null
  currentPlayer.value = 'black'
  playSound('undo')
}

const surrender = () => {
  gameOver.value = true
  winner.value = currentPlayer.value === 'black' ? 'white' : 'black'
  showResult.value = true
}

const restartGame = () => {
  board.value = getEmptyBoard()
  currentPlayer.value = 'black'
  gameOver.value = false
  winner.value = null
  lastMove.value = null
  moveHistory.value = []
  showResult.value = false
  playSound('start')
}

const handleTimeUp = (player: PlayerColor) => {
  gameOver.value = true
  winner.value = player === 'black' ? 'white' : 'black'
  showResult.value = true
  // gameStore.addGame() is not defined in the store, so we'll remove this line
}
</script>

<style scoped>
.game-layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 2rem;
  padding: 2rem;
  background: var(--bg-primary);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.game-main {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.board-section {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.game-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.players-info {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vs-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: bold;
}

.result-content {
  text-align: center;
  padding: 2rem;
}

.result-icon {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-btn,
.secondary-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.primary-btn {
  background: var(--primary);
  color: white;
}

.secondary-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

@media (max-width: 1024px) {
  .game-layout {
    padding: 1rem;
  }

  .game-main {
    grid-template-columns: 1fr;
  }

  .game-sidebar {
    width: 100%;
  }
}

.status-text {
  font-weight: 500;
  transition: var(--transition);
}

.status-text.thinking {
  color: var(--text-secondary);
}

.status-text.your-turn {
  color: var(--primary);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
</style> 