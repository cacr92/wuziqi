import { ref } from 'vue'
import type { Board, Move, Difficulty } from '@/types'
import { AI } from '@/utils/ai'

export function useAI() {
  const ai = ref(new AI())
  const isThinking = ref(false)
  
  const getAIMove = async (board: Board, difficulty: Difficulty): Promise<Move> => {
    isThinking.value = true
    try {
      const move = await ai.value.getMove(board, difficulty)
      return move
    } finally {
      isThinking.value = false
    }
  }
  
  return {
    isThinking,
    getAIMove
  }
} 