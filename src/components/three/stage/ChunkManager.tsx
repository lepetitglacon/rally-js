import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type {
  LoaderType,
  MeshWithBbox,
} from '@/components/three/stage/Stage.tsx'
import { Box3 } from 'three'
import Chunk from '@/components/three/stage/Chunk.tsx'

export default function ChunkManager() {
  const { raycaster, camera, pointer, scene } = useThree()

  const gltf: LoaderType = useLoader(
    GLTFLoader,
    'maps/france/besancon/bregille/bregille-tiled.glb',
  )

  console.log(gltf.scene.children)

  for (const child of gltf.scene.children as MeshWithBbox[]) {
    child.updateMatrixWorld()
    const box = new Box3().setFromObject(child)
    child.worldBbox = box
  }

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(scene.children, true)
    if (hits.length > 0) {
      console.log('hit', hits)
      for (const child of gltf.scene.children as MeshWithBbox[]) {
        if (!hits[0]?.point) continue
        if (child.worldBbox.containsPoint(hits[0].point)) {
          console.log('inside', child.name)
        }
      }
    }
  })

  return (
    <>
      {gltf.scene.children.map((mesh, index) => (
        <Chunk mesh={mesh} />
      ))}
    </>
  )
}
