export class AI {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty
  }

  getMove(board) {
    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(board)
      case 'medium':
        return this.getMediumMove(board)
      case 'hard':
        return this.getHardMove(board)
      default:
        return this.getMediumMove(board)
    }
  }

  // 简单模式：随机落子
  getRandomMove(board) {
    const emptySpots = this.getEmptySpots(board)
    if (emptySpots.length === 0) return null
    return emptySpots[Math.floor(Math.random() * emptySpots.length)]
  }

  // 中等模式：优先选择有威胁的位置
  getMediumMove(board) {
    const emptySpots = this.getEmptySpots(board)
    if (emptySpots.length === 0) return null

    // 1. 检查是否可以直接获胜
    for (const spot of emptySpots) {
      if (this.checkWinningMove(board, spot.row, spot.col, 'white')) {
        return spot
      }
    }

    // 2. 阻止对手获胜
    for (const spot of emptySpots) {
      if (this.checkWinningMove(board, spot.row, spot.col, 'black')) {
        return spot
      }
    }

    // 3. 选择最有价值的位置
    let bestSpot = null
    let bestScore = -Infinity

    for (const spot of emptySpots) {
      const score = this.evaluatePosition(board, spot.row, spot.col)
      if (score > bestScore) {
        bestScore = score
        bestSpot = spot
      }
    }

    return bestSpot || this.getRandomMove(board)
  }

  // 困难模式：使用极大极小算法
  getHardMove(board) {
    const emptySpots = this.getEmptySpots(board)
    if (emptySpots.length === 0) return null

    let bestMove = null
    let bestScore = -Infinity

    for (const spot of emptySpots) {
      board[spot.row][spot.col] = 'white'
      const score = this.minimax(board, 3, false)
      board[spot.row][spot.col] = null

      if (score > bestScore) {
        bestScore = score
        bestMove = spot
      }
    }

    return bestMove || this.getMediumMove(board)
  }

  // 辅助方法
  getEmptySpots(board) {
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

  checkWinningMove(board, row, col, player) {
    board[row][col] = player
    const isWinning = this.checkWin(board, row, col)
    board[row][col] = null
    return isWinning
  }

  checkWin(board, row, col) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]
    const player = board[row][col]

    return directions.some(([dx, dy]) => {
      let count = 1
      let r = row, c = col

      // 正向检查
      while (count < 5) {
        r += dx
        c += dy
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break
        if (board[r][c] !== player) break
        count++
      }

      // 反向检查
      r = row
      c = col
      while (count < 5) {
        r -= dx
        c -= dy
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break
        if (board[r][c] !== player) break
        count++
      }

      return count >= 5
    })
  }

  evaluatePosition(board, row, col) {
    let score = 0
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]

    for (const [dx, dy] of directions) {
      score += this.evaluateDirection(board, row, col, dx, dy)
    }

    return score
  }

  evaluateDirection(board, row, col, dx, dy) {
    const sequences = {
      white: 0,
      black: 0,
      empty: 0
    }

    // 检查两个方向
    for (let dir = -1; dir <= 1; dir += 2) {
      let r = row, c = col
      for (let i = 0; i < 4; i++) {
        r += dx * dir
        c += dy * dir
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break
        const cell = board[r][c]
        if (cell === null) sequences.empty++
        else if (cell === 'white') sequences.white++
        else sequences.black++
      }
    }

    // 评分规则
    if (sequences.white === 4) return 10000  // 即将获胜
    if (sequences.black === 4) return 5000   // 阻止对手获胜
    if (sequences.white === 3 && sequences.empty >= 2) return 1000
    if (sequences.black === 3 && sequences.empty >= 2) return 500
    if (sequences.white === 2 && sequences.empty >= 3) return 100
    if (sequences.black === 2 && sequences.empty >= 3) return 50

    return sequences.white - sequences.black
  }

  minimax(board, depth, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard(board)
    }

    const emptySpots = this.getEmptySpots(board)
    if (emptySpots.length === 0) return 0

    if (isMaximizing) {
      let maxScore = -Infinity
      for (const spot of emptySpots) {
        board[spot.row][spot.col] = 'white'
        const score = this.minimax(board, depth - 1, false)
        board[spot.row][spot.col] = null
        maxScore = Math.max(maxScore, score)
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const spot of emptySpots) {
        board[spot.row][spot.col] = 'black'
        const score = this.minimax(board, depth - 1, true)
        board[spot.row][spot.col] = null
        minScore = Math.min(minScore, score)
      }
      return minScore
    }
  }

  evaluateBoard(board) {
    let score = 0
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j]) {
          score += this.evaluatePosition(board, i, j) * (board[i][j] === 'white' ? 1 : -1)
        }
      }
    }
    return score
  }
} 