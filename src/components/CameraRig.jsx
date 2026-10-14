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

    // 🎥 دوربین کمی عقب‌تر و بالاتر برای دیدن عرض بیشتر
    const baseY = 12
    const baseZ = 13

    const desiredX = p.x * 0.2
    const desiredY = baseY
    const desiredZ = p.z + baseZ

    camera.position.x += (desiredX - camera.position.x) * delta * 3
    camera.position.y += (desiredY - camera.position.y) * delta * 3
    camera.position.z += (desiredZ - camera.position.z) * delta * 3

    target.current.set(p.x * 0.4, 0.5, p.z - 5)
    camera.lookAt(target.current)
  })

  return null
}