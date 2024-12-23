export class AI {
  constructor() {
    this.difficulty = 'medium'
    // 调整评分权重
    this.weights = {
      win5: 1000000,   // 连五
      live4: 50000,    // 活四
      dead4: 10000,    // 死四
      live3: 8000,     // 活三
      dead3: 1000,     // 死三
      live2: 500,      // 活二
      dead2: 50,       // 死二
      attack: 1.5,     // 进攻系数
      defense: 1.0     // 防守系数
    }
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty
  }

  findBestMove(board) {
    switch (this.difficulty) {
      case 'easy':
        return this.findRandomMove(board)
      case 'medium':
        return this.findSmartMove(board)
      case 'hard':
        return this.findBestMoveMinMax(board)
      default:
        return this.findRandomMove(board)
    }
  }

  findRandomMove(board) {
    const emptySpots = []
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (!board[i][j]) {
          emptySpots.push([i, j])
        }
      }
    }
    if (emptySpots.length === 0) return [null, null]
    const randomIndex = Math.floor(Math.random() * emptySpots.length)
    return emptySpots[randomIndex]
  }

  findSmartMove(board) {
    // 先检查是否可以直接获胜
    const winMove = this.findLineOfN(board, 'white', 4)
    if (winMove) return winMove

    // 检查是否需要防守
    const defenseMove = this.findLineOfN(board, 'black', 4)
    if (defenseMove) return defenseMove

    // 检查是否有活三机会
    const attackMove = this.findLiveThree(board, 'white')
    if (attackMove) return attackMove

    // 检查对手是否有活三需要防守
    const defendThree = this.findLiveThree(board, 'black')
    if (defendThree) return defendThree

    // 寻找最佳进攻位置
    let bestScore = -Infinity
    let bestMove = null
    const candidates = this.findSimpleCandidates(board)

    candidates.forEach(([row, col]) => {
      if (!board[row][col]) {
        const score = this.evaluateSimplePosition(board, row, col)
        if (score > bestScore) {
          bestScore = score
          bestMove = [row, col]
        }
      }
    })

    return bestMove || this.findRandomMove(board)
  }

  findSimpleCandidates(board) {
    const candidates = []
    // 只检查已有棋子周围一格的位置
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j]) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const newRow = i + dx
              const newCol = j + dy
              if (
                newRow >= 0 && newRow < 15 &&
                newCol >= 0 && newCol < 15 &&
                !board[newRow][newCol]
              ) {
                candidates.push([newRow, newCol])
              }
            }
          }
        }
      }
    }
    return [...new Set(candidates.map(pos => pos.join(',')))]
      .map(pos => pos.split(',').map(Number))
  }

  evaluateSimplePosition(board, row, col) {
    let score = 0
    const directions = [[1,0], [0,1], [1,1], [1,-1]]
    
    // 检查进攻价值
    board[row][col] = 'white'
    directions.forEach(([dx, dy]) => {
      score += this.evaluateSimpleDirection(board, row, col, dx, dy, 'white') * 1.2 // 增加进攻权重
    })
    
    // 检查防守价值
    board[row][col] = 'black'
    directions.forEach(([dx, dy]) => {
      score += this.evaluateSimpleDirection(board, row, col, dx, dy, 'black')
    })
    
    board[row][col] = null
    
    // 考虑位置价值
    const centerDist = Math.abs(row - 7) + Math.abs(col - 7)
    score += Math.max(0, 10 - centerDist)
    
    return score
  }

  evaluateSimpleDirection(board, row, col, dx, dy, color) {
    let count = 1
    let blocked = 0
    
    // 正向检查
    for (let i = 1; i < 4; i++) { // 只检查3格，比困难模式少
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      const cell = board[newRow][newCol]
      if (!cell) break
      if (cell !== color) {
        blocked++
        break
      }
      count++
    }
    
    // 反向检查
    for (let i = 1; i < 4; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      const cell = board[newRow][newCol]
      if (!cell) break
      if (cell !== color) {
        blocked++
        break
      }
      count++
    }

    // 简化的评分系统
    if (count >= 4) return 1000
    if (count === 3 && blocked === 0) return 100
    if (count === 3) return 50
    if (count === 2 && blocked === 0) return 10
    if (count === 2) return 5
    
    return 0
  }

  findLineOfN(board, color, n) {
    // 检查横向
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j <= 15 - n; j++) {
        let count = 0
        let empty = null
        for (let k = 0; k < n; k++) {
          if (board[i][j + k] === color) count++
          else if (!board[i][j + k]) empty = [i, j + k]
        }
        if (count === n - 1 && empty) return empty
      }
    }

    // 检查纵向
    for (let i = 0; i <= 15 - n; i++) {
      for (let j = 0; j < 15; j++) {
        let count = 0
        let empty = null
        for (let k = 0; k < n; k++) {
          if (board[i + k][j] === color) count++
          else if (!board[i + k][j]) empty = [i + k, j]
        }
        if (count === n - 1 && empty) return empty
      }
    }

    // 检查对角线
    for (let i = 0; i <= 15 - n; i++) {
      for (let j = 0; j <= 15 - n; j++) {
        let count = 0
        let empty = null
        for (let k = 0; k < n; k++) {
          if (board[i + k][j + k] === color) count++
          else if (!board[i + k][j + k]) empty = [i + k, j + k]
        }
        if (count === n - 1 && empty) return empty
      }
    }

    return null
  }

  findBestMoveMinMax(board) {
    // 先检查必胜位置
    const winMove = this.findWinningMove(board)
    if (winMove) return winMove

    // 检查必防位置
    const mustDefend = this.findMustDefendMove(board)
    if (mustDefend) return mustDefend

    // 使用评分系统找最佳位置
    let bestScore = -Infinity
    let bestMove = null
    let bestMoves = [] // 存储多个最佳位置

    // 只考虑有子周围的空位
    const candidates = this.findCandidateMoves(board)
    
    candidates.forEach(([row, col]) => {
      if (!board[row][col]) {
        board[row][col] = 'white'
        const attackScore = this.evaluatePosition(board, row, col, 'white') * this.weights.attack
        const defenseScore = this.evaluatePosition(board, row, col, 'black') * this.weights.defense
        const score = Math.max(attackScore, defenseScore)
        board[row][col] = null
        
        if (score > bestScore) {
          bestScore = score
          bestMoves = [[row, col]]
        } else if (score === bestScore) {
          bestMoves.push([row, col])
        }
      }
    })

    // 从最佳位置中随机选择一个，增加不确定性
    return bestMoves.length > 0 
      ? bestMoves[Math.floor(Math.random() * bestMoves.length)]
      : this.findRandomMove(board)
  }

  findCandidateMoves(board) {
    const candidates = new Set()
    const directions = [[1,0], [0,1], [1,1], [1,-1]]
    
    // 遍历棋盘找出所有已有棋子
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j]) {
          // 将周围2格内的空位都加入候选
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              const newRow = i + dx
              const newCol = j + dy
              if (
                newRow >= 0 && newRow < 15 &&
                newCol >= 0 && newCol < 15 &&
                !board[newRow][newCol]
              ) {
                candidates.add(`${newRow},${newCol}`)
              }
            }
          }
        }
      }
    }

    return Array.from(candidates).map(pos => pos.split(',').map(Number))
  }

  findWinningMove(board) {
    // 检查AI是否有连五机会
    return this.findLineOfN(board, 'white', 5) ||
           this.findLineOfN(board, 'white', 4)
  }

  findMustDefendMove(board) {
    // 检查玩家是否有连四或活三
    return this.findLineOfN(board, 'black', 4) ||
           this.findLiveThree(board, 'black')
  }

  evaluatePosition(board, row, col, color) {
    let score = 0
    const directions = [[1,0], [0,1], [1,1], [1,-1]]
    
    directions.forEach(([dx, dy]) => {
      score += this.evaluateDirection(board, row, col, dx, dy, color)
    })

    // 增加位置评估的策略性
    score += this.evaluatePositionBonus(row, col)
    score += this.evaluatePattern(board, row, col, color)
    
    return score
  }

  evaluateDirection(board, row, col, dx, dy, color) {
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
      if (!cell) {
        space++
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
      if (!cell) {
        space++
        break
      }
      if (cell !== color) {
        blocked++
        break
      }
      count++
    }

    // 根据不同情况返回分数
    if (count >= 5) return this.weights.win5
    if (count === 4) {
      return blocked === 0 ? this.weights.live4 : this.weights.dead4
    }
    if (count === 3) {
      return blocked === 0 ? this.weights.live3 : this.weights.dead3
    }
    if (count === 2) {
      return blocked === 0 ? this.weights.live2 : this.weights.dead2
    }
    
    return 0
  }

  evaluatePositionBonus(row, col) {
    let score = 0
    
    // 更激进的中心位置权重
    const centerDist = Math.abs(row - 7) + Math.abs(col - 7)
    score += Math.max(0, 15 - centerDist * 2)
    
    // 奖励靠近对手棋子的位置
    if (centerDist <= 2) score += 50
    if (centerDist <= 4) score += 30
    
    return score
  }

  evaluatePattern(board, row, col, color) {
    let score = 0
    const patterns = this.findPatterns(board, row, col, color)
    
    // 奖励连续威胁
    if (patterns.threats >= 2) {
      score += patterns.threats * 2000
    }
    
    // 奖励双活三
    if (patterns.liveThrees >= 2) {
      score += 15000
    }
    
    // 奖励活三+活二组合
    if (patterns.liveThrees >= 1 && patterns.liveTwos >= 1) {
      score += 5000
    }

    return score
  }

  findPatterns(board, row, col, color) {
    const patterns = {
      threats: 0,      // 威胁数量
      liveThrees: 0,   // 活三数量
      liveTwos: 0,     // 活二数量
    }
    
    const directions = [[1,0], [0,1], [1,1], [1,-1]]
    
    directions.forEach(([dx, dy]) => {
      const pattern = this.analyzeDirection(board, row, col, dx, dy, color)
      if (pattern.isLiveThree) patterns.liveThrees++
      if (pattern.isLiveTwo) patterns.liveTwos++
      if (pattern.isThreat) patterns.threats++
    })
    
    return patterns
  }

  analyzeDirection(board, row, col, dx, dy, color) {
    const pattern = {
      isLiveThree: false,
      isLiveTwo: false,
      isThreat: false
    }
    
    let consecutive = 1
    let spaces = 0
    let blocked = 0
    
    // 分析连续性和空位
    for (let i = 1; i <= 4; i++) {
      const [fwd] = this.checkPosition(board, row + dx * i, col + dy * i, color)
      const [bwd] = this.checkPosition(board, row - dx * i, col - dy * i, color)
      
      if (fwd === 'same') consecutive++
      else if (fwd === 'empty') spaces++
      else if (fwd === 'blocked') blocked++
      
      if (bwd === 'same') consecutive++
      else if (bwd === 'empty') spaces++
      else if (bwd === 'blocked') blocked++
    }
    
    // 判断模式
    if (consecutive >= 3 && blocked === 0) pattern.isLiveThree = true
    if (consecutive >= 2 && spaces >= 2 && blocked === 0) pattern.isLiveTwo = true
    if (consecutive >= 2 && spaces >= 1 && blocked <= 1) pattern.isThreat = true
    
    return pattern
  }

  checkPosition(board, row, col, color) {
    if (!this.isValidPosition(row, col)) return ['blocked']
    if (!board[row][col]) return ['empty']
    return [board[row][col] === color ? 'same' : 'blocked']
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 15 && col >= 0 && col < 15
  }

  findLiveThree(board, color) {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (!board[i][j]) {
          board[i][j] = color
          const score = this.evaluatePosition(board, i, j)
          board[i][j] = null
          if (score >= this.weights.live3) {
            return [i, j]
          }
        }
      }
    }
    return null
  }
} 