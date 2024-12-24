<template>
  <div class="game-board neu-panel">
    <canvas 
      ref="boardCanvas"
      :width="boardSize"
      :height="boardSize"
      class="board-grid"
    ></canvas>
    <div class="pieces-container">
      <template v-for="(row, i) in board" :key="i">
        <div 
          v-for="(cell, j) in row"
          :key="`${i}-${j}`"
          class="board-cell"
          @click="handleCellClick(i, j)"
        >
          <Piece 
            v-if="cell"
            :color="cell"
            :class="{ 'last-move': isLastMove(i, j) }"
          />
          <div 
            v-else-if="canMove && isValidMove(i, j)"
            class="hover-indicator"
            :class="currentPlayer"
          ></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Piece from './Piece.vue'

export default defineComponent({
  name: 'GameBoard',
  components: { Piece },
  props: {
    board: {
      type: Array as () => (string | null)[][],
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
    lastMove: {
      type: Object as () => { row: number; col: number } | null,
      default: null
    }
  },
  data() {
    return {
      boardSize: 560,
      cellSize: 40
    }
  },
  methods: {
    handleCellClick(row: number, col: number) {
      if (!this.canMove || !this.isValidMove(row, col)) return
      this.$emit('move', { row, col })
    },
    isValidMove(row: number, col: number): boolean {
      return !this.board[row][col]
    },
    isLastMove(row: number, col: number): boolean {
      return !!(this.lastMove && this.lastMove.row === row && this.lastMove.col === col)
    },
    drawGrid() {
      const ctx = (this.$refs.boardCanvas as HTMLCanvasElement).getContext('2d')
      if (!ctx) return
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 1
      
      // 画横线
      for (let i = 0; i <= 14; i++) {
        ctx.beginPath()
        ctx.moveTo(this.cellSize / 2, i * this.cellSize + this.cellSize / 2)
        ctx.lineTo(this.boardSize - this.cellSize / 2, i * this.cellSize + this.cellSize / 2)
        ctx.stroke()
      }
      
      // 画竖线
      for (let i = 0; i <= 14; i++) {
        ctx.beginPath()
        ctx.moveTo(i * this.cellSize + this.cellSize / 2, this.cellSize / 2)
        ctx.lineTo(i * this.cellSize + this.cellSize / 2, this.boardSize - this.cellSize / 2)
        ctx.stroke()
      }

      // 画天元和星位
      const points = [
        [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
      ]
      points.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.arc(x * this.cellSize + this.cellSize / 2, y * this.cellSize + this.cellSize / 2, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fill()
      })
    }
  },
  mounted() {
    this.drawGrid()
  }
})
</script>

<style scoped>
.game-board {
  position: relative;
  margin: 0 auto;
  background: var(--board-bg);
  border-radius: 12px;
  padding: 20px;
  width: fit-content;
}

.board-grid {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
}

.pieces-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(15, 40px);
  gap: 0;
}

.board-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hover-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.board-cell:hover .hover-indicator {
  opacity: 0.3;
}

.hover-indicator.black {
  background: var(--piece-black);
}

.hover-indicator.white {
  background: var(--piece-white);
}

.last-move::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-color);
  animation: pulse 2s infinite;
}
</style> 