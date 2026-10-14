import { Canvas } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import { Suspense } from 'react'
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

  return (
    <div className="game-root">
      <Canvas
        shadows
        camera={{ position: [0, 11, 11], fov: 55 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0515']} />
        <fog attach="fog" args={['#0a0515', 25, 70]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-15, 10, -10]} intensity={2} color="#ff00ea" />
        <pointLight position={[15, 10, 10]} intensity={2} color="#00fff7" />

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

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>

      <TouchControls />

      {gameState === 'playing' && <HUD />}
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'gameover' && <GameOver />}
    </div>
  )
}