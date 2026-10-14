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

  // 🎯 راه‌اندازی اولیه: فقط یه بار وقتی بازی شروع می‌شه
  useEffect(() => {
    if (gameState !== 'playing') {
      setRoads([])
      lastIndexRef.current = 0
      return
    }

    // ساخت جاده‌های اولیه
    const initial = []
    for (let i = 0; i < VISIBLE_ROADS; i++) {
      initial.push({
        id: `road-${i}`,
        index: i,
        z: -(i + 1) * ROAD_DEPTH,
      })
    }
    setRoads(initial)
    lastIndexRef.current = VISIBLE_ROADS - 1
  }, [gameState])

  // 🎯 ساخت جاده جدید + حذف قدیمی‌ها
  useEffect(() => {
    if (gameState !== 'playing') return
    if (roads.length === 0) return

    setRoads((prev) => {
      // 🚨 محدودیت سخت: هیچوقت بیشتر از VISIBLE_ROADS + 3 جاده نداشته باش
      if (prev.length > VISIBLE_ROADS + 3) {
        // فقط 3 جاده اول که از دورن حفظ کن
        const sorted = [...prev].sort((a, b) => a.index - b.index)
        return sorted.slice(0, VISIBLE_ROADS)
      }

      // 🎯 فقط جاده‌های جلوتر از بازیکن رو نگه دار
      // اگه بازیکن 5 جاده جلو رفته، جاده‌های قدیمی‌تر حذف می‌شن
      const minIndex = score - 3

      const filtered = prev.filter((r) => r.index >= minIndex)

      // اگه تعداد کمتر از VISIBLE_ROADS شد، جاده جدید بساز
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