<template>
  <div class="game-board">
    <div class="header">
      <h2>{{ gameMode === 'pve' ? '人机对战' : '在线对战' }}</h2>
      <button class="exit-btn" @click="$emit('exit')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="board">
      <!-- 棋盘内容将在后续实现 -->
      <p>游戏开发中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  gameMode: 'pve' | 'online'
}>()

defineEmits<{
  (e: 'exit'): void
}>()
</script>

<style scoped>
.game-board {
  height: 100vh;
  background: #f6f8fb;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  color: #2c3e50;
}

.exit-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.2s;
}

.exit-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.board {
  display: grid;
  place-items: center;
  height: calc(100vh - 4rem);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}
</style> 