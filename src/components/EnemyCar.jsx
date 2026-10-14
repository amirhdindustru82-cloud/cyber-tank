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

  const startX = initialOffset

  useFrame((_, delta) => {
    if (!group.current) return
    if (gameState !== 'playing') return

    framesAlive.current++
    group.current.position.x += speed * direction * delta

    // 🎯 محدوده دقیق‌تر: کمی بزرگ‌تر از نصف جاده
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
      gameOver()
    }
  })

  return (
    <group ref={group} position={[startX, 0.5, z]}>
      <mesh castShadow>
        <boxGeometry args={[size.w, size.h, size.d]} />
        <meshStandardMaterial
          color="#0a0018"
          metalness={0.9}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(size.w, size.h, size.d)]}
        />
        <lineBasicMaterial color={color} />
      </lineSegments>

      <mesh position={[0, size.h * 0.6, -size.d * 0.1]}>
        <boxGeometry args={[size.w * 0.75, size.h * 0.8, size.d * 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh position={[0, 0, -size.d / 2 - 0.02]}>
        <boxGeometry args={[size.w * 0.7, 0.1, 0.05]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>

      <mesh position={[0, 0, size.d / 2 + 0.02]}>
        <boxGeometry args={[size.w * 0.7, 0.1, 0.05]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      <pointLight color={color} intensity={2} distance={5} />
    </group>
  )
}