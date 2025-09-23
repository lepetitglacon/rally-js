import { useCameraStore } from '@/modules/camera/camera.store.ts'
import CameraUi from '@/modules/camera/Camera.ui.tsx'

export default function Ui() {
  return (
    <div className="absolute top-0 left-0 p-4 z-10 pointer-events-none text-white">
      <CameraUi />
    </div>
  )
}
