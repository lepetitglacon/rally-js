import { useState } from 'react'
import {
  type GameAction,
  type InputProfile,
  useInputStore,
  DEFAULT_PROFILE_IDS,
} from '@/stores/inputStore.ts'
import InputMappingEditor from './InputMappingEditor.tsx'

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
    setActiveProfile,
    copyProfile,
  } = useInputStore()

  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const activeProfile = getActiveProfile()

  // Séparer les profils par défaut et personnalisés
  const defaultProfiles = profiles.filter(p => DEFAULT_PROFILE_IDS.includes(p.id))
  const customProfiles = profiles.filter(p => !DEFAULT_PROFILE_IDS.includes(p.id))

  const gameActions: GameAction[] = [
    'accelerate',
    'brake',
    'clutch',
    'steerLeft',
    'steerRight',
    'handbrake',
    'gearUp',
    'gearDown',
    'reset',
    'changeCamera',
    'pauseMenu',
    'lookAround',
  ]

  const actionLabels: Record<GameAction, string> = {
    accelerate: 'Accélérer',
    brake: 'Freiner',
    clutch: 'Embrayage',
    steerLeft: 'Tourner à gauche',
    steerRight: 'Tourner à droite',
    handbrake: 'Frein à main',
    gearUp: 'Vitesse supérieure',
    gearDown: 'Vitesse inférieure',
    reset: 'Reset véhicule',
    changeCamera: 'Changer caméra',
    pauseMenu: 'Menu pause',
    lookAround: 'Regarder autour',
  }

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return

    const newProfile: Omit<InputProfile, 'id'> = {
      name: newProfileName,
      description: 'Profil personnalisé',
      mappings: {
        accelerate: [],
        brake: [],
        clutch: [],
        steerLeft: [],
        steerRight: [],
        handbrake: [],
        gearUp: [],
        gearDown: [],
        reset: [],
        changeCamera: [],
        pauseMenu: [],
        lookAround: [],
      },
      settings: {
        steeringSensitivity: 1.0,
        accelerationSensitivity: 1.0,
        brakeSensitivity: 1.0,
        deadzone: 0.1,
      },
    }

    const id = createProfile(newProfile)
    setActiveProfile(id)
    setNewProfileName('')
    setIsCreatingProfile(false)
  }

  const handleCopyProfile = (sourceId: string) => {
    const id = copyProfile(sourceId)
    if (id) {
      setActiveProfile(id)
    }
  }

  const handleDeleteProfile = (id: string) => {
    if (confirm('Supprimer ce profil personnalisé ?')) {
      deleteProfile(id)
    }
  }

  return (
    <div className="profile-manager">
      <div className="profile-manager-overlay" onClick={onClose} />
      <div className="profile-manager-content">
        <div className="profile-manager-header">
          <h2>Gestion des Profils d'Inputs</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="profile-manager-body">
          {/* Section gauche - Profils */}
          <div className="profiles-column">
            {/* Profils personnalisés */}
            <div className="custom-profiles-section">
              <div className="section-header">
                <h3>Profils Personnalisés</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsCreatingProfile(true)}
                >
                  + Nouveau
                </button>
              </div>

              {isCreatingProfile && (
                <div className="create-profile-form">
                  <input
                    type="text"
                    placeholder="Nom du profil"
                    value={newProfileName}
                    onChange={e => setNewProfileName(e.target.value)}
                    className="profile-name-input"
                  />
                  <div className="form-buttons">
                    <button
                      onClick={handleCreateProfile}
                      className="btn btn-primary btn-sm"
                    >
                      Créer
                    </button>
                    <button
                      onClick={() => setIsCreatingProfile(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="profiles-list">
                {customProfiles.length === 0 ? (
                  <p className="no-profiles">
                    Aucun profil personnalisé. Copiez un profil par défaut ou
                    créez-en un nouveau.
                  </p>
                ) : (
                  customProfiles.map(profile => (
                    <div
                      key={profile.id}
                      className={`profile-card ${profile.id === activeProfile?.id ? 'active' : ''}`}
                    >
                      <div
                        className="profile-card-content"
                        onClick={() => setActiveProfile(profile.id)}
                      >
                        <div className="profile-name">{profile.name}</div>
                        <div className="profile-description">
                          {profile.description}
                        </div>
                      </div>
                      <div className="profile-actions">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteProfile(profile.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Profils par défaut - Liste */}
            <div className="default-profiles-section">
              <h3>Profils par Défaut (Presets)</h3>
              <p className="section-description">
                Profils prédéfinis non modifiables. Utilisez "Copier" pour les
                personnaliser.
              </p>

              <div className="profiles-list">
                {defaultProfiles.map(profile => (
                  <div
                    key={profile.id}
                    className={`profile-card ${profile.id === activeProfile?.id ? 'active' : ''}`}
                  >
                    <div
                      className="profile-card-content"
                      onClick={() => setActiveProfile(profile.id)}
                    >
                      <div className="profile-name">{profile.name}</div>
                      <div className="profile-description">
                        {profile.description}
                      </div>
                    </div>
                    <div className="profile-actions">
                      <button
                        className="action-btn copy-btn"
                        onClick={() => handleCopyProfile(profile.id)}
                        title="Copier en profil personnalisé"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section centrale - Actions */}
          {activeProfile && (
            <div className="actions-section">
              <h3>Actions disponibles</h3>
              <p className="active-profile-indicator">
                Profil actif: <strong>{activeProfile.name}</strong>
              </p>
              <div className="actions-list">
                {gameActions.map(action => (
                  <div
                    key={action}
                    className={`action-item ${selectedAction === action ? 'selected' : ''}`}
                    onClick={() => setSelectedAction(action)}
                  >
                    <div className="action-info">
                      <span className="action-label">
                        {actionLabels[action]}
                      </span>
                      <span className="action-mappings">
                        {activeProfile.mappings[action].length} mapping(s)
                      </span>
                    </div>
                    <div className="action-preview">
                      {activeProfile.mappings[action].map((mapping, index) => (
                        <span key={index} className="mapping-preview">
                          {mapping.type === 'gamepad' &&
                            mapping.buttonIndex !== undefined &&
                            `Bouton ${mapping.buttonIndex}`}
                          {mapping.type === 'gamepad' &&
                            mapping.axisIndex !== undefined &&
                            `Axe ${mapping.axisIndex}`}
                          {mapping.type === 'keyboard' && mapping.key}
                          {mapping.type === 'mouse' &&
                            `Souris ${mapping.button || mapping.axis}`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section droite - Éditeur de mapping */}
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
          max-width: 1400px;
          height: 85vh;
          max-height: 900px;
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
          grid-template-columns: 350px 1fr 400px;
          gap: 20px;
          padding: 20px;
          overflow: hidden;
        }

        /* Colonne des profils */
        .profiles-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .custom-profiles-section,
        .default-profiles-section {
          background: #1a1a1a;
          padding: 20px;
          border-radius: 8px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .section-description {
          font-size: 13px;
          color: #999;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .create-profile-form {
          padding: 15px;
          background: #333;
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .profile-name-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #555;
          border-radius: 4px;
          background: #444;
          color: white;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
        }

        .profiles-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .no-profiles {
          color: #888;
          font-style: italic;
          font-size: 13px;
          text-align: center;
          padding: 20px;
        }

        .profile-card {
          display: flex;
          align-items: center;
          background: #333;
          border-radius: 6px;
          overflow: hidden;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .profile-card:hover {
          background: #404040;
        }

        .profile-card.active {
          border-color: #007acc;
          background: #2a4a6b;
        }

        .profile-card-content {
          flex: 1;
          padding: 12px;
          cursor: pointer;
        }

        .profile-name {
          font-weight: bold;
          font-size: 14px;
          color: white;
          margin-bottom: 4px;
        }

        .profile-description {
          font-size: 12px;
          color: #999;
        }

        .profile-actions {
          display: flex;
          gap: 5px;
          padding: 0 10px;
        }

        .action-btn {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          padding: 8px;
          font-size: 14px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .delete-btn:hover {
          background: rgba(255, 107, 107, 0.2);
        }

        .copy-btn {
          color: #4caf50;
        }

        .copy-btn:hover {
          background: rgba(76, 175, 80, 0.2);
        }

        /* Actions section */
        .actions-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
          overflow: hidden;
        }

        .active-profile-indicator {
          font-size: 13px;
          color: #aaa;
          padding: 10px;
          background: #1a1a1a;
          border-radius: 4px;
          margin: 0;
        }

        .active-profile-indicator strong {
          color: #007acc;
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

        /* Boutons */
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
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

        h2,
        h3 {
          margin: 0;
          color: white;
        }

        h3 {
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}
