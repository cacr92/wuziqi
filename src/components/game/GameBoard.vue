<template>
  <div class="game-container">
    <header class="game-header">
      <div class="game-info">
        <h1 class="game-title">{{ gameMode === 'pve' ? '人机对战' : '在线对战' }}</h1>
        <div class="game-status">
          <span class="current-player">
            当前: {{ currentPlayer === 'black' ? '黑方' : '白方' }}
          </span>
          <GameTimer
            v-if="!gameOver"
            :current-player="currentPlayer"
            @time-up="handleTimeUp"
          />
        </div>
      </div>
      <button class="back-btn" @click="$router.push('/')">
        <i class="fas fa-arrow-left"></i>
        返回菜单
      </button>
    </header>

    <main class="game-main">
      <div class="board-section">
        <div class="board-container">
          <BoardGrid />
          <div class="board">
            <div 
              v-for="(row, i) in board" 
              :key="i" 
              class="board-row"
            >
              <div 
                v-for="(cell, j) in row" 
                :key="j"
                class="board-cell"
                @click="handleCellClick(i, j)"
                :class="{ 'can-move': !gameOver && !cell }"
              >
                <div 
                  v-if="cell" 
                  class="piece"
                  :class="[cell, { 'animate': isLastMove(i, j) }]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="game-sidebar">
        <div class="players-container">
          <PlayerCard
            name="黑方"
            piece-color="black"
            :is-active="currentPlayer === 'black'"
            :is-ai="gameMode === 'pve'"
          />
          <div class="vs-badge">VS</div>
          <PlayerCard
            name="白方"
            piece-color="white"
            :is-active="currentPlayer === 'white'"
            :is-ai="false"
          />
        </div>

        <div class="controls-container">
          <button 
            class="control-btn undo"
            :disabled="!canUndo || gameOver"
            @click="handleUndo"
          >
            <i class="fas fa-undo"></i>
            悔棋
          </button>
          <button 
            class="control-btn restart"
            @click="handleRestart"
          >
            <i class="fas fa-redo"></i>
            重新开始
          </button>
          <button 
            class="control-btn surrender"
            :disabled="gameOver"
            @click="handleSurrender"
          >
            <i class="fas fa-flag"></i>
            认输
          </button>
        </div>
      </aside>
    </main>

    <GameModal 
      v-if="gameOver"
      :title="getResultText()"
      @close="handleRestart"
    >
      <div class="result-content">
        <div class="result-icon">
          <i :class="winner === 'black' ? 'fas fa-chess-pawn' : 'far fa-chess-pawn'"></i>
        </div>
        <div class="result-actions">
          <button class="primary-btn" @click="handleRestart">
            再来一��
          </button>
          <button class="secondary-btn" @click="$emit('exit')">
            返回菜单
          </button>
        </div>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GameHeader from './GameHeader.vue'
import GameControls from './GameControls.vue'
import BoardGrid from '../board/BoardGrid.vue'
import PlayerCard from './PlayerCard.vue'
import GameTimer from './GameTimer.vue'
import GameModal from './GameModal.vue'
import { checkWin } from '../../utils/gameLogic'
import { playSound } from '../../utils/audio'
import type { PlayerColor } from '../../types'
import { AI } from '../../utils/ai.ts'

const props = defineProps<{
  gameMode: 'pve' | 'online'
}>()

const board = ref<(PlayerColor | null)[][]>(
  Array(15).fill(null).map(() => Array(15).fill(null))
)
const currentPlayer = ref<PlayerColor>('black')
const gameOver = ref(false)
const winner = ref<PlayerColor | null>(null)
const canUndo = ref(false)
const lastMove = ref<{row: number, col: number} | null>(null)
const moveHistory = ref<{row: number, col: number, player: PlayerColor}[]>([])

const ai = new AI('medium')
const isAITurn = computed(() => {
  return props.gameMode === 'pve' && currentPlayer.value === 'white'
})

const isLastMove = (row: number, col: number) => {
  return lastMove.value?.row === row && lastMove.value?.col === col
}

const handleCellClick = async (row: number, col: number) => {
  if (gameOver.value || board.value[row][col] || isAITurn.value) return
  
  makeMove(row, col)
  
  if (props.gameMode === 'pve' && !gameOver.value) {
    await aiMove()
  }
}

