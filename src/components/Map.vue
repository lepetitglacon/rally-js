<script async setup>
import {useLoader, useRenderLoop, useTresContext} from '@tresjs/core'
import {BufferGeometry, TextureLoader} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import * as CANNON from "cannon-es";
import * as THREE from "three";
import {useCannonContext} from "../composable/useCannonContext.js";
import {onMounted} from "vue";
const { onLoop } = useRenderLoop()
const { car } = useCar()

import heightmap_json from '../assets/heightmap/heightmap_min.json'
// import heightmap_json from '../assets/heightmap/heightmap.json'
import textureImage from '../assets/heightmap/heightmap-low.png'
import {useCar} from "../composable/useCar.js";

// const texture = await useLoader(TextureLoader, '/assets/heightmap/heightmap.png')
// const map = await useLoader(TextureLoader, '/assets/heightmap/map.png')
const { world } = useCannonContext()
const { scene } = useTresContext()

async function loadMap() {
	const { scene } = await useLoader(GLTFLoader, '/assets/models/map.glb')
	return scene
}
const map = await loadMap()
scene.value.map = map

const mapOffset = -239
map.position.y = mapOffset

map.traverse(obj => {
	if (obj.material) {
		obj.material.side = THREE.FrontSide
	}

	switch (obj.userData.type) {
		case 'Start': {
			car.body.position.copy(obj.position)
			car.body.position.y += -239
			break;
		}
		case 'Road': {
			console.log(obj)
			break;
		}
	}
})




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
  <primitive :object="map"/>
</template>