<template>
  <div class="game-board">
    <div class="operation-hint" v-if="showHint">
      {{ hintMessage }}
    </div>
    <canvas 
      ref="boardCanvas"
      :width="boardSize"
      :height="boardSize"
      @click="handleClick"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></canvas>
    <div class="board-overlay" v-if="showAnimation">
      <div 
        class="piece-animation"
        :class="animationColor"
        :style="{ 
          left: `${animationPos.x}px`,
          top: `${animationPos.y}px`
        }"
      ></div>
    </div>
    <div 
      v-if="lastMove"
      class="last-move-marker"
      :style="{
        left: `${lastMove.col * cellSize + cellSize/2}px`,
        top: `${lastMove.row * cellSize + cellSize/2}px`
      }"
    ></div>
  </div>
</template>

<script>
import { playSound } from '../utils/audio'

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
    },
    isAITurn: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      boardSize: 600,
      cellSize: 40,
      hoverPos: null,
      showAnimation: false,
      animationColor: '',
      animationPos: { x: 0, y: 0 },
      showHint: false,
      hintMessage: '',
      lastMove: null,
      hintTimer: null
    }
  },

  mounted() {
    this.initBoard()
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },

  watch: {
    board: {
      deep: true,
      handler() {
        this.drawBoard()
      }
    }
  },

  methods: {
    initBoard() {
      this.handleResize()
      this.drawBoard()
    },

    handleResize() {
      const minSize = Math.min(window.innerWidth - 40, window.innerHeight - 100, 600)
      this.boardSize = minSize
      this.cellSize = minSize / 15
      this.$refs.boardCanvas.width = minSize
      this.$refs.boardCanvas.height = minSize
      this.drawBoard()
    },

    drawBoard() {
      const ctx = this.$refs.boardCanvas.getContext('2d')
      ctx.clearRect(0, 0, this.boardSize, this.boardSize)

      const gradient = ctx.createLinearGradient(0, 0, this.boardSize, this.boardSize)
      gradient.addColorStop(0, '#DCB35C')
      gradient.addColorStop(0.5, '#E8C170')
      gradient.addColorStop(1, '#DCB35C')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, this.boardSize, this.boardSize)

      ctx.globalAlpha = 0.1
      for (let i = 0; i < this.boardSize; i += 10) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 5, this.boardSize)
        ctx.strokeStyle = '#8B4513'
        ctx.stroke()
      }
      ctx.globalAlpha = 1.0

      ctx.strokeStyle = '#000'
      ctx.lineWidth = 0.5
      
      ctx.beginPath()
      ctx.rect(this.cellSize / 2, this.cellSize / 2, 
               this.boardSize - this.cellSize, 
               this.boardSize - this.cellSize)
      ctx.stroke()
      
      for (let i = 0; i < 15; i++) {
        const pos = i * this.cellSize
        ctx.lineWidth = i === 0 || i === 14 ? 1.5 : 0.5
        
        ctx.beginPath()
        ctx.moveTo(this.cellSize / 2, pos + this.cellSize / 2)
        ctx.lineTo(this.boardSize - this.cellSize / 2, pos + this.cellSize / 2)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(pos + this.cellSize / 2, this.cellSize / 2)
        ctx.lineTo(pos + this.cellSize / 2, this.boardSize - this.cellSize / 2)
        ctx.stroke()
      }

      const starPoints = [
        [3, 3], [3, 11], [7, 7],
        [11, 3], [11, 11]
      ]
      
      ctx.fillStyle = '#000'
      starPoints.forEach(([row, col]) => {
        ctx.beginPath()
        ctx.arc(
          col * this.cellSize + this.cellSize / 2,
          row * this.cellSize + this.cellSize / 2,
          4, 0, Math.PI * 2
        )
        ctx.fill()
      })

      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if (this.board[i][j]) {
            this.drawPiece(i, j, this.board[i][j])
          }
        }
      }

      if (this.hoverPos && this.canMove && !this.board[this.hoverPos.row][this.hoverPos.col]) {
        this.drawPiece(this.hoverPos.row, this.hoverPos.col, this.currentPlayer, true)
      }
    },

    drawPiece(row, col, color, isHover = false) {
      const ctx = this.$refs.boardCanvas.getContext('2d')
      const x = col * this.cellSize + this.cellSize / 2
      const y = row * this.cellSize + this.cellSize / 2
      const radius = this.cellSize * 0.4

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      
      if (isHover) {
        ctx.fillStyle = color === 'black' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
      } else {
        const gradient = ctx.createRadialGradient(
          x - radius/3, y - radius/3, radius/10,
          x, y, radius
        )
        
        if (color === 'black') {
          gradient.addColorStop(0, '#666')
          gradient.addColorStop(1, '#000')
        } else {
          gradient.addColorStop(0, '#fff')
          gradient.addColorStop(1, '#ddd')
        }
        
        ctx.fillStyle = gradient
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
      }
      
      ctx.fill()
      
      if (!isHover) {
        ctx.beginPath()
        ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2)
        ctx.fillStyle = color === 'black' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
        ctx.fill()
      }
      
      ctx.shadowBlur = 0
    },

    async playAnimation(row, col, color) {
      this.animationColor = color
      this.animationPos = {
        x: col * this.cellSize,
        y: row * this.cellSize
      }
      this.showAnimation = true
      this.lastMove = { row, col }
      
      playSound('place')
      
      await new Promise(resolve => setTimeout(resolve, 300))
      this.showAnimation = false
    },

    showOperationHint(message, duration = 2000) {
      this.hintMessage = message
      this.showHint = true
      
      if (this.hintTimer) {
        clearTimeout(this.hintTimer)
      }
      
      this.hintTimer = setTimeout(() => {
        this.showHint = false
      }, duration)
    },

    handleClick(event) {
      if (!this.canMove) {
        this.showOperationHint('请等待对方落子')
        return
      }

      const rect = event.target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const row = Math.floor(y / this.cellSize)
      const col = Math.floor(x / this.cellSize)

      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        if (this.board[row][col]) {
          this.showOperationHint('此处已有棋子')
          playSound('error')
          return
        }
        
        if (!this.isAITurn) {
          this.$emit('make-move', { row, col })
        }
      }
    },

    handleMouseMove(event) {
      const rect = event.target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const row = Math.floor(y / this.cellSize)
      const col = Math.floor(x / this.cellSize)

      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        this.hoverPos = { row, col }
        this.drawBoard()
      }
    },

    handleMouseLeave() {
      this.hoverPos = null
      this.drawBoard()
    }
  }
}
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  position: relative;
  transform: perspective(1000px) rotateX(5deg);
  transition: transform 0.3s;
}

.game-board:hover {
  transform: perspective(1000px) rotateX(0deg);
}

canvas {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  transition: all 0.3s;
}

canvas:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.operation-hint {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  pointer-events: none;
  animation: fadeInOut 0.3s ease-in-out;
}

.last-move-marker {
  position: absolute;
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: pulse 1.5s infinite;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -10px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.board-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.piece-animation {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transform: scale(0);
  animation: dropIn 0.3s ease-out forwards;
}

.piece-animation.black {
  background: #000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.piece-animation.white {
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes dropIn {
  0% {
    transform: scale(0) translateY(-20px);
  }
  70% {
    transform: scale(1.1) translateY(5px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}
</style> 