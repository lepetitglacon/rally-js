<script setup>
import {useTresContext, extend, useRenderLoop} from "@tresjs/core";
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import * as THREE from "three";
import {useCar} from "../composable/useCar.js";
const {car} = useCar()

extend({ OrbitControls })
const { onLoop } = useRenderLoop()
const { camera, renderer } = useTresContext()

// const controls = new OrbitControls( camera.value, renderer.value.domElement );
// controls.target = new THREE.Vector3(0, 120, 0)

const yVector = new THREE.Vector3(0, 1, 0)
const cameraDirection = new THREE.Vector3()

onLoop(() => {
	camera.value.getWorldDirection(cameraDirection)

	camera.value.position.copy(car.body.position)
	// camera.value.position.y += 4
	// camera.value.position.sub(cameraDirection.multiplyScalar(20))
	camera.value.quaternion.copy(car.body.quaternion.mult(camera.value.quaternion.setFromAxisAngle(yVector, Math.PI/2)))
})
</script>


<template>
</template>