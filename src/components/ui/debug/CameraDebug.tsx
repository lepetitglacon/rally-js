import { useCameraStore } from '@/modules/camera/camera.store'
import { useVehicleStore } from '@/stores/vehicleStore'

export default function CameraDebug() {
  const activeCamera = useCameraStore(state => state.active)
  const worldPosition = useVehicleStore(state => state.worldPosition)
  const worldRotation = useVehicleStore(state => state.worldRotation)

  return (
    <div className="fixed bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg font-mono text-sm space-y-2 pointer-events-none z-10">
      <div className="font-bold text-lg mb-2 border-b border-white/30 pb-2">
        📷 Camera Info
      </div>

      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Mode:</span>{' '}
          <span className="text-green-400 font-bold">{activeCamera}</span>
        </div>

        <div className="mt-3 pt-2 border-t border-white/30">
          <div className="text-gray-400 text-xs mb-1">Vehicle Position:</div>
          <div className="pl-2">
            <div>
              X:{' '}
              <span className="text-blue-400">
                {worldPosition[0].toFixed(2)}
              </span>
            </div>
            <div>
              Y:{' '}
              <span className="text-blue-400">
                {worldPosition[1].toFixed(2)}
              </span>
            </div>
            <div>
              Z:{' '}
              <span className="text-blue-400">
                {worldPosition[2].toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-white/30">
          <div className="text-gray-400 text-xs mb-1">Vehicle Rotation:</div>
          <div className="pl-2 text-xs">
            <div>
              X:{' '}
              <span className="text-purple-400">
                {worldRotation[0].toFixed(3)}
              </span>
            </div>
            <div>
              Y:{' '}
              <span className="text-purple-400">
                {worldRotation[1].toFixed(3)}
              </span>
            </div>
            <div>
              Z:{' '}
              <span className="text-purple-400">
                {worldRotation[2].toFixed(3)}
              </span>
            </div>
            <div>
              W:{' '}
              <span className="text-purple-400">
                {worldRotation[3].toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-white/30">
        Press C to toggle camera
      </div>
    </div>
  )
}
