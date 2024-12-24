export const toggleTheme = (theme: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark-theme', theme === 'dark')
} 