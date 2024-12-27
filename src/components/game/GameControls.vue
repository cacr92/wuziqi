<template>
  <div class="game-controls">
    <div class="controls-group">
      <button 
        class="control-btn"
        :class="{ disabled: !canUndo }"
        :disabled="!canUndo"
        @click="$emit('undo')"
        @mouseenter="playSound('hover')"
      >
        <i class="fas fa-undo"></i>
        <span>悔棋</span>
        <kbd v-if="canUndo">Z</kbd>
      </button>

      <button 
        class="control-btn"
        @click="$emit('restart')"
        @mouseenter="playSound('hover')"
      >
        <i class="fas fa-redo"></i>
        <span>重新开始</span>
        <kbd>R</kbd>
      </button>
    </div>

    <div class="controls-group">
      <button 
        class="control-btn danger"
        :class="{ disabled: gameOver }"
        :disabled="gameOver"
        @click="handleSurrender"
        @mouseenter="playSound('hover')"
      >
        <i class="fas fa-flag"></i>
        <span>认输</span>
      </button>

      <button 
        class="control-btn secondary"
        @click="handleBack"
        @mouseenter="playSound('hover')"
      >
        <i class="fas fa-arrow-left"></i>
        <span>返回菜单</span>
        <kbd>Esc</kbd>
      </button>
    </div>

    <!-- 音量控制 -->
    <div class="volume-control">
      <button 
        class="control-btn icon-only"
        @click="toggleMute"
        @mouseenter="playSound('hover')"
      >
        <i class="fas" :class="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
      </button>
      <input 
        type="range" 
        min="0" 
        max="100" 
        v-model="volume"
        class="volume-slider"
      >
    </div>

    <!-- 确认弹窗 -->
    <GameModal 
      v-if="showConfirm"
      :title="confirmTitle"
      @close="showConfirm = false"
    >
      <p>{{ confirmMessage }}</p>
      <div class="modal-actions">
        <button 
          class="primary-btn"
          @click="handleConfirm"
        >
          确定
        </button>
        <button 
          class="secondary-btn"
          @click="showConfirm = false"
        >
          取消
        </button>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { playSound, isMuted, toggleMute, setVolume } from '@/utils/audio.ts'
import GameModal from '../common/Modal.vue'

const props = defineProps<{
  canUndo: boolean
  gameOver: boolean
}>()

const emit = defineEmits<{
  (e: 'undo'): void
  (e: 'restart'): void
  (e: 'surrender'): void
  (e: 'back'): void
}>()

const router = useRouter()

// 确认弹窗状态
const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<() => void>(() => {})

// 音量控制
const volume = ref(100)

// 监听音量变化
watch(volume, (newVolume) => {
  setVolume(newVolume / 100)
  playSound('hover')
})

const handleSurrender = () => {
  showConfirm.value = true
  confirmTitle.value = '确认认输'
  confirmMessage.value = '确定要认输吗？'
  confirmAction.value = () => {
    emit('surrender')
    showConfirm.value = false
  }
}

const handleBack = () => {
  if (!props.gameOver) {
    showConfirm.value = true
    confirmTitle.value = '确认返回'
    confirmMessage.value = '当前游戏尚未结束，确定要返回菜单吗？'
    confirmAction.value = () => {
      emit('back')
      showConfirm.value = false
    }
  } else {
    emit('back')
  }
}

const handleConfirm = () => {
  confirmAction.value()
}

// 键盘快捷键
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'z' && props.canUndo) {
    emit('undo')
  } else if (e.key === 'r') {
    emit('restart')
  } else if (e.key === 'Escape') {
    handleBack()
  }
}
</script>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-group h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0;
}

.control-buttons {
  display: grid;
  gap: 0.75rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.control-btn:hover:not(:disabled) {
  background: var(--hover-color);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-tertiary);
  color: var(--disabled-color);
}

.control-btn i {
  font-size: 1.1rem;
  opacity: 0.8;
}

.control-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.control-btn.primary:hover:not(:disabled) {
  background: var(--primary);
  opacity: 0.9;
}

.control-btn.warning {
  background: var(--warning);
  color: white;
  border-color: var(--warning);
}

.control-btn.warning:hover:not(:disabled) {
  background: var(--warning);
  opacity: 0.9;
}

.control-btn.danger {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

.control-btn.danger:hover:not(:disabled) {
  background: var(--danger);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls {
    padding: 1rem;
  }

  .control-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  transition: transform 0.2s;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .control-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  kbd {
    display: none;
  }
}
</style> 