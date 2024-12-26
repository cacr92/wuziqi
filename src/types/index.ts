export type PlayerColor = 'black' | 'white'
export type GameMode = 'pve' | 'online'
export type Board = (PlayerColor | null)[][]
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Move {
  row: number
  col: number
  player: PlayerColor
}

export interface GameState {
  board: Board
  currentPlayer: PlayerColor
  gameOver: boolean
  winner: PlayerColor | null
}

export interface GameStats {
  totalGames: number
  wins: number
  losses: number
}

export interface GameSettings {
  difficulty: Difficulty
  canUndo: boolean
  isMuted: boolean
}

export type GameResult = 'win' | 'loss' | 'lose' | 'draw' 