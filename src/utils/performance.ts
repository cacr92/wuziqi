export const performance = {
  startTime: 0,
  
  start() {
    this.startTime = performance.now()
  },
  
  end(label: string) {
    const duration = performance.now() - this.startTime
    console.warn(`${label}: ${duration.toFixed(2)}ms`)
  }
} 