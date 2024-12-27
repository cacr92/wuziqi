import type { PlayerColor } from '@/types'
import type { Position } from '../ai/types'
import { GameEngine } from './GameEngine'

export class AIPlayer {
  private readonly engine: GameEngine
  
  constructor(boardSize: number = 14) {
    this.engine = new GameEngine(boardSize)
  }

  getNextMove(board: (PlayerColor | null)[][]): Position {
    // 创建棋盘副本以避免修改原始数据
    const boardCopy = this.engine.copyBoard(board)
    
    // 防守：检查玩家是否有威胁位置
    const blockingMove = this.findWinningMove(boardCopy, 'black')
    if (blockingMove) return blockingMove

    // 进攻：检查AI是否有制胜位置
    const winningMove = this.findWinningMove(boardCopy, 'white')
    if (winningMove) return winningMove

    // 如果没有特殊情况，选择最优位置
    return this.findBestMove(boardCopy)
  }

  private findWinningMove(board: (PlayerColor | null)[][], player: PlayerColor): Position | null {
    const positions = this.engine.getValidMoves(board)
    
    for (const pos of positions) {
      // 创建棋盘副本进行模拟
      const boardCopy = this.engine.copyBoard(board)
      
      // 模拟落子
      boardCopy[pos.x][pos.y] = player
      
      // 评估此位置
      if (this.engine.checkWin(boardCopy, pos.x, pos.y, player)) {
        return pos
      }
    }
    
    return null
  }

  private findBestMove(board: (PlayerColor | null)[][]): Position {
    const positions = this.engine.getValidMoves(board)
    let bestScore = -Infinity
    let bestMove = positions[0]
    
    for (const pos of positions) {
      // 创建棋盘副本进行模拟
      const boardCopy = this.engine.copyBoard(board)
      
      // 模拟落子
      boardCopy[pos.x][pos.y] = 'white'
      
      // 评估此位置
      const score = this.evaluateMove(boardCopy, pos)
      
      // 更新最佳位置
      if (score > bestScore) {
        bestScore = score
        bestMove = pos
      }
    }
    
    return bestMove
  }

  private evaluateMove(board: (PlayerColor | null)[][], pos: Position): number {
    let totalScore = 0
    
    // 评估AI的进攻分数
    const aiScore = this.engine.evaluatePosition(board, pos.x, pos.y, 'white')
    totalScore += this.getScoreForPattern(aiScore)
    
    // 评估阻止玩家的分数
    board[pos.x][pos.y] = 'black'
    const playerScore = this.engine.evaluatePosition(board, pos.x, pos.y, 'black')
    totalScore += this.getScoreForPattern(playerScore) * 0.8 // 防守权重略低
    board[pos.x][pos.y] = 'white'
    
    // 加入位置权重
    totalScore += this.getPositionScore(pos.x, pos.y)
    
    return totalScore
  }

  private getScoreForPattern({ count, space, blocked }: { count: number, space: number, blocked: number }): number {
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

  private getPositionScore(x: number, y: number): number {
    const center = Math.floor(this.engine.size / 2)
    const distanceFromCenter = Math.abs(x - center) + Math.abs(y - center)
    return Math.max(0, 50 - distanceFromCenter * 5)
  }
} 