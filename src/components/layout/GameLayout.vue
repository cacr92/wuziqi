<template>
  <div class="game-layout" :class="{ 'dark-theme': isDarkMode }">
    <div class="game-container">
      <!-- 左侧面板：游戏信息和控制按钮 -->
      <aside class="left-panel card">
        <div class="game-info">
          <h2 class="game-title">五子棋</h2>
          <div class="player-info">
            <div class="player" :class="{ active: currentPlayer === 'black' }">
              <div class="piece black"></div>
              <span>黑方</span>
            </div>
            <div class="vs">VS</div>
            <div class="player" :class="{ active: currentPlayer === 'white' }">
              <div class="piece white"></div>
              <span>白方</span>
            </div>
          </div>
        </div>

        <GameTimer 
          :currentPlayer="currentPlayer"
          :gameStarted="true"
          :gameOver="false"
        />

        <div class="control-group">
          <button class="btn btn-primary" @click="startNewGame">
            <i class="fas fa-play"></i>新游戏
          </button>
          <button class="btn" @click="undoMove" :disabled="!canUndo">
            <i class="fas fa-undo"></i>悔棋
          </button>
          <button class="btn btn-danger" @click="surrender">
            <i class="fas fa-flag"></i>认输
          </button>
          <button class="btn" @click="$emit('back')">
            <i class="fas fa-home"></i>主菜单
          </button>
        </div>

        <div class="settings-group">
          <button class="btn" @click="toggleTheme">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            {{ isDarkMode ? '浅色' : '深色' }}
          </button>
          <button class="btn" @click="toggleSound">
            <i :class="isSoundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute'"></i>
            {{ isSoundOn ? '关闭音效' : '开启音效' }}
          </button>
        </div>
      </aside>

      <!-- 中间：棋盘 -->
      <div class="board-container card">
        <GameBoard 
          :board="board"
          :currentPlayer="currentPlayer"
          :canMove="canMove"
          @move="handleMove"
        />
      </div>

      <!-- 右侧面板：游戏统计 -->
      <aside class="right-panel card">
        <GameStats :stats="gameStats" />
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import GameBoard from '../board/GameBoard.vue'
import GameTimer from '../game/GameTimer.vue'
import GameStats from '../game/GameStats.vue'
import GameControls from '../game/GameControls.vue'
import { useGameStore } from '../../store/game'
import { toggleTheme as toggleThemeUtil } from '../../utils/theme'
import { checkWin, checkDraw, getBestMove, isValidPosition } from '../../utils/gameLogic'
import type { GameMode, Difficulty } from '@/types'

export default defineComponent({
  name: 'GameLayout',
  components: { GameBoard, GameTimer, GameStats, GameControls },
  
  setup() {
    const isDarkMode = ref(false)
    const isSoundOn = ref(true)
    const gameMode = ref<GameMode>('pve')
    const difficulty = ref<Difficulty>('medium')
    const board = ref(Array(15).fill(null).map(() => Array(15).fill(null)))
    const currentPlayer = ref('black')
    const canMove = ref(true)
    const timeLeft = ref(300)
    const isPlayerTurn = ref(true)
    const canUndo = ref(false)
    const gameStore = useGameStore()
    const gameOver = ref(false)

    const handleGameEnd = (winner: string | null) => {
      gameOver.value = true
      canMove.value = false
      
      if (winner) {
        const isPlayerWin = gameMode.value === 'pve' && winner === 'black'
        gameStore.addGame(isPlayerWin ? 'win' : 'loss')
        alert(`${winner === 'black' ? '黑方' : '白方'}获胜！`)
      } else {
        gameStore.addGame('draw')
        alert('平局！')
      }
      
      setTimeout(startNewGame, 1500)
    }

    const aiMove = () => {
      const [row, col] = getBestMove(board.value, currentPlayer.value)
      
      if (isValidPosition(row, col)) {
        setTimeout(() => {
          board.value[row][col] = currentPlayer.value
          if (checkWin(board.value, row, col, currentPlayer.value)) {
            handleGameEnd(currentPlayer.value)
            return
          }
          currentPlayer.value = 'black'
          canMove.value = true
        }, 500)
      }
    }

    const handleMove = (pos: { row: number, col: number }) => {
      if (gameOver.value || !canMove.value) return
      
      board.value[pos.row][pos.col] = currentPlayer.value
      
      if (checkWin(board.value, pos.row, pos.col, currentPlayer.value)) {
        handleGameEnd(currentPlayer.value)
        return
      }
      
      if (checkDraw(board.value)) {
        handleGameEnd(null)
        return
      }
      
      currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'
      
      if (gameMode.value === 'pve' && currentPlayer.value === 'white') {
        canMove.value = false
        aiMove()
      }
    }

    const startNewGame = () => {
      board.value = Array(15).fill(null).map(() => Array(15).fill(null))
      currentPlayer.value = 'black'
      canMove.value = true
      canUndo.value = false
      gameOver.value = false
    }

    const undoMove = () => {
      // 悔棋逻辑
    }

    const surrender = () => {
      if (gameOver.value) return
      
      if (gameMode.value === 'pve') {
        gameStore.addGame('loss')
        alert('已认输！')
      }
      startNewGame()
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      toggleThemeUtil(isDarkMode.value ? 'dark' : 'light')
    }

    const toggleSound = () => {
      isSoundOn.value = !isSoundOn.value
      // 处理音效开关
    }

    return {
      isDarkMode,
      isSoundOn,
      gameMode,
      difficulty,
      board,
      currentPlayer,
      canMove,
      timeLeft,
      isPlayerTurn,
      canUndo,
      gameStats: gameStore.stats,
      toggleTheme,
      toggleSound,
      handleMove,
      startNewGame,
      undoMove,
      surrender,
      gameOver
    }
  }
})
</script>

<style scoped>
.game-layout {
  min-height: 100vh;
  padding: 1rem;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-container {
  display: grid;
  grid-template-columns: 200px auto 200px;
  gap: 1rem;
  max-width: 1400px;
  width: 100%;
  height: fit-content;
}

.card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: var(--shadow-md);
  height: fit-content;
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-info {
  text-align: center;
}

.game-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.player-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  opacity: 0.7;
  transition: all 0.3s;
}

.player.active {
  opacity: 1;
  background: var(--bg-primary);
  transform: scale(1.05);
}

.piece {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.piece.black {
  background: var(--piece-black);
}

.piece.white {
  background: var(--piece-white);
  border: 1px solid var(--border-color);
}

.vs {
  font-weight: 600;
  opacity: 0.5;
}

.control-group, .settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.board-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  width: fit-content;
  overflow: visible;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .game-container {
    grid-template-columns: 180px auto 180px;
  }
}

@media (max-width: 992px) {
  .game-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
    gap: 1rem;
    padding: 1rem;
  }

  .left-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .board-container {
    margin: 0 auto;
    width: fit-content;
    min-width: unset;
  }
}

@media (max-width: 768px) {
  .game-layout {
    padding: 0.5rem;
  }

  .board-container {
    padding: 1rem;
    overflow: hidden;
    width: 100%;
  }

  .left-panel {
    grid-template-columns: 1fr;
  }

  .control-group, .settings-group {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style> 