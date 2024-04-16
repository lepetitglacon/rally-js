<script async setup>
import { useLoader } from '@tresjs/core'
import { TextureLoader } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import * as CANNON from "cannon-es";
import * as THREE from "three";
import {useCannonContext} from "../composable/useCannonContext.js";

import textureImage from '../assets/heightmap/heightmap-bregille.png'
const texture = await useLoader(TextureLoader, '/assets/heightmap/heightmap.png')
console.log(texture)
const map = await useLoader(TextureLoader, '/assets/heightmap/map.png')
const { scene } = await useLoader(GLTFLoader, '/assets/models/map.glb')
const { world } = useCannonContext()

const sceneOffsetY = -250
scene.position.y = sceneOffsetY
// scene.traverse((object) => {
//
//   if (object.userData.type === 'Terrain') {
//     console.log(object)
//     const result = threeToCannon(object, {type: ShapeType.MESH});
//     const body = new CANNON.Body();
//     const {shape, offset, orientation} = result;
//     body.addShape(shape, offset, orientation);
//     world.addBody(body)
//   }
// })

const image = new Image()
const img = document.createElement('img')
img.src = textureImage
img.onload = () => {
  console.log('image loaded')
  const scale = 2500

  const heightMap = new CANNON.Heightfield([[1]], {
    elementSize: .5 // Distance between the data points in X and Y directions
  })
  heightMap.setHeightsFromImage(img, new THREE.Vector3(scale, scale, 1500))

  const groundMaterial = new CANNON.Material('groundMaterial')
  groundMaterial.friction = .8
  groundMaterial.restitution = 0.1

  const heightfieldBody = new CANNON.Body({ mass: 0 })
  heightfieldBody.material = groundMaterial
  heightfieldBody.addShape(heightMap)
  world.addBody(heightfieldBody)

  const heightMapOffset = new THREE.Vector3(
      -scale / 2,
      0,
      scale / 2,
  )

  heightfieldBody.position.copy(heightfieldBody.position.vadd(heightMapOffset))
  heightfieldBody.position.y -= 250
  heightfieldBody.position.x += 200
  heightfieldBody.position.z -= 200
  console.log(scene.position)
  console.log(heightfieldBody.position)
  heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
}

</script>


<template>
  <primitive :object="scene"/>
</template>