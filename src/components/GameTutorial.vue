<template>
  <div class="tutorial" v-if="show">
    <div class="tutorial-content">
      <div class="tutorial-header">
        <h3>游戏教程</h3>
        <button class="close-btn" @click="closeTutorial">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="tutorial-steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="tutorial-step"
          :class="{ active: currentStep === index }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.content }}</p>
          </div>
        </div>
      </div>
      
      <div class="tutorial-controls">
        <button 
          @click="prevStep" 
          :disabled="currentStep === 0"
          class="nav-btn"
        >
          <i class="fas fa-arrow-left"></i>
          上一步
        </button>
        <button 
          @click="nextStep" 
          :class="{ 'finish-btn': isLastStep }"
          class="nav-btn"
        >
          {{ isLastStep ? '完成' : '下一步' }}
          <i v-if="!isLastStep" class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'GameTutorial',
  
  props: {
    show: Boolean
  },
  
  setup(props, { emit }) {
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
        closeTutorial()
      } else {
        currentStep.value++
      }
    }
    
    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    const closeTutorial = () => {
      emit('close')
      currentStep.value = 0
    }
    
    return {
      currentStep,
      steps,
      isLastStep,
      nextStep,
      prevStep,
      closeTutorial
    }
  }
}
</script>

<style scoped>
.tutorial {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.tutorial-content {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tutorial-steps {
  margin-bottom: 1.5rem;
}

.tutorial-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  opacity: 0.5;
  transition: all 0.3s;
}

.tutorial-step.active {
  opacity: 1;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.tutorial-controls {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.finish-btn {
  background: #4CAF50;
}

@media (max-width: 768px) {
  .tutorial-content {
    padding: 1rem;
  }
  
  .tutorial-step {
    padding: 0.75rem;
  }
}
</style> 