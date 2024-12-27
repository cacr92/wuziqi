import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import type { PlayerColor } from '@/types'

// 游戏房间接口
interface GameRoom {
  id: string
  players: {
    black?: string // socket id
    white?: string
  }
  board: (PlayerColor | null)[][]
  currentPlayer: PlayerColor
  gameStarted: boolean
  gameOver: boolean
  winner: PlayerColor | null
  lastMove: { row: number; col: number } | null
  moveHistory: Array<{ row: number; col: number; color: PlayerColor }>
  timers: {
    black: number
    white: number
  }
  timerInterval: NodeJS.Timeout | null
}

// 游戏房间管理
const rooms = new Map<string, GameRoom>()

// 初始化Socket.IO服务器
export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // 监听连接
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // 处理重连请求
    socket.on('reconnect_game', (data: { 
      roomId: string, 
      isHost: boolean,
      socketId: string,
      playerColor?: PlayerColor 
    }, callback: (response: {
      success: boolean,
      error?: string,
      gameState?: any,
      players?: { black: string, white: string }
    }) => void) => {
      console.log('收到重连请求:', data)
      
      const room = rooms.get(data.roomId)
      if (!room) {
        console.log('房间不存在:', data.roomId)
        return callback({ success: false, error: '房间不存在' })
      }

      // 验证玩家身份
      const isBlackPlayer = room.players.black === data.socketId || (data.isHost && data.playerColor === 'black')
      const isWhitePlayer = room.players.white === data.socketId || (!data.isHost && data.playerColor === 'white')

      if (!isBlackPlayer && !isWhitePlayer) {
        console.log('玩家身份验证失败')
        return callback({ success: false, error: '无效的玩家身份' })
      }

      // 更新socket ID
      if (isBlackPlayer) {
        room.players.black = socket.id
        socket.data.playerColor = 'black'
      } else {
        room.players.white = socket.id
        socket.data.playerColor = 'white'
      }

      // 加入房间
      socket.join(data.roomId)
      socket.data.roomId = data.roomId

      // 通知其他玩家
      socket.to(data.roomId).emit('opponent_reconnected', {
        playerId: socket.id,
        isBlack: isBlackPlayer
      })

      // 返回游戏状态
      callback({
        success: true,
        gameState: {
          board: room.board,
          currentPlayer: room.currentPlayer,
          gameStarted: room.gameStarted,
          lastMove: room.lastMove,
          timers: room.timers
        },
        players: room.players
      })

      console.log('重连成功，房间状态:', {
        roomId: data.roomId,
        players: room.players,
        currentPlayer: room.currentPlayer,
        gameStarted: room.gameStarted
      })
    })

    // 处理创建房间请求
    socket.on('create_room', (data: { 
      roomId?: string,
      gameTime: number, 
      firstMove: PlayerColor 
    }, callback: (response: { 
      success: boolean, 
      roomId?: string, 
      error?: string 
    }) => void) => {
      try {
        // 如果指定了房间号，检查是否存在
        if (data.roomId) {
          if (rooms.has(data.roomId)) {
            return callback({ success: false, error: '房间已存在' })
          }
          roomId = data.roomId
        } else {
          // 生成新的房间号
          do {
            roomId = generateRoomId()
          } while (rooms.has(roomId))
        }

        // 创建新房间
        const room: GameRoom = {
          id: roomId,
          board: Array(15).fill(null).map(() => Array(15).fill(null)),
          players: {
            black: socket.id,
            white: null
          },
          currentPlayer: data.firstMove,
          gameStarted: false,
          lastMove: null,
          timers: {
            black: data.gameTime,
            white: data.gameTime
          },
          timerInterval: null,
          moves: []
        }

        // 保存房间信息
        rooms.set(roomId, room)
        socket.data.roomId = roomId
        socket.data.playerColor = 'black'
        socket.join(roomId)

        console.log('房间创建成功:', {
          roomId,
          creator: socket.id,
          gameTime: data.gameTime
        })

        // 返回成功响应
        callback({
          success: true,
          roomId
        })

        // 发送房间创建成功事件
        socket.emit('room_created', {
          roomId,
          playerColor: 'black',
          board: room.board,
          currentPlayer: room.currentPlayer,
          gameState: {
            board: room.board,
            currentPlayer: room.currentPlayer,
            gameStarted: room.gameStarted,
            lastMove: room.lastMove,
            timers: room.timers,
            players: room.players
          }
        })
      } catch (error) {
        console.error('创建房间错误:', error)
        callback({ success: false, error: '创建房间失败' })
      }
    })

    // 加入房间
    socket.on('join_room', async (data: { roomId: string }, callback) => {
      try {
        console.log('收到加入房间请求:', data)
        const room = rooms.get(data.roomId)

        if (!room) {
          console.log('房间不存在:', data.roomId)
          callback({ success: false, error: '房间不存在' })
          return
        }

        console.log('当前房间状态:', {
          id: room.id,
          players: room.players,
          gameStarted: room.gameStarted
        })

        // 检查玩家是否已经在房间中
        const existingPlayerColor = room.players.black === socket.id ? 'black' : 
                                  room.players.white === socket.id ? 'white' : null
        
        if (existingPlayerColor) {
          console.log('玩家已在房间中，颜色:', existingPlayerColor)
          callback({ 
            success: true,
            playerColor: existingPlayerColor,
            gameStarted: room.gameStarted
          })
          return
        }

        // 检查房间是否已满
        const isFull = room.players.black && room.players.white
        if (isFull) {
          console.log('房间已满')
          callback({ success: false, error: '房间已满' })
          return
        }

        // 检查游戏是否已开始
        if (room.gameStarted) {
          console.log('游戏已经开始')
          callback({ success: false, error: '游戏已经开始' })
          return
        }

        // 分配玩家颜色
        const playerColor: PlayerColor = !room.players.black ? 'black' : 'white'
        console.log('分配玩家颜色:', playerColor)
        
        // 更新房间状态
        room.players[playerColor] = socket.id
        socket.join(data.roomId)

        // 通知房间内的所有玩家有新玩家加入
        io.to(data.roomId).emit('player_joined', {
          playerColor,
          board: room.board,
          currentPlayer: room.currentPlayer,
          timers: room.timers
        })

        // 如果两个玩家都已加入，开始游戏
        const canStartGame = room.players.black && room.players.white
        if (canStartGame) {
          console.log('两名玩家都已加入，开始游戏')
          room.gameStarted = true
          startGameTimer(room, io)

          io.to(data.roomId).emit('game_start', {
            board: room.board,
            currentPlayer: room.currentPlayer,
            timers: room.timers
          })
        }

        // 返回成功响应
        const response = { 
          success: true,
          playerColor,
          gameStarted: room.gameStarted
        }
        console.log('发送加入房间响应:', response)
        callback(response)
      } catch (error) {
        console.error('Join room error:', error)
        callback({ success: false, error: '加入房间失败' })
      }
    })

    // 获取游戏状态
    socket.on('get_game_state', (data: { roomId: string }, callback) => {
      try {
        console.log('收到获取游戏状态请求:', data)
        const room = rooms.get(data.roomId)

        if (!room) {
          console.log('房间不存在:', data.roomId)
          callback({ success: false, error: '房间不存在' })
          return
        }

        const response = {
          success: true,
          board: room.board,
          currentPlayer: room.currentPlayer,
          gameStarted: room.gameStarted,
          timers: room.timers
        }
        console.log('发送游戏状态响应:', response)
        callback(response)
      } catch (error) {
        console.error('Get game state error:', error)
        callback({ success: false, error: '获取游戏状态失败' })
      }
    })

    // 落子
    socket.on('make_move', (data: { row: number; col: number }, callback) => {
      try {
        // 查找玩家所在的房间
        let playerRoom: GameRoom | null = null
        let roomId: string | null = null

        for (const [id, room] of rooms.entries()) {
          if (room.players.black === socket.id || room.players.white === socket.id) {
            playerRoom = room
            roomId = id
            break
          }
        }

        if (!playerRoom || !roomId) {
          callback({ success: false, error: '房间不存在' })
          return
        }

        // 检查是否轮到该玩家
        const playerColor = playerRoom.players.black === socket.id ? 'black' : 'white'
        if (playerColor !== playerRoom.currentPlayer) {
          callback({ success: false, error: '还没轮到你' })
          return
        }

        // 检查位置是否有效
        if (data.row < 0 || data.row >= 15 || data.col < 0 || data.col >= 15) {
          callback({ success: false, error: '无效的位置' })
          return
        }

        // 检查位置是否已被占用
        if (playerRoom.board[data.row][data.col] !== null) {
          callback({ success: false, error: '该位置已有棋子' })
          return
        }

        // 落子
        playerRoom.board[data.row][data.col] = playerColor
        playerRoom.lastMove = { row: data.row, col: data.col }
        playerRoom.moveHistory.push({ row: data.row, col: data.col, color: playerColor })

        // 切换当前玩家
        const nextPlayer = playerColor === 'black' ? 'white' : 'black'
        playerRoom.currentPlayer = nextPlayer

        // 通知房间内的所有玩家
        io.to(roomId).emit('opponent_move', {
          row: data.row,
          col: data.col,
          color: playerColor,
          nextPlayer
        })

        callback({ success: true })

        // 检查是否获胜
        if (checkWin(playerRoom.board, data.row, data.col, playerColor)) {
          playerRoom.gameOver = true
          playerRoom.winner = playerColor
          io.to(roomId).emit('game_over', {
            winner: playerColor,
            reason: 'win',
            board: playerRoom.board
          })
          rooms.delete(roomId)
        }

      } catch (error) {
        console.error('Make move error:', error)
        callback({ success: false, error: '落子失败' })
      }
    })

    // 认输
    socket.on('surrender', (data: { roomId: string }, callback) => {
      try {
        const room = rooms.get(data.roomId)

        if (!room) {
          callback({ success: false, error: '房间不存在' })
          return
        }

        if (!room.gameStarted || room.gameOver) {
          callback({ success: false, error: '游戏未开始或已结束' })
          return
        }

        const playerColor = getPlayerColor(room, socket.id)
        if (!playerColor) {
          callback({ success: false, error: '你不是游戏玩家' })
          return
        }

        room.gameOver = true
        room.winner = playerColor === 'black' ? 'white' : 'black'
        stopGameTimer(room)

        io.to(data.roomId).emit('game_over', {
          winner: room.winner
        })

        callback({ success: true })
      } catch (error) {
        console.error('Surrender error:', error)
        callback({ success: false, error: '认输失败' })
      }
    })

    // 离开房间
    socket.on('leave_room', (data: { roomId: string }, callback) => {
      try {
        const room = rooms.get(data.roomId)

        if (!room) {
          callback({ success: false, error: '房间不存在' })
          return
        }

        const playerColor = getPlayerColor(room, socket.id)
        if (!playerColor) {
          callback({ success: false, error: '你不是游戏玩家' })
          return
        }

        // 如果游戏未结束，判定对方获胜
        if (room.gameStarted && !room.gameOver) {
          room.gameOver = true
          room.winner = playerColor === 'black' ? 'white' : 'black'
          stopGameTimer(room)

          io.to(data.roomId).emit('game_over', {
            winner: room.winner
          })
        }

        // 离开房间
        socket.leave(data.roomId)
        if (playerColor === 'black') {
          room.players.black = undefined
        } else {
          room.players.white = undefined
        }

        // 如果房间空了，删除房间
        if (!room.players.black && !room.players.white) {
          rooms.delete(data.roomId)
        }

        callback({ success: true })
      } catch (error) {
        console.error('Leave room error:', error)
        callback({ success: false, error: '离开房间失败' })
      }
    })

    // 断开连接
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // 查找玩家所在的房间
      for (const [roomId, room] of rooms.entries()) {
        if (room.players.black === socket.id || room.players.white === socket.id) {
          const playerColor = getPlayerColor(room, socket.id)
          if (!playerColor) continue

          // 如果游戏未结束，判定对方获胜
          if (room.gameStarted && !room.gameOver) {
            room.gameOver = true
            room.winner = playerColor === 'black' ? 'white' : 'black'
            stopGameTimer(room)

            io.to(roomId).emit('game_over', {
              winner: room.winner
            })
          }

          // 更新房间状态
          if (playerColor === 'black') {
            room.players.black = undefined
          } else {
            room.players.white = undefined
          }

          // 如果房间空了，删除房间
          if (!room.players.black && !room.players.white) {
            rooms.delete(roomId)
          }
        }
      }
    })
  })

  return io
}

