<template>
  <div class="game-board" :class="{ 'game-over': gameOver }">
    <!-- 棋盘容器 -->
    <div class="board-container" ref="boardRef">
      <!-- 棋盘背景 -->
      <div class="board-background">
        <div class="board-texture"></div>
        <div class="board-shadow"></div>
      </div>
      
      <!-- 棋盘网格 -->
      <div class="board-grid">
        <div 
          v-for="(row, i) in board" 
          :key="i" 
          class="board-row"
        >
          <div 
            v-for="(cell, j) in row" 
            :key="j" 
            class="board-cell"
            :class="{
              'can-move': canMove && !cell && !gameOver,
              'last-move': isLastMove(i, j),
              'win-cell': isWinningCell(i, j),
              'has-piece': !!cell
            }"
            @click="handleCellClick(i, j)"
            @mouseenter="handleCellHover(i, j)"
            @mouseleave="handleCellLeave"
          >
            <div 
              v-if="cell" 
              class="piece"
              :class="[
                cell,
                {
                  'placing': isLastMove(i, j),
                  'winning': isWinningCell(i, j)
                }
              ]"
            >
              <div class="piece-shadow"></div>
              <div class="piece-highlight"></div>
            </div>
            <div 
              v-else-if="showPreview && canMove && previewCell === `${i}-${j}`" 
              class="piece preview"
              :class="currentPlayer"
            >
              <div class="piece-shadow preview"></div>
            </div>
            <div 
              v-if="showHints && canMove && !cell && !gameOver"
              class="hint-marker"
            ></div>
          </div>
        </div>
      </div>

      <!-- 棋盘坐标 -->
      <div class="board-coordinates">
        <!-- 横坐标 -->
        <div class="coordinate-row">
          <span 
            v-for="i in 15" 
            :key="i"
            class="coordinate"
          >{{ String.fromCharCode(64 + i) }}</span>
        </div>
        <!-- 纵坐标 -->
        <div class="coordinate-col">
          <span 
            v-for="i in 15" 
            :key="i"
            class="coordinate"
          >{{ i }}</span>
        </div>
      </div>

      <!-- 游戏结束遮罩 -->
      <div 
        v-if="gameOver"
        class="game-over-mask"
      >
        <div class="game-over-content">
          <h2>{{ winner ? (winner === 'black' ? '黑棋胜' : '白棋胜') : '平局' }}</h2>
          <div class="winning-path" v-if="winningCells.length">
            <div 
              v-for="(cell, index) in winningCells" 
              :key="index"
              class="winning-piece"
              :style="getWinningPieceStyle(cell)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Board, PlayerColor } from '../../types'
import { playSound } from '../../utils/audio'
import { useThrottleFn } from '@vueuse/core'

// Props
const props = defineProps<{
  board: Board
  currentPlayer: PlayerColor
  gameMode: 'pve' | 'online'
  gameOver: boolean
  winner: PlayerColor | null
  canMove: boolean
  lastMove: { row: number; col: number } | null
  showHints?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'move', row: number, col: number): void
}>()

// Refs
const boardRef = ref<HTMLElement | null>(null)
const previewCell = ref<string | null>(null)
const showPreview = ref(true)

// 计算属性
const winningCells = computed(() => {
  if (!props.gameOver || !props.winner || !props.lastMove) return []
  return calculateWinningCells(props.board, props.lastMove, props.winner)
})

// 节流的单元格点击处理
const handleCellClick = useThrottleFn((row: number, col: number) => {
  if (!props.canMove || props.board[row][col] || props.gameOver) return
  emit('move', row, col)
  playSound('place')
}, 300)

// 优化的单元格悬停处理
const handleCellHover = useThrottleFn((row: number, col: number) => {
  if (!props.canMove || props.board[row][col] || props.gameOver) {
    previewCell.value = null
    return
  }
  previewCell.value = `${row}-${col}`
}, 50)

