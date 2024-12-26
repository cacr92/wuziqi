<template>
  <div class="game-result">
    <div class="result-header">
      <div class="result-icon">
        <i :class="resultIcon"></i>
      </div>
      <h3>{{ resultText }}</h3>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <span>总局数</span>
        <span>{{ stats.totalGames }}</span>
      </div>
      <div class="stat-item">
        <span>胜利</span>
        <span>{{ stats.wins }}</span>
      </div>
      <div class="stat-item">
        <span>失败</span>
        <span>{{ stats.losses }}</span>
      </div>
      <div class="stat-item">
        <span>胜率</span>
        <span>{{ winRate }}%</span>
      </div>
    </div>
    
    <div class="actions">
      <button class="btn" @click="$emit('restart')">
        <i class="fas fa-redo"></i>
        再来一局
      </button>
      <button class="btn" @click="$emit('back')">
        <i class="fas fa-home"></i>
        返回主菜单
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameResult, GameStats } from '../../types'

const props = defineProps<{
  result: GameResult
  stats: GameStats
}>()

defineEmits<{
  (e: 'restart'): void
  (e: 'back'): void
}>()

const resultIcon = computed(() => {
  switch (props.result) {
    case 'win': return 'fas fa-trophy text-success'
    case 'loss': return 'fas fa-times-circle text-danger'
    default: return 'fas fa-handshake text-info'
  }
})

const resultText = computed(() => {
  switch (props.result) {
    case 'win': return '恭喜获胜!'
    case 'lose': return '再接再厉!'
    default: return '平局!'
  }
})

const winRate = computed(() => {
  if (props.stats.totalGames === 0) return 0
  return Math.round((props.stats.wins / props.stats.totalGames) * 100)
})
</script>

<style scoped>
.game-result {
  padding: 2rem;
  text-align: center;
}

.result-header {
  margin-bottom: 2rem;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-icon i {
  animation: bounce 1s ease infinite;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item span:first-child {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.stat-item span:last-child {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .game-result {
    padding: 1rem;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style> 