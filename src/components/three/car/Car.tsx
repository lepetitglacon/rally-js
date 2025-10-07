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
import { useInputManager } from '@/hooks/useInputManager'
import { useVehicleStore } from '@/stores/vehicleStore'

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

  // Initialize input manager to process gamepad/keyboard inputs
  const {
    getSteeringValue,
    getAccelerationValue,
    getBrakeValue,
    getHandbrakeValue,
  } = useInputManager({ gamepads, enabled: true })

  // Vehicle store for UI display
  const { setThrottle, setBrake, setSteering } = useVehicleStore()

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

  useEffect(() => vehicleApi.sliding.subscribe(v => {}), [])

  // Constants for vehicle physics
  const maxEngineForce = 1500
  const maxSteerValue = 0.5
  const maxBrakeForce = 100

  useFrame(() => {
    // Get input values from the input manager
    const steering = getSteeringValue() // -1 (left) to 1 (right)
    const acceleration = getAccelerationValue() // 0 to 1
    const brake = getBrakeValue() // 0 to 1
    const handbrake = getHandbrakeValue() // 0 to 1

    // Apply engine force to rear wheels (wheels 2 and 3)
    const engineForce = acceleration * maxEngineForce * -1
    vehicleApi.applyEngineForce(engineForce, 2)
    vehicleApi.applyEngineForce(engineForce, 3)

    // Apply steering to front wheels (wheels 0 and 1)
    const steerValue = steering * maxSteerValue
    vehicleApi.setSteeringValue(steerValue, 0)
    vehicleApi.setSteeringValue(steerValue, 1)

    // Apply brake force
    const brakeForce = (brake + handbrake) * maxBrakeForce
    vehicleApi.setBrake(brakeForce, 0)
    vehicleApi.setBrake(brakeForce, 1)
    vehicleApi.setBrake(brakeForce, 2)
    vehicleApi.setBrake(brakeForce, 3)

    // Update vehicle store for UI display
    setThrottle(acceleration * 100)
    setBrake(brake * 100)
    setSteering(steering * 100)
  })

  return (
    <>
      <group ref={vehicle} position={[0, 0, 0]}>
        <mesh ref={chassisBody} castShadow>
          <Suspense>
            <primitive
              object={gltf.scene}
              rotation={[0, -Math.PI / 2, 0]}
              castShadow
              receiveShadow
            >
              <Html center zIndexRange={[100, 0]}>
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
