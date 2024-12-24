const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    '--text-primary': '#333333',
    '--text-secondary': '#666666',
    '--border-color': '#dddddd',
    '--accent-color': '#4CAF50',
    '--board-color': '#DCB35C',
    '--hover-color': 'rgba(0, 0, 0, 0.1)'
  },
  dark: {
    '--bg-primary': '#1a1a1a',
    '--bg-secondary': '#2d2d2d',
    '--text-primary': '#ffffff',
    '--text-secondary': '#cccccc',
    '--border-color': '#404040',
    '--accent-color': '#4CAF50',
    '--board-color': '#8B7355',
    '--hover-color': 'rgba(255, 255, 255, 0.1)'
  }
}

export function setTheme(themeName) {
  const theme = themes[themeName]
  if (!theme) return
  
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
  
  localStorage.setItem('theme', themeName)
}

export function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light'
  setTheme(savedTheme)
  return savedTheme
}

export function toggleTheme(currentTheme) {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
  return newTheme
} 