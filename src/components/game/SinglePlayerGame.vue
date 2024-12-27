<template>
  <GameLayout
    @home="handleHome"
    @restart="handleRestart"
    @settings="showSettings = true"
    @exit="handleExit"
  >
    <!-- 玩家卡片 -->
    <template #player-card>
      <PlayerCard
        :timer="playerTimer"
        :stats="{
          wins: stats.playerWins,
          draws: stats.draws,
          losses: stats.aiWins
        }"
        :show-timer="settings.showTimer"
        :is-current-player="!isAITurn && !gameOver"
      />
    </template>

    <!-- 游戏棋盘 -->
    <template #game-board>
      <GameBoard
        :board="board"
        :disabled="isAITurn || gameOver || !gameStarted"
        :show-preview="settings.showPreview"
        :show-last-move="settings.showLastMove"
        :theme="settings.boardTheme"
        :last-move="lastMove"
        :hover-cell="hoverCell"
        @move="handleMove"
        @hover="handleHover"
      />
    </template>

    <!-- AI卡片 -->
    <template #ai-card>
      <PlayerCard
        is-ai
        :timer="aiTimer"
        :stats="{
          wins: stats.aiWins,
          draws: stats.draws,
          losses: stats.playerWins
        }"
        :show-timer="settings.showTimer"
        :is-current-player="isAITurn && !gameOver"
      />
    </template>

    <!-- 状态栏 -->
    <template #status>
      <div v-if="gameOver" class="game-status">
        <i :class="['fas', gameOverIcon]"></i>
        <span>{{ gameOverMessage }}</span>
      </div>
    </template>
  </GameLayout>

  <!-- 游戏结束弹窗 -->
  <el-dialog
    v-model="showGameOver"
    :title="getGameOverTitle"
    width="400px"
    center
    :close-on-click-modal="false"
    :show-close="false"
    class="game-over-dialog"
  >
    <div class="game-over-content">
      <div class="game-over-icon">
        <i :class="['fas', gameOverIcon]"></i>
      </div>
      <div class="game-over-message">{{ gameOverMessage }}</div>
      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-label">胜利</span>
          <span class="stat-value">{{ stats.playerWins }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平局</span>
          <span class="stat-value">{{ stats.draws }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">失败</span>
          <span class="stat-value">{{ stats.aiWins }}</span>
        </div>
      </div>
      <div class="game-over-buttons">
        <button class="game-over-button restart" @click="handleRestart">
          <i class="fas fa-redo"></i>
          再来一局
        </button>
        <button class="game-over-button exit" @click="handleExit">
          <i class="fas fa-sign-out-alt"></i>
          退出游戏
        </button>
      </div>
    </div>
  </el-dialog>

  <!-- 设置弹窗 -->
  <el-dialog
    v-model="showSettings"
    title="游戏设置"
    width="300px"
    center
    align-center
  >
    <div class="settings-content">
      <div class="setting-item">
        <span class="setting-label">音效</span>
        <el-switch v-model="settings.sound" />
      </div>
      <div class="setting-item">
        <span class="setting-label">显示计时器</span>
        <el-switch v-model="settings.showTimer" />
      </div>
      <div class="setting-item">
        <span class="setting-label">显示最后落子</span>
        <el-switch v-model="settings.showLastMove" />
      </div>
      <div class="setting-item">
        <span class="setting-label">显示预览</span>
        <el-switch v-model="settings.showPreview" />
      </div>
      <div class="setting-item">
        <span class="setting-label">棋盘主题</span>
        <el-select v-model="settings.boardTheme">
          <el-option label="木纹" value="wood" />
          <el-option label="简约" value="simple" />
        </el-select>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { GameController } from './singleplayer/GameController'
import GameLayout from './singleplayer/GameLayout.vue'
import PlayerCard from './singleplayer/PlayerCard.vue'
import GameBoard from './singleplayer/GameBoard.vue'
import type { PlayerColor } from '@/types'
import type { Position } from './ai/types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const size = 15

// 游戏状态
const board = ref<(PlayerColor | null)[][]>(Array(size).fill(null).map(() => Array(size).fill(null)))
const gameOver = ref(false)
const winner = ref<PlayerColor | null>(null)
const lastMove = ref<Position | null>(null)
const isAITurn = ref(false)
const gameStarted = ref(false)
const showGameOver = ref(false)
const hoverCell = ref<Position | null>(null)

// 计时器
const playerTimer = ref(0)
const aiTimer = ref(0)

// 统计信息
const stats = ref({
  playerWins: 0,
  aiWins: 0,
  draws: 0
})

// 设置
const showSettings = ref(false)
const settings = ref({
  sound: true,
  showTimer: true,
  showLastMove: true,
  showPreview: true,
  boardTheme: 'wood'
})

// 游戏控制器
const gameController = ref<GameController | null>(null)

// 游戏结束相关计算属性
const getGameOverTitle = computed(() => {
  if (!gameController.value || !gameOver.value) return ''
  return gameController.value.getGameOverInfo().title
})

const gameOverIcon = computed(() => {
  if (!gameController.value || !gameOver.value) return ''
  return gameController.value.getGameOverInfo().icon
})

const gameOverMessage = computed(() => {
  if (!gameController.value || !gameOver.value) return ''
  return gameController.value.getGameOverInfo().message
})

// 监听设置变化
watch(settings, (newSettings) => {
  if (gameController.value) {
    gameController.value.updateSettings(newSettings)
  }
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initializeGame()
})

// 组件卸载时清理
onUnmounted(() => {
  gameController.value?.cleanup()
  window.removeEventListener('keydown', handleKeyDown)
})

// 初始化游戏
const initializeGame = () => {
  // 创建游戏控制器
  gameController.value = new GameController(size)
  
  // 加载设置和统计信息
  const controllerSettings = gameController.value.getSettings()
  const controllerStats = gameController.value.getStats()
  
  settings.value = controllerSettings
  stats.value = controllerStats
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
  
  // 自动开始游戏
  startGame()
}

// 游戏核心功能
const handleMove = async (x: number, y: number) => {
  if (!gameController.value) return
  
  try {
    await gameController.value.handleMove(x, y)
    
    // 更新视图状态
    const state = gameController.value.getState()
    board.value = state.board
    gameOver.value = state.gameOver
    winner.value = state.winner
    lastMove.value = state.lastMove
    isAITurn.value = state.isAITurn
    playerTimer.value = state.playerTimer
    aiTimer.value = state.aiTimer
    showGameOver.value = state.showGameOver
    
    // 更新统计信息
    stats.value = gameController.value.getStats()
  } catch (error) {
    console.error('Error in handleMove:', error)
    ElMessage.error('落子出错，请重试')
  }
}

// 游戏状态管理
const startGame = () => {
  if (!gameController.value) return
  
  gameController.value.startGame()
  
  // 更新视图状态
  const state = gameController.value.getState()
  board.value = state.board
  gameOver.value = state.gameOver
  winner.value = state.winner
  lastMove.value = state.lastMove
  isAITurn.value = state.isAITurn
  playerTimer.value = state.playerTimer
  aiTimer.value = state.aiTimer
  showGameOver.value = state.showGameOver
  gameStarted.value = state.gameStarted

  // 启动计时器更新
  startTimerUpdate()
}

// 添加计时器更新逻辑
const startTimerUpdate = () => {
  const updateInterval = setInterval(() => {
    if (gameController.value) {
      const state = gameController.value.getState()
      playerTimer.value = state.playerTimer
      aiTimer.value = state.aiTimer
    }
  }, 100) // 每100ms更新一次，确保显示流畅

  // 组件卸载时清理
  onUnmounted(() => {
    clearInterval(updateInterval)
  })
}

const handleRestart = () => {
  initializeGame()
}

const handleExit = () => {
  gameController.value?.cleanup()
  router.push('/')
}

const handleHome = () => {
  gameController.value?.cleanup()
  router.push('/')
}

// 鼠标事件处理
const handleHover = (position: Position | null) => {
  hoverCell.value = position
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!gameController.value) return
  
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      gameController.value.handleKeyboardNavigation(event.key)
      // 更新视图状态
      const state = gameController.value.getState()
      hoverCell.value = state.hoverCell
      break
    case ' ':
    case 'Enter':
      event.preventDefault()
      if (hoverCell.value) {
        handleMove(hoverCell.value.x, hoverCell.value.y)
      }
      break
  }
}
</script>

