<script async setup>
import { useLoader } from '@tresjs/core'
import {BufferGeometry, TextureLoader} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import * as CANNON from "cannon-es";
import * as THREE from "three";
import {useCannonContext} from "../composable/useCannonContext.js";

import chunk_1 from '../assets/heightmap/data/chunk_1.json'
import chunk_2 from '../assets/heightmap/data/chunk_2.json'
import chunk_3 from '../assets/heightmap/data/chunk_3.json'

import textureImage from '../assets/heightmap/heightmap-low.png'
const texture = await useLoader(TextureLoader, '/assets/heightmap/heightmap.png')
const map = await useLoader(TextureLoader, '/assets/heightmap/map.png')
const { scene } = await useLoader(GLTFLoader, '/assets/models/map.glb')
const { world } = useCannonContext()

const sceneOffset = -350
scene.position.y = sceneOffset

const heightfieldShape = new CANNON.Heightfield(chunk_1);
const heightfieldBody = new CANNON.Body({ shape: heightfieldShape })
world.addBody(heightfieldBody)
const heightfieldShape1 = new CANNON.Heightfield(chunk_2);
const heightfieldBody1 = new CANNON.Body({ shape: heightfieldShape1 })
heightfieldBody1.position.y -= 32
world.addBody(heightfieldBody1)
const heightfieldShape2 = new CANNON.Heightfield(chunk_2);
const heightfieldBody2 = new CANNON.Body({ shape: heightfieldShape2 })
heightfieldBody2.position.y -= 64
world.addBody(heightfieldBody2)

scene.traverse(async (object) => {

  if (object.userData.type === 'Terrain') {

  }


  // if (object.userData.type === 'Terrain') {
  //   console.log(object)
  //
  //   // const aabb = new THREE.Box3().setFromObject(object);
  //   // const gridXMin = aabb.min.x; // Number of points along the X-axis
  //   // const gridXMax = aabb.max.x; // Number of points along the X-axis
  //   // const gridZMin = aabb.min.z; // Number of points along the Z-axis
  //   // const gridZMax = aabb.max.z; // Number of points along the Z-axis
  //   // const startX = gridXMax - gridXMin
  //   // const startZ = gridZMax - gridZMin
  //   //
  //   // const vertexHeights = []
  //   // for (let i = 0; i < object.geometry.attributes.position.array.length / 3; i++) {
  //   //   const y = object.geometry.attributes.position.array[i * 3 + 1]
  //   //   vertexHeights.push(y)
  //   // }
  //   // console.log(vertexHeights)
  //   // const rows = startX;
  //   // const columns = startZ;
  //   // const heightmap = [];
  //   //
  //   // for (let i = 0; i < rows; i++) {
  //   //   heightmap.push(vertexHeights.slice(i * columns, (i + 1) * columns));
  //   // }
  //   // console.log(heightmap)
  //
  //   console.log('TERRAIN FOUND - Building map')
  //   // Define grid parameters (adjust based on your needs)
  //   const gridX = 150; // Number of points along the X-axis
  //   const gridZ = 150; // Number of points along the Z-axis
  //   const spacing = 2; // Spacing between grid points
  //
  //   // Define raycasting variables
  //   const raycaster = new THREE.Raycaster();
  //   const direction = new THREE.Vector3(0, -1, 0); // Raycast downwards
  //   const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
  //
  //   // Create an empty array to store height values
  //   const heightmap = [];
  //   for (let z = -gridZ; z < gridZ; z++) {
  //     heightmap[z] = [];
  //     for (let x = -gridX; x < gridX; x++) {
  //       heightmap[z][x] = 0; // Initialize all heights to 0
  //     }
  //   }
  //   console.log('heightfield initialized')
  //
  //   const buildingStartTime = new Date().getTime();
  //   console.log('heightfield building - ' + buildingStartTime)
  //
  //   // Raycast loop to generate heightmap data
  //   for (let z = 0; z < gridZ; z++) {
  //     for (let x = 0; x < gridX; x++) {
  //       const origin = new THREE.Vector3(x * spacing, 500, z * spacing); // Raycast origin above the mesh
  //       raycaster.set(origin, direction)
  //       // console.log(`testing point {${x}, ${z}} at height ${origin.y}`)
  //
  //       // Perform raycast
  //       const intersects = raycaster.intersectObject(object);
  //
  //       // Check for intersection
  //       if (intersects.length > 0) {
  //         const intersection = intersects[0];
  //         heightmap[z][x] = intersection.point.y; // Store y-coordinate as height
  //         // console.log(`found for {${x}, ${z}} at height ${intersection.point.y}`)
  //
  //         // draw lines
  //         // const desiredLength = intersection.point.y + 500; // Adjust this value as needed
  //         // const endPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(desiredLength));
  //         // const points = [raycaster.ray.origin, endPoint]
  //         // console.log(points)
  //         // const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  //         // lineGeometry.verticesNeedUpdate = true;
  //         // const line = new THREE.Line(lineGeometry, lineMaterial);
  //         // scene.add(line);
  //
  //       }
  //     }
  //   }
  //
  //   const buildingEndTime = new Date().getTime();
  //   console.log('heightmap built in ' + (buildingEndTime - buildingStartTime) + ' ms')
  //   console.log(heightmap)
  //
  //   // Use the heightmap data to create a Cannon.js heightfield shape
  //   const heightfieldShape = new CANNON.Heightfield(heightmap);
  //   const heightfieldBody = new CANNON.Body({ shape: heightfieldShape })
  //   world.addBody(heightfieldBody)
  //
  //   heightfieldBody.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
  //   // heightfieldBody.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)
  //   heightfieldBody.position.y -= sceneOffset
  //   // heightfieldBody.position.y -= 50
  //   // heightfieldBody.position.z += gridX
  // }
  // if (object.userData.type === 'Road') {
  //   const result = threeToCannon(object, {type: ShapeType.MESH});
  //   const body = new CANNON.Body();
  //   const {shape, offset, orientation} = result;
  //   body.addShape(shape, offset, orientation);
  //   body.position.y = sceneOffset
  //   body.position.y += 3
  //   world.addBody(body)
  // }
})

// const img = document.createElement('img')
// img.src = textureImage
// img.onload = async () => {
//   console.log('image loaded')
//   const scale = 2048
//
//   const heightMap = new CANNON.Heightfield([[1]], {
//     elementSize: 10 // Distance between the data points in X and Y directions
//   })
//   heightMap.setHeightsFromImage(img, new THREE.Vector3(scale, scale, 2048))
//
//   const tarmacMaterial = new CANNON.Material("tarmacMaterial");
//   tarmacMaterial.friction = 0.8; // Moderate friction to represent real tarmac
//   tarmacMaterial.restitution = 0.2; // Lower bounce than tire
//
//   const heightfieldBody = new CANNON.Body({ mass: 0 })
//   heightfieldBody.material = tarmacMaterial
//   heightfieldBody.addShape(heightMap)
//   world.addBody(heightfieldBody)
//
//   const heightMapOffset = new THREE.Vector3(
//       -scale / 2,
//       -350,
//       scale / 2,
//   )
//
//   heightfieldBody.position.copy(heightfieldBody.position.vadd(heightMapOffset))
//   heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // rotate dans le bon sens
// }

</script>


<template>
  <primitive :object="scene"/>
</template>