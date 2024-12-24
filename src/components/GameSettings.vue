<template>
  <div class="game-settings">
    <div class="settings-header">
      <h3>游戏设置</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="settings-content">
      <div class="setting-item">
        <label>音效</label>
        <button @click="toggleSound" :class="{ active: !isMuted }">
          <i :class="isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
        </button>
      </div>
      
      <div class="setting-item">
        <label>允许悔棋</label>
        <button @click="toggleUndo" :class="{ active: canUndo }">
          <i :class="canUndo ? 'fas fa-check' : 'fas fa-times'"></i>
        </button>
      </div>
      
      <div class="setting-item">
        <label>AI 难度</label>
        <select v-model="difficulty" @change="updateDifficulty">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { setupAudio } from '../utils/audio'

export default {
  name: 'GameSettings',
  
  props: {
    initialSettings: {
      type: Object,
      required: true
    }
  },
  
  setup(props, { emit }) {
    const audioManager = setupAudio()
    const isMuted = ref(audioManager.isMuted)
    const canUndo = ref(props.initialSettings.canUndo)
    const difficulty = ref(props.initialSettings.difficulty)
    
    const toggleSound = () => {
      audioManager.toggleMute()
      isMuted.value = audioManager.isMuted
      emit('update:settings', { isMuted: isMuted.value })
    }
    
    const toggleUndo = () => {
      canUndo.value = !canUndo.value
      emit('update:settings', { canUndo: canUndo.value })
    }
    
    const updateDifficulty = () => {
      emit('update:settings', { difficulty: difficulty.value })
    }
    
    return {
      isMuted,
      canUndo,
      difficulty,
      toggleSound,
      toggleUndo,
      updateDifficulty
    }
  }
}
</script>

<style scoped>
.game-settings {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.active {
  background: #4CAF50;
  color: white;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style> 