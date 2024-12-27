import type { Board, PlayerColor } from '../src/types/index'

export interface Room {
  id: string
  players: {
    black: string | null
    white: string | null
  }
  board: Board
  currentPlayer: PlayerColor
  gameStarted: boolean
  lastMove: { row: number; col: number } | null
  gameTime: number
  timers: {
    black: number
    white: number
  }
  timerInterval: NodeJS.Timeout | null
  createTime: number
  lastActiveTime: number
} 