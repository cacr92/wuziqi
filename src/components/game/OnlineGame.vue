<template>
  <div class="online-game">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="header-info">
        <div class="room-info">
          <span class="info-label">房间号</span>
          <span class="room-id">{{ roomId }}</span>
          <button class="copy-btn" @click="copyRoomId" title="复制房间号">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="header-controls">
          <button 
            class="control-btn"
            @click="handleSurrender"
            :disabled="!gameStarted || gameOver"
          >
            <i class="fas fa-flag"></i>
            认输
          </button>
          <button 
            class="control-btn"
            @click="showSettings = true"
          >
            <i class="fas fa-cog"></i>
            设置
          </button>
          <button 
            class="control-btn danger"
            @click="handleLeaveRoom"
          >
            <i class="fas fa-sign-out-alt"></i>
            {{ isHost ? '解散房间' : '离开房间' }}
          </button>
        </div>
        <div class="game-time">
          <span class="info-label">游戏时长</span>
          <span class="time-value">{{ formatTime(gameTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 主游戏区域 -->
    <div class="game-main">
      <!-- 左侧玩家信息 -->
      <div class="player-panel left" :class="{ active: currentPlayer === 'black' }">
        <div class="player-avatar">
          <img src="/avatars/black.svg" alt="黑方头像">
        </div>
        <div class="player-info">
          <div class="player-name">{{ playerColor === 'black' ? '我方' : '对手' }} (黑)</div>
          <div class="player-timer">{{ formatTime(timers.black) }}</div>
          <div class="player-status" :class="{ thinking: currentPlayer === 'black' }">
            {{ currentPlayer === 'black' ? '正在思考...' : '等待对手' }}
          </div>
        </div>
      </div>

      <!-- 中间棋盘 -->
      <div class="game-board">
        <div class="board-grid">
          <div v-for="(row, i) in board" :key="i" class="board-row">
            <div 
              v-for="(cell, j) in row" 
              :key="j"
              class="board-cell"
              @click="handleMove(i, j)"
            >
              <div 
                v-if="cell" 
                class="piece"
                :class="[cell, { last: lastMove?.row === i && lastMove?.col === j }]"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧玩家信息 -->
      <div class="player-panel right" :class="{ active: currentPlayer === 'white' }">
        <div class="player-avatar">
          <img src="/avatars/white.svg" alt="白方头像">
          <div v-if="!opponentJoined" class="waiting-badge">等待加入</div>
        </div>
        <div class="player-info">
          <div class="player-name">{{ playerColor === 'white' ? '我方' : '对手' }} (白)</div>
          <div class="player-timer">{{ formatTime(timers.white) }}</div>
          <div class="player-status" :class="{ thinking: currentPlayer === 'white' }">
            {{ !opponentJoined ? '等待加入...' : currentPlayer === 'white' ? '正在思考...' : '等待对手' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>游戏设置</h3>
          <button class="close-btn" @click="showSettings = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <GameSettings @save="handleSettingsSave" />
      </div>
    </div>

    <!-- 历史记录弹窗 -->
    <div v-if="showHistory" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>对局历史</h3>
          <button class="close-btn" @click="showHistory = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <GameHistory ref="historyRef" />
      </div>
    </div>

    <!-- 游戏结束弹窗 -->
    <el-dialog
      v-model="gameOver"
      :title="getGameOverTitle()"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      center
      :close-on-press-escape="false"
    >
      <div class="game-over-content">
        <div class="game-over-icon">
          <i class="fas" :class="getGameOverIcon()"></i>
        </div>
        <p class="game-over-message">{{ getGameOverMessage() }}</p>
        <p class="restart-message">{{ countdown > 0 ? `${countdown}秒后自动开始新一局...` : '准备开始新一局...' }}</p>
        <div class="game-over-actions">
          <el-button 
            type="danger"
            @click="handleLeaveRoom"
          >
            <i class="fas fa-sign-out-alt"></i>
            {{ isHost ? '解散房间' : '离开房间' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { connectSocket, getSocket } from '@/utils/socket'
import { playSound } from '@/utils/audio'
import type { PlayerColor } from '@/types/game'
import GameSettings from './GameSettings.vue'
import GameHistory from './GameHistory.vue'
import { useLocalStorage } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const roomId = ref(route.query.roomId as string)
const opponentJoined = ref(false)

// 游戏状态
const board = ref<(PlayerColor | null)[][]>(Array(15).fill(null).map(() => Array(15).fill(null)))
const currentPlayer = ref<PlayerColor>('black')
const playerColor = ref<PlayerColor | null>(null)
const gameStarted = ref(false)
const gameOver = ref(false)
const winner = ref<PlayerColor | null>(null)
const lastMove = ref<{ row: number; col: number } | null>(null)
const isMyTurn = computed(() => currentPlayer.value === playerColor.value && !gameOver.value)
const isReconnecting = ref(false)
const opponentDisconnected = ref(false)
const reconnectTimer = ref<number | null>(null)

// 添加计时器状态
const timers = ref<{ black: number; white: number }>({ black: 300, white: 300 })
const reconnectTimeLeft = ref(180)

// 格式化时间
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 添加房主状态
const isHost = ref(false)

// 更新游戏状态函数
const updateGameState = (gameState: any) => {
  console.log('更新游戏状态:', gameState)
  
  if (gameState.board) board.value = gameState.board
  if (gameState.currentPlayer) currentPlayer.value = gameState.currentPlayer
  if (gameState.gameStarted !== undefined) gameStarted.value = gameState.gameStarted
  if (gameState.lastMove) lastMove.value = gameState.lastMove
  if (gameState.timers) timers.value = gameState.timers
  
  if (gameState.players) {
    const socket = getSocket()
    if (socket) {
      if (socket.id === gameState.players.black) {
        playerColor.value = 'black'
        isHost.value = true
      } else if (socket.id === gameState.players.white) {
        playerColor.value = 'white'
        isHost.value = false
      }
      if (gameState.players.black && gameState.players.white) {
        opponentJoined.value = true
      }
    }
  }
  
  console.log('状态更新完成:', {
    currentPlayer: currentPlayer.value,
    playerColor: playerColor.value,
    gameStarted: gameStarted.value,
    isMyTurn: isMyTurn.value,
    isHost: isHost.value,
    opponentJoined: opponentJoined.value
  })
}

// 设置游戏事件监听
const setupGameListeners = (socket: any) => {
  // 房间创建成功
  socket.on('room_created', (data: {
    roomId: string,
    playerColor: PlayerColor,
    board: (PlayerColor | null)[][],
    currentPlayer: PlayerColor,
    gameState: any
  }) => {
    console.log('收到房间创建成功事件:', data)
    roomId.value = data.roomId
    playerColor.value = data.playerColor
    isHost.value = data.playerColor === 'black'
    updateGameState(data.gameState)
    opponentJoined.value = false
    playSound('success')
  })

  // 对手加入
  socket.on('player_joined', (data: { 
    players: { black: string, white: string },
    board: (PlayerColor | null)[][],
    currentPlayer: PlayerColor,
    timers: { black: number, white: number },
    gameStarted: boolean,
    lastMove: { row: number; col: number } | null
  }) => {
    console.log('收到对手加入事件:', data)
    opponentJoined.value = true
    opponentDisconnected.value = false
    updateGameState(data)
    playSound('success')
    ElMessage.success('对手已加入游戏！')
  })

  // 游戏开始
  socket.on('game_started', (data: { 
    board: (PlayerColor | null)[][],
    currentPlayer: PlayerColor,
    timers: { black: number, white: number },
    players: { black: string, white: string },
    gameStarted: boolean,
    lastMove: { row: number; col: number } | null
  }) => {
    console.log('收到游戏开始事件:', data)
    updateGameState(data)
    gameStarted.value = true
    opponentJoined.value = true
    if (!gameStartTime.value) {
      gameStartTime.value = Date.now()
      startGameTimer()
    }
    playSound('success')
    ElMessage.success('游戏开始！')
  })

  // 对手落子
  socket.on('opponent_move', (data: { 
    row: number, 
    col: number, 
    color: PlayerColor,
    nextPlayer: PlayerColor,
    board: (PlayerColor | null)[][],
    lastMove: { row: number; col: number } | null,
    timers: { black: number, white: number }
  }) => {
    console.log('收到对手落子事件:', data)
    board.value = data.board
    currentPlayer.value = data.nextPlayer
    lastMove.value = data.lastMove
    timers.value = data.timers
    playSound('place')
  })

  // 游戏结束
  socket.on('game_over', (data: { 
    winner: PlayerColor | null, 
    reason: string,
    board: (PlayerColor | null)[][],
    countdown: number
  }) => {
    console.log('收到游戏结束事件:', data)
    handleGameOver(data)
  })

  // 对手断开连接
  socket.on('opponent_disconnected', (data: { playerId: string, isBlack: boolean }) => {
    console.log('对手断开连接:', data)
    opponentDisconnected.value = true
    ElMessage.warning('对手断开连接，等待重连...')
    reconnectTimeLeft.value = 180
    if (reconnectTimer.value) {
      clearInterval(reconnectTimer.value)
    }
    reconnectTimer.value = window.setInterval(() => {
      reconnectTimeLeft.value--
      if (reconnectTimeLeft.value <= 0) {
        clearInterval(reconnectTimer.value!)
        reconnectTimer.value = null
      }
    }, 1000)
  })

  // 对手重连
  socket.on('opponent_reconnected', (data: { playerId: string, isBlack: boolean }) => {
    console.log('对手重新连接:', data)
    opponentDisconnected.value = false
    if (reconnectTimer.value) {
      clearInterval(reconnectTimer.value)
      reconnectTimer.value = null
    }
    ElMessage.success('对手已重新连接')
  })

  // 对手离开
  socket.on('opponent_left', () => {
    console.log('对手离开游戏')
    ElMessage.warning('对手已离开游戏')
    gameOver.value = true
    winner.value = playerColor.value
  })

  // 房主离开
  socket.on('host_left', () => {
    console.log('房主解散了房间')
    ElMessage.warning('房主解散了房间')
    router.push('/')
  })

  // 游戏重新开始
  socket.on('game_restarted', (data: {
    board: (PlayerColor | null)[][],
    currentPlayer: PlayerColor,
    timers: { black: number, white: number },
    players: { black: string, white: string },
    gameStarted: boolean,
    lastMove: { row: number; col: number } | null
  }) => {
    console.log('收到游戏重新开始事件:', data)
    board.value = data.board
    currentPlayer.value = data.currentPlayer
    lastMove.value = data.lastMove
    timers.value = data.timers
    gameStarted.value = true
    gameOver.value = false
    winner.value = null
    moves.value = []
    opponentJoined.value = true
    
    gameTime.value = 0
    gameStartTime.value = Date.now()
    countdown.value = 3
    
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
    
    startGameTimer()
    playSound('success')
    ElMessage.success('新一局游戏开始！')
  })

  // 计时器更新
  socket.on('timer_update', (data: {
    timers: { black: number; white: number },
    currentPlayer: PlayerColor
  }) => {
    console.log('收到计时器更新:', data)
    timers.value = data.timers
    currentPlayer.value = data.currentPlayer
  })

  // 连接错误
  socket.on('connect_error', (error: Error) => {
    console.error('连接错误:', error)
    ElMessage.error('连接错误，请刷新页面重试')
  })

  // 断开连接
  socket.on('disconnect', (reason: string) => {
    console.log('断开连接:', reason)
    if (reason === 'io server disconnect') {
      ElMessage.error('服务器断开连接')
    } else {
      ElMessage.error('与服务器断开连接，请刷新页面重试')
    }
  })
}

// 复制房间号
const copyRoomId = () => {
  if (roomId.value) {
    console.log('复制房间号:', roomId.value)
    navigator.clipboard.writeText(roomId.value)
      .then(() => {
        ElMessage.success('房间号已复制到剪贴板')
        playSound('success')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
  }
}

// 修改重连函数
const tryReconnect = async () => {
  if (!roomId.value || !getSocket()) return

  try {
    isReconnecting.value = true
    const socket = getSocket()!
    console.log('尝试重连到房间:', roomId.value)
    
    // 获取当前URL中的参数，保持原有身份
    const { action } = route.query
    const isHost = action === 'create'
    
    socket.emit('reconnect_game', { 
      roomId: roomId.value,
      isHost, // 传递是否为房主的信息
      socketId: socket.id // 传递socket ID用于身份识别
    }, (response: {
      success: boolean,
      error?: string,
      gameState?: any,
      playerColor?: PlayerColor,
      players?: { black: string, white: string }
    }) => {
      if (response.success) {
        console.log('重连成功，获取到游戏状态:', response)
        
        // 更新玩家颜色和身份
        if (response.playerColor) {
          playerColor.value = response.playerColor
          isHost.value = response.playerColor === 'black'
        }
        
        // 更新游戏状态
        if (response.gameState) {
          board.value = response.gameState.board
          currentPlayer.value = response.gameState.currentPlayer
          lastMove.value = response.gameState.lastMove
          gameStarted.value = response.gameState.gameStarted
          timers.value = response.gameState.timers
          
          // 更新对手状态
          if (response.players) {
            if (response.players.black && response.players.white) {
              opponentJoined.value = true
              // 根据socket ID确定玩家身份
              if (socket.id === response.players.black) {
                playerColor.value = 'black'
                isHost.value = true
              } else if (socket.id === response.players.white) {
                playerColor.value = 'white'
                isHost.value = false
              }
            }
          }
        }
        
        opponentDisconnected.value = false
        ElMessage.success('重连成功')
      } else {
        console.error('重连失败:', response.error)
        ElMessage.error(response.error || '重连失败')
        router.push('/')
      }
      isReconnecting.value = false
    })
  } catch (error) {
    console.error('重连错误:', error)
    ElMessage.error('重连失败')
    isReconnecting.value = false
    router.push('/')
  }
}

// 添加游戏总时长变量
const gameTime = ref(600) // 10分钟

// 修改初始化游戏函数
onMounted(async () => {
  const { roomId: queryRoomId, action } = route.query
  console.log('初始化参数:', { queryRoomId, action })
  
  if (!action) {
    ElMessage.error('无效的游戏参数')
    router.push('/')
    return
  }

  try {
    console.log('连接服务器...')
    await connectSocket()
    const socket = getSocket()
    
    if (!socket) {
      throw new Error('无法连接到服务器')
    }
    console.log('服务器连接成功')

    // 先设置事件监听
    setupGameListeners(socket)
    console.log('事件监听器设置完成')

    // 根据action和roomId处理初始连接
    if (action === 'create') {
      if (queryRoomId) {
        // 房主刷新页面，尝试重连
        console.log('房主刷新页面，尝试重连:', queryRoomId)
        roomId.value = queryRoomId
        playerColor.value = 'black'
        isHost.value = true
        socket.emit('reconnect_game', {
          roomId: queryRoomId,
          isHost: true,
          socketId: socket.id,
          playerColor: 'black'
        }, (response: {
          success: boolean,
          error?: string,
          gameState?: any,
          players?: { black: string, white: string }
        }) => {
          if (response.success) {
            console.log('房主重连成功:', response)
            if (response.gameState) {
              updateGameState(response.gameState)
            }
            if (response.players) {
              opponentJoined.value = !!response.players.white
            }
            ElMessage.success('重连成功')
          } else {
            // 重连失败，重新创建相同房间号的房间
            console.log('重连失败，重新创建房间:', queryRoomId)
            socket.emit('create_room', { 
              roomId: queryRoomId,
              gameTime: 300, 
              firstMove: 'black' 
            }, (createResponse: { success: boolean; roomId?: string; error?: string }) => {
              if (createResponse.success && createResponse.roomId) {
                roomId.value = createResponse.roomId
                playerColor.value = 'black'
                isHost.value = true
                console.log('重新创建房间成功:', createResponse.roomId)
              } else {
                ElMessage.error(createResponse.error || '创建房间失败')
                router.push('/')
              }
            })
          }
        })
      } else {
        // 首次创建新房间
        console.log('首次创建新房间')
        socket.emit('create_room', { 
          gameTime: 300, 
          firstMove: 'black' 
        }, (response: { success: boolean; roomId?: string; error?: string }) => {
          if (response.success && response.roomId) {
            roomId.value = response.roomId
            playerColor.value = 'black'
            isHost.value = true
            // 更新URL，但不触发路由变化
            const newUrl = `${window.location.pathname}?roomId=${response.roomId}&action=create`
            window.history.replaceState({}, '', newUrl)
            console.log('创建房间成功:', response.roomId)
            
            // 自动复制房间号到剪贴板
            navigator.clipboard.writeText(response.roomId)
              .then(() => {
                ElMessage.success('房间号已复制到剪贴板')
                playSound('success')
              })
              .catch(() => ElMessage.warning('自动复制失败，请手动复制'))
          } else {
            ElMessage.error(response.error || '创建房间失败')
            router.push('/')
          }
        })
      }
    } else if (action === 'join') {
      if (!queryRoomId) {
        ElMessage.error('房间号不能为空')
        router.push('/')
        return
      }

      // 加入者刷新页面或新加入
      roomId.value = queryRoomId
      socket.emit('reconnect_game', {
        roomId: queryRoomId,
        isHost: false,
        socketId: socket.id
      }, (response: {
        success: boolean,
        error?: string,
        gameState?: any,
        playerColor?: PlayerColor
      }) => {
        if (response.success) {
          console.log('加入者重连成功:', response)
          if (response.playerColor) {
            playerColor.value = response.playerColor
            isHost.value = response.playerColor === 'black'
          }
          if (response.gameState) {
            updateGameState(response.gameState)
          }
          ElMessage.success('重连成功')
        } else {
          // 重连失败，尝试作为新玩家加入
          console.log('重连失败，尝试加入房间:', queryRoomId)
          socket.emit('join_room', { roomId: queryRoomId }, (joinResponse: {
            success: boolean,
            playerColor?: PlayerColor,
            error?: string,
            gameState?: any
          }) => {
            if (joinResponse.success) {
              console.log('加入房间成功:', joinResponse)
              if (joinResponse.playerColor) {
                playerColor.value = joinResponse.playerColor
                isHost.value = joinResponse.playerColor === 'black'
              }
              if (joinResponse.gameState) {
                updateGameState(joinResponse.gameState)
              }
              ElMessage.success('加入房间成功')
            } else {
              ElMessage.error(joinResponse.error || '加入房间失败')
              router.push('/')
            }
          })
        }
      })
    }

    // 设置断线重连事件
    socket.on('connect', () => {
      console.log('重新连接到服务器')
      if (roomId.value && socket.connected) {
        socket.emit('reconnect_game', {
          roomId: roomId.value,
          isHost: isHost.value,
          socketId: socket.id
        }, (response: {
          success: boolean,
          error?: string,
          gameState?: any,
          playerColor?: PlayerColor
        }) => {
          if (response.success) {
            console.log('断线重连成功:', response)
            if (response.playerColor) {
              playerColor.value = response.playerColor
              isHost.value = response.playerColor === 'black'
            }
            if (response.gameState) {
              updateGameState(response.gameState)
            }
            opponentDisconnected.value = false
            ElMessage.success('重连成功')
          } else {
            console.error('断线重连失败:', response.error)
            ElMessage.error(response.error || '重连失败')
          }
        })
      }
    })

  } catch (error) {
    console.error('游戏初始化错误:', error)
    ElMessage.error(error instanceof Error ? error.message : '游戏初始化失败')
    router.push('/')
  }
})

// 清理
onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    // 基础事件
    socket.off('room_created')
    socket.off('player_joined')
    socket.off('game_started')
    socket.off('opponent_move')
    socket.off('game_over')
    socket.off('game_restarted')
    
    // 重连相关
    socket.off('opponent_disconnected')
    socket.off('opponent_reconnected')
    socket.off('connect_error')
    socket.off('disconnect')
    socket.off('connect')
    
    // 玩家离开相关
    socket.off('opponent_left')
    socket.off('host_left')
    
    // 计时器相关
    socket.off('timer_update')
  }
  
  // 清理所有计时器
  if (reconnectTimer.value) {
    clearInterval(reconnectTimer.value)
    reconnectTimer.value = null
  }
  if (gameTimeInterval) {
    clearInterval(gameTimeInterval)
    gameTimeInterval = null
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
})

// 处理落子
const handleMove = (row: number, col: number) => {
  if (!isMyTurn.value || board.value[row][col] !== null || !gameStarted.value) {
    console.log('无法落子:', { 
      isMyTurn: isMyTurn.value, 
      cellOccupied: board.value[row][col] !== null,
      gameStarted: gameStarted.value,
      currentPlayer: currentPlayer.value,
      playerColor: playerColor.value
    })
    return
  }

  const socket = getSocket()
  if (!socket) {
    ElMessage.error('网络连接已断开')
    return
  }

  console.log('尝试落子:', { row, col, color: playerColor.value })
  socket.emit('make_move', { row, col }, (response: { success: boolean; error?: string }) => {
    if (response.success) {
      console.log('落子成功')
      playSound('place')
    } else {
      console.error('落子失败:', response.error)
      ElMessage.error(response.error || '落子失败')
    }
  })
}

// 认输
const handleSurrender = () => {
  if (gameOver.value) return

  const socket = getSocket()
  if (!socket) {
    ElMessage.error('网络连接已断开')
    return
  }

  if (confirm('确定要认输吗？')) {
    socket.emit('surrender', (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        ElMessage.error(response.error || '操作失败')
      }
    })
  }
}

// 离开游戏
const handleLeaveGame = () => {
  const socket = getSocket()
  if (socket) {
    socket.emit('leave_game')
  }
  router.push('/')
}

// 获取游戏结束消息
const getGameOverMessage = (reason?: string) => {
  if (reason === 'surrender') {
    return winner.value === playerColor.value ? '对手认输了！' : '你认输了。'
  } else if (reason === 'disconnect') {
    return winner.value === playerColor.value ? '对手断开连接超时！' : '你断开连接超时。'
  } else if (reason === 'timeout') {
    return winner.value === playerColor.value ? '对手超时！' : '你超时了。'
  } else if (reason === 'draw') {
    return '游戏平局！'
  } else if (reason === 'leave') {
    return '对手离开了游戏。'
  } else {
    return winner.value === playerColor.value ? '恭喜你获得胜利！' : '对手获得了胜利，再接再厉！'
  }
}

// 获取游戏结束图标
const getGameOverIcon = () => {
  if (winner.value === playerColor.value) {
    return 'fa-trophy'
  } else if (winner.value === null) {
    return 'fa-handshake'
  } else {
    return 'fa-flag'
  }
}

// 获取游戏结束标题
const getGameOverTitle = () => {
  if (winner.value === playerColor.value) {
    return '🎉 游戏胜利'
  } else if (winner.value === null) {
    return '🤝 游戏结束'
  } else {
    return '💪 再接再厉'
  }
}

// 添加状态
const showSettings = ref(false)
const showHistory = ref(false)
const historyRef = ref<InstanceType<typeof GameHistory> | null>(null)
const gameStartTime = ref<number | null>(null)
const moves = ref<Array<{ row: number; col: number; color: PlayerColor }>>([])

// 处理设置保存
const handleSettingsSave = (newSettings: any) => {
  // 更新音效设置
  if (newSettings.soundEnabled) {
    playSound('success')
  }
  showSettings.value = false
}

// 添加游戏时间更新函数
let gameTimeInterval: number | null = null

const startGameTimer = () => {
  if (gameTimeInterval) {
    clearInterval(gameTimeInterval)
  }
  
  gameTimeInterval = window.setInterval(() => {
    if (gameStarted.value && !gameOver.value) {
      gameTime.value++
    }
  }, 1000)
}

// 处理离开房间
const handleLeaveRoom = () => {
  const socket = getSocket()
  if (!socket) {
    ElMessage.error('网络连接已断开')
    return
  }

  socket.emit('leave_room', (response: { success: boolean; error?: string }) => {
    if (response.success) {
      router.push('/')
    } else {
      ElMessage.error(response.error || '离开房间失败')
    }
  })
}

// 游戏结束处理函数
const handleGameOver = (data: { 
  winner: PlayerColor | null, 
  reason: string,
  board: (PlayerColor | null)[][],
  countdown: number
}) => {
  console.log('处理游戏结束:', data)
  gameOver.value = true
  winner.value = data.winner
  board.value = data.board
  gameStarted.value = false

  // 清理之前的倒计时
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }

  // 开始新的倒计时
  countdown.value = data.countdown || 3
  countdownTimer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
      console.log('倒计时:', countdown.value)
    } else {
      // 清理倒计时
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
      
      // 如果游戏已结束且还在当前页面，准备开始新一局
      if (gameOver.value && router.currentRoute.value.path.includes('/online')) {
        console.log('倒计时结束，准备开始新一局')
        prepareNewGame()
      }
    }
  }, 1000)

  // 保存对局记录
  if (gameStartTime.value && historyRef.value) {
    const duration = Math.floor((Date.now() - gameStartTime.value) / 1000)
    historyRef.value.addRecord({
      date: Date.now(),
      blackPlayer: playerColor.value === 'black' ? '我方' : '对手',
      whitePlayer: playerColor.value === 'white' ? '我方' : '对手',
      winner: data.winner,
      duration,
      moves: [...moves.value],
      reason: data.reason
    })
  }

  // 播放音效
  playSound(data.winner === playerColor.value ? 'win' : 'lose')
}

// 准备新一局游戏
const prepareNewGame = () => {
  console.log('准备开始新一局')
  // 重置基本游戏状态
  board.value = Array(15).fill(null).map(() => Array(15).fill(null))
  currentPlayer.value = 'black'
  lastMove.value = null
  gameOver.value = false
  winner.value = null
  moves.value = []
  
  // 重置游戏时间
  gameTime.value = 0
  gameStartTime.value = Date.now()
  
  // 重置倒计时
  countdown.value = 3
  
  // 清理所有计时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  if (gameTimeInterval) {
    clearInterval(gameTimeInterval)
    gameTimeInterval = null
  }
  
  // 发送重新开始游戏请求
  const socket = getSocket()
  if (socket) {
    console.log('发送重新开始游戏请求')
    socket.emit('restart_game', (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log('游戏重新开始成功')
        playSound('success')
        ElMessage.success('新一局游戏开始！')
      } else {
        console.error('重新开始游戏失败:', response.error)
        ElMessage.error(response.error || '重新开始游戏失败')
      }
    })
  }
}

