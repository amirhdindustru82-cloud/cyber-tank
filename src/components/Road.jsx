import { useMemo, useRef } from 'react'
import EnemyCar from './EnemyCar'
import { ROAD_WIDTH, LANE_X } from '../constants'

const COLORS = ['#ff3366', '#ffdd00', '#00ff88', '#b026ff', '#00fff7']

export default function Road({ z, difficulty, scene }) {
  // 🎯 ماشین‌ها فقط یک بار ساخته می‌شن (difficulty توی deps نیست)
  const cars = useMemo(() => {
    const result = []
    const usedLanes = new Set()
    const laneCount = Math.random() > 0.3 ? 2 : 1

    for (let i = 0; i < laneCount; i++) {
      let lane
      let attempts = 0
      do {
        lane = Math.floor(Math.random() * 3)
        attempts++
      } while (usedLanes.has(lane) && attempts < 5)
      usedLanes.add(lane)

      const direction = Math.random() > 0.5 ? 1 : -1
      const speed = 4 + Math.random() * 3
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      result.push({
        id: `${lane}-${Math.random()}`,  // 🎯 ID پایدار
        laneX: LANE_X[lane],
        speed,
        direction,
        color,
      })
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // 🎯 فقط یک بار وقتی کامپوننت mount می‌شه

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, 2.9]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.8}
          emissive="#1a0033"
          emissiveIntensity={0.3}
        />
      </mesh>

      {[-4.8, 0, 4.8].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.25, 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z - 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.15]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z + 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.15]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>

      {cars.map((car) => (
        <EnemyCar
          key={car.id}
          z={z}
          laneX={car.laneX}
          speed={car.speed}
          direction={car.direction}
          color={car.color}
          scene={scene}
        />
      ))}
    </group>
  )
}