import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import type { PlayerColor } from '../types'

const app = express()
app.use(cors())

// 健康检查端点
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// 存储房间信息
interface GameRoom {
  id: string
  players: {
    black?: string // socket id
    white?: string
  }
  board: (PlayerColor | null)[][]
  currentPlayer: PlayerColor
  gameStarted: boolean
  lastMove: { row: number; col: number } | null
  readyToRestart: {
    black: boolean
    white: boolean
  }
}

const rooms = new Map<string, GameRoom>()

// 初始化游戏状态函数
const initializeGameState = () => ({
  board: Array(15).fill(null).map(() => Array(15).fill(null)),
  currentPlayer: 'black' as PlayerColor,
  lastMove: null,
  gameStarted: true
})

// Socket.IO 事件处理
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // 创建房间
  socket.on('create_room', (data, callback) => {
    try {
      const roomId = uuidv4().substring(0, 6)
      const room: GameRoom = {
        id: roomId,
        players: {
          black: socket.id
        },
        board: Array(15).fill(null).map(() => Array(15).fill(null)),
        currentPlayer: 'black',
        gameStarted: false,
        lastMove: null,
        readyToRestart: { black: false, white: false }
      }

      rooms.set(roomId, room)
      socket.join(roomId)

      callback({ success: true, roomId })
    } catch (error) {
      console.error('Create room error:', error)
      callback({ success: false, error: '创建房间失败' })
    }
  })

  // 加入房间
  socket.on('join_room', ({ roomId }, callback) => {
    try {
      const room = rooms.get(roomId)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      if (room.players.black && room.players.white) {
        callback({ success: false, error: '房间已满' })
        return
      }

      room.players.white = socket.id
      socket.join(roomId)

      // 通知房间内的所有玩家
      io.to(roomId).emit('player_joined', {
        players: room.players,
        board: room.board,
        currentPlayer: room.currentPlayer
      })

      room.gameStarted = true
      callback({ success: true })
    } catch (error) {
      console.error('Join room error:', error)
      callback({ success: false, error: '加入房间失败' })
    }
  })

  // 修改游戏结束时的处理
  const handleGameOver = (room: GameRoom, winner: PlayerColor | null, reason: string) => {
    console.log('游戏结束:', { roomId: room.id, winner, reason })
    
    // 设置游戏状态为结束
    room.gameStarted = false

    // 发送游戏结束事件
    io.to(room.id).emit('game_over', {
      winner,
      reason,
      board: room.board,
      countdown: 3
    })

    // 3秒后自动开始新游戏
    setTimeout(() => {
      // 检查房间是否还存在
      const currentRoom = rooms.get(room.id)
      if (!currentRoom) {
        console.log('房间不存在，无法重新开始:', room.id)
        return
      }

      // 检查是否有足够的玩家
      if (!currentRoom.players.black || !currentRoom.players.white) {
        console.log('玩家不足，无法重新开始:', room.id)
        return
      }

      console.log('开始新一局游戏:', room.id)

      // 重置游戏状态
      currentRoom.board = Array(15).fill(null).map(() => Array(15).fill(null))
      currentRoom.currentPlayer = 'black'
      currentRoom.lastMove = null
      currentRoom.gameStarted = true

      // 发送游戏重新开始事件
      io.to(currentRoom.id).emit('game_restarted', {
        board: currentRoom.board,
        currentPlayer: currentRoom.currentPlayer,
        gameStarted: true,
        lastMove: currentRoom.lastMove,
        players: currentRoom.players,
        timers: { black: 300, white: 300 }
      })

      // 短暂延迟后发送游戏开始事件
      setTimeout(() => {
        if (currentRoom.gameStarted) {
          io.to(currentRoom.id).emit('game_started', {
            board: currentRoom.board,
            currentPlayer: currentRoom.currentPlayer,
            timers: { black: 300, white: 300 },
            players: currentRoom.players,
            gameStarted: true,
            lastMove: null
          })
          console.log('新一局游戏已开始:', room.id)
        }
      }, 100)
    }, 3000)
  }

  // 修改落子事件处理
  socket.on('make_move', ({ row, col }, callback) => {
    try {
      const room = findRoomByPlayerId(socket.id)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      if (!room.gameStarted) {
        callback({ success: false, error: '游戏尚未开始' })
        return
      }

      const playerColor = room.players.black === socket.id ? 'black' : 'white'
      if (room.currentPlayer !== playerColor) {
        callback({ success: false, error: '现在不是你的回合' })
        return
      }

      if (room.board[row][col] !== null) {
        callback({ success: false, error: '该位置已有棋子' })
        return
      }

      // 更新棋盘
      room.board[row][col] = playerColor
      room.lastMove = { row, col }
      room.currentPlayer = playerColor === 'black' ? 'white' : 'black'

      // 广播移动信息
      io.to(room.id).emit('opponent_move', {
        row,
        col,
        color: playerColor,
        nextPlayer: room.currentPlayer,
        board: room.board,
        lastMove: room.lastMove,
        timers: { black: 300, white: 300 }
      })

      // 检查是否获胜
      if (checkWin(room.board, row, col, playerColor)) {
        room.gameStarted = false
        handleGameOver(room, playerColor, 'win')
      }

      callback({ success: true })
    } catch (error) {
      console.error('Make move error:', error)
      callback({ success: false, error: '落子失败' })
    }
  })

  // 修改认输事件处理
  socket.on('surrender', (callback) => {
    try {
      const room = findRoomByPlayerId(socket.id)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      const playerColor = room.players.black === socket.id ? 'black' : 'white'
      const winner = playerColor === 'black' ? 'white' : 'black'

      room.gameStarted = false
      handleGameOver(room, winner, 'surrender')

      callback({ success: true })
    } catch (error) {
      console.error('Surrender error:', error)
      callback({ success: false, error: '操作失败' })
    }
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.black === socket.id || room.players.white === socket.id) {
        const winner = room.players.black === socket.id ? 'white' : 'black'
        
        // 只有在游戏进行中时才发送游戏结束事件
        if (room.gameStarted) {
          handleGameOver(room, winner, 'opponent_left')
        }
        
        // 更新玩家状态
        if (room.players.black === socket.id) {
          room.players.black = undefined
        } else {
          room.players.white = undefined
        }
        
        // 只有当房间内没有玩家时才删除房间
        const remainingPlayers = io.sockets.adapter.rooms.get(roomId)
        if (!remainingPlayers || remainingPlayers.size === 0) {
          console.log('删除空房间:', roomId)
          rooms.delete(roomId)
        }
        break
      }
    }
  })
})

// 检查是否获胜
function checkWin(board: (PlayerColor | null)[][], row: number, col: number, color: PlayerColor): boolean {
  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1]   // 右上斜
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + i * dx
      const newCol = col + i * dy
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        board[newRow][newCol] !== color
      ) {
        break
      }
      count++
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - i * dx
      const newCol = col - i * dy
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        board[newRow][newCol] !== color
      ) {
        break
      }
      count++
    }

    if (count >= 5) {
      return true
    }
  }

  return false
}

// 辅助函数：通过玩家ID查找房间
const findRoomByPlayerId = (playerId: string): GameRoom | undefined => {
  for (const [_, room] of rooms) {
    if (room.players.black === playerId || room.players.white === playerId) {
      return room
    }
  }
  return undefined
}

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ status: 'error', message: 'Internal server error' })
})

// 启动服务器
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// 错误处理
httpServer.on('error', (error) => {
  console.error('Server error:', error)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}) 