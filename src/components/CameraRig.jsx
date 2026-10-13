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
    // دوربین نزدیک‌تر و پایین‌تر
    const desiredX = p.x * 0.3
    const desiredY = 6        // ← از 9 به 6
    const desiredZ = p.z + 7  // ← از 11 به 7

    camera.position.x += (desiredX - camera.position.x) * delta * 5
    camera.position.y += (desiredY - camera.position.y) * delta * 5
    camera.position.z += (desiredZ - camera.position.z) * delta * 5

    // نگاه به جلوتر (نه عقب)
    target.current.set(p.x * 0.5, 0.5, p.z - 5)
    camera.lookAt(target.current)
  })

  return null
}