<template>
  <div id="app" v-cloak>
    <transition name="fade" mode="out-in">
      <div v-if="currentScreen === 'welcome'" class="welcome-screen">
        <div class="welcome-container">
          <div class="welcome-header">
            <button class="icon-btn" @click="showSettings">
              <i class="fa-solid fa-gear"></i>
            </button>
            <button class="icon-btn" @click="showHelp">
              <i class="fa-solid fa-circle-question"></i>
            </button>
          </div>
          <div class="welcome-content">
            <h1 class="welcome-title">五子棋</h1>
            <p class="welcome-subtitle">经典的黑白对弈</p>
            
            <div class="welcome-options">
              <!-- 游戏模式选择 -->
              <div class="option-section">
                <h2 class="section-title">游戏模式</h2>
                <div class="mode-buttons">
                  <button 
                    v-for="mode in gameModes" 
                    :key="mode.id"
                    class="mode-btn"
                    :class="{ active: selectedMode === mode.id }"
                    @click="selectMode(mode.id)"
                  >
                    <i :class="mode.icon"></i>
                    <span>{{ mode.text }}</span>
                  </button>
                </div>
              </div>

              <!-- AI 难度选择 -->
              <div class="option-section" :class="{ disabled: selectedMode !== 'pve' }">
                <h2 class="section-title">AI 难度</h2>
                <div class="difficulty-buttons">
                  <button 
                    v-for="level in difficultyLevels" 
                    :key="level.id"
                    class="difficulty-btn"
                    :class="{ 
                      active: selectedDifficulty === level.id,
                      disabled: selectedMode !== 'pve'
                    }"
                    :disabled="selectedMode !== 'pve'"
                    @click="selectDifficulty(level.id)"
                  >
                    <i :class="level.icon"></i>
                    {{ level.text }}
                  </button>
                </div>
              </div>
            </div>

            <button 
              class="start-btn"
              :disabled="!selectedMode"
              @click="startGame"
            >
              开始游戏
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="currentScreen === 'game'" class="game-screen">
        <div class="game-layout">
          <div class="game-sidebar">
            <player-card
              name="黑子玩家"
              piece-color="black"
              :is-active="currentPlayer === 'black'"
              :is-ai="false"
            />
            <player-card
              :name="gameMode === 'pve' ? 'AI 玩家' : '白子玩家'"
              piece-color="white"
              :is-active="currentPlayer === 'white'"
              :is-ai="gameMode === 'pve'"
              :is-thinking="gameMode === 'pve' && currentPlayer === 'white' && !canMove"
            />
          </div>
          
          <div class="game-content">
            <game-board
              :board="board"
              :current-player="currentPlayer"
              :can-move="canMove && !(gameMode === 'pve' && currentPlayer === 'white')"
              @make-move="makeMove"
            />
          </div>
          
          <div class="game-controls">
            <button class="control-btn" @click="undoMove" :disabled="!canUndo">
              <i class="fa-solid fa-rotate-left"></i>
              悔棋
            </button>
            <button class="control-btn" @click="handleSurrender">
              <i class="fa-solid fa-flag"></i>
              认输
            </button>
            <button class="control-btn" @click="backToMenu">
              <i class="fa-solid fa-house"></i>
              返回主菜单
            </button>
          </div>
        </div>
      </div>
      <online-game v-if="currentScreen === 'game' && selectedMode === 'online'" />
    </transition>
    <install-prompt />
    <update-prompt />
    <div v-if="gameOver" class="game-result-overlay">
      <div class="game-result">
        <h2 class="result-title">
          {{ winner ? (winner === 'black' ? '黑子胜利！' : '白子胜利！') : '平局！' }}
        </h2>
        <div class="result-actions">
          <button class="result-btn" @click="restartGame">
            <i class="fa-solid fa-rotate-right"></i>
            再来一局
          </button>
          <button class="result-btn" @click="backToMenu">
            <i class="fa-solid fa-house"></i>
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { AI } from './game/ai.js'
import { setupAudio } from './audio/audio.js'
import InstallPrompt from './components/InstallPrompt.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
import PlayerCard from './components/PlayerCard.vue'
import GameBoard from './components/GameBoard.vue'
import OnlineGame from './components/OnlineGame.vue'

