import './App.css'
import {Canvas} from "@react-three/fiber";
import Stage from "@/components/three/stage/Stage.tsx";
import CameraManager from "@/modules/camera/CameraManager.three.tsx";
import Ui from "@/components/ui/Ui.tsx";
import {Perf} from "r3f-perf";
import {Suspense} from "react";
import {CuboidCollider, Physics, RigidBody} from "@react-three/rapier";
import ChunkManager from "@/components/three/stage/ChunkManager.tsx";
import {Torus} from "@react-three/drei";

function App() {
  return (
    <>
        <div id="canvas-container" className="relative w-screen h-screen">
                <Canvas
                    camera={{near: 0.1, far: 10000}}
                    className="absolute inset-0"
                    gl={{
                        powerPreference: "high-performance",
                        antialias: false,
                        stencil: false,
                        depth: true,
                        alpha: false
                    }}
                    dpr={[1, 2]}
                    performance={{ min: 0.5 }}
                >

                    <Perf />

                    <ambientLight intensity={0.1} />
                    <directionalLight position={[0, 0, 5]} color="orange" />
                    <CameraManager/>

                    <mesh>
                        <boxGeometry />
                        <meshStandardMaterial />
                    </mesh>

                    <Suspense>
                        <Physics debug gravity={[0, -9.81, 0]} timeStep={1/60}>
                            <Stage />
                        </Physics>
                    </Suspense>
                </Canvas>

            <Ui/>
        </div>
    </>
  )
}

export default App
