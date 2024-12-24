export default class AI {
  constructor() {
    this.directions = [
      [1, 0],   // 水平
      [0, 1],   // 垂直
      [1, 1],   // 右下斜
      [1, -1]   // 左下斜
    ]
    
    // 不同棋型的评分
    this.patterns = {
      'FIVE': 100000,        // 连五
      'OPEN_FOUR': 50000,    // 活四
      'DOUBLE_THREE': 10000, // 双活三
      'BLOCKED_FOUR': 5000,  // 冲四
      'OPEN_THREE': 3000,    // 活三
      'BLOCKED_THREE': 500,  // 眠三
      'OPEN_TWO': 400,       // 活二
      'BLOCKED_TWO': 100,    // 眠二
      'SINGLE': 10           // 单子
    }
  }

  async getMove(board, difficulty) {
    // 添加随机延迟，模拟思考
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500))
    
    switch (difficulty) {
      case 'easy':
        return this.getRandomMove(board)
      case 'medium':
        return this.getBasicStrategyMove(board)
      case 'hard':
        return this.getAdvancedStrategyMove(board)
      default:
        return this.getRandomMove(board)
    }
  }

  getRandomMove(board) {
    const emptyPositions = []
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (!board[i][j]) {
          emptyPositions.push({ row: i, col: j })
        }
      }
    }
    return emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
  }

  getBasicStrategyMove(board) {
    let bestScore = -Infinity
    let bestMove = null

    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (!board[i][j]) {
          const score = this.evaluatePosition(board, i, j)
          if (score > bestScore) {
            bestScore = score
            bestMove = { row: i, col: j }
          }
        }
      }
    }

    return bestMove || this.getRandomMove(board)
  }

  getAdvancedStrategyMove(board) {
    let bestScore = -Infinity
    let bestMove = null
    const moves = this.generateMoves(board)
    
    for (const move of moves) {
      const { row, col } = move
      board[row][col] = 'white'
      const score = this.minimax(board, 3, -Infinity, Infinity, false)
      board[row][col] = null
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return bestMove
  }

  minimax(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard(board)
    }

    const moves = this.generateMoves(board)
    
    if (isMaximizing) {
      let maxScore = -Infinity
      for (const move of moves) {
        const { row, col } = move
        board[row][col] = 'white'
        const score = this.minimax(board, depth - 1, alpha, beta, false)
        board[row][col] = null
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const move of moves) {
        const { row, col } = move
        board[row][col] = 'black'
        const score = this.minimax(board, depth - 1, alpha, beta, true)
        board[row][col] = null
        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)
        if (beta <= alpha) break
      }
      return minScore
    }
  }

  generateMoves(board) {
    const moves = []
    const visited = new Set()
    
    // 找出所有已有棋子周围的空位
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j]) {
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const newRow = i + di
              const newCol = j + dj
              const key = `${newRow},${newCol}`
              
              if (this.isValidPosition(newRow, newCol) && 
                  !board[newRow][newCol] && 
                  !visited.has(key)) {
                moves.push({ row: newRow, col: newCol })
                visited.add(key)
              }
            }
          }
        }
      }
    }
    
    return moves.length > 0 ? moves : [{ row: 7, col: 7 }]
  }

  evaluateBoard(board) {
    let score = 0
    
    // 评估每个位置
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j]) {
          const isAI = board[i][j] === 'white'
          const positionScore = this.evaluatePosition(board, i, j)
          score += isAI ? positionScore : -positionScore
        }
      }
    }
    
    return score
  }

  evaluatePosition(board, row, col) {
    let score = 0
    const color = board[row][col]
    
    // 检查每个方向
    this.directions.forEach(([dx, dy]) => {
      const pattern = this.getPattern(board, row, col, dx, dy, color)
      score += this.getPatternScore(pattern)
    })
    
    return score
  }

  getPattern(board, row, col, dx, dy, color) {
    let pattern = ''
    
    // 检查正向
    for (let i = -4; i <= 4; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      
      if (!this.isValidPosition(newRow, newCol)) {
        pattern += 'X'
      } else if (!board[newRow][newCol]) {
        pattern += '_'
      } else if (board[newRow][newCol] === color) {
        pattern += 'O'
      } else {
        pattern += 'X'
      }
    }
    
    return pattern
  }

  getPatternScore(pattern) {
    if (pattern.includes('OOOOO')) return this.patterns.FIVE
    if (pattern.includes('_OOOO_')) return this.patterns.OPEN_FOUR
    if (pattern.includes('_OOO_')) return this.patterns.OPEN_THREE
    if (pattern.includes('XOOOO_') || pattern.includes('_OOOOX')) return this.patterns.BLOCKED_FOUR
    if (pattern.includes('XOO_OX') || pattern.includes('XO_OOX')) return this.patterns.BLOCKED_THREE
    if (pattern.includes('_OO_')) return this.patterns.OPEN_TWO
    if (pattern.includes('XOO_') || pattern.includes('_OOX')) return this.patterns.BLOCKED_TWO
    return this.patterns.SINGLE
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 15 && col >= 0 && col < 15
  }
} 