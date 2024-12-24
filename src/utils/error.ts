import type { App } from 'vue'

export function registerErrorHandler(app: App) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.error('Component:', instance)
    console.error('Info:', info)
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
  })
} 