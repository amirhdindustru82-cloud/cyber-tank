import { useGame } from '../store/gameStore'

export default function HUD() {
  const score = useGame((s) => s.score)
  const highScore = useGame((s) => s.highScore)

  return (
    <div className="hud">
      <div className="hud-card">
        <div className="hud-label">Score</div>
        <div className="hud-value neon">{score}</div>
      </div>
      <div className="hud-card" style={{ textAlign: 'center' }}>
        <div className="hud-label">Best</div>
        <div className="hud-value pink">{highScore}</div>
      </div>
      <div className="hud-card hud-controls">
        <div className="hud-label">Controls</div>
        <div className="hud-keys">
          <span>SPACE</span>
          <span>A / D</span>
        </div>
      </div>
    </div>
  )
}