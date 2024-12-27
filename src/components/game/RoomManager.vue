<template>
  <div class="room-manager">
    <div class="room-container">
      <!-- 标题区域 -->
      <div class="room-header">
        <h2>五子棋对战</h2>
        <p class="subtitle">创建或加入游戏房间开始对战</p>
      </div>

      <!-- 房间操作区域 -->
      <div class="room-content">
        <!-- 左侧：创建房间 -->
        <div class="room-box create-room">
          <div class="box-header">
            <i class="fas fa-plus-circle"></i>
            <h3>创建房间</h3>
            <p>创建新房间并执黑先行</p>
          </div>
          <el-button 
            type="primary" 
            size="large"
            :loading="loading"
            @click="handleCreateRoom"
            class="room-button"
          >
            <i class="fas fa-plus-circle"></i>
            创建新房间
          </el-button>
        </div>

        <!-- 右侧：加入房间 -->
        <div class="room-box join-room">
          <div class="box-header">
            <i class="fas fa-sign-in-alt"></i>
            <h3>加入房间</h3>
            <p>输入房间号执白后行</p>
          </div>
          <div class="join-form">
            <input
              v-model="roomId"
              type="text"
              placeholder="请输入6位房间号"
              maxlength="6"
              class="room-input"
              @keyup.enter="handleJoinRoom"
            />
            <el-button 
              type="primary" 
              size="large"
              :loading="loading"
              @click="handleJoinRoom"
              :disabled="!roomId || roomId.length !== 6"
              class="room-button"
            >
              <i class="fas fa-sign-in-alt"></i>
              加入房间
            </el-button>
          </div>
        </div>
      </div>

      <!-- 创建成功提示 -->
      <el-dialog
        v-model="showCreatedDialog"
        title="房间创建成功"
        width="400px"
        :close-on-click-modal="false"
        :show-close="false"
        center
      >
        <div class="room-created">
          <div class="room-id-card">
            <div class="room-id-title">房间号</div>
            <div class="room-id-number">{{ createdRoomId }}</div>
            <div class="room-id-actions">
              <el-button type="success" size="large" @click="copyRoomId">
                <i class="fas fa-copy"></i>
                复制房间号
              </el-button>
              <el-button type="primary" size="large" @click="shareRoom">
                <i class="fas fa-share-alt"></i>
                分享
              </el-button>
            </div>
          </div>
          <div class="waiting-status">
            <div class="spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="waiting-text">
              <h4>等待玩家加入...</h4>
              <p>将房间号分享给好友即可开始游戏</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.room-manager {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
}

.room-container {
  width: 100%;
  max-width: 1400px;
  margin: 2rem;
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.room-header {
  text-align: center;
  margin-bottom: 4rem;
}

.room-header h2 {
  font-size: 3.5rem;
  margin: 0 0 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.4rem;
  opacity: 0.8;
}

.room-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  margin: 0 auto;
  max-width: 1200px;
}

.room-box {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: 400px;
}

.room-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.box-header {
  text-align: center;
}

.box-header i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.box-header h3 {
  font-size: 2.2rem;
  color: var(--text-primary);
  margin: 0.5rem 0;
  font-weight: 600;
}

.box-header p {
  color: var(--text-secondary);
  font-size: 1.3rem;
  margin: 1rem 0 0;
  opacity: 0.8;
}

.join-form {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.room-input {
  width: 100%;
  height: 80px;
  font-size: 2.5rem;
  text-align: center;
  letter-spacing: 12px;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0 1.5rem;
  transition: all 0.3s ease;
  outline: none;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
}

.room-input:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
}

.room-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
  transform: scale(1.02);
}

.room-button {
  width: 100%;
  max-width: 400px;
  height: 72px;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.room-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--primary-rgb), 0.2);
}

.room-button i {
  font-size: 1.5rem;
}

.room-created {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.room-id-card {
  background: var(--bg-tertiary);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.room-id-title {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.room-id-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 8px;
  margin-bottom: 1.5rem;
  font-family: 'Roboto Mono', monospace;
}

.room-id-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.waiting-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-radius: 12px;
  width: 100%;
}

.spinner {
  font-size: 2rem;
  color: var(--primary);
}

.waiting-text h4 {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin: 0;
}

.waiting-text p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0;
}

@media (max-width: 1200px) {
  .room-content {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .room-container {
    margin: 1rem;
    padding: 2rem;
  }

  .room-header h2 {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .room-box {
    padding: 2rem;
    min-height: 300px;
  }

  .box-header i {
    font-size: 3rem;
  }

  .box-header h3 {
    font-size: 1.8rem;
  }

  .box-header p {
    font-size: 1.1rem;
  }

  .room-input {
    height: 60px;
    font-size: 2rem;
  }

  .room-button {
    height: 56px;
    font-size: 1.2rem;
  }

  .room-id-number {
    font-size: 2.5rem;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { connectSocket, createRoom, joinRoom, getSocket } from '@/utils/socket'

const router = useRouter()
const loading = ref(false)
const roomId = ref('')
const showCreatedDialog = ref(false)
const createdRoomId = ref('')

// 创建房间
const handleCreateRoom = async () => {
  try {
    loading.value = true
    await connectSocket()
    const roomId = await createRoom({ gameTime: 600, firstMove: 'black' })
    if (roomId) {
      createdRoomId.value = roomId
      showCreatedDialog.value = true
      
      // 监听对手加入事件
      const socket = getSocket()
      if (socket) {
        socket.once('opponent_joined', () => {
          router.push(`/game/${roomId}`)
        })
      }
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '创建房间失败')
  } finally {
    loading.value = false
  }
}

// 加入房间
const handleJoinRoom = async () => {
  if (!roomId.value || roomId.value.length !== 6) {
    ElMessage.warning('请输入6位房间号')
    return
  }

  try {
    loading.value = true
    await connectSocket()
    await joinRoom(roomId.value)
    router.push(`/game/${roomId.value}`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加入房间失败')
  } finally {
    loading.value = false
  }
}

// 复制房间号
const copyRoomId = async () => {
  try {
    await navigator.clipboard.writeText(createdRoomId.value)
    ElMessage.success('房间号已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 分享房间
const shareRoom = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: '五子棋对战',
        text: `快来和我一起玩五子棋！房间号：${createdRoomId.value}`,
        url: window.location.href
      })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        ElMessage.error('分享失败')
      }
    }
  } else {
    copyRoomId()
  }
}
</script> 