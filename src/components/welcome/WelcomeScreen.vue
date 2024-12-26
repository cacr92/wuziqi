<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <h1 class="title">五子棋</h1>
      <div class="menu">
        <button class="menu-btn" @click="router.push('/game/pve')">
          <i class="fas fa-robot"></i>
          人机对战
        </button>
        <button class="menu-btn" @click="router.push('/game/online')">
          <i class="fas fa-users"></i>
          在线对战
        </button>
        <button class="menu-btn" @click="showTutorial = true">
          <i class="fas fa-book"></i>
          游戏教程
        </button>
        <button class="menu-btn" @click="showSettings = true">
          <i class="fas fa-cog"></i>
          游戏设置
        </button>
      </div>
    </div>

    <GameModal 
      v-if="showTutorial" 
      title="游戏教程" 
      @close="showTutorial = false"
    >
      <div class="tutorial-content">
        <h3>基本规则</h3>
        <p>1. 黑方先手，双方轮流落子</p>
        <p>2. 先形成五子连线的一方获胜</p>
        <p>3. 连线可以是横向、纵向或斜向</p>
      </div>
    </GameModal>

    <GameModal 
      v-if="showSettings" 
      title="游戏设置" 
      @close="showSettings = false"
    >
      <div class="settings-content">
        <div class="setting-item">
          <label>AI 难度</label>
          <select v-model="settings.difficulty">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="setting-item">
          <label>音效</label>
          <input type="checkbox" v-model="settings.sound">
        </div>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GameModal from '../game/GameModal.vue'

const router = useRouter()
const showTutorial = ref(false)
const showSettings = ref(false)
const settings = ref({
  difficulty: 'medium',
  sound: true
})
</script>

<style scoped>
.welcome-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 2rem;
}

.welcome-content {
  text-align: center;
}

.title {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.menu-btn {
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
}

.menu-btn:hover {
  background: var(--primary);
  color: var(--text-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tutorial-content,
.settings-content {
  padding: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.setting-item label {
  color: var(--text-primary);
  font-weight: 500;
}

.setting-item select {
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--board-border);
  background: var(--bg-secondary);
  color: var(--text-primary);
}
</style>