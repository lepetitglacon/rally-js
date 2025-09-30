import { type Mesh } from 'three'
import { type Triplet, useHeightfield } from '@react-three/cannon'
import { useRef } from 'react'
import { useHeightmapData } from '@/hooks/useHeightmapData.ts'

const heightmapImageSrc = ' @/assets/test/Terrain_heightmap.png?url'

type Props = {
  mesh: Mesh
  type: 'default' | 'fromImage'
}

export function TerrainHeightField({ mesh, type = 'default' }: Props) {
  // const { heights, elementSize } = meshToHeightmap(mesh, 128, 64)
  // console.log('heights', heights)
  //
  // const [ref] = useHeightfield(() => ({
  //   args: [heights, { elementSize }],
  //   mass: 0,
  //   rotation: [-Math.PI / 2, 0, 0],
  // }))

  return (
    <>
      {type === 'default' ? <DefaultHeightField /> : <HeightFieldFromImage />}
    </>
  )
}

function HeightFieldFromImage() {
  const { heights, elementSize } = useHeightmapData({
    imagePath: '/maps/france/besancon/bregille/heightmap.png',
  })

  const position = [0, 0, 0] as Triplet

  const [ref] = useHeightfield(
    () => ({
      args: [heights, { elementSize: elementSize }],
      position,
      rotation: [-Math.PI / 2, 0, 0], // Rotation pour aligner avec Three.js
      type: 'Static',
    }),
    null,
    [heights, elementSize],
  )

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <meshPhongMaterial color={'white'} />
      {/*<HeightmapGeometry heights={heights} elementSize={elementSize} />*/}
    </mesh>
  )
}

function DefaultHeightField() {
  const sizeX = 128
  const sizeY = 128
  const heights = Array.from({ length: sizeX }, () =>
    Array.from({ length: sizeY }, () => Math.random() * 10),
  )
  const rotation = [-Math.PI / 2, 0, 0] as Triplet
  const [ref] = useHeightfield(
    () => ({
      args: [
        heights,
        {
          elementSize: heights.length,
        },
      ],
      rotation,
    }),
    useRef<Mesh>(null),
  )
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <meshPhongMaterial color={'white'} />
      {/*<HeightmapGeometry heights={heights} elementSize={elementSize} />*/}
    </mesh>
  )
}
