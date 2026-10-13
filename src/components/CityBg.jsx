import { useMemo } from 'react'
import * as THREE from 'three'

export default function CityBg() {
  const buildings = useMemo(() => {
    const colors = ['#ff00ea', '#00fff7', '#b026ff', '#ffaa00']
    return Array.from({ length: 30 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1
      const z = -(Math.floor(i / 2)) * 5 - 10
      return {
        id: i,
        position: [side * (24 + Math.random() * 6), 0, z],
        height: 5 + Math.random() * 12,
        width: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * 4)],
      }
    })
  }, [])

  return (
    <group>
      {buildings.map((b) => (
        <group key={b.id} position={b.position}>
          <mesh position={[0, b.height / 2, 0]}>
            <boxGeometry args={[b.width, b.height, b.width]} />
            <meshStandardMaterial
              color="#0a0018"
              emissive={b.color}
              emissiveIntensity={0.15}
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          <lineSegments position={[0, b.height / 2, 0]}>
            <edgesGeometry args={[new THREE.BoxGeometry(b.width, b.height, b.width)]} />
            <lineBasicMaterial color={b.color} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}