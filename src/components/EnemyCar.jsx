import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/gameStore'
import { ROAD_WIDTH } from '../constants'

export default function EnemyCar({
  z,
  laneX,
  speed,
  direction,
  color,
  size,
  initialOffset = 0,
  scene,
}) {
  const group = useRef()
  const gameOver = useGame((s) => s.gameOver)
  const gameState = useGame((s) => s.gameState)
  const framesAlive = useRef(0)
  const hasHitRef = useRef(false)  // 🚀 فقط یه بار بازی رو ببند

  const startX = initialOffset

  useFrame((_, delta) => {
    if (!group.current) return
    if (gameState !== 'playing') return
    if (hasHitRef.current) return

    framesAlive.current++

    // 🚀 سرعت رو با limit ببر جلو
    const move = speed * direction * delta
    group.current.position.x += move

    const limit = ROAD_WIDTH / 2 + 2
    if (group.current.position.x > limit) {
      group.current.position.x = -limit
    } else if (group.current.position.x < -limit) {
      group.current.position.x = limit
    }

    if (framesAlive.current < 20) return

    const player = scene.getObjectByName('player')
    if (!player) return

    const p = player.position
    const c = group.current.position
    const dx = Math.abs(p.x - c.x)
    const dz = Math.abs(p.z - c.z)

    const halfW = size.w / 2
    const halfD = size.d / 2
    const playerHalfW = 0.4
    const playerHalfD = 0.5

    if (
      dx < halfW + playerHalfW &&
      dz < halfD + playerHalfD &&
      p.y < 0.9
    ) {
      hasHitRef.current = true
      gameOver()
    }
  })

  return (
    <group ref={group} position={[startX, 0.5, z]}>
      {/* 🚀 بدن: بدون edges و بدون pointLight — خیلی سبک‌تر */}
      <mesh>
        <boxGeometry args={[size.w, size.h, size.d]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* کابین */}
      <mesh position={[0, size.h * 0.6, -size.d * 0.1]}>
        <boxGeometry args={[size.w * 0.7, size.h * 0.7, size.d * 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}