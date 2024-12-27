import { io, Socket } from 'socket.io-client'
import { ElMessage } from 'element-plus'
import type { Board, PlayerColor } from '../types'

// 服务器配置
const SERVER_PORT = 3001
const SERVER_URL = `http://localhost:${SERVER_PORT}`

// Socket 配置
const RECONNECTION_ATTEMPTS = 3
const RECONNECTION_DELAY = 2000
const REQUEST_TIMEOUT = 10000

// 创建 Socket 实例
let socket: Socket | null = null
let isConnecting = false

// 连接到服务器
export const connectSocket = async () => {
  if (socket?.connected) return socket
  if (isConnecting) return

  isConnecting = true
 
  return new Promise<Socket>((resolve, reject) => {
    try {
      socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],  // 允许降级到 polling
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        reconnectionDelay: RECONNECTION_DELAY,
        timeout: REQUEST_TIMEOUT,
        forceNew: true  // 强制创建新连接
      })

      const timeoutId = setTimeout(() => {
        isConnecting = false
        socket?.disconnect()
        reject(new Error('连接服务器超时，请检查服务器是否正常运行'))
      }, REQUEST_TIMEOUT)

      socket.on('connect', () => {
        console.log('Connected to server')
        clearTimeout(timeoutId)
        isConnecting = false
        resolve(socket!)
      })

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        clearTimeout(timeoutId)
        isConnecting = false
        reject(new Error('无法连接到服务器，请检查服务器是否正常运行'))
      })

      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason)
        if (reason === 'io server disconnect') {
          // 服务器主动断开连接，尝试重连
          socket?.connect()
        }
      })

      socket.connect()
    } catch (error) {
      console.error('Socket initialization error:', error)
      isConnecting = false
      reject(new Error('初始化连接失败，请刷新页面重试'))
    }
  })
}

// 断开连接
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// 重新连接
export const reconnectSocket = async () => {
  disconnectSocket()
  return connectSocket()
}

// 获取 Socket 实例
export const getSocket = () => socket

// 检查连接状态
const ensureConnection = () => {
  if (!socket?.connected) {
    throw new Error('未连接到服务器，请刷新页面重试')
  }
}

// 创建房间
export const createRoom = async (options: { gameTime: number; firstMove: 'random' | 'black' | 'white' }) => {
  try {
    ensureConnection()
    
    const response = await new Promise<{ success: boolean; roomId?: string; error?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('创建房间请求超时'))
      }, REQUEST_TIMEOUT)

      socket!.emit('create_room', options, (response) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })

    if (!response.success) {
      throw new Error(response.error || '创建房间失败')
    }

    return response.roomId
  } catch (error) {
    console.error('Create room error:', error)
    throw error
  }
}

// 加入房间
export const joinRoom = async (roomId: string) => {
  try {
    console.log('检查连接状态...')
    ensureConnection()
    
    console.log('发送加入房间请求...')
    const response = await new Promise<{ success: boolean; playerColor?: PlayerColor; error?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('加入房间请求超时'))
      }, REQUEST_TIMEOUT)

      socket!.emit('join_room', { roomId }, (response: any) => {
        clearTimeout(timeout)
        console.log('收到服务器响应:', response)
        
        if (!response.success) {
          const error = response.error || '加入房间失败'
          console.error('加入房间失败:', error)
          if (error.includes('full')) {
            reject(new Error('房间已满'))
          } else if (error.includes('not found')) {
            reject(new Error('房间不存在'))
          } else if (error.includes('started')) {
            reject(new Error('游戏已经开始'))
          } else {
            reject(new Error(error))
          }
        } else {
          console.log('加入房间成功，玩家颜色:', response.playerColor)
          resolve(response)
        }
      })
    })

    return response
  } catch (error) {
    console.error('Join room error:', error)
    throw error
  }
}

// 落子
export const makeMove = async (roomId: string, row: number, col: number) => {
  try {
    ensureConnection()
    
    const response = await new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('落子请求超时'))
      }, REQUEST_TIMEOUT)

      socket!.emit('make_move', { roomId, row, col }, (response) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })

    if (!response.success) {
      throw new Error(response.error || '落子失败')
    }
  } catch (error) {
    console.error('Make move error:', error)
    throw error
  }
}

// 认输
export const surrender = async (roomId: string) => {
  try {
    ensureConnection()
    
    const response = await new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('认输请求超时'))
      }, REQUEST_TIMEOUT)

      socket!.emit('surrender', { roomId }, (response) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })

    if (!response.success) {
      throw new Error(response.error || '认输失败')
    }
  } catch (error) {
    console.error('Surrender error:', error)
    throw error
  }
}

// 离开房间
export const leaveRoom = async (roomId: string) => {
  try {
    ensureConnection()
    
    const response = await new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('离开房间请求超时'))
      }, REQUEST_TIMEOUT)

      socket!.emit('leave_room', { roomId }, (response) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })

    if (!response.success) {
      throw new Error(response.error || '离开房间失败')
    }
  } catch (error) {
    console.error('Leave room error:', error)
    throw error
  }
}

// 请求同步游戏状态
export const requestSync = async (roomId: string) => {
  try {
    ensureConnection()
    
    const response = await new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('同步请求超时'))
      }, REQUEST_TIMEOUT)

      socket!.emit('sync_request', { roomId }, (response) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })

    if (!response.success) {
      throw new Error(response.error || '同步请求失败')
    }
  } catch (error) {
    console.error('Sync request error:', error)
    throw error
  }
}

// 事件类型定义
export interface ServerToClientEvents {
  room_created: (data: { roomId: string }) => void
  game_joined: (data: { 
    playerColor: PlayerColor
    board: Board
    currentPlayer: PlayerColor
    lastMove?: { row: number; col: number }
    gameTime: number
    timers: { black: number; white: number }
  }) => void
  opponent_joined: (data: { 
    board: Board
    currentPlayer: PlayerColor
    gameTime: number
    timers: { black: number; white: number }
  }) => void
  move_made: (data: { 
    row: number
    col: number
    color: PlayerColor
    timers: { black: number; white: number }
  }) => void
  game_over: (data: { 
    winner: PlayerColor
    reason: 'win' | 'surrender' | 'timeout' | 'leave'
  }) => void
  opponent_left: () => void
  timer_sync: (data: { timers: { black: number; white: number } }) => void
  error: (data: { message: string }) => void
}

export interface ClientToServerEvents {
  create_room: (
    options: { gameTime: number; firstMove: 'random' | 'black' | 'white' },
    callback: (response: { success: boolean; roomId?: string; error?: string }) => void
  ) => void
  join_room: (
    data: { roomId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  make_move: (
    data: { roomId: string; row: number; col: number },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  surrender: (
    data: { roomId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  leave_room: (
    data: { roomId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  sync_request: (
    data: { roomId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  timer_sync: (
    data: { roomId: string; timers: { black: number; white: number } },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
} 