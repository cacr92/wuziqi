<template>
  <div 
    class="board-cell"
    :class="{
      'can-move': canMove && !value,
      'last-move': isLastMove
    }"
    @click="$emit('click')"
  >
    <div 
      v-if="value" 
      class="piece"
      :class="value"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '../../types'

defineProps<{
  value: PlayerColor | null
  canMove: boolean
  isLastMove: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.board-cell {
  aspect-ratio: 1;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.board-cell.can-move:hover {
  background: var(--bg-hover);
}

.board-cell.last-move::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 2px solid var(--primary);
  border-radius: 50%;
  opacity: 0.5;
  pointer-events: none;
}

.piece {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  transition: transform 0.2s;
}

.piece.black {
  background: black;
  box-shadow: inset 0 4px 8px rgba(255,255,255,0.2);
}

.piece.white {
  background: white;
  border: 1px solid #ddd;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.1);
}
</style> 