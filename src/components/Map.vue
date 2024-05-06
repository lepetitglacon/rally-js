<script async setup>
import { useLoader, useRenderLoop } from '@tresjs/core'
import {BufferGeometry, TextureLoader} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import * as CANNON from "cannon-es";
import * as THREE from "three";
import {useCannonContext} from "../composable/useCannonContext.js";
import {onMounted} from "vue";
const { onLoop } = useRenderLoop()

import heightmap_json from '../assets/heightmap/heightmap_min.json'
// import heightmap_json from '../assets/heightmap/heightmap.json'
import textureImage from '../assets/heightmap/heightmap-low.png'

const texture = await useLoader(TextureLoader, '/assets/heightmap/heightmap.png')
const map = await useLoader(TextureLoader, '/assets/heightmap/map.png')
// const { scene } = await useLoader(GLTFLoader, '/assets/models/map.glb')
const { world } = useCannonContext()

const sceneOffset = -239
// scene.position.y = sceneOffset


const emptyChunk = []
for (let j = 0; j < 32; j++) {
  emptyChunk[j] = []
  for (let k = 0; k < 32; k++) {
    emptyChunk[j][k] = 0
  }
}

const newHeightmap = heightmap_json.map(row => row.reverse())
const heightfieldShape = new CANNON.Heightfield(newHeightmap);
const heightfieldBody = new CANNON.Body({ shape: heightfieldShape })
heightfieldBody.position.x -= heightmap_json.length / 2 - 20
heightfieldBody.position.z += heightmap_json[0].length / 2 - 115
heightfieldBody.shapeOrientations[0].setFromEuler(-Math.PI/2, 0, 0)
world.addBody(heightfieldBody)

</script>


<template>
<!--  <primitive :object="scene"/>-->
</template>