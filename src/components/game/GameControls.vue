<template>
  <div class="game-controls">
    <button 
      class="control-btn"
      :class="{ disabled: !canUndo }"
      @click="$emit('undo')"
      :disabled="!canUndo"
    >
      <i class="fas fa-undo"></i>
      <span>悔棋</span>
    </button>

    <button 
      class="control-btn"
      @click="$emit('restart')"
    >
      <i class="fas fa-redo"></i>
      <span>重新开始</span>
    </button>

    <button 
      class="control-btn danger"
      :class="{ disabled: gameOver }"
      @click="$emit('surrender')"
      :disabled="gameOver"
    >
      <i class="fas fa-flag"></i>
      <span>认输</span>
    </button>

    <button 
      class="control-btn secondary"
      @click="$emit('back')"
    >
      <i class="fas fa-arrow-left"></i>
      <span>返回菜单</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canUndo: boolean
  gameOver: boolean
}>()

defineEmits<{
  (e: 'undo'): void
  (e: 'restart'): void
  (e: 'surrender'): void
  (e: 'back'): void
}>()
</script>

<style scoped>
.game-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--primary);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.control-btn:hover:not(.disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.control-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.danger {
  background: var(--danger);
}

.control-btn.secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-btn {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
}
</style> 