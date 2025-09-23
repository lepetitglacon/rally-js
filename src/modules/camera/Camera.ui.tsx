import { useCameraStore } from '@/modules/camera/camera.store.ts'

export default function CameraUi() {
  const activeCameraName = useCameraStore(state => state.active)

  return (
    <div className="pointer-events-auto p-2 bg-black bg-opacity-50 text-white rounded">
      <div>Camera: {activeCameraName}</div>
    </div>
  )
}
