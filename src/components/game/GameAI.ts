import type { Board, PlayerColor } from '../../types'

export class AI {
  private readonly BOARD_SIZE = 15
  private readonly WINNING_LENGTH = 5

  // 评估棋盘位置的分数
  private evaluatePosition(
    board: Board,
    row: number,
    col: number,
    player: PlayerColor
  ): number {
    const directions = [
      [1, 0],   // 水平
      [0, 1],   // 垂直
      [1, 1],   // 右下斜
      [1, -1]   // 右上斜
    ]
    
    let totalScore = 0
    
    directions.forEach(([dx, dy]) => {
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
        
        if (board[newRow][newCol] === null) {
          space++
          break
        }
        
        if (board[newRow][newCol] !== player) {
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
        
        if (board[newRow][newCol] === null) {
          space++
          break
        }
        
        if (board[newRow][newCol] !== player) {
          blocked++
          break
        }
        
        count++
      }
      
      // 评分规则
      if (count >= 5) totalScore += 100000
      else if (count === 4) {
        if (blocked === 0) totalScore += 10000
        else if (blocked === 1) totalScore += 1000
      }
      else if (count === 3) {
        if (blocked === 0) totalScore += 1000
        else if (blocked === 1) totalScore += 100
      }
      else if (count === 2) {
        if (blocked === 0) totalScore += 100
        else if (blocked === 1) totalScore += 10
      }
      
      // 考虑空位的影响
      if (space > 0) totalScore *= (1 + space * 0.1)
    })
    
    return totalScore
  }

  // 获取最佳落子位置
  getBestMove(board: Board, difficulty: 'easy' | 'medium' | 'hard'): [number, number] {
    // 根据难度调整搜索深度
    const depthMap = {
      easy: 1,
      medium: 2,
      hard: 3
    }
    
    const depth = depthMap[difficulty]
    const [row, col] = this.minimax(board, depth, true)
    return [row, col]
  }

  // Minimax 算法实现
  private minimax(
    board: Board,
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
  ): [number, number, number] {
    if (depth === 0) {
      return [-1, -1, this.evaluateBoard(board)]
    }
    
    const moves = this.getValidMoves(board)
    if (moves.length === 0) {
      return [-1, -1, 0]
    }
    
    let bestRow = moves[0][0]
    let bestCol = moves[0][1]
    let bestScore = isMaximizing ? -Infinity : Infinity
    
    for (const [row, col] of moves) {
      board[row][col] = isMaximizing ? 'white' : 'black'
      const score = this.minimax(board, depth - 1, !isMaximizing, alpha, beta)[2]
      board[row][col] = null
      
      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score
          bestRow = row
          bestCol = col
        }
        alpha = Math.max(alpha, bestScore)
      } else {
        if (score < bestScore) {
          bestScore = score
          bestRow = row
          bestCol = col
        }
        beta = Math.min(beta, bestScore)
      }
      
      if (beta <= alpha) {
        break
      }
    }
    
    return [bestRow, bestCol, bestScore]
  }

  // 获取所有可能的落子位置
  private getValidMoves(board: Board): [number, number][] {
    const moves: [number, number][] = []
    
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        if (!board[i][j]) {
          moves.push([i, j])
        }
      }
    }
    
    return moves
  }

  // 评估整个棋盘的分数
  private evaluateBoard(board: Board): number {
    let score = 0
    
    // 评估每个位置
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        if (board[i][j] === 'white') {
          score += this.evaluatePosition(board, i, j, 'white')
        } else if (board[i][j] === 'black') {
          score -= this.evaluatePosition(board, i, j, 'black')
        }
      }
    }
    
    return score
  }

  // 检查位置是否有效
  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE
  }

  // 添加公共方法用于获取AI的下一步走法
  public getNextMove(board: Board): [number, number] {
    const [row, col] = this.findBestMove(board, 'white')
    return [row, col]
  }
  
  // 添加难度等级设置
  private difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  
  public setDifficulty(level: 'easy' | 'medium' | 'hard') {
    this.difficulty = level
  }

  private findBestMove(board: Board, player: PlayerColor): [number, number] {
    // 简单AI策略: 评估每个可能的位置
    let bestScore = -Infinity
    let bestMove: [number, number] = [0, 0]

    for (let i = 0; i < this.BOARD_SIZE; i++) {
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        if (!board[i][j]) {
          board[i][j] = player
          const score = this.evaluatePosition(board, i, j, player)
          board[i][j] = null

          if (score > bestScore) {
            bestScore = score
            bestMove = [i, j]
          }
        }
      }
    }

    return bestMove
  }

  private getLineScore(board: Board, row: number, col: number, dx: number, dy: number, player: PlayerColor): number {
    let count = 1
    let blocked = 0

    // 向一个方向计数
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      if (board[newRow][newCol] !== player) break
      count++
    }

    // 向相反方向计数
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (!this.isValidPosition(newRow, newCol)) {
        blocked++
        break
      }
      if (board[newRow][newCol] !== player) break
      count++
    }

    // 根据连子数和是否被封堵返回分数
    if (count >= 5) return 100000
    if (count === 4 && blocked === 0) return 10000
    if (count === 3 && blocked === 0) return 1000
    if (count === 2 && blocked === 0) return 100
    return count * 10
  }
} 