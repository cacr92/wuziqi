import type { Board, PlayerColor, GameState, Move } from '../types'

// 缓存系统
const boardCache = new Int8Array(225) // 15x15 棋盘
const positionCache = new Int32Array(225) // 位置评分缓存
const moveCache = new Map<string, boolean>()
const gameStateCache = new Map<string, GameState>()

// 评分系统
export const SCORES = {
  FIVE: 100000,        // 连五
  OPEN_FOUR: 50000,    // 活四
  DOUBLE_THREE: 10000, // 双活三
  BLOCKED_FOUR: 5000,  // 冲四
  OPEN_THREE: 3000,    // 活三
  BLOCKED_THREE: 500,  // 眠三
  OPEN_TWO: 400,       // 活二
  BLOCKED_TWO: 100,    // 眠二
  ONE: 10              // 单子
}

// 方向数组
const DIRECTIONS = [
  [1, 0],   // 水平
  [0, 1],   // 垂直
  [1, 1],   // 对角线
  [1, -1]   // 反对角线
]

export class GameOptimizer {
  // 位置验证
  static isValidPosition(row: number, col: number): boolean {
    return (row | col) >= 0 && (row & col) < 15
  }

  // 移动验证
  static validateMove(state: GameState, row: number, col: number): boolean {
    const key = `${row}-${col}`
    if (moveCache.has(key)) return moveCache.get(key)!
    
    const valid = this.isValidPosition(row, col) && 
                  !state.board[row][col] && 
                  !state.gameOver
    
    moveCache.set(key, valid)
    return valid
  }

  // 评估位置分数
  static evaluatePosition(board: Board, row: number, col: number, color: PlayerColor): number {
    const cacheIndex = row * 15 + col
    const cachedValue = positionCache[cacheIndex]
    if (cachedValue !== 0) return cachedValue
    
    let totalScore = 0
    let openThrees = 0
    
    for (const [dx, dy] of DIRECTIONS) {
      const lineScore = this.evaluateLine(board, row, col, dx, dy, color)
      if (lineScore === SCORES.OPEN_THREE) openThrees++
      totalScore += lineScore
    }
    
    // 双活三特殊处理
    if (openThrees >= 2) totalScore += SCORES.DOUBLE_THREE
    
    positionCache[cacheIndex] = totalScore
    return totalScore
  }

  // 评估一条线的分数
  private static evaluateLine(
    board: Board,
    row: number,
    col: number,
    dx: number,
    dy: number,
    color: PlayerColor
  ): number {
    let count = 1
    let blocked = 0
    let space = 0
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      
      const cell = board[newRow][newCol]
      if (cell === null) {
        if (space === 0) space = i
        break
      }
      if (cell !== color) {
        blocked++
        break
      }
      count++
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      
      const cell = board[newRow][newCol]
      if (cell === null) {
        if (space === 0) space = i
        break
      }
      if (cell !== color) {
        blocked++
        break
      }
      count++
    }
    
    return this.getScoreForPattern(count, blocked, space)
  }

  // 根据棋型获取分数
  private static getScoreForPattern(count: number, blocked: number, space: number): number {
    if (count >= 5) return SCORES.FIVE
    if (count === 4) {
      if (blocked === 0) return SCORES.OPEN_FOUR
      if (blocked === 1) return SCORES.BLOCKED_FOUR
    }
    if (count === 3) {
      if (blocked === 0) return SCORES.OPEN_THREE
      if (blocked === 1 && space <= 2) return SCORES.BLOCKED_THREE
    }
    if (count === 2) {
      if (blocked === 0) return SCORES.OPEN_TWO
      if (blocked === 1 && space <= 2) return SCORES.BLOCKED_TWO
    }
    return SCORES.ONE
  }

  // 生成可能的移动
  static generateMoves(board: Board): { row: number; col: number }[] {
    const moves: { row: number; col: number; score: number }[] = []
    const visited = new Set<string>()
    
    // 只考虑已有棋子周围的位置
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j]) {
          for (let di = -2; di <= 2; di++) {
            for (let dj = -2; dj <= 2; dj++) {
              const newRow = i + di
              const newCol = j + dj
              const key = `${newRow},${newCol}`
              
              if (this.isValidPosition(newRow, newCol) && 
                  !board[newRow][newCol] && 
                  !visited.has(key)) {
                const score = this.evaluatePosition(board, newRow, newCol, 'white')
                moves.push({ row: newRow, col: newCol, score })
                visited.add(key)
              }
            }
          }
        }
      }
    }
    
    // 按评分排序，优先考虑高分位置
    return moves
      .sort((a, b) => b.score - a.score)
      .map(({ row, col }) => ({ row, col }))
  }

  // 缓存游戏状态
  static cacheGameState(state: GameState): void {
    const key = this.getGameStateKey(state)
    gameStateCache.set(key, { ...state })
  }

  // 获取缓存的游戏状态
  static getCachedGameState(state: GameState): GameState | undefined {
    const key = this.getGameStateKey(state)
    return gameStateCache.get(key)
  }

  // 生成游戏状态的键
  private static getGameStateKey(state: GameState): string {
    return `${state.board.map(row => row.join('')).join('')}-${state.currentPlayer}`
  }

  // 清理所有缓存
  static clearCache(): void {
    boardCache.fill(0)
    positionCache.fill(0)
    moveCache.clear()
    gameStateCache.clear()
  }

  // 优化棋盘初始化
  static getEmptyBoard(): Board {
    boardCache.fill(0)
    return Array(15).fill(null).map(() => Array(15).fill(null))
  }

  // 检查获胜
  static checkWin(board: Board, row: number, col: number, color: PlayerColor): boolean {
    for (const [dx, dy] of DIRECTIONS) {
      let count = 1
      
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (!this.isValidPosition(newRow, newCol) || board[newRow][newCol] !== color) break
        count++
      }
      
      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (!this.isValidPosition(newRow, newCol) || board[newRow][newCol] !== color) break
        count++
      }
      
      if (count >= 5) return true
    }
    return false
  }
} 