<template>
  <div class="game-container">
    <!-- 功能区 -->
    <div class="game-header">
      <div class="game-controls">
        <button class="control-button home" @click="$emit('home')" title="返回主页">
          <i class="fas fa-home"></i>
        </button>
        <div class="control-divider"></div>
        <button class="control-button restart" @click="$emit('restart')" title="重新开始">
          <i class="fas fa-redo"></i>
          重新开始
        </button>
        <button class="control-button settings" @click="$emit('settings')" title="设置">
          <i class="fas fa-cog"></i>
          设置
        </button>
        <button class="control-button exit" @click="$emit('exit')" title="退出">
          <i class="fas fa-sign-out-alt"></i>
          退出
        </button>
      </div>
    </div>

    <!-- 主游戏区域 -->
    <div class="game-main">
      <!-- 玩家卡片 -->
      <div class="player-section">
        <slot name="player-card"></slot>
      </div>

      <!-- 棋盘区域 -->
      <div class="board-section">
        <div class="game-board-wrapper">
          <slot name="game-board"></slot>
        </div>
      </div>

      <!-- AI卡片 -->
      <div class="player-section">
        <slot name="ai-card"></slot>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="game-footer">
      <slot name="status"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'home'): void
  (e: 'restart'): void
  (e: 'settings'): void
  (e: 'exit'): void
}>()
</script>

<style scoped>
.game-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  padding: 1rem;
  gap: 1rem;
  overflow: hidden;
}

.game-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.game-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 1rem;
  min-height: 0; /* 允许内容收缩 */
}

.player-section {
  flex: 0 0 250px; /* 固定宽度 */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.board-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0; /* 允许内容收缩 */
  min-height: 0; /* 允许内容收缩 */
}

.game-board-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.game-footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* 控制按钮样式保持不变 */
.game-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
  color: #2c3e50;
}

.control-button:hover {
  background: rgba(52, 152, 219, 0.1);
}

.control-button.home {
  padding: 0.6rem;
  border-radius: 50%;
  background: #3498db;
  color: white;
}

.control-button.restart { color: #27ae60; }
.control-button.settings { color: #f39c12; }
.control-button.exit { color: #e74c3c; }

.control-divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 0.5rem;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .game-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  }

  .game-header,
  .game-footer {
    background: rgba(45, 55, 72, 0.9);
  }

  .control-button {
    color: #e2e8f0;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .player-section {
    flex: 0 0 200px;
  }
}

@media (max-width: 768px) {
  .game-container {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .game-main {
    flex-direction: column;
  }

  .player-section {
    flex: 0 0 auto;
  }

  .board-section {
    aspect-ratio: 1;
  }

  .game-board-wrapper {
    padding: 0.5rem;
  }

  .game-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style> 