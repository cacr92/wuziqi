import type { PlayerColor } from '@/types'
import type { Position } from '../ai/types'

export class UIManager {
  private readonly size: number
  private readonly padding: number = 16
  private readonly border: number = 1.5

  constructor(size: number = 14) {
    this.size = size
  }

  calculateBoardPosition(event: MouseEvent, boardElement: HTMLElement): Position | null {
    const rect = boardElement.getBoundingClientRect()
    const effectiveWidth = rect.width - (this.padding * 2) - (this.border * 2)
    const cellSize = effectiveWidth / this.size

    const x = Math.floor((event.clientY - rect.top - this.padding - this.border) / cellSize)
    const y = Math.floor((event.clientX - rect.left - this.padding - this.border) / cellSize)

    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return { x, y }
    }

    return null
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  getGameOverTitle(winner: PlayerColor | null): string {
    if (winner === 'black') return '恭喜获胜！'
    if (winner === 'white') return 'AI获胜！'
    return '平局！'
  }

  getGameOverIcon(winner: PlayerColor | null): string {
    if (winner === 'black') return 'fa-trophy'
    if (winner === 'white') return 'fa-robot'
    return 'fa-handshake'
  }

  getGameOverMessage(winner: PlayerColor | null): string {
    if (winner === 'black') {
      return '你的实力超过了AI！继续保持！'
    }
    if (winner === 'white') {
      return 'AI技高一筹，再接再厉！'
    }
    return '势均力敌，不分胜负！'
  }

  getInitialCursorPosition(): Position {
    const center = Math.floor(this.size / 2)
    return { x: center, y: center }
  }

  calculateNextCursorPosition(current: Position, key: string): Position {
    const { x, y } = current
    
    switch (key) {
      case 'ArrowLeft':
        return { x, y: Math.max(0, y - 1) }
      case 'ArrowRight':
        return { x, y: Math.min(this.size - 1, y + 1) }
      case 'ArrowUp':
        return { x: Math.max(0, x - 1), y }
      case 'ArrowDown':
        return { x: Math.min(this.size - 1, x + 1), y }
      default:
        return current
    }
  }
} 