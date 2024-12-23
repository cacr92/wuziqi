<template>
  <div v-if="showUpdatePrompt" class="update-prompt">
    <div class="prompt-content">
      <i class="fa-solid fa-arrows-rotate"></i>
      <span>发现新版本</span>
      <button @click="updateApp" class="update-btn">
        立即更新
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpdatePrompt',
  data() {
    return {
      showUpdatePrompt: false,
      registration: null
    }
  },
  async mounted() {
    if ('serviceWorker' in navigator) {
      this.registration = await navigator.serviceWorker.ready
      
      // 监听更新
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdatePrompt = true
          }
        })
      })
    }
  },
  methods: {
    async updateApp() {
      if (!this.registration) return
      
      this.showUpdatePrompt = false
      await this.registration.update()
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.update-prompt {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.update-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
}

@keyframes slideDown {
  from { transform: translate(-50%, -100%); }
  to { transform: translate(-50%, 0); }
}
</style> 