import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { HeightfieldCollider, RigidBody } from '@react-three/rapier'
import heightmapPng from '@/assets/heightmap.png?url'

// Scale factor to control terrain size - higher value = smaller terrain
const TERRAIN_SCALE_FACTOR = 0.8
// Sampling step for performance - higher value = lower resolution but better performance
const SAMPLING_STEP = 16
const HEIGHT_FACTOR = 200

export default function ChunkManager() {
  const heightmapTexture = useLoader(THREE.TextureLoader, heightmapPng)

  const heightfieldData = useMemo(() => {
    if (!heightmapTexture.image) return null

    const image = heightmapTexture.image
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const data = ctx.getImageData(0, 0, image.width, image.height).data

    const heights: number[] = []

    // Calculate sampled dimensions for better performance
    const sampledWidth = Math.ceil(image.width / SAMPLING_STEP)
    const sampledHeight = Math.ceil(image.height / SAMPLING_STEP)

    // Rapier expects (height + 1) × (width + 1) vertices
    for (let y = 0; y <= sampledHeight; y++) {
      for (let x = 0; x <= sampledWidth; x++) {
        const worldX = x * SAMPLING_STEP
        const worldY = y * SAMPLING_STEP

        if (worldY >= image.height || worldX >= image.width) {
          heights.push(0)
          continue
        }

        const idx = (worldY * image.width + worldX) * 4
        const heightValue = data[idx] / 255 // Convert grayscale to 0-1 range
        heights.push(heightValue * HEIGHT_FACTOR) // Scale height for more visible relief
      }
    }

    return {
      width: sampledWidth,
      height: sampledHeight,
      heights,
      scale: {
        x: image.width / TERRAIN_SCALE_FACTOR,
        y: 1,
        z: image.height / TERRAIN_SCALE_FACTOR,
      },
    }
  }, [heightmapTexture])

  if (!heightfieldData) return null

  console.log('Heightfield data:', heightfieldData)

  return (
    <>
      <RigidBody type="fixed" position={[0, 100, 0]}>
        <HeightfieldCollider
          args={[
            heightfieldData.width,
            heightfieldData.height,
            heightfieldData.heights,
            heightfieldData.scale,
          ]}
        />
      </RigidBody>
    </>
  )
}
