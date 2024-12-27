<template>
  <div class="player-card" :class="{ 'is-current': isCurrentPlayer, 'is-ai': isAi }">
    <div class="player-info">
      <div class="player-avatar">
        <i :class="['fas', isAi ? 'fa-robot' : 'fa-user']"></i>
      </div>
      <div class="player-name">{{ isAi ? 'AI' : '玩家' }}</div>
      <div v-if="showTimer" class="player-timer">
        {{ formatTime(timer) }}
      </div>
    </div>
    <div class="player-stats">
      <div class="stat-item">
        <span class="stat-label">胜利</span>
        <span class="stat-value">{{ stats.wins }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">平局</span>
        <span class="stat-value">{{ stats.draws }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">失败</span>
        <span class="stat-value">{{ stats.losses }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isAi?: boolean
  timer: number
  stats: {
    wins: number
    draws: number
    losses: number
  }
  showTimer: boolean
  isCurrentPlayer: boolean
}>()

// 格式化时间显示
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.player-card.is-current {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 12px rgba(52, 152, 219, 0.15),
    0 16px 24px rgba(52, 152, 219, 0.1);
  border: 2px solid rgba(52, 152, 219, 0.3);
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.player-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.75rem;
  box-shadow: 
    0 4px 8px rgba(52, 152, 219, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.player-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.player-timer {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: monospace;
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.player-stats {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(52, 152, 219, 0.05);
  border-radius: 12px;
}

.stat-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
}

/* AI特殊样式 */
.player-card.is-ai .player-avatar {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  box-shadow: 
    0 4px 8px rgba(155, 89, 182, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.player-card.is-ai .player-timer {
  color: #9b59b6;
  background: rgba(155, 89, 182, 0.1);
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .player-card {
    background: rgba(45, 55, 72, 0.9);
  }

  .player-name {
    color: #e2e8f0;
  }

  .stat-label {
    color: #a0aec0;
  }

  .stat-value {
    color: #e2e8f0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .player-card {
    padding: 1rem;
  }

  .player-avatar {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .player-name {
    font-size: 1rem;
  }

  .player-timer {
    font-size: 1.25rem;
    padding: 0.25rem 0.75rem;
  }

  .stat-item {
    padding: 0.5rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style> 