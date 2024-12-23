<template>
  <div class="game-controls">
    <button 
      v-for="action in actions"
      :key="action.id"
      class="control-btn"
      @click="$emit('action', action.id)"
    >
      <i :class="action.icon"></i>
      <span>{{ action.text }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'GameControls',
  props: {
    actions: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.game-controls {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--background-color);
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.control-btn i {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .game-controls {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 