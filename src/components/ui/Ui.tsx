import { useState } from 'react'
import Menu from '@/components/ui/menu/Menu.tsx'
import RallyHud from '@/components/ui/hud/RallyHud.tsx'

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

      {/*<div className="flex absolute top-0 left-0 p-4 z-10 pointer-events-none text-white w-full h-full">*/}
      {/*  <CameraUi />*/}
      {/*</div>*/}
    </>
  )
}
