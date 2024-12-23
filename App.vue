<template>
  <div id="app" v-cloak>
    <transition name="fade">
      <!-- 欢迎界面 -->
      <div v-if="currentScreen === 'welcome'" class="screen welcome-screen">
        <game-header @settings="showSettings" @help="showHelp" />
        <div class="container">
          <div class="welcome-content">
            <h1 class="game-title">五子棋游戏</h1>
            <div class="mode-selection">
              <h2 class="section-title">选择游戏模式</h2>
              <div class="mode-buttons">
                <button 
                  v-for="mode in gameModes"
                  :key="mode.id"
                  @click="selectMode(mode.id)"
                  class="mode-btn"
                  :class="{ selected: selectedMode === mode.id }">
                  <i :class="mode.icon"></i>
                  <span>{{ mode.text }}</span>
                </button>
              </div>
            </div>

            <div v-if="selectedMode === 'pve'" class="difficulty-selection">
              <h2 class="section-title">选择难度</h2>
              <div class="difficulty-buttons">
                <button 
                  v-for="level in difficultyLevels"
                  :key="level.id"
                  @click="selectDifficulty(level.id)"
                  class="difficulty-btn"
                  :class="{ selected: selectedDifficulty === level.id }">
                  {{ level.text }}
                </button>
              </div>
            </div>

            <button 
              class="start-game-btn" 
              @click="startGame" 
              :disabled="!selectedMode"
              :class="{ 'btn-disabled': !selectedMode }">
              开始游戏
            </button>
          </div>
        </div>
      </div>

      <!-- 游戏界面 -->
      <div v-else class="screen game-screen">
        <div class="game-container">
          <div class="game-sidebar">
            <player-card
              :name="player1.name"
              :piece-color="player1.color"
              :is-active="currentPlayer === player1.color"
              :is-ai="false"
            />
            <player-card
              v-if="gameMode === 'pve'"
              name="AI 对手"
              :piece-color="player2.color"
              :is-active="currentPlayer === player2.color"
              :is-ai="true"
            />
            
            <div class="game-stats">
              <div class="stat-card">
                <div class="stat-value">{{ moveHistory.length }}</div>
                <div class="stat-label">回合数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ formatTime(timeLeft) }}</div>
                <div class="stat-label">剩余时间</div>
              </div>
            </div>
          </div>
          
          <div class="game-main">
            <game-board
              ref="gameBoard"
              :board="board"
              :current-player="currentPlayer"
              :can-move="canMove"
              @make-move="handleMove"
            />
            
            <game-controls
              :actions="gameActions"
              @action="handleGameAction"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { AI } from '@/game/ai.js'
import { setupAudio } from '@/audio/audio.js'

export default {
  name: 'App',
  data() {
    return {
      currentScreen: 'welcome',
      selectedMode: null,
      selectedDifficulty: 'medium',
      gameMode: null,
      board: Array(15).fill().map(() => Array(15).fill(null)),
      currentPlayer: 'black',
      canMove: true,
      gameOver: false,
      winner: null,
      moveHistory: [],
      timeLeft: 30,
      isAIThinking: false,
      
      player1: {
        name: '玩家 1',
        color: 'black'
      },
      player2: {
        name: '玩家 2',
        color: 'white'
      },
      
      gameModes: [
        { id: 'pvp', text: '人人对战', icon: 'fa-solid fa-user-group' },
        { id: 'pve', text: '人机对战', icon: 'fa-solid fa-robot' }
      ],
      
      difficultyLevels: [
        { id: 'easy', text: '简单' },
        { id: 'medium', text: '中等' },
        { id: 'hard', text: '困难' }
      ],
      
      gameActions: [
        { id: 'undo', text: '悔棋', icon: 'fa-solid fa-rotate-left' },
        { id: 'restart', text: '重新开始', icon: 'fa-solid fa-arrows-rotate' },
        { id: 'surrender', text: '认输', icon: 'fa-solid fa-flag' },
        { id: 'back', text: '返回主菜单', icon: 'fa-solid fa-house' }
      ]
    }
  },
  
  mounted() {
    setupAudio()
    this.ai = new AI()
  },
  
  methods: {
    selectMode(mode) {
      this.selectedMode = mode
    },
    
    selectDifficulty(difficulty) {
      this.selectedDifficulty = difficulty
    },
    
    startGame() {
      if (!this.selectedMode) return
      
      this.gameMode = this.selectedMode
      this.board = Array(15).fill().map(() => Array(15).fill(null))
      this.currentPlayer = 'black'
      this.gameOver = false
      this.winner = null
      this.moveHistory = []
      this.canMove = true
      this.isAIThinking = false
      
      this.currentScreen = 'game'
      
      if (this.gameMode === 'pve' && this.currentPlayer === 'white') {
        this.aiMove()
      }
    },
    
    handleMove({ row, col }) {
      if (!this.canMove || this.gameOver || this.board[row][col]) return
      
      this.board[row][col] = this.currentPlayer
      this.moveHistory.push({ row, col, player: this.currentPlayer })
      
      if (this.checkWin(row, col)) {
        this.handleWin(this.currentPlayer)
        return
      }
      
      this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black'
      
      if (this.gameMode === 'pve' && !this.gameOver && this.currentPlayer === 'white') {
        this.aiMove()
      }
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
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    showSettings() {
      // 实现设置面板
    },
    
    showHelp() {
      // 实现帮助面板
    }
  }
}
</script>

<style>
@import './styles.css';
</style> 