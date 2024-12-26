<template>
  <div class="app" :class="{ 'dark-theme': isDarkMode }">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDarkMode = ref(false)
</script>

<style>
.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style> 