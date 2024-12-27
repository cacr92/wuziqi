<template>
  <div class="version-info">
    <span>v1.0.0</span>
    <a 
      href="https://github.com/cacr92/wuziqi" 
      target="_blank"
      rel="noopener noreferrer"
      class="github-link"
      title="在 GitHub 上查看源码"
    >
      <i class="fab fa-github"></i>
    </a>
  </div>
</template>

<style scoped>
.version-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-size: 0.9rem;
  box-shadow: var(--shadow-sm);
}

.github-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.github-link:hover {
  color: var(--text-primary);
}

.github-link i {
  font-size: 1.1rem;
}
</style> 