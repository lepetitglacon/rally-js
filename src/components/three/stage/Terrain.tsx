import * as THREE from 'three'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Physics, RigidBody, HeightfieldCollider } from '@react-three/rapier'
import { Suspense, useMemo } from 'react'
import mapGltf from '@/assets/gltf/france-besancon-bregille.glb?url'
import heightmapPng from '@/assets/heightmap.png?url'

export default function Terrain() {
  return <Suspense></Suspense>
}
