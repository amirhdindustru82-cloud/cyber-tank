import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/gameStore'

export default function EnemyCar({ z, laneX, speed, direction, color, scene }) {
  const group = useRef()
  const gameOver = useGame((s) => s.gameOver)
  const gameState = useGame((s) => s.gameState)
  const framesAlive = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    if (gameState !== 'playing') return

    framesAlive.current++
    group.current.position.x += speed * direction * delta

    if (group.current.position.x > 24) group.current.position.x = -24
    if (group.current.position.x < -24) group.current.position.x = 24

    // ⏱️ 30 فریم صبر کن (نیم ثانیه)
    if (framesAlive.current < 30) return

    const player = scene.getObjectByName('player')
    if (!player) return

    const p = player.position
    const c = group.current.position
    const dx = Math.abs(p.x - c.x)
    const dz = Math.abs(p.z - c.z)

    if (dx < 1.15 && dz < 1.7 && p.y < 1.0) {
      gameOver()
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