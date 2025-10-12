import { useRef, useState } from 'react'
import { useTrimesh } from '@react-three/cannon'
import { BufferGeometry, type Mesh } from 'three'

export default function Chunk({ mesh }) {
  const [hovered, setHovered] = useState<boolean>(false)

  const geometry = mesh.geometry as BufferGeometry & {
    index: ArrayLike<number>
  }
  const vertices = geometry.attributes.position.array ?? []
  const indices = geometry.index.array ?? []
  const position = mesh.position.toArray() as [number, number, number]

  const [ref, api] = useTrimesh(
    () => ({
      args: [vertices, indices],
      mass: 0,
      position: position,
    }),
    useRef<Mesh>(null),
  )

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshStandardMaterial color={'white'} wireframe={hovered} />
    </mesh>
  )
}
