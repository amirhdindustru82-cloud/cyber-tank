import { useMemo } from 'react'
import * as THREE from 'three'

export default function CityBg() {
  const buildings = useMemo(() => {
    const colors = ['#ff00ea', '#00fff7', '#b026ff', '#ffaa00']
    // 🚀 20 ساختمون به جای 30
    return Array.from({ length: 20 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1
      const z = -(Math.floor(i / 2)) * 6 - 10
      return {
        id: i,
        position: [side * (24 + Math.random() * 6), 0, z],
        height: 5 + Math.random() * 10,
        width: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * 4)],
      }
    })
  }, [])

  return (
    <group>
      {buildings.map((b) => (
        <mesh key={b.id} position={[b.position[0], b.height / 2, b.position[2]]}>
          <boxGeometry args={[b.width, b.height, b.width]} />
          <meshBasicMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  )
}