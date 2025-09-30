import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types pour les différents types d'inputs
export type InputType = 'keyboard' | 'gamepad' | 'wheel' | 'mouse'

export type GamepadInput = {
  type: 'gamepad'
  gamepadId: number
  buttonIndex?: number
  axisIndex?: number
  axisDirection?: 'positive' | 'negative' | 'both'
  deadzone?: number
}

export type KeyboardInput = {
  type: 'keyboard'
  key: string
  modifiers?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
  }
}

export type MouseInput = {
  type: 'mouse'
  button?: number
  axis?: 'x' | 'y' | 'wheel'
  sensitivity?: number
}

export type WheelInput = {
  type: 'wheel'
  gamepadId: number
  axisIndex: number
  deadzone?: number
  sensitivity?: number
}

export type InputMapping =
  | GamepadInput
  | KeyboardInput
  | MouseInput
  | WheelInput

// Actions disponibles dans l'app
export type GameAction =
  | 'accelerate'
  | 'brake'
  | 'steerLeft'
  | 'steerRight'
  | 'handbrake'
  | 'reset'
  | 'changeCamera'
  | 'pauseMenu'
  | 'lookAround'

// Configuration d'un profil d'inputs
export interface InputProfile {
  id: string
  name: string
  description?: string
  mappings: Record<GameAction, InputMapping[]>
  settings: {
    steeringSensitivity: number
    accelerationSensitivity: number
    brakeSensitivity: number
    deadzone: number
  }
}

// État du store
interface InputState {
  // Profils d'inputs
  profiles: InputProfile[]
  activeProfileId: string | null

  // État actuel des inputs
  currentInputs: Record<GameAction, number> // Valeur entre -1 et 1

  // Actions pour gérer les profils
  createProfile: (profile: Omit<InputProfile, 'id'>) => string
  updateProfile: (id: string, updates: Partial<InputProfile>) => void
  deleteProfile: (id: string) => void
  setActiveProfile: (id: string) => void

  // Actions pour gérer les mappings
  addMapping: (
    profileId: string,
    action: GameAction,
    mapping: InputMapping,
  ) => void
  removeMapping: (
    profileId: string,
    action: GameAction,
    mappingIndex: number,
  ) => void
  updateMapping: (
    profileId: string,
    action: GameAction,
    mappingIndex: number,
    mapping: InputMapping,
  ) => void

  // Actions pour l'état des inputs
  updateInput: (action: GameAction, value: number) => void
  resetInputs: () => void

  // Utilitaires
  getActiveProfile: () => InputProfile | null
  getInputValue: (action: GameAction) => number
}

// Profils par défaut
const defaultProfiles: InputProfile[] = [
  {
    id: 'keyboard-default',
    name: 'Clavier par défaut',
    description: 'Configuration standard pour clavier',
    mappings: {
      accelerate: [
        { type: 'keyboard', key: 'ArrowUp' },
        { type: 'keyboard', key: 'w' },
      ],
      brake: [
        { type: 'keyboard', key: 'ArrowDown' },
        { type: 'keyboard', key: 's' },
      ],
      steerLeft: [
        { type: 'keyboard', key: 'ArrowLeft' },
        { type: 'keyboard', key: 'a' },
      ],
      steerRight: [
        { type: 'keyboard', key: 'ArrowRight' },
        { type: 'keyboard', key: 'd' },
      ],
      handbrake: [{ type: 'keyboard', key: ' ' }], // Espace
      reset: [{ type: 'keyboard', key: 'r' }],
      changeCamera: [{ type: 'keyboard', key: 'c' }],
      pauseMenu: [{ type: 'keyboard', key: 'Escape' }],
      lookAround: [
        { type: 'mouse', axis: 'x' },
        { type: 'mouse', axis: 'y' },
      ],
    },
    settings: {
      steeringSensitivity: 1.0,
      accelerationSensitivity: 1.0,
      brakeSensitivity: 1.0,
      deadzone: 0.1,
    },
  },
  {
    id: 'gamepad-default',
    name: 'Manette par défaut',
    description: 'Configuration standard pour manette Xbox/PlayStation',
    mappings: {
      accelerate: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 7 }], // RT
      brake: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 6 }], // LT
      steerLeft: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 0,
          axisDirection: 'negative',
          deadzone: 0.2,
        },
      ],
      steerRight: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 0,
          axisDirection: 'positive',
          deadzone: 0.2,
        },
      ],
      handbrake: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 0 }], // A/X
      reset: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 3 }], // Y/Triangle
      changeCamera: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 2 }], // X/Square
      pauseMenu: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 9 }], // Menu/Options
      lookAround: [
        { type: 'gamepad', gamepadId: 0, axisIndex: 2, deadzone: 0.2 },
        { type: 'gamepad', gamepadId: 0, axisIndex: 3, deadzone: 0.2 },
      ],
    },
    settings: {
      steeringSensitivity: 1.2,
      accelerationSensitivity: 1.0,
      brakeSensitivity: 1.0,
      deadzone: 0.2,
    },
  },
]

