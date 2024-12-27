import type { PlayerColor } from '@/types'
import type { Position, GameScore } from '../ai/types'

export class GameEngine {
  private readonly size: number
  private readonly directions = [
    [0, 1],  // 水平
    [1, 0],  // 垂直
    [1, 1],  // 主对角线
    [1, -1]  // 副对角线
  ]

  constructor(size: number = 14) {
    this.size = size
  }

  createBoard(): (PlayerColor | null)[][] {
    return Array(this.size).fill(null).map(() => Array(this.size).fill(null))
  }

  copyBoard(board: (PlayerColor | null)[][]): (PlayerColor | null)[][] {
    return board.map(row => [...row])
  }

  isValidMove(board: (PlayerColor | null)[][], x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size && board[x][y] === null
  }

  getValidMoves(board: (PlayerColor | null)[][]): Position[] {
    const positions: Position[] = []
    
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (board[x][y] === null && this.hasNeighbor(board, x, y)) {
          positions.push({ x, y })
        }
      }
    }
    
    // 如果没有找到任何位置（开局），返回中心点
    if (positions.length === 0) {
      const center = Math.floor(this.size / 2)
      positions.push({ x: center, y: center })
    }
    
    return positions
  }

  checkWin(board: (PlayerColor | null)[][], x: number, y: number, player: PlayerColor): boolean {
    return this.directions.some(([dx, dy]) => {
      let count = 1
      
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newX = x + dx * i
        const newY = y + dy * i
        if (!this.isValidPosition(newX, newY) || board[newX][newY] !== player) break
        count++
      }
      
      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newX = x - dx * i
        const newY = y - dy * i
        if (!this.isValidPosition(newX, newY) || board[newX][newY] !== player) break
        count++
      }
      
      return count >= 5
    })
  }

  checkDraw(board: (PlayerColor | null)[][]): boolean {
    return board.every(row => row.every(cell => cell !== null))
  }

  evaluatePosition(board: (PlayerColor | null)[][], x: number, y: number, player: PlayerColor): GameScore {
    let maxCount = 1
    let maxSpace = 0
    let minBlocked = 2
    
    this.directions.forEach(([dx, dy]) => {
      let count = 1
      let space = 0
      let blocked = 0
      
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newX = x + dx * i
        const newY = y + dy * i
        
        if (!this.isValidPosition(newX, newY)) {
          blocked++
          break
        }
        
        const cell = board[newX][newY]
        if (cell === null) {
          space++
          break
        }
        if (cell !== player) {
          blocked++
          break
        }
        count++
      }
      
      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newX = x - dx * i
        const newY = y - dy * i
        
        if (!this.isValidPosition(newX, newY)) {
          blocked++
          break
        }
        
        const cell = board[newX][newY]
        if (cell === null) {
          space++
          break
        }
        if (cell !== player) {
          blocked++
          break
        }
        count++
      }
      
      // 更新最优值
      if (count > maxCount || (count === maxCount && space > maxSpace)) {
        maxCount = count
        maxSpace = space
        minBlocked = blocked
      }
    })
    
    return { count: maxCount, space: maxSpace, blocked: minBlocked }
  }

  private hasNeighbor(board: (PlayerColor | null)[][], x: number, y: number): boolean {
    // 检查周围8个方向是否有棋子
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue
        
        const newX = x + dx
        const newY = y + dy
        
        if (this.isValidPosition(newX, newY) && board[newX][newY] !== null) {
          return true
        }
      }
    }
    
    // 如果是空棋盘，也返回true
    return board.every(row => row.every(cell => cell === null))
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size
  }
} 