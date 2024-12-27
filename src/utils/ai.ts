import type { Position } from '@/types'

// 方向数组，用于检查连线
const DIRECTIONS = [
  [1, 0],   // 水平
  [0, 1],   // 垂直
  [1, 1],   // 主对角线
  [1, -1],  // 副对角线
]

// 评分系统
const SCORES = {
  FIVE: 100000,      // 五连
  OPEN_FOUR: 10000,  // 活四
  FOUR: 1000,        // 冲四
  OPEN_THREE: 1000,  // 活三
  THREE: 100,        // 眠三
  OPEN_TWO: 100,     // 活二
  TWO: 10,          // 眠二
  ONE: 1            // 单子
}

export class AggressiveAI {
  private size: number
  private player: number
  private board: number[][]
  private maxDepth: number = 2

  constructor(size: number, player: number) {
    this.size = size
    this.player = player
    this.board = Array(size).fill(0).map(() => Array(size).fill(0))
  }

  updateBoard(board: number[][]) {
    this.board = board.map(row => [...row])
  }

  getBestMove(): { x: number, y: number } {
    const moves = this.getValidMoves()
    let bestScore = -Infinity
    let bestMove = moves[0]

    // 第一步下中心点
    if (this.isFirstMove()) {
      const center = Math.floor(this.size / 2)
      return { x: center, y: center }
    }

    // 评估每个可能的位置
    for (const move of moves) {
      // 模拟落子
      this.board[move.x][move.y] = this.player
      const score = this.minimax(this.maxDepth, false, -Infinity, Infinity)
      this.board[move.x][move.y] = 0

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private isFirstMove(): boolean {
    return this.board.every(row => row.every(cell => cell === 0))
  }

  private getValidMoves(): { x: number, y: number }[] {
    const moves: { x: number, y: number }[] = []
    const visited = new Set<string>()

    // 遍历所有已有棋子的周围位置
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] !== 0) {
          // 检查周围8个方向
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue
              
              const x = i + dx
              const y = j + dy
              const key = `${x},${y}`

              if (
                x >= 0 && x < this.size && 
                y >= 0 && y < this.size && 
                this.board[x][y] === 0 &&
                !visited.has(key)
              ) {
                moves.push({ x, y })
                visited.add(key)
              }
            }
          }
        }
      }
    }

    // 如果没有找到任何可用位置，返回所有空位
    if (moves.length === 0) {
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (this.board[i][j] === 0) {
            moves.push({ x: i, y: j })
          }
        }
      }
    }

    return moves
  }

  private minimax(depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
    if (depth === 0) {
      return this.evaluateBoard()
    }

    const moves = this.getValidMoves()
    
    if (isMaximizing) {
      let maxScore = -Infinity
      for (const move of moves) {
        this.board[move.x][move.y] = this.player
        const score = this.minimax(depth - 1, false, alpha, beta)
        this.board[move.x][move.y] = 0
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break
      }
      return maxScore
    } else {
      let minScore = Infinity
      const opponent = this.player === 1 ? 2 : 1
      for (const move of moves) {
        this.board[move.x][move.y] = opponent
        const score = this.minimax(depth - 1, true, alpha, beta)
        this.board[move.x][move.y] = 0
        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)
        if (beta <= alpha) break
      }
      return minScore
    }
  }

  private evaluateBoard(): number {
    let score = 0
    const opponent = this.player === 1 ? 2 : 1

    // 评估所有方向
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === this.player) {
          // AI的得分
          score += this.evaluatePosition(i, j, this.player) * 1.1
        } else if (this.board[i][j] === opponent) {
          // 对手的得分（用于防守）
          score -= this.evaluatePosition(i, j, opponent)
        }
      }
    }

    return score
  }

  private evaluatePosition(row: number, col: number, player: number): number {
    const directions = [
      [1, 0],   // 水平
      [0, 1],   // 垂直
      [1, 1],   // 主对角线
      [1, -1],  // 副对角线
    ]

    let totalScore = 0

    for (const [dx, dy] of directions) {
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
        if (this.board[newRow][newCol] === 0) {
          space++
          break
        }
        if (this.board[newRow][newCol] !== player) {
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
        if (this.board[newRow][newCol] === 0) {
          space++
          break
        }
        if (this.board[newRow][newCol] !== player) {
          blocked++
          break
        }
        count++
      }

      totalScore += this.getScoreForPattern(count, blocked, space)
    }

    return totalScore
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size
  }

  private getScoreForPattern(count: number, blocked: number, space: number): number {
    if (count >= 5) return SCORES.FIVE
    if (count === 4) {
      if (blocked === 0) return SCORES.OPEN_FOUR
      if (blocked === 1) return SCORES.FOUR
    }
    if (count === 3) {
      if (blocked === 0) return SCORES.OPEN_THREE
      if (blocked === 1) return SCORES.THREE
    }
    if (count === 2) {
      if (blocked === 0) return SCORES.OPEN_TWO
      if (blocked === 1) return SCORES.TWO
    }
    if (count === 1 && blocked === 0) return SCORES.ONE
    return 0
  }
}