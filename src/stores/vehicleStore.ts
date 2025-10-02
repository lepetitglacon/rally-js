import { create } from 'zustand'

export interface VehicleState {
  speed: number // km/h
  rpm: number // tours/minute
  gear: number // vitesse actuelle (-1 = marche arrière, 0 = point mort, 1-6 = vitesses)
  maxGear: number
  throttle: number // 0-100%
  brake: number // 0-100%
  steering: number // -100 à 100
  drift: boolean
  turboBoost: number // 0-100%
  lapTime: number // secondes
  bestLapTime: number | null
  currentLap: number
  position: number // position dans la course
  totalRacers: number
  damage: number // 0-100%
  fuel: number // 0-100%
}

interface VehicleStore extends VehicleState {
  setSpeed: (speed: number) => void
  setRpm: (rpm: number) => void
  setGear: (gear: number) => void
  setThrottle: (throttle: number) => void
  setBrake: (brake: number) => void
  setSteering: (steering: number) => void
  setDrift: (drift: boolean) => void
  setTurboBoost: (boost: number) => void
  updateLapTime: (time: number) => void
  completeLap: () => void
  setPosition: (position: number) => void
  setDamage: (damage: number) => void
  setFuel: (fuel: number) => void
  reset: () => void
}

const initialState: VehicleState = {
  speed: 0,
  rpm: 800,
  gear: 0,
  maxGear: 6,
  throttle: 0,
  brake: 0,
  steering: 0,
  drift: false,
  turboBoost: 0,
  lapTime: 0,
  bestLapTime: null,
  currentLap: 1,
  position: 1,
  totalRacers: 1,
  damage: 0,
  fuel: 100,
}

export const useVehicleStore = create<VehicleStore>(set => ({
  ...initialState,

  setSpeed: speed => set({ speed }),
  setRpm: rpm => set({ rpm }),
  setGear: gear => set({ gear }),
  setThrottle: throttle => set({ throttle }),
  setBrake: brake => set({ brake }),
  setSteering: steering => set({ steering }),
  setDrift: drift => set({ drift }),
  setTurboBoost: boost => set({ turboBoost: boost }),

  updateLapTime: time => set({ lapTime: time }),

  completeLap: () =>
    set(state => {
      const newBestLapTime =
        state.bestLapTime === null || state.lapTime < state.bestLapTime
          ? state.lapTime
          : state.bestLapTime

      return {
        currentLap: state.currentLap + 1,
        bestLapTime: newBestLapTime,
        lapTime: 0,
      }
    }),

  setPosition: position => set({ position }),
  setDamage: damage => set({ damage: Math.max(0, Math.min(100, damage)) }),
  setFuel: fuel => set({ fuel: Math.max(0, Math.min(100, fuel)) }),

  reset: () => set(initialState),
}))
