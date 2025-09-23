import './App.css'
import { Canvas } from '@react-three/fiber'
import Stage from '@/components/three/stage/Stage.tsx'
import CameraManager from '@/modules/camera/CameraManager.three.tsx'
import Ui from '@/components/ui/Ui.tsx'
import { Perf } from 'r3f-perf'
import { Debug, Physics } from '@react-three/cannon'

function App() {
  return (
    <>
      <div id="canvas-container" className="relative w-screen h-screen">
        <Canvas
          camera={{ near: 0.1, far: 10000 }}
          className="absolute inset-0"
          gl={{
            powerPreference: 'high-performance',
            antialias: false,
            stencil: false,
            depth: true,
            alpha: false,
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Perf />

          <ambientLight intensity={1} />
          <directionalLight position={[0, 0, 5]} color="orange" />
          <CameraManager />

          <Physics gravity={[0, -9.81, 0]} broadphase="SAP">
            <Debug color="orange" scale={1}>
              <Stage />
            </Debug>
          </Physics>
        </Canvas>

        <Ui />
      </div>
    </>
  )
}

export default App
