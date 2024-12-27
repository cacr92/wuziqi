<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="handleClose">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="handleClose" title="关闭">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { playSound } from '@/utils/audio'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  playSound('click')
  emit('close')
}

// 处理 ESC 键关闭
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEsc)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--mask-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--hover-color);
  color: var(--text-primary);
}

.close-btn:active {
  background: var(--active-color);
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }
}
</style> 