<template>
  <div class="welcome-screen">
    <div class="welcome-container">
      <div class="logo-container">
        <div class="logo">
          <div class="piece black"></div>
          <div class="piece white"></div>
        </div>
        <h1>五子棋</h1>
        <p class="subtitle">现代化的五子棋游戏体验</p>
      </div>

      <div class="mode-selection">
        <button 
          class="btn btn-primary"
          @click="$emit('start', 'pve')"
        >
          <i class="fas fa-robot"></i>
          <span>人机对战</span>
          <small>挑战智能AI</small>
        </button>

        <button 
          class="btn btn-primary"
          @click="$emit('start', 'online')"
        >
          <i class="fas fa-globe"></i>
          <span>在线对战</span>
          <small>全球玩家匹配</small>
        </button>
      </div>

      <div class="quick-actions">
        <button class="btn" @click="$emit('tutorial')">
          <i class="fas fa-question-circle"></i>
          <span>教程</span>
        </button>
        <button class="btn" @click="$emit('settings')">
          <i class="fas fa-cog"></i>
          <span>设置</span>
        </button>
        <button class="btn" @click="$emit('stats')">
          <i class="fas fa-trophy"></i>
          <span>战绩</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WelcomeScreen',
  emits: ['start', 'tutorial', 'settings', 'stats']
})
</script>

<style scoped>
.welcome-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-dark), var(--primary));
  color: var(--text-light);
}

.welcome-container {
  max-width: 800px;
  padding: 2rem;
  text-align: center;
}

.logo-container {
  margin-bottom: 3rem;
}

.logo {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  animation: float 6s ease-in-out infinite;
}

.piece {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: absolute;
  box-shadow: var(--shadow-lg);
}

.piece.black {
  background: var(--piece-black);
  left: 20px;
  top: 20px;
}

.piece.white {
  background: var(--piece-white);
  right: 20px;
  bottom: 20px;
}

h1 {
  font-size: 3rem;
  margin: 0;
  text-shadow: var(--shadow-lg);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
}

.mode-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .mode-selection {
    grid-template-columns: 1fr;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
</style> 