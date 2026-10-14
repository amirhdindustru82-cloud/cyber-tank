import { useEffect, useState } from 'react'
import { useGame } from '../store/gameStore'

export default function TouchControls() {
  const gameState = useGame((s) => s.gameState)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isTouch =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 900
      setIsMobile(isTouch || isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const simulateKey = (code) => {
    const event = new KeyboardEvent('keydown', {
      code,
      key: code,
      bubbles: true,
    })
    window.dispatchEvent(event)
  }

  // Swipe detection
  useEffect(() => {
    if (gameState !== 'playing') return
    if (!isMobile) return

    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0

    const handleTouchStart = (e) => {
      const t = e.touches[0]
      touchStartX = t.clientX
      touchStartY = t.clientY
      touchStartTime = Date.now()
    }

    const handleTouchEnd = (e) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartX
      const dy = t.clientY - touchStartY
      const dt = Date.now() - touchStartTime

      if (dt > 600) return
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const minSwipe = 30

      if (absDx < minSwipe && absDy < minSwipe) {
        simulateKey('Space')
        return
      }

      if (absDy > absDx) {
        if (dy < 0) simulateKey('Space')
      } else {
        if (dx > 0) simulateKey('ArrowRight')
        else simulateKey('ArrowLeft')
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState, isMobile])

  if (!isMobile || gameState !== 'playing') return null

  return (
    <>
      {/* 🎯 راهنمای آیکون‌ها - بالای صفحه */}
      <div className="touch-hint">
        <div className="hint-btn hint-left">◀</div>
        <div className="hint-btn hint-up">▲</div>
        <div className="hint-btn hint-right">▶</div>
      </div>

      {/* دکمه‌های پایین - برای راحتی */}
      <div className="touch-controls">
        <button
          className="touch-btn touch-left"
          onTouchStart={(e) => {
            e.preventDefault()
            simulateKey('ArrowLeft')
          }}
        >
          ◀
        </button>

        <button
          className="touch-btn touch-up"
          onTouchStart={(e) => {
            e.preventDefault()
            simulateKey('Space')
          }}
        >
          ▲
        </button>

        <button
          className="touch-btn touch-right"
          onTouchStart={(e) => {
            e.preventDefault()
            simulateKey('ArrowRight')
          }}
        >
          ▶
        </button>
      </div>
    </>
  )
}