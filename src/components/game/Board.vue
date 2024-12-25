<template>
  <div class="board-container">
    <canvas 
      ref="canvasRef"
      class="game-board"
      @click="handleClick"
      @mousemove="handleMouseMove"
    ></canvas>
    
    <div class="game-info">
      <div class="player-info">
        <div class="player" :class="{ active: currentPlayer === 'black' }">
          <div class="piece black"></div>
          <span>黑方{{ gameMode === 'pve' && currentPlayer === 'black' ? '(AI)' : '' }}</span>
        </div>
        <div class="player" :class="{ active: currentPlayer === 'white' }">
          <div class="piece white"></div>
          <span>白方{{ gameMode === 'pve' && currentPlayer === 'white' ? '(AI)' : '' }}</span>
        </div>
      </div>
      
      <div class="controls">
        <button class="control-btn" @click="undo" :disabled="!canUndo">
          <i class="fas fa-undo"></i>
          <span>悔棋</span>
        </button>
        <button class="control-btn" @click="restart">
          <i class="fas fa-redo"></i>
          <span>重新开始</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  gameMode: 'pve' | 'online'
}>()

const emit = defineEmits<{
  (e: 'move', pos: { x: number, y: number }): void
  (e: 'undo'): void
  (e: 'restart'): void
}>()

// 棋盘状态
const BOARD_SIZE = 15
const CELL_SIZE = 40
const PIECE_RADIUS = CELL_SIZE * 0.4

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const currentPlayer = ref<'black' | 'white'>('black')
const board = ref<Array<Array<'black' | 'white' | null>>>(
  Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
)
const canUndo = ref(false)
const hoverPos = ref<{ x: number, y: number } | null>(null)

// 初始化画布
onMounted(() => {
  const canvas = canvasRef.value!
  ctx.value = canvas.getContext('2d')!
  
  // 设置画布大小
  const size = CELL_SIZE * (BOARD_SIZE + 1)
  canvas.width = size
  canvas.height = size
  
  drawBoard()
})

// 绘制棋盘
function drawBoard() {
  const context = ctx.value!
  const size = CELL_SIZE * (BOARD_SIZE + 1)
  
  // 清空画布
  context.clearRect(0, 0, size, size)
  
  // 绘制背景
  context.fillStyle = '#f3d19e'
  context.fillRect(0, 0, size, size)
  
  // 绘制网格
  context.beginPath()
  context.strokeStyle = '#444444'
  context.lineWidth = 1
  
  for (let i = 0; i <= BOARD_SIZE; i++) {
    const pos = CELL_SIZE * (i + 0.5)
    context.moveTo(pos, CELL_SIZE * 0.5)
    context.lineTo(pos, size - CELL_SIZE * 0.5)
    context.moveTo(CELL_SIZE * 0.5, pos)
    context.lineTo(size - CELL_SIZE * 0.5, pos)
  }
  context.stroke()
  
  // 绘制棋子
  board.value.forEach((row, y) => {
    row.forEach((piece, x) => {
      if (piece) {
        drawPiece(x, y, piece)
      }
    })
  })
  
  // 绘制悬停效果
  if (hoverPos.value) {
    const { x, y } = hoverPos.value
    if (!board.value[y][x]) {
      drawPiece(x, y, currentPlayer.value, true)
    }
  }
}

// 绘制棋子
function drawPiece(x: number, y: number, type: 'black' | 'white', isHover = false) {
  const context = ctx.value!
  const centerX = CELL_SIZE * (x + 1)
  const centerY = CELL_SIZE * (y + 1)
  
  context.beginPath()
  context.arc(centerX, centerY, PIECE_RADIUS, 0, Math.PI * 2)
  
  if (isHover) {
    context.fillStyle = type === 'black' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
  } else {
    const gradient = context.createRadialGradient(
      centerX - 3, centerY - 3, 1,
      centerX, centerY, PIECE_RADIUS
    )
    
    if (type === 'black') {
      gradient.addColorStop(0, '#606060')
      gradient.addColorStop(1, '#000000')
    } else {
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(1, '#d0d0d0')
    }
    
    context.fillStyle = gradient
  }
  
  context.fill()
  
  if (!isHover) {
    context.strokeStyle = type === 'black' ? '#000000' : '#888888'
    context.lineWidth = 1
    context.stroke()
  }
}

// 处理点击事件
function handleClick(e: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE - 0.5)
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE - 0.5)
  
  if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && !board.value[y][x]) {
    emit('move', { x, y })
  }
}

// 处理鼠标移动
function handleMouseMove(e: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE - 0.5)
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE - 0.5)
  
  if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
    hoverPos.value = { x, y }
  } else {
    hoverPos.value = null
  }
  
  drawBoard()
}

// 悔棋
function undo() {
  emit('undo')
}

// 重新开始
function restart() {
  emit('restart')
}

// 监听棋盘变化
watch(() => props.gameMode, () => {
  board.value = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  currentPlayer.value = 'black'
  canUndo.value = false
  drawBoard()
})
</script>

<style scoped>
.board-container {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  height: 100%;
  align-items: center;
}

.game-board {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  opacity: 0.6;
  transition: all 0.2s;
}

.player.active {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.piece {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.piece.black {
  background: #000;
}

.piece.white {
  background: #fff;
  border: 1px solid #ccc;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 