import { useMemo, useRef, useState, useEffect } from 'react'
import { BufferGeometry, Material, type Mesh } from 'three'
import { useTrimesh } from '@react-three/cannon'

type Props = {
  mesh: Mesh
  enabled?: boolean
}

export function TerrainTrimesh({ mesh, enabled = true }: Props) {
  const [hover, setHover] = useState<boolean>(false)

  // Mémoriser les données de géométrie pour éviter de les recalculer
  const geometryData = useMemo(() => {
    const geometry = mesh.geometry as BufferGeometry & {
      index: ArrayLike<number>
    }

    try {
      const vertices = geometry.attributes.position.array ?? []
      const indices = geometry.index.array ?? []
      const position = mesh.position.toArray() as [number, number, number]

      return { vertices, indices, position }
    } catch (e) {
      console.error(mesh, e)
      return {
        vertices: [],
        indices: [],
        position: [0, 0, 0] as [number, number, number],
      }
    }
  }, [mesh])

  const [ref, api] = useTrimesh(
    () => ({
      args: [geometryData.vertices, geometryData.indices],
      mass: 0,
      position: geometryData.position,
      collisionFilterGroup: enabled ? 1 : 0,
      collisionFilterMask: enabled ? -1 : 0,
    }),
    useRef<Mesh>(null),
  )

  // Activer/désactiver les collisions sans détruire le body
  useEffect(() => {
    if (enabled) {
      api.collisionFilterGroup.set(1)
      api.collisionFilterMask.set(-1)
    } else {
      api.collisionFilterGroup.set(0)
      api.collisionFilterMask.set(0)
    }
  }, [enabled, api])

  const material = mesh.material as Material

  return (
    <mesh
      ref={ref}
      visible={!hover}
      geometry={mesh.geometry}
      material={material}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    />
  )
}
