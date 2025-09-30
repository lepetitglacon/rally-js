import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { LoaderType } from '@/components/three/stage/Stage.tsx'
import gltfFile from '@/assets/gltf/subaru.glb?url'
import {
  useCompoundBody,
  useRaycastVehicle,
  type WheelInfoOptions,
} from '@react-three/cannon'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { Group, Mesh } from 'three'
import Wheel from '@/components/three/car/Wheel.tsx'
import { type GamepadRef, useGamepads } from 'react-ts-gamepads'
import { Html } from '@react-three/drei'

interface CarProps {
  width?: number
  height?: number
  front?: number
  back?: number
  radius?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  angularVelocity?: [number, number, number]
  mass?: number
  sphereRadius?: number
}

export default function Car({
  width = 1.5,
  height = 0.5,
  front = 1.2,
  back = -1.2,
  radius = 0.4,
  position = [0, 50, 0],
  rotation = [0, 0, 0],
  angularVelocity = [0, 0, 0],
  mass = 500,
  sphereRadius = 0.6,
}: CarProps) {
  const gltf: LoaderType = useLoader(GLTFLoader, gltfFile)

  const [gamepads, setGamepads] = useState<GamepadRef>({})
  useGamepads(gamepads => setGamepads(gamepads))

  const gamepadDisplay = Object.keys(gamepads).map(gamepadId => {
    return (
      <div>
        <h2>{gamepads[gamepadId].id}</h2>
        {gamepads[gamepadId].buttons &&
          gamepads[gamepadId].buttons.map((button, index) => (
            <div>
              {index}: {button.pressed ? 'True' : 'False'}
            </div>
          ))}
        {gamepads[gamepadId].axes &&
          gamepads[gamepadId].axes.map((button, index) => (
            <div>
              {index}: {button}
            </div>
          ))}
      </div>
    )
  })

  const wheels = [
    useRef<Group>(null),
    useRef<Group>(null),
    useRef<Group>(null),
    useRef<Group>(null),
  ]

  const wheelInfo: WheelInfoOptions = {
    axleLocal: [-1, 0, 0],
    customSlidingRotationalSpeed: -30,
    dampingCompression: 4.4,
    dampingRelaxation: 10,
    directionLocal: [0, -1, 0],
    frictionSlip: 2,
    maxSuspensionForce: 1e4,
    maxSuspensionTravel: 0.3,
    radius,
    suspensionRestLength: 0.3,
    suspensionStiffness: 30,
    useCustomSlidingRotationalSpeed: true,
  }

  const wheelInfo1: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [-width / 2, height, front],
    isFrontWheel: true,
  }
  const wheelInfo2: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [width / 2, height, front],
    isFrontWheel: true,
  }
  const wheelInfo3: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [-width / 2, height, back],
    isFrontWheel: false,
  }
  const wheelInfo4: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [width / 2, height, back],
    isFrontWheel: false,
  }

  const bodyY = 1
  const [chassisBody, chassisApi] = useCompoundBody(
    () => ({
      allowSleep: false,
      angularVelocity,
      mass,
      onCollide: e => {
        // console.log('bonk', e.body.userData)
      },
      position,
      rotation,
      shapes: [
        {
          args: [sphereRadius],
          position: [
            wheelInfo1.chassisConnectionPointLocal[0],
            bodyY,
            wheelInfo1.chassisConnectionPointLocal[2],
          ],
          type: 'Sphere',
        },
        {
          args: [sphereRadius],
          position: [
            wheelInfo2.chassisConnectionPointLocal[0],
            bodyY,
            wheelInfo2.chassisConnectionPointLocal[2],
          ],
          type: 'Sphere',
        },
        {
          args: [sphereRadius],
          position: [
            wheelInfo3.chassisConnectionPointLocal[0],
            bodyY,
            wheelInfo3.chassisConnectionPointLocal[2],
          ],
          type: 'Sphere',
        },
        {
          args: [sphereRadius],
          position: [
            wheelInfo4.chassisConnectionPointLocal[0],
            bodyY,
            wheelInfo4.chassisConnectionPointLocal[2],
          ],
          type: 'Sphere',
        },
      ],
    }),
    useRef<Mesh>(null),
  )

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
      wheels,
    }),
    useRef<Group>(null),
  )

  useEffect(
    () => vehicleApi.sliding.subscribe(v => console.log('sliding', v)),
    [],
  )

  useFrame(() => {
    // const { backward, brake, forward, left, reset, right } = controls.current
    //
    // for (let e = 2; e < 4; e++) {
    //   vehicleApi.applyEngineForce(
    //     forward || backward ? force * (forward && !backward ? -1 : 1) : 0,
    //     2,
    //   )
    // }
    //
    // for (let s = 0; s < 2; s++) {
    //   vehicleApi.setSteeringValue(
    //     left || right ? steer * (left && !right ? 1 : -1) : 0,
    //     s,
    //   )
    // }
    //
    // for (let b = 2; b < 4; b++) {
    //   vehicleApi.setBrake(brake ? maxBrake : 0, b)
    // }
    //
    // if (reset) {
    //   chassisApi.position.set(...position)
    //   chassisApi.velocity.set(0, 0, 0)
    //   chassisApi.angularVelocity.set(...angularVelocity)
    //   chassisApi.rotation.set(...rotation)
    // }
  })

  return (
    <>
      <group ref={vehicle} position={[0, 0, 0]}>
        <mesh ref={chassisBody} castShadow>
          <Suspense>
            <primitive
              object={gltf.scene}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
              receiveShadow
            >
              <Html center>
                <div
                  style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                  }}
                >
                  <div>Gamepad Connected: {gamepads[0] ? 'Yes' : 'No'}</div>
                  {gamepadDisplay}
                </div>
              </Html>
            </primitive>
          </Suspense>
        </mesh>
        <Wheel ref={wheels[0]} radius={radius} leftSide />
        <Wheel ref={wheels[1]} radius={radius} />
        <Wheel ref={wheels[2]} radius={radius} leftSide />
        <Wheel ref={wheels[3]} radius={radius} />
      </group>
    </>
  )
}
