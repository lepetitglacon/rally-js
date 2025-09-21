import './App.css'
import {Canvas} from "@react-three/fiber";
import Stage from "@/components/three/stage/Stage.tsx";
import CameraManager from "@/modules/camera/CameraManager.three.tsx";
import Ui from "@/components/ui/Ui.tsx";
import {Perf} from "r3f-perf";
import {Suspense} from "react";
import {CuboidCollider, Physics, RigidBody} from "@react-three/rapier";
import Terrain from "@/components/three/stage/Terrain.tsx";
import {Torus} from "@react-three/drei";

function App() {
  return (
    <>
        <div id="canvas-container" className="relative w-screen h-screen">
                <Canvas camera={{near: 0.1, far: 10000}} className="absolute inset-0">

                    {/*<Perf />*/}

                    <ambientLight intensity={0.1} />
                    <directionalLight position={[0, 0, 5]} color="orange" />
                    <CameraManager/>

                    <mesh>
                        <boxGeometry />
                        <meshStandardMaterial />
                    </mesh>

                    <Suspense>
                        <Suspense>
                            <Physics debug>
                                <RigidBody colliders={"hull"} restitution={2}>
                                    <Torus />
                                </RigidBody>

                                <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
                            </Physics>
                        </Suspense>
                        {/*<Physics debug gravity={[0, -9.81, 0]}>*/}
                        {/*    <Terrain />*/}
                        {/*</Physics>*/}
                    </Suspense>
                </Canvas>

            <Ui/>
        </div>
    </>
  )
}

export default App