// 添加倒计时变量
const countdown = ref(3)
const countdownTimer = ref<number | null>(null)
</script>

<style scoped>
.online-game {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.game-header {
  padding: 0.8rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  border-radius: 12px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.room-id {
  font-size: 1.2rem;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
  color: var(--primary);
  background: linear-gradient(45deg, var(--primary), #4d94ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 0 0.3rem;
}

.game-time {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  border-radius: 12px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.time-value {
  font-size: 1.2rem;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
  color: #4d94ff;
  background: linear-gradient(45deg, #4d94ff, var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  min-width: 4rem;
  text-align: center;
}

.game-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
}

.player-panel {
  width: 220px;
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  height: fit-content;
}

.player-panel.active {
  box-shadow: 0 0 0 2px var(--primary);
  transform: translateY(-4px);
}

.player-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.waiting-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem;
  font-size: 0.8rem;
  text-align: center;
}

.player-info {
  text-align: center;
  width: 100%;
}

.player-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.player-timer {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Roboto Mono', monospace;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.player-status {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.player-status.thinking {
  color: var(--primary);
  font-weight: 500;
}

.game-board {
  background: #DEB887;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 
    0 0 0 4px #8B4513,
    var(--shadow-lg);
  position: relative;
  transform: scale(0.95);
  margin: 0;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(15, 2rem);
  grid-template-rows: repeat(15, 2rem);
  gap: 0;
  background-color: transparent;
  position: relative;
}

.board-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.3) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 1px, transparent 1px);
  background-size: 2rem 2rem;
  pointer-events: none;
}

