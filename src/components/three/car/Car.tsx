import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { LoaderType } from '@/components/three/stage/Stage.tsx'
import gltfFile from '@/assets/gltf/subaru.glb?url'
import {
  useBox,
  useRaycastVehicle,
  type WheelInfoOptions,
} from '@react-three/cannon'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import Wheel from '@/components/three/car/Wheel.tsx'

export default function Car({
  width = 1.5,
  height = 0.5,
  front = 1.2,
  back = -1.2,
  radius = 0.4,
  position = [0, 100, 0],
  rotation = [0, 0, 0],
  angularVelocity = [0, 0, 0],
}) {
  const gltf: LoaderType = useLoader(GLTFLoader, gltfFile)

  const wheels = [
    useRef<Group>(null),
    useRef<Group>(null),
    useRef<Group>(null),
    useRef<Group>(null),
  ]

  // const controls = useControls()

  const wheelInfo: WheelInfoOptions = {
    axleLocal: [-1, 0, 0], // This is inverted for asymmetrical wheel models (left v. right sided)
    customSlidingRotationalSpeed: -30,
    dampingCompression: 4.4,
    dampingRelaxation: 10,
    directionLocal: [0, -1, 0], // set to same as Physics Gravity
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

  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      angularVelocity,
      args: [1.7, 1, 4],
      mass: 500,
      onCollide: e => console.log('bonk', e.body.userData),
      position,
      rotation,
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

  return (
    <>
      <group ref={vehicle} position={[0, -25, 0]}>
        <mesh ref={chassisBody} castShadow />
        {/*<Chassis ref={chassisBody} />*/}
        <Wheel ref={wheels[0]} radius={radius} leftSide />
        <Wheel ref={wheels[1]} radius={radius} />
        <Wheel ref={wheels[2]} radius={radius} leftSide />
        <Wheel ref={wheels[3]} radius={radius} />
      </group>
    </>
  )
}
