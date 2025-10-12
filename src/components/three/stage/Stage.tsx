// import mapGltf from '@/assets/gltf/france-besancon-bregille.glb?url'
import { Box3, Mesh } from 'three'
import { usePlane, useSphere } from '@react-three/cannon'
import ChunkManager from '@/components/three/stage/ChunkManager.tsx'

export type LoaderType = {
  animations: []
  asset: any
  cameras: []
  materials: Record<string, any>
  meshes: Record<string, any>
  nodes: Record<string, any>
  parser: any
  scene: Group
  scenes: Group[]
  userData: any
}

export type MeshWithBbox = Mesh & { worldBbox: Box3 }

function Plane(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -50, 0], // Plus bas pour laisser place au terrain
    ...props,
  }))
  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="blue" transparent opacity={0.3} />
    </mesh>
  )
}

function Cube() {
  const [ref] = useSphere(() => ({
    mass: 250,
    position: [0, 250, 0],
    args: [5],
  }))
  return (
    <mesh ref={ref}>
      <sphereGeometry />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

export default function Stage() {
  return (
    <>
      <Cube />
      <ChunkManager />
      {/*<Car />*/}
    </>
  )
}
