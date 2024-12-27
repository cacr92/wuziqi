<template>
  <div class="welcome-screen">
    <div class="logo-container">
      <div class="logo-pieces">
        <div class="piece black"></div>
        <div class="piece white"></div>
      </div>
      <h1 class="title">五子棋</h1>
      <p class="subtitle">一个五子棋小游戏对战平台</p>
    </div>

    <div class="game-modes">
      <button class="mode-button ai-mode" @click="startAIGame">
        <div class="icon-container">
          <i class="fas fa-robot"></i>
        </div>
        <div class="button-content">
          <span class="mode-title">人机对战</span>
          <span class="mode-desc">与智能AI对弈</span>
        </div>
      </button>

      <button class="mode-button online-mode" @click="showOnlineOptions = true">
        <div class="icon-container">
          <i class="fas fa-users"></i>
        </div>
        <div class="button-content">
          <span class="mode-title">在线对战</span>
          <span class="mode-desc">与其他玩家对弈</span>
        </div>
      </button>
    </div>

    <div class="bottom-buttons">
      <button class="bottom-button tutorial" @click="showTutorial = true">
        <i class="fas fa-book"></i>
        游戏教程
      </button>
      <button class="bottom-button settings" @click="showSettings = true">
        <i class="fas fa-cog"></i>
        设置
      </button>
    </div>

    <!-- 在线对战选项弹窗 -->
    <el-dialog
      v-model="showOnlineOptions"
      title="选择游戏方式"
      width="300px"
      center
      align-center
    >
      <div class="online-options">
        <button class="online-option create" @click="createRoom">
          <i class="fas fa-plus-circle"></i>
          创建房间
        </button>
        <button class="online-option join" @click="showJoinRoom = true">
          <i class="fas fa-sign-in-alt"></i>
          加入房间
        </button>
      </div>
    </el-dialog>

    <!-- 加入房间弹窗 -->
    <el-dialog
      v-model="showJoinRoom"
      title="加入房间"
      width="300px"
      center
      align-center
    >
      <div class="join-room-form">
        <el-input
          v-model="roomId"
          placeholder="请输入房间号"
          maxlength="6"
          show-word-limit
        />
        <el-button type="primary" @click="joinRoom" :disabled="!roomId">
          加入房间
        </el-button>
      </div>
    </el-dialog>

    <!-- 设置弹窗 -->
    <el-dialog
      v-model="showSettings"
      title="游戏设置"
      width="300px"
      center
      align-center
    >
      <GameSettings @save="handleSettingsSave" />
    </el-dialog>

    <!-- 教程弹窗 -->
    <el-dialog
      v-model="showTutorial"
      title="游戏教程"
      width="300px"
      center
      align-center
    >
      <GameTutorial />
    </el-dialog>
  </div>
</template>

<style scoped>
.welcome-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  gap: 3rem;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeInDown 0.8s ease-out;
  cursor: pointer;
  position: relative;
  padding-top: 4rem;
}

.logo-pieces {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-container:hover .logo-pieces {
  transform: translate(-50%, -8px);
}

.piece {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.piece.black {
  background: radial-gradient(circle at 35% 35%, #333 0%, #000 100%);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 2px 3px rgba(255, 255, 255, 0.2);
  transform: rotate(-15deg);
  animation: floatBlack 4s ease-in-out infinite;
  z-index: 2;
}

.piece.white {
  background: radial-gradient(circle at 35% 35%, #fff 0%, #eee 100%);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 2px 3px rgba(255, 255, 255, 0.8);
  transform: rotate(15deg);
  margin-left: -1rem;
  animation: floatWhite 4s ease-in-out infinite 0.5s;
  z-index: 1;
}

.logo-container:hover .piece.black {
  transform: rotate(15deg) scale(1.1);
}

.logo-container:hover .piece.white {
  transform: rotate(-15deg) scale(1.1);
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1s ease-out;
  position: relative;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0.5rem 0 0;
  animation: fadeIn 1.2s ease-out;
}

.game-modes {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out;
}

.mode-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border: none;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  width: 240px;
}

.mode-button:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 12px rgba(0, 0, 0, 0.15),
    0 3px 6px rgba(0, 0, 0, 0.1);
}

.icon-container {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
}

.ai-mode .icon-container {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.online-mode .icon-container {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.button-content {
  text-align: left;
}

.mode-title {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.mode-desc {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.bottom-buttons {
  display: flex;
  gap: 1rem;
  animation: fadeInUp 1s ease-out;
}

.bottom-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  color: #666;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

.bottom-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.bottom-button i {
  font-size: 1.1rem;
}

.tutorial {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.settings {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.online-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.online-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: 500;
}

.online-option.create {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.online-option.join {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.online-option:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.join-room-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* 动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px) rotate(-15deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(-15deg);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px) rotate(15deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(15deg);
  }
}

/* 添加新的动画关键帧 */
@keyframes floatBlack {
  0%, 100% {
    transform: rotate(-15deg) translateY(0);
  }
  50% {
    transform: rotate(-15deg) translateY(-6px);
  }
}

@keyframes floatWhite {
  0%, 100% {
    transform: rotate(15deg) translateY(0);
  }
  50% {
    transform: rotate(15deg) translateY(-6px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-modes {
    flex-direction: column;
    gap: 1rem;
  }

  .mode-button {
    width: 100%;
    max-width: 300px;
  }

  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .piece {
    width: 2rem;
    height: 2rem;
  }

  .logo-container {
    padding-top: 3.5rem;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .welcome-screen {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  }

  .title {
    color: #e2e8f0;
  }

  .subtitle {
    color: #a0aec0;
  }

  .mode-button {
    background: #2d3748;
  }

  .mode-title {
    color: #e2e8f0;
  }

  .mode-desc {
    color: #a0aec0;
  }

  .bottom-button {
    background: #2d3748;
    color: #e2e8f0;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GameSettings from '../game/GameSettings.vue'
import GameTutorial from '../game/GameTutorial.vue'
import { ElMessage } from 'element-plus'
import { connectSocket } from '@/utils/socket'

const router = useRouter()
const showOnlineOptions = ref(false)
const showJoinRoom = ref(false)
const showSettings = ref(false)
const showTutorial = ref(false)
const roomId = ref('')

const startAIGame = () => {
  router.push('/ai')
}

const createRoom = async () => {
  try {
    // 关闭选项弹窗
    showOnlineOptions.value = false
    
    // 显示加载提示
    ElMessage.info('正在创建房间...')
    
    // 确保socket连接
    await connectSocket()
    
    // 导航到在线游戏页面
    await router.push({
      path: '/online/game',
      query: {
        action: 'create',
        timestamp: Date.now() // 添加时间戳防止缓存
      }
    })
  } catch (error) {
    console.error('创建房间失败:', error)
    ElMessage.error('创建房间失败，请重试')
  }
}

const joinRoom = async () => {
  try {
    if (!roomId.value) {
      ElMessage.warning('请输入房间号')
      return
    }
    
    // 关闭加入房间弹窗
    showJoinRoom.value = false
    
    // 显示加载提示
    ElMessage.info('正在加入房间...')
    
    // 确保socket连接
    await connectSocket()
    
    // 导航到在线游戏页面
    await router.push({
      path: '/online/game',
      query: {
        action: 'join',
        roomId: roomId.value.toUpperCase(),
        timestamp: Date.now() // 添加时间戳防止缓存
      }
    })
  } catch (error) {
    console.error('加入房间失败:', error)
    ElMessage.error('加入房间失败，请重试')
  }
}

const handleSettingsSave = () => {
  showSettings.value = false
  ElMessage.success('设置已保存')
}
</script>