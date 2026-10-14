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

    // 🎥 دوربین ثابت — بدون وابستگی به score
    const baseY = 11
    const baseZ = 11

    // 🔑 کلید حل: فقط موقعیت بازیکن رو دنبال کن، نه score
    const desiredX = p.x * 0.2
    const desiredY = baseY
    const desiredZ = p.z + baseZ

    // حرکت نرم
    camera.position.x += (desiredX - camera.position.x) * delta * 3
    camera.position.y += (desiredY - camera.position.y) * delta * 3
    camera.position.z += (desiredZ - camera.position.z) * delta * 3

    // 🎯 نگاه به جلوتر
    target.current.set(p.x * 0.4, 0.5, p.z - 4)
    camera.lookAt(target.current)
  })

  return null
}