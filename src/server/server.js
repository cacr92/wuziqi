const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// 存储游戏房间信息
const rooms = new Map()

// 提供静态文件
app.use(express.static(path.join(__dirname, '../../dist')))

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id)

  // 创建房间
  socket.on('createRoom', () => {
    const roomId = Math.random().toString(36).substring(2, 8)
    rooms.set(roomId, {
      players: [socket.id],
      currentPlayer: 'black',
      board: Array(15).fill(null).map(() => Array(15).fill(null))
    })
    socket.join(roomId)
    socket.emit('roomCreated', { roomId })
  })

  // 加入房间
  socket.on('joinRoom', (roomId) => {
    const room = rooms.get(roomId)
    if (room && room.players.length < 2) {
      room.players.push(socket.id)
      socket.join(roomId)
      io.to(roomId).emit('gameStart', {
        players: room.players,
        currentPlayer: 'black'
      })
    } else {
      socket.emit('joinError', '房间不存在或已满')
    }
  })

  // 处理落子
  socket.on('makeMove', ({ roomId, row, col }) => {
    const room = rooms.get(roomId)
    if (room && room.players.indexOf(socket.id) !== -1) {
      const playerIndex = room.players.indexOf(socket.id)
      const color = playerIndex === 0 ? 'black' : 'white'
      
      if (color === room.currentPlayer && !room.board[row][col]) {
        room.board[row][col] = color
        room.currentPlayer = room.currentPlayer === 'black' ? 'white' : 'black'
        
        io.to(roomId).emit('moveMade', {
          row,
          col,
          color,
          currentPlayer: room.currentPlayer
        })
      }
    }
  })

  // 处理断开连接
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.indexOf(socket.id)
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1)
        if (room.players.length === 0) {
          rooms.delete(roomId)
        } else {
          io.to(roomId).emit('playerLeft')
        }
      }
    }
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 