import { BufferGeometry, type Mesh } from 'three'
import PhysicsChunk from '@/components/three/stage/chunk/PhysicsChunk.tsx'
import DisplayChunk from '@/components/three/stage/chunk/DisplayChunk.tsx'
import { useEffect, useState } from 'react'

interface ChunkProps {
  mesh: Mesh
  isLoaded: boolean
  onRefReady: (ref: Mesh | null) => void
}

export default function Chunk({ mesh, isLoaded, onRefReady }: ChunkProps) {
  return (
    <>
      <DisplayChunk mesh={mesh} onRefReady={onRefReady} />
      {/* PhysicsChunk is always mounted, just toggle collision */}
      <PhysicsChunk mesh={mesh} isActive={isLoaded} />
    </>
  )
}
