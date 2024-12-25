<template>
  <button 
    class="theme-toggle"
    :class="{ 'dark': isDark }"
    @click="toggleTheme"
  >
    <i class="fas" :class="isDark ? 'fa-sun' : 'fa-moon'"></i>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toggleTheme as toggleThemeUtil } from '../../utils/theme'

const isDark = ref(document.documentElement.classList.contains('dark-theme'))

const toggleTheme = () => {
  isDark.value = !isDark.value
  toggleThemeUtil(isDark.value)
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-hover);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-toggle.dark {
  background: var(--primary);
  color: white;
}
</style>