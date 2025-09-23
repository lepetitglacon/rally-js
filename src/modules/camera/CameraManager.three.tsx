import {
  FlyControls,
  OrbitControls,
  PointerLockControls,
} from '@react-three/drei'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCameraStore } from '@/modules/camera/camera.store.ts'

export default function CameraManager() {
  const activeCameraName = useCameraStore(state => state.active)
  const toggleCamera = useCameraStore(state => state.toggleCamera)

  useHotkeys(['c'], () => {
    if (activeCameraName === 'fly') {
      // Exit pointer lock mode
      document.exitPointerLock()
    }
    toggleCamera()
  })

  return (
    <>
      {activeCameraName === 'orbit' && <OrbitControls />}
      {activeCameraName === 'fly' && (
        <>
          <FlyControls movementSpeed={100} />
          <PointerLockControls />
        </>
      )}
    </>
  )
}
