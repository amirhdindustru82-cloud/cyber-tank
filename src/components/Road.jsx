import { useMemo } from 'react'
import EnemyCar from './EnemyCar'
import { ROAD_WIDTH, LANE_X } from '../constants'

const COLORS = ['#ff3366', '#ffdd00', '#00ff88', '#b026ff', '#00fff7']

export default function Road({ z, difficulty, scene }) {
  const cars = useMemo(() => {
    const result = []

    // جاده اول امن
    if (Math.abs(z + 3) < 0.5) return []

    // جاده دوم نیمه‌امن
    if (Math.abs(z + 6) < 0.5) {
      result.push({
        id: `${z}-safe-${Math.random()}`,
        laneX: LANE_X[2],
        speed: 4 + Math.random() * 2,
        direction: -1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: { w: 1.7, h: 0.7, d: 2.5 },
        initialOffset: 4,
      })
      return result
    }

    const isTwoWay = Math.random() > 0.5

    // ماشین تضمینی توی lane وسط
    const centerSize = { w: 1.7, h: 0.7, d: 2.5 }
    result.push({
      id: `${z}-center-${Math.random()}`,
      laneX: LANE_X[1],
      speed: 4.5 + Math.random() * 3 + difficulty * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: centerSize,
      initialOffset: (Math.random() - 0.5) * 5,
    })

    // ماشین‌های lane های چپ و راست
    for (let lane = 0; lane < 3; lane++) {
      const carsInLane = lane === 1 ? 2 : 3

      const laneDirection = isTwoWay
        ? (Math.random() > 0.5 ? 1 : -1)
        : Math.random() > 0.5
          ? 1
          : -1

      const baseLaneSpeed = 4.5 + Math.random() * 3 + difficulty * 0.5
      const spacing = ROAD_WIDTH / carsInLane

      const startJ = lane === 1 ? 1 : 0

      for (let j = startJ; j < carsInLane; j++) {
        const sizeVariants = [
          { w: 1.6, h: 0.6, d: 2.2 },
          { w: 1.7, h: 0.7, d: 2.5 },
          { w: 1.9, h: 0.8, d: 3.0 },
          { w: 1.6, h: 0.7, d: 2.8 },
        ]
        const size = sizeVariants[Math.floor(Math.random() * sizeVariants.length)]

        const initialOffset = -ROAD_WIDTH / 2 + j * spacing
        const speed = baseLaneSpeed * (0.85 + Math.random() * 0.4)

        result.push({
          id: `${z}-${lane}-${j}-${Math.random()}`,
          laneX: LANE_X[lane],
          speed,
          direction: laneDirection,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size,
          initialOffset,
        })
      }
    }

    return result
  }, [])

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

      {[-4.5, 4.5].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.2, 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
        <planeGeometry args={[0.15, 2]} />
        <meshBasicMaterial color="#ffdd00" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z - 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.12]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z + 1.4]}>
        <planeGeometry args={[ROAD_WIDTH, 0.12]} />
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
          size={car.size}
          initialOffset={car.initialOffset}
          scene={scene}
        />
      ))}
    </group>
  )
}