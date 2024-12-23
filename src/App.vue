<template>
  <div id="app" v-cloak>
    <transition name="fade">
      <div class="screen" :key="currentScreen">
        <!-- 欢迎界面 -->
        <div v-if="currentScreen === 'welcome'" class="welcome-screen">
          <game-header @settings="showSettings" @help="showHelp" />
          <div class="welcome-container">
            <div class="welcome-content">
              <h1 class="welcome-title">五子棋游戏</h1>
              <p class="welcome-subtitle">选择游戏模式和难度开始游戏</p>
              
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

        <!-- 游戏界面 -->
        <div v-else class="game-screen">
          <game-header @settings="showSettings" @help="showHelp" />
          
          <div class="game-layout">
            <div class="game-sidebar">
              <player-card
                name="黑子玩家"
                piece-color="black"
                :is-active="currentPlayer === 'black'"
                :is-ai="false"
              />
              <player-card
                v-if="gameMode === 'pvp'"
                name="白子玩家"
                piece-color="white"
                :is-active="currentPlayer === 'white'"
                :is-ai="false"
              />
              <player-card
                v-else
                name="AI 对手"
                piece-color="white"
                :is-active="currentPlayer === 'white'"
                :is-ai="true"
                :is-thinking="isAIThinking"
              />
            </div>
            
            <div class="game-content">
              <game-board
                ref="gameBoard"
                :board="board"
                :current-player="currentPlayer"
                :can-move="canMove && !gameOver"
                @make-move="handleMove"
              />
            </div>
            
            <div class="game-controls">
              <game-controls
                :actions="gameActions"
                @action="handleGameAction"
              />
            </div>
          </div>

          <!-- 游戏结果显示 -->
          <div v-if="gameOver" class="game-result-overlay">
            <div class="game-result">
              <h2 class="result-title">
                {{ getGameResultText() }}
              </h2>
              <div class="result-actions">
                <button class="result-btn" @click="restartGame">
                  <i class="fa-solid fa-rotate-right"></i>
                  重新开始
                </button>
                <button class="result-btn" @click="backToMenu">
                  <i class="fa-solid fa-house"></i>
                  返回主菜单
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { AI } from './game/ai.js'
import { setupAudio } from './audio/audio.js'

