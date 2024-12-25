export type GameMode = 'pve' | 'online'
export type PlayerColor = 'black' | 'white'

export interface Move {
  row: number
  col: number
  player: PlayerColor
}

export type Board = (PlayerColor | null)[][]

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
  difficulty: 'easy' | 'medium' | 'hard'
  canUndo: boolean
  isMuted: boolean
}

export type GameResult = 'win' | 'loss' | 'draw'

export type Difficulty = 'easy' | 'medium' | 'hard' 