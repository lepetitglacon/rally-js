import {
  FlyControls,
  OrbitControls,
  PointerLockControls,
} from '@react-three/drei'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCameraStore } from '@/modules/camera/camera.store.ts'
import CarCamera from '@/modules/camera/CarCamera.three.tsx'

export default function CameraManager() {
  const activeCameraName = useCameraStore(state => state.active)
  const toggleCamera = useCameraStore(state => state.toggleCamera)
  const shifting = useCameraStore(state => state.shifting)
  const setShifting = useCameraStore(state => state.setShifting)

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
