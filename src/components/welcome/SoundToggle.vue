<template>
  <button 
    class="sound-toggle"
    :class="{ 'muted': isMuted }"
    @click="toggleSound"
  >
    <i class="fas" :class="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { setMuted, getMuted } from '../../utils/audio'

const isMuted = ref(getMuted())

const toggleSound = () => {
  isMuted.value = !isMuted.value
  setMuted(isMuted.value)
}
</script>

<style scoped>
.sound-toggle {
  position: fixed;
  top: 1rem;
  right: 4rem;
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

.sound-toggle:hover {
  transform: scale(1.1);
}

.sound-toggle.muted {
  background: var(--text-secondary);
  color: white;
}
</style> 