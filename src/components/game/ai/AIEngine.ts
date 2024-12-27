import type { PlayerColor } from '@/types'
import type { Position, GameScore } from './types'

export class AIEngine {
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

  getNextMove(board: (PlayerColor | null)[][]): Position {
    // 创建棋盘副本以避免修改原始数据
    const boardCopy = this.copyBoard(board)
    
    // 防守：检查玩家是否有威胁位置
    const blockingMove = this.findWinningMove(boardCopy, 'black')
    if (blockingMove) return blockingMove

    // 进攻：检查AI是否有制胜位置
    const winningMove = this.findWinningMove(boardCopy, 'white')
    if (winningMove) return winningMove

    // 如果没有特殊情况，选择最优位置
    return this.findBestMove(boardCopy)
  }

  private findWinningMove(board: (PlayerColor | null)[][], player: PlayerColor): Position | null {
    const positions = this.getValidMoves(board)
    
    for (const pos of positions) {
      // 创建棋盘副本���行模拟
      const boardCopy = this.copyBoard(board)
      
      // 模拟落子
      boardCopy[pos.x][pos.y] = player
      
      // 评估此位置
      if (this.checkWin(boardCopy, pos.x, pos.y, player)) {
        return pos
      }
    }
    
    return null
  }

  private findBestMove(board: (PlayerColor | null)[][]): Position {
    const positions = this.getValidMoves(board)
    let bestScore = -Infinity
    let bestMove = positions[0]
    
    for (const pos of positions) {
      // 创建棋盘副本进行模拟
      const boardCopy = this.copyBoard(board)
      
      // 模拟落子
      boardCopy[pos.x][pos.y] = 'white'
      
      // 评估此位置
      const score = this.evaluateMove(boardCopy, pos)
      
      // 更新最佳位置
      if (score > bestScore) {
        bestScore = score
        bestMove = pos
      }
    }
    
    return bestMove
  }

  private evaluateMove(board: (PlayerColor | null)[][], pos: Position): number {
    let totalScore = 0
    
    // 评估AI的进攻分数
    const aiScore = this.evaluatePosition(board, pos.x, pos.y, 'white')
    totalScore += this.getScoreForPattern(aiScore)
    
    // 评估阻止玩家的分数
    board[pos.x][pos.y] = 'black'
    const playerScore = this.evaluatePosition(board, pos.x, pos.y, 'black')
    totalScore += this.getScoreForPattern(playerScore) * 0.8 // 防守权重略低
    board[pos.x][pos.y] = 'white'
    
    // 加入位置权重
    totalScore += this.getPositionScore(pos.x, pos.y)
    
    return totalScore
  }

  private evaluatePosition(board: (PlayerColor | null)[][], x: number, y: number, player: PlayerColor): GameScore {
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

  private getScoreForPattern({ count, space, blocked }: GameScore): number {
    // 五子连珠
    if (count >= 5) return 100000
    
    // 活四
    if (count === 4 && blocked === 0) return 10000
    
    // 冲四
    if (count === 4 && blocked === 1) return 1000
    
    // 活三
    if (count === 3 && blocked === 0) return 1000
    
    // 眠三
    if (count === 3 && blocked === 1) return 100
    
    // 活二
    if (count === 2 && blocked === 0) return 100
    
    // 眠二
    if (count === 2 && blocked === 1) return 10
    
    return 1
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

  private getValidMoves(board: (PlayerColor | null)[][]): Position[] {
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

  private getPositionScore(x: number, y: number): number {
    const centerX = Math.floor(this.size / 2)
    const centerY = Math.floor(this.size / 2)
    const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY)
    return Math.max(0, 50 - distanceFromCenter * 5)
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size
  }

  private copyBoard(board: (PlayerColor | null)[][]): (PlayerColor | null)[][] {
    return board.map(row => [...row])
  }
} 