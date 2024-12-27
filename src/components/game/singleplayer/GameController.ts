import type { PlayerColor } from '@/types'
import type { GameState, GameSettings, GameStats } from './types'
import { GameEngine } from './GameEngine'
import { AIPlayer } from './AIPlayer'
import { AudioManager } from './AudioManager'
import { SettingsManager } from './SettingsManager'
import { UIManager } from './UIManager'

export class GameController {
  private readonly engine: GameEngine
  private readonly ai: AIPlayer
  private readonly audio: AudioManager
  private readonly settingsManager: SettingsManager
  private readonly ui: UIManager
  private state: GameState
  private timerInterval: number | null = null

  constructor(size: number = 15) {
    this.engine = new GameEngine(size)
    this.ai = new AIPlayer(size)
    this.settingsManager = new SettingsManager()
    this.audio = new AudioManager(this.settingsManager.getSettings().sound)
    this.ui = new UIManager(size)
    this.state = this.createInitialState()
  }

  private createInitialState(): GameState {
    return {
      board: this.engine.createBoard(),
      currentPlayer: 'black',
      gameOver: false,
      winner: null,
      lastMove: null,
      isAITurn: false,
      moveHistory: [],
      gameStarted: false,
      showGameOver: false,
      hoverCell: null,
      playerTimer: 0,
      aiTimer: 0
    }
  }

  getState(): GameState {
    return { ...this.state }
  }

  getSettings(): GameSettings {
    return this.settingsManager.getSettings()
  }

  getStats(): GameStats {
    return this.settingsManager.getStats()
  }

  getGameOverInfo() {
    return {
      title: this.ui.getGameOverTitle(this.state.winner),
      icon: this.ui.getGameOverIcon(this.state.winner),
      message: this.ui.getGameOverMessage(this.state.winner)
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.settingsManager.updateSettings(settings)
    this.audio.setEnabled(settings.sound ?? this.settingsManager.getSettings().sound)
  }

  async handleMove(x: number, y: number): Promise<void> {
    const { board, gameStarted, gameOver, isAITurn } = this.state
    
    if (!gameStarted || gameOver || isAITurn) return
    if (!this.engine.isValidMove(board, x, y)) return

    try {
      // 玩家落子
      this.makeMove(x, y, 'black')
      
      if (this.settingsManager.getSettings().sound) {
        this.audio.play('move')
      }

      // 检查玩家是否获胜
      if (this.engine.checkWin(board, x, y, 'black')) {
        this.handleGameOver('black')
        return
      }

      // 检查是否平局
      if (this.engine.checkDraw(board)) {
        this.handleGameOver(null)
        return
      }

      // 切换到AI回合
      this.state.isAITurn = true

      // 添加延迟，模拟AI思考
      await new Promise(resolve => setTimeout(resolve, 500))

      // AI落子
      const aiMove = this.ai.getNextMove(this.engine.copyBoard(board))
      if (this.engine.isValidMove(board, aiMove.x, aiMove.y)) {
        this.makeMove(aiMove.x, aiMove.y, 'white')
        
        if (this.settingsManager.getSettings().sound) {
          this.audio.play('move')
        }

        // 检查AI是否获胜
        if (this.engine.checkWin(board, aiMove.x, aiMove.y, 'white')) {
          this.handleGameOver('white')
          return
        }

        // 检查是否平局
        if (this.engine.checkDraw(board)) {
          this.handleGameOver(null)
          return
        }
      }

      // 切换回玩家回合
      this.state.isAITurn = false
    } catch (error) {
      console.error('Error in handleMove:', error)
      this.state.isAITurn = false
      throw error
    }
  }

  private makeMove(x: number, y: number, player: PlayerColor): void {
    this.state.board[x][y] = player
    this.state.lastMove = { x, y }
    this.state.moveHistory.push({ x, y, player })
  }

  handleGameOver(winner: PlayerColor | null): void {
    if (this.state.gameOver) return

    this.state.gameOver = true
    this.state.winner = winner
    
    // 更新统计信息
    const stats = this.settingsManager.getStats()
    if (winner === 'black') {
      stats.playerWins++
      if (this.settingsManager.getSettings().sound) {
        this.audio.play('win')
      }
    } else if (winner === 'white') {
      stats.aiWins++
      if (this.settingsManager.getSettings().sound) {
        this.audio.play('lose')
      }
    } else {
      stats.draws++
    }
    this.settingsManager.updateStats(stats)
    
    this.stopTimer()
    this.state.showGameOver = true
  }

  startGame(): void {
    this.state = this.createInitialState()
    this.state.gameStarted = true
    this.startTimer()
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    
    this.timerInterval = window.setInterval(() => {
      if (!this.state.gameOver && this.state.gameStarted) {
        if (this.state.isAITurn) {
          this.state.aiTimer++
        } else {
          this.state.playerTimer++
        }
        // 创建新的状态对象以触发响应式更新
        this.state = {
          ...this.state,
          aiTimer: this.state.aiTimer,
          playerTimer: this.state.playerTimer
        }
      }
    }, 1000)
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  handleCellHover(event: MouseEvent): void {
    if (this.state.isAITurn || this.state.gameOver) return
    
    const boardElement = event.currentTarget as HTMLElement
    const position = this.ui.calculateBoardPosition(event, boardElement)
    
    if (position && this.engine.isValidMove(this.state.board, position.x, position.y)) {
      this.state.hoverCell = position
    } else {
      this.state.hoverCell = null
    }
  }

  handleCellLeave(): void {
    this.state.hoverCell = null
  }

  handleKeyboardNavigation(key: string): void {
    if (this.state.isAITurn || this.state.gameOver) return

    if (!this.state.hoverCell) {
      this.state.hoverCell = this.ui.getInitialCursorPosition()
      return
    }

    const newPosition = this.ui.calculateNextCursorPosition(this.state.hoverCell, key)
    if (this.engine.isValidMove(this.state.board, newPosition.x, newPosition.y)) {
      this.state.hoverCell = newPosition
    }
  }

  cleanup(): void {
    this.stopTimer()
    this.audio.cleanup()
  }
} 