.board-cell {
  width: 2rem;
  height: 2rem;
  background: transparent;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-cell:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

/* 添加棋盘标记点 */
.board-cell:nth-child(4):nth-last-child(4)::before,
.board-cell:nth-child(12):nth-last-child(12)::before,
.board-cell:nth-child(4):nth-last-child(12)::before,
.board-cell:nth-child(12):nth-last-child(4)::before,
.board-cell:nth-child(8):nth-last-child(8)::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 添加棋子样式 */
.piece {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  position: absolute;
  transition: all 0.3s ease;
}

.piece.black {
  background: radial-gradient(circle at 35% 35%, #333 0%, #000 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 2px 3px rgba(255, 255, 255, 0.2);
}

.piece.white {
  background: radial-gradient(circle at 35% 35%, #fff 0%, #eee 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 3px rgba(255, 255, 255, 0.8);
}

.piece.last {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 0 0 2px var(--primary);
}

/* 响应式布局优化 */
@media (max-width: 1200px) {
  .game-main {
    gap: 1.5rem;
    padding: 0.8rem;
  }

  .player-panel {
    width: 200px;
    padding: 0.8rem;
  }

  .player-avatar {
    width: 90px;
    height: 90px;
  }

  .board-grid {
    grid-template-columns: repeat(15, 1.8rem);
    grid-template-rows: repeat(15, 1.8rem);
  }

  .board-grid::before {
    background-size: 1.8rem 1.8rem;
  }

  .board-cell {
    width: 1.8rem;
    height: 1.8rem;
  }

  .piece {
    width: 1.6rem;
    height: 1.6rem;
  }
}

@media (max-width: 768px) {
  .game-header {
    padding: 0.5rem 1rem;
  }

  .game-main {
    padding: 0.5rem;
    gap: 1rem;
  }

  .player-panel {
    width: 180px;
    padding: 0.6rem;
  }

  .player-avatar {
    width: 80px;
    height: 80px;
  }

  .board-grid {
    grid-template-columns: repeat(15, 1.6rem);
    grid-template-rows: repeat(15, 1.6rem);
  }

  .board-grid::before {
    background-size: 1.6rem 1.6rem;
  }

  .board-cell {
    width: 1.6rem;
    height: 1.6rem;
  }

  .piece {
    width: 1.4rem;
    height: 1.4rem;
  }
}

.game-over-content {
  text-align: center;
  padding: 1rem;
}

.game-over-icon {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.game-over-icon .fa-trophy {
  color: #FFD700;
}

.game-over-icon .fa-flag {
  color: var(--danger);
}

.game-over-message {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.game-over-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* 移除旧的游戏结束样式 */
.game-over {
  display: none;
}

.restart-message {
  color: var(--primary);
  font-size: 1rem;
  margin: 1rem 0;
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  color: var(--text-primary);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.control-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.control-btn i {
  font-size: 1rem;
}

.control-btn.danger {
  background: linear-gradient(145deg, #ff4d4d, #e60000);
  color: white;
}

.control-btn.danger:hover {
  background: linear-gradient(145deg, #ff6666, #ff0000);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 认输按钮特殊样式 */
.control-btn[title="认输"] {
  background: linear-gradient(145deg, #ff9966, #ff6600);
  color: white;
}

.control-btn[title="认输"]:hover {
  background: linear-gradient(145deg, #ffb380, #ff8533);
}

/* 设置按钮特殊样式 */
.control-btn[title="设置"] {
  background: linear-gradient(145deg, #4d94ff, #0066ff);
  color: white;
}

.control-btn[title="设置"]:hover {
  background: linear-gradient(145deg, #66a3ff, #1a75ff);
}

/* 复制按钮样式 */
.copy-btn {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.3s ease;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  background: rgba(77, 148, 255, 0.1);
  transform: scale(1.1);
}

.copy-btn:active {
  transform: scale(0.95);
}

.copy-btn i {
  font-size: 1rem;
  background: linear-gradient(45deg, var(--primary), #4d94ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style> 