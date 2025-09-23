import { useMemo, Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RigidBody, HeightfieldCollider } from '@react-three/rapier'
import * as THREE from 'three'
import mapGltf from '@/assets/gltf/france-besancon-bregille.glb?url'
import heightmapPng from '@/assets/heightmap.png?url'

interface TerrainChunkProps {
  chunkCoord: { x: number; z: number }
  position: THREE.Vector3
  chunkSize: number
}

export default function TerrainChunk({
  chunkCoord,
  position,
  chunkSize,
}: TerrainChunkProps) {
  const gltf = useLoader(GLTFLoader, mapGltf)
  const heightmapTexture = useLoader(THREE.TextureLoader, heightmapPng)

  const chunkData = useMemo(() => {
    if (!heightmapTexture.image) return null

    const fullWidth = heightmapTexture.image.width
    const fullHeight = heightmapTexture.image.height

    // Calculate chunk boundaries in texture space
    const chunksPerSide = 16 // 16x16 chunks for the full map (smaller chunks)
    const chunkTexWidth = Math.floor(fullWidth / chunksPerSide)
    const chunkTexHeight = Math.floor(fullHeight / chunksPerSide)

    const startX = Math.max(0, chunkCoord.x * chunkTexWidth)
    const startZ = Math.max(0, chunkCoord.z * chunkTexHeight)
    const endX = Math.min(startX + chunkTexWidth, fullWidth)
    const endZ = Math.min(startZ + chunkTexHeight, fullHeight)

    // Extract heightmap data for this chunk
    const chunkHeights = extractChunkHeightmap(
      heightmapTexture.image,
      startX,
      startZ,
      endX,
      endZ,
    )

    if (!chunkHeights) return null

    const originalWidth = endX - startX
    const originalHeight = endZ - startZ
    const step = 4 // Same step as in heightmap extraction
    const sampledWidth = Math.ceil(originalWidth / step)
    const sampledHeight = Math.ceil(originalHeight / step)
    const scale = 16

    return {
      width: sampledWidth,
      height: sampledHeight,
      heights: chunkHeights,
      scale: { x: originalWidth / scale, y: 1, z: originalHeight / scale },
    }
  }, [heightmapTexture, chunkCoord])

  // Clone and position the visual mesh for this chunk
  const chunkScene = useMemo(() => {
    if (!gltf.scene) return null

    const clonedScene = gltf.scene.clone()
    clonedScene.position.set(position.x, position.y, position.z)

    return clonedScene
  }, [gltf.scene, position.x, position.y, position.z])

  if (!chunkData || !chunkScene) return null

  return (
    <Suspense fallback={null}>
      {/* Visual mesh */}
      <primitive object={chunkScene} />

      {/* Physics collider */}
      {/*<RigidBody type="fixed" position={[position.x, position.y, position.z]}>*/}
      {/*  <HeightfieldCollider*/}
      {/*    args={[chunkData.width, chunkData.height, chunkData.heights, chunkData.scale]}*/}
      {/*  />*/}
      {/*</RigidBody>*/}
    </Suspense>
  )
}

function extractChunkHeightmap(
  image: HTMLImageElement | HTMLCanvasElement,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
): number[] | null {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)
  const data = ctx.getImageData(0, 0, image.width, image.height).data

  const chunkWidth = endX - startX
  const chunkHeight = endZ - startZ
  const heights: number[] = []

  // Reduce resolution by sampling every N pixels
  const step = 4 // Sample every 4th pixel for lower resolution
  const sampledWidth = Math.ceil(chunkWidth / step)
  const sampledHeight = Math.ceil(chunkHeight / step)

  // Extract heights for this chunk area with reduced resolution
  for (let z = 0; z <= sampledHeight; z++) {
    for (let x = 0; x <= sampledWidth; x++) {
      const worldX = startX + x * step
      const worldZ = startZ + z * step

      if (worldX >= image.width || worldZ >= image.height) {
        heights.push(0)
        continue
      }

      const idx = (worldZ * image.width + worldX) * 4
      const heightValue = data[idx] / 255 // grayscale to height
      heights.push(heightValue)
    }
  }

  return heights
}
