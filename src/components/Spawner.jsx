import { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGame } from '../store/gameStore'
import Road from './Road'
import { ROAD_DEPTH, VISIBLE_ROADS } from '../constants'

export default function Spawner() {
  const { scene } = useThree()
  const gameState = useGame((s) => s.gameState)
  const score = useGame((s) => s.score)

  const [roads, setRoads] = useState([])
  const lastIndexRef = useRef(0)
  // 🚀 کش برای جاده‌های ثابت
  const seenIndicesRef = useRef(new Set())

  useEffect(() => {
    if (gameState !== 'playing') {
      setRoads([])
      lastIndexRef.current = 0
      seenIndicesRef.current = new Set()
      return
    }

    const initial = []
    for (let i = 0; i < VISIBLE_ROADS; i++) {
      initial.push({
        id: `road-${i}`,
        index: i,
        z: -(i + 1) * ROAD_DEPTH,
      })
      seenIndicesRef.current.add(i)
    }
    setRoads(initial)
    lastIndexRef.current = VISIBLE_ROADS - 1
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    if (roads.length === 0) return

    // 🚀 اگه score عوض نشده (چون strict mode دو بار رندر می‌کنه) skip کن
    const minIndex = score - 3

    setRoads((prev) => {
      if (prev.length > VISIBLE_ROADS + 3) {
        const sorted = [...prev].sort((a, b) => a.index - b.index)
        return sorted.slice(0, VISIBLE_ROADS)
      }

      const filtered = prev.filter((r) => r.index >= minIndex)

      if (filtered.length < VISIBLE_ROADS) {
        const newRoads = []
        const need = VISIBLE_ROADS - filtered.length
        for (let i = 0; i < need; i++) {
          const newIndex = lastIndexRef.current + 1
          lastIndexRef.current = newIndex
          newRoads.push({
            id: `road-${newIndex}`,
            index: newIndex,
            z: -(newIndex + 1) * ROAD_DEPTH,
          })
        }
        return [...filtered, ...newRoads]
      }

      return filtered
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, gameState])

  const difficulty = Math.min(score / 15, 6)

  return (
    <>
      {roads.map((road) => (
        <Road
          key={road.id}
          z={road.z}
          difficulty={difficulty}
          scene={scene}
        />
      ))}
    </>
  )
}