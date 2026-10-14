import { useMemo } from 'react'
import EnemyCar from './EnemyCar'
import { ROAD_WIDTH, LANE_X } from '../constants'

const COLORS = ['#ff3366', '#ffdd00', '#00ff88', '#b026ff', '#00fff7']

export default function Road({ z, difficulty, scene }) {
  const cars = useMemo(() => {
    const result = []

    // جاده اول امن (زیر مرغ)
    if (Math.abs(z + 2.5) < 0.5) return []

    // 🎯 جاده دوم نیمه‌امن
    if (Math.abs(z + 5) < 0.5) {
      result.push({
        id: `${z}-safe-${Math.random()}`,
        laneX: LANE_X[2],
        speed: 4 + Math.random() * 2,
        direction: -1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: { w: 1.7, h: 0.7, d: 2.5 },
        initialOffset: 5,
      })
      return result
    }

    const isTwoWay = Math.random() > 0.5

    // 🔥 مرحله 1: یه ماشین تضمینی توی lane وسط (جلوی بازیکن)
    // این ماشین همیشه هست، بدون استثنا
    const centerSize = { w: 1.7, h: 0.7, d: 2.5 }
    result.push({
      id: `${z}-center-${Math.random()}`,
      laneX: LANE_X[1], // lane وسط
      speed: 3.5 + Math.random() * 2 + difficulty * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: centerSize,
      initialOffset: (Math.random() - 0.5) * 6, // -3 تا 3 (وسط جاده)
    })

    // 🔥 مرحله 2: ماشین‌های lane های چپ و راست
    for (let lane = 0; lane < 3; lane++) {
      // lane وسط قبلاً ماشین داشت، فقط 1-2 ماشین اضافه
      const carsInLane = lane === 1 ? 2 : 3
      
      const laneDirection = isTwoWay
        ? (Math.random() > 0.5 ? 1 : -1)
        : Math.random() > 0.5
          ? 1
          : -1

      const baseLaneSpeed = 3 + Math.random() * 3 + difficulty * 0.4
      const spacing = ROAD_WIDTH / carsInLane

      // 🎯 اگه lane وسطی، از j=1 شروع کن (چون j=0 رو اضافه کردیم)
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
        const speed = baseLaneSpeed * (0.8 + Math.random() * 0.5)

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
        <planeGeometry args={[ROAD_WIDTH, 2.4]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.8}
          emissive="#1a0033"
          emissiveIntensity={0.3}
        />
      </mesh>

      {[-4.8, 4.8].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.2, 1.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
        <planeGeometry args={[0.15, 1.6]} />
        <meshBasicMaterial color="#ffdd00" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z - 1.15]}>
        <planeGeometry args={[ROAD_WIDTH, 0.12]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z + 1.15]}>
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