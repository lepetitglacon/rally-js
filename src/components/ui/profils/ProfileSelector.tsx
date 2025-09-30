import { useInputStore } from '@/stores/inputStore'

export default function ProfileSelector() {
  const {
    profiles,
    activeProfileId,
    setActiveProfile,
    deleteProfile
  } = useInputStore()

  const activeProfile = profiles.find(p => p.id === activeProfileId)

  return (
    <div className="profile-selector">
      <h3>Profil actuel</h3>

      <div className="current-profile">
        {activeProfile ? (
          <div className="profile-info">
            <div className="profile-name">{activeProfile.name}</div>
            <div className="profile-description">{activeProfile.description}</div>
          </div>
        ) : (
          <div className="no-profile">Aucun profil sélectionné</div>
        )}
      </div>

      <div className="profile-list">
        <h4>Profils disponibles</h4>
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`profile-item ${profile.id === activeProfileId ? 'active' : ''}`}
          >
            <div
              className="profile-content"
              onClick={() => setActiveProfile(profile.id)}
            >
              <div className="profile-name">{profile.name}</div>
              <div className="profile-description">{profile.description}</div>
            </div>

            {profile.id !== 'keyboard-default' && profile.id !== 'gamepad-default' && (
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Supprimer le profil "${profile.name}" ?`)) {
                    deleteProfile(profile.id)
                  }
                }}
                title="Supprimer le profil"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .profile-selector {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .current-profile {
          padding: 15px;
          background: #1a1a1a;
          border-radius: 6px;
          border: 2px solid #007acc;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .profile-name {
          font-weight: bold;
          font-size: 16px;
          color: white;
        }

        .profile-description {
          color: #ccc;
          font-size: 14px;
        }

        .no-profile {
          color: #888;
          font-style: italic;
        }

        .profile-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        h3, h4 {
          margin: 0;
          color: white;
        }

        h4 {
          font-size: 14px;
          color: #ccc;
        }

        .profile-item {
          display: flex;
          align-items: center;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
          transition: background 0.2s;
          border: 1px solid transparent;
        }

        .profile-item:hover {
          background: #404040;
        }

        .profile-item.active {
          border-color: #007acc;
          background: #404040;
        }

        .profile-content {
          flex: 1;
          padding: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .profile-item .profile-name {
          font-size: 14px;
          font-weight: normal;
        }

        .profile-item .profile-description {
          font-size: 12px;
          color: #999;
        }

        .delete-button {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          padding: 10px;
          font-size: 14px;
          transition: background 0.2s;
        }

        .delete-button:hover {
          background: #ff6b6b;
          color: white;
        }
      `}</style>
    </div>
  )
}