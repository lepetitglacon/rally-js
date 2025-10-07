import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import mapGltf from '@/assets/gltf/france-besancon-bregille.glb?url'
import { Mesh } from 'three'
import { Terrain } from '@/components/three/cannon/Terrain.tsx'
import { usePlane, useSphere } from '@react-three/cannon'
import Car from '@/components/three/car/Car.tsx'

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
  const gltf: LoaderType = useLoader(GLTFLoader, mapGltf)
  console.log(gltf)

  const terrain: Mesh = gltf.scene.children.find(c => c.name === 'Terrain')
  console.log('Terrain found:', terrain)
  console.log(
    'All children:',
    gltf.scene.children.map(c => ({ name: c.name, type: c.type })),
  )

  return (
    <>
      <Cube />
      {terrain && <Terrain mesh={terrain} type={'trimesh'} />}
      <Car />
    </>
  )
}
