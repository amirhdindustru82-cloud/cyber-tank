import { create } from 'zustand'

export const useGame = create((set, get) => ({
  gameState: 'menu',
  score: 0,
  highScore: Number(localStorage.getItem('chickenHigh') || 0),

  start: () => set({ gameState: 'playing', score: 0 }),

  addScore: () => set((s) => ({ score: s.score + 1 })),

  gameOver: () => {
    const { score, highScore } = get()
    if (score > highScore) {
      localStorage.setItem('chickenHigh', score)
      set({ highScore: score })
    }
    set({ gameState: 'gameover' })
  },
}))