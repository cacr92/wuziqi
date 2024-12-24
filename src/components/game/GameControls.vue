<template>
  <div class="game-controls">
    <button 
      class="btn btn-primary"
      @click="$emit('restart')"
    >
      <i class="fas fa-play"></i>
      新游戏
    </button>
    
    <button 
      class="btn"
      @click="$emit('undo')"
      :disabled="!canUndo"
    >
      <i class="fas fa-undo"></i>
      悔棋
    </button>
    
    <button 
      class="btn btn-danger"
      @click="$emit('surrender')"
    >
      <i class="fas fa-flag"></i>
      认输
    </button>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GameControls',
  props: {
    canUndo: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.game-controls {
  display: flex;
  gap: 12px;
  padding: 20px;
  justify-content: center;
  background: var(--bg-light);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .game-controls {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 