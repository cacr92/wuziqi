<template>
  <div class="game-stats">
    <div class="stats-header">
      <h3>游戏统计</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="stats-content">
      <div class="stat-item">
        <span class="label">总局数</span>
        <span class="value">{{ stats.totalGames }}</span>
      </div>
      <div class="stat-item">
        <span class="label">胜利</span>
        <span class="value">{{ stats.wins }}</span>
      </div>
      <div class="stat-item">
        <span class="label">失败</span>
        <span class="value">{{ stats.losses }}</span>
      </div>
      <div class="stat-item">
        <span class="label">胜率</span>
        <span class="value">{{ winRate }}%</span>
      </div>
      <div class="stat-item">
        <span class="label">最长连胜</span>
        <span class="value">{{ stats.maxStreak }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'GameStats',
  
  props: {
    stats: {
      type: Object,
      required: true
    }
  },
  
  setup(props) {
    const winRate = computed(() => {
      if (props.stats.totalGames === 0) return 0
      return Math.round((props.stats.wins / props.stats.totalGames) * 100)
    })
    
    return { winRate }
  }
}
</script>

<style scoped>
.game-stats {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
}

.label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 