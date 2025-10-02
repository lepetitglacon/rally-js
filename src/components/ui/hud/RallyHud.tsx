import { useVehicleStore } from '@/stores/vehicleStore'
import { useInputStore } from '@/stores/inputStore'

export default function RallyHud() {
  const {
    speed,
    rpm,
    gear,
    maxGear,
    drift,
    turboBoost,
    lapTime,
    bestLapTime,
    currentLap,
    position,
    totalRacers,
    damage,
    fuel,
  } = useVehicleStore()

  // Get input values from input store
  const { getInputValue, getActiveProfile, currentInputs } = useInputStore()
  const throttle = Math.round(getInputValue('accelerate') * 100)
  const brake = Math.round(getInputValue('brake') * 100)
  const steerLeft = getInputValue('steerLeft')
  const steerRight = getInputValue('steerRight')
  const steering = Math.round((steerLeft - steerRight) * 100)

  // Debug - log current profile and inputs
  const activeProfile = getActiveProfile()
  console.log('Active Profile:', activeProfile?.name)
  console.log('Current Inputs:', currentInputs)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  const getGearDisplay = () => {
    if (gear === -1) return 'R'
    if (gear === 0) return 'N'
    return gear.toString()
  }

  const rpmPercentage = (rpm / 8000) * 100
  const speedPercentage = (speed / 300) * 100

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top Left - Position & Lap */}
      <div className="absolute top-6 left-6 text-white">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/20">
          <div className="text-5xl font-bold text-yellow-400">
            {position}
            <span className="text-xl text-white/60">/{totalRacers}</span>
          </div>
          <div className="text-sm text-white/80 mt-1">LAP {currentLap}</div>
        </div>

        {/* Lap Times */}
        <div className="mt-4 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
          <div className="text-xs text-white/60 mb-1">CURRENT LAP</div>
          <div className="text-2xl font-mono font-bold text-green-400">
            {formatTime(lapTime)}
          </div>
          {bestLapTime !== null && (
            <>
              <div className="text-xs text-white/60 mt-2 mb-1">BEST LAP</div>
              <div className="text-lg font-mono text-blue-400">
                {formatTime(bestLapTime)}
              </div>
            </>
          )}
        </div>

        {/* Lap Times */}
        <div className="mt-4 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
          <pre>{JSON.stringify(currentInputs, null, 2)}</pre>
        </div>
      </div>

      {/* Top Right - Damage & Fuel */}
      <div className="absolute top-6 right-6 text-white space-y-3">
        {/* Fuel */}
        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
          <div className="text-xs text-white/60 mb-2">FUEL</div>
          <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                fuel > 30 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${fuel}%` }}
            />
          </div>
          <div className="text-sm text-right mt-1">{Math.round(fuel)}%</div>
        </div>

        {/* Damage */}
        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
          <div className="text-xs text-white/60 mb-2">DAMAGE</div>
          <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                damage < 30
                  ? 'bg-green-500'
                  : damage < 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${damage}%` }}
            />
          </div>
          <div className="text-sm text-right mt-1">{Math.round(damage)}%</div>
        </div>

        {/* Turbo Boost */}
        {turboBoost > 0 && (
          <div className="bg-blue-600/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-blue-400 animate-pulse">
            <div className="text-xs text-white mb-2">TURBO BOOST</div>
            <div className="w-32 h-3 bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100"
                style={{ width: `${turboBoost}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right - Speedometer with RPM Circle */}
      <div className="absolute bottom-8 right-8 text-white">
        <div className="relative">
          {/* Input Indicators - Above the circle */}
          <div className="absolute bottom-full right-0 mb-4 space-y-2">
            {/* Throttle */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <div className="text-xs text-white/80 w-20">THROTTLE</div>
              <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${throttle}%` }}
                />
              </div>
              <div className="text-xs text-white/60 w-10 text-right">
                {Math.round(throttle)}%
              </div>
            </div>

            {/* Brake */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <div className="text-xs text-white/80 w-20">BRAKE</div>
              <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-100"
                  style={{ width: `${brake}%` }}
                />
              </div>
              <div className="text-xs text-white/60 w-10 text-right">
                {Math.round(brake)}%
              </div>
            </div>

            {/* Steering */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <div className="text-xs text-white/80 w-20">STEERING</div>
              <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/40" />
                <div
                  className="h-full bg-blue-500 transition-all duration-100 absolute top-0"
                  style={{
                    width: `${Math.abs(steering) / 2}%`,
                    left:
                      steering < 0 ? `${50 - Math.abs(steering) / 2}%` : '50%',
                  }}
                />
              </div>
              <div className="text-xs text-white/60 w-10 text-right">
                {Math.round(steering)}
              </div>
            </div>
          </div>

          {/* RPM Circle */}
          <div className="relative w-64 h-64">
            {/* Background circle */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              {/* RPM Progress */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeDasharray={`${(rpmPercentage / 100) * 283} 283`}
                strokeLinecap="round"
                className={`transition-all duration-100 ${
                  rpmPercentage > 90
                    ? 'stroke-red-500'
                    : rpmPercentage > 70
                      ? 'stroke-yellow-500'
                      : 'stroke-green-500'
                }`}
              />
            </svg>

            {/* Center content - Speed and Gear */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center">
                {/* Speed */}
                <div className="text-6xl font-bold tabular-nums leading-none">
                  {Math.round(speed)}
                </div>
                <div className="text-sm text-white/60 mt-1">KM/H</div>

                {/* Gear */}
                <div
                  className={`mt-4 text-4xl font-bold w-16 h-16 flex items-center justify-center rounded-lg border-2 ${
                    gear === 0
                      ? 'border-gray-500 text-gray-400'
                      : gear === -1
                        ? 'border-purple-500 text-purple-400'
                        : 'border-green-500 text-green-400'
                  }`}
                >
                  {getGearDisplay()}
                </div>
                <div className="text-xs text-white/60 mt-1">GEAR</div>
              </div>
            </div>

            {/* RPM value */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center bg-black/60 backdrop-blur-sm px-4 py-1 rounded-lg border border-white/20">
              <div className="text-xs text-white/60">RPM</div>
              <div className="text-lg font-mono font-bold">
                {Math.round(rpm)}
              </div>
            </div>
          </div>

          {/* Drift Indicator */}
          {drift && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="bg-orange-500/80 px-6 py-2 rounded-full border border-orange-400 animate-pulse">
                <span className="text-sm font-bold">🔥 DRIFT!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
