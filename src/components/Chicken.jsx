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