import { useRef, useState } from 'react'
import { BufferGeometry, type Mesh } from 'three'
import { useTrimesh } from '@react-three/cannon'

type Props = {
  mesh: Mesh
}

export function TerrainTrimesh({ mesh }: Props) {
  const [hover, setHover] = useState<boolean>(false)

  const geometry = mesh.geometry as BufferGeometry & {
    index: ArrayLike<number>
  }

  const {
    attributes: {
      position: { array: vertices },
    },
    index: { array: indices },
  } = geometry

  const [ref] = useTrimesh(
    () => ({
      args: [vertices, indices],
      mass: 0,
    }),
    useRef<Mesh>(null),
  )

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={mesh.material}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    />
  )
}
