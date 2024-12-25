<template>
  <div class="game-settings">
    <h3>游戏设置</h3>
    
    <div class="settings-group">
      <div class="setting-item">
        <label>游戏难度</label>
        <select v-model="settings.difficulty">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      
      <div class="setting-item">
        <label>允许悔棋</label>
        <input 
          type="checkbox"
          v-model="settings.canUndo"
        >
      </div>
      
      <div class="setting-item">
        <label>音效</label>
        <input 
          type="checkbox"
          v-model="settings.isMuted"
        >
      </div>
    </div>
    
    <div class="settings-actions">
      <button class="btn" @click="save">
        <i class="fas fa-save"></i>
        保存
      </button>
      <button class="btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Settings {
  difficulty: 'easy' | 'medium' | 'hard'
  canUndo: boolean
  isMuted: boolean
}

const props = defineProps<{
  initialSettings: Settings
}>()

const emit = defineEmits<{
  (e: 'update:settings', settings: Settings): void
  (e: 'close'): void
}>()

const settings = ref<Settings>({ ...props.initialSettings })

const save = () => {
  emit('update:settings', settings.value)
  emit('close')
}
</script>

<style scoped>
.game-settings {
  padding: 2rem;
}

.settings-group {
  margin: 2rem 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style> 