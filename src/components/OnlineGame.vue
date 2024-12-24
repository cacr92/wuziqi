<template>
  <div class="online-game">
    <!-- 房间选择界面 -->
    <div v-if="!joined" class="room-selection">
      <div class="room-actions">
        <button @click="createRoom" class="action-btn">
          <i class="fas fa-plus"></i>
          创建房间
        </button>
        <div class="join-room">
          <input 
            v-model="joinRoomId"
            type="text"
            placeholder="输入房间号"
            maxlength="6"
          />
          <button @click="joinRoom" :disabled="!joinRoomId" class="action-btn">
            <i class="fas fa-sign-in-alt"></i>
            加入房间
          </button>
        </div>
      </div>
    </div>

    <!-- 等待对手界面 -->
    <div v-else-if="!gameStarted" class="waiting-screen">
      <h3>房间号: {{ roomId }}</h3>
      <p>等待对手加入...</p>
      <div class="loading-spinner"></div>
      <button @click="leaveRoom" class="action-btn">
        <i class="fas fa-sign-out-alt"></i>
        离开房间
      </button>
    </div>

    <!-- 游戏界面 -->
    <div v-else class="game-container">
      <div class="game-info">
        <div class="player-info">
          <span>你的颜色: {{ playerColor === 'black' ? '黑子' : '白子' }}</span>
          <span>当前回合: {{ currentPlayer === 'black' ? '黑子' : '白子' }}</span>
        </div>
        <div class="game-controls">
          <button @click="surrender" class="action-btn danger">
            <i class="fas fa-flag"></i>
            认输
          </button>
          <button @click="leaveRoom" class="action-btn">
            退出游戏
          </button>
        </div>
      </div>

      <game-timer
        :current-player="currentPlayer"
        :game-started="gameStarted"
        :game-over="gameOver"
        @time-up="handleTimeUp"
      />

      <game-board
        :board="board"
        :current-player="currentPlayer"
        :can-move="canMove"
        @make-move="makeMove"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { playSound } from '../utils/audio'
import GameBoard from './GameBoard.vue'  // 添加棋盘组件导入
import GameTimer from './GameTimer.vue'

export default {
  name: 'OnlineGame',
  components: { GameBoard, GameTimer },  // 注册棋盘组件
  
  setup() {
    const socket = ref(null)
    const joined = ref(false)
    const gameStarted = ref(false)
    const roomId = ref('')
    const joinRoomId = ref('')
    const playerColor = ref('')
    const currentPlayer = ref('black')
    const board = ref(Array(15).fill(null).map(() => Array(15).fill(null)))
    const gameOver = ref(false)

    // 添加计算属性判断是否可以落子
    const canMove = computed(() => {
      return gameStarted.value && 
             currentPlayer.value === playerColor.value
    })

    const connectWebSocket = () => {
      socket.value = new WebSocket('ws://localhost:3000')
      
      socket.value.onopen = () => {
        console.log('Connected to game server')
      }
      
      socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleGameEvent(data)
      }
      
      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        alert('连接服务器失败，请刷新页面重试')
      }
      
      socket.value.onclose = () => {
        console.log('Disconnected from game server')
        setTimeout(connectWebSocket, 3000)
      }
    }

    const handleGameEvent = (data) => {
      switch (data.type) {
        case 'roomCreated':
          roomId.value = data.roomId
          playerColor.value = 'black'
          joined.value = true
          break
          
        case 'gameStart':
          gameStarted.value = true
          playSound('click')
          break
          
        case 'moveMade':
          // 更新棋盘状态
          board.value[data.row][data.col] = data.color
          // 更��当前玩家
          currentPlayer.value = data.nextPlayer
          playSound('place')
          break
          
        case 'gameOver':
          alert(data.message)
          leaveRoom()
          break
          
        case 'error':
          alert(data.message)
          break

        case 'playerLeft':
          alert('对手已离开游戏')
          leaveRoom()
          break

        case 'surrender':
          alert(`${data.player === 'black' ? '黑方' : '白方'}认输，${data.player === 'black' ? '白方' : '黑方'}获胜！`)
          gameOver.value = true
          break
          
        case 'timeUp':
          alert(`${data.player === 'black' ? '黑方' : '白方'}超时，${data.player === 'black' ? '白方' : '黑方'}获胜！`)
          gameOver.value = true
          break
      }
    }

    const createRoom = () => {
      socket.value.send(JSON.stringify({
        type: 'createRoom'
      }))
    }

    const joinRoom = () => {
      socket.value.send(JSON.stringify({
        type: 'joinRoom',
        roomId: joinRoomId.value
      }))
    }

    const leaveRoom = () => {
      socket.value.send(JSON.stringify({
        type: 'leaveRoom',
        roomId: roomId.value
      }))
      resetGame()
    }

    const makeMove = ({ row, col }) => {
      if (!canMove.value || board.value[row][col]) return
      
      socket.value.send(JSON.stringify({
        type: 'makeMove',
        roomId: roomId.value,
        row,
        col
      }))

      // 本地立即更新棋盘，不等待服务器响应
      board.value[row][col] = playerColor.value
      playSound('place')
    }

    const resetGame = () => {
      joined.value = false
      gameStarted.value = false
      roomId.value = ''
      joinRoomId.value = ''
      playerColor.value = ''
      currentPlayer.value = 'black'
      board.value = Array(15).fill(null).map(() => Array(15).fill(null))
    }

    const surrender = () => {
      if (!gameStarted.value || gameOver.value) return
      
      if (confirm('确定要认输吗？')) {
        socket.value.send(JSON.stringify({
          type: 'surrender',
          roomId: roomId.value
        }))
      }
    }

    const handleTimeUp = (player) => {
      socket.value.send(JSON.stringify({
        type: 'timeUp',
        roomId: roomId.value,
        player
      }))
    }

    onMounted(() => {
      connectWebSocket()
    })

    onUnmounted(() => {
      if (socket.value) {
        socket.value.close()
      }
    })

    return {
      joined,
      gameStarted,
      roomId,
      joinRoomId,
      playerColor,
      currentPlayer,
      board,
      canMove,  // 导出 canMove
      createRoom,
      joinRoom,
      leaveRoom,
      makeMove,
      surrender,
      handleTimeUp
    }
  }
}
</script>

<style scoped>
.online-game {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.room-selection {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 8px;
}

.room-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.join-room {
  display: flex;
  gap: 0.5rem;
}

.join-room input {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: white;
  color: #4CAF50;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.waiting-screen {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin: 1rem auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.player-info {
  display: flex;
  gap: 1rem;
}

.game-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.game-controls {
  display: flex;
  gap: 0.5rem;
}

.danger {
  background: #dc3545;
  color: white;
}

.danger:hover {
  background: #c82333;
}
</style> 