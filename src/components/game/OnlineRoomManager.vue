<template>
  <div class="room-manager">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <el-button @click="$router.push('/')" type="text">
        <i class="fas fa-arrow-left"></i>
        返回主菜单
      </el-button>
      <h1 class="page-title">创建或加入游戏房间</h1>
      <div class="nav-right">
        <el-button @click="showSettings = true" type="text">
          <i class="fas fa-cog"></i>
          设置
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <div class="room-options">
        <!-- 创建房间选项 -->
        <div class="room-option" @click="handleCreateRoom">
          <div class="option-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="option-content">
            <h3>创建房间</h3>
            <p>创建新房间并执黑先行</p>
          </div>
        </div>

        <!-- 加入房间选项 -->
        <div class="room-option" @click="showJoinDialog = true">
          <div class="option-icon">
            <i class="fas fa-sign-in-alt"></i>
          </div>
          <div class="option-content">
            <h3>加入房间</h3>
            <p>输入房间号执白后行</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加入房间对话框 -->
    <el-dialog
      v-model="showJoinDialog"
      title="加入房间"
      width="360px"
      center
    >
      <el-input
        v-model="joinRoomId"
        placeholder="请输入6位房间号"
        maxlength="6"
        :show-word-limit="true"
        style="margin-bottom: 20px;"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showJoinDialog = false">取消</el-button>
          <el-button type="primary" @click="handleJoinRoom">加入</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="游戏设置"
      width="360px"
      center
    >
      <GameSettings @save="handleSettingsSave" />
    </el-dialog>
  </div>
</template>

<style scoped>
.room-manager {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.nav-header {
  background: var(--bg-secondary);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin: 0;
}

.nav-right {
  min-width: 80px; /* 保持左右对称 */
}

.content-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.room-options {
  display: flex;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.room-option {
  width: 280px;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-color);
}

.room-option:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.option-content {
  flex: 1;
}

.option-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.option-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .room-options {
    flex-direction: column;
    padding: 1rem;
  }

  .room-option {
    width: 100%;
  }

  .nav-header {
    padding: 1rem;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import GameSettings from './GameSettings.vue'

const router = useRouter()
const showJoinDialog = ref(false)
const showSettings = ref(false)
const joinRoomId = ref('')

// 处理创建房间
const handleCreateRoom = () => {
  router.push(`/online/game?action=create`)
}

// 处理加入房间
const handleJoinRoom = () => {
  if (!joinRoomId.value || joinRoomId.value.length !== 6) {
    ElMessage.warning('请输入6位房间号')
    return
  }
  router.push(`/online/game?roomId=${joinRoomId.value}&action=join`)
}

// 处理设置保存
const handleSettingsSave = () => {
  showSettings.value = false
}
</script> 