<style scoped>
/* 游戏结束弹窗样式 */
.game-over-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-align: center;
}

.game-over-icon {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 0.5rem;
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.game-over-message {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%);
  border-radius: 12px;
  width: 100%;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 70%;
  background: rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-over-buttons {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.game-over-button {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.game-over-button i {
  font-size: 0.9rem;
}

.game-over-button.restart {
  background: #3498db;
  color: white;
}

.game-over-button.exit {
  background: #e74c3c;
  color: white;
}

.game-over-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.game-over-button:active {
  transform: translateY(0);
}

/* 设置弹窗样式 */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 1rem;
  color: #2c3e50;
}

/* 游戏状态栏样式 */
.game-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #3498db;
}

.game-status i {
  font-size: 1.25rem;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .game-over-message {
    color: #94a3b8;
  }

  .game-stats {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%);
  }

  .stat-item:not(:last-child)::after {
    background: rgba(255, 255, 255, 0.1);
  }

  .stat-label {
    color: #94a3b8;
  }

  .stat-value {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  }

  .game-over-button.restart {
    background: #3b82f6;
  }

  .game-over-button.exit {
    background: #ef4444;
  }

  .setting-label {
    color: #e2e8f0;
  }

  .game-status {
    color: #60a5fa;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-over-content {
    padding: 0.75rem;
  }

  .game-over-icon {
    font-size: 2.5rem;
  }

  .game-stats {
    gap: 1rem;
    padding: 0.75rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .game-over-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .settings-content {
    gap: 1rem;
  }

  .setting-label {
    font-size: 0.9rem;
  }
}
</style> 