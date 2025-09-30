import { useState } from 'react'
import { useInputStore, type GameAction, type InputProfile } from '@/stores/inputStore'
import InputMappingEditor from './InputMappingEditor'
import ProfileSelector from './ProfileSelector'

interface ProfileManagerProps {
  onClose?: () => void
}

export default function ProfileManager({ onClose }: ProfileManagerProps) {
  const {
    profiles,
    getActiveProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile
  } = useInputStore()

  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null)
  const [editingProfile, setEditingProfile] = useState<string | null>(null)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const activeProfile = getActiveProfile()

  const gameActions: GameAction[] = [
    'accelerate',
    'brake',
    'steerLeft',
    'steerRight',
    'handbrake',
    'reset',
    'changeCamera',
    'pauseMenu',
    'lookAround'
  ]

  const actionLabels: Record<GameAction, string> = {
    accelerate: 'Accélérer',
    brake: 'Freiner',
    steerLeft: 'Tourner à gauche',
    steerRight: 'Tourner à droite',
    handbrake: 'Frein à main',
    reset: 'Reset véhicule',
    changeCamera: 'Changer caméra',
    pauseMenu: 'Menu pause',
    lookAround: 'Regarder autour'
  }

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return

    const newProfile: Omit<InputProfile, 'id'> = {
      name: newProfileName,
      description: 'Profil personnalisé',
      mappings: {
        accelerate: [],
        brake: [],
        steerLeft: [],
        steerRight: [],
        handbrake: [],
        reset: [],
        changeCamera: [],
        pauseMenu: [],
        lookAround: []
      },
      settings: {
        steeringSensitivity: 1.0,
        accelerationSensitivity: 1.0,
        brakeSensitivity: 1.0,
        deadzone: 0.1
      }
    }

    const id = createProfile(newProfile)
    setActiveProfile(id)
    setNewProfileName('')
    setIsCreatingProfile(false)
  }

  return (
    <div className="profile-manager">
      <div className="profile-manager-overlay" onClick={onClose} />
      <div className="profile-manager-content">
        <div className="profile-manager-header">
          <h2>Gestion des Profils d'Inputs</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="profile-manager-body">
          {/* Sélecteur de profil */}
          <div className="profile-selector-section">
            <ProfileSelector />

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={() => setIsCreatingProfile(true)}
              >
                Nouveau Profil
              </button>

              {activeProfile && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingProfile(activeProfile.id)}
                >
                  Modifier Profil
                </button>
              )}
            </div>

            {isCreatingProfile && (
              <div className="create-profile-form">
                <input
                  type="text"
                  placeholder="Nom du profil"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="profile-name-input"
                />
                <button onClick={handleCreateProfile} className="btn btn-primary">
                  Créer
                </button>
                <button
                  onClick={() => setIsCreatingProfile(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Liste des actions */}
          {activeProfile && (
            <div className="actions-section">
              <h3>Actions disponibles</h3>
              <div className="actions-list">
                {gameActions.map(action => (
                  <div
                    key={action}
                    className={`action-item ${selectedAction === action ? 'selected' : ''}`}
                    onClick={() => setSelectedAction(action)}
                  >
                    <div className="action-info">
                      <span className="action-label">{actionLabels[action]}</span>
                      <span className="action-mappings">
                        {activeProfile.mappings[action].length} mapping(s)
                      </span>
                    </div>
                    <div className="action-preview">
                      {activeProfile.mappings[action].slice(0, 2).map((mapping, index) => (
                        <span key={index} className="mapping-preview">
                          {mapping.type === 'gamepad' && mapping.buttonIndex !== undefined && `Bouton ${mapping.buttonIndex}`}
                          {mapping.type === 'gamepad' && mapping.axisIndex !== undefined && `Axe ${mapping.axisIndex}`}
                          {mapping.type === 'keyboard' && mapping.key}
                          {mapping.type === 'mouse' && `Souris ${mapping.button || mapping.axis}`}
                        </span>
                      ))}
                      {activeProfile.mappings[action].length > 2 && (
                        <span className="mapping-preview">+{activeProfile.mappings[action].length - 2}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Éditeur de mapping */}
          {selectedAction && activeProfile && (
            <div className="mapping-editor-section">
              <InputMappingEditor
                profileId={activeProfile.id}
                action={selectedAction}
                actionLabel={actionLabels[selectedAction]}
                mappings={activeProfile.mappings[selectedAction]}
                onClose={() => setSelectedAction(null)}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-manager {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-manager-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
        }

        .profile-manager-content {
          position: relative;
          background: #2a2a2a;
          border-radius: 8px;
          width: 90vw;
          max-width: 1200px;
          height: 80vh;
          max-height: 800px;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .profile-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #444;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-manager-body {
          flex: 1;
          display: grid;
          grid-template-columns: 300px 1fr 400px;
          gap: 20px;
          padding: 20px;
          overflow: hidden;
        }

        .profile-selector-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .create-profile-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 15px;
          background: #333;
          border-radius: 4px;
        }

        .profile-name-input {
          padding: 8px;
          border: 1px solid #555;
          border-radius: 4px;
          background: #444;
          color: white;
        }

        .actions-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
          overflow: hidden;
        }

        .actions-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .action-item {
          padding: 12px;
          background: #333;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          border: 2px solid transparent;
        }

        .action-item:hover {
          background: #404040;
        }

        .action-item.selected {
          border-color: #007acc;
          background: #404040;
        }

        .action-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }

        .action-label {
          font-weight: bold;
        }

        .action-mappings {
          color: #888;
          font-size: 12px;
        }

        .action-preview {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .mapping-preview {
          background: #555;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          color: #ccc;
        }

        .mapping-editor-section {
          overflow-y: auto;
        }

        .btn {
          padding: 8px 16px;
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

        h2, h3 {
          margin: 0;
          color: white;
        }
      `}</style>
    </div>
  )
}