const handleCellLeave = () => {
  previewCell.value = null
}

// 检查是否是最后一步
const isLastMove = (row: number, col: number): boolean => {
  return props.lastMove?.row === row && props.lastMove?.col === col
}

// 检查是否是获胜路径上的棋子
const isWinningCell = (row: number, col: number): boolean => {
  return winningCells.value.includes(`${row}-${col}`)
}

// 计算获胜路径上棋子的样式
const getWinningPieceStyle = (cell: string) => {
  const [row, col] = cell.split('-').map(Number)
  const cellSize = boardRef.value ? boardRef.value.clientWidth / 15 : 0
  return {
    left: `${col * cellSize}px`,
    top: `${row * cellSize}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`
  }
}

// 计算获胜路径
function calculateWinningCells(
  board: Board,
  lastMove: { row: number; col: number },
  winner: PlayerColor
): string[] {
  const { row, col } = lastMove
  const directions = [
    [1, 0],   // 横向
    [0, 1],   // 纵向
    [1, 1],   // 主对角线
    [1, -1]   // 副对角线
  ]

  for (const [dx, dy] of directions) {
    const cells = []
    let count = 1
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) break
      if (board[newRow][newCol] !== winner) break
      cells.push(`${newRow}-${newCol}`)
      count++
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) break
      if (board[newRow][newCol] !== winner) break
      cells.push(`${newRow}-${newCol}`)
      count++
    }
    
    if (count >= 5) {
      cells.push(`${row}-${col}`)
      return cells
    }
  }
  
  return []
}

// 监听窗口大小变化，更新棋盘尺寸
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (boardRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // 更新棋盘尺寸相关的计算
    })
    resizeObserver.observe(boardRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// 监听游戏状态变化
watch(() => props.gameOver, (newValue) => {
  if (newValue && props.winner) {
    playSound('win')
  }
})
</script>

<style scoped>
.game-board {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  aspect-ratio: 1;
  position: relative;
}

.board-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.board-background {
  position: absolute;
  inset: 0;
  background: var(--board-bg);
  box-shadow: var(--shadow-lg);
}

.board-texture {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.5;
}

.board-shadow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
}

.board-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: repeat(15, 1fr);
  width: 100%;
  height: 100%;
  padding: 20px;
}

.board-cell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-cell::before,
.board-cell::after {
  content: '';
  position: absolute;
  background: var(--board-line);
  pointer-events: none;
}

.board-cell::before {
  width: 100%;
  height: 1px;
  top: 50%;
  transform: translateY(-50%);
}

.board-cell::after {
  width: 1px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.piece {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.piece.black {
  background: var(--piece-black);
}

.piece.white {
  background: var(--piece-white);
  border: 1px solid rgba(0,0,0,0.1);
}

.piece-shadow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  pointer-events: none;
}

.piece-highlight {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

.piece.preview {
  opacity: 0.3;
  transform: scale(0.9);
}

.piece.placing {
  animation: place 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.piece.winning {
  animation: winning 1s ease-in-out infinite;
}

.hint-marker {
  position: absolute;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;
  pointer-events: none;
}

.board-cell:hover .hint-marker {
  opacity: 0.2;
  transform: scale(1);
}

.board-coordinates {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.coordinate {
  position: absolute;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.coordinate-row {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.coordinate-col {
  position: absolute;
  top: 20px;
  left: 0;
  width: 20px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.game-over-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.5s ease;
}

.game-over-content {
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.winning-path {
  position: relative;
  width: 100%;
  height: 100%;
}

.winning-piece {
  position: absolute;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0.5;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes place {
  0% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes winning {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .board-container {
    border-radius: var(--border-radius-sm);
  }

  .board-grid {
    padding: 10px;
  }

  .coordinate {
    font-size: 0.7rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .board-texture {
    opacity: 0.3;
  }

  .coordinate {
    color: var(--text-secondary-dark);
  }
}
</style> 