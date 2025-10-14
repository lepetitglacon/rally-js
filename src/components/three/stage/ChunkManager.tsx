import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type {
  LoaderType,
  MeshWithBbox,
} from '@/components/three/stage/Stage.tsx'
import { Box3, MeshStandardMaterial, Mesh, Material } from 'three'
import Chunk from '@/components/three/stage/Chunk.tsx'
import { useMemo, useRef, useState } from 'react'

const hitMaterial = new MeshStandardMaterial({
  color: 0xffff00,
  metalness: 0.3,
  roughness: 0.8,
})

export default function ChunkManager() {
  const { raycaster, camera, pointer } = useThree()

  const gltf: LoaderType = useLoader(
    GLTFLoader,
    'maps/france/besancon/bregille/bregille-tiled.glb',
  )

  // Prepare chunks with bounding boxes
  const chunks = useMemo(() => {
    const prepared = gltf.scene.children.map(child => {
      const meshChild = child as MeshWithBbox
      meshChild.updateMatrixWorld()
      const box = new Box3().setFromObject(meshChild)
      meshChild.worldBbox = box
      return meshChild
    })
    return prepared
  }, [gltf])

  // Store refs to rendered chunk meshes and their original materials
  const chunkRefsMap = useRef<
    Map<string, { mesh: Mesh; originalMaterial: Material | Material[] }>
  >(new Map())
  const currentlyHighlighted = useRef<Set<string>>(new Set())

  // Track which chunks have physics loaded - using state to trigger re-renders
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set())

  // Parse chunk coordinates from name (e.g., "chunk_x_y")
  const parseChunkCoords = (name: string): { x: number; y: number } | null => {
    if (!name.startsWith('chunk_')) return null
    const parts = name.split('_')
    if (parts.length < 3) return null
    return { x: parseInt(parts[1]), y: parseInt(parts[2]) }
  }

  // Get chunk name from coordinates
  const getChunkName = (x: number, y: number): string => {
    return `chunk_${x}_${y}`
  }

  useFrame(() => {
    if (chunkRefsMap.current.size === 0) return

    raycaster.setFromCamera(pointer, camera)
    const meshes = Array.from(chunkRefsMap.current.values()).map(
      item => item.mesh,
    )
    const hits = raycaster.intersectObjects(meshes, false)

    const newHighlighted = new Set<string>()

    if (hits.length > 0) {
      const hit = hits[0]
      const mesh = hit.object as Mesh

      if (mesh.name.startsWith('chunk_')) {
        const coords = parseChunkCoords(mesh.name)

        if (coords) {
          // Highlight 3x3 grid centered on hit chunk
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const neighborName = getChunkName(coords.x + dx, coords.y + dy)
              newHighlighted.add(neighborName)
            }
          }
        }
      }
    }

    // Reset chunks that are no longer highlighted
    currentlyHighlighted.current.forEach(name => {
      if (!newHighlighted.has(name)) {
        const chunkData = chunkRefsMap.current.get(name)
        if (chunkData) {
          chunkData.mesh.material = chunkData.originalMaterial
        }
      }
    })

    // Highlight new chunks
    newHighlighted.forEach(name => {
      const chunkData = chunkRefsMap.current.get(name)
      if (chunkData) {
        chunkData.mesh.material = hitMaterial
      }
    })

    currentlyHighlighted.current = newHighlighted

    // Update loaded chunks based on highlighted area
    // Only update state if there are new chunks to load
    let hasNewChunks = false
    const newLoadedChunks = new Set(loadedChunks)

    newHighlighted.forEach(name => {
      if (!newLoadedChunks.has(name)) {
        newLoadedChunks.add(name)
        hasNewChunks = true
      }
    })

    if (hasNewChunks) {
      setLoadedChunks(newLoadedChunks)
    }
  })

  const handleChunkRef = (
    name: string,
    mesh: Mesh | null,
    originalMaterial: Material | Material[],
  ) => {
    if (mesh) {
      mesh.name = name
      chunkRefsMap.current.set(name, { mesh, originalMaterial })
    } else {
      chunkRefsMap.current.delete(name)
    }
  }

  return (
    <>
      {console.log(JSON.stringify(currentlyHighlighted.current))}
      {chunks.map(mesh => {
        const isLoaded = currentlyHighlighted.current.has(mesh.name)
        return (
          <Chunk
            key={mesh.uuid}
            mesh={mesh}
            isLoaded={isLoaded}
            onRefReady={ref => handleChunkRef(mesh.name, ref, mesh.material)}
          />
        )
      })}
    </>
  )
}
