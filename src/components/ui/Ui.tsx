import { useState } from 'react'
import Menu from '@/components/ui/menu/Menu.tsx'
import RallyHud from '@/components/ui/hud/RallyHud.tsx'
import CameraDebug from '@/components/ui/debug/CameraDebug.tsx'

export default function Ui() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <RallyHud />

      <button
        className="fixed top-4 left-1 z-[15381481] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors font-medium pointer-events-auto"
        onClick={() => setIsMenuOpen(true)}
      >
        Menu (Échap)
      </button>

      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Debug UI */}
      <CameraDebug />
    </>
  )
}
