<template>
  <div class="board-grid">
    <div class="grid-background"></div>
    <div class="grid-lines horizontal">
      <div v-for="i in 14" :key="i" class="grid-line"></div>
    </div>
    <div class="grid-lines vertical">
      <div v-for="i in 14" :key="i" class="grid-line"></div>
    </div>
    <div class="grid-dots">
      <div 
        v-for="dot in dots" 
        :key="`${dot.x}-${dot.y}`" 
        class="grid-dot"
        :style="{
          left: `${dot.x * 40 + 20}px`,
          top: `${dot.y * 40 + 20}px`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const dots = [
  { x: 3, y: 3 },
  { x: 3, y: 11 },
  { x: 7, y: 7 },
  { x: 11, y: 3 },
  { x: 11, y: 11 }
]
</script>

<style scoped>
.board-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.grid-background {
  position: absolute;
  inset: 0;
  background: var(--bg-board);
  background-image: 
    linear-gradient(45deg, var(--board-grain) 25%, transparent 25%),
    linear-gradient(-45deg, var(--board-grain) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--board-grain) 75%),
    linear-gradient(-45deg, transparent 75%, var(--board-grain) 75%);
  background-size: 20px 20px;
  opacity: 0.1;
}

.grid-lines {
  position: absolute;
  inset: 20px;
  display: grid;
}

.horizontal {
  grid-template-rows: repeat(14, 1fr);
}

.vertical {
  grid-template-columns: repeat(14, 1fr);
}

.grid-line {
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.horizontal .grid-line {
  height: 1px;
  width: 100%;
}

.vertical .grid-line {
  width: 1px;
  height: 100%;
}

.grid-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
</style> 