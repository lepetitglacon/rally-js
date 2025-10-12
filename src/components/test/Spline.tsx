import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { LoaderType } from '@/components/three/stage/Stage.tsx'
import splineGltf from '@/assets/gltf/path.glb?url'
import { Suspense } from 'react'
import { NURBSCurve } from 'three/examples/jsm/curves/NURBSCurve'

export default function Spline() {
  const gltf: LoaderType = useLoader(GLTFLoader, splineGltf)

  const knots = [0, 1]
  const controls = [0, 1]

  const curve = new NURBSCurve(2, knots, controls)

  return (
    <Suspense>
      <primitive object={curve} color="white" />
      <primitive object={gltf.scene} color="white" />
    </Suspense>
  )
}
