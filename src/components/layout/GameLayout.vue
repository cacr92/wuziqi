<template>
  <div class="game-layout">
    <header class="game-header">
      <GameHeader
        :current-player="currentPlayer"
        :game-mode="gameMode"
        :game-over="gameOver"
        :winner="winner"
      />
    </header>

    <main class="game-main">
      <div class="board-container">
        <GameBoard
          :board="board"
          :current-player="currentPlayer"
          :can-move="canMove"
          :last-move="lastMove"
          @move="handleMove"
        />
      </div>

      <div class="side-panel">
        <GameTimer 
          :current-player="currentPlayer"
          :game-started="!gameOver"
        />
        
        <GameControls
          :can-undo="canUndo"
          :game-over="gameOver"
          @undo="undoMove"
          @restart="restartGame"
          @surrender="surrender"
          @back="$emit('back')"
        />
      </div>
    </main>

    <GameModal v-if="showResult" title="游戏结束" @close="showResult = false">
      <GameResult
        :result="gameResult"
        :stats="gameStore.stats"
        @restart="restartGame"
        @back="$emit('back')"
      />
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/game'
import type { Board, PlayerColor } from '../../types'
import GameHeader from '../game/GameHeader.vue'
import GameBoard from '../board/GameBoard.vue'
import GameControls from '../game/GameControls.vue'
import GameModal from '../game/GameModal.vue'
import GameResult from '../game/GameResult.vue'
import { AI } from '../game/GameAI'
import { checkWin, getEmptyBoard } from '../../utils/gameLogic'
import { playSound } from '../../utils/audio'

const props = defineProps<{
  gameMode: 'pve' | 'online'
  settings: {
    difficulty: string
    canUndo: boolean
    isMuted: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

// 状态管理
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
  return !gameOver.value && 
         (props.gameMode === 'pve' ? currentPlayer.value === 'black' : true)
})

const canUndo = computed(() => {
  return moveHistory.value.length > 0 && !gameOver.value
})

const gameResult = computed(() => {
  if (!winner.value) return 'draw'
  return winner.value === 'black' ? 'win' : 'loss'
})

// 方法
const handleMove = async (row: number, col: number) => {
  if (!canMove.value) return
  
  // 落子
  board.value[row][col] = currentPlayer.value
  lastMove.value = { row, col }
  moveHistory.value.push({ row, col, player: currentPlayer.value })
  playSound('place')
  
  // 检查胜负
  if (checkWin(board.value, row, col, currentPlayer.value)) {
    gameOver.value = true
    winner.value = currentPlayer.value
    showResult.value = true
    playSound('win')
    gameStore.addGame(currentPlayer.value === 'black' ? 'win' : 'loss')
    return
  }
  
  // 切换玩家
  currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'
  
  // AI回合
  if (props.gameMode === 'pve' && currentPlayer.value === 'white') {
    await new Promise(resolve => setTimeout(resolve, 500))
    const [aiRow, aiCol] = ai.getNextMove(board.value)
    handleMove(aiRow, aiCol)
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
  winner.value = 'white'
  showResult.value = true
  gameStore.addGame('loss')
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
</script>

<style scoped>
.game-layout {
  min-height: 100vh;
  padding: 2rem;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 2rem;
  background: var(--bg-primary);
}

.game-header {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.game-main {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
}

.board-container {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 300px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .game-main {
    grid-template-columns: 1fr;
  }

  .side-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .game-layout {
    padding: 1rem;
    gap: 1rem;
  }

  .board-container {
    padding: 1rem;
  }
}
</style> 