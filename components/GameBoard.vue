<template>
  <div class="game-board">
    <canvas
      ref="canvas"
      class="board-canvas"
      :class="{ 'cursor-not-allowed': !canMove }"
      @click="handleClick"
    ></canvas>
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
      ctx.scale(dpr, dpr)
      
      this.drawBoard()
    },
    
    drawBoard() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      const cellSize = Math.min(width, height) / 15
      
      // 清空画布
      ctx.clearRect(0, 0, width, height)
      
      // 绘制棋盘背景
      ctx.fillStyle = 'var(--board-color)'
      ctx.fillRect(0, 0, width, height)
      
      // 绘制网格线
      ctx.beginPath()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      
      for (let i = 0; i < 15; i++) {
        const pos = i * cellSize
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, height)
        ctx.moveTo(0, pos)
        ctx.lineTo(width, pos)
      }
      ctx.stroke()
      
      // 绘制棋子
      this.board.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell) {
            this.drawPiece(ctx, i, j, cell)
          }
        })
      })
    },
    
    drawPiece(ctx, row, col, color) {
      const cellSize = this.$refs.canvas.width / 15
      const x = col * cellSize + cellSize / 2
      const y = row * cellSize + cellSize / 2
      const radius = cellSize * 0.4
      
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color === 'black' ? '#000' : '#fff'
      ctx.fill()
      ctx.strokeStyle = color === 'black' ? '#000' : '#ccc'
      ctx.stroke()
    },
    
    handleClick(event) {
      if (!this.canMove) return
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const cellSize = rect.width / 15
      
      const col = Math.floor(x / cellSize)
      const row = Math.floor(y / cellSize)
      
      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        this.$emit('make-move', { row, col })
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
        this.drawBoard()
      }
    }
  }
}
</script>

<style scoped>
.game-board {
  width: 100%;
  aspect-ratio: 1;
  max-width: 600px;
  margin: 0 auto;
}

.board-canvas {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cursor-not-allowed {
  cursor: not-allowed;
}
</style> 