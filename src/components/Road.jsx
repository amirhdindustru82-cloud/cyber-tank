import { useMemo } from 'react'
import EnemyCar from './EnemyCar'
import { ROAD_WIDTH, LANE_X } from '../constants'

const COLORS = ['#ff3366', '#ffdd00', '#00ff88', '#b026ff', '#00fff7']

export default function Road({ z, difficulty, scene }) {
  const isFar = Math.abs(z) > 20

  const cars = useMemo(() => {
    const result = []

    // جاده اول امن
    if (Math.abs(z + 3) < 0.5) return []

    // جاده‌های دور: ساده
    if (isFar) {
      result.push({
        id: `${z}-far-${Math.random()}`,
        laneX: LANE_X[1],
        speed: 3.5 + Math.random() * 2 + difficulty * 0.3,
        direction: Math.random() > 0.5 ? 1 : -1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: { w: 1.7, h: 0.7, d: 2.5 },
        initialOffset: (Math.random() - 0.5) * 5,
      })
      return result
    }

    const isTwoWay = Math.random() > 0.5

    // lane وسط: تضمینی 1 ماشین
    result.push({
      id: `${z}-center-${Math.random()}`,
      laneX: LANE_X[1],
      speed: 4 + Math.random() * 2.5 + difficulty * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: { w: 1.7, h: 0.7, d: 2.5 },
      initialOffset: (Math.random() - 0.5) * 5,
    })

    // lane چپ و راست: هرکدوم 1 ماشین
    for (let lane = 0; lane < 3; lane++) {
      if (lane === 1) continue

      const laneDirection = isTwoWay
        ? (Math.random() > 0.5 ? 1 : -1)
        : Math.random() > 0.5
          ? 1
          : -1

      const sizeVariants = [
        { w: 1.6, h: 0.6, d: 2.2 },
        { w: 1.7, h: 0.7, d: 2.5 },
        { w: 1.9, h: 0.8, d: 3.0 },
        { w: 1.6, h: 0.7, d: 2.8 },
      ]
      const size = sizeVariants[Math.floor(Math.random() * sizeVariants.length)]

      result.push({
        id: `${z}-${lane}-${Math.random()}`,
        laneX: LANE_X[lane],
        speed: 4 + Math.random() * 2.5 + difficulty * 0.4,
        direction: laneDirection,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size,
        initialOffset: (Math.random() - 0.5) * 8,
      })
    }

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]}>
        <planeGeometry args={[ROAD_WIDTH, 2.9]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.8}
          emissive="#1a0033"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z - 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.12]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z + 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.12]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>

      {!isFar && [-4.5, 4.5].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.2, 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {!isFar && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
          <planeGeometry args={[0.15, 2]} />
          <meshBasicMaterial color="#ffdd00" />
        </mesh>
      )}

      {cars.map((car) => (
        <EnemyCar
          key={car.id}
          z={z}
          laneX={car.laneX}
          speed={car.speed}
          direction={car.direction}
          color={car.color}
          size={car.size}
          initialOffset={car.initialOffset}
          scene={scene}
        />
      ))}
    </group>
  )
}