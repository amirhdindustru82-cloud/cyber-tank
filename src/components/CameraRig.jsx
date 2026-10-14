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

    // 🎥 دوربین متعادل: عقب‌تر و بالاتر ولی نه خیلی
    const baseY = 11
    const baseZ = 11

    // 🎬 فقط یه ذره با پیشرفت بازی عقب‌تر
    const zoomOut = Math.min(score / 60, 2)

    // 🔑 کلید حل: دوربین فقط 20% جابجایی مرغ رو دنبال می‌کنه
    // یعنی مرغ 80% از وسط کادر فاصله نمی‌گیره
    const desiredX = p.x * 0.2
    const desiredY = baseY + zoomOut
    const desiredZ = p.z + baseZ + zoomOut

    // حرکت نرم
    camera.position.x += (desiredX - camera.position.x) * delta * 3
    camera.position.y += (desiredY - camera.position.y) * delta * 3
    camera.position.z += (desiredZ - camera.position.z) * delta * 3

    // 🎯 نگاه به جلوتر (نه دقیقاً روی بازیکن)
    target.current.set(p.x * 0.4, 0.5, p.z - 4)
    camera.lookAt(target.current)
  })

  return null
}