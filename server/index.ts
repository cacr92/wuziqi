import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import type { PlayerColor } from '../src/types'
import type { Room } from './types'
import { generateRoomId, createBoard, checkWin, startTimer, setSocketServer } from './utils'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// 设置 Socket.IO 实例
setSocketServer(io)

// 存储房间信息
const rooms = new Map<string, Room>()
const playerRooms = new Map<string, string>() // 存储玩家ID和房间ID的映射

// 房间清理定时器
setInterval(() => {
  const now = Date.now()
  for (const [roomId, room] of rooms.entries()) {
    // 清理超过30分钟的空闲房间
    if (!room.players.black || !room.players.white) {
      const idleTime = now - (room.lastActiveTime || now)
      if (idleTime > 30 * 60 * 1000) {
        rooms.delete(roomId)
        console.log(`Cleaned up idle room: ${roomId}`)
      }
    }
  }
}, 5 * 60 * 1000) // 每5分钟检查一次

// Socket.IO 事件处理
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`)

  // 获取房间列表
  socket.on('get_rooms', (callback) => {
    try {
      const roomList = Array.from(rooms.values()).map(room => ({
        id: room.id,
        playerCount: (room.players.black ? 1 : 0) + (room.players.white ? 1 : 0),
        gameStarted: room.gameStarted,
        createTime: room.createTime
      }))
      callback({ success: true, rooms: roomList })
    } catch (error) {
      console.error('Get rooms error:', error)
      callback({ success: false, error: '获取房间列表失败' })
    }
  })

  // 重连处理
  socket.on('reconnect_game', (data: { roomId: string }, callback) => {
    try {
      const room = rooms.get(data.roomId)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      // 检查是否是房间中的玩家
      let playerColor: PlayerColor | null = null
      if (room.players.black === socket.id) playerColor = 'black'
      else if (room.players.white === socket.id) playerColor = 'white'

      if (!playerColor) {
        callback({ success: false, error: '不是房间中的玩家' })
        return
      }

      // 重新加入房间
      socket.join(data.roomId)
      playerRooms.set(socket.id, data.roomId)

      // 返回当前游戏状态
      callback({
        success: true,
        gameState: {
          board: room.board,
          currentPlayer: room.currentPlayer,
          gameStarted: room.gameStarted,
          players: room.players,
          lastMove: room.lastMove,
          timers: room.timers
        }
      })
    } catch (error) {
      console.error('Reconnect error:', error)
      callback({ success: false, error: '重连失败' })
    }
  })

  // 创建房间
  socket.on('create_room', (data: { gameTime: number, firstMove: 'random' | 'black' | 'white' }, callback) => {
    try {
      const roomId = generateRoomId()
      const room: Room = {
        id: roomId,
        players: {
          black: socket.id,
          white: null
        },
        board: createBoard(),
        currentPlayer: 'black',
        gameStarted: false,
        lastMove: null,
        gameTime: data.gameTime,
        timers: {
          black: data.gameTime,
          white: data.gameTime
        },
        timerInterval: null,
        createTime: Date.now(),
        lastActiveTime: Date.now()
      }

      rooms.set(roomId, room)
      socket.join(roomId)
      playerRooms.set(socket.id, roomId)

      // 发送房间创建成功事件
      socket.emit('room_created', {
        roomId,
        playerColor: 'black',
        board: room.board,
        currentPlayer: room.currentPlayer,
        gameState: {
          board: room.board,
          currentPlayer: room.currentPlayer,
          gameStarted: false,
          players: room.players,
          timers: room.timers
        }
      })

      callback({ success: true, roomId })
    } catch (error) {
      console.error('Create room error:', error)
      callback({ success: false, error: '创建房间失败' })
    }
  })

  // 加入房间
  socket.on('join_room', (data: { roomId: string }, callback) => {
    try {
      console.log(`Player ${socket.id} trying to join room ${data.roomId}`)
      const room = rooms.get(data.roomId)
      
      if (!room) {
        console.log(`Room ${data.roomId} not found`)
        callback({ success: false, error: '房间不存在' })
        return
      }

      // 检查玩家是否已经在房间中
      if (room.players.black === socket.id || room.players.white === socket.id) {
        console.log(`Player ${socket.id} already in room ${data.roomId}`)
        callback({ 
          success: true, 
          playerColor: room.players.black === socket.id ? 'black' : 'white',
          gameState: {
            board: room.board,
            currentPlayer: room.currentPlayer,
            gameStarted: room.gameStarted,
            players: room.players,
            timers: room.timers,
            lastMove: room.lastMove
          }
        })
        return
      }

      // 检查房间是否已满
      if (room.players.black && room.players.white) {
        console.log(`Room ${data.roomId} is full`)
        callback({ success: false, error: '房间已满' })
        return
      }

      // 加入者固定为白子
      room.players.white = socket.id
      socket.join(data.roomId)
      playerRooms.set(socket.id, data.roomId)
      room.lastActiveTime = Date.now()
      console.log(`Player ${socket.id} joined room ${data.roomId} as white`)

      // 通知房间内的所有玩家
      io.to(data.roomId).emit('player_joined', {
        players: room.players,
        board: room.board,
        currentPlayer: room.currentPlayer,
        timers: room.timers,
        gameStarted: room.gameStarted,
        lastMove: room.lastMove
      })

      // 如果两个玩家都已加入，开始游戏
      if (room.players.black && room.players.white) {
        console.log(`Game starting in room ${data.roomId}`)
        room.gameStarted = true
        room.currentPlayer = 'black' // 确保黑方先手
        startTimer(room, rooms)
        io.to(data.roomId).emit('game_started', {
          board: room.board,
          currentPlayer: room.currentPlayer,
          timers: room.timers,
          players: room.players,
          gameStarted: true,
          lastMove: room.lastMove
        })
      }

      callback({ 
        success: true, 
        playerColor: 'white',
        gameState: {
          board: room.board,
          currentPlayer: room.currentPlayer,
          gameStarted: room.gameStarted,
          players: room.players,
          timers: room.timers,
          lastMove: room.lastMove
        }
      })
    } catch (error) {
      console.error('Join room error:', error)
      callback({ success: false, error: '加入房间失败' })
    }
  })

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    
    const roomId = playerRooms.get(socket.id)
    if (roomId) {
      const room = rooms.get(roomId)
      if (room) {
        // 通知另一个玩家
        socket.to(roomId).emit('opponent_disconnected', {
          playerId: socket.id,
          isBlack: room.players.black === socket.id
        })
        
        // 更新最后活动时间
        room.lastActiveTime = Date.now()
        
        // 如果游戏已经开始，给对手3分钟重连时间
        if (room.gameStarted) {
          setTimeout(() => {
            const currentRoom = rooms.get(roomId)
            if (currentRoom && 
               ((currentRoom.players.black === socket.id && !currentRoom.players.black) ||
                (currentRoom.players.white === socket.id && !currentRoom.players.white))) {
              // 如果3分钟后玩家还没有重连，对手获胜
              const winner = currentRoom.players.black === socket.id ? 'white' : 'black'
              io.to(roomId).emit('game_over', {
                winner,
                reason: 'disconnect',
                board: currentRoom.board
              })
              rooms.delete(roomId)
            }
          }, 3 * 60 * 1000)
        }
        
        // 清理玩家信息
        if (room.players.black === socket.id) {
          room.players.black = null
        } else if (room.players.white === socket.id) {
          room.players.white = null
        }
        
        playerRooms.delete(socket.id)
      }
    }
  })

  // 处理认输
  socket.on('surrender', (callback) => {
    try {
      const roomId = playerRooms.get(socket.id)
      if (!roomId) {
        callback({ success: false, error: '未找到房间' })
        return
      }

      const room = rooms.get(roomId)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      if (!room.gameStarted) {
        callback({ success: false, error: '游戏尚未开始' })
        return
      }

      const surrenderingPlayer = room.players.black === socket.id ? 'black' : 'white'
      const winner = surrenderingPlayer === 'black' ? 'white' : 'black'

      // 清理计时器
      if (room.timerInterval) {
        clearInterval(room.timerInterval)
      }

      // 通知所有玩家
      io.to(roomId).emit('game_over', {
        winner,
        reason: 'surrender',
        board: room.board,
        isHost: room.players.black
      })

      // 重置游戏状态，但保留房间
      room.gameStarted = false
      room.currentPlayer = 'black'
      room.timers = {
        black: room.gameTime,
        white: room.gameTime
      }

      callback({ success: true })
    } catch (error) {
      console.error('Surrender error:', error)
      callback({ success: false, error: '操作失败' })
    }
  })

  // 检查是否平局
  const checkDraw = (board: (PlayerColor | null)[][]) => {
    return board.every(row => row.every(cell => cell !== null))
  }

  // 更新计时器处理
  const updateTimer = (room: Room) => {
    if (!room.timerInterval) {
      room.timerInterval = setInterval(() => {
        // 更新当前玩家的计时器
        room.timers[room.currentPlayer]--

        // 广播计时器更新
        io.to(room.id).emit('timer_update', {
          timers: room.timers,
          currentPlayer: room.currentPlayer
        })

        // 检查是否超时
        if (room.timers[room.currentPlayer] <= 0) {
          clearInterval(room.timerInterval!)
          const winner = room.currentPlayer === 'black' ? 'white' : 'black'
          io.to(room.id).emit('game_over', {
            winner,
            reason: 'timeout',
            board: room.board,
            isHost: room.players.black
          })
          
          // 重置游戏状态，但保留房间
          room.gameStarted = false
          room.currentPlayer = 'black'
          room.timers = {
            black: room.gameTime,
            white: room.gameTime
          }
        }
      }, 1000)
    }
  }

  // 处理落子
  socket.on('make_move', (data: { row: number; col: number }, callback) => {
    try {
      console.log(`Player ${socket.id} attempting move:`, data)
      const roomId = playerRooms.get(socket.id)
      if (!roomId) {
        callback({ success: false, error: '未找到房间' })
        return
      }

      const room = rooms.get(roomId)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      if (!room.gameStarted) {
        callback({ success: false, error: '游戏尚未开始' })
        return
      }

      // 检查是否轮到该玩家
      const playerColor = room.players.black === socket.id ? 'black' : 'white'
      console.log('Move validation:', {
        currentPlayer: room.currentPlayer,
        playerColor,
        isCurrentPlayer: room.currentPlayer === playerColor
      })
      
      if (room.currentPlayer !== playerColor) {
        callback({ success: false, error: '还没轮到你' })
        return
      }

      // 检查位置是否有效
      if (data.row < 0 || data.row >= 15 || data.col < 0 || data.col >= 15) {
        callback({ success: false, error: '无效的位置' })
        return
      }

      // 检查位置是否已被占用
      if (room.board[data.row][data.col] !== null) {
        callback({ success: false, error: '该位置已被占用' })
        return
      }

      // 更新棋盘
      room.board[data.row][data.col] = playerColor
      room.lastMove = { row: data.row, col: data.col }
      room.lastActiveTime = Date.now()

      // 切换当前玩家
      room.currentPlayer = playerColor === 'black' ? 'white' : 'black'
      console.log(`Current player switched to: ${room.currentPlayer}`)

      // 广播移动信息
      io.to(roomId).emit('opponent_move', {
        row: data.row,
        col: data.col,
        color: playerColor,
        nextPlayer: room.currentPlayer,
        board: room.board,
        lastMove: room.lastMove,
        timers: room.timers
      })

      // 检查是否获胜
      if (checkWin(room.board, data.row, data.col, playerColor)) {
        if (room.timerInterval) {
          clearInterval(room.timerInterval)
        }
        io.to(roomId).emit('game_over', {
          winner: playerColor,
          reason: 'win',
          board: room.board,
          isHost: room.players.black
        })
        // 重置游戏状态，但保留房间
        room.gameStarted = false
        room.currentPlayer = 'black'
        room.timers = {
          black: room.gameTime,
          white: room.gameTime
        }
      }

      callback({ success: true })
    } catch (error) {
      console.error('Make move error:', error)
      callback({ success: false, error: '操作失败' })
    }
  })

  // 处理游戏结束
  const handleGameOver = (room: Room, winner: PlayerColor | null, reason: string) => {
    if (room.timerInterval) {
      clearInterval(room.timerInterval)
    }
    io.to(room.id).emit('game_over', {
      winner,
      reason,
      board: room.board,
      isHost: room.players.black // 房主ID，用于判断是否是房主
    })
  }

  // 处理重新开始游戏
  socket.on('restart_game', (callback) => {
    try {
      const roomId = playerRooms.get(socket.id)
      if (!roomId) {
        callback({ success: false, error: '未找到房间' })
        return
      }

      const room = rooms.get(roomId)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      // 重置游戏状态
      room.board = createBoard()
      room.currentPlayer = 'black'
      room.gameStarted = true
      room.lastMove = null
      room.timers = {
        black: room.gameTime,
        white: room.gameTime
      }

      // 启动计时器
      startTimer(room, rooms)

      // 通知房间内的所有玩家游戏重新开始
      io.to(roomId).emit('game_restarted', {
        board: room.board,
        currentPlayer: room.currentPlayer,
        timers: room.timers,
        players: room.players,
        gameStarted: true,
        lastMove: null
      })

      callback({ success: true })
    } catch (error) {
      console.error('Restart game error:', error)
      callback({ success: false, error: '重新开始游戏失败' })
    }
  })

  // 处理离开房间
  socket.on('leave_room', (callback) => {
    try {
      const roomId = playerRooms.get(socket.id)
      if (!roomId) {
        callback({ success: false, error: '未找到房间' })
        return
      }

      const room = rooms.get(roomId)
      if (!room) {
        callback({ success: false, error: '房间不存在' })
        return
      }

      // 如果是白方离开，保留房间让房主等待新玩家
      if (room.players.white === socket.id) {
        room.players.white = null
        room.gameStarted = false
        room.board = createBoard()
        room.lastMove = null
        room.timers = {
          black: room.gameTime,
          white: room.gameTime
        }
        if (room.timerInterval) {
          clearInterval(room.timerInterval)
        }

        // 通知房主对手离开
        socket.to(roomId).emit('opponent_left', {
          board: room.board,
          currentPlayer: 'black',
          gameStarted: false,
          players: room.players,
          timers: room.timers
        })

        socket.leave(roomId)
        playerRooms.delete(socket.id)
      } else if (room.players.black === socket.id) {
        // 如果是房主离开，删除房间
        if (room.timerInterval) {
          clearInterval(room.timerInterval)
        }
        socket.to(roomId).emit('host_left')
        rooms.delete(roomId)
        socket.leave(roomId)
        playerRooms.delete(socket.id)
      }

      callback({ success: true })
    } catch (error) {
      console.error('Leave room error:', error)
      callback({ success: false, error: '离开房间失败' })
    }
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log('Socket.IO server is ready for connections')
}) 