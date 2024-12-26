import type { Board, PlayerColor } from '../types'

class AI {
  private difficulty: 'easy' | 'medium' | 'hard'
  private directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1]   // 左上斜
  ]

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.difficulty = difficulty
  }

  getMove(board: Board) {
    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(board)
      case 'medium':
        return this.getSmartMove(board)
      case 'hard':
        return this.getBestMove(board)
      default:
        return this.getSmartMove(board)
    }
  }

  private getRandomMove(board: Board) {
    const emptySpots = this.getEmptySpots(board)
    if (emptySpots.length === 0) return null
    
    return emptySpots[Math.floor(Math.random() * emptySpots.length)]
  }

  private getSmartMove(board: Board) {
    // 先检查是否可以获胜
    const winningMove = this.findWinningMove(board, 'white')
    if (winningMove) return winningMove

    // 检查是否需要防守
    const blockingMove = this.findWinningMove(board, 'black')
    if (blockingMove) return blockingMove

    // 否则选择最有价值的位置
    return this.findBestValueMove(board)
  }

  private getBestMove(board: Board) {
    // 使用极小化极大算法
    const emptySpots = this.getEmptySpots(board)
    let bestScore = -Infinity
    let bestMove = null

    for (const spot of emptySpots) {
      board[spot.row][spot.col] = 'white'
      const score = this.minimax(board, 3, false)
      board[spot.row][spot.col] = null

      if (score > bestScore) {
        bestScore = score
        bestMove = spot
      }
    }

    return bestMove
  }

  private getEmptySpots(board: Board) {
    const spots = []
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (!board[i][j]) {
          spots.push({ row: i, col: j })
        }
      }
    }
    return spots
  }

  private evaluatePosition(board: Board, row: number, col: number, color: PlayerColor) {
    let score = 0
    
    for (const [dx, dy] of this.directions) {
      let count = 1
      let blocked = 0

      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (!this.isValidPosition(newRow, newCol)) {
          blocked++
          break
        }
        if (board[newRow][newCol] !== color) break
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
        if (board[newRow][newCol] !== color) break
        count++
      }

      score += this.getScoreForCount(count, blocked)
    }

    return score
  }

  private getScoreForCount(count: number, blocked: number) {
    const scores = {
      5: 100000,    // 五连
      4: blocked === 0 ? 10000 : 1000,  // 活四/冲四
      3: blocked === 0 ? 1000 : 100,    // 活三/眠三
      2: blocked === 0 ? 100 : 10,      // 活二/眠二
      1: 1
    }
    return scores[count as keyof typeof scores] || 0
  }

  private isValidPosition(row: number, col: number) {
    return row >= 0 && row < 15 && col >= 0 && col < 15
  }

  private findWinningMove(board: Board, color: PlayerColor) {
    const emptySpots = this.getEmptySpots(board)
    
    for (const spot of emptySpots) {
      board[spot.row][spot.col] = color
      if (this.checkWin(board, spot.row, spot.col, color)) {
        board[spot.row][spot.col] = null
        return spot
      }
      board[spot.row][spot.col] = null
    }
    return null
  }

  private findBestValueMove(board: Board) {
    const emptySpots = this.getEmptySpots(board)
    let bestScore = -Infinity
    let bestMove = null

    for (const spot of emptySpots) {
      const score = this.evaluatePosition(board, spot.row, spot.col, 'white')
      if (score > bestScore) {
        bestScore = score
        bestMove = spot
      }
    }
    return bestMove
  }

  private checkWin(board: Board, row: number, col: number, color: PlayerColor) {
    for (const [dx, dy] of this.directions) {
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

  private minimax(board: Board, depth: number, isMaximizing: boolean): number {
    if (depth === 0) return this.evaluateBoard(board)

    const emptySpots = this.getEmptySpots(board)
    
    if (isMaximizing) {
      let maxScore = -Infinity
      for (const spot of emptySpots) {
        board[spot.row][spot.col] = 'white'
        maxScore = Math.max(maxScore, this.minimax(board, depth - 1, false))
        board[spot.row][spot.col] = null
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const spot of emptySpots) {
        board[spot.row][spot.col] = 'black'
        minScore = Math.min(minScore, this.minimax(board, depth - 1, true))
        board[spot.row][spot.col] = null
      }
      return minScore
    }
  }

  private evaluateBoard(board: Board): number {
    let score = 0
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        const cell = board[i][j]
        if (cell) {
          score += this.evaluatePosition(board, i, j, cell) * (cell === 'white' ? 1 : -1)
        }
      }
    }
    return score
  }
}

export { AI }