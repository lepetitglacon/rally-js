import { useState } from 'react'
import { useInputStore, type GameAction, type InputMapping } from '@/stores/inputStore'
import { type GamepadRef, useGamepads } from 'react-ts-gamepads'

interface InputMappingEditorProps {
  profileId: string
  action: GameAction
  actionLabel: string
  mappings: InputMapping[]
  onClose: () => void
}

export default function InputMappingEditor({
  profileId,
  action,
  actionLabel,
  mappings,
  onClose
}: InputMappingEditorProps) {
  const {
    addMapping,
    removeMapping,
    updateMapping
  } = useInputStore()

  const [isListening, setIsListening] = useState(false)
  const [newMappingType, setNewMappingType] = useState<'gamepad' | 'keyboard' | 'mouse' | 'wheel'>('gamepad')
  const [gamepads, setGamepads] = useState<GamepadRef>({})
  useGamepads(gamepads => setGamepads(gamepads))

  const startListening = () => {
    setIsListening(true)

    if (newMappingType === 'keyboard') {
      // Écouter les événements clavier
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault()
        const mapping: InputMapping = {
          type: 'keyboard',
          key: e.key,
          modifiers: {
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey
          }
        }
        addMapping(profileId, action, mapping)
        setIsListening(false)
        document.removeEventListener('keydown', handleKeyDown)
      }

      document.addEventListener('keydown', handleKeyDown)

      // Timeout pour arrêter l'écoute
      setTimeout(() => {
        setIsListening(false)
        document.removeEventListener('keydown', handleKeyDown)
      }, 5000)

    } else if (newMappingType === 'gamepad') {
      // Écouter les événements gamepad
      let lastValues: Record<string, number> = {}

      const checkGamepadInput = () => {
        Object.values(gamepads).forEach((gamepad, gamepadIndex) => {
          // Vérifier les boutons
          gamepad.buttons?.forEach((button, buttonIndex) => {
            const key = `gamepad-${gamepadIndex}-button-${buttonIndex}`
            if (button.pressed && !lastValues[key]) {
              const mapping: InputMapping = {
                type: 'gamepad',
                gamepadId: gamepadIndex,
                buttonIndex,
                deadzone: 0.1
              }
              addMapping(profileId, action, mapping)
              setIsListening(false)
              return
            }
            lastValues[key] = button.pressed ? 1 : 0
          })

          // Vérifier les axes
          gamepad.axes?.forEach((axis, axisIndex) => {
            const key = `gamepad-${gamepadIndex}-axis-${axisIndex}`
            const threshold = 0.5

            if (Math.abs(axis) > threshold && Math.abs(lastValues[key] || 0) <= threshold) {
              const mapping: InputMapping = {
                type: 'gamepad',
                gamepadId: gamepadIndex,
                axisIndex,
                axisDirection: axis > 0 ? 'positive' : 'negative',
                deadzone: 0.2
              }
              addMapping(profileId, action, mapping)
              setIsListening(false)
              return
            }
            lastValues[key] = axis
          })
        })

        if (isListening) {
          requestAnimationFrame(checkGamepadInput)
        }
      }

      checkGamepadInput()

      // Timeout pour arrêter l'écoute
      setTimeout(() => {
        setIsListening(false)
      }, 5000)
    }
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const formatMapping = (mapping: InputMapping): string => {
    switch (mapping.type) {
      case 'keyboard':
        const modifiers = []
        if (mapping.modifiers?.ctrl) modifiers.push('Ctrl')
        if (mapping.modifiers?.shift) modifiers.push('Shift')
        if (mapping.modifiers?.alt) modifiers.push('Alt')
        return `${modifiers.join(' + ')}${modifiers.length ? ' + ' : ''}${mapping.key}`

      case 'gamepad':
        if (mapping.buttonIndex !== undefined) {
          return `Manette ${mapping.gamepadId} - Bouton ${mapping.buttonIndex}`
        }
        if (mapping.axisIndex !== undefined) {
          return `Manette ${mapping.gamepadId} - Axe ${mapping.axisIndex} (${mapping.axisDirection})`
        }
        return 'Manette inconnue'

      case 'mouse':
        if (mapping.button !== undefined) {
          return `Souris - Bouton ${mapping.button}`
        }
        if (mapping.axis) {
          return `Souris - ${mapping.axis.toUpperCase()}`
        }
        return 'Souris inconnue'

      case 'wheel':
        return `Volant ${mapping.gamepadId} - Axe ${mapping.axisIndex}`

      default:
        return 'Mapping inconnu'
    }
  }

  return (
    <div className="mapping-editor">
      <div className="mapping-editor-header">
        <h3>Configuration : {actionLabel}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="mapping-editor-body">
        {/* Liste des mappings existants */}
        <div className="existing-mappings">
          <h4>Mappings actuels</h4>
          {mappings.length === 0 ? (
            <p className="no-mappings">Aucun mapping configuré</p>
          ) : (
            <div className="mappings-list">
              {mappings.map((mapping, index) => (
                <div key={index} className="mapping-item">
                  <span className="mapping-text">{formatMapping(mapping)}</span>
                  <button
                    className="remove-button"
                    onClick={() => removeMapping(profileId, action, index)}
                    title="Supprimer ce mapping"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ajouter un nouveau mapping */}
        <div className="add-mapping">
          <h4>Ajouter un mapping</h4>

          <div className="mapping-type-selector">
            <label>
              <input
                type="radio"
                name="mappingType"
                value="gamepad"
                checked={newMappingType === 'gamepad'}
                onChange={(e) => setNewMappingType(e.target.value as any)}
              />
              Manette
            </label>
            <label>
              <input
                type="radio"
                name="mappingType"
                value="keyboard"
                checked={newMappingType === 'keyboard'}
                onChange={(e) => setNewMappingType(e.target.value as any)}
              />
              Clavier
            </label>
            <label>
              <input
                type="radio"
                name="mappingType"
                value="mouse"
                checked={newMappingType === 'mouse'}
                onChange={(e) => setNewMappingType(e.target.value as any)}
              />
              Souris
            </label>
            <label>
              <input
                type="radio"
                name="mappingType"
                value="wheel"
                checked={newMappingType === 'wheel'}
                onChange={(e) => setNewMappingType(e.target.value as any)}
              />
              Volant
            </label>
          </div>

          <div className="listen-section">
            {isListening ? (
              <div className="listening-state">
                <p>🎯 En écoute... Appuyez sur un bouton ou bougez un axe</p>
                <p className="listening-instruction">
                  {newMappingType === 'keyboard' && 'Appuyez sur une touche'}
                  {newMappingType === 'gamepad' && 'Appuyez sur un bouton ou bougez un stick/gâchette'}
                  {newMappingType === 'mouse' && 'Cliquez ou bougez la souris'}
                  {newMappingType === 'wheel' && 'Tournez le volant ou appuyez sur une pédale'}
                </p>
                <button className="btn btn-secondary" onClick={stopListening}>
                  Arrêter l'écoute
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={startListening}>
                Capturer un {newMappingType === 'gamepad' ? 'input manette' :
                            newMappingType === 'keyboard' ? 'input clavier' :
                            newMappingType === 'mouse' ? 'input souris' : 'input volant'}
              </button>
            )}
          </div>
        </div>

        {/* État des gamepads connectées */}
        <div className="gamepad-status">
          <h4>État des contrôleurs</h4>
          {Object.keys(gamepads).length === 0 ? (
            <p>Aucune manette détectée</p>
          ) : (
            Object.values(gamepads).map((gamepad, index) => (
              <div key={index} className="gamepad-info">
                <strong>Manette {index}:</strong> {gamepad.id}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .mapping-editor {
          background: #2a2a2a;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          height: 100%;
          color: white;
        }

        .mapping-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #444;
          background: #333;
          border-radius: 8px 8px 0 0;
        }

        .mapping-editor-header h3 {
          margin: 0;
          color: #007acc;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .mapping-editor-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .existing-mappings, .add-mapping, .gamepad-status {
          background: #333;
          padding: 15px;
          border-radius: 6px;
        }

        h4 {
          margin: 0 0 15px 0;
          color: white;
          font-size: 16px;
        }

        .no-mappings {
          color: #888;
          font-style: italic;
          margin: 0;
        }

        .mappings-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mapping-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #404040;
          border-radius: 4px;
        }

        .mapping-text {
          flex: 1;
          color: white;
        }

        .remove-button {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          padding: 5px;
          font-size: 14px;
          border-radius: 3px;
          transition: background 0.2s;
        }

        .remove-button:hover {
          background: #ff6b6b;
          color: white;
        }

        .mapping-type-selector {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .mapping-type-selector label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          color: #ccc;
        }

        .mapping-type-selector input[type="radio"] {
          accent-color: #007acc;
        }

        .listen-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .listening-state {
          padding: 15px;
          background: #1a4a6b;
          border-radius: 4px;
          text-align: center;
        }

        .listening-state p {
          margin: 5px 0;
        }

        .listening-instruction {
          color: #ccc;
          font-size: 14px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-primary {
          background: #007acc;
          color: white;
        }

        .btn-primary:hover {
          background: #0066aa;
        }

        .btn-secondary {
          background: #555;
          color: white;
        }

        .btn-secondary:hover {
          background: #666;
        }

        .gamepad-info {
          padding: 8px;
          background: #404040;
          border-radius: 4px;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .gamepad-info:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}