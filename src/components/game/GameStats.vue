<template>
  <div class="stats">
    <h3>游戏统计</h3>
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
    <button class="close-btn" @click="$emit('close')">
      关闭
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameStats } from '../../types'

const props = defineProps<{
  stats: GameStats
}>()

defineEmits<{
  (e: 'close'): void
}>()

const winRate = computed(() => {
  const total = props.stats.wins + props.stats.losses
  if (total === 0) return 0
  return Math.round((props.stats.wins / total) * 100)
})
</script>

<style scoped>
.stats {
  padding: 2rem;
  color: var(--text-primary);
}

h3 {
  margin-bottom: 2rem;
  text-align: center;
  color: var(--primary);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  font-size: 1.2rem;
}

.close-btn {
  margin-top: 2rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: var(--primary);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  opacity: 0.9;
}
</style> 