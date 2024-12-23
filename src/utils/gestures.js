export function setupGestures(element, handlers) {
  let startX = 0
  let startY = 0
  let isMoving = false
  
  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    isMoving = false
  })
  
  element.addEventListener('touchmove', (e) => {
    if (!isMoving) {
      const deltaX = e.touches[0].clientX - startX
      const deltaY = e.touches[0].clientY - startY
      
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isMoving = true
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 水平滑动
          if (deltaX > 0 && handlers.swipeRight) {
            handlers.swipeRight()
          } else if (deltaX < 0 && handlers.swipeLeft) {
            handlers.swipeLeft()
          }
        } else {
          // 垂直滑动
          if (deltaY > 0 && handlers.swipeDown) {
            handlers.swipeDown()
          } else if (deltaY < 0 && handlers.swipeUp) {
            handlers.swipeUp()
          }
        }
      }
    }
  })
} 