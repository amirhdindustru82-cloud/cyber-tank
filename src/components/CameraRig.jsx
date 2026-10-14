import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store/gameStore'

export default function CameraRig() {
  const { camera, scene } = useThree()
  const target = useRef(new THREE.Vector3())
  const score = useGame((s) => s.score)

  useFrame((_, delta) => {
    const player = scene.getObjectByName('player')
    if (!player) return

    const p = player.position

    // 🎥 دوربین نزدیک‌تر (چون جاده باریکه)
    const baseY = 9
    const baseZ = 10

    const zoomOut = Math.min(score / 40, 3)

    const desiredX = p.x * 0.4
    const desiredY = baseY + zoomOut
    const desiredZ = p.z + baseZ + zoomOut

    camera.position.x += (desiredX - camera.position.x) * delta * 4
    camera.position.y += (desiredY - camera.position.y) * delta * 4
    camera.position.z += (desiredZ - camera.position.z) * delta * 4

    target.current.set(p.x * 0.6, 0.5, p.z - 5)
    camera.lookAt(target.current)
  })

  return null
}