import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupSocket } from './socket'

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// 设置 Socket.IO 事件处理
setupSocket(io)

// 启动服务器
const PORT = process.env.PORT || 3001
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