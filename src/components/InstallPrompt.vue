<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="prompt-content">
      <p>添加到主屏幕以获得最佳体验</p>
      <button @click="installPWA" class="install-btn">立即安装</button>
      <button @click="dismissPrompt" class="dismiss-btn">稍后再说</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showInstallPrompt: false,
      deferredPrompt: null
    }
  },
  mounted() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallPrompt = true
    })
  },
  methods: {
    async installPWA() {
      if (!this.deferredPrompt) return
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      this.showInstallPrompt = false
      this.deferredPrompt = null
    },
    dismissPrompt() {
      this.showInstallPrompt = false
    }
  }
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.prompt-content {
  text-align: center;
}

.install-btn, .dismiss-btn {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
}

.install-btn {
  background: var(--primary-color);
  color: white;
}

.dismiss-btn {
  background: #f5f5f5;
  color: var(--text-color);
}
</style> 