// 生成房间ID
function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

// 获取玩家颜色
function getPlayerColor(room: GameRoom, socketId: string): PlayerColor | null {
  if (room.players.black === socketId) return 'black'
  if (room.players.white === socketId) return 'white'
  return null
}

// 检查胜负
function checkWin(board: (PlayerColor | null)[][], row: number, col: number): boolean {
  const color = board[row][col]
  if (!color) return false

  // 检查方向：水平、垂直、左斜、右斜
  const directions = [
    [[0, 1], [0, -1]], // 水平
    [[1, 0], [-1, 0]], // 垂直
    [[1, 1], [-1, -1]], // 左斜
    [[1, -1], [-1, 1]] // 右斜
  ]

  for (const [dir1, dir2] of directions) {
    let count = 1

    // 向第一个方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dir1[0] * i
      const newCol = col + dir1[1] * i
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        board[newRow][newCol] !== color
      ) {
        break
      }
      count++
    }

    // 向第二个方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dir2[0] * i
      const newCol = col + dir2[1] * i
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        board[newRow][newCol] !== color
      ) {
        break
      }
      count++
    }

    if (count >= 5) return true
  }

  return false
}

// 启动游戏计时器
function startGameTimer(room: GameRoom, io: Server) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval)
  }

  room.timerInterval = setInterval(() => {
    if (room.gameOver) {
      stopGameTimer(room)
      return
    }

    // 更新当前玩家的时间
    room.timers[room.currentPlayer]--

    // 检查是否超时
    if (room.timers[room.currentPlayer] <= 0) {
      room.gameOver = true
      room.winner = room.currentPlayer === 'black' ? 'white' : 'black'
      stopGameTimer(room)

      io.to(room.id).emit('game_over', {
        winner: room.winner
      })
    }
  }, 1000)
}

// 停止游戏计时器
function stopGameTimer(room: GameRoom) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval)
    room.timerInterval = null
  }
} 