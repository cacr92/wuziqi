<template>
  <div class="game-controls">
    <button 
      v-for="action in actions" 
      :key="action.id"
      class="control-btn"
      :class="{ disabled: action.disabled }"
      @click="$emit('action', action.id)"
      :disabled="action.disabled"
    >
      <i :class="action.icon"></i>
      <span>{{ action.text }}</span>
    </button>
  </div>
</template>

<script>
export default {
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--background-color);
  color: var(--text-color);
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
}

.control-btn:not(.disabled):hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.control-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn i {
  font-size: 1.2rem;
}
</style> 