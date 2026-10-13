# ==============================================
# CROSSY CHICKEN - Simple & Working Version
# ==============================================

Write-Host "Setting up CROSSY CHICKEN (simple version)..." -ForegroundColor Cyan

# ========== CONSTANTS ==========
$constants = @'
export const ROAD_DEPTH = 3
export const ROAD_WIDTH = 40
export const LANE_X = [-6, 0, 6]
export const JUMP_DURATION = 0.28
export const JUMP_HEIGHT = 2
export const VISIBLE_ROADS = 15
export const DESPAWN_Z = 12
'@
[System.IO.File]::WriteAllText("$pwd\src\constants.js", $constants)

# ========== STORE ==========
$store = @'
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
'@
[System.IO.File]::WriteAllText("$pwd\src\store\gameStore.js", $store)

Write-Host "  [OK] constants + store" -ForegroundColor Green

# ========== CHICKEN ==========
$chicken = @'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/gameStore'
import { ROAD_DEPTH, LANE_X, JUMP_DURATION, JUMP_HEIGHT } from '../constants'

export default function Chicken() {
  const group = useRef()
  const laneIndex = useRef(1)
  const isJumping = useRef(false)
  const jumpStart = useRef(0)
  const jumpFrom = useRef(new THREE.Vector3(0, 0.4, 0))
  const jumpTo = useRef(new THREE.Vector3(0, 0.4, 0))

  const addScore = useGame((s) => s.addScore)
  const gameState = useGame((s) => s.gameState)

  useEffect(() => {
    if (group.current) {
      group.current.position.set(LANE_X[1], 0.4, 0)
    }
    laneIndex.current = 1
  }, [gameState])

  useEffect(() => {
    const startJump = (targetX, targetZ) => {
      if (!group.current) return
      isJumping.current = true
      jumpStart.current = performance.now()
      jumpFrom.current.copy(group.current.position)
      jumpTo.current.set(targetX, 0.4, targetZ)
    }

    const down = (e) => {
      if (gameState !== 'playing') return
      if (isJumping.current) return
      if (!group.current) return

      const p = group.current.position

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        startJump(LANE_X[laneIndex.current], p.z - ROAD_DEPTH)
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        const newLane = Math.max(0, laneIndex.current - 1)
        if (newLane !== laneIndex.current) {
          laneIndex.current = newLane
          startJump(LANE_X[newLane], p.z)
        }
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        const newLane = Math.min(2, laneIndex.current + 1)
        if (newLane !== laneIndex.current) {
          laneIndex.current = newLane
          startJump(LANE_X[newLane], p.z)
        }
      }
    }

    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [gameState])

  useFrame(() => {
    if (!group.current || gameState !== 'playing') return
    if (!isJumping.current) return

    const now = performance.now()
    const t = Math.min(1, (now - jumpStart.current) / (JUMP_DURATION * 1000))

    const x = THREE.MathUtils.lerp(jumpFrom.current.x, jumpTo.current.x, t)
    const z = THREE.MathUtils.lerp(jumpFrom.current.z, jumpTo.current.z, t)
    const y = 0.4 + Math.sin(t * Math.PI) * JUMP_HEIGHT

    group.current.position.set(x, y, z)

    if (t >= 1) {
      isJumping.current = false
      group.current.position.y = 0.4
      if (jumpTo.current.z < jumpFrom.current.z) {
        addScore()
      }
    }
  })

  return (
    <group ref={group} name="player">
      {/* body */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.9]} />
        <meshStandardMaterial color="#fff5e0" emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 0.55, 0.15]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#fff5e0" emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      {/* comb */}
      <mesh position={[0, 0.9, 0.15]}>
        <boxGeometry args={[0.15, 0.25, 0.35]} />
        <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={1.5} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.15, 0.6, 0.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0.15, 0.6, 0.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* beak */}
      <mesh position={[0, 0.5, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.25, 4]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1} />
      </mesh>
      {/* tail */}
      <mesh position={[0, 0.15, -0.5]}>
        <boxGeometry args={[0.45, 0.45, 0.15]} />
        <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={1} />
      </mesh>
      {/* legs */}
      <mesh position={[-0.15, -0.45, 0.1]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>
      <mesh position={[0.15, -0.45, 0.1]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>
      <pointLight position={[0, 0.3, 0]} color="#ffaa00" intensity={2} distance={4} />
    </group>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\components\Chicken.jsx", $chicken)

Write-Host "  [OK] Chicken.jsx" -ForegroundColor Green

# ========== ENEMY CAR ==========
$car = @'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/gameStore'

export default function EnemyCar({ z, laneX, speed, direction, color, scene }) {
  const group = useRef()
  const gameOver = useGame((s) => s.gameOver)
  const gameState = useGame((s) => s.gameState)

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.position.x += speed * direction * delta

    if (group.current.position.x > 24) group.current.position.x = -24
    if (group.current.position.x < -24) group.current.position.x = 24

    if (gameState === 'playing' && scene) {
      const player = scene.getObjectByName('player')
      if (player) {
        const p = player.position
        const c = group.current.position
        const dx = Math.abs(p.x - c.x)
        const dz = Math.abs(p.z - c.z)
        if (dx < 1.15 && dz < 1.7 && p.y < 1.0) {
          gameOver()
        }
      }
    }
  })

  return (
    <group ref={group} position={[laneX, 0.5, z]}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.6, 2.4]} />
        <meshStandardMaterial
          color="#0a0018"
          metalness={0.9}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.6, 0.6, 2.4)]} />
        <lineBasicMaterial color={color} />
      </lineSegments>
      <mesh position={[0, 0.4, -0.2]}>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0, 0.35, 0.45]}>
        <boxGeometry args={[1.1, 0.35, 0.05]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      <pointLight color={color} intensity={2} distance={5} />
    </group>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\components\EnemyCar.jsx", $car)

Write-Host "  [OK] EnemyCar.jsx" -ForegroundColor Green

# ========== ROAD ==========
$road = @'
import { useMemo } from 'react'
import EnemyCar from './EnemyCar'
import { ROAD_WIDTH, LANE_X } from '../constants'

const COLORS = ['#ff3366', '#ffdd00', '#00ff88', '#b026ff', '#00fff7']

export default function Road({ z, difficulty, scene }) {
  const cars = useMemo(() => {
    const result = []
    // انتخاب 1 یا 2 lane تصادفی
    const usedLanes = new Set()
    const laneCount = Math.random() > 0.3 ? 2 : 1

    for (let i = 0; i < laneCount; i++) {
      let lane
      let attempts = 0
      do {
        lane = Math.floor(Math.random() * 3)
        attempts++
      } while (usedLanes.has(lane) && attempts < 5)
      usedLanes.add(lane)

      const direction = Math.random() > 0.5 ? 1 : -1
      const speed = 4 + Math.random() * (2 + difficulty * 0.7)
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      result.push({
        id: `${z}-${lane}-${Math.random()}`,
        laneX: LANE_X[lane],
        speed,
        direction,
        color,
      })
    }
    return result
  }, [z, difficulty])

  return (
    <group>
      {/* asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, 2.9]} />
        <meshStandardMaterial color="#141425" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* dashed center lines */}
      {[-4.8, 0, 4.8].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.25, 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z - 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.15]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z + 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.15]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>

      {cars.map((car) => (
        <EnemyCar
          key={car.id}
          z={z}
          laneX={car.laneX}
          speed={car.speed}
          direction={car.direction}
          color={car.color}
          scene={scene}
        />
      ))}
    </group>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\components\Road.jsx", $road)

Write-Host "  [OK] Road.jsx" -ForegroundColor Green

# ========== SPAWNER ==========
$spawner = @'
import { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGame } from '../store/gameStore'
import Road from './Road'
import { ROAD_DEPTH, VISIBLE_ROADS, DESPAWN_Z } from '../constants'

export default function Spawner() {
  const { scene } = useThree()
  const [roads, setRoads] = useState([])
  const lastZ = useRef(0)
  const score = useGame((s) => s.score)
  const gameState = useGame((s) => s.gameState)

  // ساخت جاده‌های اولیه وقتی بازی شروع می‌شه
  useEffect(() => {
    if (gameState !== 'playing') {
      setRoads([])
      return
    }
    const initial = Array.from({ length: VISIBLE_ROADS }, (_, i) => ({
      id: `init-${i}-${Date.now()}`,
      z: -i * ROAD_DEPTH,
    }))
    setRoads(initial)
    lastZ.current = -VISIBLE_ROADS * ROAD_DEPTH
  }, [gameState])

  // اضافه کردن جاده جدید با هر پرش
  useEffect(() => {
    if (gameState !== 'playing') return
    if (roads.length === 0) return

    setRoads((prev) => {
      if (prev.length === 0) return prev
      const newRoad = {
        id: `road-${Date.now()}-${Math.random()}`,
        z: lastZ.current,
      }
      lastZ.current -= ROAD_DEPTH

      const playerZ = -score * ROAD_DEPTH
      const filtered = prev.filter((r) => r.z > playerZ + DESPAWN_Z)

      return [...filtered, newRoad]
    })
  }, [score])

  const difficulty = Math.min(score / 15, 6)

  return (
    <>
      {roads.map((road) => (
        <Road
          key={road.id}
          z={road.z}
          difficulty={difficulty}
          scene={scene}
        />
      ))}
    </>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\components\Spawner.jsx", $spawner)

Write-Host "  [OK] Spawner.jsx" -ForegroundColor Green

# ========== CAMERA RIG ==========
$camera = @'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function CameraRig() {
  const { camera, scene } = useThree()
  const target = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const player = scene.getObjectByName('player')
    if (!player) return

    const p = player.position
    const desiredX = p.x * 0.4
    const desiredY = 9
    const desiredZ = p.z + 11

    camera.position.x += (desiredX - camera.position.x) * delta * 5
    camera.position.y += (desiredY - camera.position.y) * delta * 5
    camera.position.z += (desiredZ - camera.position.z) * delta * 5

    target.current.set(p.x * 0.6, 0.5, p.z - 4)
    camera.lookAt(target.current)
  })

  return null
}
'@
[System.IO.File]::WriteAllText("$pwd\src\components\CameraRig.jsx", $camera)

Write-Host "  [OK] CameraRig.jsx" -ForegroundColor Green

# ========== CITY BACKGROUND ==========
$city = @'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function CityBg() {
  const buildings = useMemo(() => {
    const colors = ['#ff00ea', '#00fff7', '#b026ff', '#ffaa00']
    return Array.from({ length: 30 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1
      const z = -(Math.floor(i / 2)) * 5 - 10
      return {
        id: i,
        position: [side * (24 + Math.random() * 6), 0, z],
        height: 5 + Math.random() * 12,
        width: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * 4)],
      }
    })
  }, [])

  return (
    <group>
      {buildings.map((b) => (
        <group key={b.id} position={b.position}>
          <mesh position={[0, b.height / 2, 0]}>
            <boxGeometry args={[b.width, b.height, b.width]} />
            <meshStandardMaterial
              color="#0a0018"
              emissive={b.color}
              emissiveIntensity={0.15}
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          <lineSegments position={[0, b.height / 2, 0]}>
            <edgesGeometry args={[new THREE.BoxGeometry(b.width, b.height, b.width)]} />
            <lineBasicMaterial color={b.color} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\components\CityBg.jsx", $city)

Write-Host "  [OK] CityBg.jsx" -ForegroundColor Green

# ========== HUD ==========
$hud = @'
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
'@
[System.IO.File]::WriteAllText("$pwd\src\ui\HUD.jsx", $hud)

# ========== MAIN MENU ==========
$menu = @'
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
        <div style={{ fontSize: 60, margin: '20px 0' }}>🐔</div>
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
'@
[System.IO.File]::WriteAllText("$pwd\src\ui\MainMenu.jsx", $menu)

# ========== GAME OVER ==========
$gameover = @'
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
        <div style={{ fontSize: 60, margin: '10px 0' }}>🚗💥🐔</div>
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
'@
[System.IO.File]::WriteAllText("$pwd\src\ui\GameOver.jsx", $gameover)

Write-Host "  [OK] UI components" -ForegroundColor Green

# ========== STYLES ==========
$styles = @'
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  overflow: hidden;
  background: #05010f;
  font-family: 'Inter', sans-serif;
  color: #fff;
  user-select: none;
}

.game-root {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-family: 'Orbitron', sans-serif;
}

.hud-card {
  background: rgba(10, 0, 24, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 170, 0, 0.3);
  padding: 14px 22px;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(255, 170, 0, 0.15);
}

.hud-label {
  font-size: 10px;
  letter-spacing: 3px;
  opacity: 0.55;
  text-transform: uppercase;
  font-weight: 600;
}

.hud-value {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-top: 4px;
}

.hud-value.neon {
  color: #ffaa00;
  text-shadow: 0 0 10px #ffaa00, 0 0 30px rgba(255, 170, 0, 0.6);
}

.hud-value.pink {
  color: #ff3366;
  text-shadow: 0 0 10px #ff3366, 0 0 30px rgba(255, 51, 102, 0.6);
}

.hud-controls .hud-keys {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.hud-controls .hud-keys span {
  background: rgba(255, 170, 0, 0.15);
  border: 1px solid rgba(255, 170, 0, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 11px;
}

.menu-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(
    circle at center,
    rgba(255, 170, 0, 0.12) 0%,
    rgba(255, 51, 102, 0.08) 30%,
    rgba(5, 1, 15, 0.9) 100%
  );
  backdrop-filter: blur(12px);
  z-index: 10;
}

.gameover-overlay {
  background: radial-gradient(
    circle at center,
    rgba(255, 51, 102, 0.2) 0%,
    rgba(5, 1, 15, 0.92) 70%
  );
}

.menu-card {
  text-align: center;
  padding: 56px 72px;
  border-radius: 24px;
  background: rgba(10, 0, 24, 0.75);
  border: 1px solid rgba(255, 170, 0, 0.25);
  backdrop-filter: blur(30px);
  box-shadow: 0 30px 100px rgba(255, 170, 0, 0.25);
  max-width: 90vw;
}

.menu-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 900;
  letter-spacing: 8px;
  background: linear-gradient(90deg, #ffaa00 0%, #ff3366 50%, #ff00ea 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 30px rgba(255, 170, 0, 0.6));
  margin-bottom: 8px;
}

.menu-title.danger {
  background: linear-gradient(90deg, #ff3366, #ff00ea);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 30px rgba(255, 51, 102, 0.7));
}

.menu-sub {
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 4px;
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 24px;
  font-weight: 600;
}

.new-record {
  color: #ffdd00;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  letter-spacing: 4px;
  font-weight: 900;
  margin: 8px 0 16px;
  text-shadow: 0 0 20px #ffdd00;
}

.btn {
  cursor: pointer;
  pointer-events: auto;
  padding: 18px 56px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(90deg, #ffaa00, #ff3366, #ff00ea);
  background-size: 200% 100%;
  color: #05010f;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  letter-spacing: 4px;
  font-size: 14px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(255, 170, 0, 0.4);
  margin-top: 20px;
}

.btn:hover {
  background-position: 100% 0;
  box-shadow: 0 14px 60px rgba(255, 170, 0, 0.7);
}

.menu-info {
  display: flex;
  gap: 32px;
  margin-top: 40px;
  justify-content: center;
  font-family: 'Orbitron', sans-serif;
}

.menu-info > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-info span {
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.4);
}

.menu-info strong {
  font-size: 14px;
  letter-spacing: 2px;
  color: #ffaa00;
}

.menu-best {
  margin-top: 28px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  letter-spacing: 3px;
  font-family: 'Orbitron', sans-serif;
}
'@
[System.IO.File]::WriteAllText("$pwd\src\styles\ui.css", $styles)

Write-Host "  [OK] ui.css" -ForegroundColor Green

# ========== GAME ==========
$game = @'
import { Canvas } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import { Suspense } from 'react'
import { useGame } from './store/gameStore'

import Chicken from './components/Chicken'
import Spawner from './components/Spawner'
import CameraRig from './components/CameraRig'
import CityBg from './components/CityBg'

import HUD from './ui/HUD'
import MainMenu from './ui/MainMenu'
import GameOver from './ui/GameOver'
import './styles/ui.css'

export default function Game() {
  const gameState = useGame((s) => s.gameState)

  return (
    <div className="game-root">
      <Canvas
        shadows
        camera={{ position: [0, 9, 11], fov: 55 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0515']} />
        <fog attach="fog" args={['#0a0515', 25, 70]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-15, 10, -10]} intensity={2} color="#ff00ea" />
        <pointLight position={[15, 10, 10]} intensity={2} color="#00fff7" />

        <Suspense fallback={null}>
          <CityBg />

          {gameState === 'playing' && (
            <>
              <Chicken />
              <Spawner />
              <CameraRig />
            </>
          )}
        </Suspense>

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>

      {gameState === 'playing' && <HUD />}
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'gameover' && <GameOver />}
    </div>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\Game.jsx", $game)

# ========== APP ==========
$app = @'
import Game from './Game'

export default function App() {
  return <Game />
}
'@
[System.IO.File]::WriteAllText("$pwd\src\App.jsx", $app)

Write-Host "  [OK] Game.jsx + App.jsx" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run: npm run dev" -ForegroundColor Yellow