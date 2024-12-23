<template>
  <div class="online-game">
    <div v-if="!roomId && !joined" class="room-controls">
      <button @click="createRoom" class="btn">创建房间</button>
      <div class="join-room">
        <input 
          v-model="joinRoomId" 
          placeholder="输入房间号"
          class="room-input"
        />
        <button @click="joinRoom" class="btn">加入房间</button>
      </div>
    </div>

    <div v-else-if="!joined" class="waiting-room">
      <h2>房间号: {{ roomId }}</h2>
      <p>等待对手加入...</p>
    </div>

    <div v-else class="game-container">
      <game-board
        :board="board"
        :current-player="currentPlayer"
        :can-move="canMove"
        @make-move="makeMove"
      />
      <div class="game-info">
        <p>当前回合: {{ currentPlayer === 'black' ? '黑子' : '白子' }}</p>
        <p>你的颜色: {{ playerColor === 'black' ? '黑子' : '白子' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client'
import GameBoard from './GameBoard.vue'

export default {
  components: { GameBoard },
  
  data() {
    return {
      socket: null,
      roomId: '',
      joinRoomId: '',
      joined: false,
      playerColor: '',
      currentPlayer: 'black',
      board: Array(15).fill(null).map(() => Array(15).fill(null)),
      canMove: false
    }
  },

  computed: {
    canMove() {
      return this.joined && this.currentPlayer === this.playerColor
    }
  },

  mounted() {
    this.socket = io()
    
    this.socket.on('roomCreated', ({ roomId }) => {
      this.roomId = roomId
      this.playerColor = 'black'
    })

    this.socket.on('gameStart', ({ currentPlayer }) => {
      this.joined = true
      this.currentPlayer = currentPlayer
    })

    this.socket.on('moveMade', ({ row, col, color, currentPlayer }) => {
      this.board[row][col] = color
      this.currentPlayer = currentPlayer
    })

    this.socket.on('playerLeft', () => {
      alert('对手已离开游戏')
      this.resetGame()
    })

    this.socket.on('joinError', (message) => {
      alert(message)
    })
  },

  methods: {
    createRoom() {
      this.socket.emit('createRoom')
    },

    joinRoom() {
      if (this.joinRoomId) {
        this.socket.emit('joinRoom', this.joinRoomId)
        this.playerColor = 'white'
      }
    },

    makeMove(row, col) {
      if (this.canMove && !this.board[row][col]) {
        this.socket.emit('makeMove', {
          roomId: this.roomId,
          row,
          col
        })
      }
    },

    resetGame() {
      this.roomId = ''
      this.joined = false
      this.playerColor = ''
      this.currentPlayer = 'black'
      this.board = Array(15).fill(null).map(() => Array(15).fill(null))
    }
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}
</script>

<style scoped>
.online-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.room-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.join-room {
  display: flex;
  gap: 1rem;
}

.room-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}

.waiting-room {
  text-align: center;
}

.game-info {
  margin-top: 1rem;
  text-align: center;
}
</style> 