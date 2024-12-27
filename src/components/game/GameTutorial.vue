<template>
  <div class="tutorial">
    <div class="tutorial-content">
      <div class="tutorial-steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="tutorial-step"
          :class="{ active: currentStep === index }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.content }}</p>
          </div>
        </div>
      </div>
      
      <div class="tutorial-controls">
        <button 
          @click="prevStep" 
          :disabled="currentStep === 0"
          class="nav-btn"
          @mouseenter="playSound('hover')"
        >
          <i class="fas fa-arrow-left"></i>
          上一步
        </button>
        <button 
          @click="nextStep" 
          :class="{ 'finish-btn': isLastStep }"
          class="nav-btn"
          @mouseenter="playSound('hover')"
        >
          {{ isLastStep ? '完成' : '下一步' }}
          <i v-if="!isLastStep" class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { playSound } from '@/utils/audio'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const currentStep = ref(0)

const steps = [
  {
    title: '游戏目标',
    content: '在棋盘上连成五颗相同颜色的棋子即可获胜。棋子可以横向、纵向或斜向连接。'
  },
  {
    title: '落子规则',
    content: '黑子先手，双方轮流在棋盘空位落子。一旦落子，不能移动或删除。'
  },
  {
    title: '游戏模式',
    content: '可以选择与AI对战或在线与其他玩家对战。AI有三个难度级别可供选择。'
  },
  {
    title: '游戏功能',
    content: '游戏提供音效控制、主题切换、游戏统计等功能。在对局中可以认输或返回菜单。'
  }
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)

const nextStep = () => {
  if (isLastStep.value) {
    emit('close')
  } else {
    currentStep.value++
    playSound('place')
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    playSound('place')
  }
}
</script>

<style scoped>
.tutorial {
  max-width: 600px;
  margin: 0 auto;
}

.tutorial-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tutorial-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tutorial-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  opacity: 0.7;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.tutorial-step.active {
  opacity: 1;
  transform: translateX(0);
  background: var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

.step-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.step-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tutorial-controls {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.finish-btn {
  background: var(--primary);
  color: white;
}

@media (max-width: 768px) {
  .tutorial-step {
    padding: 0.75rem;
  }

  .step-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.9rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style> 