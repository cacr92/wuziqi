import type { Board } from '../types'

export class AI {
  private evaluatePosition(board: Board, row: number, col: number, player: 'black' | 'white'): number {
    const directions = [
      [1, 0],   // 水平
      [0, 1],   // 垂直
      [1, 1],   // 右下斜
      [1, -1]   // 右上斜
    ]
    
    let score = 0
    
    directions.forEach(([dx, dy]) => {
      let count = 1
      let blocked = 0
      
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
          blocked++
          break
        }
        if (board[newRow][newCol] !== player) break
        count++
      }
      
      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
          blocked++
          break
        }
        if (board[newRow][newCol] !== player) break
        count++
      }
      
      // 评分
      if (count >= 5) score += 100000
      else if (count === 4 && blocked === 0) score += 10000
      else if (count === 4 && blocked === 1) score += 1000
      else if (count === 3 && blocked === 0) score += 1000
      else if (count === 3 && blocked === 1) score += 100
      else if (count === 2 && blocked === 0) score += 100
      else if (count === 2 && blocked === 1) score += 10
    })
    
    return score
  }

  getBestMove(board: Board): [number, number] {
    let bestScore = -Infinity
    let bestMove: [number, number] = [7, 7]
    
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (!board[i][j]) {
          board[i][j] = 'white'
          const score = this.evaluatePosition(board, i, j, 'white')
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
}