import { connectSocket, disconnectSocket, getSocket, createRoom, joinRoom, makeMove as emitMove, surrender as emitSurrender, leaveRoom, requestSync } from '../utils/socket'
import { ref, onMounted, onUnmounted } from 'vue'
import type { PlayerColor } from '../types'
import { ElMessage } from 'element-plus'

export function useOnlineGame() {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const roomId = ref<string | null>(null)
  const playerColor = ref<PlayerColor | null>(null)

  // 连接服务器
  const connect = async () => {
    try {
      isLoading.value = true
      await connectSocket()
      isConnected.value = true
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '连接服务器失败'
      isConnected.value = false
    } finally {
      isLoading.value = false
    }
  }

  // 创建房间
  const create = async () => {
    if (!isConnected.value) {
      await connect()
    }

    try {
      isLoading.value = true
      const newRoomId = await createRoom({ gameTime: 600, firstMove: 'black' })
      if (newRoomId) {
        roomId.value = newRoomId
        playerColor.value = 'black'
      }
      return newRoomId
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建房间失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 加入房间
  const join = async (id: string) => {
    if (!isConnected.value) {
      await connect()
    }

    try {
      isLoading.value = true
      await joinRoom(id)
      roomId.value = id
      playerColor.value = 'white'
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加入房间失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 落子
  const makeMove = async (row: number, col: number) => {
    if (!roomId.value) {
      error.value = '未加入房间'
      return
    }

    try {
      await emitMove(roomId.value, row, col)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '落子失败'
      throw err
    }
  }

  // 认输
  const surrender = async () => {
    if (!roomId.value) {
      error.value = '未加入房间'
      return
    }

    try {
      await emitSurrender(roomId.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '认输失败'
      throw err
    }
  }

  // 离开房间
  const leave = async () => {
    if (!roomId.value) return

    try {
      await leaveRoom(roomId.value)
      roomId.value = null
      playerColor.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '离开房间失败'
      throw err
    }
  }

  // 同步游戏状态
  const sync = async () => {
    if (!roomId.value) {
      error.value = '未加入房间'
      return
    }

    try {
      await requestSync(roomId.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '同步游戏状态失败'
      throw err
    }
  }

  // 监听事件
  onMounted(() => {
    const socket = getSocket()
    if (socket) {
      socket.on('connect', () => {
        isConnected.value = true
        error.value = null
      })

      socket.on('disconnect', () => {
        isConnected.value = false
        error.value = '与服务器断开连接'
      })

      socket.on('connect_error', (err) => {
        isConnected.value = false
        error.value = '连接服务器失败'
        console.error('Connection error:', err)
      })

      socket.on('error', (err) => {
        error.value = err.message || '发生错误'
        ElMessage.error(error.value)
      })
    }
  })

  // 清理事件监听
  onUnmounted(() => {
    const socket = getSocket()
    if (socket) {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('error')
    }
    disconnectSocket()
  })

  return {
    isConnected,
    isLoading,
    error,
    roomId,
    playerColor,
    connect,
    create,
    join,
    makeMove,
    surrender,
    leave,
    sync
  }
} 