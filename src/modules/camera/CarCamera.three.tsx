import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Quaternion, Vector3 } from 'three'
import { useVehicleStore } from '@/stores/vehicleStore'

interface CarCameraProps {
  distance?: number
  height?: number
  smoothness?: number
}

export default function CarCamera({
  distance = 5,
  height = 3,
  smoothness = 0.1,
}: CarCameraProps) {
  const { camera } = useThree()
  const currentPosition = useRef(new Vector3())
  const currentLookAt = useRef(new Vector3())

  useFrame(() => {
    // Get car position and rotation from store directly without triggering re-render
    const worldPosition = useVehicleStore.getState().worldPosition
    const worldRotation = useVehicleStore.getState().worldRotation

    // Get car position and rotation from store
    const carPosition = new Vector3(
      worldPosition[0],
      worldPosition[1],
      worldPosition[2],
    )
    const carQuaternion = new Quaternion(
      worldRotation[0],
      worldRotation[1],
      worldRotation[2],
      worldRotation[3],
    )

    // Get car forward direction from its quaternion
    const forwardDirection = new Vector3(0, 0, 1).applyQuaternion(carQuaternion)

    // Calculate ideal camera position behind the car
    // Behind = opposite of forward direction
    const idealOffset = new Vector3()
      .addScaledVector(forwardDirection, -distance) // Behind the car
      .addScaledVector(new Vector3(0, 1, 0), height) // Above the car

    const idealPosition = new Vector3().addVectors(carPosition, idealOffset)

    // Smoothly interpolate camera position
    currentPosition.current.lerp(idealPosition, smoothness)
    camera.position.copy(currentPosition.current)

    // Smoothly interpolate camera look-at target
    const lookAtTarget = carPosition.clone()
    lookAtTarget.y += 1 // Look at a point slightly above the car
    currentLookAt.current.lerp(lookAtTarget, smoothness)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
