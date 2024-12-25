<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <div class="brand">
        <div class="brand-logo">
          <div class="logo-ring"></div>
          <div class="logo-piece"></div>
        </div>
        <h1 class="brand-text">
          <span class="brand-title">五子棋</span>
          <span class="brand-subtitle">GOBANG</span>
        </h1>
      </div>

      <div class="menu">
        <button class="menu-btn primary" @click="emit('start', 'pve')">
          <div class="btn-content">
            <div class="btn-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="btn-text">
              <span class="btn-title">人机对战</span>
              <span class="btn-desc">挑战AI对手</span>
            </div>
          </div>
        </button>

        <button class="menu-btn" @click="emit('start', 'online')">
          <div class="btn-content">
            <div class="btn-icon">
              <i class="fas fa-globe"></i>
            </div>
            <div class="btn-text">
              <span class="btn-title">在线对战</span>
              <span class="btn-desc">全球玩家匹配</span>
            </div>
          </div>
        </button>
      </div>

      <nav class="quick-actions">
        <button class="action-btn" @click="emit('tutorial')">
          <i class="fas fa-graduation-cap"></i>
          <span>教程</span>
        </button>
        <button class="action-btn" @click="emit('settings')">
          <i class="fas fa-cog"></i>
          <span>设置</span>
        </button>
        <button class="action-btn" @click="emit('stats')">
          <i class="fas fa-trophy"></i>
          <span>统计</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'start', mode: 'pve' | 'online'): void
  (e: 'tutorial'): void
  (e: 'settings'): void
  (e: 'stats'): void
}>()
</script>

<style scoped>
.welcome-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0f172a;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.welcome-screen::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(56, 189, 248, 0.1) 0%,
    rgba(56, 189, 248, 0) 70%
  );
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.welcome-content {
  width: min(90%, 400px);
  display: flex;
  flex-direction: column;
  gap: 3rem;
  z-index: 1;
}

.brand {
  text-align: center;
}

.brand-logo {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
}

.logo-ring {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(56, 189, 248, 0.2);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

.logo-ring::before {
  content: '';
  position: absolute;
  inset: -4px;
  border: 4px solid transparent;
  border-top-color: #38bdf8;
  border-radius: 50%;
}

.logo-piece {
  position: absolute;
  width: 40px;
  height: 40px;
  background: #38bdf8;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(to right, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(56, 189, 248, 0.3));
}

.brand-subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.5em;
  color: #64748b;
}

.menu {
  display: grid;
  gap: 1rem;
}

.menu-btn {
  position: relative;
  width: 100%;
  padding: 1.25rem;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  transition: all 0.3s ease;
}

.menu-btn::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 15px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.03), transparent);
  z-index: -1;
}

.menu-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
}

.menu-btn.primary {
  background: linear-gradient(135deg, #38bdf8, #818cf8);
}

.menu-btn.primary::before {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 1.25rem;
  color: white;
}

.btn-text {
  text-align: left;
  color: white;
}

.btn-title {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.btn-desc {
  display: block;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #64748b;
  transition: all 0.2s ease;
}

.action-btn i {
  font-size: 1.25rem;
}

.action-btn span {
  font-size: 0.75rem;
}

.action-btn:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  transform: translateY(-2px);
}

@media (max-height: 600px) {
  .welcome-content {
    gap: 2rem;
  }

  .brand-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }

  .logo-piece {
    width: 32px;
    height: 32px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .menu-btn {
    padding: 1rem;
  }

  .btn-icon {
    width: 36px;
    height: 36px;
  }
}
</style>