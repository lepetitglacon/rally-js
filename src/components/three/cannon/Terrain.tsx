import { type Mesh } from 'three'
import { TerrainTrimesh } from '@/components/three/cannon/terrainsType/TerrainTrimesh.tsx'
import { TerrainHeightField } from '@/components/three/cannon/terrainsType/TerrainHeightField.tsx'

type Props = {
  mesh: Mesh
  type?: 'trimesh' | 'heightfield'
}

export function Terrain({ mesh, type = 'heightfield' }: Props) {
  return (
    <>
      {type === 'trimesh' ? (
        <TerrainTrimesh mesh={mesh} />
      ) : (
        <TerrainHeightField mesh={mesh} type="fromImage" />
      )}
    </>
  )
}