export default {
  name: 'App',
  components: {
    InstallPrompt,
    UpdatePrompt,
    PlayerCard,
    GameBoard,
    OnlineGame
  },
  data() {
    return {
      currentScreen: 'welcome',
      selectedMode: null,
      selectedDifficulty: 'medium',
      gameModes: [
        { id: 'pvp', text: '双人对战', icon: 'fa-solid fa-user-group' },
        { id: 'pve', text: '人机对战', icon: 'fa-solid fa-robot' },
        { id: 'online', text: '在线对战', icon: 'fa-solid fa-globe' }
      ],
      difficultyLevels: [
        { id: 'easy', text: '简单', icon: 'fa-solid fa-circle-dot' },
        { id: 'medium', text: '中等', icon: 'fa-solid fa-circle' },
        { id: 'hard', text: '困难', icon: 'fa-solid fa-circle-xmark' }
      ],
      board: Array(15).fill().map(() => Array(15).fill(null)),
      currentPlayer: 'black',
      gameMode: 'pvp',
      canMove: true,
      player1: {
        name: '黑子玩家',
        color: 'black'
      },
      player2: {
        name: 'AI 对手',
        color: 'white'
      },
      gameOver: false,
      winner: null,
      moveHistory: [],
      ai: null,
      audio: null
    }
  },
  methods: {
    selectMode(mode) {
      this.selectedMode = mode
    },
    selectDifficulty(level) {
      this.selectedDifficulty = level
    },
    startGame() {
      this.gameMode = this.selectedMode
      this.currentScreen = 'game'
      this.resetGame()
      
      if (this.gameMode === 'pve') {
        this.ai = new AI(this.selectedDifficulty)
      }
    },
    resetGame() {
      this.board = Array(15).fill().map(() => Array(15).fill(null))
      this.currentPlayer = 'black'
      this.gameOver = false
      this.winner = null
      this.moveHistory = []
      this.canMove = true
    },
    makeMove(row, col) {
      if (this.gameOver || this.board[row][col] || !this.canMove) return
      
      // 如果是 AI 回合，阻止玩家落子
      if (this.gameMode === 'pve' && this.currentPlayer === 'white') return
      
      // 落子
      this.board[row][col] = this.currentPlayer
      this.moveHistory.push({ row, col, player: this.currentPlayer })
      this.audio?.playPieceSound()
      
      // 检查胜利
      if (this.checkWin(row, col)) {
        this.gameOver = true
        this.winner = this.currentPlayer
        this.audio?.playWinSound()
        return
      }
      
      // 切换玩家
      this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black'
      
      // AI 移动
      if (this.gameMode === 'pve' && this.currentPlayer === 'white' && !this.gameOver) {
        // 禁用玩家操作
        this.canMove = false
        
        // 立即获取 AI 的移动
        const move = this.ai.getMove(this.board)
        
        // 添加最小延迟以显示思考动画
        setTimeout(() => {
          if (move) {
            // 直接修改棋盘
            this.board[move.row][move.col] = this.currentPlayer  // 使用当前玩家的颜色（白色）
            this.moveHistory.push({ row: move.row, col: move.col, player: this.currentPlayer })
            this.audio?.playPieceSound()
            
            // 检查 AI 是否获胜
            if (this.checkWin(move.row, move.col)) {
              this.gameOver = true
              this.winner = this.currentPlayer
              this.audio?.playWinSound()
            } else {
              // 切换回玩家回合
              this.currentPlayer = 'black'
            }
          }
          // 重新启用玩家操作
          this.canMove = true
        }, 50)
      }
    },
    checkWin(row, col) {
      const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]
      ]
      
      return directions.some(([dx, dy]) => {
        let count = 1
        let r = row, c = col
        
        // 正向检查
        while (count < 5) {
          r += dx
          c += dy
          if (r < 0 || r >= 15 || c < 0 || c >= 15) break
          if (this.board[r][c] !== this.currentPlayer) break
          count++
        }
        
        // 反向检查
        r = row
        c = col
        while (count < 5) {
          r -= dx
          c -= dy
          if (r < 0 || r >= 15 || c < 0 || c >= 15) break
          if (this.board[r][c] !== this.currentPlayer) break
          count++
        }
        
        return count >= 5
      })
    },
    undoMove() {
      if (this.moveHistory.length === 0) return
      
      const lastMove = this.moveHistory.pop()
      this.board[lastMove.row][lastMove.col] = null
      this.currentPlayer = lastMove.player
      this.gameOver = false
      this.winner = null
      
      if (this.gameMode === 'pve') {
        // 在 PvE 模式下撤销两步
        if (this.moveHistory.length > 0) {
          const aiMove = this.moveHistory.pop()
          this.board[aiMove.row][aiMove.col] = null
        }
      }
    },
    handleSurrender() {
      this.gameOver = true
      this.winner = this.currentPlayer === 'black' ? 'white' : 'black'
    },
    restartGame() {
      this.resetGame()
    },
    backToMenu() {
      this.currentScreen = 'welcome'
      this.resetGame()
      this.selectedMode = null
    },
    showSettings() {
      // TODO: 实现设置功能
    },
    showHelp() {
      // TODO: 实现帮助功能
    }
  },
  mounted() {
    this.audio = setupAudio()
  }
}
</script>

