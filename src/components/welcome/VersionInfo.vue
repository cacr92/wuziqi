<template>
  <div class="version-info">
    <span>版本 {{ version }}</span>
    <a 
      href="https://github.com/yourusername/gobang"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fab fa-github"></i>
      GitHub
    </a>
  </div>
</template>

<script setup lang="ts">
const version = import.meta.env.VITE_APP_VERSION || '1.0.0'
</script>

<style scoped>
.version-info {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

a:hover {
  color: var(--primary);
}
</style> 