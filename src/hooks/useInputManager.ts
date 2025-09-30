import { useCallback, useEffect } from 'react'
import {
  type GameAction,
  type InputMapping,
  useInputStore,
} from '@/stores/inputStore'
import { type GamepadRef } from 'react-ts-gamepads'

interface UseInputManagerProps {
  gamepads?: GamepadRef
  enabled?: boolean
}

export const useInputManager = ({
  gamepads = {},
  enabled = true,
}: UseInputManagerProps = {}) => {
  const {
    getActiveProfile,
    updateInput,
    resetInputs,
    currentInputs,
    getInputValue,
  } = useInputStore()

  // Fonction pour évaluer un mapping d'input
  const evaluateMapping = useCallback(
    (mapping: InputMapping): number => {
      switch (mapping.type) {
        case 'gamepad': {
          const gamepad = gamepads[mapping.gamepadId]
          if (!gamepad) return 0

          if (mapping.buttonIndex !== undefined) {
            const button = gamepad.buttons[mapping.buttonIndex]
            return button?.pressed ? button.value || 1 : 0
          }

          if (mapping.axisIndex !== undefined) {
            const axisValue = gamepad.axes[mapping.axisIndex] || 0
            const deadzone = mapping.deadzone || 0.1

            // Appliquer la deadzone
            if (Math.abs(axisValue) < deadzone) return 0

            switch (mapping.axisDirection) {
              case 'positive':
                return Math.max(0, axisValue)
              case 'negative':
                return Math.max(0, -axisValue)
              case 'both':
              default:
                return axisValue
            }
          }

          return 0
        }

        case 'keyboard': {
          // Pour le clavier, nous utiliserons un système d'événements global
          // Cela nécessiterait une implémentation plus complexe avec useEffect
          return 0
        }

        case 'mouse': {
          // Pour la souris, même principe que le clavier
          return 0
        }

        case 'wheel': {
          const gamepad = gamepads[mapping.gamepadId]
          if (!gamepad) return 0

          const axisValue = gamepad.axes[mapping.axisIndex] || 0
          const deadzone = mapping.deadzone || 0.05
          const sensitivity = mapping.sensitivity || 1

          if (Math.abs(axisValue) < deadzone) return 0
          return axisValue * sensitivity
        }

        default:
          return 0
      }
    },
    [gamepads],
  )

  // Fonction pour traiter tous les inputs
  const processInputs = useCallback(() => {
    if (!enabled) return

    const activeProfile = getActiveProfile()
    if (!activeProfile) return

    // Traiter chaque action
    Object.entries(activeProfile.mappings).forEach(([action, mappings]) => {
      let finalValue = 0

      // Évaluer tous les mappings pour cette action
      mappings.forEach(mapping => {
        const value = evaluateMapping(mapping)
        // Pour la plupart des actions, on prend la valeur maximale
        // Pour le steering, on fait la somme (gauche + droite)
        if (action === 'steerLeft' || action === 'steerRight') {
          finalValue += value
        } else {
          finalValue = Math.max(finalValue, Math.abs(value))
        }
      })

      // Appliquer la sensibilité
      switch (action as GameAction) {
        case 'steerLeft':
        case 'steerRight':
          finalValue *= activeProfile.settings.steeringSensitivity
          break
        case 'accelerate':
          finalValue *= activeProfile.settings.accelerationSensitivity
          break
        case 'brake':
          finalValue *= activeProfile.settings.brakeSensitivity
          break
      }

      // Clamper la valeur entre -1 et 1
      finalValue = Math.max(-1, Math.min(1, finalValue))

      updateInput(action as GameAction, finalValue)
    })
  }, [enabled, getActiveProfile, evaluateMapping, updateInput])

  // Traiter les inputs à chaque frame
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(processInputs, 16) // ~60fps
    return () => clearInterval(interval)
  }, [processInputs, enabled])

  // Reset des inputs quand le composant se démonte
  useEffect(() => {
    return () => resetInputs()
  }, [resetInputs])

  // Fonctions helper pour récupérer les valeurs d'inputs spécifiques
  const getSteeringValue = useCallback(() => {
    const left = getInputValue('steerLeft')
    const right = getInputValue('steerRight')
    return right - left // -1 (gauche) à 1 (droite)
  }, [getInputValue])

  const getAccelerationValue = useCallback(() => {
    return getInputValue('accelerate')
  }, [getInputValue])

  const getBrakeValue = useCallback(() => {
    return getInputValue('brake')
  }, [getInputValue])

  const getHandbrakeValue = useCallback(() => {
    return getInputValue('handbrake')
  }, [getInputValue])

  return {
    // Valeurs d'inputs
    currentInputs,
    getInputValue,

    // Helpers spécifiques
    getSteeringValue,
    getAccelerationValue,
    getBrakeValue,
    getHandbrakeValue,

    // Contrôle
    processInputs,
    resetInputs,
  }
}
