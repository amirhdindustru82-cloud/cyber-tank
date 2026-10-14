import { Canvas } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
} from '@react-three/postprocessing'
import { Suspense, useState, useEffect } from 'react'
import { useGame } from './store/gameStore'

import Chicken from './components/Chicken'
import Spawner from './components/Spawner'
import CameraRig from './components/CameraRig'
import CityBg from './components/CityBg'

import HUD from './ui/HUD'
import MainMenu from './ui/MainMenu'
import GameOver from './ui/GameOver'
import TouchControls from './ui/TouchControls'
import './styles/ui.css'

export default function Game() {
  const gameState = useGame((s) => s.gameState)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      const isTouch =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsMobile(isTouch || window.innerWidth < 900)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div className="game-root">
      <Canvas
        // 🚀 موبایل: بدون shadow، بدون antialias
        shadows={!isMobile}
        camera={{ position: [0, 11, 11], fov: 55 }}
        gl={{
          antialias: !isMobile,
          powerPreference: 'high-performance',
        }}
        // 🚀 موبایل: dpr = 1 (خیلی سبک‌تر)
        dpr={isMobile ? 1 : [1, 1.5]}
      >
        <color attach="background" args={['#0a0515']} />
        <fog attach="fog" args={['#0a0515', 25, 70]} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow={!isMobile}
        />
        <pointLight position={[-15, 10, -10]} intensity={1.5} color="#ff00ea" />
        <pointLight position={[15, 10, 10]} intensity={1.5} color="#00fff7" />

        <Suspense fallback={null}>
          <CityBg />

          {gameState === 'playing' && (
            <>
              <Chicken />
              <Spawner />
              <CameraRig />
            </>
          )}
        </Suspense>

        {/* 🚀 موبایل: EffectComposer ساده‌تر */}
        {!isMobile ? (
          <EffectComposer multisampling={2}>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        ) : null}
      </Canvas>

      <TouchControls />

      {gameState === 'playing' && <HUD />}
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'gameover' && <GameOver />}
    </div>
  )
}