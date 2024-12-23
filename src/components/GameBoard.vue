<template>
  <div class="game-board" :class="{ disabled: !canMove }">
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
          @click="handleMove(i, j)"
        >
          <div 
            v-if="cell" 
            class="piece" 
            :class="cell"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    board: Array,
    currentPlayer: String,
    canMove: Boolean
  },
  methods: {
    handleMove(row, col) {
      if (!this.canMove || this.board[row][col]) return
      this.$emit('make-move', row, col)
    }
  }
}
</script>

<style scoped>
.game-board {
  width: 100%;
  height: 100%;
  background: var(--board-color);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.game-board.disabled {
  pointer-events: none;
  opacity: 0.8;
}

.board-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  gap: 1px;
  background: var(--border-color);
  padding: 1px;
  position: relative;
  z-index: 1;
}

.board-row {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 1px;
}

.board-cell {
  background: var(--board-color);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.board-cell:hover::after {
  content: '';
  position: absolute;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
}

.piece {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  position: relative;
}

.piece.black {
  background: #000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.piece.white {
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style> 