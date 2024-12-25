<template>
  <div class="online-game">
    <h2>在线对战</h2>
    <button class="back-btn" @click="$emit('back')">
      <i class="fas fa-arrow-left"></i> 返回
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'back'): void
}>()
</script>

<style scoped>
.online-game {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.back-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: var(--bg-hover);
}
</style> 