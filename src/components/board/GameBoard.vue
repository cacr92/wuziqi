<template>
  <div 
    class="game-board"
    :class="{ 'can-move': canMove }"
  >
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
            'last-move': isLastMove(i, j),
            'valid-move': canMove && !cell
          }"
          @click="handleClick(i, j)"
        >
          <div 
            v-if="cell"
            class="piece"
            :class="cell"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Board, PlayerColor } from '../../types'

const props = defineProps<{
  board: Board
  currentPlayer: PlayerColor
  canMove: boolean
  lastMove?: { row: number; col: number } | null
}>()

const emit = defineEmits<{
  (e: 'move', row: number, col: number): void
}>()

const isLastMove = (row: number, col: number) => {
  return props.lastMove?.row === row && props.lastMove?.col === col
}

const handleClick = (row: number, col: number) => {
  if (!props.canMove || props.board[row][col]) return
  emit('move', row, col)
}
</script>

<style scoped>
.game-board {
  position: relative;
  aspect-ratio: 1;
  background: var(--board-bg);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.board-grid {
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  gap: 1px;
  height: 100%;
  background: var(--grid-color);
}

.board-row {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 1px;
}

.board-cell {
  position: relative;
  background: var(--board-bg);
  cursor: pointer;
  transition: all var(--transition-speed);
}

.board-cell::before {
  content: '';
  display: block;
  padding-bottom: 100%;
}

.piece {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  transition: all var(--transition-speed);
}

.piece.black {
  background: radial-gradient(circle at 30% 30%, #666, #000);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ddd);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.last-move::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.valid-move:hover {
  background: var(--primary-light);
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-board {
    padding: 0.5rem;
  }
}
</style> 