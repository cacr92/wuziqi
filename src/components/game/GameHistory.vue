<template>
  <div class="game-history">
    <h3 class="history-title">对局历史</h3>
    
    <!-- 历史记录列表 -->
    <div class="history-list" v-if="history.length > 0">
      <div 
        v-for="(record, index) in sortedHistory" 
        :key="index"
        class="history-item"
      >
        <div class="history-info">
          <div class="history-date">{{ formatDate(record.date) }}</div>
          <div class="history-result" :class="getResultClass(record)">
            {{ getResultText(record) }}
          </div>
        </div>
        <div class="history-details">
          <div class="player-info">
            <span class="player-color">黑方</span>
            <span class="player-name">{{ record.blackPlayer }}</span>
          </div>
          <div class="vs-badge">VS</div>
          <div class="player-info">
            <span class="player-color">白方</span>
            <span class="player-name">{{ record.whitePlayer }}</span>
          </div>
        </div>
        <div class="history-stats">
          <div class="stat-item">
            <i class="fas fa-clock"></i>
            {{ formatDuration(record.duration) }}
          </div>
          <div class="stat-item">
            <i class="fas fa-chess-board"></i>
            {{ record.moves.length }} 手
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="history-empty">
      <i class="fas fa-history"></i>
      <p>暂无对局记录</p>
    </div>

    <!-- 清空按钮 -->
    <div class="history-actions" v-if="history.length > 0">
      <button 
        class="history-btn danger"
        @click="clearHistory"
      >
        清空历史记录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { PlayerColor } from '@/types/game'

// 历史记录类型
interface GameRecord {
  date: number
  blackPlayer: string
  whitePlayer: string
  winner: PlayerColor | null
  duration: number
  moves: Array<{ row: number; col: number; color: PlayerColor }>
  reason: string
}

// 使用 localStorage 存储历史记录
const history = useLocalStorage<GameRecord[]>('gobang-history', [])

// 按日期排序的历史记录
const sortedHistory = computed(() => {
  return [...history.value].sort((a, b) => b.date - a.date)
})

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 格式化时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 获取结果文本
const getResultText = (record: GameRecord) => {
  if (record.winner === null) return '平局'
  return record.winner === 'black' ? '黑方胜' : '白方胜'
}

// 获取结果样式
const getResultClass = (record: GameRecord) => {
  if (record.winner === null) return 'draw'
  return record.winner === 'black' ? 'black-win' : 'white-win'
}

// 清空历史记录
const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    history.value = []
  }
}

// 添加新记录
const addRecord = (record: GameRecord) => {
  history.value.unshift(record)
  // 只保留最近50条记录
  if (history.value.length > 50) {
    history.value = history.value.slice(0, 50)
  }
}

// 导出方法供父组件使用
defineExpose({
  addRecord
})
</script>

<style scoped>
.game-history {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 600px;
  width: 100%;
}

.history-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.history-item {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.history-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.history-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.history-result {
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius);
}

.history-result.black-win {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.history-result.white-win {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.history-result.draw {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
}

.history-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.player-color {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.player-name {
  font-weight: 500;
  color: var(--text-primary);
}

.vs-badge {
  color: var(--text-secondary);
  font-weight: 600;
}

.history-stats {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--text-secondary);
}

.history-empty i {
  font-size: 3rem;
  opacity: 0.5;
}

.history-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.history-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-btn.danger {
  background: var(--danger);
  color: white;
}

.history-btn.danger:hover {
  background: var(--danger-dark);
}

@media (max-width: 768px) {
  .game-history {
    padding: 1rem;
  }

  .history-list {
    max-height: 400px;
  }

  .history-details {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .vs-badge {
    display: none;
  }
}
</style> 