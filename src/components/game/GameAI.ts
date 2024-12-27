import type { Board, PlayerColor } from '../../types'

export class AI {
  private readonly directions = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 主对角线
    [1, -1]   // 副对角线
  ]

  getNextMove(board: (string | null)[][]): [number, number] {
    // 创建棋盘副本以避免修改原始数据
    const boardCopy = board.map(row => [...row])
    const size = boardCopy.length
    
    // 防守：检查玩家是否有威胁位置
    const blockingMove = this.findWinningMove(boardCopy, 'black')
    if (blockingMove) return blockingMove

    // 进攻：检查AI是否有制胜位置
    const winningMove = this.findWinningMove(boardCopy, 'white')
    if (winningMove) return winningMove

    // 如果没有特殊情况，选择最优位置
    return this.findBestMove(boardCopy)
  }

  private findWinningMove(board: (string | null)[][], player: string): [number, number] | null {
    const positions = this.getEmptyPositions(board)
    
    for (const [x, y] of positions) {
      // 创建棋盘副本进行模拟
      const boardCopy = board.map(row => [...row])
      
      // 模拟落子
      boardCopy[x][y] = player
      
      // 评估此位置
      const score = this.evaluatePosition(boardCopy, x, y, player)
      
      // 如果找到制胜位置
      if (score >= 100000) {
        return [x, y]
      }
    }
    
    return null
  }

  private findBestMove(board: (string | null)[][]): [number, number] {
    const positions = this.getEmptyPositions(board)
    const size = board.length
    let bestScore = -Infinity
    let bestMove: [number, number] = [Math.floor(size / 2), Math.floor(size / 2)] // 默认中心位置
    
    for (const [x, y] of positions) {
      // 创建棋盘副本进行模拟
      const boardCopy = board.map(row => [...row])
      
      // 模拟落子
      boardCopy[x][y] = 'white'
      
      // 评估此位置
      const score = this.evaluatePosition(boardCopy, x, y, 'white')
      
      // 更新最佳位置
      if (score > bestScore) {
        bestScore = score
        bestMove = [x, y]
      }
    }
    
    return bestMove
  }

  private evaluatePosition(board: (string | null)[][], x: number, y: number, player: string): number {
    const size = board.length
    let totalScore = 0
    
    this.directions.forEach(([dx, dy]) => {
      let count = 1
      let space = 0
      let blocked = 0
      
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newX = x + dx * i
        const newY = y + dy * i
        
        if (newX < 0 || newX >= size || newY < 0 || newY >= size) {
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
        
        if (newX < 0 || newX >= size || newY < 0 || newY >= size) {
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
      
      // 计算得分
      totalScore += this.getScoreForPattern(count, space, blocked)
    })
    
    // 添加位置权重
    totalScore += this.getPositionScore(x, y, size)
    
    return totalScore
  }

  private getScoreForPattern(count: number, space: number, blocked: number): number {
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

  private getPositionScore(x: number, y: number, size: number): number {
    const centerX = Math.floor(size / 2)
    const centerY = Math.floor(size / 2)
    const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY)
    return Math.max(0, 50 - distanceFromCenter * 5)
  }

  private getEmptyPositions(board: (string | null)[][]): [number, number][] {
    const size = board.length
    const positions: [number, number][] = []
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (board[x][y] === null) {
          // 检查周围8个方向是否有棋子
          let hasNeighbor = false
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue
              
              const newX = x + dx
              const newY = y + dy
              
              if (newX >= 0 && newX < size && newY >= 0 && newY < size && board[newX][newY] !== null) {
                hasNeighbor = true
                break
              }
            }
            if (hasNeighbor) break
          }
          
          // 只添加周围有棋子的空位
          if (hasNeighbor || board.every(row => row.every(cell => cell === null))) {
            positions.push([x, y])
          }
        }
      }
    }
    
    // 如果没有找到任何位置（开局），返回中心点
    if (positions.length === 0) {
      const center = Math.floor(size / 2)
      positions.push([center, center])
    }
    
    return positions
  }
} 