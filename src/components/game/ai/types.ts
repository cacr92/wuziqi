import type { PlayerColor } from '@/types'

export interface Position {
  x: number
  y: number
}

export interface GameScore {
  count: number
  space: number
  blocked: number
}

export interface AIConfig {
  boardSize: number
  thinkingTime: number
  defaultDifficulty: 'easy' | 'medium' | 'hard'
} 