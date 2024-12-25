const THEME_KEY = 'theme'

export const initTheme = (): boolean => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
  
  if (isDark) {
    document.documentElement.classList.add('dark-theme')
  }
  
  return isDark
}

export const toggleTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
  }
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
} 