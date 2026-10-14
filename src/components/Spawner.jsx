import { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGame } from '../store/gameStore'
import Road from './Road'
import { ROAD_DEPTH, VISIBLE_ROADS, DESPAWN_Z } from '../constants'

export default function Spawner() {
  const { scene } = useThree()
  const gameState = useGame((s) => s.gameState)
  const score = useGame((s) => s.score)

  const [roads, setRoads] = useState([])
  const lastSpawnedIndex = useRef(0)
  const playerProgressRef = useRef(0)

  useEffect(() => {
    if (gameState !== 'playing') {
      setRoads([])
      lastSpawnedIndex.current = 0
      playerProgressRef.current = 0
      return
    }

    const initial = []
    for (let i = 0; i < VISIBLE_ROADS; i++) {
      initial.push({
        id: `road-${i}`,
        index: i,
        z: -(i + 1) * ROAD_DEPTH,
      })
    }
    setRoads(initial)
    lastSpawnedIndex.current = VISIBLE_ROADS - 1
    playerProgressRef.current = 0
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    if (roads.length === 0) return

    const targetIndex = score
    if (targetIndex <= playerProgressRef.current) return
    playerProgressRef.current = targetIndex

    setRoads((prev) => {
      // 🎯 جاده‌های بیشتر نگه دار (برای دید بازتر)
      const filtered = prev.filter((r) => r.index > targetIndex - 5)

      const newRoads = []
      const need = VISIBLE_ROADS - filtered.length

      for (let i = 0; i < need; i++) {
        const newIndex = lastSpawnedIndex.current + 1
        lastSpawnedIndex.current = newIndex
        newRoads.push({
          id: `road-${newIndex}`,
          index: newIndex,
          z: -(newIndex + 1) * ROAD_DEPTH,
        })
      }

      return [...filtered, ...newRoads]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, gameState, roads.length])

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