<style scoped>
.welcome-screen {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
}

.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 32px);
  width: 100%;
}

.welcome-content {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-align: center;
  max-width: 95vw;
  max-height: 90dvh;
  overflow-y: auto;
}

.welcome-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.welcome-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.option-section {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.option-section.disabled {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.section-title {
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.mode-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: 0.75rem;
  background: white;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.difficulty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--primary-color);
  border-radius: 0.75rem;
  background: white;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.difficulty-btn i {
  font-size: 1.2rem;
}

.mode-btn.active,
.difficulty-btn.active {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.difficulty-btn.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  margin: 1rem auto 0;
}

.start-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .welcome-container {
    padding: 0.5rem;
    min-height: 100dvh;
  }

  .welcome-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .welcome-title {
    font-size: 1.75rem;
    margin-bottom: 0;
  }

  .welcome-subtitle {
    font-size: 1rem;
    margin-bottom: 0;
  }

  .welcome-options {
    margin: 0;
    gap: 0.75rem;
  }

  .option-section {
    padding: 0.75rem;
  }

  .section-title {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  .mode-buttons,
  .difficulty-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .mode-btn,
  .difficulty-btn {
    padding: 0.75rem;
    min-height: 44px;
  }

  .start-btn {
    width: 100%;
    margin-top: 0.5rem;
    min-height: 44px;
  }
}

/* 修复移动端滚动问题 */
@media (max-width: 768px) {
  body {
    position: fixed;
    width: 100%;
    height: 100%;
    height: 100dvh;
    overflow: hidden;
  }

  #app {
    height: 100%;
    height: 100dvh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .welcome-content::-webkit-scrollbar {
    display: none;
  }
}

.game-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.game-layout {
  flex: 1;
  display: flex;
  padding: 1rem;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.game-sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: stretch;
  justify-content: center;
}

.game-content {
  flex: 1;
  max-width: 600px;
  aspect-ratio: 1;
}

.game-controls {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: white;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-layout {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.75rem;
  }

  .game-sidebar,
  .game-controls {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .game-content {
    width: 100%;
    max-width: none;
    padding: 0.5rem;
  }

  .control-btn {
    flex: 1;
    min-width: 120px;
    max-width: 160px;
  }

  .game-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .player-card {
    flex: 1;
    min-width: 150px;
    max-width: 200px;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 360px) {
  .welcome-content {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-subtitle {
    font-size: 0.9rem;
  }

  .mode-btn,
  .difficulty-btn {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

/* 防止页面滚动和橡皮筋效果 */
@media (max-width: 1024px) {
  body {
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #app {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* 添加游戏结果显示样式 */
.game-result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-result {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.result-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.result-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--primary-color);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.result-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

/* 欢迎界面顶部按钮 */
.welcome-header {
  position: fixed;
  top: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  z-index: 100;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.icon-btn i {
  font-size: 1.2rem;
}
</style> 