export default {
  name: 'App',
  data() {
    return {
      currentScreen: 'welcome',
      selectedMode: null,
      selectedDifficulty: 'medium',
      gameModes: [
        { id: 'pvp', text: '双人对战', icon: 'fa-solid fa-user-group' },
        { id: 'pve', text: '人机对战', icon: 'fa-solid fa-robot' }
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
        name: '白子玩家',
        color: 'white'
      },
      gameActions: [
        { id: 'undo', text: '悔棋', icon: 'fa-solid fa-rotate-left' },
        { id: 'restart', text: '重新开始', icon: 'fa-solid fa-arrows-rotate' },
        { id: 'surrender', text: '认输', icon: 'fa-solid fa-flag' },
        { id: 'back', text: '返回主菜单', icon: 'fa-solid fa-house' }
      ],
      gameOver: false,
      winner: null,
      moveHistory: [],
      isDraw: false,
      ai: new AI(),
      isAIThinking: false,
    }
  },
  
  mounted() {
    setupAudio()
  },
  
  methods: {
    handleMove({ row, col }) {
      if (!this.canMove || this.gameOver || this.board[row][col]) return
      
      // 玩家落子
      this.board[row][col] = this.currentPlayer
      this.moveHistory.push({ row, col, player: this.currentPlayer })
      
      // 检查是否获胜
      if (this.checkWin(row, col)) {
        this.gameOver = true
        this.winner = this.currentPlayer
        return
      }
      
      // 检查是否平局
      if (this.checkDraw()) {
        this.gameOver = true
        this.isDraw = true
        return
      }
      
      // 如果是 AI 模式且当前是玩家回合，让 AI 落子
      if (this.gameMode === 'pve' && this.currentPlayer === 'black') {
        // 切换到 AI 并显示思考状态
        this.currentPlayer = 'white'
        this.canMove = false
        this.isAIThinking = true
        
        // AI 延迟落子 (0.1-0.3秒随机)
        setTimeout(() => {
          this.makeAIMove()
        }, Math.random() * 200 + 100)
      } else {
        // 普通模式下切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black'
      }
    },
    
    makeAIMove() {
      if (!this.ai || this.gameOver) return
      
      const [row, col] = this.ai.findBestMove(this.board)
      if (row !== undefined && col !== undefined) {
        // AI 落子
        this.board[row][col] = 'white'
        this.moveHistory.push({ row, col, player: 'white' })
        
        // 检查 AI 是否获胜
        if (this.checkWin(row, col)) {
          this.gameOver = true
          this.winner = 'white'
          this.isAIThinking = false
          return
        }
        
        // 检查是否平局
        if (this.checkDraw()) {
          this.gameOver = true
          this.isDraw = true
          this.isAIThinking = false
          return
        }
        
        // 切换回玩家
        this.currentPlayer = 'black'
        this.canMove = true
        this.isAIThinking = false
      }
    },
    
    checkWin(row, col) {
      const directions = [
        [1, 0],  // 水平
        [0, 1],  // 垂直
        [1, 1],  // 对角线
        [1, -1]  // 反对角线
      ]
      
      const color = this.board[row][col]
      
      return directions.some(([dx, dy]) => {
        let count = 1
        
        // 正向检查
        for (let i = 1; i < 5; i++) {
          const newRow = row + dx * i
          const newCol = col + dy * i
          if (
            newRow < 0 || newRow >= 15 ||
            newCol < 0 || newCol >= 15 ||
            this.board[newRow][newCol] !== color
          ) break
          count++
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
          const newRow = row - dx * i
          const newCol = col - dy * i
          if (
            newRow < 0 || newRow >= 15 ||
            newCol < 0 || newCol >= 15 ||
            this.board[newRow][newCol] !== color
          ) break
          count++
        }
        
        return count >= 5
      })
    },
    
    checkDraw() {
      return this.board.every(row => row.every(cell => cell !== null))
    },
    
    getGameResultText() {
      if (this.isDraw) {
        return '平局！'
      }
      
      if (this.gameMode === 'pve') {
        if (this.winner === 'black') {
          return '恭喜你获胜！'
        } else {
          return 'AI 获胜了！'
        }
      } else {
        return `${this.winner === 'black' ? '黑棋' : '白棋'}获胜！`
      }
    },
    
    restartGame() {
      this.board = Array(15).fill().map(() => Array(15).fill(null))
      this.currentPlayer = 'black'
      this.moveHistory = []
      this.gameOver = false
      this.winner = null
      this.isDraw = false
      this.canMove = true
      this.isAIThinking = false
    },
    
    handleGameAction(action) {
      switch (action) {
        case 'undo':
          this.undoMove()
          break
        case 'restart':
          this.restartGame()
          break
        case 'surrender':
          this.handleSurrender()
          break
        case 'back':
          this.backToMenu()
          break
      }
    },

    undoMove() {
      if (this.moveHistory.length === 0) return
      
      if (this.gameMode === 'pve') {
        // 在 PvE 模式下，需要撤销两步（玩家和 AI 的移动）
        for (let i = 0; i < 2; i++) {
          const lastMove = this.moveHistory.pop()
          if (lastMove) {
            this.board[lastMove.row][lastMove.col] = null
          }
        }
        this.currentPlayer = 'black'
      } else {
        // 在 PvP 模式下，只撤销一步
        const lastMove = this.moveHistory.pop()
        this.board[lastMove.row][lastMove.col] = null
        this.currentPlayer = lastMove.player
      }
      
      this.gameOver = false
      this.winner = null
      this.canMove = true
    },

    handleSurrender() {
      this.gameOver = true
      if (this.gameMode === 'pve') {
        this.winner = 'white' // AI 获胜
      } else {
        this.winner = this.currentPlayer === 'black' ? 'white' : 'black'
      }
    },

    backToMenu() {
      this.currentScreen = 'welcome'
      this.restartGame()
    },

    showSettings() {
      // 实现设置面板
    },
    
    showHelp() {
      // 实现帮助面板
    },
    
    selectMode(mode) {
      this.selectedMode = mode
    },
    
    selectDifficulty(difficulty) {
      this.selectedDifficulty = difficulty
    },
    
    startGame() {
      if (this.selectedMode === 'pve') {
        this.ai.setDifficulty(this.selectedDifficulty)
      }
      this.gameMode = this.selectedMode
      this.currentScreen = 'game'
      this.restartGame()
    }
  }
}
</script>

<style scoped>
.welcome-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
}

.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
}

.welcome-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-align: center;
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
    padding: 0.75rem;
  }

  .welcome-content {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .mode-buttons,
  .difficulty-buttons {
    grid-template-columns: 1fr;
  }

  .mode-btn,
  .difficulty-btn {
    padding: 0.75rem;
  }

  .start-btn {
    width: 100%;
    margin-top: 0.75rem;
  }
}

.game-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.game-layout {
  flex: 1;
  display: flex;
  padding: 1rem;
  gap: 1rem;
  max-height: calc(100vh - 64px);
  overflow: hidden;
  justify-content: center;
  align-items: center;
}

.game-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 200px;
}

.game-content {
  flex: none;
  width: min(calc(100vh - 96px), calc(100vw - 440px));
  height: min(calc(100vh - 96px), calc(100vw - 440px));
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 200px;
}

/* 移动端适配 */
@media (max-width: 1024px) {
  .game-layout {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .game-sidebar {
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }

  .game-content {
    width: min(calc(100vh - 200px), 100%);
    height: min(calc(100vh - 200px), 100%);
  }

  .game-controls {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
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
</style> 