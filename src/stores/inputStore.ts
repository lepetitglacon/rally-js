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
  | 'clutch'
  | 'steerLeft'
  | 'steerRight'
  | 'handbrake'
  | 'gearUp'
  | 'gearDown'
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
  copyProfile: (sourceId: string) => string

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

// IDs des profils par défaut (non supprimables)
export const DEFAULT_PROFILE_IDS = [
  'keyboard-default',
  'gamepad-default',
  'logitech-g29',
]

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
      clutch: [],
      steerLeft: [
        { type: 'keyboard', key: 'ArrowLeft' },
        { type: 'keyboard', key: 'a' },
      ],
      steerRight: [
        { type: 'keyboard', key: 'ArrowRight' },
        { type: 'keyboard', key: 'd' },
      ],
      handbrake: [{ type: 'keyboard', key: ' ' }], // Espace
      gearUp: [{ type: 'keyboard', key: 'e' }],
      gearDown: [{ type: 'keyboard', key: 'q' }],
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
      clutch: [],
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
      gearUp: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 5 }], // RB
      gearDown: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 4 }], // LB
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
  {
    id: 'logitech-g29',
    name: 'Logitech G29',
    description: 'Configuration pour volant Logitech G29',
    mappings: {
      accelerate: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 2,
          axisDirection: 'positive',
          deadzone: 0.05,
        },
      ],
      brake: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 5,
          axisDirection: 'positive',
          deadzone: 0.05,
        },
      ],
      clutch: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 1,
          axisDirection: 'positive',
          deadzone: 0.05,
        },
      ],
      steerLeft: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 0,
          axisDirection: 'negative',
          deadzone: 0.05,
        },
      ],
      steerRight: [
        {
          type: 'gamepad',
          gamepadId: 0,
          axisIndex: 0,
          axisDirection: 'positive',
          deadzone: 0.05,
        },
      ],
      handbrake: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 0 }], // X
      gearUp: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 4 }], // L1
      gearDown: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 5 }], // R1
      reset: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 3 }], // Square
      changeCamera: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 2 }], // Circle
      pauseMenu: [{ type: 'gamepad', gamepadId: 0, buttonIndex: 9 }], // Options
      lookAround: [
        { type: 'gamepad', gamepadId: 0, axisIndex: 3, deadzone: 0.2 },
        { type: 'gamepad', gamepadId: 0, axisIndex: 4, deadzone: 0.2 },
      ],
    },
    settings: {
      steeringSensitivity: 1.0,
      accelerationSensitivity: 1.0,
      brakeSensitivity: 1.0,
      deadzone: 0.05,
    },
  },
]

export const useInputStore = create<InputState>()(
  persist(
    (set, get) => ({
      // État initial - forcer l'utilisation des profils par défaut
      profiles: defaultProfiles,
      activeProfileId: 'logitech-g29',
      currentInputs: {
        accelerate: 0,
        brake: 0,
        clutch: 0,
        steerLeft: 0,
        steerRight: 0,
        handbrake: 0,
        gearUp: 0,
        gearDown: 0,
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
        // Empêcher la suppression des profils par défaut
        if (DEFAULT_PROFILE_IDS.includes(id)) {
          console.warn('Cannot delete default profiles')
          return
        }

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

      copyProfile: sourceId => {
        const state = get()
        const sourceProfile = state.profiles.find(p => p.id === sourceId)
        if (!sourceProfile) return ''

        const id = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newProfile: InputProfile = {
          ...sourceProfile,
          id,
          name: `${sourceProfile.name} (Copie)`,
          description: `Copie de ${sourceProfile.name}`,
        }

        set(state => ({
          profiles: [...state.profiles, newProfile],
        }))

        return id
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
      version: 6, // Changé pour forcer le reset du cache
      partialize: state => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
      merge: (persistedState, currentState) => {
        // Toujours utiliser les profils par défaut du code
        const persisted = persistedState as Partial<InputState>
        return {
          ...currentState,
          // Garder seulement les profils custom du localStorage
          profiles: [
            ...defaultProfiles,
            ...(persisted?.profiles?.filter(
              p => !DEFAULT_PROFILE_IDS.includes(p.id),
            ) || []),
          ],
          activeProfileId: persisted?.activeProfileId || 'logitech-g29',
        }
      },
    },
  ),
)