const makeMove = (row: number, col: number) => {
  board.value[row][col] = currentPlayer.value
  lastMove.value = { row, col }
  moveHistory.value.push({ row, col, player: currentPlayer.value })
  playSound('place')
  
  if (checkWin(board.value, row, col, currentPlayer.value)) {
    gameOver.value = true
    winner.value = currentPlayer.value
    playSound('win')
    return
  }
  
  currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'
  canUndo.value = true
}

const aiMove = async () => {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
  
  const move = ai.getMove(board.value)
  if (move) {
    makeMove(move.row, move.col)
  }
}

const handleUndo = () => {
  if (moveHistory.value.length === 0 || isAITurn.value) return
  
  if (props.gameMode === 'pve') {
    for (let i = 0; i < 2; i++) {
      const lastMove = moveHistory.value.pop()
      if (lastMove) {
        board.value[lastMove.row][lastMove.col] = null
      }
    }
  } else {
    const lastMove = moveHistory.value.pop()!
    board.value[lastMove.row][lastMove.col] = null
  }
  
  currentPlayer.value = 'black'
  canUndo.value = moveHistory.value.length > 0
  playSound('undo')
}

const handleRestart = () => {
  board.value = Array(15).fill(null).map(() => Array(15).fill(null))
  currentPlayer.value = 'black'
  gameOver.value = false
  winner.value = null
  canUndo.value = false
  lastMove.value = null
  moveHistory.value = []
  playSound('start')
}

const handleSurrender = () => {
  gameOver.value = true
  winner.value = currentPlayer.value === 'black' ? 'white' : 'black'
}

const handleTimeUp = (player: PlayerColor) => {
  gameOver.value = true
  winner.value = player === 'black' ? 'white' : 'black'
}

const getResultText = () => {
  if (!winner.value) return '平局'
  return `${winner.value === 'black' ? '黑方' : '白方'}获胜！`
}

defineEmits<{
  (e: 'undo'): void
  (e: 'restart'): void
  (e: 'surrender'): void
  (e: 'exit'): void
}>()
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

.game-header {
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--primary);
}

.game-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.current-player {
  font-weight: 500;
  color: var(--text-secondary);
}

.back-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: var(--primary-light);
  color: var(--text-light);
}

.game-main {
  flex: 1;
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.board-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.board-container {
  position: relative;
  background: var(--bg-board);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg),
    inset 0 0 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.board {
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  gap: 1px;
  position: relative;
  z-index: 1;
}

.board-row {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 1px;
}

.board-cell {
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
}

.board-cell.can-move:hover::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.piece {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  transition: var(--transition);
  cursor: not-allowed;
}

.piece.black {
  background: var(--piece-black);
  box-shadow: 
    var(--shadow-sm),
    inset -2px -2px 4px rgba(0, 0, 0, 0.3),
    inset 2px 2px 4px rgba(255, 255, 255, 0.1);
}

.piece.white {
  background: var(--piece-white);
  border: 1px solid #ddd;
  box-shadow: 
    var(--shadow-sm),
    inset -2px -2px 4px rgba(0, 0, 0, 0.05),
    inset 2px 2px 4px rgba(255, 255, 255, 0.8);
}

.piece.animate {
  animation: place-piece 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.players-container {
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
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: bold;
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-btn {
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.undo {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.control-btn.restart {
  background: var(--primary);
  color: var(--text-light);
}

.control-btn.surrender {
  background: #DC3545;
  color: var(--text-light);
}

.result-content {
  text-align: center;
  padding: 2rem;
}

.result-icon {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 2rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.primary-btn,
.secondary-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.primary-btn {
  background: var(--primary);
  color: var(--text-light);
}

.secondary-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

@keyframes place-piece {
  0% {
    transform: scale(1.2) translateY(-10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .game-main {
    flex-direction: column;
    padding: 1rem;
  }

  .game-sidebar {
    width: 100%;
  }

  .board-cell {
    width: 30px;
    height: 30px;
  }

  .vs-badge {
    display: none;
  }

  .controls-container {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .control-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style> 