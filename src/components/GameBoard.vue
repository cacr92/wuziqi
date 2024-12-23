<template>
  <div class="game-board">
    <canvas
      ref="canvas"
      class="board-canvas"
      :class="{ 'cursor-not-allowed': !canMove }"
      @click="handleClick"
      @mousemove="handleMouseMove"
    ></canvas>
    <div class="board-overlay" v-if="!canMove">
      <div class="overlay-content">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <span>等待对手...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameBoard',
  props: {
    board: {
      type: Array,
      required: true
    },
    currentPlayer: {
      type: String,
      required: true
    },
    canMove: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      hoverPos: null,
      boardTheme: {
        background: '#DEB887',
        lines: '#4D2600',
        border: '#8B4513',
        shadow: 'rgba(0, 0, 0, 0.2)',
        blackPiece: {
          fill: '#000000',
          stroke: '#000000',
          highlight: '#666666',
          shadow: 'rgba(0, 0, 0, 0.5)'
        },
        whitePiece: {
          fill: '#FFFFFF',
          stroke: '#CCCCCC',
          highlight: '#EEEEEE',
          shadow: 'rgba(0, 0, 0, 0.2)'
        }
      }
    }
  },

  mounted() {
    this.initBoard()
    window.addEventListener('resize', this.resizeBoard)
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeBoard)
  },
  
  methods: {
    initBoard() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      
      // 设置画布大小
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // 缩放以适应 DPR
      ctx.scale(dpr, dpr)
      ctx.translate(0.5, 0.5) // 修复线条模糊
      
      this.drawBoard()
    },
    
    drawBoard() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      const cellSize = (size - 40) / 14 // 减去边距，14格
      const margin = 20 // 固定边距
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制棋盘背景
      ctx.fillStyle = this.boardTheme.background
      ctx.fillRect(margin, margin, size - margin * 2, size - margin * 2)
      
      // 添加棋盘边框阴影
      ctx.shadowColor = this.boardTheme.shadow
      ctx.shadowBlur = 15
      ctx.strokeStyle = this.boardTheme.border
      ctx.lineWidth = 2
      ctx.strokeRect(margin, margin, size - margin * 2, size - margin * 2)
      ctx.shadowBlur = 0
      
      // 绘制网格线
      ctx.beginPath()
      ctx.strokeStyle = this.boardTheme.lines
      ctx.lineWidth = 1
      
      for (let i = 0; i < 15; i++) {
        const pos = margin + i * cellSize
        ctx.moveTo(margin, pos)
        ctx.lineTo(size - margin, pos)
        ctx.moveTo(pos, margin)
        ctx.lineTo(pos, size - margin)
      }
      ctx.stroke()
      
      // 绘制天元和星位
      const starPoints = [
        [3, 3], [11, 3], [7, 7],
        [3, 11], [11, 11]
      ]
      
      starPoints.forEach(([x, y]) => {
        const px = margin + x * cellSize
        const py = margin + y * cellSize
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle = this.boardTheme.lines
        ctx.fill()
      })
      
      // 绘制棋子
      this.board.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell) {
            this.drawPiece(ctx, i, j, cell, cellSize, margin)
          }
        })
      })
      
      // 绘制悬停效果
      if (this.hoverPos && this.canMove && !this.board[this.hoverPos.row][this.hoverPos.col]) {
        this.drawHoverPiece(ctx, this.hoverPos.row, this.hoverPos.col, cellSize, margin)
      }
    },
    
    drawPiece(ctx, row, col, color, cellSize, margin) {
      const x = margin + col * cellSize
      const y = margin + row * cellSize
      const radius = cellSize * 0.4
      
      const theme = color === 'black' ? this.boardTheme.blackPiece : this.boardTheme.whitePiece
      
      // 绘制阴影
      ctx.shadowColor = theme.shadow
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      // 绘制棋子
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = theme.fill
      ctx.fill()
      
      // 清除阴影
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      // 绘制边框
      ctx.strokeStyle = theme.stroke
      ctx.lineWidth = 1
      ctx.stroke()
      
      // 添加高光效果
      const gradient = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        radius * 0.1,
        x,
        y,
        radius
      )
      gradient.addColorStop(0, theme.highlight)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fill()
    },
    
    drawHoverPiece(ctx, row, col, cellSize, margin) {
      ctx.globalAlpha = 0.3
      this.drawPiece(ctx, row, col, this.currentPlayer, cellSize, margin)
      ctx.globalAlpha = 1
    },
    
    handleClick(event) {
      if (!this.canMove) return
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      const cellSize = (size - 40) / 14
      const margin = 20
      
      const x = event.clientX - rect.left - margin
      const y = event.clientY - rect.top - margin
      
      const col = Math.round(x / cellSize)
      const row = Math.round(y / cellSize)
      
      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        this.$emit('make-move', { row, col })
      }
    },
    
    handleMouseMove(event) {
      if (!this.canMove) return
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      const cellSize = (size - 40) / 14
      const margin = 20
      
      const x = event.clientX - rect.left - margin
      const y = event.clientY - rect.top - margin
      
      const col = Math.round(x / cellSize)
      const row = Math.round(y / cellSize)
      
      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        this.hoverPos = { row, col }
        this.drawBoard()
      }
    },
    
    resizeBoard() {
      this.initBoard()
    }
  },
  
  watch: {
    board: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.drawBoard()
        })
      }
    }
  }
}
</script>

<style scoped>
.game-board {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 480px; /* 减小最大宽度 */
  margin: 0 auto;
  background: linear-gradient(135deg, #8B4513, #DEB887);
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.board-canvas {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  cursor: pointer;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.board-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--primary-color);
  font-size: 1.2rem;
}

.overlay-content i {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .game-board {
    max-width: none;
    width: calc(100vw - 2rem);
    margin: 0 auto;
  }
}
</style> 