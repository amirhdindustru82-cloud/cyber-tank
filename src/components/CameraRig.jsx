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

    // 🎥 دوربین عقب‌تر و بالاتر — دید وسیع‌تر
    const baseY = 16
    const baseZ = 16

    // 🎬 با پیشرفت بازی، کمی عقب‌تر
    const zoomOut = Math.min(score / 40, 3)

    // 🔥 مهم: وقتی مرغ چپ/راست می‌ره، دوربین کامل همراهش نمی‌ره
    // فقط 25% جابجایی رو دنبال می‌کنه (بقیه ثابت می‌مونه)
    const desiredX = p.x * 0.25
    const desiredY = baseY + zoomOut
    const desiredZ = p.z + baseZ + zoomOut

    // حرکت نرم‌تر (کندتر)
    camera.position.x += (desiredX - camera.position.x) * delta * 3
    camera.position.y += (desiredY - camera.position.y) * delta * 3
    camera.position.z += (desiredZ - camera.position.z) * delta * 3

    // 🎯 نگاه به جلوتر و به سمت مرغ (نه مستقیم روی مرغ)
    target.current.set(p.x * 0.5, 0.5, p.z - 7)
    camera.lookAt(target.current)
  })

  return null
}