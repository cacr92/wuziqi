export const validateRoomId = (roomId: string): boolean => {
  return /^[a-z0-9]{6}$/.test(roomId)
}

export const validateUsername = (username: string): boolean => {
  return username.length >= 2 && username.length <= 12
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
} 