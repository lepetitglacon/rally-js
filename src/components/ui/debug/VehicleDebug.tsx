import { useVehicleStore } from '@/stores/vehicle.store.ts'

export default function VehicleDebug() {
  const speed = useVehicleStore(state => state.speed)
  const rpm = useVehicleStore(state => state.rpm)
  const gear = useVehicleStore(state => state.gear)
  const throttle = useVehicleStore(state => state.throttle)
  const brake = useVehicleStore(state => state.brake)
  const steering = useVehicleStore(state => state.steering)
  const fuel = useVehicleStore(state => state.fuel)
  const damage = useVehicleStore(state => state.damage)

  const getGearDisplay = (gear: number) => {
    if (gear === -1) return 'R'
    if (gear === 0) return 'N'
    return gear.toString()
  }

  return (
    <div className="fixed bottom-[340px] left-4 bg-black/70 text-white p-4 rounded-lg font-mono text-sm space-y-2 pointer-events-none z-10">
      <div className="font-bold text-lg mb-2 border-b border-white/30 pb-2">
        🏎️ Vehicle Info
      </div>

      <div className="space-y-1">
        {/* Speed & RPM */}
        <div className="flex justify-between gap-4">
          <div>
            <span className="text-gray-400">Speed:</span>{' '}
            <span className="text-green-400 font-bold">{speed.toFixed(0)}</span>{' '}
            <span className="text-gray-500">km/h</span>
          </div>
          <div>
            <span className="text-gray-400">RPM:</span>{' '}
            <span className="text-yellow-400 font-bold">{rpm.toFixed(0)}</span>
          </div>
        </div>

        {/* Gear */}
        <div>
          <span className="text-gray-400">Gear:</span>{' '}
          <span className="text-cyan-400 font-bold text-xl">
            {getGearDisplay(gear)}
          </span>
        </div>

        {/* Inputs */}
        <div className="mt-3 pt-2 border-t border-white/30">
          <div className="text-gray-400 text-xs mb-1">Inputs:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-20">Throttle:</span>
              <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${throttle}%` }}
                />
              </div>
              <span className="text-green-400 w-12 text-right">
                {throttle.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-20">Brake:</span>
              <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${brake}%` }}
                />
              </div>
              <span className="text-red-400 w-12 text-right">
                {brake.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-20">Steering:</span>
              <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden relative">
                <div className="absolute left-1/2 w-0.5 h-full bg-white/30" />
                <div
                  className="bg-blue-500 h-full transition-all absolute"
                  style={{
                    left: steering >= 0 ? '50%' : `${50 + steering / 2}%`,
                    width: `${Math.abs(steering) / 2}%`,
                  }}
                />
              </div>
              <span className="text-blue-400 w-12 text-right">
                {steering.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 pt-2 border-t border-white/30 grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-400 text-xs">Fuel:</span>{' '}
            <span
              className={`font-bold ${fuel > 30 ? 'text-green-400' : 'text-red-400'}`}
            >
              {fuel.toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Damage:</span>{' '}
            <span
              className={`font-bold ${damage < 30 ? 'text-green-400' : 'text-red-400'}`}
            >
              {damage.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
