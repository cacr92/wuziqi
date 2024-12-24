<template>
  <div class="game-stats">
    <h2>游戏统计</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">总局数</div>
        <div class="stat-value">{{ stats.totalGames }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">胜利</div>
        <div class="stat-value">{{ stats.wins }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">失败</div>
        <div class="stat-value">{{ stats.losses }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGameStore } from '../../store/game'

export default defineComponent({
  name: 'GameStats',
  setup() {
    const gameStore = useGameStore()
    return {
      stats: gameStore.stats
    }
  }
})
</script>

<style scoped>
.game-stats {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .game-stats {
    padding: 1rem;
  }
  
  .stats-grid {
    gap: 0.5rem;
  }
  
  .stat-item {
    padding: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}
</style> 