<template>
  <div class="game-settings">
    <h3 class="settings-title">游戏设置</h3>
    
    <!-- 时间设置 -->
    <div class="setting-item">
      <label>时间限制</label>
      <select v-model="settings.timeLimit">
        <option :value="300">5分钟</option>
        <option :value="600">10分钟</option>
        <option :value="900">15分钟</option>
        <option :value="1200">20分钟</option>
        <option :value="1800">30分钟</option>
      </select>
    </div>

    <!-- 先手设置 -->
    <div class="setting-item">
      <label>先手选择</label>
      <select v-model="settings.firstMove">
        <option value="random">随机</option>
        <option value="black">黑方先手</option>
        <option value="white">白方先手</option>
      </select>
    </div>

    <!-- 音效设置 -->
    <div class="setting-item">
      <label>游戏音效</label>
      <div class="toggle-switch">
        <input 
          type="checkbox" 
          v-model="settings.soundEnabled"
          :id="'sound-toggle'"
        >
        <label :for="'sound-toggle'" class="toggle-label"></label>
      </div>
    </div>

    <!-- 音量设置 -->
    <div class="setting-item" v-if="settings.soundEnabled">
      <label>音量</label>
      <input 
        type="range" 
        v-model="settings.volume" 
        min="0" 
        max="100" 
        step="1"
        class="volume-slider"
      >
      <span class="volume-value">{{ settings.volume }}%</span>
    </div>

    <!-- 确认按钮 -->
    <div class="settings-actions">
      <button 
        class="settings-btn primary"
        @click="saveSettings"
      >
        保存设置
      </button>
      <button 
        class="settings-btn"
        @click="resetSettings"
      >
        重置默认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// 默认设置
const defaultSettings = {
  timeLimit: 600, // 10分钟
  firstMove: 'black' as 'random' | 'black' | 'white',
  soundEnabled: true,
  volume: 80,
}

// 使用 localStorage 持久化设置
const settings = useLocalStorage('gobang-settings', defaultSettings)

// 保存设置
const saveSettings = () => {
  // 触发保存事件
  emit('save', settings.value)
}

// 重置设置
const resetSettings = () => {
  settings.value = { ...defaultSettings }
  emit('save', settings.value)
}

// 定义事件
const emit = defineEmits<{
  (e: 'save', settings: typeof defaultSettings): void
}>()

// 初始化时加载设置
onMounted(() => {
  emit('save', settings.value)
})
</script>

<style scoped>
.game-settings {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 400px;
  width: 100%;
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
}

.setting-item label {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.setting-item select {
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  min-width: 120px;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--bg-primary);
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .toggle-label {
  background-color: var(--primary);
}

input:checked + .toggle-label:before {
  transform: translateX(26px);
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: none;
}

.volume-value {
  min-width: 48px;
  text-align: right;
  color: var(--text-secondary);
}

.settings-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.settings-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.settings-btn:hover {
  background: var(--hover-color);
}

.settings-btn.primary {
  background: var(--primary);
  color: white;
}

.settings-btn.primary:hover {
  background: var(--primary-dark);
}

@media (max-width: 768px) {
  .game-settings {
    padding: 1rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .setting-item select,
  .volume-slider {
    width: 100%;
  }
}
</style> 