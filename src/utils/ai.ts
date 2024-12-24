import type { Board, Move, Difficulty, PlayerColor } from '../types'

class AI {
  private readonly directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1]   // 左下斜
  ]

  private readonly scores = {
    FIVE: 100000,        // 连五
    OPEN_FOUR: 10000,    // 活四
    BLOCKED_FOUR: 1000,  // 冲四
    OPEN_THREE: 1000,    // 活三
    BLOCKED_THREE: 100,  // 眠三
    OPEN_TWO: 100,      // 活二
    BLOCKED_TWO: 10     // 眠二
  }

  private cache = new Map<string, number>()

  async getMove(board: Board, difficulty: Difficulty): Promise<Move> {
    try {
      const delay = this.getThinkingTime(difficulty)
      await new Promise(resolve => setTimeout(resolve, delay))

      switch (difficulty) {
        case 'easy':
          return this.getRandomMove(board)
        case 'medium':
          return this.getMediumMove(board)
        case 'hard':
          return this.getHardMove(board)
        default:
          throw new Error('Invalid difficulty level')
      }
    } catch (error) {
      console.error('AI move error:', error)
      return this.getRandomMove(board)
    }
  }

  private getRandomMove(board: Board): Move {
    const emptySpots = this.getEmptySpots(board)
    if (emptySpots.length === 0) {
      throw new Error('No valid moves available')
    }
    return emptySpots[Math.floor(Math.random() * emptySpots.length)]
  }

  private getMediumMove(board: Board): Move {
    const emptySpots = this.getEmptySpots(board)
    let bestScore = -Infinity
    let bestMove = emptySpots[0]

    for (const move of emptySpots) {
      board[move.row][move.col] = 'white'
      const score = this.evaluatePosition(board, move.row, move.col)
      board[move.row][move.col] = null
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private getHardMove(board: Board): Move {
    const emptySpots = this.getEmptySpots(board)
    let bestScore = -Infinity
    let bestMove = emptySpots[0]

    for (const move of emptySpots) {
      board[move.row][move.col] = 'white'
      const score = this.minimax(board, 3, false)
      board[move.row][move.col] = null
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private getEmptySpots(board: Board): Move[] {
    const spots: Move[] = []
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (!board[i][j]) {
          spots.push({ row: i, col: j, player: 'white' })
        }
      }
    }
    return spots
  }

  private evaluatePosition(board: Board, row: number, col: number): number {
    let score = 0
    for (const [dx, dy] of this.directions) {
      score += this.evaluateDirection(board, row, col, dx, dy)
    }
    return score
  }

  private evaluateDirection(board: Board, row: number, col: number, dx: number, dy: number): number {
    let score = 0
    let count = 1
    let blocked = 0
    const currentColor: PlayerColor = 'white'

    // 正向检查
    for (let i = 1; i <= 4; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      const cell = board[newRow][newCol]
      if (cell === currentColor) count++
      else if (cell === 'black') {
        blocked++
        break
      }
      else break
    }

    // 反向检查
    for (let i = 1; i <= 4; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      const cell = board[newRow][newCol]
      if (cell === currentColor) count++
      else if (cell === 'black') {
        blocked++
        break
      }
      else break
    }

    if (count >= 5) score = this.scores.FIVE
    else if (count === 4) {
      score = blocked === 0 ? this.scores.OPEN_FOUR : this.scores.BLOCKED_FOUR
    }
    else if (count === 3) {
      score = blocked === 0 ? this.scores.OPEN_THREE : this.scores.BLOCKED_THREE
    }
    else if (count === 2) {
      score = blocked === 0 ? this.scores.OPEN_TWO : this.scores.BLOCKED_TWO
    }

    return score
  }

  private minimax(board: Board, depth: number, isMaximizing: boolean): number {
    const key = `${board.toString()}-${depth}-${isMaximizing}`
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    if (depth === 0) return this.evaluateBoard(board)

    const moves = this.getEmptySpots(board)
    if (moves.length === 0) return 0

    let score: number
    if (isMaximizing) {
      score = -Infinity
      for (const move of moves) {
        board[move.row][move.col] = 'white'
        score = Math.max(score, this.minimax(board, depth - 1, false))
        board[move.row][move.col] = null
      }
    } else {
      score = Infinity
      for (const move of moves) {
        board[move.row][move.col] = 'black'
        score = Math.min(score, this.minimax(board, depth - 1, true))
        board[move.row][move.col] = null
      }
    }

    this.cache.set(key, score)
    return score
  }

  private evaluateBoard(board: Board): number {
    let score = 0
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j]) {
          const positionScore = this.evaluatePosition(board, i, j)
          score += board[i][j] === 'white' ? positionScore : -positionScore
        }
      }
    }
    return score
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 15 && col >= 0 && col < 15
  }

  private getThinkingTime(difficulty: Difficulty): number {
    switch (difficulty) {
      case 'easy': return 500
      case 'medium': return 800
      case 'hard': return 1200
      default: return 500
    }
  }

  public clearCache(): void {
    this.cache.clear()
  }
}

export { AI } 