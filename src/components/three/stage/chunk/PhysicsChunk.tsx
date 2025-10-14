import { useEffect } from 'react'
import { useTrimesh } from '@react-three/cannon'
import { BufferGeometry } from 'three'

interface ChunkProps {
  mesh: any
  isActive: boolean
}

export default function PhysicsChunk({ mesh, isActive }: ChunkProps) {
  const geometry = mesh.geometry as BufferGeometry & {
    index: ArrayLike<number>
  }
  const vertices = geometry.attributes.position.array ?? []
  const indices = geometry.index.array ?? []
  const position = mesh.position.toArray() as [number, number, number]

  // Create physics once and keep it - start with collision disabled
  const [physicsRef, api] = useTrimesh(() => ({
    args: [vertices, indices],
    mass: 0,
    position: position,
    collisionResponse: isActive,
  }))

  // Toggle collision when active state changes
  useEffect(() => {
    if (api.collisionResponse) {
      api.collisionResponse.set(isActive)
    }
  }, [isActive, api])

  // Return null - we don't need to render anything, DisplayChunk handles visuals
  return null
}
