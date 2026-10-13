import { motion } from 'framer-motion'
import { useGame } from '../store/gameStore'

export default function GameOver() {
  const score = useGame((s) => s.score)
  const highScore = useGame((s) => s.highScore)
  const start = useGame((s) => s.start)
  const isNewRecord = score >= highScore && score > 0

  return (
    <motion.div
      className="menu-overlay gameover-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="menu-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      >
        <h1 className="menu-title danger">SPLAT!</h1>
        <div style={{ fontSize: 60, margin: '10px 0' }}>ðŸš—ðŸ’¥ðŸ”</div>
        {isNewRecord && (
          <motion.p
            className="new-record"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            NEW RECORD
          </motion.p>
        )}
        <p className="menu-sub">Roads Crossed</p>
        <div className="hud-value neon" style={{ fontSize: 80, margin: '20px 0 32px' }}>
          {score}
        </div>
        <motion.button
          className="btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={start}
        >
          TRY AGAIN
        </motion.button>
        <p className="menu-best">BEST - {highScore}</p>
      </motion.div>
    </motion.div>
  )
}