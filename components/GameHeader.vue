<template>
  <header class="game-header">
    <div class="game-logo">
      <img src="/assets/logo.png" alt="五子棋" class="logo-img">
      <h1 class="logo-text">五子棋</h1>
    </div>
    <div class="game-actions">
      <button class="action-btn" @click="$emit('settings')">
        <i class="fa-solid fa-gear"></i>
      </button>
      <button class="action-btn" @click="$emit('help')">
        <i class="fa-solid fa-question"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 1rem;
}

.game-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--background-color);
  color: var(--text-color);
  font-size: 1.2rem;
  transition: all 0.3s;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}
</style> 