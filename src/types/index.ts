export type GameMode = 'pve' | 'pvp' | 'online'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type PlayerColor = 'black' | 'white'

export interface Move {
  row: number
  col: number
  player: PlayerColor
}

export type Board = (PlayerColor | null)[][]

export interface GameStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
} 