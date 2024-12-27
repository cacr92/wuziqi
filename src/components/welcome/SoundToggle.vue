<template>
  <button 
    class="sound-toggle"
    :class="{ 'muted': soundMuted }"
    @click="toggleSound"
  >
    <i class="fas" :class="soundMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isMuted, toggleMute } from '../../utils/audio'

const soundMuted = ref(isMuted.value)

const toggleSound = () => {
  toggleMute()
  soundMuted.value = !soundMuted.value
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