export const useInputStore = create<InputState>()(
  persist(
    (set, get) => ({
      // État initial
      profiles: defaultProfiles,
      activeProfileId: 'gamepad-default',
      currentInputs: {
        accelerate: 0,
        brake: 0,
        steerLeft: 0,
        steerRight: 0,
        handbrake: 0,
        reset: 0,
        changeCamera: 0,
        pauseMenu: 0,
        lookAround: 0,
      },

      // Actions pour les profils
      createProfile: profile => {
        const id = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newProfile: InputProfile = { ...profile, id }

        set(state => ({
          profiles: [...state.profiles, newProfile],
        }))

        return id
      },

      updateProfile: (id, updates) => {
        set(state => ({
          profiles: state.profiles.map(profile =>
            profile.id === id ? { ...profile, ...updates } : profile,
          ),
        }))
      },

      deleteProfile: id => {
        set(state => {
          const newProfiles = state.profiles.filter(p => p.id !== id)
          const newActiveId =
            state.activeProfileId === id
              ? newProfiles[0]?.id || null
              : state.activeProfileId

          return {
            profiles: newProfiles,
            activeProfileId: newActiveId,
          }
        })
      },

      setActiveProfile: id => {
        set({ activeProfileId: id })
      },

      // Actions pour les mappings
      addMapping: (profileId, action, mapping) => {
        set(state => ({
          profiles: state.profiles.map(profile =>
            profile.id === profileId
              ? {
                  ...profile,
                  mappings: {
                    ...profile.mappings,
                    [action]: [...profile.mappings[action], mapping],
                  },
                }
              : profile,
          ),
        }))
      },

      removeMapping: (profileId, action, mappingIndex) => {
        set(state => ({
          profiles: state.profiles.map(profile =>
            profile.id === profileId
              ? {
                  ...profile,
                  mappings: {
                    ...profile.mappings,
                    [action]: profile.mappings[action].filter(
                      (_, i) => i !== mappingIndex,
                    ),
                  },
                }
              : profile,
          ),
        }))
      },

      updateMapping: (profileId, action, mappingIndex, mapping) => {
        set(state => ({
          profiles: state.profiles.map(profile =>
            profile.id === profileId
              ? {
                  ...profile,
                  mappings: {
                    ...profile.mappings,
                    [action]: profile.mappings[action].map((m, i) =>
                      i === mappingIndex ? mapping : m,
                    ),
                  },
                }
              : profile,
          ),
        }))
      },

      // Actions pour l'état des inputs
      updateInput: (action, value) => {
        set(state => ({
          currentInputs: {
            ...state.currentInputs,
            [action]: Math.max(-1, Math.min(1, value)),
          },
        }))
      },

      resetInputs: () => {
        set(state => ({
          currentInputs: Object.keys(state.currentInputs).reduce(
            (acc, key) => {
              acc[key as GameAction] = 0
              return acc
            },
            {} as Record<GameAction, number>,
          ),
        }))
      },

      // Utilitaires
      getActiveProfile: () => {
        const state = get()
        return state.profiles.find(p => p.id === state.activeProfileId) || null
      },

      getInputValue: action => {
        return get().currentInputs[action] || 0
      },
    }),
    {
      name: 'rally-input-store',
      partialize: state => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
    },
  ),
)
