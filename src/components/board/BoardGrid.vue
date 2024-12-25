<template>
  <div class="board-grid">
    <div 
      v-for="(row, i) in 15" 
      :key="i"
      class="grid-row"
    >
      <div 
        v-for="(col, j) in 15" 
        :key="j"
        class="grid-cell"
      >
        <div 
          v-if="isCenter(i, j)"
          class="center-dot"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isCenter = (row: number, col: number) => {
  const centers = [3, 7, 11]
  return centers.includes(row) && centers.includes(col)
}
</script>

<style scoped>
.board-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  pointer-events: none;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
}

.grid-cell {
  position: relative;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}
</style> 