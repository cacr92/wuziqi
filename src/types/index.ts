export type PlayerColor = 'black' | 'white'
export type GameMode = 'pve' | 'pvp' | 'online'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GameSettings {
  difficulty: Difficulty
  canUndo: boolean
  isMuted: boolean
}

export type Board = (PlayerColor | null)[][]

export interface GameStats {
  totalGames: number
  wins: number
  losses: number
} 