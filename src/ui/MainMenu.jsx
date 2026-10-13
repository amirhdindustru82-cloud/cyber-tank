import { motion } from 'framer-motion'
import { useGame } from '../store/gameStore'

export default function MainMenu() {
  const start = useGame((s) => s.start)
  const highScore = useGame((s) => s.highScore)

  return (
    <motion.div
      className="menu-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="menu-card"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <motion.h1
          className="menu-title"
          initial={{ letterSpacing: '20px' }}
          animate={{ letterSpacing: '8px' }}
          transition={{ duration: 1.2 }}
        >
          CROSSY CHICKEN
        </motion.h1>
        <p className="menu-sub">Cross roads - Dodge cars</p>
        <div style={{ fontSize: 60, margin: '20px 0' }}>ðŸ”</div>
        <motion.button
          className="btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={start}
        >
          START
        </motion.button>
        <div className="menu-info">
          <div>
            <span>HIGH SCORE</span>
            <strong>{highScore}</strong>
          </div>
          <div>
            <span>CONTROLS</span>
            <strong>SPACE + A/D</strong>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}