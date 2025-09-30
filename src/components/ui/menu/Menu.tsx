import { useState } from 'react'
import ProfileManager from '../profils/ProfileManager'

interface MenuProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Menu({ isOpen = false, onClose }: MenuProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  if (!isOpen) return null

  const menuItems = [
    {
      id: 'controls',
      label: 'Contrôles',
      description: 'Configurer les inputs (manette, clavier, volant)',
      icon: '🎮'
    },
    {
      id: 'graphics',
      label: 'Graphismes',
      description: 'Qualité, résolution, effets visuels',
      icon: '🎨'
    },
    {
      id: 'audio',
      label: 'Audio',
      description: 'Volume, effets sonores, musique',
      icon: '🔊'
    },
    {
      id: 'gameplay',
      label: 'Gameplay',
      description: 'Difficulté, assistance de conduite',
      icon: '🏁'
    },
    {
      id: 'about',
      label: 'À propos',
      description: 'Informations sur le jeu',
      icon: 'ℹ️'
    }
  ]

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const handleCloseSection = () => {
    setActiveSection(null)
  }

  return (
    <>
      <div className="menu">
        <div className="menu-overlay" onClick={onClose} />
        <div className="menu-content">
          <div className="menu-header">
            <h1>Rally JS - Menu Principal</h1>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="menu-body">
            <div className="menu-grid">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  className="menu-item"
                  onClick={() => handleSectionClick(item.id)}
                >
                  <div className="menu-item-icon">{item.icon}</div>
                  <div className="menu-item-content">
                    <h3>{item.label}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="menu-item-arrow">→</div>
                </div>
              ))}
            </div>

            <div className="menu-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Retour au jeu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sous-menus */}
      {activeSection === 'controls' && (
        <ProfileManager onClose={handleCloseSection} />
      )}

      {activeSection === 'graphics' && (
        <div className="submenu">
          <div className="submenu-overlay" onClick={handleCloseSection} />
          <div className="submenu-content">
            <h2>Paramètres Graphiques</h2>
            <p>Configuration des graphismes - À implémenter</p>
            <button onClick={handleCloseSection}>Fermer</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
        }

        .menu-content {
          position: relative;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 12px;
          width: 80vw;
          max-width: 800px;
          height: 70vh;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid #444;
        }

        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #444;
          background: linear-gradient(90deg, #007acc 0%, #0066aa 100%);
          border-radius: 12px 12px 0 0;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 5px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .menu-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 30px;
        }

        .menu-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #333;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #555;
          color: white;
        }

        .submenu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submenu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .submenu-content {
          position: relative;
          background: #2a2a2a;
          border-radius: 8px;
          padding: 30px;
          color: white;
          text-align: center;
          min-width: 400px;
        }
      `}</style>
    </>
  )
}