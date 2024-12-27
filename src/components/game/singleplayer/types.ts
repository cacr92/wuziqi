import type { PlayerColor } from '@/types'
import type { Position } from '../ai/types'

export interface GameState {
  board: (PlayerColor | null)[][]
  currentPlayer: PlayerColor
  gameOver: boolean
  winner: PlayerColor | null
  lastMove: Position | null
  isAITurn: boolean
  moveHistory: { x: number, y: number, player: PlayerColor }[]
  gameStarted: boolean
  showGameOver: boolean
  hoverCell: Position | null
  playerTimer: number
  aiTimer: number
}

export interface GameSettings {
  sound: boolean
  showTimer: boolean
  showLastMove: boolean
  showPreview: boolean
  boardTheme: string
}

export interface GameStats {
  playerWins: number
  aiWins: number
  draws: number
} 