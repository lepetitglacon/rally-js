import { useCameraStore } from '@/modules/camera/camera.store.ts'

export default function CameraUi() {
  const activeCameraName = useCameraStore(state => state.active)
  const shifting = useCameraStore(state => state.shifting)

  return (
    <div className="pointer-events-auto p-2 bg-opacity-10 text-white rounded">
      <div>Camera: {activeCameraName}</div>
      <div>Camera shifting: {JSON.stringify(shifting)}</div>
    </div>
  )
}
