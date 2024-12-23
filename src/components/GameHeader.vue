<template>
  <header class="game-header">
    <div class="header-actions">
      <button class="header-btn" @click="$emit('settings')">
        <i class="fa-solid fa-gear"></i>
      </button>
      <button class="header-btn" @click="$emit('help')">
        <i class="fa-solid fa-question"></i>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'GameHeader'
}
</script>

<style scoped>
.game-header {
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.header-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
  transition: color 0.3s;
}

.header-btn:hover {
  color: var(--primary-color);
}
</style> 