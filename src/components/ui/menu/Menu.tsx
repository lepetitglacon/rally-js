import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import ProfileManager from '@/components/ui/menu/profils/ProfileManager'

interface MenuProps {
  isOpen?: boolean
  onClose?: () => void
}

interface TabItem {
  value: string
  icon: string
  label: string
  title: string
  description: string
  content?: React.ReactNode
}

export default function Menu({ isOpen = false, onClose }: MenuProps) {
  const [showProfileManager, setShowProfileManager] = useState(false)

  const tabs: TabItem[] = [
    {
      value: 'controls',
      icon: '🎮',
      label: 'Contrôles',
      title: 'Contrôles',
      description: 'Configurer les inputs (manette, clavier, volant)',
      content: (
        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          onClick={() => setShowProfileManager(true)}
        >
          Gérer les profils
        </button>
      ),
    },
    {
      value: 'graphics',
      icon: '🎨',
      label: 'Graphismes',
      title: 'Paramètres Graphiques',
      description: 'Qualité, résolution, effets visuels - À implémenter',
    },
    {
      value: 'audio',
      icon: '🔊',
      label: 'Audio',
      title: 'Paramètres Audio',
      description: 'Volume, effets sonores, musique - À implémenter',
    },
    {
      value: 'gameplay',
      icon: '🏁',
      label: 'Gameplay',
      title: 'Paramètres Gameplay',
      description: 'Difficulté, assistance de conduite - À implémenter',
    },
    {
      value: 'about',
      icon: 'ℹ️',
      label: 'À propos',
      title: 'À propos',
      description: 'Rally JS - Jeu de rallye en WebGL\nVersion 0.0.0',
    },
  ]

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-5">
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl w-[1000px] h-[700px] flex flex-col text-white shadow-2xl border border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-2xl font-bold m-0">Rally JS</h1>
            <button
              className="bg-transparent border-none text-white text-3xl cursor-pointer p-1 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <Tabs.Root
            defaultValue="controls"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <Tabs.List className="flex justify-between border-b border-gray-700 bg-[#1a1a1a]">
              {tabs.map(tab => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="p-4 w-full data-[state=active]:text-white data-[state=active]:border-b-blue-600 data-[state=active]:bg-blue-600/50"
                >
                  {tab.icon} {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {tabs.map(tab => (
              <Tabs.Content
                key={tab.value}
                value={tab.value}
                className="flex-1 p-8 overflow-y-auto"
              >
                <h2 className="text-xl font-semibold mb-4 mt-0">{tab.title}</h2>
                <p className="mb-3 text-gray-300 leading-relaxed whitespace-pre-line">
                  {tab.description}
                </p>
                {tab.content}
              </Tabs.Content>
            ))}
          </Tabs.Root>

          <div className="px-8 py-5 border-t border-gray-700 flex justify-center">
            <button
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              onClick={onClose}
            >
              Retour au jeu
            </button>
          </div>
        </div>
      </div>

      {showProfileManager && (
        <ProfileManager onClose={() => setShowProfileManager(false)} />
      )}
    </>
  )
}
