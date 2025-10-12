import {
  FlyControls,
  OrbitControls,
  PointerLockControls,
} from '@react-three/drei'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCameraStore } from '@/stores/camera.store.ts'
import CarCamera from '@/modules/camera/CarCamera.three.tsx'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export default function CameraManager() {
  const threeCamera = useThree(state => state.camera)
  const setCameraInstance = useCameraStore(state => state.setCameraInstance)
  const activeCameraName = useCameraStore(state => state.active)
  const toggleCamera = useCameraStore(state => state.toggleCamera)
  const shifting = useCameraStore(state => state.shifting)
  const setShifting = useCameraStore(state => state.setShifting)

  // Synchronize the Three.js camera with the store
  useEffect(() => {
    setCameraInstance(threeCamera as any)
  }, [threeCamera, setCameraInstance])

  useHotkeys(['c'], () => {
    if (activeCameraName === 'fly') {
      // Exit pointer lock mode
      document.exitPointerLock()
    }
    toggleCamera()
  })

  useHotkeys(
    ['shift'],
    e => {
      setShifting(e.type === 'keydown')
    },
    { keyup: true, keydown: true },
  )

  return (
    <>
      {activeCameraName === 'orbit' && <OrbitControls />}
      {activeCameraName === 'fly' && (
        <>
          <FlyControls movementSpeed={shifting ? 500 : 100} />
          <PointerLockControls />
        </>
      )}
      {activeCameraName === 'car' && (
        <CarCamera distance={8} height={4} smoothness={0.05} />
      )}
    </>
  )
}
