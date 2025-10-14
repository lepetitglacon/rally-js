import { useRef, useEffect, useState } from 'react'
import { useTrimesh } from '@react-three/cannon'
import { BufferGeometry, type Mesh } from 'three'

interface ChunkProps {
  mesh: Mesh
  onRefReady: (ref: Mesh | null) => void
}

export default function DisplayChunk({ mesh, onRefReady }: ChunkProps) {
  const [hasBeenLoaded, setHasBeenLoaded] = useState(false)
  const meshRef = useRef<Mesh>(null)

  const geometry = mesh.geometry as BufferGeometry & {
    index: ArrayLike<number>
  }
  const position = mesh.position.toArray() as [number, number, number]

  useEffect(() => {
    const currentRef = meshRef.current
    if (currentRef) {
      onRefReady(currentRef)
    }
    return () => onRefReady(null)
  }, [hasBeenLoaded, onRefReady])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={mesh.material}
      position={position}
    ></mesh>
  )
}
